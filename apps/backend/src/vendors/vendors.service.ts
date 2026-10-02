import { Injectable, ForbiddenException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class VendorsService {
  async findAll(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    // Fetch vendors linked to the organization
    const res = await query(`
      SELECT v.*, ov.status as org_status,
             (SELECT count(*) FROM jobs WHERE vendor_id = v.id AND organization_id = $1) as task_count,
             (SELECT count(*) FROM vendor_trades WHERE vendor_id = v.id) as trade_count
      FROM vendors v
      JOIN organization_vendors ov ON v.id = ov.vendor_id
      WHERE ov.organization_id = $1
    `, [orgId]);

    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      tier: row.tier || 'Standard',
      org_status: row.org_status,
      insurance_status: row.insurance_status || 'missing',
      w9_status: row.w9_status || 'missing',
      task_count: parseInt(row.task_count || '0', 10),
      trade_count: parseInt(row.trade_count || '0', 10),
      rating: parseFloat(row.rating || '0')
    }));
  }
}
