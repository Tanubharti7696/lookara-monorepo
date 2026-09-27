// apps/backend/src/dispatch/dispatch.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class DispatchService {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Find eligible vendors for a specific task based on trade match, relationship, and status
   */
  async getCandidates(jobId: string, user: JwtPayload) {
    const jobRes = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    if (jobRes.rows.length === 0) throw new NotFoundException('Task not found');
    const job = jobRes.rows[0];

    const sql = `
      SELECT v.id, v.display_name, v.business_name, v.primary_trade, v.lifecycle_status,
             v.emergency_enabled, ov.relationship_status,
             (CASE WHEN ov.relationship_status = 'preferred' THEN 1 ELSE 2 END) AS priority_rank
      FROM vendors v
      JOIN organization_vendors ov ON v.id = ov.vendor_id AND ov.organization_id = $1
      WHERE v.lifecycle_status = 'active'
        AND ov.relationship_status IN ('preferred', 'neutral', 'limited')
        AND ($2::boolean = false OR v.emergency_enabled = true)
      ORDER BY priority_rank ASC, v.display_name ASC
    `;

    const isEmergency = job.urgency === 'emergency';
    const res = await query(sql, [job.organization_id, isEmergency]);

    return {
      job: {
        id: job.id,
        jobCode: job.job_code,
        title: job.title,
        tradeCode: job.trade_code,
        urgency: job.urgency,
      },
      candidates: res.rows,
    };
  }

  /**
   * Assign a vendor to a task
   */
  async assignVendor(jobId: string, vendorId: string, user: JwtPayload) {
    const jobRes = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    if (jobRes.rows.length === 0) throw new NotFoundException('Task not found');
    const job = jobRes.rows[0];

    const vendorRes = await query(`SELECT * FROM vendors WHERE id = $1`, [vendorId]);
    if (vendorRes.rows.length === 0) throw new NotFoundException('Vendor not found');
    const vendor = vendorRes.rows[0];

    // Record assignment
    await query(
      `INSERT INTO job_assignments (job_id, vendor_id, assignment_type)
       VALUES ($1, $2, 'manual')`,
      [jobId, vendorId],
    );

    // Update job status
    const updatedJob = await query(
      `UPDATE jobs SET status = 'assigned', updated_at = now() WHERE id = $1 RETURNING *`,
      [jobId],
    );

    // Record Audit
    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'job',
      targetId: jobId,
      category: 'dispatch',
      eventType: 'dispatch.vendor_assigned',
      summary: `Task ${job.job_code} assigned to vendor ${vendor.display_name}`,
      metadata: { vendorId, jobId, trade: job.trade_code },
    });

    return updatedJob.rows[0];
  }
}
