// packages/auth/src/rbac.ts
import type { OrganizationRole, PortalType } from './types';

export const PERMISSIONS = {
  // Tasks
  TASK_VIEW: 'task.view',
  TASK_CREATE: 'task.create',
  TASK_ASSIGN: 'task.assign',
  TASK_VERIFY: 'task.verify',
  TASK_CLOSE: 'task.close',
  TASK_EXECUTE: 'task.execute', // Vendor specific

  // Properties
  PROPERTY_VIEW: 'property.view',
  PROPERTY_CREATE: 'property.create',
  PROPERTY_EDIT: 'property.edit',

  // Vendors
  VENDOR_VIEW: 'vendor.view',
  VENDOR_INVITE: 'vendor.invite',
  VENDOR_SUSPEND: 'vendor.suspend',

  // Compliance
  COMPLIANCE_VIEW: 'compliance.view',
  COMPLIANCE_REVIEW: 'compliance.review',
  COMPLIANCE_UPLOAD: 'compliance.upload',

  // Financials & Billing
  BILLING_VIEW: 'billing.view',
  BILLING_CREDIT: 'billing.credit',

  // Approvals & Incidents
  APPROVAL_VIEW: 'approval.view',
  APPROVAL_DECIDE: 'approval.decide',
  INCIDENT_VIEW: 'incident.view',
  INCIDENT_MANAGE: 'incident.manage',

  // Audit
  AUDIT_VIEW: 'audit.view',

  // Platform Admin
  ADMIN_ALL: 'admin.all',
  ADMIN_PERMISSIONS_MANAGE: 'admin.permissions.manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Standard role permissions templates (frozen templates, not modified per-org)
 */
export const ROLE_PERMISSIONS_MAP: Record<OrganizationRole | 'vendor' | 'property_owner' | 'platform_admin', PermissionKey[]> = {
  // Organization Owner (PM Company Owner)
  owner: [
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_VERIFY,
    PERMISSIONS.TASK_CLOSE,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_CREATE,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.VENDOR_INVITE,
    PERMISSIONS.VENDOR_SUSPEND,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_REVIEW,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_CREDIT,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.APPROVAL_DECIDE,
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.INCIDENT_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],

  // Organization Admin (PM Admin)
  admin: [
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_VERIFY,
    PERMISSIONS.TASK_CLOSE,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_CREATE,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.VENDOR_INVITE,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_REVIEW,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.APPROVAL_DECIDE,
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.INCIDENT_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],

  // Operations Manager
  ops_manager: [
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_VERIFY,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.INCIDENT_MANAGE,
  ],

  // Coordinator
  coordinator: [
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.INCIDENT_VIEW,
  ],

  // Read-only Viewer
  viewer: [
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.VENDOR_VIEW,
  ],

  // Vendor Role
  vendor: [
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_EXECUTE,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_UPLOAD,
  ],

  // Property Owner Role
  property_owner: [
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.APPROVAL_VIEW,
    PERMISSIONS.APPROVAL_DECIDE,
    PERMISSIONS.INCIDENT_VIEW,
    PERMISSIONS.BILLING_VIEW,
  ],

  // Lookara Super Admin
  platform_admin: [
    PERMISSIONS.ADMIN_ALL,
    PERMISSIONS.ADMIN_PERMISSIONS_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.VENDOR_VIEW,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_REVIEW,
    PERMISSIONS.BILLING_VIEW,
  ],
};

/**
 * Check if a role possesses a required permission
 */
export function hasPermission(
  role: string | undefined,
  requiredPermission: PermissionKey,
  customOverrides: PermissionKey[] = [],
): boolean {
  if (!role) return false;
  if (role === 'platform_admin') return true;

  const standardPermissions = (ROLE_PERMISSIONS_MAP as Record<string, PermissionKey[]>)[role] || [];
  if (standardPermissions.includes(requiredPermission)) return true;
  if (customOverrides.includes(requiredPermission)) return true;

  return false;
}

/**
 * Determine default landing portal based on available roles
 */
export function getDefaultPortal(
  memberships: { role: OrganizationRole }[],
  isOwner?: boolean,
  isVendor?: boolean,
  isAdmin?: boolean,
): PortalType {
  if (isAdmin) return 'admin';
  if (memberships.length > 0) return 'pm';
  if (isVendor) return 'vendor';
  if (isOwner) return 'owner';
  return 'public';
}
