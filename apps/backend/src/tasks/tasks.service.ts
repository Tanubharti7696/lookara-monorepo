// apps/backend/src/tasks/tasks.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '@lookara/auth';

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
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  unassigned: ['dispatching', 'assigned', 'cancelled'],
  dispatching: ['assigned', 'unassigned', 'cancelled'],
  assigned: ['accepted', 'unassigned', 'cancelled'],
  accepted: ['en_route', 'in_progress', 'cancelled', 'escalated'],
  en_route: ['on_site', 'cancelled', 'escalated'],
  on_site: ['in_progress', 'cancelled', 'escalated'],
  in_progress: ['completed', 'verification_pending', 'escalated', 'cancelled'],
  verification_pending: ['completed', 'in_progress', 'escalated'],
  completed: ['closed', 'escalated', 'in_progress'],
  closed: [],
  cancelled: [],
  escalated: ['assigned', 'closed'],
};

@Injectable()
export class TasksService {
  constructor(private readonly auditService: AuditService) {}

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

    // Organization filter
    if (user.activeOrganizationId) {
      conditions.push(`j.organization_id = $${idx++}`);
      values.push(user.activeOrganizationId);
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
      SELECT j.*, p.name AS property_name, p.address_line_1, p.city, p.state
      FROM jobs j
      LEFT JOIN properties p ON j.property_id = p.id
      ${where}
      ORDER BY j.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const res = await query(sql, values);

    return {
      data: res.rows,
      meta: { page, pageSize, total },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const sql = `
      SELECT j.*, p.name AS property_name, p.address_line_1, p.city, p.state, p.timezone,
             u.full_name AS created_by_name
      FROM jobs j
      LEFT JOIN properties p ON j.property_id = p.id
      LEFT JOIN users u ON j.created_by_user_id = u.id
      WHERE j.id = $1
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) throw new NotFoundException('Task not found');
    const task = res.rows[0];

    // Enforce tenant boundary
    if (user.activeOrganizationId && task.organization_id !== user.activeOrganizationId && !user.isAdmin) {
      throw new ForbiddenException('Task does not belong to your organization');
    }

    return task;
  }

  async create(user: JwtPayload, dto: CreateTaskDto) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Active organization context required to create tasks');

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

    const jobCode = `JOB-${Date.now().toString().slice(-4)}`;
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

    // Canonical SLA Snapshotting Hierarchy (Property Override -> Market Tier -> Org Tier -> Lookara Default)
    const sev = dto.severity || 'low';
    
    // 1. Property Override SLA
    let slaRes = await query(
      `SELECT st.* FROM sla_templates st
       JOIN property_sla_overrides pso ON st.id = pso.sla_template_id
       WHERE pso.property_id = $1 LIMIT 1`,
      [dto.propertyId]
    );

    // 2. Market-level SLA (based on property market/city)
    if (slaRes.rows.length === 0) {
      const propMarketRes = await query(`SELECT market, city FROM properties WHERE id = $1`, [dto.propertyId]);
      const marketVal = propMarketRes.rows[0]?.market || propMarketRes.rows[0]?.city;
      if (marketVal) {
        slaRes = await query(
          `SELECT * FROM sla_templates 
           WHERE market = $1 AND severity = $2 
           ORDER BY created_at DESC LIMIT 1`,
          [marketVal, sev]
        );
      }
    }

    // 3. Organization-level SLA
    if (slaRes.rows.length === 0) {
      slaRes = await query(
        `SELECT * FROM sla_templates 
         WHERE organization_id = $1 AND severity = $2 
         ORDER BY created_at DESC LIMIT 1`,
        [orgId, sev]
      );
    }

    // 4. Lookara Global Default Tier
    if (slaRes.rows.length === 0) {
      slaRes = await query(
        `SELECT * FROM sla_templates 
         WHERE (organization_id IS NULL OR market IS NULL) AND severity = $1 
         ORDER BY created_at ASC LIMIT 1`,
        [sev]
      );
    }

    // Fallback baseline SLA parameters if no rows exist in database
    const sla = slaRes.rows[0] || {
      id: null,
      acknowledge_mins: sev === 'critical' ? 15 : sev === 'high' ? 30 : 60,
      arrival_mins: sev === 'critical' ? 60 : sev === 'high' ? 120 : 240,
      completion_mins: sev === 'critical' ? 240 : sev === 'high' ? 480 : 1440,
      verification_mins: 120,
    };

    const now = new Date();
    const ackTarget = new Date(now.getTime() + (sla.acknowledge_mins || 30) * 60000);
    const arrTarget = new Date(now.getTime() + (sla.arrival_mins || 60) * 60000);
    const compTarget = new Date(now.getTime() + (sla.completion_mins || 240) * 60000);
    const verTarget = new Date(now.getTime() + (sla.verification_mins || 120) * 60000);

    await query(
      `INSERT INTO job_sla_snapshots (
        job_id, sla_template_id, acknowledge_target, arrival_target, completion_target, verification_target
       ) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (job_id) DO UPDATE SET
        acknowledge_target = EXCLUDED.acknowledge_target,
        arrival_target = EXCLUDED.arrival_target,
        completion_target = EXCLUDED.completion_target,
        verification_target = EXCLUDED.verification_target`,
      [task.id, sla.id || null, ackTarget, arrTarget, compTarget, verTarget]
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

  async updateStatus(id: string, user: JwtPayload, newStatus: string) {
    const task = await this.findOne(id, user);

    const allowed = ALLOWED_TRANSITIONS[task.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${task.status}" to "${newStatus}". Canonical state rules permit: ${allowed.join(', ') || 'none'}`,
      );
    }

    let timestampUpdate = '';
    if (newStatus === 'en_route') {
      timestampUpdate = ', en_route_at = COALESCE(en_route_at, now())';
    } else if (newStatus === 'on_site') {
      timestampUpdate = ', on_site_at = COALESCE(on_site_at, now())';
    } else if (newStatus === 'completed' || newStatus === 'closed') {
      timestampUpdate = ', completed_at = COALESCE(completed_at, now())';
    }

    const res = await query(
      `UPDATE jobs SET status = $1, updated_at = now()${timestampUpdate} WHERE id = $2 RETURNING *`,
      [newStatus, id]
    );

    await this.auditService.recordEvent({
      actorType: user.isAdmin ? 'admin' : user.isVendor ? 'vendor' : 'pm',
      actorUserId: user.sub,
      targetType: 'job',
      targetId: id,
      category: 'task',
      eventType: 'task.status_changed',
      summary: `Task ${task.job_code} transitioned from ${task.status} to ${newStatus}`,
      metadata: { oldStatus: task.status, newStatus },
    });

    return res.rows[0];
  }

  async remove(id: string, user: JwtPayload) {
    const task = await this.findOne(id, user);
    
    // Only admins or PMs in the same org can delete
    if (user.activeOrganizationId && task.organization_id !== user.activeOrganizationId && !user.isAdmin) {
      throw new ForbiddenException('Not authorized to delete this task');
    }

    // Canonical architecture: Preserve Task history; avoid destructive deletion of operational records
    await query(`UPDATE jobs SET status = 'cancelled', updated_at = now() WHERE id = $1`, [id]);
    
    await this.auditService.recordEvent({
      actorType: user.isAdmin ? 'admin' : 'pm',
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
    await this.findOne(jobId, user);
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
    
    // Resolve vendor if actor is vendor
    let vendorId = data.vendorId || null;
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
      actorType: user.isAdmin ? 'admin' : user.isVendor ? 'vendor' : 'pm',
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
      if (!data.reworkReason) {
        throw new BadRequestException('A reason is required when rejecting work for rework');
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
