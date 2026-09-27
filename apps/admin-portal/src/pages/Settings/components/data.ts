// src/pages/Settings/components/data.ts
export type RoleKey = 'super' | 'ops' | 'compliance' | 'dispute' | 'billing' | 'security' | 'support' | 'auditor';
export type StatusKey = 'active' | 'limited' | 'suspended' | 'disabled';

export const ROLE_DESCS: Record<RoleKey, string> = {
  super:      'Full platform control. Can manage all other admins, grant roles, and access all settings.',
  ops:        'Manages organizations, vendors, and review queue. No billing or admin management access.',
  compliance: 'Handles vendor/org compliance, document review, and grace periods.',
  dispute:    'Resolves disputes and manages correction tasks.',
  billing:    'Manages subscription plans, credits, and custom rates.',
  security:   'Handles MFA resets, session management, and security controls.',
  support:    'Account support with view-only org data. Limited audit access.',
  auditor:    'Read-only access to audit logs and all pages. No actions permitted.',
};

export const ROLE_LABELS: Record<RoleKey, string> = {
  super:      '⭐ Super Admin',
  ops:        '🔧 Operations Admin',
  compliance: '📋 Compliance Admin',
  dispute:    '⚖️ Dispute Admin',
  billing:    '💲 Billing Admin',
  security:   '🔐 Security Admin',
  support:    '🎧 Support Admin',
  auditor:    '👁 Read-Only Auditor',
};

export const ROLE_CLASS: Record<RoleKey, string> = {
  super:      'role-super',
  ops:        'role-ops',
  compliance: 'role-compliance',
  dispute:    'role-dispute',
  billing:    'role-billing',
  security:   'role-security',
  support:    'role-support',
  auditor:    'role-auditor',
};

export const ROLE_SCOPE: Record<RoleKey, string> = {
  super:      'Full platform control',
  ops:        'Orgs · Vendors · Review Queue',
  compliance: 'Vendor & org compliance review',
  dispute:    'Disputes & resolution cases',
  billing:    'Plans · credits · custom rates',
  security:   'Security & access controls',
  support:    'Support operations',
  auditor:    'Audit log · monitoring only',
};

/* Permission groups as they appear in the drawer */
export const PERM_SECTIONS: { title: string; perms: { id: string; label: string; danger?: boolean }[] }[] = [
  {
    title: 'Organizations',
    perms: [
      { id: 'perm_Organizations_View',    label: 'View' },
      { id: 'perm_Organizations_Edit',    label: 'Edit' },
      { id: 'perm_Organizations_Suspend', label: 'Suspend' },
      { id: 'perm_Organizations_Delete',  label: 'Delete', danger: true },
    ],
  },
  {
    title: 'Vendors',
    perms: [
      { id: 'perm_Vendors_View',          label: 'View' },
      { id: 'perm_Vendors_Edit',          label: 'Edit' },
      { id: 'perm_Vendors_Limit',         label: 'Limit' },
      { id: 'perm_Vendors_Transfer_Jobs', label: 'Transfer Jobs' },
      { id: 'perm_Vendors_Suspend',       label: 'Suspend',   danger: true },
      { id: 'perm_Vendors_Reinstate',     label: 'Reinstate', danger: true },
    ],
  },
  {
    title: 'Review Queue',
    perms: [
      { id: 'perm_Review_Queue_Disputes',        label: 'Disputes' },
      { id: 'perm_Review_Queue_Compliance',      label: 'Compliance' },
      { id: 'perm_Review_Queue_Correction_Tasks',label: 'Correction Tasks' },
      { id: 'perm_Review_Queue_Close_Cases',     label: 'Close Cases' },
    ],
  },
  {
    title: 'Billing',
    perms: [
      { id: 'perm_Billing_View',            label: 'View' },
      { id: 'perm_Billing_Grant_Credits',   label: 'Grant Credits' },
      { id: 'perm_Billing_Free_Months',     label: 'Free Months' },
      { id: 'perm_Billing_Custom_Rates',    label: 'Custom Rates' },
      { id: 'perm_Billing_Upgrade_Plans',   label: 'Upgrade Plans' },
      { id: 'perm_Billing_Downgrade_Plans', label: 'Downgrade Plans' },
    ],
  },
  {
    title: 'Audit',
    perms: [
      { id: 'perm_Audit_View',   label: 'View' },
      { id: 'perm_Audit_Export', label: 'Export' },
      { id: 'perm_Audit_Delete', label: 'Delete', danger: true },
    ],
  },
  {
    title: 'Admin Team',
    perms: [
      { id: 'perm_Admin_Team_Invite_Admin',          label: 'Invite Admin',    danger: true },
      { id: 'perm_Admin_Team_Remove_Admin',          label: 'Remove Admin',    danger: true },
      { id: 'perm_Admin_Team_Edit_Permissions',      label: 'Edit Permissions',danger: true },
      { id: 'perm_Admin_Team_Suspend_Admin',         label: 'Suspend Admin',   danger: true },
      { id: 'perm_Admin_Team_Promote_Super_Admin',   label: 'Promote Super Admin', danger: true },
    ],
  },
  {
    title: 'System',
    perms: [
      { id: 'perm_System_System_Health',     label: 'System Health' },
      { id: 'perm_System_Integrations',      label: 'Integrations' },
      { id: 'perm_System_Logs',              label: 'Logs' },
      { id: 'perm_System_Platform_Settings', label: 'Platform Settings', danger: true },
      { id: 'perm_System_Rule_Engine',       label: 'Rule Engine',       danger: true },
    ],
  },
];

const ALL_PERM_IDS = PERM_SECTIONS.flatMap((s) => s.perms.map((p) => p.id));

function defaultsFrom(activeIds: string[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  ALL_PERM_IDS.forEach((id) => { out[id] = activeIds.includes(id); });
  return out;
}

export const ROLE_DEFAULTS: Record<RoleKey, Record<string, boolean>> = {
  super: defaultsFrom(ALL_PERM_IDS),
  ops: defaultsFrom([
    'perm_Organizations_View', 'perm_Organizations_Edit', 'perm_Organizations_Suspend',
    'perm_Vendors_View', 'perm_Vendors_Edit', 'perm_Vendors_Limit',
    'perm_Review_Queue_Disputes', 'perm_Review_Queue_Compliance', 'perm_Review_Queue_Correction_Tasks', 'perm_Review_Queue_Close_Cases',
    'perm_Audit_View', 'perm_Audit_Export',
    'perm_System_System_Health', 'perm_System_Integrations', 'perm_System_Logs',
  ]),
  compliance: defaultsFrom([
    'perm_Organizations_View', 'perm_Vendors_View',
    'perm_Review_Queue_Compliance',
    'perm_Audit_View',
  ]),
  dispute: defaultsFrom([
    'perm_Organizations_View', 'perm_Vendors_View',
    'perm_Review_Queue_Disputes', 'perm_Review_Queue_Correction_Tasks', 'perm_Review_Queue_Close_Cases',
    'perm_Audit_View',
  ]),
  billing: defaultsFrom([
    'perm_Organizations_View',
    'perm_Billing_View', 'perm_Billing_Grant_Credits', 'perm_Billing_Free_Months',
    'perm_Billing_Custom_Rates', 'perm_Billing_Upgrade_Plans', 'perm_Billing_Downgrade_Plans',
    'perm_Audit_View', 'perm_Audit_Export',
  ]),
  security: defaultsFrom([
    'perm_Organizations_View', 'perm_Vendors_View',
    'perm_Review_Queue_Disputes', 'perm_Review_Queue_Compliance',
    'perm_Audit_View', 'perm_Audit_Export',
    'perm_System_System_Health', 'perm_System_Integrations', 'perm_System_Logs',
  ]),
  support: defaultsFrom([
    'perm_Organizations_View', 'perm_Vendors_View',
    'perm_Billing_View',
    'perm_Audit_View',
    'perm_System_System_Health', 'perm_System_Logs',
  ]),
  auditor: defaultsFrom([
    'perm_Organizations_View', 'perm_Vendors_View', 'perm_Billing_View',
    'perm_Audit_View',
  ]),
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  roleClass: string;
  status: 'active' | 'invited' | 'suspended' | 'removed' | 'disabled';
  createdBy: string;
  lastLogin: string;
  twoFA: 'on' | 'pending';
  scope: string;
  customOverrides?: number;
};

export const INITIAL_ADMINS: Admin[] = [
  { id: 'a1', name: 'Sarah Chen',      email: 'sarah@lookara.com',    role: 'super',      roleClass: 'role-super',      status: 'active',    createdBy: 'System',       lastLogin: 'Just now', twoFA: 'on',      scope: 'Full platform control' },
  { id: 'a2', name: 'Marcus Webb',     email: 'marcus@lookara.com',   role: 'ops',        roleClass: 'role-ops',        status: 'active',    createdBy: 'Sarah Chen',   lastLogin: '2h ago',   twoFA: 'on',      scope: 'Orgs · Vendors · Review Queue', customOverrides: 1 },
  { id: 'a3', name: 'Diane Foster',    email: 'diane@lookara.com',    role: 'compliance', roleClass: 'role-compliance', status: 'active',    createdBy: 'Sarah Chen',   lastLogin: 'Yesterday',twoFA: 'on',      scope: 'Vendor & org compliance review' },
  { id: 'a4', name: 'James Park',      email: 'james@lookara.com',    role: 'dispute',    roleClass: 'role-dispute',    status: 'active',    createdBy: 'Sarah Chen',   lastLogin: '3h ago',   twoFA: 'on',      scope: 'Disputes & resolution cases' },
  { id: 'a5', name: 'Jennifer Walsh',  email: 'jennifer@lookara.com', role: 'billing',    roleClass: 'role-billing',    status: 'active',    createdBy: 'Marcus Webb',  lastLogin: '1h ago',   twoFA: 'on',      scope: 'Plans · credits · custom rates' },
  { id: 'a6', name: 'Alex Torres',     email: 'alex@lookara.com',     role: 'auditor',    roleClass: 'role-auditor',    status: 'invited',   createdBy: 'Sarah Chen',   lastLogin: 'Never',    twoFA: 'pending', scope: 'Audit log · monitoring only' },
];

export const ROLE_ORDER: RoleKey[] = ['super', 'ops', 'compliance', 'dispute', 'billing', 'security', 'support', 'auditor'];

export const ADMIN_META: Record<string, { sessions: number }> = {
  a2: { sessions: 2 },
  a3: { sessions: 1 },
  a4: { sessions: 1 },
  a5: { sessions: 3 },
  a6: { sessions: 0 },
};

export const CURRENT_ADMIN = { name: 'Sarah Chen', role: 'Super Admin' as const };