// src/pages/Settings/components/EditAdminDrawer.tsx
import { useState, useEffect, useMemo } from 'react';
import { type Admin, type RoleKey, type StatusKey, ROLE_DESCS, ROLE_LABELS, ROLE_DEFAULTS, ROLE_ORDER, PERM_SECTIONS } from './data';
import { useToast } from '../../context/ToastContext';

type TempAccess = { perm: string; label: string; expiry: string; reason: string };

type Snapshot = {
  role: RoleKey;
  status: StatusKey;
  permissions: Record<string, boolean>;
  tempAccess: TempAccess[];
};

type Props = {
  admin: Admin;
  onClose: () => void;
  onSave: (admin: Admin, payload: { role: RoleKey; status: StatusKey; permissions: Record<string, boolean>; tempAccess: TempAccess[]; reason: string }) => void;
};

const TEMP_PERMS: { value: string; label: string }[] = [
  { value: 'billing_view',      label: 'Billing — View' },
  { value: 'billing_credits',   label: 'Billing — Grant Credits' },
  { value: 'billing_plans',     label: 'Billing — Upgrade / Downgrade Plans' },
  { value: 'vendors_suspend',   label: 'Vendors — Suspend' },
  { value: 'vendors_reinstate', label: 'Vendors — Reinstate' },
  { value: 'org_suspend',       label: 'Organizations — Suspend' },
  { value: 'compliance_full',   label: 'Compliance — Full Access' },
  { value: 'disputes_full',     label: 'Disputes — Full Access' },
  { value: 'admin_invite',      label: 'Admin Team — Invite Admin' },
  { value: 'platform_settings', label: 'System — Platform Settings' },
];

export default function EditAdminDrawer({ admin, onClose, onSave }: Props) {
  const { toast } = useToast();
  const [role, setRole] = useState<RoleKey>(admin.role);
  const [status, setStatus] = useState<StatusKey>('active');
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => ({ ...ROLE_DEFAULTS[admin.role] }));
  const [tempAccess, setTempAccess] = useState<TempAccess[]>([]);
  const [reason, setReason] = useState('');

  // Temp access draft
  const [draftPerm, setDraftPerm] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('23:59');
  const [draftReason, setDraftReason] = useState('');

  // Sessions
  const [sessionsTerminated, setSessionsTerminated] = useState(false);

  // Undo stack
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);

  const [initialSnapshot, setInitialSnapshot] = useState<Snapshot | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    const init: Snapshot = { role, status, permissions: { ...permissions }, tempAccess: [...tempAccess] };
    setInitialSnapshot(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin.id]);

  const currentSnapshot: Snapshot = useMemo(
    () => ({ role, status, permissions: { ...permissions }, tempAccess: [...tempAccess] }),
    [role, status, permissions, tempAccess],
  );

  const isModified = useMemo(
    () => !!initialSnapshot && JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot),
    [currentSnapshot, initialSnapshot],
  );

  const pushUndo = () => setUndoStack((s) => [...s, currentSnapshot]);

  const resetToInitial = () => {
    if (!initialSnapshot) return;
    setRole(initialSnapshot.role);
    setStatus(initialSnapshot.status);
    setPermissions({ ...initialSnapshot.permissions });
    setTempAccess([...initialSnapshot.tempAccess]);
    setUndoStack([]);
    setReason('');
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRole(prev.role);
    setStatus(prev.status);
    setPermissions({ ...prev.permissions });
    setTempAccess([...prev.tempAccess]);
    toast('Last unsaved change undone.');
  };

  const updateRole = (newRole: RoleKey) => {
    pushUndo();
    setRole(newRole);
    setPermissions({ ...ROLE_DEFAULTS[newRole] });
  };

  const updateStatus = (newStatus: StatusKey) => {
    pushUndo();
    setStatus(newStatus);
  };

  const updatePerm = (id: string, checked: boolean) => {
    pushUndo();
    setPermissions((p) => ({ ...p, [id]: checked }));
  };

  const addTempAccess = () => {
    if (!draftPerm || !draftDate) { toast('Select a permission and expiry date.'); return; }
    if (!draftReason.trim()) { toast('Temporary access reason is required.'); return; }
    const label = TEMP_PERMS.find((t) => t.value === draftPerm)?.label ?? draftPerm;
    pushUndo();
    setTempAccess((t) => [...t, {
      perm: draftPerm,
      label,
      expiry: `${draftDate} · ${draftTime}`,
      reason: draftReason.trim(),
    }]);
    setDraftPerm(''); setDraftDate(''); setDraftReason('');
  };

  const removeTempAccess = (idx: number) => {
    pushUndo();
    setTempAccess((t) => t.filter((_, i) => i !== idx));
  };

  // Compute override count vs role default
  const overrideCount = useMemo(() => {
    const defaults = ROLE_DEFAULTS[role];
    return Object.keys(defaults).reduce((n, id) => n + (permissions[id] !== defaults[id] ? 1 : 0), 0);
  }, [permissions, role]);

  const handleSave = () => {
    if (!reason.trim()) { toast('Reason for change is required before saving.'); return; }
    onSave(admin, { role, status, permissions, tempAccess, reason: reason.trim() });
  };

  return (
    <>
      <div className="st-drawer-overlay" onClick={onClose} />
      <aside className="st-drawer">
        <header className="st-drawer__head">
          <div>
            <div className="st-drawer__title">Administrator Profile</div>
            <div className="st-drawer__sub">{admin.name} · {admin.email}</div>
          </div>
          <button className="st-drawer__close" onClick={onClose}>✕</button>
        </header>

        <div className="st-drawer__body">
          {/* Profile */}
          <Section title="Profile">
            <InfoRow label="Name"  value={admin.name}  action={<button className="st-info-edit" onClick={() => toast('Name update logged.')}>Edit</button>} />
            <InfoRow label="Email" value={admin.email} action={<button className="st-info-edit" onClick={() => toast('Email update requires re-verification.')}>Edit</button>} />
            <InfoRow label="Created By"  value={admin.createdBy} muted />
            <InfoRow label="Last Login"  value={admin.lastLogin} muted />
          </Section>

          {/* Account Status */}
          <Section title="Account Status">
            <div className="st-status-cards">
              {(['active', 'limited', 'suspended', 'disabled'] as StatusKey[]).map((s) => (
                <label key={s} className={`st-status-card ${status === s ? 'is-selected' : ''}`}>
                  <input type="radio" checked={status === s} onChange={() => updateStatus(s)} />
                  <span className={`st-status-dot is-${s}`} />
                  <div>
                    <div className="st-status-card__lbl">{s.charAt(0).toUpperCase() + s.slice(1)}</div>
                    <div className="st-status-card__sub">{
                      s === 'active'    ? 'Full access per assigned role' :
                      s === 'limited'   ? 'Read-only, no actions' :
                      s === 'suspended' ? 'Login disabled until reinstated' :
                                          'Permanently deactivated'
                    }</div>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          {/* Security */}
          <Section title="Security">
            <InfoRow
              label="Two-Factor Auth"
              value={<span className="st-2fa">✓ Enabled</span>}
              action={<button className="st-info-edit" onClick={() => toast('MFA reset email sent. Re-enrollment required on next login.')}>Reset MFA</button>}
            />
            <div className="st-sessions-block">
              <div className="st-sessions-head">
                <span className="st-info-lbl">Active Sessions</span>
                <div>
                  <button className="st-info-edit" onClick={() => toast('Session details — Phase 2 will show device, browser, IP, and location.')}>View Sessions</button>
                  <button className="st-info-edit is-danger" onClick={() => { setSessionsTerminated(true); toast('All sessions terminated · Sarah Chen · Audit logged.'); }}>Terminate All</button>
                </div>
              </div>
              {sessionsTerminated ? (
                <div className="st-sessions-empty">All sessions terminated. Administrator will need to log in again.</div>
              ) : (
                <>
                  <div className="st-session-row">
                    <span className="st-session-icon">💻</span>
                    <div>
                      <div className="st-session-device">Desktop · Chrome · Orlando, FL</div>
                      <div className="st-session-status is-active">● Active now</div>
                    </div>
                  </div>
                  <div className="st-session-row">
                    <span className="st-session-icon">📱</span>
                    <div>
                      <div className="st-session-device">iPhone · Safari · Orlando, FL</div>
                      <div className="st-session-status">Last active 12 min ago</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Section>

          {/* Role Template */}
          <Section title="Role Template" hint="system defaults, not editable here">
            <select className="st-select" value={role} onChange={(e) => updateRole(e.target.value as RoleKey)}>
              {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <div className="st-role-desc-box">{ROLE_DESCS[role]}</div>
            <div className="st-note is-green">
              Role Template: <strong>{ROLE_LABELS[role].replace(/^[^a-zA-Z]+/,'')}</strong> (Platform Default) — customize below to add per-person overrides.
            </div>
            {isModified && overrideCount > 0 && (
              <div className="st-note is-gold">
                ✎ Permission overrides active — this person differs from the role template. Other admins with the same role are unaffected.
              </div>
            )}
          </Section>

          {/* Permission Overrides */}
          <Section
            title="Permission Overrides"
            hint="Additional or restricted permissions applied only to this administrator. The platform role template remains unchanged."
          >
            {PERM_SECTIONS.map((section) => {
              const normal = section.perms.filter((p) => !p.danger);
              const danger = section.perms.filter((p) => p.danger);
              return (
                <div key={section.title} className="st-perm-section">
                  <div className="st-perm-title">{section.title}</div>
                  {normal.length > 0 && (
                    <div className="st-perm-grid">
                      {normal.map((p) => (
                        <label key={p.id} className="st-perm-item">
                          <input type="checkbox" checked={!!permissions[p.id]} onChange={(e) => updatePerm(p.id, e.target.checked)} />
                          <span>{p.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {danger.length > 0 && (
                    <div className="st-perm-danger">
                      <div className="st-perm-danger__lbl">⚠ High Privilege</div>
                      <div className="st-perm-grid">
                        {danger.map((p) => (
                          <label key={p.id} className="st-perm-item is-danger">
                            <input type="checkbox" checked={!!permissions[p.id]} onChange={(e) => updatePerm(p.id, e.target.checked)} />
                            <span>{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <button className="st-btn-reset-role" onClick={() => { pushUndo(); setPermissions({ ...ROLE_DEFAULTS[role] }); }}>
              Reset to Role Default
            </button>
          </Section>

          {/* Temporary Access */}
          <Section title="Temporary Access Grant" hint="auto-expires on set date">
            <div className="st-temp-block">
              <div className="st-temp-title">⏱ Grant a temporary permission override</div>
              <div className="st-temp-row">
                <select className="st-temp-input" value={draftPerm} onChange={(e) => setDraftPerm(e.target.value)}>
                  <option value="">Select permission…</option>
                  {TEMP_PERMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <span className="st-temp-until">until</span>
                <input type="date" className="st-temp-input st-temp-input--date" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
                <input type="time" className="st-temp-input st-temp-input--time" value={draftTime} onChange={(e) => setDraftTime(e.target.value)} />
                <button className="st-temp-add" onClick={addTempAccess}>Add</button>
              </div>
              <input className="st-temp-reason" type="text" placeholder="Reason (required) — e.g. Vacation coverage for Jennifer until Aug 31" value={draftReason} onChange={(e) => setDraftReason(e.target.value)} />
              <label className="st-temp-notify">
                <input type="checkbox" />
                Notify administrator by email when temporary access is granted
              </label>
              <div className="st-temp-tags">
                {tempAccess.map((t, i) => (
                  <div key={i} className="st-temp-tag">
                    {t.label} · until {t.expiry}
                    <button className="st-temp-tag__remove" onClick={() => removeTempAccess(i)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Effective Permissions */}
          <Section title="Effective Permissions">
            <div className="st-eff-block">
              <div className="st-eff-lbl">Platform Template</div>
              <div className="st-eff-item is-base">{ROLE_LABELS[role]}</div>
              {(overrideCount > 0 || tempAccess.length > 0) && (
                <>
                  <div className="st-eff-sep" />
                  <div className="st-eff-lbl">Overrides</div>
                  {Object.entries(permissions).map(([id, val]) => {
                    const def = ROLE_DEFAULTS[role][id];
                    if (val === def) return null;
                    const label = PERM_SECTIONS.flatMap((s) => s.perms).find((p) => p.id === id)?.label ?? id;
                    return (
                      <div key={id} className={`st-eff-item ${val ? 'is-add' : 'is-remove'}`}>
                        <span>{val ? '+' : '−'}</span>{label}
                      </div>
                    );
                  })}
                  {tempAccess.map((t, i) => (
                    <div key={`t-${i}`} className="st-eff-item is-add">
                      <span>⏱</span>{t.label} (until {t.expiry})
                    </div>
                  ))}
                </>
              )}
              {overrideCount === 0 && tempAccess.length === 0 && (
                <div className="st-eff-none">No overrides — using platform defaults</div>
              )}
            </div>
          </Section>

          {/* Account History */}
          <Section title="Account History" last>
            <HistoryRow dot="muted" event={`Invited by ${admin.createdBy}`} time="Jan 12, 2026" />
            <HistoryRow dot="green" event="Accepted invitation · MFA enrolled" time="Jan 12, 2026" />
            <HistoryRow dot="blue"  event={`Role assigned: ${ROLE_LABELS[admin.role]}`} time="Jan 12, 2026" />
            {tempAccess.length > 0 && (
              <HistoryRow dot="gold" event={`Temporary access granted: ${tempAccess.map((t) => t.label).join(', ')}`} time="Saved this session" />
            )}
          </Section>
        </div>

        {/* Reason + Footer */}
        <div className="st-reason">
          <label>Reason for change <span className="st-required">*</span></label>
          <input
            className="st-reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required — e.g. Expanded scope to include billing"
          />
        </div>

        <footer className="st-drawer__foot">
          <button className="st-recovery-btn" disabled={!isModified} onClick={resetToInitial}>Reset changes</button>
          <button className="st-recovery-btn" disabled={undoStack.length === 0} onClick={undo}>Undo last change</button>
          <div style={{ flex: 1 }} />
          <button className="st-btn-review" disabled={!isModified} onClick={() => setReviewOpen(true)}>Review Changes</button>
          <button className="st-btn-save" disabled={!isModified || !reason.trim()} onClick={handleSave}>Save Changes</button>
          <span className="st-footer-note">Super Admin only · All changes audit-logged</span>
        </footer>
      </aside>

      {reviewOpen && (
        <ReviewChangesModal
          initial={initialSnapshot}
          current={currentSnapshot}
          reason={reason}
          onClose={() => setReviewOpen(false)}
          onConfirm={handleSave}
        />
      )}
    </>
  );
}

/* ── Helpers ── */
function Section({ title, hint, last, children }: { title: string; hint?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`st-drawer-section ${last ? 'is-last' : ''}`}>
      <div className="st-drawer-section__title">
        {title}
        {hint && <span className="st-drawer-section__hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, action, muted }: { label: string; value: React.ReactNode; action?: React.ReactNode; muted?: boolean }) {
  return (
    <div className="st-info-row">
      <span className="st-info-lbl">{label}</span>
      <div className="st-info-right">
        <span className={`st-info-val ${muted ? 'is-muted' : ''}`}>{value}</span>
        {action}
      </div>
    </div>
  );
}

function HistoryRow({ dot, event, time }: { dot: string; event: string; time: string }) {
  return (
    <div className="st-history-row">
      <span className={`st-history-dot is-${dot}`} />
      <div>
        <div className="st-history-event">{event}</div>
        <div className="st-history-time">{time}</div>
      </div>
    </div>
  );
}

function ReviewChangesModal({
  initial, current, reason, onClose, onConfirm,
}: { initial: Snapshot | null; current: Snapshot; reason: string; onClose: () => void; onConfirm: () => void }) {
  if (!initial) return null;
  const changes: { sign: '+' | '−' | '→'; label: string }[] = [];
  if (current.role !== initial.role) {
    changes.push({ sign: '→', label: `Role: ${ROLE_LABELS[initial.role]} → ${ROLE_LABELS[current.role]}` });
  }
  if (current.status !== initial.status) {
    changes.push({ sign: '→', label: `Status: ${initial.status} → ${current.status}` });
  }
  Object.keys(current.permissions).forEach((id) => {
    const before = !!initial.permissions[id];
    const after = !!current.permissions[id];
    if (before === after) return;
    const label = PERM_SECTIONS.flatMap((s) => s.perms).find((p) => p.id === id)?.label ?? id;
    changes.push({ sign: after ? '+' : '−', label });
  });
  const tempsChanged = JSON.stringify(initial.tempAccess) !== JSON.stringify(current.tempAccess);

  return (
    <div className="st-modal-overlay" onClick={onClose}>
      <div className="st-modal" onClick={(e) => e.stopPropagation()}>
        <div className="st-modal__title">Review Changes</div>
        <div className="st-modal__sub">Confirm before saving. Changes apply immediately.</div>
        {changes.length === 0 && !tempsChanged ? (
          <div className="st-modal__empty">No changes to review.</div>
        ) : (
          <>
            {changes.map((c, i) => (
              <div key={i} className="st-review-row">
                <span className={`st-review-sign is-${c.sign === '+' ? 'add' : c.sign === '−' ? 'remove' : 'neutral'}`}>{c.sign}</span>
                <span className="st-review-lbl">{c.label}</span>
              </div>
            ))}
            {tempsChanged && (
              <div className="st-review-temp">
                <div className="st-review-temp__lbl">Temporary access</div>
                <div className="st-review-temp__body">
                  {current.tempAccess.length > 0
                    ? current.tempAccess.map((t, i) => <div key={i}>{t.label} until {t.expiry}</div>)
                    : 'All temporary access removed'}
                </div>
              </div>
            )}
          </>
        )}
        <div className={`st-review-reason ${reason ? '' : 'is-error'}`}>
          Reason: {reason || 'Required before saving'}
        </div>
        <div className="st-modal__foot">
          <button className="st-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="st-btn-confirm" disabled={!reason.trim()} onClick={() => { onClose(); onConfirm(); }}>Confirm &amp; Save</button>
        </div>
      </div>
    </div>
  );
}