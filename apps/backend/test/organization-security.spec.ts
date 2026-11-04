import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationPolicyService } from '../src/organizations/organization-policy.service';
import { OrganizationsService } from '../src/organizations/organizations.service';
import * as db from '@lookara/database';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { JwtPayload } from '@lookara/auth';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
}));

describe('Organization Authorization (ORG-02 Regression Tests)', () => {
  let policyService: OrganizationPolicyService;
  let orgsService: OrganizationsService;
  let auditServiceMock: any;

  const userA: JwtPayload = {
    sub: 'user-a-uuid',
    email: 'usera@pm.com',
    fullName: 'User A',
    activePortal: 'pm',
    activeOrganizationId: 'org-a-uuid',
    activeRole: 'admin',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  const userB_viewer: JwtPayload = {
    sub: 'user-b-uuid',
    email: 'userb@pm.com',
    fullName: 'User B',
    activePortal: 'pm',
    activeOrganizationId: 'org-a-uuid',
    activeRole: 'viewer',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    policyService = new OrganizationPolicyService();
    auditServiceMock = {
      recordEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
    orgsService = new OrganizationsService(policyService, auditServiceMock);
  });

  it('User A cannot view Organization B if not an active member (403 Forbidden)', async () => {
    // Member lookup returns empty (no membership in Org B)
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      orgsService.findOne(userA, 'org-b-uuid')
    ).rejects.toThrow(ForbiddenException);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringMatching(/FROM organization_users/i),
      ['org-b-uuid', 'user-a-uuid']
    );
  });

  it('User A cannot update Organization B if not an active member (403 Forbidden)', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      orgsService.update(userA, 'org-b-uuid', { name: 'Hacked Name' })
    ).rejects.toThrow(ForbiddenException);
  });

  it('Member with viewer role cannot manage members in Organization A (403 Forbidden)', async () => {
    // User B is active member with 'viewer' role in Org A
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ role: 'viewer', status: 'active' }],
    } as any);

    await expect(
      orgsService.addUser(userB_viewer, 'org-a-uuid', {
        email: 'newuser@pm.com',
        role: 'admin',
        fullName: 'New Admin',
      })
    ).rejects.toThrow(ForbiddenException);
  });

  it('Member with viewer role cannot remove members in Organization A (403 Forbidden)', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ role: 'viewer', status: 'active' }],
    } as any);

    await expect(
      orgsService.removeUser(userB_viewer, 'org-a-uuid', 'some-member-uuid')
    ).rejects.toThrow(ForbiddenException);
  });

  it('Authorized admin member can update organization and generates audit event', async () => {
    // 1. Policy check: active admin member
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ role: 'admin', status: 'active' }],
    } as any);
    // 2. UPDATE query
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ id: 'org-a-uuid', name: 'Updated Name', slug: 'updated-name' }],
    } as any);

    const res = await orgsService.update(userA, 'org-a-uuid', { name: 'Updated Name' });

    expect(res.name).toBe('Updated Name');
    expect(auditServiceMock.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'organization.update',
        actorUserId: 'user-a-uuid',
        targetId: 'org-a-uuid',
      })
    );
  });

  it('Platform super admin can view organization even without standard membership', async () => {
    const superAdmin: JwtPayload = {
      ...userA,
      isAdmin: true,
    };
    // 1. Policy check for platform admin: verifies org exists
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ id: 'org-b-uuid' }],
    } as any);
    // 2. findOne query
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{ id: 'org-b-uuid', name: 'Org B' }],
    } as any);

    const res = await orgsService.findOne(superAdmin, 'org-b-uuid');
    expect(res.id).toBe('org-b-uuid');
  });
});
