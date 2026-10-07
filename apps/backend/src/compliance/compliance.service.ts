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

  async getTemplates(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) return [];

    const res = await query(
      `SELECT * FROM compliance_templates WHERE organization_id = $1 ORDER BY created_at DESC`,
      [orgId]
    );
    return res.rows;
  }

  async getTemplate(user: JwtPayload, templateId: string) {
    const orgId = user.activeOrganizationId;
    const tRes = await query(
      `SELECT * FROM compliance_templates WHERE id = $1 AND organization_id = $2`,
      [templateId, orgId]
    );
    if (tRes.rows.length === 0) throw new NotFoundException('Template not found');
    
    const rRes = await query(
      `SELECT * FROM template_requirements WHERE template_id = $1 ORDER BY created_at ASC`,
      [templateId]
    );

    return {
      ...tRes.rows[0],
      requirements: rRes.rows
    };
  }

  async saveTemplate(user: JwtPayload, templateData: any) {
    const orgId = user.activeOrganizationId;
    
    // Simplistic UPSERT
    let templateId = templateData.id;
    if (!templateId || String(templateId).includes('copy') || templateId === 'temp') {
      const res = await query(
        `INSERT INTO compliance_templates (organization_id, name, status) VALUES ($1, $2, $3) RETURNING id`,
        [orgId, templateData.name, templateData.status || 'draft']
      );
      templateId = res.rows[0].id;
    } else {
      await query(
        `UPDATE compliance_templates SET name = $1, status = $2, updated_at = now() WHERE id = $3 AND organization_id = $4`,
        [templateData.name, templateData.status, templateId, orgId]
      );
      await query(`DELETE FROM template_requirements WHERE template_id = $1`, [templateId]);
    }

    const reqs = templateData.requirements || [];
    for (const r of reqs) {
      await query(
        `INSERT INTO template_requirements (template_id, name, type, cycle, due_month, due_day, is_inspection, ops_blocker, priority, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [templateId, r.name, r.type, r.cycle, r.dueMonth, r.dueDay, r.inspection, r.opsBlocker, r.priority, r.notes]
      );
    }

    return this.getTemplate(user, templateId);
  }
}
