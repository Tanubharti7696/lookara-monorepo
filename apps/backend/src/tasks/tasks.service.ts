// apps/backend/src/tasks/tasks.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '@lookara/auth';

export interface CreateTaskDto {
  propertyId: string;
  tradeCode: string;
  skillCode?: string;
  title: string;
  description?: string;
  urgency: 'emergency' | 'standard' | 'flexible';
  serviceType: string;
  payoutAmount?: number;
  scheduledStart?: string;
  estimatedDurationMinutes?: number;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending_dispatch: ['assigned', 'cancelled', 'in_progress', 'completed'],
  assigned: ['accepted', 'pending_dispatch', 'cancelled', 'in_progress'],
  accepted: ['in_progress', 'cancelled', 'escalated'],
  in_progress: ['completed', 'verification_pending', 'escalated', 'cancelled', 'pending_dispatch'],
  verification_pending: ['completed', 'in_progress', 'escalated'],
  completed: ['closed', 'escalated', 'in_progress', 'pending_dispatch'],
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
      conditions.push(`j.urgency = $${idx++}`);
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
        trade_code, skill_code, title, description, urgency, service_type,
        payout_amount, scheduled_start, estimated_duration_minutes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending_dispatch')
      RETURNING *;
    `;
    const res = await query(sql, [
      jobCode,
      orgId,
      dto.propertyId,
      user.sub,
      dto.tradeCode || 'GEN',
      dto.skillCode || null,
      dto.title,
      dto.description || null,
      ['critical', 'high', 'emergency'].includes((dto.urgency || '').toLowerCase()) ? 'emergency' : ['low', 'flexible'].includes((dto.urgency || '').toLowerCase()) ? 'flexible' : 'standard',
      dto.serviceType || 'maintenance',
      dto.payoutAmount || null,
      dto.scheduledStart ? new Date(dto.scheduledStart) : null,
      dto.estimatedDurationMinutes || null,
    ]);
    const task = res.rows[0];

    // Audit log
    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'job',
      targetId: task.id,
      category: 'task',
      eventType: 'task.created',
      summary: `Task ${task.job_code} (${task.title}) created`,
      metadata: { urgency: task.urgency, propertyId: task.property_id },
    });

    return task;
  }

  async updateStatus(id: string, user: JwtPayload, newStatus: string) {
    const task = await this.findOne(id, user);

    const allowed = ALLOWED_TRANSITIONS[task.status] || [];
    if (!allowed.includes(newStatus) && !user.isAdmin) {
      throw new BadRequestException(
        `Invalid status transition from "${task.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    const res = await query(`UPDATE jobs SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`, [
      newStatus,
      id,
    ]);

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
}
