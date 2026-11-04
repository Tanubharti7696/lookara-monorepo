// apps/backend/src/audit/audit.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

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

  async getEvents(
    user: JwtPayload,
    options: {
      category?: string;
      targetType?: string;
      targetId?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('Authentication required');
    }

    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, options.pageSize || 25);
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    // Enforce Tenant Organization Scoping unless audited platform admin
    if (!user.isAdmin) {
      // Require active organization context or resolved memberships
      const orgId = user.activeOrganizationId;
      if (!orgId) {
        throw new ForbiddenException('Active organization context required to access audit history');
      }

      // Scope to resources belonging to the user's organization or actor = user
      conditions.push(`(
        target_id IN (SELECT id FROM jobs WHERE organization_id = $${paramIdx}::uuid)
        OR target_id IN (SELECT id FROM properties WHERE organization_id = $${paramIdx}::uuid)
        OR target_id = $${paramIdx}::uuid
        OR (metadata->>'organizationId') = $${paramIdx}::text
        OR (metadata->>'orgId') = $${paramIdx}::text
        OR actor_user_id = $${paramIdx + 1}::uuid
      )`);
      values.push(orgId, user.sub);
      paramIdx += 2;
    }

    if (options.category) {
      conditions.push(`category = $${paramIdx++}`);
      values.push(options.category);
    }
    if (options.targetType) {
      conditions.push(`target_type = $${paramIdx++}`);
      values.push(options.targetType);
    }
    if (options.targetId) {
      // If user supplies a targetId, it must still be within their authorized tenant scope
      conditions.push(`target_id = $${paramIdx++}::uuid`);
      values.push(options.targetId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT count(*) AS total FROM audit_events ${whereClause}`, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const paginatedValues = [...values, pageSize, offset];
    const listSql = `
      SELECT * FROM audit_events
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    const listRes = await query(listSql, paginatedValues);

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
