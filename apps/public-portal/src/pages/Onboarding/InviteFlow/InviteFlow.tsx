// apps/public-portal/src/pages/InviteFlow/InviteFlow.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import './InviteFlow.css';

type Screen =
  | 'invite'
  | 'setup'
  | 'existing'
  | 'boot'
  | 'dashboard'
  | 'expired'
  | 'wrong-email'
  | 'already-joined';

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CHECK_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const EYE_OPEN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EYE_OFF = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const BOOT_STEPS = [
  {
    label: 'Applying permissions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Syncing access',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Loading operations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

/* ── Invite fixture (in production: parsed from URL token) ── */
const INVITE = {
  company: 'Coastal Properties',
  role: 'Ops PM',
  invitedBy: 'Marcus R.',
  email: 'ops@coastalproperties.com',
};

export default function InviteFlow() {
  const { showToast } = useToast();

  const [screen, setScreen] = useState<Screen>('invite');
  const [bootIndex, setBootIndex] = useState(-1);
  const [userName, setUserName] = useState('');
  const [bannerOpen, setBannerOpen] = useState(true);

  /* Password fields */
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwVisible, setPwVisible] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; pw?: boolean }>({});

  /* Boot sequence */
  useEffect(() => {
    if (screen !== 'boot') return;
    setBootIndex(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < BOOT_STEPS.length) {
        setBootIndex(i);
        setTimeout(tick, 850);
      } else {
        setTimeout(() => setScreen('dashboard'), 600);
      }
    };
    const t = setTimeout(tick, 850);
    return () => clearTimeout(t);
  }, [screen]);

  /* Auto-dismiss role banner */
  useEffect(() => {
    if (screen !== 'dashboard' || !bannerOpen) return;
    const t = setTimeout(() => setBannerOpen(false), 5000);
    return () => clearTimeout(t);
  }, [screen, bannerOpen]);

  const submitSetup = (e: FormEvent) => {
    e.preventDefault();
    const next: { name?: boolean; pw?: boolean } = {};
    if (!userName.trim()) next.name = true;
    if (pw.length < 8) next.pw = true;
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setScreen('boot');
  };

  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'OP';

  /* ── RENDER ── */
  return (
    <div className="inv-page">
      {/* ══════════ INVITE LANDING ══════════ */}
      {screen === 'invite' && (
        <div className="inv-screen inv-centered">
          <Logo />
          <div className="inv-card">
            <div className="inv-eyebrow">You've been invited to join</div>

            <div className="inv-ws-info" style={{ marginTop: 0 }}>
              <div className="inv-ws-row">
                <span className="inv-ws-key">Company</span>
                <span className="inv-ws-val">{INVITE.company}</span>
              </div>
              <div className="inv-ws-row">
                <span className="inv-ws-key">Role</span>
                <span className="inv-role-badge">{INVITE.role}</span>
              </div>
              <div className="inv-ws-row">
                <span className="inv-ws-key">Invited by</span>
                <span className="inv-ws-val">{INVITE.invitedBy}</span>
              </div>
            </div>

            <button className="inv-btn-primary" onClick={() => setScreen('setup')}>
              Accept invitation {ARROW_RIGHT}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ SETUP ══════════ */}
      {screen === 'setup' && (
        <div className="inv-screen inv-centered">
          <Logo />
          <form className="inv-card" onSubmit={submitSetup} noValidate>
            <div className="inv-eyebrow">First time setup</div>
            <h2 className="inv-title">Set up your access</h2>
            <p className="inv-sub">Your email and role are pre-assigned.</p>

            <div className="inv-form-group">
              <label className="inv-form-label">Email</label>
              <input
                type="email"
                className="inv-input locked"
                value={INVITE.email}
                readOnly
              />
            </div>

            <div className="inv-form-group">
              <label className="inv-form-label">Full Name</label>
              <input
                type="text"
                className={`inv-input ${errors.name ? 'error' : ''}`}
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (errors.name) setErrors((x) => ({ ...x, name: false }));
                }}
                autoFocus
              />
              {errors.name && <span className="inv-error">Full Name is required</span>}
            </div>

            <div className="inv-form-group">
              <label className="inv-form-label">Password</label>
              <div className="inv-pw-wrap">
                <input
                  type={pwVisible ? 'text' : 'password'}
                  className={`inv-input ${errors.pw ? 'error' : ''}`}
                  value={pw}
                  onChange={(e) => {
                    setPw(e.target.value);
                    if (errors.pw) setErrors((x) => ({ ...x, pw: false }));
                  }}
                />
                <button
                  type="button"
                  className="inv-pw-toggle"
                  onClick={() => setPwVisible((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {pwVisible ? EYE_OFF : EYE_OPEN}
                </button>
              </div>
              {errors.pw && <span className="inv-error">Password must be at least 8 characters</span>}
            </div>

            <button type="submit" className="inv-btn-primary" style={{ marginTop: '1.25rem' }}>
              Continue {ARROW_RIGHT}
            </button>

            <div className="inv-footnote">
              Already have an account?{' '}
              <Link to="/login" className="inv-link">Log in instead</Link>
            </div>
          </form>
        </div>
      )}

      {/* ══════════ EXISTING USER ══════════ */}
      {screen === 'existing' && (
        <div className="inv-screen inv-centered">
          <Logo />
          <div className="inv-card">
            <div className="inv-eyebrow">Returning user</div>
            <h2 className="inv-title">Already have an account?</h2>
            <p className="inv-sub">
              Use the main Lookara login page. Your workspace will be attached automatically.
            </p>
            <Link to="/login" className="inv-btn-primary" style={{ marginTop: '0.75rem', textDecoration: 'none' }}>
              Go to login page {ARROW_RIGHT}
            </Link>
            <button className="inv-btn-outline" onClick={() => setScreen('setup')}>
              New to Lookara? Set up account
            </button>
          </div>
        </div>
      )}

      {/* ══════════ BOOT ══════════ */}
      {screen === 'boot' && (
        <div className="inv-screen inv-boot">
          <Logo />
          <h2 className="inv-boot-title">Joining workspace…</h2>
          <div className="inv-boot-steps">
            {BOOT_STEPS.map((s, i) => {
              const state = i < bootIndex ? 'done' : i === bootIndex ? 'active' : 'idle';
              return (
                <div key={i} className={`inv-boot-step inv-boot-step--${state}`}>
                  <div className="inv-boot-icon">{s.icon}</div>
                  <div className="inv-boot-text">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ DASHBOARD ══════════ */}
      {screen === 'dashboard' && (
        <div className="inv-screen inv-dashboard">
          {/* Role banner */}
          {bannerOpen && (
            <div className="inv-banner">
              <div className="inv-banner-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>
                  You joined <strong>{INVITE.company}</strong> as <strong>{INVITE.role}</strong>
                </span>
              </div>
              <button className="inv-banner-dismiss" onClick={() => setBannerOpen(false)}>×</button>
            </div>
          )}

          {/* Topbar */}
          <div className={`inv-topbar ${bannerOpen ? 'banner-open' : ''}`}>
            <div className="inv-topbar-left">
              <Logo small />
              <span className="inv-ws-label">{INVITE.company}</span>
              <span className="inv-role-chip">{INVITE.role}</span>
            </div>
            <div className="inv-topbar-right">
              <div className="inv-avatar">{initials}</div>
            </div>
          </div>

          <div className="inv-body">
            {/* Sidebar */}
            <aside className="inv-sidebar">
              <div className="inv-nav-section">Operations</div>
              <button className="inv-nav-item active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Dashboard
              </button>
              <button className="inv-nav-item" onClick={() => showToast('Opening tasks…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                Tasks
              </button>
              <button className="inv-nav-item" onClick={() => showToast('Opening vendors…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                Vendors
              </button>
              <div className="inv-nav-section">System</div>
              <button className="inv-nav-item" onClick={() => showToast('Opening compliance…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Compliance
              </button>
              <button className="inv-nav-item" onClick={() => showToast('Opening audit trail…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
                Audit Trail
              </button>
              <button className="inv-nav-item locked" disabled>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                Billing
                <svg className="inv-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              </button>
              <button className="inv-nav-item locked" disabled>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                Settings
                <svg className="inv-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              </button>
            </aside>

            {/* Main */}
            <main className="inv-main">
              <div className="inv-scope-notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                You're an <strong style={{ margin: '0 0.25rem' }}>{INVITE.role}</strong>. Some controls are restricted.
              </div>

              <div className="inv-stats">
                <div className="inv-stat">
                  <div className="inv-stat-val gold">4</div>
                  <div className="inv-stat-label">Properties</div>
                </div>
                <div className="inv-stat">
                  <div className="inv-stat-val">7</div>
                  <div className="inv-stat-label">Tasks</div>
                </div>
                <div className="inv-stat">
                  <div className="inv-stat-val green">3</div>
                  <div className="inv-stat-label">SLA Active</div>
                </div>
              </div>

              <p className="inv-lead">Start by reviewing or assigning active tasks.</p>

              <div className="inv-section-header">
                <div className="inv-section-title">Active tasks</div>
              </div>

              <div className="inv-task-list">
                <div className="inv-task-card">
                  <div className="inv-task-dot gold" />
                  <div className="inv-task-info">
                    <div className="inv-task-name">Turnover — Unit 12B</div>
                    <div className="inv-task-meta">Assigned — Elite Clean Co</div>
                  </div>
                  <span className="inv-task-sla running">SLA running</span>
                  <button className="inv-task-btn" onClick={() => showToast('Opening task…')}>View</button>
                </div>
                <div className="inv-task-card">
                  <div className="inv-task-dot amber" />
                  <div className="inv-task-info">
                    <div className="inv-task-name">Maintenance — Unit 8A</div>
                    <div className="inv-task-meta">Vendor dispatched — ETA pending</div>
                  </div>
                  <span className="inv-task-sla running">SLA running</span>
                  <button className="inv-task-btn" onClick={() => showToast('Opening task…')}>View</button>
                </div>
                <div className="inv-task-card">
                  <div className="inv-task-dot slate" />
                  <div className="inv-task-info">
                    <div className="inv-task-name">Compliance review — Unit 3C</div>
                    <div className="inv-task-meta">Due in 2 days</div>
                  </div>
                  <span className="inv-task-sla pending">Pending</span>
                  <button className="inv-task-btn" onClick={() => showToast('Opening compliance…')}>Review</button>
                </div>
              </div>

              <div className="inv-audit">
                <div className="inv-audit-header">
                  <div className="inv-audit-title">Audit Log</div>
                  <div className="inv-audit-live">Live audit</div>
                </div>
                <AuditRow action={<><strong>User joined workspace</strong> — {INVITE.company}</>} time="Just now" />
                <AuditRow action={<><strong>Role assigned</strong> — {INVITE.role}</>} time="Just now" />
                <AuditRow action={<><strong>Task assigned</strong> — Turnover Unit 12B → Elite Clean Co</>} time="14:32 UTC" />
                <AuditRow action={<><strong>SLA started</strong> — Maintenance Unit 8A</>} time="13:18 UTC" />
              </div>
            </main>
          </div>
        </div>
      )}

      {/* ══════════ EDGE: EXPIRED ══════════ */}
      {screen === 'expired' && (
        <div className="inv-screen inv-centered">
          <Logo />
          <div className="inv-card inv-card--error" style={{ textAlign: 'center' }}>
            <div className="inv-error-icon inv-error-icon--warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="inv-title" style={{ marginBottom: '0.5rem' }}>Invitation expired</h2>
            <p className="inv-sub" style={{ marginBottom: '1.75rem' }}>
              This link is no longer valid. Invite links expire after 48 hours.
            </p>
            <div className="inv-edge-box">
              Request a new invite from your administrator.
            </div>
          </div>
        </div>
      )}

      {/* ══════════ EDGE: WRONG EMAIL ══════════ */}
      {screen === 'wrong-email' && (
        <div className="inv-screen inv-centered">
          <Logo />
          <div className="inv-card inv-card--error" style={{ textAlign: 'center' }}>
            <div className="inv-error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="inv-title" style={{ marginBottom: '0.5rem' }}>Wrong email</h2>
            <p className="inv-sub" style={{ marginBottom: '1.75rem' }}>
              This invite was sent to a different email address.
            </p>
            <div className="inv-edge-box">
              Please use the account that received the invite, or ask your administrator to resend.
            </div>
          </div>
        </div>
      )}

      {/* ══════════ EDGE: ALREADY JOINED ══════════ */}
      {screen === 'already-joined' && (
        <div className="inv-screen inv-centered">
          <Logo />
          <div className="inv-card" style={{ textAlign: 'center' }}>
            <div className="inv-success-icon">
              {CHECK_SVG}
            </div>
            <h2 className="inv-title" style={{ marginBottom: '0.5rem' }}>You already have access</h2>
            <p className="inv-sub" style={{ marginBottom: '1.75rem' }}>
              You're already a member of this workspace.
            </p>
            <button className="inv-btn-primary" onClick={() => setScreen('dashboard')}>
              Go to dashboard {ARROW_RIGHT}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ DEV: Edge-case switcher ══════════ */}
      <div className="inv-dev">
        <button onClick={() => setScreen('expired')}>Expired invite</button>
        <button onClick={() => setScreen('wrong-email')}>Wrong email</button>
        <button onClick={() => setScreen('already-joined')}>Already joined</button>
        <button onClick={() => setScreen('existing')}>Existing user</button>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Logo({ small }: { small?: boolean } = {}) {
  return (
    <div className={`inv-logo ${small ? 'inv-logo--sm' : ''}`}>
      <div className="inv-logo-mark" />
      <span>Lookara</span>
    </div>
  );
}

function AuditRow({ action, time }: { action: React.ReactNode; time: string }) {
  return (
    <div className="inv-audit-entry">
      <div className="inv-audit-action">{action}</div>
      <div className="inv-audit-time">{time}</div>
    </div>
  );
}