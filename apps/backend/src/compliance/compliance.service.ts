import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ComplianceService {
  constructor(private readonly auditService: AuditService) {}

  async findAll(user: JwtPayload, propertyId?: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    let sql = `
      SELECT c.*, 
             p.name as property_name, 
             p.city as property_city,
             v.business_name as vendor_name,
             (SELECT json_agg(json_build_object('id', d.id, 'name', d.name, 'is_verified', d.is_verified)) 
              FROM property_compliance_documents d WHERE d.compliance_item_id = c.id) as docs
      FROM property_compliance_items c
      JOIN properties p ON c.property_id = p.id
      LEFT JOIN vendors v ON c.assigned_vendor_id = v.id
      WHERE c.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (propertyId) {
      sql += ' AND c.property_id = $2';
      params.push(propertyId);
    }

    const res = await query(sql, params);
    
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      prop: row.property_name,
      city: row.property_city,
      type: row.compliance_type,
      status: row.status,
      risk: row.risk_level,
      due: row.due_date ? row.due_date.toISOString() : null,
      cycle: row.renewal_cycle,
      jurisdiction: row.jurisdiction,
      insp: row.requires_inspection,
      vendor: row.vendor_name || '—',
      docs: row.docs || []
    }));
  }

  async scheduleTask(itemId: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    
    // verify ownership
    const res = await query(`SELECT * FROM property_compliance_items WHERE id = $1 AND organization_id = $2`, [itemId, orgId]);
    if (res.rows.length === 0) throw new NotFoundException('Item not found');

    const updated = await query(`
      UPDATE property_compliance_items 
      SET status = 'scheduled', updated_at = now()
      WHERE id = $1 RETURNING *
    `, [itemId]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'compliance',
      targetId: itemId,
      category: 'compliance',
      eventType: 'compliance.scheduled',
      summary: `Compliance item scheduled for resolution`
    });

    return updated.rows[0];
  }
}
