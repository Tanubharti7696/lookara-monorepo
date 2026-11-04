import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/auth/auth.service';
import * as db from '@lookara/database';
import * as authPkg from '@lookara/auth';
import { UnauthorizedException } from '@nestjs/common';

vi.mock('@lookara/database', () => ({
  query: vi.fn(),
}));

vi.mock('@lookara/auth', () => ({
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  getDefaultPortal: vi.fn(),
}));

describe('AuthService (AUTH-01 Regression Tests)', () => {
  let service: AuthService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-long!';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-32-chars!';
    vi.clearAllMocks();
    service = new AuthService();
  });

  it('unknown account must return Unauthorized with SELECT only (no auto-provisioning)', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);

    await expect(
      service.login({ email: 'pm@lookara.com', password: 'correct-password', portal: 'pm' })
    ).rejects.toThrow(UnauthorizedException);

    expect(db.query).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(db.query).mock.calls[0][0];
    expect(sql).toMatch(/FROM users WHERE lower\(email\)/);
    expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/i);
  });

  it('wrong password must not reset credentials or memberships', async () => {
    const existingUser = {
      id: 'u-1',
      full_name: 'Existing PM',
      email: 'pm@lookara.com',
      password_hash: 'stored-hash',
      account_status: 'active',
      token_version: 0,
    };
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [existingUser] } as any);
    vi.mocked(authPkg.verifyPassword).mockResolvedValueOnce(false);

    await expect(
      service.login({ email: 'pm@lookara.com', password: 'wrong-password', portal: 'pm' })
    ).rejects.toThrow(UnauthorizedException);

    expect(db.query).toHaveBeenCalledTimes(1);
    const sql = vi.mocked(db.query).mock.calls[0][0];
    expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/i);
    expect(authPkg.hashPassword).not.toHaveBeenCalled();
  });

  it('valid login still works and does not modify user records or grant memberships', async () => {
    const existingUser = {
      id: 'u-1',
      full_name: 'Existing PM',
      email: 'pm@lookara.com',
      password_hash: 'stored-hash',
      account_status: 'active',
      token_version: 0,
    };
    // 1. SELECT user
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [existingUser] } as any);
    vi.mocked(authPkg.verifyPassword).mockResolvedValueOnce(true);
    // 2. resolveUserContext: memberships
    vi.mocked(db.query).mockResolvedValueOnce({
      rows: [{
        organization_id: 'org-1',
        organization_name: 'Test Org',
        organization_slug: 'test-org',
        role: 'admin',
        status: 'active'
      }]
    } as any);
    // 3. resolveUserContext: owner check
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);
    // 4. resolveUserContext: vendor check
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);
    // 5. resolveUserContext: platform admin check
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);
    // 6. audit event insert
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [{ id: 'audit-1' }] } as any);

    vi.mocked(authPkg.signAccessToken).mockReturnValue('mock-access-token');
    vi.mocked(authPkg.signRefreshToken).mockReturnValue('mock-refresh-token');

    const result = await service.login({ email: 'pm@lookara.com', password: 'correct-password', portal: 'pm' });

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(result.user.email).toBe('pm@lookara.com');
    // Ensure no mutations to users or organization_users happened
    for (const call of vi.mocked(db.query).mock.calls) {
      const sql = call[0];
      if (/INSERT INTO/i.test(sql)) {
        expect(sql).toMatch(/audit_events/i);
      }
    }
  });
});
