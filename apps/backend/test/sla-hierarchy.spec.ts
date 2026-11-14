import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksService } from '../src/tasks/tasks.service';
import { TaskPolicyService } from '../src/tasks/task-policy.service';
import * as db from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
}));

describe('SLA Hierarchy & Clock Inheritance (V9-02 Regression Tests)', () => {
  let tasksService: TasksService;
  let auditServiceMock: any;
  let taskPolicyMock: TaskPolicyService;

  const mockUser: JwtPayload = {
    sub: 'pm-user-1',
    email: 'pm@lookara.test',
    fullName: 'Test PM',
    activePortal: 'pm',
    activeOrganizationId: 'org-1-uuid',
    activeRole: 'admin',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.query).mockReset();
    auditServiceMock = { recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }) };
    taskPolicyMock = new TaskPolicyService();
    tasksService = new TasksService(auditServiceMock, taskPolicyMock);
  });

  it('correctly resolves 5-tier clock-by-clock inheritance matching client test case', async () => {
    // Client test case:
    // Base: Response 60, Arrival 120, Completion 480, Escalation 60
    // Market: Arrival 90
    // Org: Response 30
    // Property: Completion 300
    // Task Override: Escalation 20
    // Final Resolved SLA: Response 30 / Arrival 90 / Completion 300 / Escalation 20
    vi.mocked(db.query)
      // 0. Active membership check (Finding #1)
      .mockResolvedValueOnce({ rows: [{ role: 'admin', status: 'active' }] } as any)
      // 1. Property validation
      .mockResolvedValueOnce({ rows: [{ id: 'prop-1' }] } as any)
      // 2. Insert job
      .mockResolvedValueOnce({
        rows: [{
          id: 'task-5tier-1',
          job_code: 'JOB-SLA-5TIER',
          organization_id: 'org-1-uuid',
          property_id: 'prop-1',
          severity: 'high',
          title: '5-Tier SLA Test',
        }],
      } as any)
      // 3. Base SLA query (Level 1)
      .mockResolvedValueOnce({
        rows: [{
          id: 'sla-base-id',
          acknowledge_mins: 60,
          arrival_mins: 120,
          completion_mins: 480,
          escalation_mins: 60,
          verification_mins: 120,
        }],
      } as any)
      // 4. Property market query (Level 2)
      .mockResolvedValueOnce({ rows: [{ market: 'SouthFlorida', city: 'Miami' }] } as any)
      // 5. Market SLA query
      .mockResolvedValueOnce({
        rows: [{
          id: 'sla-market-id',
          arrival_mins: 90, // Market overrides arrival to 90
        }],
      } as any)
      // 6. Organization SLA query (Level 3)
      .mockResolvedValueOnce({
        rows: [{
          id: 'sla-org-id',
          acknowledge_mins: 30, // Org overrides response to 30
        }],
      } as any)
      // 7. Property SLA override query (Level 4)
      .mockResolvedValueOnce({
        rows: [{
          id: 'sla-prop-id',
          completion_mins: 300, // Property overrides completion to 300
        }],
      } as any)
      // 8. Insert job SLA snapshot
      .mockResolvedValueOnce({ rows: [] } as any);

    await tasksService.create(mockUser, {
      propertyId: 'prop-1',
      tradeCode: 'HVAC',
      workflowClass: 'maintenance',
      severity: 'high',
      source: 'pm_portal',
      title: '5-Tier SLA Test',
      serviceType: 'repair',
      slaOverride: {
        escalationMins: 20, // Task overrides escalation to 20
      },
    });

    const snapshotCall = vi.mocked(db.query).mock.calls[8];
    expect(snapshotCall).toBeDefined();
    expect(snapshotCall[1][7]).toBe('task_override'); // resolved_tier

    const now = Date.now();
    const ackTarget = new Date(snapshotCall[1][2]).getTime();
    const arrTarget = new Date(snapshotCall[1][3]).getTime();
    const compTarget = new Date(snapshotCall[1][4]).getTime();
    const escTarget = new Date(snapshotCall[1][6]).getTime();

    const diffAck = Math.round((ackTarget - now) / 60000);
    const diffArr = Math.round((arrTarget - now) / 60000);
    const diffComp = Math.round((compTarget - now) / 60000);
    const diffEsc = Math.round((escTarget - now) / 60000);

    // Assert the exact client requirements:
    // Response: 30 (Org)
    // Arrival: 90 (Market)
    // Completion: 300 (Property)
    // Escalation: 20 (Task Override)
    expect(diffAck).toBe(30);
    expect(diffArr).toBe(90);
    expect(diffComp).toBe(300);
    expect(diffEsc).toBe(20);
  });

  it('inherits unspecified clocks through nullish coalescing (??) when task override specifies only arrival', async () => {
    vi.mocked(db.query)
      // 0. Active membership check
      .mockResolvedValueOnce({ rows: [{ role: 'admin', status: 'active' }] } as any)
      // 1. Property check
      .mockResolvedValueOnce({ rows: [{ id: 'prop-1' }] } as any)
      // 2. Insert job
      .mockResolvedValueOnce({
        rows: [{
          id: 'task-override-1',
          job_code: 'JOB-SLA-1',
          organization_id: 'org-1-uuid',
          property_id: 'prop-1',
          severity: 'high',
          title: 'Roof Repair',
        }],
      } as any)
      // 3. Base SLA query
      .mockResolvedValueOnce({ rows: [] } as any)
      // 4. Property market query
      .mockResolvedValueOnce({ rows: [{ market: 'Orlando', city: 'Orlando' }] } as any)
      // 5. Market SLA query
      .mockResolvedValueOnce({ rows: [] } as any)
      // 6. Org SLA query
      .mockResolvedValueOnce({ rows: [] } as any)
      // 7. Property SLA query
      .mockResolvedValueOnce({ rows: [] } as any)
      // 8. Insert SLA Snapshot
      .mockResolvedValueOnce({ rows: [] } as any);

    // Override only arrivalMins = 45; acknowledgeMins, completionMins, escalationMins should inherit high baseline defaults
    await tasksService.create(mockUser, {
      propertyId: 'prop-1',
      tradeCode: 'ROOF',
      workflowClass: 'maintenance',
      severity: 'high',
      source: 'pm_portal',
      title: 'Roof Repair',
      serviceType: 'repair',
      slaOverride: {
        arrivalMins: 45, // Only arrival overridden!
      },
    });

    const snapshotCall = vi.mocked(db.query).mock.calls[8];
    expect(snapshotCall[1][7]).toBe('task_override'); // resolved_tier

    const now = Date.now();
    const ackTarget = new Date(snapshotCall[1][2]).getTime();
    const arrTarget = new Date(snapshotCall[1][3]).getTime();
    const compTarget = new Date(snapshotCall[1][4]).getTime();
    const escTarget = new Date(snapshotCall[1][6]).getTime();

    // High baseline: ack = 30m, comp = 480m, esc = 60m. Overridden: arr = 45m.
    const diffAck = Math.round((ackTarget - now) / 60000);
    const diffArr = Math.round((arrTarget - now) / 60000);
    const diffComp = Math.round((compTarget - now) / 60000);
    const diffEsc = Math.round((escTarget - now) / 60000);

    expect(diffArr).toBe(45);
    expect(diffAck).toBe(30);
    expect(diffComp).toBe(480);
    expect(diffEsc).toBe(60);
  });

  it('uniquely scopes Lookara Base default template (organization_id IS NULL AND market IS NULL)', async () => {
    vi.mocked(db.query)
      // 0. Active membership check
      .mockResolvedValueOnce({ rows: [{ role: 'admin', status: 'active' }] } as any)
      // 1. Property check
      .mockResolvedValueOnce({ rows: [{ id: 'prop-1' }] } as any)
      // 2. Insert job
      .mockResolvedValueOnce({
        rows: [{
          id: 'task-base-1',
          job_code: 'JOB-SLA-2',
          organization_id: 'org-1-uuid',
          property_id: 'prop-1',
          severity: 'critical',
          title: 'Emergency Power Loss',
        }],
      } as any)
      // 3. Base template query
      .mockResolvedValueOnce({
        rows: [{
          id: 'sla-base-uuid',
          organization_id: null,
          market: null,
          severity: 'critical',
          acknowledge_mins: 10,
          arrival_mins: 40,
          completion_mins: 120,
          escalation_mins: 20,
          verification_mins: 60,
        }],
      } as any)
      // 4. Property market query
      .mockResolvedValueOnce({ rows: [{ market: 'Orlando', city: 'Orlando' }] } as any)
      // 5. No market SLA
      .mockResolvedValueOnce({ rows: [] } as any)
      // 6. No org SLA
      .mockResolvedValueOnce({ rows: [] } as any)
      // 7. No property override
      .mockResolvedValueOnce({ rows: [] } as any)
      // 8. Insert SLA snapshot
      .mockResolvedValueOnce({ rows: [] } as any);

    await tasksService.create(mockUser, {
      propertyId: 'prop-1',
      tradeCode: 'ELEC',
      workflowClass: 'emergency',
      severity: 'critical',
      source: 'pm_portal',
      title: 'Emergency Power Loss',
      serviceType: 'emergency',
    });

    // Check base template query SQL
    const baseQueryCall = vi.mocked(db.query).mock.calls[3];
    expect(baseQueryCall[0]).toMatch(/organization_id IS NULL AND market IS NULL/i);
    expect(baseQueryCall[0]).not.toMatch(/organization_id IS NULL OR market IS NULL/i);

    const snapshotCall = vi.mocked(db.query).mock.calls[8];
    expect(snapshotCall[1][1]).toBe('sla-base-uuid');
    expect(snapshotCall[1][7]).toBe('lookara_base');
  });

  it('guarantees tenant safety for market-level templates by querying organization_id IS NULL (Finding #6)', async () => {
    vi.mocked(db.query)
      .mockResolvedValueOnce({ rows: [{ role: 'admin', status: 'active' }] } as any) // Membership
      .mockResolvedValueOnce({ rows: [{ id: 'prop-1' }] } as any) // Property check
      .mockResolvedValueOnce({
        rows: [{
          id: 'task-market-safe',
          job_code: 'JOB-MKT-SAFE',
          organization_id: 'org-1-uuid',
          property_id: 'prop-1',
          severity: 'medium',
          title: 'Market Isolation Test',
        }],
      } as any) // Insert job
      .mockResolvedValueOnce({ rows: [] } as any) // Base template
      .mockResolvedValueOnce({ rows: [{ market: 'Austin', city: 'Austin' }] } as any) // Property market query
      .mockResolvedValueOnce({
        rows: [{
          id: 'sla-austin-platform',
          market: 'Austin',
          severity: 'medium',
          arrival_mins: 180,
        }],
      } as any) // Market SLA
      .mockResolvedValueOnce({ rows: [] } as any) // Org SLA
      .mockResolvedValueOnce({ rows: [] } as any) // Prop override
      .mockResolvedValueOnce({ rows: [] } as any); // Snapshot

    await tasksService.create(mockUser, {
      propertyId: 'prop-1',
      tradeCode: 'PLUMB',
      workflowClass: 'maintenance',
      severity: 'medium',
      source: 'pm_portal',
      title: 'Market Isolation Test',
      serviceType: 'repair',
    });

    // Check market template query SQL includes AND organization_id IS NULL
    const marketQueryCall = vi.mocked(db.query).mock.calls[5];
    expect(marketQueryCall[0]).toMatch(/market\s*=\s*\$1\s+AND\s+organization_id\s+IS\s+NULL/i);
  });
});
