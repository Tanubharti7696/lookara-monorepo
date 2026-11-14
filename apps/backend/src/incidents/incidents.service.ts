import { Injectable, ForbiddenException, NotFoundException, Optional } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { AuditService } from '../audit/audit.service';
import { DispatchService } from '../dispatch/dispatch.service';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly auditService: AuditService,
    @Optional() private readonly dispatchService?: DispatchService,
  ) {}

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

  async create(user: JwtPayload, data: {
    propertyId: string;
    title?: string;
    flagType?: string;
    description: string;
    severity?: string;
    category?: string;
    unit?: string;
    tradeCode?: string;
    createLinkedTask?: boolean;
    attachments?: Array<{ fileUrl?: string; base64Content?: string; evidenceType?: string; notes?: string }>;
  }) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const incidentTitle = data.title || data.flagType || 'Emergency Incident';
    const incidentSeverity = (data.severity || 'critical').toLowerCase();
    const incidentType = data.category || 'emergency';
    const incidentCode = 'INC-' + Math.floor(10000 + Math.random() * 90000);

    const res = await query(`
      INSERT INTO incidents (
        organization_id, property_id, title, incident_type, severity, status, summary, incident_code
      ) VALUES ($1, $2, $3, $4, $5, 'open', $6, $7)
      RETURNING *
    `, [orgId, data.propertyId, incidentTitle, incidentType, incidentSeverity, data.description, incidentCode]);

    const incident = res.rows[0];
    let linkedJob: any = null;

    // Automatically create linked remediation task unless explicitly disabled
    if (data.createLinkedTask !== false) {
      const jobCode = 'JOB-INC-' + Math.floor(1000 + Math.random() * 9000);
      const jobRes = await query(`
        INSERT INTO jobs (
          job_code, organization_id, property_id, created_by_user_id,
          trade_code, workflow_class, subtype, severity, source, title, description,
          service_type, status, scheduled_start
        ) VALUES ($1, $2, $3, $4, $5, 'maintenance', 'incident_remediation', $6, 'incident', $7, $8, 'emergency', 'unassigned', now())
        RETURNING *;
      `, [
        jobCode,
        orgId,
        data.propertyId,
        user.sub,
        data.tradeCode || 'general',
        incidentSeverity,
        `Remediation: ${incidentTitle}`,
        data.description,
      ]);
      linkedJob = jobRes.rows[0];

      // Link job back to incident
      await query(`UPDATE incidents SET related_job_id = $1 WHERE id = $2`, [linkedJob.id, incident.id]);
      incident.related_job_id = linkedJob.id;

      // Create SLA snapshot for linked job with authoritative deadlines
      const ackTarget = new Date(Date.now() + 15 * 60000);
      const arrTarget = new Date(Date.now() + (incidentSeverity === 'critical' ? 60 : 120) * 60000);
      const compTarget = new Date(Date.now() + (incidentSeverity === 'critical' ? 180 : 480) * 60000);
      await query(`
        INSERT INTO job_sla_snapshots (job_id, acknowledge_target, arrival_target, completion_target, resolved_tier)
        VALUES ($1, $2, $3, $4, 'lookara_base')
        ON CONFLICT (job_id) DO UPDATE SET
          acknowledge_target = EXCLUDED.acknowledge_target,
          arrival_target = EXCLUDED.arrival_target,
          completion_target = EXCLUDED.completion_target
      `, [linkedJob.id, ackTarget, arrTarget, compTarget]);

      // Record any initial attachments in job_evidence
      if (data.attachments && Array.isArray(data.attachments)) {
        for (const att of data.attachments) {
          const resolvedAttUrl = att.fileUrl || (att.base64Content
            ? (att.base64Content.startsWith('data:') ? att.base64Content : `data:image/jpeg;base64,${att.base64Content}`)
            : null);
          if (resolvedAttUrl) {
            await query(`
              INSERT INTO job_evidence (job_id, uploaded_by_user_id, evidence_type, file_url, notes)
              VALUES ($1, $2, $3, $4, $5)
            `, [linkedJob.id, user.sub, att.evidenceType || 'before_photo', resolvedAttUrl, att.notes || 'Incident attachment']);
          }
        }
      }
    }

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      organizationId: orgId,
      targetType: 'incident',
      targetId: incident.id,
      category: 'incident',
      eventType: 'incident.created',
      summary: `Incident reported: ${incidentTitle} (${incidentCode})`,
      metadata: { incidentCode, linkedJobId: linkedJob?.id },
    });

    return {
      ...incident,
      linkedJob,
    };
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
             jss.acknowledge_target, jss.arrival_target, jss.completion_target, jss.resolved_tier as sla_risk_tier
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

    const nowMs = Date.now();
    const items = listRes.rows.map((row: any) => {
      const isVendorAssigned = Boolean(row.vendor_id);
      const createdAt = new Date(row.created_at);
      const isCritical = row.severity === 'critical';
      const isHigh = row.severity === 'high';

      // Lookara SLA Baseline Rules (mins from creation):
      // Critical: 15m Ack, 60m Arrival, 180m Completion
      // High:     30m Ack, 120m Arrival, 360m Completion
      // Normal:   60m Ack, 240m Arrival, 1440m Completion
      const ackMins = isCritical ? 15 : isHigh ? 30 : 60;
      const arrMins = isCritical ? 60 : isHigh ? 120 : 240;
      const compMins = isCritical ? 180 : isHigh ? 360 : 1440;

      const acknowledgeDueAt = row.acknowledge_target
        ? new Date(row.acknowledge_target).toISOString()
        : new Date(createdAt.getTime() + ackMins * 60000).toISOString();
      const arrivalDueAt = row.arrival_target
        ? new Date(row.arrival_target).toISOString()
        : new Date(createdAt.getTime() + arrMins * 60000).toISOString();
      const completionDueAt = row.completion_target
        ? new Date(row.completion_target).toISOString()
        : new Date(createdAt.getTime() + compMins * 60000).toISOString();

      // Dynamic risk tier based on authoritative remaining time
      const targetDueMs = isVendorAssigned
        ? new Date(completionDueAt).getTime()
        : new Date(arrivalDueAt).getTime();
      const remainingMs = targetDueMs - nowMs;

      let riskTier: 'breached' | 'at_risk' | 'on_track';
      if (remainingMs <= 0) {
        riskTier = 'breached';
      } else if (remainingMs <= 30 * 60000) {
        riskTier = 'at_risk';
      } else {
        riskTier = 'on_track';
      }

      const allowedActions = isVendorAssigned
        ? ['view_dispatch', 'contact_vendor', 'escalate', 'add_evidence', 'reassign_vendor']
        : ['assign_vendor', 'create_task', 'escalate', 'add_evidence', 'view_dispatch'];

      const primaryAction = isVendorAssigned
        ? {
            type: 'view_dispatch',
            entityType: 'incident',
            entityId: row.id,
          }
        : {
            type: 'assign_vendor',
            entityType: 'incident',
            entityId: row.id,
          };

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
          acknowledgeDueAt,
          arrivalDueAt,
          completionDueAt,
          riskTier,
        },
        escalation: {
          level: row.severity === 'critical' ? 1 : 0,
          lastEscalatedAt: null,
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at,
        resolvedAt: row.resolved_at || null,
        allowedActions,
        primaryAction,
      };
    });

    const breachedCount = items.filter(i => i.sla.riskTier === 'breached').length;
    const approachingBreachCount = items.filter(i => i.sla.riskTier === 'at_risk').length;
    const criticalApproachingCount = items.filter(i => i.severity === 'critical' && i.sla.riskTier === 'at_risk').length;

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
        approachingBreachCount,
        breachedCount,
        criticalApproachingBreachCount: criticalApproachingCount || criticalApproachingBreachCount,
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

  async dispatchIncident(id: string, user: JwtPayload, body?: { vendorId?: string; tradeCode?: string }) {
    const inc = await this.findOne(id, user);
    let jobId = inc.relatedJobId;

    if (!jobId) {
      const createdJob = await this.createTaskForIncident(id, user, {
        tradeCode: body?.tradeCode || 'general',
        title: `Remediation for ${inc.title}`,
        description: inc.description,
      });
      jobId = createdJob.id;
    }

    if (!this.dispatchService) {
      throw new ForbiddenException('Dispatch service unavailable');
    }

    let dispatchResult: any;
    if (body?.vendorId) {
      dispatchResult = await this.dispatchService.assignVendor(jobId, body.vendorId, user);
    } else {
      dispatchResult = await this.dispatchService.autoDispatch(jobId, user);
    }

    await query(`UPDATE incidents SET status = 'in_progress', updated_at = now() WHERE id = $1`, [id]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      organizationId: user.activeOrganizationId,
      targetType: 'incident',
      targetId: id,
      category: 'incident',
      eventType: 'incident.dispatched',
      summary: `Incident ${inc.incidentCode || id} dispatched to vendor`,
      metadata: { jobId, vendorId: body?.vendorId, result: dispatchResult },
    });

    return {
      incidentId: id,
      jobId,
      status: 'in_progress',
      dispatch: dispatchResult,
    };
  }
}
