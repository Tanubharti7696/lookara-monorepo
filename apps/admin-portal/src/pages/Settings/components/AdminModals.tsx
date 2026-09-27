// src/pages/Settings/components/AdminModals.tsx
import { useState } from 'react';
import { type Admin, ROLE_DESCS, ROLE_LABELS, ROLE_ORDER } from './data';
import { useToast } from '../../context/ToastContext';

/* ═══════════ Invite Admin ═══════════ */
export function InviteAdminModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (name: string, email: string, role: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [resp, setResp] = useState('');
  const { toast } = useToast();

  const submit = () => {
    if (!name || !email || !role) { toast('Fill in all required fields.'); return; }
    onConfirm(name, email, role);
  };

  return (
    <div className="st-modal-overlay" onClick={onClose}>
      <div className="st-modal" onClick={(e) => e.stopPropagation()}>
        <div className="st-modal__title">Invite Admin</div>
        <div className="st-modal__sub">New admin will receive an email invitation to set up their account and configure 2FA.</div>

        <div className="st-field">
          <label>Full Name</label>
          <input className="st-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Smith" />
        </div>
        <div className="st-field">
          <label>Email Address</label>
          <input className="st-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@lookara.com" />
        </div>
        <div className="st-field">
          <label>Role</label>
          <select className="st-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select a role…</option>
            {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <div className="st-role-desc-box">{role ? ROLE_DESCS[role as keyof typeof ROLE_DESCS] : 'Select a role to see its permission scope.'}</div>
          {role === 'super' && (
            <div className="st-super-warning">⚠ Super Admin grants full platform control including the ability to manage other admins. Grant with care.</div>
          )}
        </div>
        <div className="st-field">
          <label>Assigned Responsibilities (optional)</label>
          <input className="st-input" value={resp} onChange={(e) => setResp(e.target.value)} placeholder="e.g. Florida region vendor compliance" />
        </div>

        <div className="st-modal-note">2FA will be required on first login. Invitation expires in 72 hours. Action logged to audit trail.</div>

        <div className="st-modal__foot">
          <button className="st-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="st-btn-confirm" onClick={submit}>Send Invitation</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Suspend Admin ═══════════ */
export function SuspendAdminModal({ admin, onClose, onConfirm }: { admin: Admin; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  const [type, setType] = useState('temporary');
  const { toast } = useToast();

  return (
    <div className="st-modal-overlay" onClick={onClose}>
      <div className="st-modal" onClick={(e) => e.stopPropagation()}>
        <div className="st-modal__title">Suspend Admin — {admin.name}</div>
        <div className="st-modal__sub">{admin.name} will be unable to log in until reinstated. All active sessions terminate immediately.</div>

        <div className="st-field">
          <label>Reason for suspension <span className="st-required">*</span></label>
          <input className="st-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Under investigation · Temporary leave · Policy violation" />
        </div>
        <div className="st-field">
          <label>Suspension type</label>
          <select className="st-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="temporary">Temporary — admin can be reinstated</option>
            <option value="indefinite">Indefinite — requires Super Admin review to lift</option>
          </select>
        </div>

        <div className="st-danger-note">⚠ All active sessions for this admin will be terminated immediately. Action logged to audit trail with your identity and timestamp.</div>

        <div className="st-modal__foot">
          <button className="st-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="st-btn-confirm is-danger" disabled={!reason.trim()} onClick={() => { if (!reason.trim()) { toast('Reason is required.'); return; } onConfirm(reason); }}>Suspend Access</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Remove Admin ═══════════ */
export function RemoveAdminModal({ admin, onClose, onConfirm }: { admin: Admin; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  return (
    <div className="st-modal-overlay" onClick={onClose}>
      <div className="st-modal" onClick={(e) => e.stopPropagation()}>
        <div className="st-modal__title">Remove Admin — {admin.name}</div>
        <div className="st-modal__sub">Permanently removes {admin.name}'s admin access. This cannot be undone.</div>

        <div className="st-field">
          <label>Reason for removal <span className="st-required">*</span></label>
          <input className="st-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. No longer with company · Role eliminated · Reassigned" />
        </div>

        <div className="st-danger-note">⛔ This action cannot be undone. The admin will lose all access immediately and cannot be re-added without a new invitation. Audit-logged permanently.</div>

        <div className="st-modal__foot">
          <button className="st-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="st-btn-confirm is-danger" disabled={!reason.trim()} onClick={() => { if (!reason.trim()) { toast('Reason is required.'); return; } onConfirm(reason); }}>Remove Permanently</button>
        </div>
      </div>
    </div>
  );
}