import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskPolicyService, TaskEntity } from '../src/tasks/task-policy.service';
import { TasksService } from '../src/tasks/tasks.service';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { AuditService } from '../src/audit/audit.service';
import * as db from '@lookara/database';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import type { JwtPayload } from '@lookara/auth';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
}));

describe('Task Authorization & Policy (Milestone 1 v10 Finding #1 & #2 Tests)', () => {
  let policy: TaskPolicyService;
  let tasksService: TasksService;
  let dispatchService: DispatchService;
  let auditService: AuditService;

  const sampleTask: TaskEntity = {
    id: 'task-100-uuid',
    job_code: 'JOB-100',
    organization_id: 'org-a-uuid',
    property_id: 'prop-1-uuid',
    status: 'assigned',
  };

  const pmUser: JwtPayload = {
    sub: 'pm-user-uuid',
    email: 'pm@orga.com',
    fullName: 'PM User',
    activePortal: 'pm',
    activeOrganizationId: 'org-a-uuid',
    activeRole: 'admin',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  const pmUserOtherOrg: JwtPayload = {
    ...pmUser,
    activeOrganizationId: 'org-b-uuid',
  };

  const viewerUser: JwtPayload = {
    ...pmUser,
    activeRole: 'viewer',
  };

  const vendorUser: JwtPayload = {
    sub: 'vendor-user-uuid',
    email: 'vendor@plumbing.com',
    fullName: 'Vendor User',
    activePortal: 'vendor',
    activeRole: 'vendor',
    isOwner: false,
    isVendor: true,
    isAdmin: false,
    allowedPortals: ['vendor'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.query).mockReset();
    policy = new TaskPolicyService();
    auditService = new AuditService();
    vi.spyOn(auditService, 'recordEvent').mockResolvedValue(undefined as any);
    tasksService = new TasksService(auditService, policy);
    dispatchService = new DispatchService(auditService);
  });

  it('PM cannot access a task belonging to another organization (403 Forbidden)', async () => {
    await expect(
      policy.authorize(pmUserOtherOrg, sampleTask, 'view')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Viewer role is denied verification and cancellation operations (403 Forbidden)', async () => {
    vi.mocked(db.query).mockResolvedValue({
      rows: [{ role: 'viewer', status: 'active' }],
    } as any);

    await expect(
      policy.authorize(viewerUser, sampleTask, 'pm_verify')
    ).rejects.toThrow(ForbiddenException);

    await expect(
      policy.authorize(viewerUser, sampleTask, 'cancel')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Viewer role is strictly denied status updates (Finding #2)', async () => {
    vi.mocked(db.query).mockResolvedValue({
      rows: [{ role: 'viewer', status: 'active' }],
    } as any);

    await expect(
      policy.authorize(viewerUser, sampleTask, 'update_status')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Database role "viewer" overrides stale admin JWT claim and blocks mutations (Finding #2)', async () => {
    // Caller has activeRole='admin' in JWT, but DB reports role='viewer'
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ role: 'viewer', status: 'active' }],
    } as any);

    await expect(
      policy.authorize(pmUser, sampleTask, 'cancel')
    ).rejects.toThrow(ForbiddenException);
  });

  it('validateTransition throws ForbiddenException if viewer attempts any status transition (Finding #2)', () => {
    expect(() => {
      policy.validateTransition('unassigned', 'assigned', 'viewer');
    }).toThrow(ForbiddenException);

    expect(() => {
      policy.validateTransition('in_progress', 'completed', 'viewer');
    }).toThrow(ForbiddenException);
  });

  it('TasksService.create rejects revoked PM membership even with valid JWT (Finding #1)', async () => {
    // organization_users check returns empty (revoked / disabled membership)
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      tasksService.create(pmUser, {
        propertyId: 'prop-1-uuid',
        tradeCode: 'PLUMB',
        workflowClass: 'maintenance',
        severity: 'medium',
        source: 'pm_portal',
        title: 'Revoked PM Task',
        serviceType: 'repair',
      })
    ).rejects.toThrow(ForbiddenException);
  });

  it('TasksService.create rejects PM with viewer role (Finding #2)', async () => {
    // organization_users returns viewer role
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ role: 'viewer', status: 'active' }],
    } as any);

    await expect(
      tasksService.create(pmUser, {
        propertyId: 'prop-1-uuid',
        tradeCode: 'PLUMB',
        workflowClass: 'maintenance',
        severity: 'medium',
        source: 'pm_portal',
        title: 'Viewer Create Attempt',
        serviceType: 'repair',
      })
    ).rejects.toThrow(ForbiddenException);
  });

  it('DispatchService.getCandidates rejects revoked PM membership (Finding #1)', async () => {
    // organization_users check returns empty
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      dispatchService.getCandidates('task-100-uuid', pmUser)
    ).rejects.toThrow(ForbiddenException);
  });

  it('DispatchService.assignVendor rejects revoked PM membership (Finding #1)', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      dispatchService.assignVendor('task-100-uuid', 'vendor-1', pmUser)
    ).rejects.toThrow(ForbiddenException);
  });

  it('DispatchService.assignVendor rejects viewer role (Finding #2)', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ role: 'viewer', status: 'active' }],
    } as any);

    await expect(
      dispatchService.assignVendor('task-100-uuid', 'vendor-1', pmUser)
    ).rejects.toThrow(ForbiddenException);
  });

  it('Vendor with no active assignment is denied task execution (403 Forbidden)', async () => {
    // 1. Vendor profile lookup succeeds
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'vendor-1-uuid' }] } as any);
    // 2. Active assignment lookup returns empty (no active assignment)
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      policy.authorize(vendorUser, sampleTask, 'vendor_execution')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Vendor cannot cancel or verify tasks even if assigned', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'vendor-1-uuid' }] } as any);
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'assign-1-uuid' }] } as any);

    await expect(
      policy.authorize(vendorUser, sampleTask, 'cancel')
    ).rejects.toThrow(ForbiddenException);

    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'vendor-1-uuid' }] } as any);
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'assign-1-uuid' }] } as any);

    await expect(
      policy.authorize(vendorUser, sampleTask, 'pm_verify')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Vendor cannot execute on closed or cancelled tasks (403 Forbidden)', async () => {
    const closedTask: TaskEntity = {
      ...sampleTask,
      status: 'closed',
    };

    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'vendor-1-uuid' }] } as any);
    // isVendorAssignedToTask queries where status NOT IN ('closed', 'cancelled'), returns empty
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      policy.authorize(vendorUser, closedTask, 'vendor_execution')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Authorized vendor with active assignment can access task', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'vendor-1-uuid' }] } as any);
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'assign-1-uuid' }] } as any);

    const res = await policy.authorize(vendorUser, sampleTask, 'vendor_execution');
    expect(res.role).toBe('vendor');
    expect(res.vendorId).toBe('vendor-1-uuid');
  });

  it('Revoked or inactive PM membership is denied access even with valid JWT claim (V9-03)', async () => {
    // Server-side organization_users check returns empty (inactive or removed)
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      policy.authorize(pmUser, sampleTask, 'view')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Platform support_admin is denied non-view task mutations (V9-04)', async () => {
    const supportAdminUser: JwtPayload = {
      ...pmUser,
      isAdmin: true,
    };
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ admin_role: 'support_admin', status: 'active' }],
    } as any);

    await expect(
      policy.authorize(supportAdminUser, sampleTask, 'pm_verify')
    ).rejects.toThrow(ForbiddenException);
  });
});
