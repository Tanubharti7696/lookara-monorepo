import { Injectable } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly auditService: AuditService) {}

  async findAll(user: JwtPayload) {
    const res = await query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 100
    `, [user.sub]);

    return res.rows.map(row => {
      // Map database row to Signal UI format
      const isCritical = row.category === 'incident' || row.category === 'system';
      const isPayment = row.category === 'financial';
      
      const section = isCritical ? 'critical' : isPayment ? 'payment' : 'attention';
      const icon = isCritical ? '🚨' : isPayment ? '💸' : '⚠️';

      return {
        id: row.id,
        section,
        unread: row.read_at === null,
        icon,
        property: row.target_type === 'property' ? 'Property' : 'System',
        event: row.title,
        context: row.body,
        riskTimer: 'Recent',
        riskLevel: isCritical ? 'urgent' : 'warn',
        actions: [] // Action resolution would be complex; keep empty for now and let frontend handle default
      };
    });
  }

  async markAsRead(id: string, user: JwtPayload) {
    const res = await query(`
      UPDATE notifications 
      SET read_at = now() 
      WHERE id = $1 AND user_id = $2 
      RETURNING *
    `, [id, user.sub]);
    return res.rows[0];
  }
}
