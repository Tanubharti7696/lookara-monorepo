// apps/public-portal/src/pages/VendorFlow/VendorFlow.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import './VendorFlow.css';

type Screen =
  | 'login'
  | 'invite-landing' | 'invite-setup' | 'invite-boot'
  | 'apply-landing' | 'apply-form' | 'pending-inline'
  | 'dashboard'
  | 'state-pending' | 'state-approved' | 'state-rejected' | 'state-suspended' | 'state-banned';

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const SEND_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
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

const SERVICE_OPTIONS = ['Cleaning', 'Maintenance', 'Inspection', 'Pool / Spa', 'Other'];
const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–3 years', '3–5 years', '5+ years'];

const INVITE = { company: 'Coastal Properties', service: 'Cleaning', invitedBy: 'Marcus R.' };

const INV_BOOT_STEPS = [
  {
    label: 'Attaching to vendor pool',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Preparing available jobs',
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

export default function VendorFlow() {
  const { showToast } = useToast();

  const [screen, setScreen] = useState<Screen>('login');
  const [bootIndex, setBootIndex] = useState(-1);
  const [vendorName, setVendorName] = useState('');
  const [vendorService, setVendorService] = useState('Cleaning');
  const [invited, setInvited] = useState(true); // whether the current dashboard session was via invite

  /* Login state */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginPwVisible, setLoginPwVisible] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: boolean; pw?: boolean }>({});

  /* Invite setup state */
  const [invName, setInvName] = useState('');
  const [invPw, setInvPw] = useState('');
  const [invPhone, setInvPhone] = useState('');
  const [invPwVisible, setInvPwVisible] = useState(false);
  const [invErrors, setInvErrors] = useState<{ name?: boolean; pw?: boolean }>({});

  /* Application state */
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appService, setAppService] = useState('');
  const [appArea, setAppArea] = useState('');
  const [appExperience, setAppExperience] = useState('');
  const [appInsurance, setAppInsurance] = useState<'yes' | 'no' | ''>('');
  const [appErrors, setAppErrors] = useState<Record<string, boolean>>({});

  /* Approved state */
  const [approvedPw, setApprovedPw] = useState('');
  const [approvedPwVisible, setApprovedPwVisible] = useState(false);
  const [approvedError, setApprovedError] = useState(false);

  /* Dashboard state */
  const [acceptedJobs, setAcceptedJobs] = useState<Set<number>>(new Set());
  const [auditEntries, setAuditEntries] = useState<{ action: string; time: string }[]>([
    { action: 'Vendor connected', time: 'Just now' },
    { action: 'Access granted', time: 'Just now' },
  ]);

  /* Boot sequence */
  useEffect(() => {
    if (screen !== 'invite-boot') return;
    setBootIndex(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < INV_BOOT_STEPS.length) {
        setBootIndex(i);
        setTimeout(tick, 900);
      } else {
        setTimeout(() => setScreen('dashboard'), 600);
      }
    };
    const t = setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, [screen]);

  /* ── Handlers ── */
  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitVendorLogin = (e: FormEvent) => {
    e.preventDefault();
    const next: { email?: boolean; pw?: boolean } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) next.email = true;
    if (!loginPw.trim()) next.pw = true;
    if (Object.keys(next).length) {
      setLoginErrors(next);
      return;
    }
    setLoginErrors({});

    const email = loginEmail.trim().toLowerCase();
    setVendorName(email.split('@')[0]);
    setInvited(false);

    setTimeout(() => {
      if (email.startsWith('pending'))   return go('state-pending');
      if (email.startsWith('approved'))  return go('state-approved');
      if (email.startsWith('rejected'))  return go('state-rejected');
      if (email.startsWith('suspended')) return go('state-suspended');
      if (email.startsWith('banned'))    return go('state-banned');
      go('invite-boot');
    }, 700);
  };

  const submitInvSetup = (e: FormEvent) => {
    e.preventDefault();
    const next: { name?: boolean; pw?: boolean } = {};
    if (!invName.trim()) next.name = true;
    if (invPw.length < 8) next.pw = true;
    if (Object.keys(next).length) {
      setInvErrors(next);
      return;
    }
    setInvErrors({});
    setVendorName(invName.trim());
    setInvited(true);
    go('invite-boot');
  };

  const submitApplication = () => {
    const next: Record<string, boolean> = {};
    if (!appName.trim()) next.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(appEmail.trim())) next.email = true;
    if (!appService) next.service = true;
    if (!appArea.trim()) next.area = true;
    if (!appInsurance) next.insurance = true;
    if (Object.keys(next).length) {
      setAppErrors(next);
      return;
    }
    setAppErrors({});
    go('pending-inline');
  };

  const submitApprovedSetup = () => {
    if (approvedPw.length < 8) {
      setApprovedError(true);
      return;
    }
    setApprovedError(false);
    setVendorName('Vendor');
    setInvited(true);
    go('invite-boot');
  };

  const acceptJob = (num: 1 | 2) => {
    setAcceptedJobs((prev) => new Set([...prev, num]));
    const jobName = num === 1 ? 'Turnover — Unit 12B' : 'Deep clean — Unit 8A';
    setAuditEntries((prev) => [
      { action: `SLA started — Timer running`, time: 'Just now' },
      { action: `Job accepted — ${jobName}`, time: 'Just now' },
      ...prev,
    ]);
    showToast('Job accepted. SLA started. Logged.');
  };

  const initials = vendorName
    ? vendorName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'V';

  /* ── Render ── */
  return (
    <div className="vf-page">
      {/* ══════ LOGIN ══════ */}
      {screen === 'login' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--gold">
            <div className="vf-eyebrow">Vendor portal</div>
            <h1 className="vf-title">Log in</h1>
            <p className="vf-sub">Access your workspace and available jobs.</p>

            <form className="vf-form" onSubmit={submitVendorLogin} noValidate>
              <div className="vf-form-group">
                <label className="vf-form-label">Email</label>
                <input
                  type="email"
                  className={`vf-input ${loginErrors.email ? 'error' : ''}`}
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value.toLowerCase().trimStart());
                    if (loginErrors.email) setLoginErrors((x) => ({ ...x, email: false }));
                  }}
                />
                {loginErrors.email && <span className="vf-error">Enter a valid email</span>}
              </div>

              <div className="vf-form-group">
                <label className="vf-form-label">Password</label>
                <div className="vf-pw-wrap">
                  <input
                    type={loginPwVisible ? 'text' : 'password'}
                    className={`vf-input ${loginErrors.pw ? 'error' : ''}`}
                    value={loginPw}
                    onChange={(e) => {
                      setLoginPw(e.target.value);
                      if (loginErrors.pw) setLoginErrors((x) => ({ ...x, pw: false }));
                    }}
                  />
                  <button
                    type="button"
                    className="vf-pw-toggle"
                    onClick={() => setLoginPwVisible((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {loginPwVisible ? EYE_OFF : EYE_OPEN}
                  </button>
                </div>
                {loginErrors.pw && <span className="vf-error">Password is required</span>}
              </div>

              <button type="submit" className="vf-btn-primary" style={{ marginTop: '1.25rem' }}>
                Log In {ARROW_RIGHT}
              </button>
            </form>

            <button
              type="button"
              className="vf-btn-outline"
              onClick={() => showToast('Google sign-in coming soon')}
            >
              Or continue with Google
            </button>

            <div className="vf-login-footer">
              <div>
                <div className="vf-footer-hint">New to Lookara?</div>
                <button type="button" className="vf-link" onClick={() => go('apply-landing')}>
                  Apply as vendor →
                </button>
              </div>
              <div>
                <div className="vf-footer-hint">Have an invitation?</div>
                <button type="button" className="vf-link" onClick={() => go('invite-landing')}>
                  Accept invitation →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ INVITE LANDING ══════ */}
      {screen === 'invite-landing' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--gold">
            <div className="vf-eyebrow">You've been invited to work with</div>
            <h1 className="vf-title">{INVITE.company}</h1>
            <div className="vf-info-block">
              <div className="vf-info-row">
                <span className="vf-info-key">Service</span>
                <span className="vf-info-val">{INVITE.service}</span>
              </div>
              <div className="vf-info-row">
                <span className="vf-info-key">Invited by</span>
                <span className="vf-info-val">{INVITE.invitedBy}</span>
              </div>
            </div>
            <button className="vf-btn-primary" onClick={() => go('invite-setup')}>
              Accept invitation {ARROW_RIGHT}
            </button>
            <div className="vf-footnote">
              Already have an account?{' '}
              <button type="button" className="vf-link" onClick={() => go('login')}>Log in</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ INVITE SETUP ══════ */}
      {screen === 'invite-setup' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <form className="vf-card vf-card--gold" onSubmit={submitInvSetup} noValidate>
            <div className="vf-eyebrow">First time setup</div>
            <h2 className="vf-title">Set up your account</h2>
            <p className="vf-sub">You're already approved for this workspace.</p>

            <div className="vf-form-group">
              <label className="vf-form-label">Full Name</label>
              <input
                type="text"
                className={`vf-input ${invErrors.name ? 'error' : ''}`}
                value={invName}
                onChange={(e) => {
                  setInvName(e.target.value);
                  if (invErrors.name) setInvErrors((x) => ({ ...x, name: false }));
                }}
                autoFocus
              />
              {invErrors.name && <span className="vf-error">Full Name is required</span>}
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">Password</label>
              <div className="vf-pw-wrap">
                <input
                  type={invPwVisible ? 'text' : 'password'}
                  className={`vf-input ${invErrors.pw ? 'error' : ''}`}
                  value={invPw}
                  onChange={(e) => {
                    setInvPw(e.target.value);
                    if (invErrors.pw) setInvErrors((x) => ({ ...x, pw: false }));
                  }}
                />
                <button
                  type="button"
                  className="vf-pw-toggle"
                  onClick={() => setInvPwVisible((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {invPwVisible ? EYE_OFF : EYE_OPEN}
                </button>
              </div>
              {invErrors.pw && <span className="vf-error">Password must be at least 8 characters</span>}
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">
                Phone <span className="vf-opt">(optional)</span>
              </label>
              <input
                type="tel"
                className="vf-input"
                value={invPhone}
                onChange={(e) => setInvPhone(e.target.value)}
                placeholder="e.g. +1 (555) 123-4567"
              />
            </div>

            <button type="submit" className="vf-btn-primary">
              Continue {ARROW_RIGHT}
            </button>
          </form>
        </div>
      )}

      {/* ══════ INVITE BOOT ══════ */}
      {screen === 'invite-boot' && (
        <div className="vf-screen vf-boot">
          <Logo />
          <h2 className="vf-boot-title">Connecting to workspace…</h2>
          <div className="vf-boot-steps">
            {INV_BOOT_STEPS.map((s, i) => {
              const state = i < bootIndex ? 'done' : i === bootIndex ? 'active' : 'idle';
              return (
                <div key={i} className={`vf-boot-step vf-boot-step--${state}`}>
                  <div className="vf-boot-icon">{s.icon}</div>
                  <div className="vf-boot-text">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════ APPLY LANDING ══════ */}
      {screen === 'apply-landing' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--gold">
            <h1 className="vf-title">Apply as a vendor</h1>
            <p className="vf-sub">Join the network through review.</p>

            <div className="vf-note-box">
              Applications are reviewed before activation.
              <br />
              You won't receive jobs until approved.
            </div>

            <button className="vf-btn-primary" onClick={() => go('apply-form')}>
              Start application {ARROW_RIGHT}
            </button>
            <button className="vf-btn-outline" onClick={() => go('invite-landing')}>
              I have an invite →
            </button>
            <div className="vf-footnote">
              Already have an account?{' '}
              <button type="button" className="vf-link" onClick={() => go('login')}>Log in</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ APPLY FORM ══════ */}
      {screen === 'apply-form' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--amber" style={{ maxWidth: 460 }}>
            <div className="vf-eyebrow vf-eyebrow--amber">Your application</div>
            <h2 className="vf-title">Your business</h2>
            <p className="vf-sub">Used to determine activation.</p>

            <div className="vf-form-group">
              <label className="vf-form-label">Full Name</label>
              <input
                type="text"
                className={`vf-input ${appErrors.name ? 'error' : ''}`}
                value={appName}
                onChange={(e) => {
                  setAppName(e.target.value);
                  if (appErrors.name) setAppErrors((x) => ({ ...x, name: false }));
                }}
              />
              {appErrors.name && <span className="vf-error">Full Name is required</span>}
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">Work Email</label>
              <input
                type="email"
                className={`vf-input ${appErrors.email ? 'error' : ''}`}
                value={appEmail}
                onChange={(e) => {
                  setAppEmail(e.target.value.toLowerCase().trimStart());
                  if (appErrors.email) setAppErrors((x) => ({ ...x, email: false }));
                }}
              />
              {appErrors.email && <span className="vf-error">Enter a valid email</span>}
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">Primary service</label>
              <select
                className={`vf-select ${appErrors.service ? 'error' : ''}`}
                value={appService}
                onChange={(e) => {
                  setAppService(e.target.value);
                  if (appErrors.service) setAppErrors((x) => ({ ...x, service: false }));
                }}
              >
                <option value="" disabled>Select service</option>
                {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {appErrors.service && <span className="vf-error">Select a service</span>}
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">Coverage area</label>
              <input
                type="text"
                className={`vf-input ${appErrors.area ? 'error' : ''}`}
                value={appArea}
                onChange={(e) => {
                  setAppArea(e.target.value);
                  if (appErrors.area) setAppErrors((x) => ({ ...x, area: false }));
                }}
                placeholder="e.g. Orlando, FL"
              />
              {appErrors.area && <span className="vf-error">Coverage area is required</span>}
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">
                Years of experience <span className="vf-opt">(optional)</span>
              </label>
              <select
                className="vf-select"
                value={appExperience}
                onChange={(e) => setAppExperience(e.target.value)}
              >
                <option value="" disabled>Select range</option>
                {EXPERIENCE_OPTIONS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">Do you carry insurance?</label>
              <div className="vf-radio-row">
                <label className={`vf-radio-opt ${appInsurance === 'yes' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    checked={appInsurance === 'yes'}
                    onChange={() => {
                      setAppInsurance('yes');
                      if (appErrors.insurance) setAppErrors((x) => ({ ...x, insurance: false }));
                    }}
                  />
                  <div className="vf-r-dot" />
                  <span>Yes</span>
                </label>
                <label className={`vf-radio-opt ${appInsurance === 'no' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    checked={appInsurance === 'no'}
                    onChange={() => {
                      setAppInsurance('no');
                      if (appErrors.insurance) setAppErrors((x) => ({ ...x, insurance: false }));
                    }}
                  />
                  <div className="vf-r-dot" />
                  <span>No</span>
                </label>
              </div>
              {appErrors.insurance && <span className="vf-error">Please answer</span>}
            </div>

            <button className="vf-btn-primary" onClick={submitApplication} style={{ marginTop: '1.25rem' }}>
              Submit application {ARROW_RIGHT}
            </button>
          </div>
        </div>
      )}

      {/* ══════ PENDING (from application) ══════ */}
      {screen === 'pending-inline' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--amber" style={{ textAlign: 'center' }}>
            <div className="vf-icon-circle vf-icon-circle--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <div className="vf-eyebrow vf-eyebrow--amber">Application received</div>
            <h2 className="vf-title" style={{ marginBottom: '0.5rem' }}>Status: Pending</h2>

            <div className="vf-next-block" style={{ textAlign: 'left' }}>
              <div className="vf-next-label">What happens next</div>
              <NextStep num="1" tone="amber">We review your application</NextStep>
              <NextStep num="2" tone="amber">If approved, you'll receive an activation email</NextStep>
              <NextStep num="3" tone="amber">Once active, you can receive and accept jobs</NextStep>
            </div>

            <p className="vf-pending-note">You cannot receive jobs until activation.</p>

            <button className="vf-btn-outline" onClick={() => go('login')} style={{ marginTop: '1.25rem' }}>
              Back to login
            </button>
          </div>
        </div>
      )}

      {/* ══════ DASHBOARD ══════ */}
      {screen === 'dashboard' && (
        <div className="vf-screen vf-dashboard">
          <div className="vf-topbar">
            <div className="vf-topbar-left">
              <Logo small />
              <span className="vf-company">{INVITE.company}</span>
              <span className="vf-vendor-chip">Vendor</span>
            </div>
            <div className="vf-topbar-right">
              <div className="vf-vendor-avatar">{initials}</div>
            </div>
          </div>

          <div className="vf-body">
            <aside className="vf-sidebar">
              <div className="vf-nav-section">Workspace</div>
              <button className="vf-nav-item active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </button>
              <button className="vf-nav-item" onClick={() => showToast('Opening jobs…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                </svg>
                Jobs
              </button>
              <button className="vf-nav-item" onClick={() => showToast('Opening history…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
                History
              </button>
            </aside>

            <main className="vf-main">
              <div className="vf-connected-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <div className="vf-connected-text">
                  You're connected to <strong>{INVITE.company}</strong>.
                </div>
              </div>

              <div className="vf-stats">
                <div className="vf-stat">
                  <div className="vf-stat-val gold">{2 - acceptedJobs.size}</div>
                  <div className="vf-stat-label">Available</div>
                </div>
                <div className="vf-stat">
                  <div className="vf-stat-val green">{acceptedJobs.size}</div>
                  <div className="vf-stat-label">Assigned</div>
                </div>
                <div className="vf-stat">
                  <div className="vf-stat-val">0</div>
                  <div className="vf-stat-label">Completed</div>
                </div>
              </div>

              <p className="vf-section-guide">Accept a job to start. Every action is logged.</p>
              <div className="vf-section-header">
                <div className="vf-section-title">Available jobs</div>
              </div>

              <div className="vf-job-list">
                <JobCard
                  num={1}
                  title="Turnover — Unit 12B"
                  meta="Cleaning"
                  accepted={acceptedJobs.has(1)}
                  onAccept={() => acceptJob(1)}
                />
                <JobCard
                  num={2}
                  title="Deep clean — Unit 8A"
                  meta="Cleaning"
                  accepted={acceptedJobs.has(2)}
                  onAccept={() => acceptJob(2)}
                />
              </div>

              <div className="vf-audit">
                <div className="vf-audit-header">
                  <div className="vf-audit-title">Audit log</div>
                  <div className="vf-audit-live">Live audit</div>
                </div>
                <div className="vf-audit-entries">
                  {auditEntries.map((e, i) => (
                    <div key={i} className="vf-audit-entry">
                      <div className="vf-audit-action">
                        <strong>{e.action.split(' — ')[0]}</strong>
                        {e.action.includes(' — ') && ` — ${e.action.split(' — ')[1]}`}
                      </div>
                      <div className="vf-audit-time">{e.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* ══════ STATE: PENDING ══════ */}
      {screen === 'state-pending' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--amber" style={{ textAlign: 'center' }}>
            <div className="vf-icon-circle vf-icon-circle--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <div className="vf-eyebrow vf-eyebrow--amber">Application received</div>
            <h2 className="vf-title" style={{ marginBottom: '0.5rem' }}>Status: Pending</h2>
            <p className="vf-state-sub">
              Your application is under review. We'll notify you by email when a decision is made.
            </p>

            <div className="vf-next-block" style={{ textAlign: 'left' }}>
              <div className="vf-next-label">What happens next</div>
              <NextStep num="1" tone="amber">We review your application</NextStep>
              <NextStep num="2" tone="amber">If approved, you'll receive an activation email</NextStep>
              <NextStep num="3" tone="amber">Once active, you can accept and complete jobs</NextStep>
            </div>

            <p className="vf-pending-note">You cannot receive jobs until activation.</p>

            <button className="vf-btn-outline" style={{ marginTop: '1.25rem' }} onClick={() => go('login')}>
              Back to login
            </button>
          </div>
        </div>
      )}

      {/* ══════ STATE: APPROVED ══════ */}
      {screen === 'state-approved' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--gold">
            <div className="vf-icon-circle vf-icon-circle--green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <div className="vf-eyebrow vf-eyebrow--green" style={{ textAlign: 'center' }}>
              Application approved
            </div>
            <h2 className="vf-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              Set up your access
            </h2>
            <p className="vf-state-sub">
              You're approved. Set your password to activate your account.
            </p>

            <div className="vf-form-group">
              <label className="vf-form-label">Email</label>
              <input type="email" className="vf-input locked" value="vendor@example.com" readOnly />
            </div>

            <div className="vf-form-group">
              <label className="vf-form-label">Password</label>
              <div className="vf-pw-wrap">
                <input
                  type={approvedPwVisible ? 'text' : 'password'}
                  className={`vf-input ${approvedError ? 'error' : ''}`}
                  value={approvedPw}
                  onChange={(e) => {
                    setApprovedPw(e.target.value);
                    if (approvedError) setApprovedError(false);
                  }}
                />
                <button
                  type="button"
                  className="vf-pw-toggle"
                  onClick={() => setApprovedPwVisible((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {approvedPwVisible ? EYE_OFF : EYE_OPEN}
                </button>
              </div>
              {approvedError && <span className="vf-error">Password must be at least 8 characters</span>}
            </div>

            <button className="vf-btn-primary" onClick={submitApprovedSetup} style={{ marginTop: '1.25rem' }}>
              Activate account {ARROW_RIGHT}
            </button>

            <button className="vf-btn-ghost" onClick={() => go('login')} style={{ marginTop: '1rem' }}>
              ← Back to login
            </button>
          </div>
        </div>
      )}

      {/* ══════ STATE: REJECTED ══════ */}
      {screen === 'state-rejected' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--red">
            <div className="vf-icon-circle vf-icon-circle--red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="vf-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              Application not approved
            </h2>
            <p className="vf-state-sub" style={{ textAlign: 'center' }}>
              Your vendor application was reviewed and not approved at this time.
            </p>

            <div className="vf-info-box" style={{ textAlign: 'center' }}>
              <p>
                If you believe this is an error or have additional information to share,
                contact us at <a href="mailto:support@lookara.com">support@lookara.com</a>
              </p>
            </div>

            <button className="vf-btn-ghost" onClick={() => go('login')} style={{ marginTop: '1.25rem' }}>
              ← Back to login
            </button>
          </div>
        </div>
      )}

      {/* ══════ STATE: SUSPENDED ══════ */}
      {screen === 'state-suspended' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--red">
            <div className="vf-icon-circle vf-icon-circle--red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="vf-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              Account suspended
            </h2>
            <p className="vf-state-sub" style={{ textAlign: 'center' }}>
              Your vendor account has been suspended. You cannot receive or complete jobs.
            </p>

            <div className="vf-info-box">
              <div className="vf-info-box-label">What this means</div>
              <XRow>No new job dispatches</XRow>
              <XRow>No access to active jobs</XRow>
              <XRow>Removed from all vendor pools</XRow>
            </div>

            <div className="vf-info-box" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              Contact your property manager or{' '}
              <a href="mailto:support@lookara.com">support@lookara.com</a> for more information.
            </div>

            <button className="vf-btn-ghost" onClick={() => go('login')} style={{ marginTop: '1.25rem' }}>
              ← Back to login
            </button>
          </div>
        </div>
      )}

      {/* ══════ STATE: BANNED ══════ */}
      {screen === 'state-banned' && (
        <div className="vf-screen vf-centered">
          <Logo />
          <div className="vf-card vf-card--red">
            <div className="vf-icon-circle vf-icon-circle--red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <h2 className="vf-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              Access removed
            </h2>
            <p className="vf-state-sub" style={{ textAlign: 'center' }}>
              Your vendor access has been removed by the property manager.
            </p>

            <div className="vf-info-box vf-info-box--crimson">
              <div className="vf-info-box-label vf-info-box-label--crimson">Access removed</div>
              <XRow>No access to any workspace</XRow>
              <XRow>No job dispatches</XRow>
              <XRow>Removed from all vendor pools</XRow>
              <XRow>All audit records retained</XRow>
            </div>

            <div className="vf-info-box" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              This decision was made by your property manager.
              <br />
              For questions: <a href="mailto:support@lookara.com">support@lookara.com</a>
            </div>

            <button className="vf-btn-ghost" onClick={() => go('login')} style={{ marginTop: '1.25rem' }}>
              ← Back to login
            </button>
          </div>
        </div>
      )}

      {/* ══════ DEV: Screen switcher ══════ */}
      <div className="vf-dev">
        <button onClick={() => go('login')}>Login</button>
        <button onClick={() => go('apply-landing')}>Apply</button>
        <button onClick={() => go('invite-landing')}>Invite</button>
        <button onClick={() => go('state-pending')}>Pending</button>
        <button onClick={() => go('state-approved')}>Approved</button>
        <button onClick={() => go('state-rejected')}>Rejected</button>
        <button onClick={() => go('state-suspended')}>Suspended</button>
        <button onClick={() => go('state-banned')}>Banned</button>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Logo({ small }: { small?: boolean } = {}) {
  return (
    <div className={`vf-logo ${small ? 'vf-logo--sm' : ''}`}>
      <div className="vf-logo-mark" />
      <span>Lookara</span>
    </div>
  );
}

function NextStep({ num, tone, children }: { num: string; tone: 'amber' | 'green'; children: React.ReactNode }) {
  return (
    <div className="vf-next-row">
      <span className={`vf-next-num vf-next-num--${tone}`}>{num}</span>
      {children}
    </div>
  );
}

function XRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="vf-x-row">
      <span className="vf-x-mark">✕</span>
      {children}
    </div>
  );
}

function JobCard({
  num,
  title,
  meta,
  accepted,
  onAccept,
}: {
  num: 1 | 2;
  title: string;
  meta: string;
  accepted: boolean;
  onAccept: () => void;
}) {
  return (
    <div className="vf-job-card">
      <div className={`vf-job-dot ${accepted ? 'green' : 'gold'}`} />
      <div className="vf-job-info">
        <div className="vf-job-name">{title}{accepted && ' — Accepted'}</div>
        <div className="vf-job-meta">{meta}</div>
      </div>
      <span className={`vf-job-sla ${accepted ? 'active' : 'open'}`}>
        {accepted ? 'SLA started' : 'Open'}
      </span>
      <button
        type="button"
        className={`vf-job-btn ${accepted ? 'done' : ''}`}
        onClick={onAccept}
        disabled={accepted}
      >
        {accepted ? '✓ Accepted' : 'Accept'}
      </button>
    </div>
  );
}