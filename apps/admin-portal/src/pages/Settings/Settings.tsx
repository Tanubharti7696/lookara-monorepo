// src/pages/Settings/Settings.tsx
import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { INITIAL_ADMINS, type Admin, type RoleKey, type StatusKey } from './components/data';
import {
  ComplianceRulesSection, SLARulesSection, DispatchRulesSection,
  PlatformControlsSection, IntegrationsSection, RoleTemplatesSection,
} from './components/RulesSections';
import AdminTeamSection from './components/AdminTeamSection';
import EditAdminDrawer from './components/EditAdminDrawer';
import { InviteAdminModal, SuspendAdminModal, RemoveAdminModal } from './components/AdminModals';
import './Settings.css';

type SectionKey = 'compliance' | 'sla' | 'dispatch' | 'platform' | 'integrations' | 'team' | 'roles';

const NAV: { group: string; items: { key: SectionKey; label: string }[] }[] = [
  {
    group: 'Platform Rules',
    items: [
      { key: 'compliance', label: 'Compliance Rules' },
      { key: 'sla',        label: 'SLA Rules' },
      { key: 'dispatch',   label: 'Dispatch Rules' },
      { key: 'platform',   label: 'Platform Controls' },
    ],
  },
  {
    group: 'Connections',
    items: [{ key: 'integrations', label: 'Integrations' }],
  },
  {
    group: 'Admin Access',
    items: [
      { key: 'team',  label: 'Admin Team' },
      { key: 'roles', label: 'Role Templates' },
    ],
  },
];

export default function Settings() {
  const { toast } = useToast();
  const [section, setSection] = useState<SectionKey>('compliance');
  const [admins, setAdmins] = useState<Admin[]>(INITIAL_ADMINS);

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<Admin | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Admin | null>(null);

  const handleSaveAdmin = (
    admin: Admin,
    payload: { role: RoleKey; status: StatusKey; permissions: Record<string, boolean>; tempAccess: any[]; reason: string },
  ) => {
    setAdmins((list) => list.map((a) => a.id === admin.id
      ? { ...a, role: payload.role, scope: scopeForRole(payload.role), status: payload.status === 'active' ? 'active' : payload.status as any }
      : a,
    ));
    setEditingAdmin(null);
    toast(`Saved · ${admin.name} · ${payload.reason} · Audit logged.`);
  };

  const handleSuspendConfirm = (reason: string) => {
    if (!suspendTarget) return;
    setAdmins((list) => list.map((a) => a.id === suspendTarget.id ? { ...a, status: 'suspended' } : a));
    toast(`${suspendTarget.name} suspended · Reason: ${reason} · Sarah Chen · Audit logged.`);
    setSuspendTarget(null);
  };

  const handleRemoveConfirm = (reason: string) => {
    if (!removeTarget) return;
    setAdmins((list) => list.map((a) => a.id === removeTarget.id ? { ...a, status: 'removed' } : a));
    toast(`${removeTarget.name} removed permanently · Reason: ${reason} · Sarah Chen · Audit logged.`);
    setRemoveTarget(null);
  };

  const handleReinstate = (admin: Admin) => {
    if (!window.confirm(`Reinstate ${admin.name}? They will regain access immediately. Audit-logged.`)) return;
    setAdmins((list) => list.map((a) => a.id === admin.id ? { ...a, status: 'active' } : a));
    toast(`${admin.name} reinstated · Sarah Chen · Audit logged.`);
  };

  const handleAdminAction = (action: any, admin: Admin) => {
    if (action === 'mfa')    toast(`${admin.name} — MFA reset initiated. Re-enrollment required on next login. · Sarah Chen · Audit logged.`);
    if (action === 'resend') toast(`Invitation resent to ${admin.email} · Expires in 72h.`);
    if (action === 'remove-invite') {
      if (!window.confirm(`Remove invitation for ${admin.name}?`)) return;
      setAdmins((list) => list.map((a) => a.id === admin.id ? { ...a, status: 'removed' } : a));
      toast(`Invitation for ${admin.name} removed · Audit logged.`);
    }
    if (action === 'audit')  toast(`Audit log for ${admin.name} — opens in Audit & Activity page.`);
    if (action === 'profile' || action === 'edit') setEditingAdmin(admin);
  };

  return (
    <div className="st-page">
      <div className="st-header">
        <div>
          <h2>Settings</h2>
          <p>System rules, thresholds, and platform controls · Super Admin: full edit · Sub-admins: scoped edit · Auditors: view only</p>
          <div className="st-header__meta">
            <span>Last updated: Apr 14, 2026 · System-controlled</span>
            <span className="st-header__sep">|</span>
            <span>Applies platform-wide · All organizations and vendors</span>
          </div>
        </div>
        <span className="st-phase-badge">Phase 1 · Permission-controlled</span>
      </div>

      <div className="st-layout">
        <nav className="st-sidebar">
          <div className="st-nav-list">
            {NAV.map((group) => (
              <div key={group.group}>
                <div className="st-nav-group">{group.group}</div>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    className={`st-nav-link ${section === item.key ? 'is-active' : ''}`}
                    onClick={() => setSection(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </nav>

        <div className="st-content">
          {section === 'compliance'   && <ComplianceRulesSection />}
          {section === 'sla'          && <SLARulesSection />}
          {section === 'dispatch'     && <DispatchRulesSection />}
          {section === 'platform'     && <PlatformControlsSection />}
          {section === 'integrations' && <IntegrationsSection />}
          {section === 'roles'        && <RoleTemplatesSection />}
          {section === 'team'         && (
            <AdminTeamSection
              admins={admins}
              onOpenEdit={setEditingAdmin}
              onInvite={() => setInviteOpen(true)}
              onSuspend={setSuspendTarget}
              onRemove={setRemoveTarget}
              onReinstate={handleReinstate}
              onAction={handleAdminAction}
            />
          )}
        </div>
      </div>

      {editingAdmin && (
        <EditAdminDrawer
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSave={handleSaveAdmin}
        />
      )}

      {inviteOpen && (
        <InviteAdminModal
          onClose={() => setInviteOpen(false)}
          onConfirm={(name, email, role) => {
            const id = 'a' + (admins.length + 1);
            setAdmins((list) => [...list, {
              id, name, email,
              role: role as RoleKey,
              roleClass: `role-${role}`,
              status: 'invited',
              createdBy: 'Sarah Chen',
              lastLogin: 'Never',
              twoFA: 'pending',
              scope: scopeForRole(role as RoleKey),
            }]);
            setInviteOpen(false);
            toast(`Invitation sent to ${email} · ${ROLE_LABELS[role as RoleKey] ?? role} · Logged.`);
          }}
        />
      )}

      {suspendTarget && (
        <SuspendAdminModal admin={suspendTarget} onClose={() => setSuspendTarget(null)} onConfirm={handleSuspendConfirm} />
      )}
      {removeTarget && (
        <RemoveAdminModal admin={removeTarget} onClose={() => setRemoveTarget(null)} onConfirm={handleRemoveConfirm} />
      )}
    </div>
  );
}

function scopeForRole(role: RoleKey): string {
  const scopes: Record<RoleKey, string> = {
    super: 'Full platform control',
    ops: 'Orgs · Vendors · Review Queue',
    compliance: 'Vendor & org compliance review',
    dispute: 'Disputes & resolution cases',
    billing: 'Plans · credits · custom rates',
    security: 'Security & access controls',
    support: 'Support operations',
    auditor: 'Audit log · monitoring only',
  };
  return scopes[role];
}

// Local import for the toast message
import { ROLE_LABELS } from './components/data';