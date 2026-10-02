// apps/backend/src/organizations/organizations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { query } from '@lookara/database';

@Injectable()
export class OrganizationsService {
  async findAll(options: { search?: string; status?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, options.pageSize || 25);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

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
    const total = parseInt(countRes.rows[0].total, 10);

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

  async findOne(id: string) {
    const res = await query(`SELECT * FROM organizations WHERE id = $1`, [id]);
    if (res.rows.length === 0) throw new NotFoundException('Organization not found');
    return res.rows[0];
  }

  async update(id: string, data: any) {
    const updates = [];
    const values = [id];
    let idx = 2;

    const fields = ['name', 'slug', 'address', 'city', 'state', 'zip'];
    for (const field of fields) {
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
    return res.rows[0];
  }

  async findUsers(organizationId: string) {
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

  async addUser(orgId: string, data: { email: string; role: string; fullName: string }) {
    // 1. Check if user exists
    let userRes = await query(`SELECT id FROM users WHERE email = $1`, [data.email]);
    let userId;

    if (userRes.rows.length === 0) {
      // Create stub user (would normally send invite email)
      const insertUser = await query(
        `INSERT INTO users (email, full_name, account_status) VALUES ($1, $2, 'active') RETURNING id`,
        [data.email, data.fullName || data.email.split('@')[0]]
      );
      userId = insertUser.rows[0].id;
    } else {
      userId = userRes.rows[0].id;
    }

    // 2. Add to org
    const existing = await query(
      `SELECT id FROM organization_users WHERE organization_id = $1 AND user_id = $2`,
      [orgId, userId]
    );

    if (existing.rows.length > 0) {
      throw new Error('User is already in this organization');
    }

    const res = await query(
      `INSERT INTO organization_users (organization_id, user_id, role, status) VALUES ($1, $2, $3, 'active') RETURNING *`,
      [orgId, userId, data.role || 'viewer']
    );

    return res.rows[0];
  }

  async updateUser(orgId: string, userId: string, data: { role?: string; status?: string }) {
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
    return res.rows[0];
  }

  async removeUser(orgId: string, userId: string) {
    const res = await query(
      `DELETE FROM organization_users WHERE organization_id = $1 AND user_id = $2 RETURNING id`,
      [orgId, userId]
    );
    if (res.rows.length === 0) throw new NotFoundException('Membership not found');
    return { success: true };
  }
}
