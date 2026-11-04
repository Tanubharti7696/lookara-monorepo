import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksService } from '../src/tasks/tasks.service';
import { TaskPolicyService } from '../src/tasks/task-policy.service';
import * as db from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
}));

describe('SLA Hierarchy & Clock Inheritance (SLA-06 Regression Tests)', () => {
  let tasksService: TasksService;
  let auditServiceMock: any;
  let taskPolicyMock: any;

  const mockUser: JwtPayload = {
    sub: 'user-pm-uuid',
    email: 'pm@orga.com',
    fullName: 'PM User',
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
    auditServiceMock = { recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }) };
    taskPolicyMock = new TaskPolicyService();
    tasksService = new TasksService(auditServiceMock, taskPolicyMock);
  });

  it('inherits unspecified clocks through nullish coalescing (??) when task override specifies only arrival', async () => {
    // 1. Property check
    vi.mocked(db.query)
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
      // 3. Insert SLA Snapshot
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

    const snapshotCall = vi.mocked(db.query).mock.calls[2];
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
      .mockResolvedValueOnce({ rows: [{ id: 'prop-1' }] } as any) // Property check
      .mockResolvedValueOnce({
        rows: [{
          id: 'task-base-1',
          job_code: 'JOB-SLA-2',
          organization_id: 'org-1-uuid',
          property_id: 'prop-1',
          severity: 'critical',
          title: 'Emergency Power Loss',
        }],
      } as any) // Insert job
      .mockResolvedValueOnce({ rows: [] } as any) // No property override
      .mockResolvedValueOnce({ rows: [{ market: 'Orlando', city: 'Orlando' }] } as any) // Property market query
      .mockResolvedValueOnce({ rows: [] } as any) // No market SLA
      .mockResolvedValueOnce({ rows: [] } as any) // No org SLA
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
      } as any) // Base template query
      .mockResolvedValueOnce({ rows: [] } as any); // Insert SLA snapshot

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
    const baseQueryCall = vi.mocked(db.query).mock.calls[6];
    expect(baseQueryCall[0]).toMatch(/organization_id IS NULL AND market IS NULL/i);
    expect(baseQueryCall[0]).not.toMatch(/organization_id IS NULL OR market IS NULL/i);

    const snapshotCall = vi.mocked(db.query).mock.calls[7];
    expect(snapshotCall[1][1]).toBe('sla-base-uuid');
    expect(snapshotCall[1][7]).toBe('lookara_base');
  });
});
