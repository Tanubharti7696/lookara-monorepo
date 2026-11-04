import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskPolicyService, TaskEntity } from '../src/tasks/task-policy.service';
import * as db from '@lookara/database';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import type { JwtPayload } from '@lookara/auth';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
}));

describe('Task Authorization & Policy (TASK-04 Regression Tests)', () => {
  let policy: TaskPolicyService;

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
    policy = new TaskPolicyService();
  });

  it('PM cannot access a task belonging to another organization (403 Forbidden)', async () => {
    await expect(
      policy.authorize(pmUserOtherOrg, sampleTask, 'view')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Viewer role is denied verification and cancellation operations (403 Forbidden)', async () => {
    await expect(
      policy.authorize(viewerUser, sampleTask, 'pm_verify')
    ).rejects.toThrow(ForbiddenException);

    await expect(
      policy.authorize(viewerUser, sampleTask, 'cancel')
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
});
