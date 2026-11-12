import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class BillingService {
  async getBillingDetails(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) return null;

    // Fetch subscription
    const subRes = await query(
      `SELECT * FROM subscriptions WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [orgId]
    );
    let subscription = subRes.rows[0];

    // Seed default subscription if missing
    if (!subscription) {
      const inserted = await query(
        `INSERT INTO subscriptions (organization_id, plan_tier, status, current_period_start, current_period_end) 
         VALUES ($1, 'pro', 'active', now(), now() + interval '1 month') RETURNING *`,
        [orgId]
      );
      subscription = inserted.rows[0];
    }

    // Fetch payment methods
    const pmRes = await query(
      `SELECT * FROM payment_methods WHERE organization_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [orgId]
    );

    // Fetch invoices
    const invRes = await query(
      `SELECT * FROM invoices WHERE organization_id = $1 ORDER BY created_at DESC`,
      [orgId]
    );
    
    // Check if we need to seed invoices
    if (invRes.rows.length === 0) {
      await query(
        `INSERT INTO invoices (organization_id, amount, status, due_date, pdf_url) 
         VALUES ($1, 499.00, 'paid', now() - interval '5 days', 'INV-001')`,
        [orgId]
      );
      const newInvRes = await query(
        `SELECT * FROM invoices WHERE organization_id = $1 ORDER BY created_at DESC`,
        [orgId]
      );
      invRes.rows = newInvRes.rows;
    }

    return {
      subscription,
      paymentMethod: pmRes.rows[0] || null,
      paymentMethods: pmRes.rows,
      balance: 0.00,
      invoices: invRes.rows
    };
  }

  async getInvoices(user: JwtPayload, status?: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) return [];

    let sql = `SELECT * FROM invoices WHERE organization_id = $1`;
    const params: any[] = [orgId];
    if (status) {
      sql += ` AND status = $2`;
      params.push(status);
    }
    sql += ` ORDER BY created_at DESC`;

    const res = await query(sql, params);
    return res.rows;
  }

  async getApprovals(user: JwtPayload, type?: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) return [];

    let sql = `
      SELECT a.*, p.name AS property_name, p.address_line_1, p.city, p.state
      FROM approvals a
      LEFT JOIN properties p ON a.property_id = p.id
      WHERE a.organization_id = $1
    `;
    const params: any[] = [orgId];
    if (type && type !== 'quote') {
      sql += ` AND a.approval_type = $2`;
      params.push(type);
    }
    sql += ` ORDER BY a.created_at DESC`;

    const res = await query(sql, params);
    return res.rows;
  }

  async getApprovalById(user: JwtPayload, id: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const res = await query(
      `SELECT a.*, p.name AS property_name, p.address_line_1, p.city, p.state
       FROM approvals a
       LEFT JOIN properties p ON a.property_id = p.id
       WHERE a.id = $1 AND a.organization_id = $2`,
      [id, orgId]
    );
    if (!res.rows || res.rows.length === 0) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }
    return res.rows[0];
  }

  async addPaymentMethod(user: JwtPayload, methodData: any) {
    const orgId = user.activeOrganizationId;
    
    // Clear default flag if new one is default
    if (methodData.isDefault) {
      await query(`UPDATE payment_methods SET is_default = false WHERE organization_id = $1`, [orgId]);
    }

    await query(
      `INSERT INTO payment_methods (organization_id, type, last_four, brand, is_default)
       VALUES ($1, $2, $3, $4, $5)`,
      [orgId, methodData.type, methodData.lastFour, methodData.brand, methodData.isDefault || false]
    );

    return this.getBillingDetails(user);
  }
}
