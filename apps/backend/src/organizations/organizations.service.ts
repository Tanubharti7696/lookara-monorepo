import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { OrganizationPolicyService } from './organization-policy.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly policyService: OrganizationPolicyService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(user: JwtPayload, options: { search?: string; status?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, options.pageSize || 25);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Non-admin callers only see organizations they have active membership in.
    // If user is admin, verify platform_admin_access.
    if (user.isAdmin) {
      const adminRes = await query(
        `SELECT admin_role, status FROM platform_admin_access WHERE user_id = $1 AND status = 'active'`,
        [user.sub]
      );
      if (adminRes.rows.length === 0) {
        // Inactive or invalid admin privileges; fallback to active memberships only
        conditions.push(`id IN (SELECT organization_id FROM organization_users WHERE user_id = $${idx++} AND status = 'active')`);
        values.push(user.sub);
      }
    } else {
      conditions.push(`id IN (SELECT organization_id FROM organization_users WHERE user_id = $${idx++} AND status = 'active')`);
      values.push(user.sub);
    }

    if (options.status) {
      conditions.push(`status = $${idx++}`);
      values.push(options.status);
    }
    if (options.search) {
      conditions.push(`(name ILIKE $${idx} OR city ILIKE $${idx} OR state ILIKE $${idx})`);
      values.push(`%${options.search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await query(`SELECT count(*) as total FROM organizations ${where}`, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    values.push(pageSize, offset);
    const sql = `
      SELECT * FROM organizations
      ${where}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const res = await query(sql, values);

    return {
      data: res.rows,
      meta: { page, pageSize, total },
    };
  }

  async findOne(user: JwtPayload, id: string) {
    await this.policyService.authorize(user, id, 'view');
    const res = await query(`SELECT * FROM organizations WHERE id = $1`, [id]);
    if (res.rows.length === 0) throw new NotFoundException('Organization not found');
    return res.rows[0];
  }

  async update(user: JwtPayload, id: string, data: any) {
    await this.policyService.authorize(user, id, 'edit');

    const updates = [];
    const values = [id];
    let idx = 2;

    const allowedFields = ['name', 'slug', 'address', 'city', 'state', 'zip'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return { success: true };

    updates.push(`updated_at = NOW()`);

    const res = await query(
      `UPDATE organizations SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (res.rows.length === 0) throw new NotFoundException('Organization not found');

    await this.auditService.recordEvent({
      actorType: user.isAdmin ? 'admin' : 'pm',
      category: 'system',
      eventType: 'organization.update',
      summary: `Organization ${id} profile updated`,
      actorUserId: user.sub,
      targetType: 'organization',
      targetId: id,
      metadata: { updatedFields: Object.keys(data).filter(k => allowedFields.includes(k)) },
    });

    return res.rows[0];
  }

  async findUsers(user: JwtPayload, organizationId: string) {
    await this.policyService.authorize(user, organizationId, 'view');

    const sql = `
      SELECT ou.id as membership_id, ou.role, ou.status as membership_status,
             u.id as user_id, u.full_name, u.email, u.phone, u.avatar_url, u.account_status,
             ou.created_at as joined_at
      FROM organization_users ou
      JOIN users u ON ou.user_id = u.id
      WHERE ou.organization_id = $1
      ORDER BY ou.created_at ASC
    `;
    const res = await query(sql, [organizationId]);
    return res.rows;
  }

  async addUser(user: JwtPayload, orgId: string, data: { email: string; role: string; fullName: string }) {
    await this.policyService.authorize(user, orgId, 'manage_members');

    if (!data.email) {
      throw new BadRequestException('Email is required');
    }

    const validRoles = ['owner', 'admin', 'ops_manager', 'coordinator', 'viewer'];
    const assignedRole = data.role || 'viewer';
    if (!validRoles.includes(assignedRole)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // 1. Check if user exists
    let userRes = await query(`SELECT id FROM users WHERE email = $1`, [data.email.trim().toLowerCase()]);
    let userId;

    if (userRes.rows.length === 0) {
      const insertUser = await query(
        `INSERT INTO users (email, full_name, account_status) VALUES ($1, $2, 'active') RETURNING id`,
        [data.email.trim().toLowerCase(), data.fullName || data.email.split('@')[0]]
      );
      userId = insertUser.rows[0].id;
    } else {
      userId = userRes.rows[0].id;
    }

    // 2. Add to org
    const existing = await query(
      `SELECT id, status FROM organization_users WHERE organization_id = $1 AND user_id = $2`,
      [orgId, userId]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].status === 'active') {
        throw new BadRequestException('User is already an active member of this organization');
      }
      // Re-activate membership
      const reactivate = await query(
        `UPDATE organization_users SET role = $3, status = 'active', updated_at = NOW()
         WHERE organization_id = $1 AND user_id = $2 RETURNING *`,
        [orgId, userId, assignedRole]
      );
      return reactivate.rows[0];
    }

    const res = await query(
      `INSERT INTO organization_users (organization_id, user_id, role, status) VALUES ($1, $2, $3, 'active') RETURNING *`,
      [orgId, userId, assignedRole]
    );

    await this.auditService.recordEvent({
      actorType: user.isAdmin ? 'admin' : 'pm',
      category: 'system',
      eventType: 'organization.member_added',
      summary: `User ${data.email} added to organization with role ${assignedRole}`,
      actorUserId: user.sub,
      targetType: 'organization',
      targetId: orgId,
      metadata: { targetUserId: userId, assignedRole },
    });

    return res.rows[0];
  }

  async updateUser(user: JwtPayload, orgId: string, userId: string, data: { role?: string; status?: string }) {
    await this.policyService.authorize(user, orgId, 'manage_members');

    if (data.role) {
      const validRoles = ['owner', 'admin', 'ops_manager', 'coordinator', 'viewer'];
      if (!validRoles.includes(data.role)) {
        throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
    }

    const updates = [];
    const values = [orgId, userId];
    let idx = 3;

    if (data.role) {
      updates.push(`role = $${idx++}`);
      values.push(data.role);
    }
    if (data.status) {
      updates.push(`status = $${idx++}`);
      values.push(data.status);
    }

    if (updates.length === 0) return { success: true };

    const res = await query(
      `UPDATE organization_users SET ${updates.join(', ')} WHERE organization_id = $1 AND user_id = $2 RETURNING *`,
      values
    );

    if (res.rows.length === 0) throw new NotFoundException('Membership not found');

    await this.auditService.recordEvent({
      actorType: user.isAdmin ? 'admin' : 'pm',
      category: 'system',
      eventType: 'organization.member_updated',
      summary: `Membership updated for user ${userId} in organization ${orgId}`,
      actorUserId: user.sub,
      targetType: 'organization',
      targetId: orgId,
      metadata: { targetUserId: userId, changes: data },
    });

    return res.rows[0];
  }

  async removeUser(user: JwtPayload, orgId: string, userId: string) {
    await this.policyService.authorize(user, orgId, 'manage_members');

    const res = await query(
      `DELETE FROM organization_users WHERE organization_id = $1 AND user_id = $2 RETURNING id`,
      [orgId, userId]
    );
    if (res.rows.length === 0) throw new NotFoundException('Membership not found');

    await this.auditService.recordEvent({
      actorType: user.isAdmin ? 'admin' : 'pm',
      category: 'system',
      eventType: 'organization.member_removed',
      summary: `User ${userId} removed from organization ${orgId}`,
      actorUserId: user.sub,
      targetType: 'organization',
      targetId: orgId,
      metadata: { targetUserId: userId },
    });

    return { success: true };
  }
}
