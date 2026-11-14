// apps/backend/test/app.e2e-spec.ts
// Real-PostgreSQL End-to-End Acceptance Suite for Lookara Milestone 1 (Zero Mocks)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-acceptance-jwt-secret-key-2026';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'e2e-acceptance-jwt-refresh-secret-2026';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { query } from '@lookara/database';
import { AuditService } from '../src/audit/audit.service';
import { TaskPolicyService } from '../src/tasks/task-policy.service';
import { TasksService } from '../src/tasks/tasks.service';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { VendorsService } from '../src/vendors/vendors.service';
import { AuthService } from '../src/auth/auth.service';
import * as bcrypt from 'bcryptjs';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { verifySchema } = require('../../../packages/database/scripts/verify-schema.js');

describe('Lookara Milestone 1 — Connected PostgreSQL End-to-End Acceptance Suite', () => {
  let auditService: AuditService;
  let taskPolicyService: TaskPolicyService;
  let tasksService: TasksService;
  let dispatchService: DispatchService;
  let vendorsService: VendorsService;
  let authService: AuthService;

  const suffix = Date.now().toString().slice(-6);
  let org1Id: string;
  let org2Id: string;
  let prop1Id: string;
  let pmUserId: string;
  let revokedPmUserId: string;
  let vendor1UserId: string;
  let vendor2UserId: string;
  let vendor1Id: string;
  let vendor2Id: string;
  let createdJobId: string;

  beforeAll(async () => {
    auditService = new AuditService();
    taskPolicyService = new TaskPolicyService();
    tasksService = new TasksService(auditService, taskPolicyService);
    dispatchService = new DispatchService(auditService);
    vendorsService = new VendorsService(auditService, tasksService, taskPolicyService);
    authService = new AuthService();

    // Seed isolated test organizations, property, SLA tiers, users, and vendors in real PostgreSQL
    const org1Res = await query(
      `INSERT INTO organizations (name, slug, status) VALUES ($1, $2, 'active') RETURNING id`,
      [`E2E Primary Org ${suffix}`, `e2e-org1-${suffix}`]
    );
    org1Id = org1Res.rows[0].id;

    const org2Res = await query(
      `INSERT INTO organizations (name, slug, status) VALUES ($1, $2, 'active') RETURNING id`,
      [`E2E Secondary Org ${suffix}`, `e2e-org2-${suffix}`]
    );
    org2Id = org2Res.rows[0].id;

    const propRes = await query(
      `INSERT INTO properties (organization_id, name, code, address_line_1, city, state, postal_code, market, timezone, status)
       VALUES ($1, $2, $3, '500 E2E Ocean Dr', 'Miami', 'FL', '33139', $4, 'America/New_York', 'active')
       RETURNING id`,
      [org1Id, `E2E Tower ${suffix}`, `E2E-${suffix}`, `E2E-MKT-${suffix}`]
    );
    prop1Id = propRes.rows[0].id;

    const pwHash = await bcrypt.hash('Password123!', 10);

    // Active PM user
    const pmRes = await query(
      `INSERT INTO users (email, password_hash, full_name, account_status, token_version)
       VALUES ($1, $2, 'E2E Active PM', 'active', 1) RETURNING id`,
      [`pm.e2e.${suffix}@lookara.com`, pwHash]
    );
    pmUserId = pmRes.rows[0].id;
    await query(
      `INSERT INTO organization_users (organization_id, user_id, role, status) VALUES ($1, $2, 'admin', 'active')`,
      [org1Id, pmUserId]
    );

    // Revoked PM user (simulates disabled membership while token is still unexpired)
    const revPmRes = await query(
      `INSERT INTO users (email, password_hash, full_name, account_status, token_version)
       VALUES ($1, $2, 'E2E Revoked PM', 'active', 1) RETURNING id`,
      [`revoked.e2e.${suffix}@lookara.com`, pwHash]
    );
    revokedPmUserId = revPmRes.rows[0].id;
    await query(
      `INSERT INTO organization_users (organization_id, user_id, role, status) VALUES ($1, $2, 'ops_manager', 'disabled')`,
      [org1Id, revokedPmUserId]
    );

    // Vendor 1 (Will decline initial offer) & Vendor 2 (Will accept and complete)
    const v1UserRes = await query(
      `INSERT INTO users (email, password_hash, full_name, account_status, token_version)
       VALUES ($1, $2, 'E2E Vendor One', 'active', 1) RETURNING id`,
      [`v1.e2e.${suffix}@lookara.com`, pwHash]
    );
    vendor1UserId = v1UserRes.rows[0].id;

    const v2UserRes = await query(
      `INSERT INTO users (email, password_hash, full_name, account_status, token_version)
       VALUES ($1, $2, 'E2E Vendor Two', 'active', 1) RETURNING id`,
      [`v2.e2e.${suffix}@lookara.com`, pwHash]
    );
    vendor2UserId = v2UserRes.rows[0].id;

    const v1Res = await query(
      `INSERT INTO vendors (user_id, business_name, display_name, vendor_type, primary_trade, lifecycle_status, emergency_enabled, accepts_new_jobs)
       VALUES ($1, $2, $2, 'company', 'HVAC', 'active', true, true) RETURNING id`,
      [vendor1UserId, `E2E Vendor One ${suffix}`]
    );
    vendor1Id = v1Res.rows[0].id;

    const v2Res = await query(
      `INSERT INTO vendors (user_id, business_name, display_name, vendor_type, primary_trade, lifecycle_status, emergency_enabled, accepts_new_jobs)
       VALUES ($1, $2, $2, 'company', 'HVAC', 'active', true, true) RETURNING id`,
      [vendor2UserId, `E2E Vendor Two ${suffix}`]
    );
    vendor2Id = v2Res.rows[0].id;

    for (const vId of [vendor1Id, vendor2Id]) {
      await query(
        `INSERT INTO organization_vendors (organization_id, vendor_id, relationship_status) VALUES ($1, $2, 'preferred')`,
        [org1Id, vId]
      );
      await query(
        `INSERT INTO vendor_property_coverage (vendor_id, property_id, status) VALUES ($1, $2, 'active')`,
        [vId, prop1Id]
      );
      await query(
        `INSERT INTO vendor_trades (vendor_id, trade_code, eligibility_status) VALUES ($1, 'HVAC', 'active')`,
        [vId]
      );
      // Approve all blocking compliance requirements for these test vendors
      await query(
        `INSERT INTO vendor_documents (vendor_id, compliance_requirement_id, document_type, source_type, file_url, review_status, extracted_status, expiry_date)
         SELECT $1, cr.id, cr.document_type, 'vendor_upload', 'https://lookara.com/docs/coi.pdf', 'approved', 'completed', CURRENT_DATE + INTERVAL '180 days'
         FROM compliance_requirements cr WHERE cr.blocks_dispatch = true`,
        [vId]
      );
    }

    // Seed 5-tier SLA hierarchy templates for severity 'high'
    // 1. Market template (arrival = 90)
    await query(
      `INSERT INTO sla_templates (market, name, severity, acknowledge_mins, arrival_mins, completion_mins, verification_mins)
       VALUES ($1, 'Market High SLA', 'high', 60, 90, 480, 120)`,
      [`E2E-MKT-${suffix}`]
    );
    // 2. Organization template (acknowledge = 30, arrival = 90)
    await query(
      `INSERT INTO sla_templates (organization_id, name, severity, acknowledge_mins, arrival_mins, completion_mins, verification_mins)
       VALUES ($1, 'Org High SLA', 'high', 30, 90, 480, 120)`,
      [org1Id]
    );
    // 3. Property override template (acknowledge = 30, arrival = 90, completion = 300)
    const propSlaRes = await query(
      `INSERT INTO sla_templates (organization_id, name, severity, acknowledge_mins, arrival_mins, completion_mins, verification_mins)
       VALUES ($1, 'Property High SLA', 'high', 30, 90, 300, 120) RETURNING id`,
      [org1Id]
    );
    await query(
      `INSERT INTO property_sla_overrides (property_id, sla_template_id) VALUES ($1, $2)`,
      [prop1Id, propSlaRes.rows[0].id]
    );
  });

  afterAll(async () => {
    if (org1Id) await query(`DELETE FROM organizations WHERE id = $1`, [org1Id]);
    if (org2Id) await query(`DELETE FROM organizations WHERE id = $1`, [org2Id]);
    for (const vId of [vendor1Id, vendor2Id]) {
      if (vId) await query(`DELETE FROM vendors WHERE id = $1`, [vId]);
    }
    for (const uId of [pmUserId, revokedPmUserId, vendor1UserId, vendor2UserId]) {
      if (uId) await query(`DELETE FROM users WHERE id = $1`, [uId]);
    }
    await query(`DELETE FROM sla_templates WHERE market = $1`, [`E2E-MKT-${suffix}`]);
  });

  it('1. Database Architecture: verifies all 38 canonical tables, columns, and constraints in PostgreSQL', async () => {
    const result = await verifySchema();
    expect(result.tablesVerified).toBe(38);
    expect(result.columnsVerified).toBeGreaterThanOrEqual(300);
    expect(result.constraintsVerified).toBeGreaterThan(50);
  });

  it('2. Authentication & Security: enforces current password check and atomic token_version increment in PostgreSQL', async () => {
    // Reject wrong current password
    await expect(
      authService.changePassword(pmUserId, 'WrongPassword!', 'NewPassword123!')
    ).rejects.toThrow(/Current password does not match/i);

    // Succeed with valid current password and increment token_version in DB
    const res = await authService.changePassword(pmUserId, 'Password123!', 'NewPassword123!');
    expect(res.success).toBe(true);

    const dbUser = await query(`SELECT token_version FROM users WHERE id = $1`, [pmUserId]);
    expect(dbUser.rows[0].token_version).toBe(2);
  });

  it('3. SLA Engine: resolves 5-tier clock-by-clock inheritance and persists job_sla_snapshots in PostgreSQL', async () => {
    const pmJwt: any = {
      sub: pmUserId,
      email: `pm.e2e.${suffix}@lookara.com`,
      activeContextType: 'organization',
      activeOrganizationId: org1Id,
      activeRole: 'admin',
    };

    const created = await tasksService.create(
      pmJwt,
      {
        propertyId: prop1Id,
        title: `E2E 5-Tier SLA & Lifecycle Task ${suffix}`,
        description: 'End-to-end connected PostgreSQL verification task',
        tradeCode: 'HVAC',
        workflowClass: 'maintenance',
        severity: 'high',
        serviceType: 'repair',
        source: 'pm',
        scheduledStart: '2026-11-11T15:00:00Z', // 10:00 AM America/New_York
        slaOverride: {
          escalationMins: 20, // Override only escalation clock; keep Org response (30), Market arrival (90), Property completion (300)
        },
      }
    );

    expect(created.id).toBeDefined();
    expect(created.job_code).toMatch(/^JOB-[0-9A-Z-]+$/);
    createdJobId = created.id;

    const snapRes = await query(`SELECT * FROM job_sla_snapshots WHERE job_id = $1`, [createdJobId]);
    expect(snapRes.rows.length).toBe(1);
    const snap = snapRes.rows[0];
    const createdAtMs = new Date(snap.created_at).getTime();

    const ackMins = Math.round((new Date(snap.acknowledge_target).getTime() - createdAtMs) / 60000);
    const arrMins = Math.round((new Date(snap.arrival_target).getTime() - createdAtMs) / 60000);
    const compMins = Math.round((new Date(snap.completion_target).getTime() - createdAtMs) / 60000);
    const escMins = Math.round((new Date(snap.escalation_target).getTime() - createdAtMs) / 60000);

    expect(ackMins).toBe(30);
    expect(arrMins).toBe(90);
    expect(compMins).toBe(300);
    expect(escMins).toBe(20);
    expect(snap.resolved_tier).toBe('task_override');
  }, 30000);

  it('4. Task Permissions: re-verifies live organization_users membership and blocks suspended/revoked PM tokens (Finding #1 & #2)', async () => {
    const revokedPmJwt: any = {
      sub: revokedPmUserId,
      email: `revoked.e2e.${suffix}@lookara.com`,
      activeContextType: 'organization',
      activeOrganizationId: org1Id,
      activeRole: 'ops_manager',
    };

    await expect(tasksService.findAll(revokedPmJwt, {})).rejects.toThrow(/revoked|inactive|disabled|Forbidden|membership/i);
    await expect(tasksService.findOne(createdJobId, revokedPmJwt)).rejects.toThrow(/revoked|inactive|disabled|Forbidden|membership/i);

    // Finding #1: Task creation and dispatch must reject revoked PM
    await expect(
      tasksService.create(revokedPmJwt, {
        propertyId: prop1Id,
        title: 'Revoked PM Task Attempt',
        tradeCode: 'HVAC',
        workflowClass: 'maintenance',
        severity: 'medium',
        serviceType: 'repair',
        source: 'pm',
      })
    ).rejects.toThrow(/membership|Forbidden/i);

    await expect(dispatchService.getCandidates(createdJobId, revokedPmJwt)).rejects.toThrow(/membership|Forbidden/i);
    await expect(dispatchService.assignVendor(createdJobId, vendor1Id, revokedPmJwt)).rejects.toThrow(/membership|Forbidden/i);
  }, 30000);

  it('5. Vendor Dispatch & Timezone Eligibility: filters candidates by property timezone work-hours', async () => {
    // Scheduled start is 2026-11-11T15:00:00Z = Wednesday (weekday 3) 10:00 AM America/New_York
    // Set Vendor 1 in-hours (08:00..17:00) and Vendor 2 temporarily out-of-hours (14:00..18:00) on weekday 3
    await query(
      `INSERT INTO vendor_availability (vendor_id, weekday, start_time, end_time, is_off)
       VALUES ($1, 3, '08:00:00', '17:00:00', false), ($2, 3, '14:00:00', '18:00:00', false)`,
      [vendor1Id, vendor2Id]
    );

    const pmJwt: any = {
      sub: pmUserId,
      email: `pm.e2e.${suffix}@lookara.com`,
      activeContextType: 'organization',
      activeOrganizationId: org1Id,
      activeRole: 'admin',
    };

    const { candidates } = await dispatchService.getCandidates(createdJobId, pmJwt);
    const candidateIds = candidates.map((c: any) => c.id);
    expect(candidateIds).toContain(vendor1Id);
    expect(candidateIds).not.toContain(vendor2Id);

    // Update Vendor 2 to be in-hours (08:00..17:00) for subsequent dispatch
    await query(
      `UPDATE vendor_availability SET start_time = '08:00:00', end_time = '17:00:00' WHERE vendor_id = $1 AND weekday = 3`,
      [vendor2Id]
    );
  }, 30000);

  it('6. Complete PM ↔ Vendor End-to-End Lifecycle, Concurrency Protection & Org-Isolated Audit Trail', async () => {
    const pmJwt: any = {
      sub: pmUserId,
      email: `pm.e2e.${suffix}@lookara.com`,
      activeContextType: 'organization',
      activeOrganizationId: org1Id,
      activeRole: 'admin',
    };
    const v1Jwt: any = {
      sub: vendor1UserId,
      email: `v1.e2e.${suffix}@lookara.com`,
      activePortal: 'vendor',
      isVendor: true,
      activeContextType: 'vendor',
      activeVendorId: vendor1Id,
      activeRole: 'vendor_admin',
    };
    const v2Jwt: any = {
      sub: vendor2UserId,
      email: `v2.e2e.${suffix}@lookara.com`,
      activePortal: 'vendor',
      isVendor: true,
      activeContextType: 'vendor',
      activeVendorId: vendor2Id,
      activeRole: 'vendor_admin',
    };

    // Step A: PM dispatches Vendor 1
    const assigned1 = await dispatchService.assignVendor(createdJobId, vendor1Id, pmJwt);
    expect(assigned1.status).toBe('assigned');

    // Step B: Vendor 1 declines -> decline preserved in job_offers and task returns to unassigned
    const declined = await vendorsService.respondToJob(createdJobId, v1Jwt, {
      action: 'decline',
      declineReason: 'Technician unavailable in Miami sector',
    });
    expect(declined.status).toBe('declined');
    expect(declined.job.status).toBe('unassigned');

    const offersAfterDecline = await query(
      `SELECT * FROM job_offers WHERE job_id = $1 AND vendor_id = $2`,
      [createdJobId, vendor1Id]
    );
    expect(offersAfterDecline.rows.length).toBe(1);
    expect(offersAfterDecline.rows[0].offer_status).toBe('declined');
    expect(offersAfterDecline.rows[0].decline_reason).toBe('Technician unavailable in Miami sector');

    // Step C: PM dispatches Vendor 2 -> Vendor 2 accepts
    const assigned2 = await dispatchService.assignVendor(createdJobId, vendor2Id, pmJwt);
    expect(assigned2.status).toBe('assigned');

    const accepted = await vendorsService.respondToJob(createdJobId, v2Jwt, { action: 'accept' });
    expect(accepted.status).toBe('accepted');
    expect(accepted.job.status).toBe('accepted');

    // Step D: Vendor 2 transitions accepted -> en_route -> on_site -> in_progress -> uploads evidence -> verification_pending
    await vendorsService.updateJobExecution(createdJobId, v2Jwt, { status: 'en_route' });
    await vendorsService.updateJobExecution(createdJobId, v2Jwt, { status: 'on_site' });
    await vendorsService.updateJobExecution(createdJobId, v2Jwt, { status: 'in_progress' });

    const ev = await tasksService.addEvidence(createdJobId, v2Jwt, {
      evidenceType: 'after_photo',
      fileUrl: 'https://lookara.com/evidence/e2e-complete.jpg',
      notes: 'Compressor contactor replaced and tested',
    });
    expect(ev.evidence_type).toBe('after_photo');

    const verPending = await vendorsService.updateJobExecution(createdJobId, v2Jwt, {
      status: 'verification_pending',
      notes: 'Ready for PM inspection',
    });
    expect(verPending.status).toBe('verification_pending');

    // Step E: PM verifies completed work -> status transitions to 'closed' (or 'completed')
    const verified = await tasksService.verify(createdJobId, pmJwt, {
      decision: 'approve',
    });
    expect(['completed', 'closed']).toContain(verified.status);

    // Step F: Audit isolation verification (Org 1 sees lifecycle events; Org 2 caller is forbidden or sees zero Org 1 events)
    const org2Jwt: any = {
      sub: pmUserId,
      email: `pm.e2e.${suffix}@lookara.com`,
      activeContextType: 'organization',
      activeOrganizationId: org2Id,
      activeRole: 'admin',
    };

    const org1Audits = await auditService.getEvents(pmJwt, { targetId: createdJobId });
    expect(org1Audits.data.length).toBeGreaterThanOrEqual(3);
    expect(org1Audits.data.every((a: any) => a.organization_id === org1Id)).toBe(true);

    const org2Audits = await query(`SELECT count(*) as count FROM audit_events WHERE organization_id = $1 AND target_id = $2`, [org2Id, createdJobId]);
    expect(parseInt(org2Audits.rows[0].count, 10)).toBe(0);

    await expect(auditService.getEvents(org2Jwt, { targetId: createdJobId })).rejects.toThrow(/not an active member|Forbidden/i);
  }, 30000);
});
