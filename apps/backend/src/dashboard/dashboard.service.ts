// apps/backend/src/dashboard/dashboard.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

export interface HomeQueryParams {
  date: string;
  timezone: string;
  portfolioId?: string;
  propertyId?: string;
  criticalFilter?: 'emergency' | 'sla_risk' | 'vendor_coverage' | 'all';
}

export interface CriticalActionsQueryParams {
  date: string;
  timezone: string;
  filter?: 'emergency' | 'sla_risk' | 'vendor_coverage' | 'all';
  propertyId?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityQueryParams {
  date: string;
  timezone: string;
  category?: 'sla' | 'dispatch' | 'compliance' | 'vendor' | 'task';
  propertyId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class DashboardService {
  async getMetrics(user: JwtPayload) {
    const orgId = user.activeOrganizationId;

    if (user.isOwner && !user.isAdmin && !orgId) {
      const ownerRes = await query(
        `SELECT
           (SELECT count(*) FROM property_owners po JOIN owners o ON po.owner_id = o.id WHERE o.user_id = $1) as properties_count,
           (SELECT count(*) FROM approvals a JOIN owners o ON a.owner_id = o.id WHERE o.user_id = $1 AND a.status = 'awaiting_owner_decision') as pending_approvals,
           (SELECT count(*) FROM incidents inc WHERE inc.property_id IN (SELECT po.property_id FROM property_owners po JOIN owners o ON po.owner_id = o.id WHERE o.user_id = $1) AND inc.status IN ('open', 'in_progress')) as active_incidents`,
        [user.sub],
      );
      return ownerRes.rows[0];
    }

    const orgFilter = orgId ? `WHERE organization_id = '${orgId}'` : '';

    const sql = `
      SELECT
        (SELECT count(*) FROM properties ${orgFilter}) as total_properties,
        (SELECT count(*) FROM properties WHERE status = 'active' ${orgId ? `AND organization_id = '${orgId}'` : ''}) as active_properties,
        (SELECT count(*) FROM jobs WHERE status IN ('unassigned', 'dispatching', 'assigned', 'accepted', 'in_progress') ${orgId ? `AND organization_id = '${orgId}'` : ''}) as active_jobs,
        (SELECT count(*) FROM jobs WHERE severity = 'critical' AND status NOT IN ('completed', 'closed', 'cancelled') ${orgId ? `AND organization_id = '${orgId}'` : ''}) as emergency_jobs,
        (SELECT count(*) FROM incidents WHERE status IN ('open', 'in_progress') ${orgId ? `AND organization_id = '${orgId}'` : ''}) as active_incidents,
        (SELECT count(*) FROM approvals WHERE status = 'awaiting_owner_decision' ${orgId ? `AND organization_id = '${orgId}'` : ''}) as pending_approvals
    `;

    const metricsRes = await query(sql);

    const urgentTasksRes = await query(`
      SELECT j.id, j.job_code, j.title, j.severity as urgency, j.status, p.name as property_name
      FROM jobs j
      JOIN properties p ON j.property_id = p.id
      WHERE j.severity = 'critical' AND j.status IN ('unassigned', 'dispatching', 'assigned', 'in_progress')
        ${orgId ? `AND j.organization_id = '${orgId}'` : ''}
      LIMIT 5
    `);

    return {
      stats: metricsRes.rows[0],
      urgentItems: urgentTasksRes.rows,
    };
  }

  /**
   * GET /dashboard/home
   * Canonical Home endpoint matching the Flutter Home contract exactly
   */
  async getHome(user: JwtPayload, params: HomeQueryParams) {
    if (!params.date) {
      throw new BadRequestException('Query parameter "date" (YYYY-MM-DD) is required');
    }
    if (!params.timezone) {
      throw new BadRequestException('Query parameter "timezone" (IANA timezone string) is required');
    }

    const orgId = user.activeOrganizationId;
    const filterType = params.criticalFilter || 'emergency';
    const serverTime = new Date().toISOString();

    // 1. Badges: openTasks (non-terminal) & unreadNotifications
    const badgeRes = await query(`
      SELECT
        (SELECT count(*) FROM jobs WHERE status NOT IN ('closed', 'completed', 'cancelled') ${orgId ? `AND organization_id = '${orgId}'` : ''}) as open_tasks,
        (SELECT count(*) FROM notifications WHERE read = false ${orgId ? `AND organization_id = '${orgId}'` : ''}) as unread_notifications
    `);
    const badges = {
      openTasks: parseInt(badgeRes.rows[0]?.open_tasks || '0', 10),
      unreadNotifications: parseInt(badgeRes.rows[0]?.unread_notifications || '0', 10),
    };

    // 2. Active Incident: most severe unresolved incident with earliest SLA tiebreaker
    const activeIncidentRes = await query(`
      SELECT inc.id, inc.title, inc.severity, inc.status,
             p.id as property_id, p.name as property_name, p.city, p.state as region,
             v.id as vendor_id, v.display_name as vendor_name,
             j.id as related_job_id,
             jss.arrival_target as vendor_arrival_at,
             jss.completion_target as sla_due_at,
             (CASE 
                WHEN j.status IN ('assigned', 'accepted') THEN 'confirmed'
                WHEN j.status = 'dispatching' THEN 'pending'
                ELSE 'unassigned'
              END) as dispatch_status
      FROM incidents inc
      JOIN properties p ON inc.property_id = p.id
      LEFT JOIN jobs j ON inc.related_job_id = j.id
      LEFT JOIN job_assignments ja ON j.id = ja.job_id
      LEFT JOIN vendors v ON ja.vendor_id = v.id
      LEFT JOIN job_sla_snapshots jss ON j.id = jss.job_id
      WHERE inc.status IN ('open', 'in_progress', 'under_control')
        ${orgId ? `AND inc.organization_id = '${orgId}'` : ''}
        ${params.propertyId ? `AND inc.property_id = '${params.propertyId}'` : ''}
      ORDER BY 
        CASE inc.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'moderate' THEN 3 ELSE 4 END ASC,
        jss.completion_target ASC NULLS LAST,
        inc.created_at DESC
      LIMIT 1
    `);

    let activeIncident: any = null;
    if (activeIncidentRes.rows.length > 0) {
      const row = activeIncidentRes.rows[0];
      activeIncident = {
        id: row.id,
        title: row.title,
        property: {
          id: row.property_id,
          name: row.property_name,
          unit: null,
          city: row.city,
          region: row.region,
        },
        severity: row.severity,
        status: row.status === 'under_control' ? 'in_progress' : row.status,
        dispatchStatus: row.dispatch_status,
        vendor: row.vendor_id ? { id: row.vendor_id, name: row.vendor_name } : null,
        vendorEstimatedArrivalAt: row.vendor_arrival_at ? new Date(row.vendor_arrival_at).toISOString() : null,
        slaDueAt: row.sla_due_at ? new Date(row.sla_due_at).toISOString() : null,
        action: {
          type: 'open_incident',
          entityId: row.id,
          filters: {},
        },
      };
    }

    // 3. Filter Counts: emergency, slaRisk, vendorCoverage, criticalActionCount
    const emergencyCountRes = await query(`
      SELECT count(*) as count FROM jobs
      WHERE severity = 'critical' AND status NOT IN ('closed', 'completed', 'cancelled')
        ${orgId ? `AND organization_id = '${orgId}'` : ''}
        ${params.propertyId ? `AND property_id = '${params.propertyId}'` : ''}
    `);

    const slaRiskRes = await query(`
      SELECT count(*) as count FROM jobs j
      JOIN job_sla_snapshots jss ON j.id = jss.job_id
      WHERE j.status NOT IN ('closed', 'completed', 'cancelled')
        AND (jss.completion_target < (now() + interval '2 hours') OR jss.arrival_target < (now() + interval '30 minutes'))
        ${orgId ? `AND j.organization_id = '${orgId}'` : ''}
        ${params.propertyId ? `AND j.property_id = '${params.propertyId}'` : ''}
    `);

    // Check for property coverage gaps
    const coverageGapRes = await query(`
      SELECT count(*) as gap_count FROM properties p
      WHERE NOT EXISTS (
        SELECT 1 FROM vendor_property_coverage vpc
        JOIN vendors v ON vpc.vendor_id = v.id
        WHERE vpc.property_id = p.id AND vpc.status = 'active' AND v.lifecycle_status = 'active'
      )
      ${orgId ? `AND p.organization_id = '${orgId}'` : ''}
    `);

    const emergencyCount = parseInt(emergencyCountRes.rows[0]?.count || '0', 10);
    const slaRiskCount = parseInt(slaRiskRes.rows[0]?.count || '0', 10);
    const vendorCoverageGapCount = parseInt(coverageGapRes.rows[0]?.gap_count || '0', 10);
    const vendorCoverageStatus = vendorCoverageGapCount > 0 ? 'gap' : 'ok';
    const criticalActionCount = emergencyCount + slaRiskCount + vendorCoverageGapCount;

    const filters = {
      emergencyCount,
      slaRiskCount,
      vendorCoverageStatus,
      vendorCoverageGapCount,
      criticalActionCount,
    };

    // 4. Critical Actions Preview (Up to 2 items for Home initial load)
    const criticalItems = await this.fetchCriticalActionItems(user, {
      filter: filterType,
      propertyId: params.propertyId,
      page: 1,
      pageSize: 2,
    });

    const totalCriticalForFilter = filterType === 'emergency' ? emergencyCount :
      filterType === 'sla_risk' ? slaRiskCount :
      filterType === 'vendor_coverage' ? vendorCoverageGapCount : criticalActionCount;

    const remainingEmergencyCount = Math.max(0, emergencyCount - (filterType === 'emergency' ? criticalItems.length : 0));

    // 5. Approvals: workVerificationsPending, quotesAwaitingApproval, paymentDisputes
    const approvalsRes = await query(`
      SELECT
        (SELECT count(*) FROM jobs WHERE status = 'verification_pending' ${orgId ? `AND organization_id = '${orgId}'` : ''}) as verifications,
        (SELECT count(*) FROM approvals WHERE status = 'awaiting_owner_decision' ${orgId ? `AND organization_id = '${orgId}'` : ''}) as quotes,
        (SELECT count(*) FROM invoices WHERE status = 'disputed' ${orgId ? `AND organization_id = '${orgId}'` : ''}) as disputes
    `);
    const approvals = {
      workVerificationsPending: parseInt(approvalsRes.rows[0]?.verifications || '0', 10),
      quotesAwaitingApproval: parseInt(approvalsRes.rows[0]?.quotes || '0', 10),
      paymentDisputes: parseInt(approvalsRes.rows[0]?.disputes || '0', 10),
    };

    // 6. Today's Operations: scheduled tasks and turns within the requested date
    const operationsRes = await query(`
      SELECT j.id, j.title, j.severity, j.workflow_class, j.scheduled_start, j.estimated_duration_minutes,
             p.id as property_id, p.name as property_name, p.city, p.state as region
      FROM jobs j
      JOIN properties p ON j.property_id = p.id
      WHERE j.status NOT IN ('cancelled', 'closed')
        AND (
          (j.scheduled_start IS NOT NULL AND j.scheduled_start::date = $1::date)
          OR (j.created_at::date = $1::date)
        )
        ${orgId ? `AND j.organization_id = '${orgId}'` : ''}
        ${params.propertyId ? `AND j.property_id = '${params.propertyId}'` : ''}
      ORDER BY j.scheduled_start ASC NULLS LAST, j.created_at ASC
      LIMIT 10
    `, [params.date]);

    const todayOperations = operationsRes.rows.map((row: any) => {
      const startsAt = row.scheduled_start ? new Date(row.scheduled_start).toISOString() : new Date().toISOString();
      const endsAt = row.scheduled_start
        ? new Date(new Date(row.scheduled_start).getTime() + (row.estimated_duration_minutes || 60) * 60000).toISOString()
        : new Date(new Date().getTime() + 3600000).toISOString();

      return {
        id: row.id,
        type: row.workflow_class === 'inspection' ? 'inspection' : row.workflow_class === 'turnover' ? 'turnover' : 'repair',
        title: row.title,
        property: {
          id: row.property_id,
          name: row.property_name,
          unit: null,
          city: row.city,
          region: row.region,
        },
        startsAt,
        endsAt,
        severity: row.severity,
        taskCount: 1,
        action: {
          type: 'open_task',
          entityId: row.id,
          filters: {},
        },
      };
    });

    // 7. Next Best Actions (Rule-based recommendations)
    const nextBestActions = [];
    if (slaRiskCount > 0) {
      nextBestActions.push({
        id: 'recommendation-1',
        type: 'sla_reprioritization',
        title: 'Reprioritize SLA Queue',
        description: `Move ${Math.min(slaRiskCount, 3)} tasks approaching SLA targets to priority queue`,
        confidence: 'high',
        affectedCount: slaRiskCount,
        action: {
          type: 'open_dispatch',
          entityId: null,
          filters: { slaRisk: true },
        },
      });
    }

    if (vendorCoverageGapCount > 0) {
      nextBestActions.push({
        id: 'recommendation-2',
        type: 'coverage_gap',
        title: 'Fix Property Coverage Gaps',
        description: `Assign active trade coverage to ${vendorCoverageGapCount} properties`,
        confidence: 'high',
        affectedCount: vendorCoverageGapCount,
        action: {
          type: 'open_vendor_coverage',
          entityId: null,
          filters: {},
        },
      });
    }

    // Default compliance / turn recommendation
    nextBestActions.push({
      id: 'recommendation-3',
      type: 'compliance_due',
      title: 'Review Verification Queue',
      description: `${approvals.workVerificationsPending} completed task(s) awaiting sign-off`,
      confidence: 'medium',
      affectedCount: approvals.workVerificationsPending,
      action: {
        type: 'open_task_queue',
        entityId: null,
        filters: { status: 'verification_pending' },
      },
    });

    // 8. Recent Activity (Audit events up to 5)
    const activityRes = await query(`
      SELECT id, category, event_type, summary, created_at, target_id
      FROM audit_events
      WHERE true
        ${orgId ? `AND (metadata->>'organizationId' = '${orgId}' OR target_id IN (SELECT id::text FROM jobs WHERE organization_id = '${orgId}'))` : ''}
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentActivityItems = activityRes.rows.map((row: any) => ({
      id: row.id,
      category: row.category === 'dispatch' ? 'dispatch' : row.category === 'sla' ? 'sla' : 'task',
      title: row.summary,
      description: row.event_type,
      occurredAt: new Date(row.created_at).toISOString(),
      vendorEstimatedArrivalAt: null,
      slaDueAt: null,
      action: {
        type: 'open_task',
        entityId: row.target_id || null,
        filters: {},
      },
    }));

    return {
      data: {
        updatedAt: serverTime,
        badges,
        activeIncident,
        filters,
        criticalActions: {
          filter: filterType,
          items: criticalItems,
          total: totalCriticalForFilter,
          hasMore: totalCriticalForFilter > criticalItems.length,
          remainingEmergencyCount,
        },
        approvals,
        todayOperations,
        nextBestActions,
        recentActivity: {
          items: recentActivityItems,
          total: recentActivityItems.length,
          hasMore: false,
        },
      },
      meta: {
        serverTime,
        timezone: params.timezone,
        refreshAfterSeconds: 30,
      },
      errors: [],
    };
  }

  /**
   * Helper: fetch critical items for Home preview and the paginated /dashboard/critical-actions endpoint
   */
  async fetchCriticalActionItems(user: JwtPayload, params: {
    filter?: string;
    propertyId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const orgId = user.activeOrganizationId;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, params.pageSize || 20);
    const offset = (page - 1) * pageSize;
    const filter = params.filter || 'emergency';

    const items: any[] = [];

    if (filter === 'emergency' || filter === 'all') {
      const emergencyRes = await query(`
        SELECT j.id, j.job_code, j.title, j.severity, j.status,
               p.id as property_id, p.name as property_name, p.city, p.state as region,
               jss.arrival_target, jss.completion_target
        FROM jobs j
        JOIN properties p ON j.property_id = p.id
        LEFT JOIN job_sla_snapshots jss ON j.id = jss.job_id
        WHERE j.severity = 'critical' AND j.status NOT IN ('closed', 'completed', 'cancelled')
          ${orgId ? `AND j.organization_id = '${orgId}'` : ''}
          ${params.propertyId ? `AND j.property_id = '${params.propertyId}'` : ''}
        ORDER BY jss.completion_target ASC NULLS LAST, j.created_at DESC
        LIMIT $1 OFFSET $2
      `, [pageSize, offset]);

      for (const row of emergencyRes.rows) {
        items.push({
          id: row.id,
          type: 'incident',
          title: `${row.title} — ${row.property_name}`,
          description: `Status: ${row.status} · ${row.job_code}`,
          severity: 'critical',
          badge: 'live',
          relatedEntityId: row.id,
          propertyId: row.property_id,
          vendorEstimatedArrivalAt: row.arrival_target ? new Date(row.arrival_target).toISOString() : null,
          slaDueAt: row.completion_target ? new Date(row.completion_target).toISOString() : null,
          affectedCount: 1,
          action: {
            type: 'create_task_from_incident',
            entityId: row.id,
            filters: {},
          },
        });
      }
    }

    if ((filter === 'sla_risk' || filter === 'all') && items.length < pageSize) {
      const slaRes = await query(`
        SELECT j.id, j.job_code, j.title, j.severity, j.status,
               p.id as property_id, p.name as property_name,
               jss.completion_target
        FROM jobs j
        JOIN properties p ON j.property_id = p.id
        JOIN job_sla_snapshots jss ON j.id = jss.job_id
        WHERE j.status NOT IN ('closed', 'completed', 'cancelled')
          AND (jss.completion_target < (now() + interval '2 hours') OR jss.arrival_target < (now() + interval '30 minutes'))
          ${orgId ? `AND j.organization_id = '${orgId}'` : ''}
          ${params.propertyId ? `AND j.property_id = '${params.propertyId}'` : ''}
        ORDER BY jss.completion_target ASC
        LIMIT $1 OFFSET $2
      `, [pageSize - items.length, offset]);

      for (const row of slaRes.rows) {
        items.push({
          id: `sla-${row.id}`,
          type: 'sla_pressure',
          title: `SLA Risk: ${row.title}`,
          description: `${row.property_name} · ${row.job_code}`,
          severity: row.severity === 'critical' ? 'critical' : 'high',
          badge: 'system_alert',
          relatedEntityId: row.id,
          propertyId: row.property_id,
          vendorEstimatedArrivalAt: null,
          slaDueAt: row.completion_target ? new Date(row.completion_target).toISOString() : null,
          affectedCount: 1,
          action: {
            type: 'open_task_queue',
            entityId: row.id,
            filters: { slaRisk: true },
          },
        });
      }
    }

    if ((filter === 'vendor_coverage' || filter === 'all') && items.length < pageSize) {
      const gapRes = await query(`
        SELECT p.id, p.name, p.city
        FROM properties p
        WHERE NOT EXISTS (
          SELECT 1 FROM vendor_property_coverage vpc
          JOIN vendors v ON vpc.vendor_id = v.id
          WHERE vpc.property_id = p.id AND vpc.status = 'active' AND v.lifecycle_status = 'active'
        )
        ${orgId ? `AND p.organization_id = '${orgId}'` : ''}
        LIMIT $1 OFFSET $2
      `, [pageSize - items.length, offset]);

      for (const row of gapRes.rows) {
        items.push({
          id: `coverage-gap-${row.id}`,
          type: 'coverage_gap',
          title: `Coverage Gap — ${row.name}`,
          description: `No active vendors assigned · ${row.city || 'Market'}`,
          severity: 'high',
          badge: 'coverage',
          relatedEntityId: null,
          propertyId: row.id,
          vendorEstimatedArrivalAt: null,
          slaDueAt: null,
          affectedCount: 1,
          action: {
            type: 'open_vendor_coverage',
            entityId: null,
            filters: { propertyId: row.id },
          },
        });
      }
    }

    return items;
  }

  /**
   * GET /dashboard/critical-actions
   */
  async getCriticalActions(user: JwtPayload, params: CriticalActionsQueryParams) {
    if (!params.date) throw new BadRequestException('Query parameter "date" is required');
    if (!params.timezone) throw new BadRequestException('Query parameter "timezone" is required');

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, params.pageSize || 20);
    const serverTime = new Date().toISOString();

    const items = await this.fetchCriticalActionItems(user, {
      filter: params.filter,
      propertyId: params.propertyId,
      page,
      pageSize,
    });

    return {
      data: items,
      meta: {
        page,
        pageSize,
        total: items.length,
        hasMore: items.length === pageSize,
        serverTime,
      },
      errors: [],
    };
  }

  /**
   * GET /dashboard/activity
   */
  async getActivity(user: JwtPayload, params: ActivityQueryParams) {
    if (!params.date) throw new BadRequestException('Query parameter "date" is required');
    if (!params.timezone) throw new BadRequestException('Query parameter "timezone" is required');

    const orgId = user.activeOrganizationId;
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, params.pageSize || 20);
    const offset = (page - 1) * pageSize;
    const serverTime = new Date().toISOString();

    const conditions: string[] = ['true'];
    const values: any[] = [];
    let idx = 1;

    if (orgId) {
      conditions.push(`(metadata->>'organizationId' = $${idx} OR target_id IN (SELECT id::text FROM jobs WHERE organization_id = $${idx}))`);
      values.push(orgId);
      idx++;
    }

    if (params.category) {
      conditions.push(`category = $${idx}`);
      values.push(params.category);
      idx++;
    }

    // Filter to the specified local calendar day
    conditions.push(`created_at::date = $${idx}`);
    values.push(params.date);
    idx++;

    values.push(pageSize);
    values.push(offset);

    const res = await query(`
      SELECT id, category, event_type, summary, created_at, target_id
      FROM audit_events
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${idx - 2} OFFSET $${idx - 1}
    `, values);

    const data = res.rows.map((row: any) => ({
      id: row.id,
      category: row.category === 'dispatch' ? 'dispatch' : row.category === 'sla' ? 'sla' : 'task',
      title: row.summary,
      description: row.event_type,
      occurredAt: new Date(row.created_at).toISOString(),
      vendorEstimatedArrivalAt: null,
      slaDueAt: null,
      action: {
        type: 'open_task',
        entityId: row.target_id || null,
        filters: {},
      },
    }));

    return {
      data,
      meta: {
        page,
        pageSize,
        total: data.length,
        hasMore: data.length === pageSize,
        serverTime,
      },
      errors: [],
    };
  }
}
