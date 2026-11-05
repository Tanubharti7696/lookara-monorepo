import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { JwtPayload } from '@lookara/auth';
import { query } from '@lookara/database';

export type OrgAction = 'view' | 'edit' | 'manage_members';

@Injectable()
export class OrganizationPolicyService {
  /**
   * Authorize a user against a target organization for a specific action.
   * Throws ForbiddenException or NotFoundException if authorization fails.
   */
  async authorize(user: JwtPayload, targetOrgId: string, action: OrgAction) {
    if (!user || !user.sub) {
      throw new ForbiddenException('Authentication required');
    }

    if (!targetOrgId) {
      throw new ForbiddenException('Target organization ID is required');
    }

    // Platform Admin server-side verification and fine-grained RBAC
    if (user.isAdmin) {
      const adminRes = await query(
        `SELECT admin_role, status FROM platform_admin_access WHERE user_id = $1 AND status = 'active'`,
        [user.sub],
      );
      if (adminRes.rows.length === 0) {
        throw new ForbiddenException('Platform admin privileges are inactive or not provisioned');
      }
      const adminRole = adminRes.rows[0].admin_role;

      // Auditor or read-only admin roles are restricted to view operations only
      if (['auditor', 'read_only', 'support_admin'].includes(adminRole)) {
        if (action === 'edit' || action === 'manage_members') {
          throw new ForbiddenException(`Platform admin role "${adminRole}" is restricted to read-only access and cannot modify organization records`);
        }
      }

      const orgCheck = await query(`SELECT id FROM organizations WHERE id = $1`, [targetOrgId]);
      if (orgCheck.rows.length === 0) {
        throw new NotFoundException('Organization not found');
      }
      return { role: 'admin', isPlatformAdmin: true, adminRole };
    }

    // Verify active server-side membership in the target organization
    const memberRes = await query(
      `SELECT role, status FROM organization_users 
       WHERE organization_id = $1 AND user_id = $2 AND status = 'active'`,
      [targetOrgId, user.sub],
    );

    if (memberRes.rows.length === 0) {
      throw new ForbiddenException('Access to target organization denied');
    }

    const role = memberRes.rows[0].role; // 'owner', 'admin', 'ops_manager', 'coordinator', 'viewer'

    if (action === 'manage_members') {
      if (role !== 'owner' && role !== 'admin') {
        throw new ForbiddenException('Permission organization.manage_members required');
      }
    } else if (action === 'edit') {
      if (role !== 'owner' && role !== 'admin') {
        throw new ForbiddenException('Permission organization.edit required');
      }
    } else if (action === 'view') {
      // Any active member can view
    }

    return { role, isPlatformAdmin: false };
  }
}
