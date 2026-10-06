import { Injectable, ForbiddenException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class VendorsService {
  async findAll(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const res = await query(`
      SELECT v.*, ov.relationship_status as org_status,
             (SELECT count(*) FROM job_assignments ja JOIN jobs j ON ja.job_id = j.id WHERE ja.vendor_id = v.id AND j.organization_id = $1) as task_count,
             (SELECT count(*) FROM vendor_trades WHERE vendor_id = v.id) as trade_count
      FROM vendors v
      JOIN organization_vendors ov ON v.id = ov.vendor_id
      WHERE ov.organization_id = $1
    `, [orgId]);

    return res.rows.map(row => ({
      id: row.id,
      name: row.display_name || row.business_name,
      contact_email: 'vendor@example.com',
      contact_phone: '555-0100',
      tier: 'Standard',
      org_status: row.org_status,
      insurance_status: 'verified',
      w9_status: 'verified',
      task_count: parseInt(row.task_count || '0', 10),
      trade_count: parseInt(row.trade_count || '0', 10),
      rating: 4.8
    }));
  }
}
