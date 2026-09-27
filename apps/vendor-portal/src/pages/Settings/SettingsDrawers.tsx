// apps/vendor-portal/src/pages/Settings/SettingsDrawers.tsx
import { useState } from 'react';

export type DrawerKey =
  | 'minjob' | 'payout-method' | 'payout-schedule'
  | 'phone' | 'email' | 'password' | 'quiet-hours'
  | 'logout-all' | 'delete-account';

interface StateShape {
  minjob: number;
  schedule: string;
  quietStart: string;
  quietEnd: string;
  phone: string;
  email: string;
}

/* ═══════════════ SHELL ═══════════════ */
function Shell({ onClose, header, children, footer }: {
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <aside className="drawer open">
        <div className="drawer-hdr">{header}</div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-foot">{footer}</div>
      </aside>
    </>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export function SettingsDrawer({
  kind, state, onStateChange, onClose, showToast,
}: {
  kind: DrawerKey;
  state: StateShape;
  onStateChange: (patch: Partial<StateShape>) => void;
  onClose: () => void;
  showToast: (msg: string, tone?: 'info' | 'success' | 'warn' | 'danger') => void;
}) {
  /* — local buffers — */
  const [minjob, setMinjob] = useState(state.minjob);
  const [schedule, setSchedule] = useState(state.schedule);
  const [quietStart, setQuietStart] = useState(state.quietStart);
  const [quietEnd, setQuietEnd] = useState(state.quietEnd);
  const [phone, setPhone] = useState(state.phone);
  const [email, setEmail] = useState(state.email);
  const [pwCur, setPwCur] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConf, setPwConf] = useState('');
  const [delPw, setDelPw] = useState('');

  /* ── MIN JOB ── */
  if (kind === 'minjob') {
    return (
      <Shell
        onClose={onClose}
        header={hdr('Minimum Job Value', 'Jobs below this amount will not be offered')}
        footer={
          <>
            <button className="btn-prim" onClick={() => { onStateChange({ minjob }); showToast(`Minimum set to $${minjob}`, 'success'); onClose(); }}>Save</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        }
      >
        <div className="fld">
          <div className="f-label">Minimum ($)</div>
          <input className="f-input" type="number" min={0} max={500} value={minjob}
            onChange={(e) => setMinjob(parseInt(e.target.value) || 0)} />
        </div>
        <div className="fld">
          <div className="f-label">Quick select</div>
          <div className="quick-row">
            {[0, 50, 75, 100, 150, 200].map((v) => (
              <button key={v} className={`quick-chip ${minjob === v ? 'sel' : ''}`} onClick={() => setMinjob(v)}>
                {v === 0 ? 'No min' : `$${v}`}
              </button>
            ))}
          </div>
        </div>
        <div className="drawer-note is-muted">
          Set to $0 to receive all jobs. Affects dispatch — lower minimum = more job offers.
        </div>
      </Shell>
    );
  }

  /* ── PAYOUT METHOD ── */
  if (kind === 'payout-method') {
    return (
      <Shell
        onClose={onClose}
        header={hdr('Payout Method', 'Where your payments are sent')}
        footer={<button className="btn-sec full" onClick={onClose}>Close</button>}
      >
        <div className="ds-block">
          <div className="ds-row">
            <span className="ds-icon">🏦</span>
            <div className="ds-body">
              <div className="ds-title">ACH Transfer · Chase</div>
              <div className="ds-sub">✓ Verified · Updated Feb 2</div>
            </div>
          </div>
        </div>
        <div className="drawer-note is-blue">
          To update your bank account, contact support or visit the Earnings page. Changes take effect on the next payout cycle.
        </div>
      </Shell>
    );
  }

  /* ── PAYOUT SCHEDULE ── */
  if (kind === 'payout-schedule') {
    const opts = ['Weekly — Fridays', 'Bi-weekly — Fridays', 'Monthly — 1st'];
    return (
      <Shell
        onClose={onClose}
        header={hdr('Payout Schedule', 'When verified earnings are transferred')}
        footer={<button className="btn-sec full" onClick={onClose}>Done</button>}
      >
        <div className="pm-opts">
          {opts.map((o) => (
            <button key={o} className={`pm-opt ${schedule === o ? 'sel' : ''}`} onClick={() => setSchedule(o)}>
              <span className="pm-opt-dot" style={{ background: schedule === o ? 'var(--gold)' : 'var(--slate)' }} />
              <div><div className="pm-opt-label">{o}</div></div>
            </button>
          ))}
        </div>

        <div className="ds-block">
          <div className="ds-block-title">How Payouts Work</div>
          <div className="payout-explain">
            <div className="pe-row">
              <span className="pe-dot" style={{ background: 'var(--emerald)' }} />
              <div>
                <div className="pe-label">Earned</div>
                <div className="pe-sub">Completed + PM verified → enters your payout cycle</div>
              </div>
            </div>
            <div className="pe-row">
              <span className="pe-dot" style={{ background: 'var(--blue)' }} />
              <div>
                <div className="pe-label">Pending</div>
                <div className="pe-sub">Completed, awaiting PM verification → not yet in payout cycle</div>
              </div>
            </div>
            <div className="pe-row">
              <span className="pe-dot" style={{ background: 'var(--gold)' }} />
              <div>
                <div className="pe-label">Conditional</div>
                <div className="pe-sub">Estimate not yet approved → not money yet, excluded from payout</div>
              </div>
            </div>
          </div>
          <div className="payout-explain-foot">
            Payout is triggered by PM verification, not by schedule. The schedule controls transfer frequency only.
          </div>
        </div>
      </Shell>
    );
  }

  /* ── PHONE ── */
  if (kind === 'phone') {
    return (
      <Shell
        onClose={onClose}
        header={hdr('Phone Number', 'Used for SMS alerts and account verification')}
        footer={
          <>
            <button className="btn-prim" onClick={() => { onStateChange({ phone }); showToast('Verification sent · Phone will update after confirmation', 'success'); onClose(); }}>Save &amp; Verify</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        }
      >
        <div className="fld">
          <div className="f-label">Phone Number</div>
          <input className="f-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="drawer-note is-muted">A verification code will be sent to confirm the new number.</div>
      </Shell>
    );
  }

  /* ── EMAIL ── */
  if (kind === 'email') {
    return (
      <Shell
        onClose={onClose}
        header={hdr('Email Address', 'Used for account notifications and login')}
        footer={
          <>
            <button className="btn-prim" onClick={() => { onStateChange({ email }); showToast('Confirmation sent · Email will update after verification', 'success'); onClose(); }}>Save &amp; Verify</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        }
      >
        <div className="fld">
          <div className="f-label">Email Address</div>
          <input className="f-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="drawer-note is-muted">A confirmation link will be sent to verify the new address.</div>
      </Shell>
    );
  }

  /* ── PASSWORD ── */
  if (kind === 'password') {
    const save = () => {
      if (!pwCur || !pwNew || !pwConf) { showToast('All fields required', 'danger'); return; }
      if (pwNew !== pwConf) { showToast('Passwords do not match', 'danger'); return; }
      if (pwNew.length < 8) { showToast('Password must be at least 8 characters', 'danger'); return; }
      showToast('Password updated', 'success');
      onClose();
    };
    return (
      <Shell
        onClose={onClose}
        header={hdr('Change Password', 'Must be at least 8 characters')}
        footer={
          <>
            <button className="btn-prim" onClick={save}>Update Password</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        }
      >
        <div className="fld"><div className="f-label">Current Password</div>
          <input className="f-input" type="password" value={pwCur} onChange={(e) => setPwCur(e.target.value)} /></div>
        <div className="fld"><div className="f-label">New Password</div>
          <input className="f-input" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} /></div>
        <div className="fld"><div className="f-label">Confirm New Password</div>
          <input className="f-input" type="password" value={pwConf} onChange={(e) => setPwConf(e.target.value)} /></div>
      </Shell>
    );
  }

  /* ── QUIET HOURS ── */
  if (kind === 'quiet-hours') {
    return (
      <Shell
        onClose={onClose}
        header={hdr('Quiet Hours', 'Only emergency alerts during this window')}
        footer={
          <>
            <button className="btn-prim" onClick={() => { onStateChange({ quietStart, quietEnd }); showToast('Quiet hours updated', 'success'); onClose(); }}>Save</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        }
      >
        <div className="fld fld--h">
          <div style={{ flex: 1 }}><div className="f-label">Start</div>
            <input className="f-input" type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} /></div>
          <div style={{ flex: 1 }}><div className="f-label">End</div>
            <input className="f-input" type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} /></div>
        </div>
        <div className="drawer-note is-blue">
          During quiet hours, only Emergency Alerts will be delivered. All other notifications are held until the window ends.
        </div>
      </Shell>
    );
  }

  /* ── LOGOUT ALL ── */
  if (kind === 'logout-all') {
    return (
      <Shell
        onClose={onClose}
        header={hdr('Log Out of All Devices', 'You will need to sign in again everywhere')}
        footer={
          <>
            <button className="btn-prim red" onClick={() => { showToast('Signed out of all devices', 'success'); onClose(); }}>Confirm Log Out</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        }
      >
        <div className="drawer-note is-amber">
          This will sign you out of all active sessions including mobile, web, and any other devices. You will need to log back in.
        </div>
      </Shell>
    );
  }

  /* ── DELETE ACCOUNT ── */
  if (kind === 'delete-account') {
    return (
      <Shell
        onClose={onClose}
        header={hdr('Delete Account', 'This action is permanent and cannot be undone')}
        footer={
          <>
            <button className="btn-prim red" onClick={() => {
              if (!delPw) { showToast('Enter your password to confirm', 'danger'); return; }
              showToast('Account deletion request submitted · Support will follow up', 'success');
              onClose();
            }}>Delete My Account</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        }
      >
        <div className="drawer-note is-crimson">
          Deleting your account will permanently remove your profile, job history, and earnings data. This cannot be reversed.
        </div>
        <div className="fld">
          <div className="f-label">Confirm with your password</div>
          <input className="f-input" type="password" value={delPw} onChange={(e) => setDelPw(e.target.value)} />
        </div>
      </Shell>
    );
  }

  return null;
}

/* ── helpers ── */
function hdr(title: string, sub: string) {
  return (
    <>
      <div>
        <div className="dh-title">{title}</div>
        <div className="dh-sub">{sub}</div>
      </div>
    </>
  );
}