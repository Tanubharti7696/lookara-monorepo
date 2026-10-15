import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class VendorsService {
  constructor(private readonly auditService: AuditService) {}

  async findAll(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const res = await query(`
      SELECT v.*, ov.relationship_status as org_status,
             (SELECT count(*) FROM job_assignments ja JOIN jobs j ON ja.job_id = j.id WHERE ja.vendor_id = v.id AND j.organization_id = $1) as task_count,
             (SELECT count(*) FROM vendor_trades vt WHERE vt.vendor_id = v.id) as trade_count
      FROM vendors v
      JOIN organization_vendors ov ON v.id = ov.vendor_id
      WHERE ov.organization_id = $1
    `, [orgId]);

    return res.rows.map(row => ({
      id: row.id,
      name: row.display_name || row.business_name,
      contact_email: 'vendor@example.com',
      contact_phone: '555-0100',
      tier: 'Standard',
      org_status: row.org_status,
      insurance_status: 'verified',
      w9_status: 'verified',
      task_count: parseInt(row.task_count || '0', 10),
      trade_count: parseInt(row.trade_count || '0', 10),
      rating: 4.8
    }));
  }

  async getCoverage(user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    if (!orgId) throw new ForbiddenException('Must be in an organization context');

    const res = await query(`
      SELECT vpc.vendor_id, vpc.property_id, p.name as property_name, vpc.status
      FROM vendor_property_coverage vpc
      JOIN properties p ON vpc.property_id = p.id
      WHERE p.organization_id = $1 AND vpc.status = 'active'
    `, [orgId]);

    // Format like the frontend expects: { [vendorId]: [{ property: 'Property Name', label: 'Coverage' }] }
    const attachments = {};
    for (const row of res.rows) {
      if (!attachments[row.vendor_id]) {
        attachments[row.vendor_id] = [];
      }
      attachments[row.vendor_id].push({
        propertyId: row.property_id,
        property: row.property_name,
        label: 'Coverage Active'
      });
    }

    return attachments;
  }

  async addCoverage(vendorId: string, propertyId: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    
    // Verify property belongs to org
    const propRes = await query(`SELECT id, name FROM properties WHERE id = $1 AND organization_id = $2`, [propertyId, orgId]);
    if (propRes.rows.length === 0) throw new ForbiddenException('Property not found in your organization');

    // Add coverage
    await query(`
      INSERT INTO vendor_property_coverage (vendor_id, property_id, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT (vendor_id, property_id) 
      DO UPDATE SET status = 'active', updated_at = now()
    `, [vendorId, propertyId]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'vendor',
      targetId: vendorId,
      category: 'vendor',
      eventType: 'vendor.coverage_added',
      summary: `Vendor granted coverage for property ${propRes.rows[0].name}`,
    });

    return { success: true };
  }

  async removeCoverage(vendorId: string, propertyId: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    
    // Verify property belongs to org
    const propRes = await query(`SELECT id, name FROM properties WHERE id = $1 AND organization_id = $2`, [propertyId, orgId]);
    if (propRes.rows.length === 0) throw new ForbiddenException('Property not found in your organization');

    await query(`
      UPDATE vendor_property_coverage SET status = 'inactive', updated_at = now()
      WHERE vendor_id = $1 AND property_id = $2
    `, [vendorId, propertyId]);

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'vendor',
      targetId: vendorId,
      category: 'vendor',
      eventType: 'vendor.coverage_removed',
      summary: `Vendor coverage removed for property ${propRes.rows[0].name}`,
    });

    return { success: true };
  }

  async updateStatus(vendorId: string, status: string, user: JwtPayload) {
    const orgId = user.activeOrganizationId;
    
    const allowedStatuses = ['preferred', 'neutral', 'limited', 'not_receiving'];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Status must be one of: ${allowedStatuses.join(', ')}`);
    }

    const res = await query(`
      UPDATE organization_vendors 
      SET relationship_status = $1, updated_at = now()
      WHERE vendor_id = $2 AND organization_id = $3
      RETURNING *
    `, [status, vendorId, orgId]);

    if (res.rows.length === 0) throw new NotFoundException('Vendor not found in your organization');

    await this.auditService.recordEvent({
      actorType: 'pm',
      actorUserId: user.sub,
      targetType: 'vendor',
      targetId: vendorId,
      category: 'vendor',
      eventType: `vendor.status_changed`,
      summary: `Vendor relationship status changed to ${status}`,
    });

    return res.rows[0];
  }

  /**
   * Helper to resolve vendor ID from authenticated user
   */
  private async getVendorIdForUser(user: JwtPayload): Promise<string> {
    const vRes = await query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [user.sub]);
    if (vRes.rows.length > 0) return vRes.rows[0].id;
    
    // Strict authorization: do not fall back to an arbitrary vendor
    throw new ForbiddenException('No vendor profile associated with the authenticated user');
  }

  /**
   * Retrieve jobs assigned or offered to the authenticated vendor
   */
  async getVendorJobs(user: JwtPayload, statusFilter?: string) {
    const vendorId = await this.getVendorIdForUser(user);

    let sql = `
      SELECT j.*, p.name AS property_name, p.address_line_1, p.city, p.state, p.zip,
             o.name AS organization_name,
             ja.assigned_at, ja.accepted_at, ja.completed_at,
             jss.acknowledge_target, jss.arrival_target, jss.completion_target,
             (SELECT count(*) FROM job_evidence je WHERE je.job_id = j.id) as evidence_count
      FROM jobs j
      JOIN job_assignments ja ON j.id = ja.job_id AND ja.vendor_id = $1
      JOIN properties p ON j.property_id = p.id
      JOIN organizations o ON j.organization_id = o.id
      LEFT JOIN job_sla_snapshots jss ON j.id = jss.job_id
    `;
    const params: any[] = [vendorId];

    if (statusFilter) {
      sql += ` WHERE j.status = $2`;
      params.push(statusFilter);
    }

    sql += ` ORDER BY j.created_at DESC`;

    const res = await query(sql, params);
    return res.rows;
  }

  /**
   * Accept or decline a job
   */
  async respondToJob(jobId: string, user: JwtPayload, body: { action: 'accept' | 'decline'; declineReason?: string }) {
    const vendorId = await this.getVendorIdForUser(user);

    // Verify assignment exists for this vendor
    const assignRes = await query(
      `SELECT * FROM job_assignments WHERE job_id = $1 AND vendor_id = $2 ORDER BY assigned_at DESC LIMIT 1`,
      [jobId, vendorId]
    );
    if (assignRes.rows.length === 0) {
      throw new ForbiddenException('Job is not assigned to this vendor');
    }

    const jobRes = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    if (jobRes.rows.length === 0) throw new NotFoundException('Job not found');
    const job = jobRes.rows[0];

    if (body.action === 'accept') {
      await query(`UPDATE job_assignments SET accepted_at = now() WHERE id = $1`, [assignRes.rows[0].id]);
      const updatedJob = await query(`UPDATE jobs SET status = 'accepted', updated_at = now() WHERE id = $1 RETURNING *`, [jobId]);

      await this.auditService.recordEvent({
        actorType: 'vendor',
        actorUserId: user.sub,
        targetType: 'job',
        targetId: jobId,
        category: 'dispatch',
        eventType: 'job.accepted',
        summary: `Vendor accepted Job ${job.job_code}`,
        metadata: { vendorId },
      });

      return { status: 'accepted', job: updatedJob.rows[0] };
    } else {
      // Declined
      await query(`DELETE FROM job_assignments WHERE id = $1`, [assignRes.rows[0].id]);
      const updatedJob = await query(
        `UPDATE jobs SET status = 'unassigned', updated_at = now() WHERE id = $1 RETURNING *`,
        [jobId]
      );

      // Record offer decline in audit
      await this.auditService.recordEvent({
        actorType: 'vendor',
        actorUserId: user.sub,
        targetType: 'job',
        targetId: jobId,
        category: 'dispatch',
        eventType: 'job.declined',
        summary: `Vendor declined Job ${job.job_code}. Reason: ${body.declineReason || 'Not specified'}`,
        metadata: { vendorId, declineReason: body.declineReason },
      });

      return { status: 'declined', job: updatedJob.rows[0] };
    }
  }

  /**
   * Update execution status of job (in_progress, verification_pending, completed)
   */
  async updateJobExecution(
    jobId: string,
    user: JwtPayload,
    body: { status: 'in_progress' | 'verification_pending' | 'completed'; notes?: string }
  ) {
    const vendorId = await this.getVendorIdForUser(user);

    const assignRes = await query(
      `SELECT * FROM job_assignments WHERE job_id = $1 AND vendor_id = $2 LIMIT 1`,
      [jobId, vendorId]
    );
    if (assignRes.rows.length === 0) {
      throw new ForbiddenException('Job is not assigned to this vendor');
    }

    const jobRes = await query(`SELECT * FROM jobs WHERE id = $1`, [jobId]);
    if (jobRes.rows.length === 0) throw new NotFoundException('Job not found');
    const job = jobRes.rows[0];

    // If moving to completed / verification_pending, check if evidence exists
    if (body.status === 'verification_pending' || body.status === 'completed') {
      const evCheck = await query(`SELECT count(*) as count FROM job_evidence WHERE job_id = $1`, [jobId]);
      const count = parseInt(evCheck.rows[0].count, 10);
      if (count === 0 && !body.notes) {
        throw new BadRequestException('Completion evidence (photo or notes) must be provided before marking complete');
      }
    }

    if (body.status === 'completed' || body.status === 'verification_pending') {
      await query(`UPDATE job_assignments SET completed_at = now() WHERE id = $1`, [assignRes.rows[0].id]);
    }

    const updatedJob = await query(
      `UPDATE jobs SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [body.status, jobId]
    );

    await this.auditService.recordEvent({
      actorType: 'vendor',
      actorUserId: user.sub,
      targetType: 'job',
      targetId: jobId,
      category: 'task',
      eventType: `task.execution_${body.status}`,
      summary: `Vendor updated execution status of Job ${job.job_code} to ${body.status}`,
      metadata: { vendorId, newStatus: body.status, notes: body.notes },
    });

    return updatedJob.rows[0];
  }
}
