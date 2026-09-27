// src/pages/Settings/components/AdminTeamSection.tsx
import { useState, useRef, useEffect } from 'react';
import { type Admin, ROLE_CLASS, ROLE_LABELS } from './data';

type MenuAction = 'profile' | 'edit' | 'mfa' | 'suspend' | 'reinstate' | 'audit' | 'resend' | 'remove-invite';

type Props = {
  admins: Admin[];
  onOpenEdit: (admin: Admin) => void;
  onInvite: () => void;
  onSuspend: (admin: Admin) => void;
  onRemove: (admin: Admin) => void;
  onReinstate: (admin: Admin) => void;
  onAction: (action: MenuAction, admin: Admin) => void;
};

export default function AdminTeamSection({
  admins, onOpenEdit, onInvite, onSuspend, onRemove, onReinstate, onAction,
}: Props) {
  return (
    <div className="st-section st-section--wide">
      <div className="st-admin-block">
        <div className="st-admin-head">
          <div>
            <div className="st-admin-title">Admin Team</div>
            <div className="st-admin-sub">Manage platform administrators, roles, permissions, and access.</div>
          </div>
          <button className="st-btn-invite" onClick={onInvite}>+ Invite Admin</button>
        </div>
        <div className="st-super-note">
          🔐 Only Super Admins can invite, edit, suspend, or remove other admins. All actions are audit-logged.
        </div>
        <div className="st-policy-strip">
          <div className="st-policy-lbl">Administrative Policy — Reason Required For</div>
          <div className="st-policy-items">
            <span>· Suspend admin</span>
            <span>· Reinstate admin</span>
            <span>· Change permissions</span>
            <span>· Grant temporary access</span>
            <span>· Remove admin</span>
            <span>· Platform rule changes</span>
          </div>
        </div>

        <div className="st-admin-header">
          <div>Name</div>
          <div>Role</div>
          <div>Status</div>
          <div>Created By</div>
          <div>Last Login</div>
          <div>2FA</div>
          <div>Responsibilities</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {admins.map((a) => (
          <AdminRow
            key={a.id}
            admin={a}
            onOpenEdit={onOpenEdit}
            onSuspend={onSuspend}
            onRemove={onRemove}
            onReinstate={onReinstate}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}

function AdminRow({
  admin, onOpenEdit, onSuspend, onRemove, onReinstate, onAction,
}: {
  admin: Admin;
  onOpenEdit: (a: Admin) => void;
  onSuspend: (a: Admin) => void;
  onRemove: (a: Admin) => void;
  onReinstate: (a: Admin) => void;
  onAction: (action: MenuAction, admin: Admin) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  // Position floating menu
  useEffect(() => {
    if (!open || !btnRef.current || !menuRef.current) return;
    const anchor = btnRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const gap = 6, edge = 12;
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = anchor.right - menuRect.width;
    left = Math.max(edge, Math.min(left, vw - menuRect.width - edge));
    let top: number;
    const below = vh - anchor.bottom - edge;
    const above = anchor.top - edge;
    if (below >= menuRect.height || below >= above) {
      top = anchor.bottom + gap;
      if (top + menuRect.height > vh - edge) top = vh - menuRect.height - edge;
    } else {
      top = anchor.top - menuRect.height - gap;
      if (top < edge) top = edge;
    }
    setPos({ left, top });
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    document.addEventListener('click', close);
    return () => {
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
      document.removeEventListener('click', close);
    };
  }, []);

  const statusClass = admin.status === 'active' ? 'active' : admin.status === 'invited' ? 'invited' : 'suspended';
  const statusLabel = admin.status.charAt(0).toUpperCase() + admin.status.slice(1);

  const handle = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    fn();
  };

  return (
    <>
      <div className="st-admin-row">
        <div>
          <div className="st-admin-name">
            {admin.name}
            {admin.id === 'a1' && <span className="st-you-badge">You</span>}
          </div>
          <div className="st-admin-email">{admin.email}</div>
        </div>
        <div>
          <span className={`role-chip ${ROLE_CLASS[admin.role]}`}>{ROLE_LABELS[admin.role]}</span>
          {admin.customOverrides && admin.customOverrides > 0 && (
            <span className="st-custom-badge">(+{admin.customOverrides} Override{admin.customOverrides === 1 ? '' : 's'})</span>
          )}
        </div>
        <div><span className={`st-status-chip is-${statusClass}`}>{statusLabel}</span></div>
        <div className="st-admin-meta">{admin.createdBy}</div>
        <div className="st-admin-meta-lg">{admin.lastLogin}</div>
        <div className={`st-admin-2fa is-${admin.twoFA}`}>{admin.twoFA === 'on' ? '✓ On' : 'Pending'}</div>
        <div className="st-admin-scope">{admin.scope}</div>
        <div className="st-admin-actions" onClick={(e) => e.stopPropagation()}>
          <button
            ref={btnRef}
            className="st-action-btn"
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          >
            Actions ▾
          </button>
        </div>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="st-action-menu"
          style={{ left: pos.left, top: pos.top }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="st-action-menu__item" onClick={handle(() => onOpenEdit(admin))}>View Profile</button>
          <button className="st-action-menu__item" onClick={handle(() => onOpenEdit(admin))}>Edit Permissions</button>
          <button className="st-action-menu__item" onClick={handle(() => onAction('mfa', admin))}>Reset MFA</button>
          {admin.status === 'invited' ? (
            <>
              <button className="st-action-menu__item" onClick={handle(() => onAction('resend', admin))}>Resend Invitation</button>
              <button className="st-action-menu__item is-danger" onClick={handle(() => onAction('remove-invite', admin))}>Remove Invitation</button>
            </>
          ) : admin.status === 'suspended' || admin.status === 'disabled' || admin.status === 'removed' ? (
            <button className="st-action-menu__item is-positive" onClick={handle(() => onReinstate(admin))}>Reinstate</button>
          ) : (
            <>
              <button className="st-action-menu__item is-danger" onClick={handle(() => onSuspend(admin))}>Suspend</button>
              <button className="st-action-menu__item is-danger" onClick={handle(() => onRemove(admin))}>Remove Admin</button>
            </>
          )}
          <button className="st-action-menu__item" onClick={handle(() => onAction('audit', admin))}>View Audit</button>
        </div>
      )}
    </>
  );
}