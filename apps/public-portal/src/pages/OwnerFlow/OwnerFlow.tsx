// apps/public-portal/src/pages/OwnerFlow/OwnerFlow.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import './OwnerFlow.css';

type Screen =
  | 'gateway'
  | 'login' | 'invite' | 'create-pw' | 'boot' | 'dashboard'
  | 'blocked-pm-gone'
  | 'request-pm' | 'request-sent';

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

const INVITE = {
  portfolio: 'Coastal Properties',
  grantedBy: 'Marcus R.',
  email: 'owner@coastalproperties.com',
};

const BOOT_STEPS = [
  {
    label: 'Verifying access',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Loading portfolio data',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: 'Preparing activity feed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
];

export default function OwnerFlow() {
  const { showToast } = useToast();

  const [screen, setScreen] = useState<Screen>('gateway');
  const [bootIndex, setBootIndex] = useState(-1);

  /* Login */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginPwVisible, setLoginPwVisible] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: boolean; pw?: boolean }>({});

  /* Create password */
  const [setupName, setSetupName] = useState('');
  const [setupPw, setSetupPw] = useState('');
  const [setupPwVisible, setSetupPwVisible] = useState(false);
  const [setupErrors, setSetupErrors] = useState<{ name?: boolean; pw?: boolean }>({});

  /* Request PM */
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPmName, setReqPmName] = useState('');
  const [reqPmEmail, setReqPmEmail] = useState('');
  const [reqErrors, setReqErrors] = useState<{ name?: boolean; email?: boolean }>({});

  /* Boot sequence */
  useEffect(() => {
    if (screen !== 'boot') return;
    setBootIndex(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < BOOT_STEPS.length) {
        setBootIndex(i);
        setTimeout(tick, 900);
      } else {
        setTimeout(() => setScreen('dashboard'), 600);
      }
    };
    const t = setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, [screen]);

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitLogin = (e: FormEvent) => {
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
    setTimeout(() => {
      if (email === INVITE.email) {
        go('boot');
      } else {
        go('blocked-pm-gone');
      }
    }, 700);
  };

  const submitSetup = (e: FormEvent) => {
    e.preventDefault();
    const next: { name?: boolean; pw?: boolean } = {};
    if (!setupName.trim()) next.name = true;
    if (setupPw.length < 8) next.pw = true;
    if (Object.keys(next).length) {
      setSetupErrors(next);
      return;
    }
    setSetupErrors({});
    go('boot');
  };

  const submitRequest = (e: FormEvent) => {
    e.preventDefault();
    const next: { name?: boolean; email?: boolean } = {};
    if (!reqName.trim()) next.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reqEmail.trim())) next.email = true;
    if (Object.keys(next).length) {
      setReqErrors(next);
      return;
    }
    setReqErrors({});
    go('request-sent');
  };

  return (
    <div className="of-page">
      {/* ══════ GATEWAY ══════ */}
      {screen === 'gateway' && (
        <div className="of-screen of-centered">
          <Logo />
          <div className="of-card of-card--gold">
            <div className="of-eyebrow">Owner access</div>
            <h1 className="of-title">View your property activity.</h1>
            <p className="of-sub">Full transparency. No operational control.</p>

            <button className="of-btn-primary" onClick={() => go('login')}>
              Access your owner view {ARROW_RIGHT}
            </button>

            <div className="of-divider"><span>don't have access?</span></div>

            <button className="of-btn-outline" onClick={() => go('request-pm')}>
              I want my property manager to use Lookara
            </button>

            <p className="of-gateway-note">
              Already invited? Check your email for an access link.
            </p>
          </div>
        </div>
      )}

      {/* ══════ LOGIN ══════ */}
      {screen === 'login' && (
        <div className="of-screen of-centered">
          <Logo />
          <form className="of-card of-card--gold" onSubmit={submitLogin} noValidate>
            <div className="of-eyebrow">Owner access</div>
            <h2 className="of-title">Log in</h2>
            <p className="of-sub">Enter your credentials to access your owner view.</p>

            <div className="of-form-group">
              <label className="of-form-label">Email</label>
              <input
                type="email"
                className={`of-input ${loginErrors.email ? 'error' : ''}`}
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value.toLowerCase().trimStart());
                  if (loginErrors.email) setLoginErrors((x) => ({ ...x, email: false }));
                }}
              />
              {loginErrors.email && <span className="of-error">Enter a valid email</span>}
            </div>

            <div className="of-form-group">
              <label className="of-form-label">Password</label>
              <div className="of-pw-wrap">
                <input
                  type={loginPwVisible ? 'text' : 'password'}
                  className={`of-input ${loginErrors.pw ? 'error' : ''}`}
                  value={loginPw}
                  onChange={(e) => {
                    setLoginPw(e.target.value);
                    if (loginErrors.pw) setLoginErrors((x) => ({ ...x, pw: false }));
                  }}
                />
                <button
                  type="button"
                  className="of-pw-toggle"
                  onClick={() => setLoginPwVisible((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {loginPwVisible ? EYE_OFF : EYE_OPEN}
                </button>
              </div>
              {loginErrors.pw && <span className="of-error">Password is required</span>}
            </div>

            <button type="submit" className="of-btn-primary" style={{ marginTop: '1.25rem' }}>
              Log In {ARROW_RIGHT}
            </button>

            <button type="button" className="of-btn-ghost" onClick={() => go('gateway')}>
              ← Back
            </button>

            <div className="of-login-note">
              Owner access is granted by your property manager.
              <br />
              Contact them if you need access.
            </div>
          </form>
        </div>
      )}

      {/* ══════ INVITE ══════ */}
      {screen === 'invite' && (
        <div className="of-screen of-centered">
          <Logo />
          <div className="of-card of-card--gold">
            <div className="of-eyebrow">You've been granted access</div>
            <h1 className="of-title">Owner view</h1>
            <p className="of-sub">
              Your property manager has given you read-only visibility into your portfolio.
            </p>

            <div className="of-info-block">
              <div className="of-info-row">
                <span className="of-info-key">Portfolio</span>
                <span className="of-info-val">{INVITE.portfolio}</span>
              </div>
              <div className="of-info-row">
                <span className="of-info-key">Access</span>
                <span className="of-info-badge">Read-only</span>
              </div>
              <div className="of-info-row">
                <span className="of-info-key">Granted by</span>
                <span className="of-info-val">{INVITE.grantedBy}</span>
              </div>
            </div>

            <button className="of-btn-primary" onClick={() => go('create-pw')}>
              Continue {ARROW_RIGHT}
            </button>
          </div>
        </div>
      )}

      {/* ══════ CREATE PASSWORD ══════ */}
      {screen === 'create-pw' && (
        <div className="of-screen of-centered">
          <Logo />
          <form className="of-card of-card--gold" onSubmit={submitSetup} noValidate>
            <div className="of-eyebrow">Access granted</div>
            <h2 className="of-title">Create your password</h2>
            <p className="of-sub">Your access has been set up by your property manager.</p>

            <div className="of-form-group">
              <label className="of-form-label">Email</label>
              <input type="email" className="of-input locked" value={INVITE.email} readOnly />
            </div>

            <div className="of-form-group">
              <label className="of-form-label">Full Name</label>
              <input
                type="text"
                className={`of-input ${setupErrors.name ? 'error' : ''}`}
                value={setupName}
                onChange={(e) => {
                  setSetupName(e.target.value);
                  if (setupErrors.name) setSetupErrors((x) => ({ ...x, name: false }));
                }}
                autoFocus
              />
              {setupErrors.name && <span className="of-error">Full Name is required</span>}
            </div>

            <div className="of-form-group">
              <label className="of-form-label">Password</label>
              <div className="of-pw-wrap">
                <input
                  type={setupPwVisible ? 'text' : 'password'}
                  className={`of-input ${setupErrors.pw ? 'error' : ''}`}
                  value={setupPw}
                  onChange={(e) => {
                    setSetupPw(e.target.value);
                    if (setupErrors.pw) setSetupErrors((x) => ({ ...x, pw: false }));
                  }}
                />
                <button
                  type="button"
                  className="of-pw-toggle"
                  onClick={() => setSetupPwVisible((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {setupPwVisible ? EYE_OFF : EYE_OPEN}
                </button>
              </div>
              {setupErrors.pw && <span className="of-error">Password must be at least 8 characters</span>}
            </div>

            <button type="submit" className="of-btn-primary">
              Continue {ARROW_RIGHT}
            </button>
            <button type="button" className="of-btn-ghost" onClick={() => go('login')}>
              Already set up? Log in instead
            </button>
          </form>
        </div>
      )}

      {/* ══════ BOOT ══════ */}
      {screen === 'boot' && (
        <div className="of-screen of-boot">
          <Logo />
          <h2 className="of-boot-title">Loading your owner view…</h2>
          <div className="of-boot-steps">
            {BOOT_STEPS.map((s, i) => {
              const state = i < bootIndex ? 'done' : i === bootIndex ? 'active' : 'idle';
              return (
                <div key={i} className={`of-boot-step of-boot-step--${state}`}>
                  <div className="of-boot-icon">{s.icon}</div>
                  <div className="of-boot-text">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════ DASHBOARD PLACEHOLDER ══════ */}
      {screen === 'dashboard' && (
        <div className="of-screen of-centered of-dash-screen">
          <Logo />
          <div className="of-dash">
            <div className="of-dash-header">
              <div className="of-dash-header-left">
                <h3>{INVITE.portfolio}</h3>
                <p>Owner view · Read-only</p>
              </div>
              <span className="of-coming-badge">Coming soon</span>
            </div>

            <div className="of-dash-grid">
              <div className="of-dash-stat">
                <div className="of-dash-stat-val">—</div>
                <div className="of-dash-stat-label">Occupancy</div>
              </div>
              <div className="of-dash-stat">
                <div className="of-dash-stat-val">—</div>
                <div className="of-dash-stat-label">Active stays</div>
              </div>
              <div className="of-dash-stat">
                <div className="of-dash-stat-val">—</div>
                <div className="of-dash-stat-label">Cleanings done</div>
              </div>
            </div>

            <div className="of-dash-feed">
              <div className="of-dash-feed-header">Recent activity</div>
              <FeedRow>Activity will appear here</FeedRow>
              <FeedRow>Property updates will appear here</FeedRow>
              <FeedRow>Operational events will appear here</FeedRow>
            </div>

            <div className="of-dash-note">
              <p>
                Your full owner dashboard is being prepared.
                Your property manager will activate your complete view.
              </p>
              <button className="of-btn-outline" onClick={() => go('login')} style={{ marginTop: '1.25rem' }}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ BLOCKED: PM GONE ══════ */}
      {screen === 'blocked-pm-gone' && (
        <div className="of-screen of-centered">
          <Logo />
          <div className="of-card of-card--red">
            <div className="of-icon-circle of-icon-circle--red" style={{ marginBottom: '1.5rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="of-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              Access not available
            </h2>
            <p className="of-sub" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              Your property manager is no longer active on Lookara.
            </p>

            <div className="of-info-box">
              <div className="of-info-box-label">Why this happened</div>
              <p>
                Owner access depends on an active manager connection. When your property
                manager's account is no longer active, your owner view is suspended automatically.
              </p>
            </div>

            <div className="of-info-box" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <div className="of-info-box-label">What you can do</div>
              <div className="of-arrow-row">
                <span className="of-arrow-mark">→</span>
                Contact your property to confirm who manages it now
              </div>
              <div className="of-arrow-row">
                <span className="of-arrow-mark">→</span>
                Ask your new property manager to invite you on Lookara
              </div>
            </div>

            <button className="of-btn-primary" onClick={() => go('request-pm')}>
              Invite a property manager to Lookara {ARROW_RIGHT}
            </button>

            <div className="of-footnote" style={{ marginTop: '1rem' }}>
              Questions? <a href="mailto:support@lookara.com">support@lookara.com</a>
            </div>
          </div>
        </div>
      )}

      {/* ══════ REQUEST PM ══════ */}
      {screen === 'request-pm' && (
        <div className="of-screen of-centered">
          <Logo />
          <form className="of-card of-card--amber" onSubmit={submitRequest} noValidate>
            <div className="of-eyebrow of-eyebrow--amber">Bring your PM to Lookara</div>
            <h2 className="of-title">Request access for your property</h2>
            <p className="of-sub">
              We'll reach out to your property manager. Once they're active, you'll receive
              owner access automatically.
            </p>

            <div className="of-form-group">
              <label className="of-form-label">Your name</label>
              <input
                type="text"
                className={`of-input ${reqErrors.name ? 'error' : ''}`}
                value={reqName}
                onChange={(e) => {
                  setReqName(e.target.value);
                  if (reqErrors.name) setReqErrors((x) => ({ ...x, name: false }));
                }}
              />
              {reqErrors.name && <span className="of-error">Your name is required</span>}
            </div>

            <div className="of-form-group">
              <label className="of-form-label">Your email</label>
              <input
                type="email"
                className={`of-input ${reqErrors.email ? 'error' : ''}`}
                value={reqEmail}
                onChange={(e) => {
                  setReqEmail(e.target.value.toLowerCase().trimStart());
                  if (reqErrors.email) setReqErrors((x) => ({ ...x, email: false }));
                }}
              />
              {reqErrors.email && <span className="of-error">Enter a valid email</span>}
            </div>

            <div className="of-form-group">
              <label className="of-form-label">
                Property manager name <span className="of-opt">(optional)</span>
              </label>
              <input
                type="text"
                className="of-input"
                value={reqPmName}
                onChange={(e) => setReqPmName(e.target.value)}
              />
            </div>

            <div className="of-form-group">
              <label className="of-form-label">
                Property manager email <span className="of-opt">(optional)</span>
              </label>
              <input
                type="email"
                className="of-input"
                value={reqPmEmail}
                onChange={(e) => setReqPmEmail(e.target.value.toLowerCase().trimStart())}
              />
            </div>

            <button type="submit" className="of-btn-primary" style={{ marginTop: '1.25rem' }}>
              Submit request {SEND_ICON}
            </button>
            <button type="button" className="of-btn-ghost" onClick={() => go('gateway')}>
              ← Back
            </button>
          </form>
        </div>
      )}

      {/* ══════ REQUEST SENT ══════ */}
      {screen === 'request-sent' && (
        <div className="of-screen of-centered">
          <Logo />
          <div className="of-card of-card--success" style={{ textAlign: 'center' }}>
            <div className="of-icon-circle of-icon-circle--green">
              {SEND_ICON}
            </div>
            <div className="of-eyebrow of-eyebrow--green">Request sent</div>
            <h2 className="of-title" style={{ marginBottom: '0.5rem' }}>
              We'll contact your property manager.
            </h2>
            <p className="of-sub" style={{ marginBottom: '1.5rem' }}>
              Once they're active on Lookara, you'll receive access to your owner view.
            </p>

            <div className="of-next-block" style={{ textAlign: 'left' }}>
              <div className="of-next-label">What happens next</div>
              <NextRow num="1" tone="green">We reach out to your property manager</NextRow>
              <NextRow num="2" tone="green">They set up the workspace on Lookara</NextRow>
              <NextRow num="3" tone="green">You receive your owner access invite</NextRow>
            </div>
          </div>
        </div>
      )}

      {/* ══════ DEV: Screen switcher ══════ */}
      <div className="of-dev">
        <button onClick={() => go('gateway')}>Gateway</button>
        <button onClick={() => go('invite')}>Invite</button>
        <button onClick={() => go('create-pw')}>Create pw</button>
        <button onClick={() => go('boot')}>Boot</button>
        <button onClick={() => go('dashboard')}>Dashboard</button>
        <button onClick={() => go('blocked-pm-gone')}>Blocked</button>
        <button onClick={() => go('request-pm')}>Request PM</button>
        <button onClick={() => go('request-sent')}>Sent</button>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Logo() {
  return (
    <div className="of-logo">
      <div className="of-logo-mark" />
      <span>Lookara</span>
    </div>
  );
}

function FeedRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="of-dash-feed-row">
      <div className="of-dash-dot" />
      <div className="of-dash-text">{children}</div>
    </div>
  );
}

function NextRow({ num, tone, children }: { num: string; tone: 'green' | 'amber'; children: React.ReactNode }) {
  return (
    <div className="of-next-row">
      <span className={`of-next-num of-next-num--${tone}`}>{num}</span>
      {children}
    </div>
  );
}