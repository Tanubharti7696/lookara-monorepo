// apps/backend/src/dispatch/dispatch.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { query, getClient } from '@lookara/database';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '@lookara/auth';

@Injectable()
export class DispatchService {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Find eligible vendors for a specific task based on trade match, property coverage, relationship,
   * actual verified compliance documents (no blocking unapproved/expired docs), and emergency status.
   */
  async getCandidates(jobId: string, user: JwtPayload, specificVendorId?: string) {
    const jobRes = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    if (jobRes.rows.length === 0) throw new NotFoundException('Task not found');
    const job = jobRes.rows[0];

    const orgId = user.activeOrganizationId;
    if (job.organization_id !== orgId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    // Canonical Eligibility & Compliance Query:
    // 1. Trade/Skill: vendor_trades matches job.trade_code and is active
    // 2. Property Coverage: vendor_property_coverage matches job.property_id and is active
    // 3. Document Compliance: vendor has NO blocking compliance requirements that are unapproved or expired
    // 4. Relationship: organization_vendors status IN ('preferred', 'neutral', 'limited')
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
        AND NOT EXISTS (
          -- Check vendor availability schedule for current day of week (0=Sunday..6=Saturday)
          SELECT 1 FROM vendor_availability va
          WHERE va.vendor_id = v.id
            AND va.weekday = EXTRACT(DOW FROM CURRENT_TIMESTAMP)::smallint
            AND va.is_off = true
        )
        AND NOT EXISTS (
          -- Check for any blocking compliance requirement that lacks an approved, unexpired document
          SELECT 1 FROM compliance_requirements cr
          WHERE cr.blocks_dispatch = true
            AND (cr.requirement_scope = 'shared' OR cr.trade_code = $3)
            AND NOT EXISTS (
              SELECT 1 FROM vendor_documents vd
              WHERE vd.vendor_id = v.id
                AND vd.compliance_requirement_id = cr.id
                AND vd.review_status = 'approved'
                AND (vd.expiry_date IS NULL OR vd.expiry_date >= CURRENT_DATE)
            )
        )
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
        status: job.status,
      },
      candidates: res.rows,
    };
  }

  /**
   * Assign a vendor to a task safely with transaction isolation and row-level locking
   */
  async assignVendor(jobId: string, vendorId: string, user: JwtPayload) {
    const { job, candidates } = await this.getCandidates(jobId, user, vendorId);
    
    if (candidates.length === 0) {
      throw new BadRequestException('Vendor is not eligible for this task (fails property coverage, trade, verified compliance, or relationship checks)');
    }

    const vendor = candidates[0];
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // 1. Acquire row-level lock on the target job to prevent concurrent race condition dispatches
      const lockedJobRes = await client.query(
        `SELECT id, status, job_code, organization_id, trade_code FROM jobs WHERE id = $1 FOR UPDATE`,
        [jobId]
      );

      if (lockedJobRes.rows.length === 0) {
        throw new NotFoundException('Task not found');
      }

      const lockedJob = lockedJobRes.rows[0];

      // Canonical state check: only unassigned or dispatching jobs can be assigned
      if (lockedJob.status !== 'unassigned' && lockedJob.status !== 'dispatching') {
        throw new ConflictException(
          `Cannot assign task ${lockedJob.job_code}: current status is already "${lockedJob.status}"`
        );
      }

      // 2. Check if an active assignment already exists
      const existingAssignRes = await client.query(
        `SELECT id, vendor_id FROM job_assignments WHERE job_id = $1 LIMIT 1`,
        [jobId]
      );
      if (existingAssignRes.rows.length > 0) {
        throw new ConflictException(`Task ${lockedJob.job_code} already has an assigned vendor`);
      }

      // 3. Record assignment in transaction
      await client.query(
        `INSERT INTO job_assignments (job_id, vendor_id, assignment_type)
         VALUES ($1, $2, 'manual')`,
        [jobId, vendorId],
      );

      // 4. Transition job status to 'assigned'
      const updatedJobRes = await client.query(
        `UPDATE jobs SET status = 'assigned', updated_at = now() WHERE id = $1 RETURNING *`,
        [jobId],
      );

      await client.query('COMMIT');

      // Record Audit Event after successful commit
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

      return updatedJobRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Automatic dispatch: executes the exact same eligibility evaluation and transaction isolation,
   * selecting the top-ranked candidate (preferred over neutral/limited, alphabetical tie-breaker).
   */
  async autoDispatch(jobId: string, user: JwtPayload) {
    const { candidates } = await this.getCandidates(jobId, user);
    if (!candidates || candidates.length === 0) {
      throw new BadRequestException('No eligible vendors found matching trade, property coverage, relationship, and compliance criteria for auto-dispatch');
    }

    const topCandidate = candidates[0];
    return this.assignVendor(jobId, topCandidate.id, user);
  }
}
