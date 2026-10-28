// apps/backend/src/tasks/task-policy.service.ts
import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { query } from '@lookara/database';
import type { JwtPayload } from '@lookara/auth';

export type TaskOperation =
  | 'view'
  | 'create'
  | 'update_status'
  | 'vendor_execution'
  | 'pm_verify'
  | 'cancel'
  | 'add_evidence'
  | 'view_evidence';

export interface TaskEntity {
  id: string;
  job_code: string;
  organization_id: string;
  property_id: string;
  status: string;
  trade_code?: string;
  severity?: string;
  created_by_user_id?: string;
  verified_by_user_id?: string;
  rework_count?: number;
  [key: string]: any;
}

export const CANONICAL_TASK_TRANSITIONS: Record<string, string[]> = {
  unassigned: ['dispatching', 'assigned', 'cancelled'],
  dispatching: ['assigned', 'unassigned', 'cancelled'],
  assigned: ['accepted', 'unassigned', 'cancelled'],
  accepted: ['en_route', 'in_progress', 'cancelled', 'escalated'],
  en_route: ['on_site', 'cancelled', 'escalated'],
  on_site: ['in_progress', 'cancelled', 'escalated'],
  in_progress: ['completed', 'verification_pending', 'escalated', 'cancelled'],
  verification_pending: ['completed', 'in_progress', 'escalated', 'closed'],
  completed: ['closed', 'in_progress', 'escalated'],
  closed: [],
  cancelled: [],
  escalated: ['assigned', 'closed'],
};

// Allowed status updates per actor role
export const ROLE_ALLOWED_TARGET_STATUSES: Record<string, string[]> = {
  vendor: ['accepted', 'en_route', 'on_site', 'in_progress', 'verification_pending', 'completed'],
  pm: ['unassigned', 'dispatching', 'assigned', 'in_progress', 'verification_pending', 'completed', 'closed', 'cancelled', 'escalated'],
  admin: ['unassigned', 'dispatching', 'assigned', 'accepted', 'en_route', 'on_site', 'in_progress', 'verification_pending', 'completed', 'closed', 'cancelled', 'escalated'],
  owner: [], // Owners have read-only visibility into their properties
};

@Injectable()
export class TaskPolicyService {
  /**
   * Resolve vendor ID for a given user JWT
   */
  async getVendorIdForUser(user: JwtPayload): Promise<string | null> {
    if (!user.isVendor && user.activePortal !== 'vendor') return null;
    const res = await query(`SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [user.sub]);
    return res.rows[0]?.id || null;
  }

  /**
   * Check if a vendor is currently assigned to a task
   */
  async isVendorAssignedToTask(vendorId: string, taskId: string): Promise<boolean> {
    const res = await query(
      `SELECT id FROM job_assignments WHERE job_id = $1 AND vendor_id = $2 LIMIT 1`,
      [taskId, vendorId]
    );
    return res.rows.length > 0;
  }

  /**
   * Check if an owner has ownership of the property for a task
   */
  async isOwnerOfProperty(userId: string, propertyId: string): Promise<boolean> {
    const res = await query(
      `SELECT po.id FROM property_owners po
       JOIN owners o ON po.owner_id = o.id
       WHERE o.user_id = $1 AND po.property_id = $2 AND po.relationship_status = 'active'
       LIMIT 1`,
      [userId, propertyId]
    );
    return res.rows.length > 0;
  }

  /**
   * Centralized authorization evaluation for any task operation.
   * Enforces tenant, property, user, and role-level boundaries.
   */
  async authorize(user: JwtPayload, task: TaskEntity, operation: TaskOperation): Promise<{
    role: 'admin' | 'pm' | 'vendor' | 'owner';
    vendorId?: string;
  }> {
    // 1. Super Admin bypass
    if (user.isAdmin) {
      return { role: 'admin' };
    }

    // 2. Vendor Portal & Role
    if (user.isVendor || user.activePortal === 'vendor') {
      const vendorId = await this.getVendorIdForUser(user);
      if (!vendorId) {
        throw new ForbiddenException('No active vendor profile found for this user account');
      }

      const isAssigned = await this.isVendorAssignedToTask(vendorId, task.id);
      if (!isAssigned) {
        throw new ForbiddenException(`Access denied: Vendor is not assigned to Task ${task.job_code}`);
      }

      // Vendor operation restrictions
      if (operation === 'cancel') {
        throw new ForbiddenException('Vendors are not authorized to cancel tasks');
      }
      if (operation === 'pm_verify') {
        throw new ForbiddenException('Vendors cannot verify or approve their own completed tasks');
      }
      if (operation === 'create') {
        throw new ForbiddenException('Vendors cannot create organizational tasks');
      }

      return { role: 'vendor', vendorId };
    }

    // 3. Owner Portal & Role
    if (user.isOwner && !user.activeOrganizationId) {
      const isOwner = await this.isOwnerOfProperty(user.sub, task.property_id);
      if (!isOwner) {
        throw new ForbiddenException('Access denied: You do not own the property for this Task');
      }
      if (operation !== 'view' && operation !== 'view_evidence') {
        throw new ForbiddenException('Owners have read-only access to tasks');
      }
      return { role: 'owner' };
    }

    // 4. Property Manager (PM) Organization Context
    if (user.activeOrganizationId) {
      if (task.organization_id !== user.activeOrganizationId) {
        throw new ForbiddenException(`Task ${task.job_code} does not belong to your active organization`);
      }

      return { role: 'pm' };
    }

    throw new ForbiddenException('Insufficient permissions or missing organization context to access this task');
  }

  /**
   * Validate state transition adhering to canonical workflow rules and actor role permissions
   */
  validateTransition(currentStatus: string, targetStatus: string, actorRole: 'admin' | 'pm' | 'vendor' | 'owner'): void {
    const allowedWorkflowTransitions = CANONICAL_TASK_TRANSITIONS[currentStatus] || [];
    if (!allowedWorkflowTransitions.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${targetStatus}". Canonical workflow rules permit: ${
          allowedWorkflowTransitions.length > 0 ? allowedWorkflowTransitions.join(', ') : 'none (terminal state)'
        }`
      );
    }

    const rolePermittedStatuses = ROLE_ALLOWED_TARGET_STATUSES[actorRole] || [];
    if (!rolePermittedStatuses.includes(targetStatus)) {
      throw new ForbiddenException(
        `Actors with role "${actorRole}" are not permitted to transition tasks to "${targetStatus}"`
      );
    }
  }

  /**
   * Validate preconditions before moving to completed or verification_pending
   */
  async validateVerificationPreconditions(taskId: string, targetStatus: string, notes?: string): Promise<void> {
    if (targetStatus === 'verification_pending' || targetStatus === 'completed') {
      const evCheck = await query(`SELECT count(*) as count FROM job_evidence WHERE job_id = $1`, [taskId]);
      const count = parseInt(evCheck.rows[0]?.count || '0', 10);
      if (count === 0 && (!notes || notes.trim().length === 0)) {
        throw new BadRequestException('Completion evidence (photo or notes) must be provided before marking complete');
      }
    }
  }
}
