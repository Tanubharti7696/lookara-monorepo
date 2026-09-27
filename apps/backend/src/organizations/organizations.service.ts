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
}
