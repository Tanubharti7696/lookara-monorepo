// apps/backend/src/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { query } from '@lookara/database';

export interface RecordAuditInput {
  actorType: 'admin' | 'pm' | 'vendor' | 'owner' | 'system';
  actorUserId?: string;
  targetType: string;
  targetId?: string;
  category: string;
  eventType: string;
  summary: string;
  metadata?: Record<string, any>;
  sessionLabel?: string;
}

@Injectable()
export class AuditService {
  async recordEvent(input: RecordAuditInput) {
    const eventCode = `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const sql = `
      INSERT INTO audit_events (
        event_code, actor_type, actor_user_id, target_type, target_id,
        category, event_type, summary, metadata, session_label
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const res = await query(sql, [
      eventCode,
      input.actorType,
      input.actorUserId || null,
      input.targetType,
      input.targetId || null,
      input.category,
      input.eventType,
      input.summary,
      JSON.stringify(input.metadata || {}),
      input.sessionLabel || null,
    ]);
    return res.rows[0];
  }

  async getEvents(options: {
    category?: string;
    targetType?: string;
    targetId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, options.pageSize || 25);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (options.category) {
      conditions.push(`category = $${paramIdx++}`);
      values.push(options.category);
    }
    if (options.targetType) {
      conditions.push(`target_type = $${paramIdx++}`);
      values.push(options.targetType);
    }
    if (options.targetId) {
      conditions.push(`target_id = $${paramIdx++}`);
      values.push(options.targetId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT count(*) AS total FROM audit_events ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    values.push(pageSize, offset);
    const listSql = `
      SELECT * FROM audit_events
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    const listRes = await query(listSql, values);

    return {
      data: listRes.rows,
      meta: {
        page,
        pageSize,
        total,
      },
    };
  }
}
