// apps/backend/src/dispatch/dispatch.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { query } from '@lookara/database';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class DispatchService {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Find eligible vendors for a specific task based on trade match, property coverage, relationship, compliance, and emergency status
   */
  async getCandidates(jobId: string, user: JwtPayload, specificVendorId?: string) {
    const jobRes = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    if (jobRes.rows.length === 0) throw new NotFoundException('Task not found');
    const job = jobRes.rows[0];

    const orgId = user.activeOrganizationId;
    if (job.organization_id !== orgId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    // Eligibility Query:
    // 1. Trade/Skill: vendor_trades matches job.trade_code
    // 2. Property Coverage: vendor_property_coverage matches job.property_id
    // 3. Compliance: vendor has active compliance docs (mocked as lifecycle_status active for now)
    // 4. Relationship: organization_vendors status IN preferred, neutral
    // 5. Emergency: if job.severity == 'critical', vendor.emergency_enabled = true
    
    let sql = `
      SELECT v.id, v.display_name, v.business_name, v.primary_trade, v.lifecycle_status,
             v.emergency_enabled, ov.relationship_status,
             (CASE WHEN ov.relationship_status = 'preferred' THEN 1 ELSE 2 END) AS priority_rank
      FROM vendors v
      JOIN organization_vendors ov ON v.id = ov.vendor_id AND ov.organization_id = $1
      JOIN vendor_property_coverage vpc ON v.id = vpc.vendor_id AND vpc.property_id = $2 AND vpc.status = 'active'
      JOIN vendor_trades vt ON v.id = vt.vendor_id AND vt.trade_code = $3 AND vt.eligibility_status = 'active'
      WHERE v.lifecycle_status = 'active'
        AND ov.relationship_status IN ('preferred', 'neutral', 'limited')
        AND ($4::boolean = false OR v.emergency_enabled = true)
        AND v.accepts_new_jobs = true
    `;
    const params: any[] = [job.organization_id, job.property_id, job.trade_code, job.severity === 'critical'];

    if (specificVendorId) {
      sql += ` AND v.id = $5`;
      params.push(specificVendorId);
    }

    sql += ` ORDER BY priority_rank ASC, v.display_name ASC`;

    const res = await query(sql, params);

    return {
      job: {
        id: job.id,
        jobCode: job.job_code,
        title: job.title,
        tradeCode: job.trade_code,
        severity: job.severity,
      },
      candidates: res.rows,
    };
  }

  /**
   * Assign a vendor to a task
   */
  async assignVendor(jobId: string, vendorId: string, user: JwtPayload) {
    const { job, candidates } = await this.getCandidates(jobId, user, vendorId);
    
    if (candidates.length === 0) {
      throw new BadRequestException('Vendor is not eligible for this task (fails property coverage, trade, compliance, or relationship checks)');
    }

    const vendor = candidates[0];

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
      summary: `Task ${job.jobCode} assigned to vendor ${vendor.display_name}`,
      metadata: { vendorId, jobId, trade: job.tradeCode },
    });

    return updatedJob.rows[0];
  }
}
