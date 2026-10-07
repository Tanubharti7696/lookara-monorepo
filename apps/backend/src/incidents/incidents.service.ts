import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class IncidentsService {
  constructor(private readonly auditService: AuditService) {}

  async findAll(user: JwtPayload, propertyId?: string) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    let sql = `
      SELECT i.*, p.name as property_name, 'System' as reported_by
      FROM incidents i
      JOIN properties p ON i.property_id = p.id
      WHERE i.organization_id = $1
    `;
    const params: any[] = [orgId];

    if (propertyId) {
      sql += ' AND i.property_id = $2';
      params.push(propertyId);
    }
    
    sql += ' ORDER BY i.created_at DESC';

    const res = await query(sql, params);
    
    return res.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.summary,
      propertyId: row.property_id,
      propertyName: row.property_name,
      severity: row.severity,
      status: row.status,
      sourceType: 'pm',
      reportedBy: row.reported_by || 'System',
      createdAt: row.created_at,
    }));
  }

  async updateStatus(id: string, user: JwtPayload, status: string) {
    const orgId = user.activeOrganizationId;
    
    const res = await query(
      `SELECT * FROM incidents WHERE id = $1 AND organization_id = $2`, 
      [id, orgId]
    );
    if (res.rows.length === 0) throw new NotFoundException('Incident not found');

    const updated = await query(`
      UPDATE incidents 
      SET status = $1, resolved_at = CASE WHEN $1 IN ('resolved', 'dismissed') THEN now() ELSE resolved_at END
      WHERE id = $2 RETURNING *
    `, [status, id]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'incident',
      targetId: id,
      category: 'incident',
      eventType: 'incident.updated',
      summary: `Incident status updated to ${status}`
    });

    return updated.rows[0];
  }

  async create(user: JwtPayload, data: { propertyId: string; description: string; severity: string; flagType: string }) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const incidentCode = 'INC-' + Math.floor(Math.random() * 100000);
    const res = await query(`
      INSERT INTO incidents (
        organization_id, property_id, title, incident_type, severity, status, summary, incident_code
      ) VALUES ($1, $2, $3, 'maintenance_issue', $4, 'open', $5, $6)
      RETURNING *
    `, [orgId, data.propertyId, data.flagType, data.severity, data.description, incidentCode]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'incident',
      targetId: res.rows[0].id,
      category: 'incident',
      eventType: 'incident.created',
      summary: `Incident reported: ${data.flagType}`
    });

    return res.rows[0];
  }
}
