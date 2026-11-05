// apps/backend/src/tasks/tasks.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '@lookara/auth';

import { TaskPolicyService } from './task-policy.service';

export interface CreateTaskDto {
  propertyId: string;
  tradeCode: string;
  workflowClass: string;
  subtype?: string;
  severity: string;
  source: string;
  title: string;
  description?: string;
  serviceType: string;
  payoutAmount?: number;
  scheduledStart?: string;
  estimatedDurationMinutes?: number;
  slaOverride?: {
    acknowledgeMins?: number;
    arrivalMins?: number;
    completionMins?: number;
    escalationMins?: number;
  };
}

@Injectable()
export class TasksService {
  constructor(
    private readonly auditService: AuditService,
    private readonly taskPolicyService: TaskPolicyService,
  ) {}

  async findAll(user: JwtPayload, options: {
    propertyId?: string;
    status?: string;
    urgency?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, options.pageSize || 25);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Organization or role filter
    if (user.activeOrganizationId && !user.isVendor) {
      conditions.push(`j.organization_id = $${idx++}`);
      values.push(user.activeOrganizationId);
    } else if (user.isVendor || user.activePortal === 'vendor') {
      const vendorId = await this.taskPolicyService.getVendorIdForUser(user);
      if (!vendorId) throw new ForbiddenException('No active vendor profile found');
      conditions.push(`j.id IN (SELECT job_id FROM job_assignments WHERE vendor_id = $${idx++})`);
      values.push(vendorId);
    } else if (user.isOwner && !user.isAdmin) {
      // Owner only sees jobs on their properties
      conditions.push(`j.property_id IN (
        SELECT po.property_id FROM property_owners po
        JOIN owners o ON po.owner_id = o.id
        WHERE o.user_id = $${idx++} AND po.relationship_status = 'active'
      )`);
      values.push(user.sub);
    }

    if (options.propertyId) {
      conditions.push(`j.property_id = $${idx++}`);
      values.push(options.propertyId);
    }
    if (options.status) {
      conditions.push(`j.status = $${idx++}`);
      values.push(options.status);
    }
    if (options.urgency) {
      conditions.push(`j.severity = $${idx++}`);
      values.push(options.urgency);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT count(*) as total FROM jobs j ${where}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    values.push(pageSize, offset);
    const sql = `
      SELECT j.*, p.name AS property_name, p.address_line_1, p.city, p.state,
             v.display_name AS vendor_name,
             jss.completion_target AS sla_target,
             (CASE 
                WHEN jss.completion_target IS NOT NULL AND jss.completion_target < now() AND j.status NOT IN ('completed', 'closed') THEN 'breached'
                WHEN jss.completion_target IS NOT NULL AND jss.completion_target < (now() + interval '2 hours') AND j.status NOT IN ('completed', 'closed') THEN 'at_risk'
                WHEN jss.completion_target IS NOT NULL THEN 'on_track'
                ELSE 'none'
              END) AS sla_risk_tier,
             ARRAY_REMOVE(ARRAY[
               CASE WHEN j.rework_count > 0 AND j.status NOT IN ('completed', 'closed') THEN 'rework_required' ELSE NULL END,
               CASE WHEN j.quote_required = true THEN 'quote_required' ELSE NULL END
             ], NULL) AS warning_flags
      FROM jobs j
      LEFT JOIN properties p ON j.property_id = p.id
      LEFT JOIN (
        SELECT DISTINCT ON (job_id) job_id, vendor_id
        FROM job_assignments
        ORDER BY job_id, assigned_at DESC
      ) ja ON j.id = ja.job_id
      LEFT JOIN vendors v ON ja.vendor_id = v.id
      LEFT JOIN job_sla_snapshots jss ON j.id = jss.job_id
      ${where}
      ORDER BY j.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const res = await query(sql, values);

    return {
      data: res.rows,
      meta: {
        page,
        pageSize,
        total,
        hasMore: (page * pageSize) < total,
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const sql = `
      SELECT j.*, p.name AS property_name, p.address_line_1, p.city, p.state, p.timezone,
             u.full_name AS created_by_name,
             v.id AS vendor_id, v.display_name AS vendor_name, v.phone AS vendor_phone,
             ov.relationship_status AS vendor_status,
             jss.resolved_tier AS sla_resolved_tier,
             jss.acknowledge_target AS sla_acknowledge_target,
             jss.arrival_target AS sla_arrival_target,
             jss.completion_target AS sla_completion_target,
             jss.verification_target AS sla_verification_target
      FROM jobs j
      LEFT JOIN properties p ON j.property_id = p.id
      LEFT JOIN users u ON j.created_by_user_id = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (job_id) job_id, vendor_id
        FROM job_assignments
        ORDER BY job_id, assigned_at DESC
      ) ja ON j.id = ja.job_id
      LEFT JOIN vendors v ON ja.vendor_id = v.id
      LEFT JOIN organization_vendors ov ON v.id = ov.vendor_id AND ov.organization_id = j.organization_id
      LEFT JOIN job_sla_snapshots jss ON j.id = jss.job_id
      WHERE j.id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) throw new NotFoundException('Task not found');
    const row = res.rows[0];

    // Centralized policy authorization check
    const authContext = await this.taskPolicyService.authorize(user, row, 'view');

    // Build allowedActions based on actor role and current task status
    const allowedActions: any[] = [];
    if (authContext.role === 'pm' || authContext.role === 'admin') {
      if (row.status === 'verification_pending') {
        allowedActions.push({
          action: 'verify_approve',
          method: 'POST',
          url: `/tasks/${id}/verify`,
          body: { decision: 'approve' },
        });
        allowedActions.push({
          action: 'verify_rework',
          method: 'POST',
          url: `/tasks/${id}/verify`,
          body: { decision: 'rework', reworkReason: 'string' },
        });
      }
      if (row.status !== 'closed' && row.status !== 'cancelled') {
        allowedActions.push({
          action: 'upload_evidence',
          method: 'POST',
          url: `/tasks/${id}/evidence`,
          body: { evidenceType: 'before_photo | after_photo | receipt', fileUrl: 'string' },
        });
        allowedActions.push({
          action: 'cancel',
          method: 'PATCH',
          url: `/tasks/${id}/status`,
          body: { status: 'cancelled' },
        });
      }
    } else if (authContext.role === 'vendor') {
      if (row.status === 'assigned') {
        allowedActions.push({
          action: 'accept',
          method: 'POST',
          url: `/vendors/jobs/${id}/respond`,
          body: { action: 'accept' },
        });
        allowedActions.push({
          action: 'decline',
          method: 'POST',
          url: `/vendors/jobs/${id}/respond`,
          body: { action: 'decline', declineReason: 'string' },
        });
      } else if (row.status === 'accepted') {
        allowedActions.push({
          action: 'en_route',
          method: 'PATCH',
          url: `/tasks/${id}/status`,
          body: { status: 'en_route' },
        });
      } else if (row.status === 'en_route') {
        allowedActions.push({
          action: 'on_site',
          method: 'PATCH',
          url: `/tasks/${id}/status`,
          body: { status: 'on_site' },
        });
      } else if (row.status === 'on_site') {
        allowedActions.push({
          action: 'in_progress',
          method: 'PATCH',
          url: `/tasks/${id}/status`,
          body: { status: 'in_progress' },
        });
      } else if (row.status === 'in_progress') {
        allowedActions.push({
          action: 'complete',
          method: 'PATCH',
          url: `/tasks/${id}/status`,
          body: { status: 'completed' },
        });
        allowedActions.push({
          action: 'upload_evidence',
          method: 'POST',
          url: `/tasks/${id}/evidence`,
          body: { evidenceType: 'after_photo', fileUrl: 'string' },
        });
      }
    }

    return {
      ...row,
      vendor: row.vendor_id ? {
        id: row.vendor_id,
        name: row.vendor_name,
        phone: row.vendor_phone,
        status: row.vendor_status || 'standard',
      } : null,
      sla: row.sla_completion_target ? {
        resolvedTier: row.sla_resolved_tier || 'standard',
        acknowledgeTarget: row.sla_acknowledge_target,
        arrivalTarget: row.sla_arrival_target,
        completionTarget: row.sla_completion_target,
        verificationTarget: row.sla_verification_target,
        isBreached: new Date(row.sla_completion_target) < new Date() && !['completed', 'closed'].includes(row.status),
      } : null,
      allowedActions,
    };
  }

  async create(user: JwtPayload, dto: CreateTaskDto) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Active organization context required to create tasks');

    if (user.isVendor && !user.isAdmin) {
      throw new ForbiddenException('Vendors are not authorized to create tasks');
    }

    if (dto.propertyId) {
      // Verify property belongs to this organization
      const propRes = await query(`SELECT id FROM properties WHERE id = $1 AND organization_id = $2`, [
        dto.propertyId,
        orgId,
      ]);
      if (propRes.rows.length === 0) {
        throw new BadRequestException('Selected property does not belong to your organization');
      }
    }

    const jobCode = `JOB-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
    const sql = `
      INSERT INTO jobs (
        job_code, organization_id, property_id, created_by_user_id,
        trade_code, workflow_class, subtype, severity, source, title, description, service_type,
        payout_amount, scheduled_start, estimated_duration_minutes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'unassigned')
      RETURNING *;
    `;
    const res = await query(sql, [
      jobCode,
      orgId,
      dto.propertyId,
      user.sub,
      dto.tradeCode || 'GEN',
      dto.workflowClass || 'maintenance',
      dto.subtype || null,
      dto.severity || 'low',
      dto.source || 'pm_portal',
      dto.title,
      dto.description || null,
      dto.serviceType || 'maintenance',
      dto.payoutAmount || null,
      dto.scheduledStart ? new Date(dto.scheduledStart) : null,
      dto.estimatedDurationMinutes || null,
    ]);
    const task = res.rows[0];

    // Canonical SLA Snapshotting Hierarchy:
    // Resolution order: Base (Tier 5) -> Org (Tier 4) -> Market (Tier 3) -> Property (Tier 2) -> Task Override (Tier 1)
    // Operational clocks: Response (Acknowledge), Arrival, Completion, Escalation, Verification
    // Inherits clocks through ?? (nullish coalescing) so explicitly set zeros or lower tiers are never silently discarded.
    const sev = dto.severity || 'low';

    // Baseline fallback values
    let resolvedTier = 'lookara_base';
    let slaTemplateId: string | null = null;
    let acknowledgeMins = sev === 'critical' ? 15 : sev === 'high' ? 30 : 60;
    let arrivalMins = sev === 'critical' ? 60 : sev === 'high' ? 120 : 240;
    let completionMins = sev === 'critical' ? 240 : sev === 'high' ? 480 : 1440;
    let escalationMins = sev === 'critical' ? 30 : sev === 'high' ? 60 : 120;
    let verificationMins = 120;

    // 1. Task-level Override (Highest Priority Tier)
    if (dto.slaOverride) {
      resolvedTier = 'task_override';
      acknowledgeMins = dto.slaOverride.acknowledgeMins ?? acknowledgeMins;
      arrivalMins = dto.slaOverride.arrivalMins ?? arrivalMins;
      completionMins = dto.slaOverride.completionMins ?? completionMins;
      escalationMins = dto.slaOverride.escalationMins ?? escalationMins;
    } else {
      // 2. Property Override Tier
      let matched = false;
      if (dto.propertyId) {
        const propOverrideRes = await query(
          `SELECT st.* FROM sla_templates st
           JOIN property_sla_overrides pso ON st.id = pso.sla_template_id
           WHERE pso.property_id = $1 LIMIT 1`,
          [dto.propertyId]
        );
        if (propOverrideRes.rows.length > 0) {
          resolvedTier = 'property';
          const propRow = propOverrideRes.rows[0];
          slaTemplateId = propRow.id;
          acknowledgeMins = propRow.acknowledge_mins ?? acknowledgeMins;
          arrivalMins = propRow.arrival_mins ?? arrivalMins;
          completionMins = propRow.completion_mins ?? completionMins;
          escalationMins = propRow.escalation_mins ?? escalationMins;
          verificationMins = propRow.verification_mins ?? verificationMins;
          matched = true;
        }
      }

      // 3. Market Tier (based on property market / city)
      if (!matched && dto.propertyId) {
        const propMarketRes = await query(`SELECT market, city FROM properties WHERE id = $1`, [dto.propertyId]);
        const marketVal = propMarketRes.rows[0]?.market || propMarketRes.rows[0]?.city;
        if (marketVal) {
          const marketSlaRes = await query(
            `SELECT * FROM sla_templates 
             WHERE market = $1 AND severity = $2 
             ORDER BY created_at DESC LIMIT 1`,
            [marketVal, sev]
          );
          if (marketSlaRes.rows.length > 0) {
            resolvedTier = 'market';
            const marketRow = marketSlaRes.rows[0];
            slaTemplateId = marketRow.id;
            acknowledgeMins = marketRow.acknowledge_mins ?? acknowledgeMins;
            arrivalMins = marketRow.arrival_mins ?? arrivalMins;
            completionMins = marketRow.completion_mins ?? completionMins;
            escalationMins = marketRow.escalation_mins ?? escalationMins;
            verificationMins = marketRow.verification_mins ?? verificationMins;
            matched = true;
          }
        }
      }

      // 4. Organization Tier
      if (!matched && orgId) {
        const orgSlaRes = await query(
          `SELECT * FROM sla_templates 
           WHERE organization_id = $1 AND severity = $2 
           ORDER BY created_at DESC LIMIT 1`,
          [orgId, sev]
        );
        if (orgSlaRes.rows.length > 0) {
          resolvedTier = 'organization';
          const orgRow = orgSlaRes.rows[0];
          slaTemplateId = orgRow.id;
          acknowledgeMins = orgRow.acknowledge_mins ?? acknowledgeMins;
          arrivalMins = orgRow.arrival_mins ?? arrivalMins;
          completionMins = orgRow.completion_mins ?? completionMins;
          escalationMins = orgRow.escalation_mins ?? escalationMins;
          verificationMins = orgRow.verification_mins ?? verificationMins;
          matched = true;
        }
      }

      // 5. Lookara Base Default (uniquely scoped: organization_id IS NULL AND market IS NULL)
      if (!matched) {
        const baseSlaRes = await query(
          `SELECT * FROM sla_templates 
           WHERE organization_id IS NULL AND market IS NULL AND severity = $1 
           ORDER BY created_at ASC LIMIT 1`,
          [sev]
        );
        if (baseSlaRes.rows.length > 0) {
          resolvedTier = 'lookara_base';
          const baseRow = baseSlaRes.rows[0];
          slaTemplateId = baseRow.id;
          acknowledgeMins = baseRow.acknowledge_mins ?? acknowledgeMins;
          arrivalMins = baseRow.arrival_mins ?? arrivalMins;
          completionMins = baseRow.completion_mins ?? completionMins;
          escalationMins = baseRow.escalation_mins ?? escalationMins;
          verificationMins = baseRow.verification_mins ?? verificationMins;
        }
      }
    }

    const now = new Date();
    const ackTarget = new Date(now.getTime() + acknowledgeMins * 60000);
    const arrTarget = new Date(now.getTime() + arrivalMins * 60000);
    const compTarget = new Date(now.getTime() + completionMins * 60000);
    const escTarget = new Date(now.getTime() + escalationMins * 60000);
    const verTarget = new Date(now.getTime() + verificationMins * 60000);

    await query(
      `INSERT INTO job_sla_snapshots (
        job_id, sla_template_id, acknowledge_target, arrival_target, completion_target, verification_target, escalation_target, resolved_tier
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (job_id) DO UPDATE SET
        acknowledge_target = EXCLUDED.acknowledge_target,
        arrival_target = EXCLUDED.arrival_target,
        completion_target = EXCLUDED.completion_target,
        verification_target = EXCLUDED.verification_target,
        escalation_target = EXCLUDED.escalation_target,
        resolved_tier = EXCLUDED.resolved_tier`,
      [task.id, slaTemplateId, ackTarget, arrTarget, compTarget, verTarget, escTarget, resolvedTier]
    );

    // Audit log
    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'job',
      targetId: task.id,
      category: 'task',
      eventType: 'task.created',
      summary: `Task ${task.job_code} (${task.title}) created`,
      metadata: { severity: task.severity, propertyId: task.property_id },
    });

    return task;
  }

  async updateStatus(id: string, user: JwtPayload, newStatus: string, notes?: string) {
    const task = await this.findOne(id, user);

    // 1. Authorize operation against actor role and task
    const authContext = await this.taskPolicyService.authorize(user, task, 'update_status');

    // 2. Validate canonical transition and role permissions
    this.taskPolicyService.validateTransition(task.status, newStatus, authContext.role);

    // 3. Validate preconditions (e.g., evidence for completion)
    await this.taskPolicyService.validateVerificationPreconditions(id, newStatus, notes);

    let timestampUpdate = '';
    if (newStatus === 'en_route') {
      timestampUpdate = ', en_route_at = COALESCE(en_route_at, now())';
    } else if (newStatus === 'on_site') {
      timestampUpdate = ', on_site_at = COALESCE(on_site_at, now())';
    } else if (newStatus === 'completed' || newStatus === 'verification_pending') {
      timestampUpdate = ', completed_at = COALESCE(completed_at, now())';
    }

    // Atomic transition: ensures status has not concurrently changed from expected task.status (TASK-03)
    const res = await query(
      `UPDATE jobs SET status = $1, updated_at = now()${timestampUpdate} WHERE id = $2 AND (status = $3 OR status = $1) RETURNING *`,
      [newStatus, id, task.status]
    );
    if (!res || !res.rows || res.rows.length === 0) {
      throw new ConflictException(`Concurrent update conflict: Task status has changed from "${task.status}". Please refresh.`);
    }

    // Also update job_assignments if vendor is performing transition
    if (authContext.vendorId) {
      if (newStatus === 'en_route') {
        await query(`UPDATE job_assignments SET en_route_at = COALESCE(en_route_at, now()) WHERE job_id = $1 AND vendor_id = $2`, [id, authContext.vendorId]);
      } else if (newStatus === 'on_site') {
        await query(`UPDATE job_assignments SET on_site_at = COALESCE(on_site_at, now()) WHERE job_id = $1 AND vendor_id = $2`, [id, authContext.vendorId]);
      } else if (newStatus === 'completed' || newStatus === 'verification_pending') {
        await query(`UPDATE job_assignments SET completed_at = COALESCE(completed_at, now()) WHERE job_id = $1 AND vendor_id = $2`, [id, authContext.vendorId]);
      }
    }

    await this.auditService.recordEvent({
      actorType: authContext.role,
      actorUserId: user.sub,
      targetType: 'job',
      targetId: id,
      category: 'task',
      eventType: 'task.status_changed',
      summary: `Task ${task.job_code} transitioned from ${task.status} to ${newStatus}`,
      metadata: { oldStatus: task.status, newStatus, actorRole: authContext.role, notes },
    });

    return res.rows[0];
  }

  async remove(id: string, user: JwtPayload) {
    const task = await this.findOne(id, user);

    // Authorize cancellation
    const authContext = await this.taskPolicyService.authorize(user, task, 'cancel');

    // Only allow cancellation if status is not already completed, closed, or cancelled
    if (['completed', 'closed', 'cancelled'].includes(task.status)) {
      throw new BadRequestException(`Cannot cancel task ${task.job_code}: current status is already "${task.status}"`);
    }

    // Canonical architecture: Preserve Task history; avoid destructive deletion of operational records
    await query(`UPDATE jobs SET status = 'cancelled', updated_at = now() WHERE id = $1`, [id]);
    
    await this.auditService.recordEvent({
      actorType: authContext.role,
      actorUserId: user.sub,
      targetType: 'job',
      targetId: id,
      category: 'task',
      eventType: 'task.cancelled',
      summary: `Task ${task.job_code} (${task.title}) was cancelled and archived`,
    });

    return { success: true, message: 'Task cancelled and archived' };
  }

  async getEvidence(jobId: string, user: JwtPayload) {
    const task = await this.findOne(jobId, user);
    await this.taskPolicyService.authorize(user, task, 'view_evidence');

    const res = await query(
      `SELECT je.*, u.full_name AS uploaded_by_name, v.display_name AS vendor_name
       FROM job_evidence je
       LEFT JOIN users u ON je.uploaded_by_user_id = u.id
       LEFT JOIN vendors v ON je.vendor_id = v.id
       WHERE je.job_id = $1
       ORDER BY je.created_at DESC`,
      [jobId]
    );
    return res.rows;
  }

  async addEvidence(jobId: string, user: JwtPayload, data: {
    evidenceType: 'before_photo' | 'after_photo' | 'receipt' | 'notes' | 'signature';
    fileUrl: string;
    notes?: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    vendorId?: string;
  }) {
    const task = await this.findOne(jobId, user);
    const authContext = await this.taskPolicyService.authorize(user, task, 'add_evidence');
    
    // Resolve vendor if actor is vendor
    let vendorId = data.vendorId || authContext.vendorId || null;
    if (!vendorId && user.isVendor) {
      const vRes = await query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [user.sub]);
      if (vRes.rows.length > 0) vendorId = vRes.rows[0].id;
    }

    const res = await query(
      `INSERT INTO job_evidence (
        job_id, vendor_id, uploaded_by_user_id, evidence_type, file_url, notes, gps_latitude, gps_longitude
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        jobId,
        vendorId,
        user.sub,
        data.evidenceType,
        data.fileUrl,
        data.notes || null,
        data.gpsLatitude || null,
        data.gpsLongitude || null,
      ]
    );

    const evidence = res.rows[0];

    await this.auditService.recordEvent({
      actorType: authContext.role,
      actorUserId: user.sub,
      targetType: 'job',
      targetId: jobId,
      category: 'task',
      eventType: 'task.evidence_uploaded',
      summary: `Evidence (${data.evidenceType}) uploaded for Task ${task.job_code}`,
      metadata: { evidenceId: evidence.id, type: data.evidenceType },
    });

    return evidence;
  }

  async verify(jobId: string, user: JwtPayload, data: { decision: 'approve' | 'rework'; reworkReason?: string }) {
    const task = await this.findOne(jobId, user);

    // 1. Authorize PM verification
    await this.taskPolicyService.authorize(user, task, 'pm_verify');

    // 2. Precondition: task must be awaiting verification or completed
    if (task.status !== 'verification_pending' && task.status !== 'completed') {
      throw new BadRequestException(
        `Cannot verify task ${task.job_code}: current status is "${task.status}". Only tasks in "verification_pending" or "completed" can be verified.`
      );
    }

    if (data.decision === 'approve') {
      const res = await query(
        `UPDATE jobs 
         SET status = 'closed', verified_at = now(), verified_by_user_id = $1, updated_at = now()
         WHERE id = $2 RETURNING *`,
        [user.sub, jobId]
      );

      await this.auditService.recordEvent({
        actorType: 'pm',
        actorUserId: user.sub,
        targetType: 'job',
        targetId: jobId,
        category: 'task',
        eventType: 'task.verified_and_closed',
        summary: `Task ${task.job_code} verified and closed by PM`,
        metadata: { verifiedBy: user.sub },
      });

      return { status: 'closed', task: res.rows[0] };
    } else {
      if (!data.reworkReason || data.reworkReason.trim().length === 0) {
        throw new BadRequestException('A non-empty reason is required when rejecting work for rework');
      }

      // Canonical architecture: ordinary rework normally remains on the original Task
      const reworkRes = await query(
        `UPDATE jobs 
         SET status = 'in_progress', 
             rework_reason = $1, 
             rework_count = COALESCE(rework_count, 0) + 1, 
             updated_at = now() 
         WHERE id = $2 
         RETURNING *`,
        [data.reworkReason, jobId]
      );
      const updatedTask = reworkRes.rows[0];

      await this.auditService.recordEvent({
        actorType: 'pm',
        actorUserId: user.sub,
        targetType: 'job',
        targetId: jobId,
        category: 'task',
        eventType: 'task.rework_triggered',
        summary: `Task ${task.job_code} flagged for rework by PM (Cycle #${updatedTask.rework_count || 1}) - remained on original Task`,
        metadata: { jobId, reworkCount: updatedTask.rework_count, reason: data.reworkReason },
      });

      return {
        status: 'rework_required',
        task: updatedTask,
      };
    }
  }
}
