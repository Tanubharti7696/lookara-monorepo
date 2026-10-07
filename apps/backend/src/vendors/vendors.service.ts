import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class VendorsService {
  constructor(private readonly auditService: AuditService) {}

  async findAll(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const res = await query(`
      SELECT v.*, ov.relationship_status as org_status,
             (SELECT count(*) FROM job_assignments ja JOIN jobs j ON ja.job_id = j.id WHERE ja.vendor_id = v.id AND j.organization_id = $1) as task_count,
             (SELECT count(*) FROM vendor_trades vt WHERE vt.vendor_id = v.id) as trade_count
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

  async getCoverage(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const res = await query(`
      SELECT vpc.vendor_id, vpc.property_id, p.name as property_name, vpc.status
      FROM vendor_property_coverage vpc
      JOIN properties p ON vpc.property_id = p.id
      WHERE p.organization_id = $1 AND vpc.status = 'active'
    `, [orgId]);

    // Format like the frontend expects: { [vendorId]: [{ property: 'Property Name', label: 'Coverage' }] }
    const attachments = {};
    for (const row of res.rows) {
      if (!attachments[row.vendor_id]) {
        attachments[row.vendor_id] = [];
      }
      attachments[row.vendor_id].push({
        propertyId: row.property_id,
        property: row.property_name,
        label: 'Coverage Active'
      });
    }

    return attachments;
  }

  async addCoverage(vendorId: string, propertyId: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    
    // Verify property belongs to org
    const propRes = await query(`SELECT id, name FROM properties WHERE id = $1 AND organization_id = $2`, [propertyId, orgId]);
    if (propRes.rows.length === 0) throw new ForbiddenException('Property not found in your organization');

    // Add coverage
    await query(`
      INSERT INTO vendor_property_coverage (vendor_id, property_id, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT (vendor_id, property_id) 
      DO UPDATE SET status = 'active', updated_at = now()
    `, [vendorId, propertyId]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'vendor',
      targetId: vendorId,
      category: 'vendor',
      eventType: 'vendor.coverage_added',
      summary: `Vendor granted coverage for property ${propRes.rows[0].name}`,
    });

    return { success: true };
  }

  async removeCoverage(vendorId: string, propertyId: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    
    // Verify property belongs to org
    const propRes = await query(`SELECT id, name FROM properties WHERE id = $1 AND organization_id = $2`, [propertyId, orgId]);
    if (propRes.rows.length === 0) throw new ForbiddenException('Property not found in your organization');

    await query(`
      UPDATE vendor_property_coverage SET status = 'inactive', updated_at = now()
      WHERE vendor_id = $1 AND property_id = $2
    `, [vendorId, propertyId]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'vendor',
      targetId: vendorId,
      category: 'vendor',
      eventType: 'vendor.coverage_removed',
      summary: `Vendor coverage removed for property ${propRes.rows[0].name}`,
    });

    return { success: true };
  }

  async updateStatus(vendorId: string, status: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    
    const allowedStatuses = ['preferred', 'neutral', 'limited', 'not_receiving'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Status must be one of: ${allowedStatuses.join(', ')}`);
    }

    const res = await query(`
      UPDATE organization_vendors 
      SET relationship_status = $1, updated_at = now()
      WHERE vendor_id = $2 AND organization_id = $3
      RETURNING *
    `, [status, vendorId, orgId]);

    if (res.rows.length === 0) throw new NotFoundException('Vendor not found in your organization');

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'vendor',
      targetId: vendorId,
      category: 'vendor',
      eventType: `vendor.status_changed`,
      summary: `Vendor relationship status changed to ${status}`,
    });

    return res.rows[0];
  }
}
