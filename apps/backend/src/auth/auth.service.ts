// apps/backend/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { query } from '@lookara/database';
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getDefaultPortal,
  type JwtPayload,
  type PortalType,
  type OrganizationMembership,
  type UserContext,
} from '@lookara/auth';
import type { LoginDto, SwitchContextDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor() {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET environment variables are required');
    }
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  /**
   * Log in user across any Lookara portal
   */
  async login(loginDto: LoginDto) {
    const { email, password, portal: requestedPortal } = loginDto;

    // 1. Fetch user by email
    const userResult = await query(
      `SELECT id, full_name, email, password_hash, phone, avatar_url, account_status, token_version
       FROM users WHERE lower(email) = lower($1)`,
      [email.trim()],
    );

    if (userResult.rows.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = userResult.rows[0];

    // 2. Check account status
    if (user.account_status === 'disabled') {
      throw new ForbiddenException('Your account has been disabled. Contact Lookara support.');
    }
    if (user.account_status === 'suspended') {
      throw new ForbiddenException('Your account has been suspended.');
    }

    // 3. Verify password
    if (!user.password_hash) {
      throw new UnauthorizedException('Password not set. Please use the invite link.');
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Resolve full authority & memberships
    const userContext = await this.resolveUserContext(user.id);

    // 5. Determine active portal & organization context
    let activePortal = requestedPortal;
    if (!activePortal || !userContext.allowedPortals.includes(activePortal)) {
      activePortal = getDefaultPortal(
        userContext.memberships,
        userContext.isOwner,
        userContext.isVendor,
        userContext.isAdmin,
      );
    }

    let activeOrgId: string | undefined;
    let activeRole: string | undefined;

    if (activePortal === 'pm' && userContext.memberships.length > 0) {
      activeOrgId = userContext.memberships[0].organizationId;
      activeRole = userContext.memberships[0].role;
    } else if (activePortal === 'admin') {
      activeRole = userContext.adminRole || 'super_admin';
    } else if (activePortal === 'vendor') {
      activeRole = 'vendor';
    } else if (activePortal === 'owner') {
      activeRole = 'owner';
    }

    // 6. Sign Tokens
    const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      fullName: user.full_name,
      activePortal,
      activeOrganizationId: activeOrgId,
      activeRole,
      isOwner: userContext.isOwner,
      isVendor: userContext.isVendor,
      isAdmin: userContext.isAdmin,
      allowedPortals: userContext.allowedPortals,
    };

    const accessToken = signAccessToken(tokenPayload, this.jwtSecret);
    const refreshToken = signRefreshToken(
      { sub: user.id, tokenVersion: user.token_version },
      this.jwtRefreshSecret,
    );

    // 7. Audit log event
    await query(
      `INSERT INTO audit_events (event_code, actor_type, actor_user_id, target_type, target_id, category, event_type, summary, metadata)
       VALUES ($1, $2, $3, 'user', $4, 'auth', 'auth.login', $5, $6)`,
      [
        `AUTH-${Date.now()}`,
        userContext.isAdmin ? 'admin' : userContext.memberships.length > 0 ? 'pm' : userContext.isVendor ? 'vendor' : 'owner',
        user.id,
        user.id,
        `User ${user.email} signed in to portal ${activePortal}`,
        JSON.stringify({ activePortal, activeOrgId }),
      ],
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        accountStatus: user.account_status,
      },
      accessToken,
      refreshToken,
      activeContext: {
        portal: activePortal,
        organizationId: activeOrgId,
        role: activeRole,
      },
      allowedPortals: userContext.allowedPortals,
      availableWorkspaces: userContext.memberships,
    };
  }

  /**
   * Refresh JWT access token with rotation
   */
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const decoded = verifyRefreshToken(refreshToken, this.jwtRefreshSecret);
      const userRes = await query(
        `SELECT id, full_name, email, account_status, token_version FROM users WHERE id = $1`,
        [decoded.sub],
      );

      if (userRes.rows.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = userRes.rows[0];

      if (user.account_status !== 'active') {
        throw new ForbiddenException('Account is not active');
      }

      if (decoded.tokenVersion && decoded.tokenVersion !== user.token_version) {
        throw new UnauthorizedException('Session expired or revoked');
      }

      const userContext = await this.resolveUserContext(user.id);
      const defaultPortal = getDefaultPortal(
        userContext.memberships,
        userContext.isOwner,
        userContext.isVendor,
        userContext.isAdmin,
      );

      const activeOrgId = userContext.memberships[0]?.organizationId;
      const activeRole = userContext.memberships[0]?.role;

      const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        sub: user.id,
        email: user.email,
        fullName: user.full_name,
        activePortal: defaultPortal,
        activeOrganizationId: activeOrgId,
        activeRole,
        isOwner: userContext.isOwner,
        isVendor: userContext.isVendor,
        isAdmin: userContext.isAdmin,
        allowedPortals: userContext.allowedPortals,
      };

      const newAccessToken = signAccessToken(tokenPayload, this.jwtSecret);
      const newRefreshToken = signRefreshToken(
        { sub: user.id, tokenVersion: user.token_version },
        this.jwtRefreshSecret,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err: any) {
      throw new UnauthorizedException(err?.message || 'Invalid refresh token');
    }
  }

  /**
   * Switch active workspace or organization context
   */
  async switchContext(userId: string, dto: SwitchContextDto) {
    const userRes = await query(`SELECT id, full_name, email, token_version FROM users WHERE id = $1`, [userId]);
    if (userRes.rows.length === 0) throw new NotFoundException('User not found');
    const user = userRes.rows[0];

    const userContext = await this.resolveUserContext(userId);

    // Verify membership in requested organization
    const targetMembership = userContext.memberships.find((m) => m.organizationId === dto.organizationId);
    if (!targetMembership && !userContext.isAdmin) {
      throw new ForbiddenException('You do not have access to this organization workspace');
    }

    const targetPortal: PortalType = dto.portal || 'pm';

    const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      fullName: user.full_name,
      activePortal: targetPortal,
      activeOrganizationId: dto.organizationId,
      activeRole: targetMembership?.role || 'admin',
      isOwner: userContext.isOwner,
      isVendor: userContext.isVendor,
      isAdmin: userContext.isAdmin,
      allowedPortals: userContext.allowedPortals,
    };

    const newAccessToken = signAccessToken(tokenPayload, this.jwtSecret);

    return {
      accessToken: newAccessToken,
      activeContext: {
        portal: targetPortal,
        organizationId: dto.organizationId,
        role: targetMembership?.role,
        organizationName: targetMembership?.organizationName,
      },
    };
  }

  /**
   * Get current authenticated user profile and workspaces
   */
  async getMe(userId: string, activeOrgId?: string) {
    const userContext = await this.resolveUserContext(userId);
    return userContext;
  }

  /**
   * Invalidate all active sessions for a user
   */
  async logout(userId: string) {
    await query(`UPDATE users SET token_version = token_version + 1 WHERE id = $1`, [userId]);

    await query(
      `INSERT INTO audit_events (event_code, actor_type, actor_user_id, target_type, target_id, category, event_type, summary)
       VALUES ($1, 'system', $2, 'user', $2, 'auth', 'auth.logout', 'User signed out and revoked active tokens')`,
      [`LOGOUT-${Date.now()}`, userId],
    );

    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Helper to resolve all roles, memberships, and permitted portals
   */
  private async resolveUserContext(userId: string): Promise<UserContext> {
    const userRes = await query(
      `SELECT id, full_name, email, phone, avatar_url, account_status FROM users WHERE id = $1`,
      [userId],
    );
    if (userRes.rows.length === 0) throw new NotFoundException('User not found');
    const user = userRes.rows[0];

    // 1. PM Memberships
    const memRes = await query(
      `SELECT ou.organization_id, o.name AS organization_name, o.slug AS organization_slug, ou.role, ou.status
       FROM organization_users ou
       JOIN organizations o ON ou.organization_id = o.id
       WHERE ou.user_id = $1 AND ou.status = 'active' AND o.status = 'active'`,
      [userId],
    );

    const memberships: OrganizationMembership[] = memRes.rows.map((r) => ({
      organizationId: r.organization_id,
      organizationName: r.organization_name,
      organizationSlug: r.organization_slug,
      role: r.role,
      status: r.status,
    }));

    // 2. Owner record
    const ownerRes = await query(
      `SELECT o.id, o.status, array_agg(po.property_id) as property_ids
       FROM owners o
       LEFT JOIN property_owners po ON o.id = po.owner_id AND po.relationship_status = 'active'
       WHERE o.user_id = $1 AND o.status = 'active'
       GROUP BY o.id, o.status`,
      [userId],
    );
    const isOwner = ownerRes.rows.length > 0;
    const ownerId = isOwner ? ownerRes.rows[0].id : undefined;

    // 3. Vendor record
    const vendorRes = await query(
      `SELECT id, business_name, lifecycle_status FROM vendors WHERE user_id = $1 AND lifecycle_status = 'active'`,
      [userId],
    );
    const isVendor = vendorRes.rows.length > 0;
    const vendorId = isVendor ? vendorRes.rows[0].id : undefined;

    // 4. Platform Admin record
    const adminRes = await query(
      `SELECT admin_role, status FROM platform_admin_access WHERE user_id = $1 AND status = 'active'`,
      [userId],
    );
    const isAdmin = adminRes.rows.length > 0;
    const adminRole = isAdmin ? adminRes.rows[0].admin_role : undefined;

    // Compute allowed portals
    const allowedPortals: PortalType[] = [];
    if (memberships.length > 0) allowedPortals.push('pm');
    if (isVendor) allowedPortals.push('vendor');
    if (isOwner) allowedPortals.push('owner');
    if (isAdmin) allowedPortals.push('admin');
    allowedPortals.push('public');

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      accountStatus: user.account_status,
      memberships,
      isOwner,
      ownerId,
      isVendor,
      vendorId,
      isAdmin,
      adminRole,
      allowedPortals,
    };
  }
}
