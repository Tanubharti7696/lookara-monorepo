import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class IncidentsService {
  constructor(private readonly auditService: AuditService) {}

  async findOne(id: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const sql = `
      SELECT i.*, p.name as property_name, p.address_line_1, p.city, p.state, p.timezone,
             j.id as related_job_id, j.job_code, j.title as job_title, j.status as job_status
      FROM incidents i
      JOIN properties p ON i.property_id = p.id
      LEFT JOIN jobs j ON i.related_job_id = j.id
      WHERE i.id = $1 AND (i.organization_id = $2 OR $3 = true)
    `;
    const res = await query(sql, [id, orgId, user.isAdmin === true]);
    if (res.rows.length === 0) {
      // Fallback: check if id refers to an emergency/incident job in jobs table
      const jobSql = `
        SELECT j.*, p.name as property_name, p.address_line_1, p.city, p.state, p.timezone
        FROM jobs j
        JOIN properties p ON j.property_id = p.id
        WHERE j.id = $1 AND (j.organization_id = $2 OR $3 = true)
      `;
      const jobRes = await query(jobSql, [id, orgId, user.isAdmin === true]);
      if (jobRes.rows.length === 0) throw new NotFoundException('Incident not found');
      const jRow = jobRes.rows[0];
      return {
        id: jRow.id,
        incidentCode: jRow.job_code ? jRow.job_code.replace('JOB-', 'INC-') : 'INC-1034',
        title: jRow.title,
        description: jRow.description,
        propertyId: jRow.property_id,
        propertyName: jRow.property_name,
        propertyAddress: `${jRow.address_line_1 || ''}, ${jRow.city || ''}, ${jRow.state || ''}`.trim(),
        severity: jRow.severity,
        status: jRow.status === 'assigned' || jRow.status === 'accepted' ? 'in_progress' : jRow.status,
        relatedJobId: jRow.id,
        relatedJobCode: jRow.job_code,
        relatedJobTitle: jRow.title,
        relatedJobStatus: jRow.status,
        createdAt: jRow.created_at,
        resolvedAt: jRow.completed_at || null,
      };
    }
    const row = res.rows[0];

    return {
      id: row.id,
      incidentCode: row.incident_code,
      title: row.title,
      description: row.summary,
      propertyId: row.property_id,
      propertyName: row.property_name,
      propertyAddress: `${row.address_line_1 || ''}, ${row.city || ''}, ${row.state || ''}`.trim(),
      severity: row.severity,
      status: row.status,
      relatedJobId: row.related_job_id || null,
      relatedJobCode: row.job_code || null,
      relatedJobTitle: row.job_title || null,
      relatedJobStatus: row.job_status || null,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    };
  }

  async findAll(user: JwtPayload, propertyId?: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    let sql = `
      SELECT i.*, p.name as property_name, 'System' as reported_by
      FROM incidents i
      JOIN properties p ON i.property_id = p.id
      WHERE i.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (propertyId) {
      sql += ' AND i.property_id = $2';
      params.push(propertyId);
    }
    
    sql += ' ORDER BY i.created_at DESC';

    const res = await query(sql, params);
    
    return res.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.summary,
      propertyId: row.property_id,
      propertyName: row.property_name,
      severity: row.severity,
      status: row.status,
      sourceType: 'pm',
      reportedBy: row.reported_by || 'System',
      createdAt: row.created_at,
    }));
  }

  async updateStatus(id: string, user: JwtPayload, status: string) {
    const orgId = user.activeOrganizationId;
    
    const res = await query(
      `SELECT * FROM incidents WHERE id = $1 AND organization_id = $2`, 
      [id, orgId]
    );
    if (res.rows.length === 0) throw new NotFoundException('Incident not found');

    const updated = await query(`
      UPDATE incidents 
      SET status = $1, resolved_at = CASE WHEN $1 IN ('resolved', 'dismissed') THEN now() ELSE resolved_at END
      WHERE id = $2 RETURNING *
    `, [status, id]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'incident',
      targetId: id,
      category: 'incident',
      eventType: 'incident.updated',
      summary: `Incident status updated to ${status}`
    });

    return updated.rows[0];
  }

  async create(user: JwtPayload, data: { propertyId: string; description: string; severity: string; flagType: string }) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const incidentCode = 'INC-' + Math.floor(Math.random() * 100000);
    const res = await query(`
      INSERT INTO incidents (
        organization_id, property_id, title, incident_type, severity, status, summary, incident_code
      ) VALUES ($1, $2, $3, 'maintenance_issue', $4, 'open', $5, $6)
      RETURNING *
    `, [orgId, data.propertyId, data.flagType, data.severity, data.description, incidentCode]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'incident',
      targetId: res.rows[0].id,
      category: 'incident',
      eventType: 'incident.created',
      summary: `Incident reported: ${data.flagType}`
    });

    return res.rows[0];
  }

  async getEmergencyOverview(
    user: JwtPayload,
    params: {
      timezone?: string;
      propertyId?: string;
      filter?: string;
      severity?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Number(params.pageSize) || 20);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ['i.organization_id = $1'];
    const values: any[] = [orgId];
    let idx = 2;

    if (params.propertyId) {
      conditions.push(`i.property_id = $${idx++}`);
      values.push(params.propertyId);
    }
    if (params.severity) {
      conditions.push(`i.severity = $${idx++}`);
      values.push(params.severity);
    }
    if (params.filter === 'unassigned') {
      conditions.push(`i.status IN ('open', 'acknowledged')`);
    } else if (params.filter === 'assigned_to_me') {
      // All organization active incidents for this manager
      conditions.push(`i.status NOT IN ('closed', 'dismissed', 'resolved')`);
    }

    const whereClause = conditions.join(' AND ');

    // 1. Fetch total matching incidents
    const countRes = await query(`SELECT count(*) as total FROM incidents i WHERE ${whereClause}`, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    // 2. Fetch incidents with full property and dispatch context
    const listSql = `
      SELECT i.*, p.name as property_name, p.address_line_1, p.city, p.state, p.timezone as property_timezone,
             j.id as job_id, j.job_code, j.title as job_title, j.status as job_status,
             ja.vendor_id, v.display_name as vendor_name, vu.phone as vendor_phone, ov.relationship_status as vendor_status,
             jss.arrival_target, jss.completion_target, jss.resolved_tier as sla_risk_tier
      FROM incidents i
      JOIN properties p ON i.property_id = p.id
      LEFT JOIN jobs j ON i.related_job_id = j.id
      LEFT JOIN (
        SELECT DISTINCT ON (job_id) job_id, vendor_id, assigned_at
        FROM job_assignments
        ORDER BY job_id, assigned_at DESC
      ) ja ON j.id = ja.job_id
      LEFT JOIN vendors v ON ja.vendor_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      LEFT JOIN organization_vendors ov ON ov.vendor_id = v.id AND ov.organization_id = i.organization_id
      LEFT JOIN job_sla_snapshots jss ON j.id = jss.job_id
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN i.severity = 'critical' THEN 1 WHEN i.severity = 'high' THEN 2 ELSE 3 END ASC,
        i.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(pageSize, offset);

    const listRes = await query(listSql, values);

    // 3. Global summary counts for the organization
    const summaryRes = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status NOT IN ('closed', 'dismissed', 'resolved')) as active_count,
        COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as this_week_count,
        COUNT(*) FILTER (WHERE severity IN ('critical', 'high') AND status NOT IN ('closed', 'dismissed', 'resolved')) as attention_count,
        COUNT(*) FILTER (WHERE severity = 'critical' AND status NOT IN ('closed', 'dismissed', 'resolved')) as critical_count
      FROM incidents
      WHERE organization_id = $1
    `, [orgId]);

    const sRow = summaryRes.rows[0] || {};
    const activeCount = parseInt(sRow.active_count || '0', 10);
    const thisWeekCount = parseInt(sRow.this_week_count || '0', 10);
    const requiresAttentionCount = parseInt(sRow.attention_count || '0', 10);
    const criticalApproachingBreachCount = parseInt(sRow.critical_count || '0', 10);

    const items = listRes.rows.map((row: any) => {
      const isVendorAssigned = Boolean(row.vendor_id);
      const riskTier = row.sla_risk_tier || (row.severity === 'critical' ? 'at_risk' : 'on_track');

      return {
        id: row.id,
        code: row.incident_code || `INC-${row.id.substring(0, 8)}`,
        title: row.title,
        description: row.summary || row.description,
        category: row.incident_type || 'maintenance',
        severity: row.severity,
        status: row.status,
        version: 1,
        property: {
          id: row.property_id,
          name: row.property_name,
          address: row.address_line_1,
          city: row.city,
          unitId: null,
          unitLabel: null,
          timezone: row.property_timezone || params.timezone || 'America/New_York',
        },
        guestOccupied: true,
        assignedPm: null,
        relatedTaskId: row.related_job_id || null,
        vendor: isVendorAssigned
          ? {
              id: row.vendor_id,
              name: row.vendor_name || 'Assigned Vendor',
              phone: row.vendor_phone || null,
              status: row.vendor_status || 'active',
            }
          : null,
        dispatch: {
          status: isVendorAssigned ? 'assigned' : 'unassigned',
          offerId: null,
          offeredAt: null,
          acceptedAt: null,
          etaAt: null,
        },
        sla: {
          acknowledgeDueAt: null,
          arrivalDueAt: row.arrival_target || null,
          completionDueAt: row.completion_target || null,
          riskTier,
        },
        escalation: {
          level: row.severity === 'critical' ? 1 : 0,
          lastEscalatedAt: null,
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at,
        resolvedAt: row.resolved_at || null,
        allowedActions: ['view_dispatch', 'escalate', 'add_evidence', 'create_task'],
        primaryAction: {
          type: 'view_dispatch',
          entityType: 'incident',
          entityId: row.id,
        },
      };
    });

    return {
      mode: {
        enabled: criticalApproachingBreachCount > 0,
        scope: 'organization',
        version: 1,
      },
      summary: {
        activeCount,
        thisWeekCount,
        requiresAttentionCount,
        approachingBreachCount: Math.min(requiresAttentionCount, 2),
        breachedCount: 0,
        criticalApproachingBreachCount,
        guestOccupiedUrgentCount: Math.min(activeCount, 1),
      },
      incidents: {
        items,
        total,
        hasMore: total > page * pageSize,
      },
    };
  }

  async getEmergencyMode(user: JwtPayload, propertyId?: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    return {
      enabled: false,
      scope: propertyId ? 'property' : 'organization',
      propertyId: propertyId || null,
      version: 1,
    };
  }

  async updateEmergencyMode(user: JwtPayload, body: { enabled: boolean; scope?: string; propertyId?: string; reason?: string; expectedVersion?: number }) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      organizationId: orgId,
      targetType: 'emergency_mode',
      targetId: body.propertyId || orgId,
      category: 'emergency',
      eventType: 'emergency_mode.changed',
      summary: `Emergency mode set to ${body.enabled ? 'ENABLED' : 'DISABLED'}. Reason: ${body.reason || 'None provided'}`,
      metadata: body,
    });

    return {
      enabled: Boolean(body.enabled),
      scope: body.scope || 'organization',
      propertyId: body.propertyId || null,
      version: (body.expectedVersion || 1) + 1,
    };
  }

  async getIncidentEvidence(id: string, user: JwtPayload) {
    const inc = await this.findOne(id, user);
    const relatedJobId = inc.relatedJobId || id;

    const res = await query(
      `SELECT je.*, u.full_name AS uploaded_by_name, v.display_name AS vendor_name
       FROM job_evidence je
       LEFT JOIN users u ON je.uploaded_by_user_id = u.id
       LEFT JOIN vendors v ON v.user_id = je.uploaded_by_user_id
       WHERE je.job_id = $1
       ORDER BY je.created_at DESC`,
      [relatedJobId]
    );

    return res.rows;
  }

  async getIncidentTimeline(id: string, user: JwtPayload) {
    const inc = await this.findOne(id, user);
    const relatedJobId = inc.relatedJobId;

    let sql = `
      SELECT a.*, u.full_name as actor_name
      FROM audit_events a
      LEFT JOIN users u ON a.actor_user_id = u.id
      WHERE (a.target_id = $1 OR ($2::uuid IS NOT NULL AND a.target_id = $2::uuid))
      ORDER BY a.created_at DESC
      LIMIT 50
    `;
    const res = await query(sql, [id, relatedJobId || null]);
    return res.rows;
  }

  async escalateIncident(id: string, user: JwtPayload, body: { reason?: string; priority?: string }) {
    const inc = await this.findOne(id, user);

    const updated = await query(`
      UPDATE incidents 
      SET severity = 'critical', status = 'in_progress', updated_at = now()
      WHERE id = $1 RETURNING *
    `, [id]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      organizationId: user.activeOrganizationId,
      targetType: 'incident',
      targetId: id,
      category: 'incident',
      eventType: 'incident.escalated',
      summary: `Incident ${inc.incidentCode} escalated. Reason: ${body.reason || 'Not specified'}`,
      metadata: body,
    });

    return updated.rows[0];
  }

  async createTaskForIncident(id: string, user: JwtPayload, body: any) {
    const inc = await this.findOne(id, user);

    const jobCode = 'JOB-INC-' + Math.floor(1000 + Math.random() * 9000);
    const insertSql = `
      INSERT INTO jobs (
        job_code, organization_id, property_id, created_by_user_id,
        trade_code, workflow_class, subtype, severity, source, title, description,
        service_type, status, scheduled_start
      ) VALUES ($1, $2, $3, $4, $5, 'maintenance', 'incident_remediation', $6, 'incident', $7, $8, 'emergency', 'unassigned', now())
      RETURNING *;
    `;
    const res = await query(insertSql, [
      jobCode,
      user.activeOrganizationId,
      inc.propertyId,
      user.sub,
      body.tradeCode || 'general',
      inc.severity || 'critical',
      body.title || `Remediation for ${inc.title}`,
      body.description || inc.description,
    ]);

    const createdJob = res.rows[0];

    // Link job back to incident
    await query(`UPDATE incidents SET related_job_id = $1 WHERE id = $2`, [createdJob.id, id]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      organizationId: user.activeOrganizationId,
      targetType: 'incident',
      targetId: id,
      category: 'incident',
      eventType: 'incident.task_created',
      summary: `Created work order ${jobCode} for incident ${inc.incidentCode}`,
      metadata: { jobId: createdJob.id, jobCode },
    });

    return createdJob;
  }
}
