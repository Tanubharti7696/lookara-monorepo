import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from '../src/audit/audit.service';
import * as db from '@lookara/database';
import { ForbiddenException } from '@nestjs/common';
import type { JwtPayload } from '@lookara/auth';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
}));

describe('Audit History Tenant Scoping (AUDIT-03 Regression Tests)', () => {
  let service: AuditService;

  const orgA_User: JwtPayload = {
    sub: 'user-a-uuid',
    email: 'user@orga.com',
    fullName: 'User Org A',
    activePortal: 'pm',
    activeOrganizationId: 'org-a-uuid',
    activeRole: 'admin',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  const noOrg_User: JwtPayload = {
    sub: 'user-no-org-uuid',
    email: 'user@noorg.com',
    fullName: 'User No Org',
    activePortal: 'pm',
    activeRole: 'viewer',
    isOwner: false,
    isVendor: false,
    isAdmin: false,
    allowedPortals: ['pm'],
  };

  const platformAdmin_User: JwtPayload = {
    sub: 'admin-uuid',
    email: 'superadmin@lookara.com',
    fullName: 'Platform Super Admin',
    activePortal: 'admin',
    activeRole: 'admin',
    isOwner: false,
    isVendor: false,
    isAdmin: true,
    allowedPortals: ['admin'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuditService();
  });

  it('rejects unauthenticated callers without user context', async () => {
    await expect(
      service.getEvents(null as any, {})
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects callers without active organization context', async () => {
    await expect(
      service.getEvents(noOrg_User, {})
    ).rejects.toThrow(ForbiddenException);
  });

  it('enforces tenant organization scoping on queries and counts for Org A', async () => {
    vi.mocked(db.query)
      .mockResolvedValueOnce({ rows: [{ total: '3' }] } as any) // count query
      .mockResolvedValueOnce({
        rows: [
          { id: 'event-1', summary: 'Task created in Org A', category: 'task' },
          { id: 'event-2', summary: 'Vendor assigned in Org A', category: 'dispatch' },
        ],
      } as any); // list query

    const res = await service.getEvents(orgA_User, { page: 1, pageSize: 10 });

    expect(res.meta.total).toBe(3);
    expect(res.data.length).toBe(2);

    // Verify count query contains tenant isolation
    const countSql = vi.mocked(db.query).mock.calls[0][0];
    const countParams = vi.mocked(db.query).mock.calls[0][1];
    expect(countSql).toMatch(/organization_id = \$1::uuid/i);
    expect(countParams).toContain('org-a-uuid');

    // Verify list query contains tenant isolation
    const listSql = vi.mocked(db.query).mock.calls[1][0];
    const listParams = vi.mocked(db.query).mock.calls[1][1];
    expect(listSql).toMatch(/organization_id = \$1::uuid/i);
    expect(listParams).toContain('org-a-uuid');
  });

  it('prevents Org A user from seeing Org B target events when querying with targetId', async () => {
    vi.mocked(db.query)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] } as any)
      .mockResolvedValueOnce({ rows: [] } as any);

    const res = await service.getEvents(orgA_User, { targetId: 'task-in-org-b-uuid' });

    expect(res.meta.total).toBe(0);
    expect(res.data).toEqual([]);

    // Query must intersect tenant scope with targetId
    const countSql = vi.mocked(db.query).mock.calls[0][0];
    const countParams = vi.mocked(db.query).mock.calls[0][1];
    expect(countSql).toMatch(/organization_id = \$1::uuid/i);
    expect(countSql).toMatch(/target_id = \$\d+::uuid/i);
    expect(countParams).toContain('org-a-uuid');
    expect(countParams).toContain('task-in-org-b-uuid');
  });

  it('allows platform super admin to query global audit history without single-org restriction', async () => {
    vi.mocked(db.query)
      .mockResolvedValueOnce({ rows: [{ total: '150' }] } as any)
      .mockResolvedValueOnce({ rows: [{ id: 'global-event-1' }] } as any);

    const res = await service.getEvents(platformAdmin_User, { page: 1, pageSize: 25 });

    expect(res.meta.total).toBe(150);
    const countSql = vi.mocked(db.query).mock.calls[0][0];
    expect(countSql).not.toMatch(/organization_id = \$1::uuid/i);
  });
});
