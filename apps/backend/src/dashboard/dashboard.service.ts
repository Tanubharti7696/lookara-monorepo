// apps/backend/src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class DashboardService {
  async getMetrics(user: JwtPayload) {
    const orgId = user.activeOrganizationId;

    if (user.isOwner && !user.isAdmin && !orgId) {
      // Owner-specific metrics
      const ownerRes = await query(
        `SELECT
           (SELECT count(*) FROM property_owners po JOIN owners o ON po.owner_id = o.id WHERE o.user_id = $1) as properties_count,
           (SELECT count(*) FROM approvals a JOIN owners o ON a.owner_id = o.id WHERE o.user_id = $1 AND a.status = 'awaiting_owner_decision') as pending_approvals,
           (SELECT count(*) FROM incidents inc WHERE inc.property_id IN (SELECT po.property_id FROM property_owners po JOIN owners o ON po.owner_id = o.id WHERE o.user_id = $1) AND inc.status IN ('open', 'in_progress')) as active_incidents`,
        [user.sub],
      );
      return ownerRes.rows[0];
    }

    // PM Dashboard metrics
    const orgFilter = orgId ? `WHERE organization_id = '${orgId}'` : '';
    const propFilter = orgId ? `WHERE p.organization_id = '${orgId}'` : '';

    const sql = `
      SELECT
        (SELECT count(*) FROM properties ${orgFilter}) as total_properties,
        (SELECT count(*) FROM properties WHERE status = 'active' ${orgId ? `AND organization_id = '${orgId}'` : ''}) as active_properties,
        (SELECT count(*) FROM jobs WHERE status IN ('unassigned', 'dispatching', 'assigned', 'accepted', 'in_progress') ${orgId ? `AND organization_id = '${orgId}'` : ''}) as active_jobs,
        (SELECT count(*) FROM jobs WHERE severity = 'critical' AND status NOT IN ('completed', 'closed', 'cancelled') ${orgId ? `AND organization_id = '${orgId}'` : ''}) as emergency_jobs,
        (SELECT count(*) FROM incidents WHERE status IN ('open', 'in_progress') ${orgId ? `AND organization_id = '${orgId}'` : ''}) as active_incidents,
        (SELECT count(*) FROM approvals WHERE status = 'awaiting_owner_decision' ${orgId ? `AND organization_id = '${orgId}'` : ''}) as pending_approvals
    `;

    const metricsRes = await query(sql);

    // Urgent action items
    const urgentTasksRes = await query(`
      SELECT j.id, j.job_code, j.title, j.severity as urgency, j.status, p.name as property_name
      FROM jobs j
      JOIN properties p ON j.property_id = p.id
      WHERE j.severity = 'critical' AND j.status IN ('unassigned', 'dispatching', 'assigned', 'in_progress')
        ${orgId ? `AND j.organization_id = '${orgId}'` : ''}
      LIMIT 5
    `);

    return {
      stats: metricsRes.rows[0],
      urgentItems: urgentTasksRes.rows,
    };
  }
}
