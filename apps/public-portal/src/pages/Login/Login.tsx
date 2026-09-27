// apps/public-portal/src/pages/Login/Login.tsx
import { useState, type FormEvent, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Login.css';

type AuthPage = 'login' | 'forgot' | 'reset';

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

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ARROW_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const SEND_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
);

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());

/* ── Password input with toggle ── */
function PasswordInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-wrapper">
      <input
        type={visible ? 'text' : 'password'}
        className={`form-input ${error ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label="Toggle password visibility"
      >
        {visible ? EYE_OFF : EYE_OPEN}
      </button>
    </div>
  );
}

export default function Login() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState<AuthPage>('login');

  // Read hash → initial page
  useEffect(() => {
    const hash = (location.hash || '').replace('#', '');
    if (hash === 'forgot' || hash === 'reset') setPage(hash);
  }, [location.hash]);

  const go = (next: AuthPage) => {
    setPage(next);
    try {
      window.history.replaceState(null, '', `#${next}`);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="login-page">
      <div className="auth-layout">
        {/* ── BRAND PANEL ── */}
        <aside className="auth-brand">
          <div className="brand-top">
            <div className="brand-logo">
              <div className="logo-mark" />
              <span className="brand-name">Lookara</span>
            </div>
            <h1 className="brand-headline">
              Operations OS for
              <br />
              <span className="highlight">serious STR teams.</span>
            </h1>
          </div>

          <div className="brand-bottom">
            <Link to="/" className="brand-back">
              {ARROW_LEFT}
              Back to site
            </Link>
          </div>
        </aside>

        {/* ── FORM PANEL ── */}
        <main className="auth-main">
          <div className="auth-form-container">
            {page === 'login' && (
              <LoginForm onForgot={() => go('forgot')} onSuccess={() => navigate('/')} showToast={showToast} />
            )}
            {page === 'forgot' && (
              <ForgotForm onBack={() => go('login')} showToast={showToast} />
            )}
            {page === 'reset' && (
              <ResetForm onBack={() => go('login')} showToast={showToast} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════ LOGIN ═══════════ */
function LoginForm({
  onForgot,
  onSuccess,
  showToast,
}: {
  onForgot: () => void;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [pendingWorkspaces, setPendingWorkspaces] = useState<any[] | null>(null);
  const [pendingToken, setPendingToken] = useState<string>('');

  const fillDemo = (e: string) => {
    setEmail(e);
    setPassword('password123');
    setErrors({});
    showToast(`Loaded ${e} demo credentials`);
  };

  const redirectUser = (portal: string, token: string) => {
    const metaEnv = (import.meta as any).env;
    const PORTAL_URLS: Record<string, string> = {
      pm: metaEnv?.VITE_PM_PORTAL_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5175' : 'https://lookara-monorepo-pm-portal-lvld.vercel.app'),
      owner: metaEnv?.VITE_OWNER_PORTAL_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5174' : 'https://owner-portal-three.vercel.app'),
      vendor: metaEnv?.VITE_VENDOR_PORTAL_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5176' : 'https://vendor-portal-two-nu.vercel.app'),
      admin: metaEnv?.VITE_ADMIN_PORTAL_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5177' : 'https://admin-portal-nu-drab.vercel.app'),
      trust: metaEnv?.VITE_TRUST_PORTAL_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5178' : 'https://trust-portal-ebon.vercel.app'),
    };
    const targetUrl = PORTAL_URLS[portal] || (window.location.hostname === 'localhost' ? 'http://localhost:5175' : 'https://pm-portal-pi.vercel.app');
    showToast('Redirecting to your workspace…');
    setTimeout(() => {
      window.location.href = `${targetUrl}?token=${encodeURIComponent(token)}`;
    }, 500);
  };

  const getApiUrl = (endpoint: string) => {
    const metaEnv = (import.meta as any).env;
    const baseUrl = "https://lookara-backend-uqhc.onrender.com";
    return `${baseUrl}${endpoint}`;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: { email?: boolean; password?: boolean } = {};
    if (!validateEmail(email)) next.email = true;
    if (!password.trim()) next.password = true;

    if (Object.keys(next).length) {
      setErrors(next);
      showToast('Please fill in all fields.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let json;
      const apiUrl = getApiUrl('/api/v1/auth/login');
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      json = await res.json();
      if (!res.ok) {
        const errorMsg = json.errors?.[0]?.message || 'Invalid email or password';
        showToast(errorMsg);
        setLoading(false);
        return;
      }

      const { user, accessToken, refreshToken, activeContext, availableWorkspaces } = json.data;

      localStorage.setItem('lookara_token', accessToken);
      localStorage.setItem('lookara_refresh_token', refreshToken);
      localStorage.setItem('lookara_user', JSON.stringify(user));

      if (availableWorkspaces && availableWorkspaces.length > 1) {
        setPendingWorkspaces(availableWorkspaces);
        setPendingToken(accessToken);
        setLoading(false);
        return;
      }

      redirectUser(activeContext.portal, accessToken);
    } catch {
      // Graceful fallback for web preview demo
      const role = email.includes('owner') ? 'owner' : email.includes('vendor') ? 'vendor' : email.includes('admin') ? 'admin' : email.includes('trust') ? 'trust' : 'pm';
      localStorage.setItem('lookara_token', 'demo_token_' + Date.now());
      localStorage.setItem('lookara_user', JSON.stringify({ email, name: email.split('@')[0], role }));
      redirectUser(role, 'demo_token_' + Date.now());
    }
  };

  const selectWorkspace = async (workspace: any) => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl('/api/v1/auth/switch-context'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pendingToken}`,
        },
        body: JSON.stringify({ organizationId: workspace.organizationId, portal: 'pm' }),
      });
      const json = await res.json();
      const token = json.data?.accessToken || pendingToken;
      redirectUser('pm', token);
    } catch {
      redirectUser('pm', pendingToken);
    }
  };

  return (
    <>
      <div className="form-header">
        <h2>Log in</h2>
        <p>Access your workspace</p>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((x) => ({ ...x, email: false }));
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <PasswordInput
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password) setErrors((x) => ({ ...x, password: false }));
            }}
            error={errors.password}
          />
        </div>

        <div className="form-row">
          <label className="form-checkbox">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>
          <button type="button" className="form-link" onClick={onForgot}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Signing in…' : (<>Log In {ARROW_RIGHT}</>)}
        </button>
      </form>

      {/* ── Demo Accounts Bar ── */}
      <div className="demo-block">
        <div className="demo-title">
          <span>⚡ Demo Quick-Fill</span>
          <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>pw: password123</span>
        </div>
        <div className="demo-chips">
          <button type="button" className="demo-chip" onClick={() => fillDemo('pm@lookara.com')}>
            PM Admin (Blue Wave)
          </button>
          <button type="button" className="demo-chip" onClick={() => fillDemo('ops@lookara.com')}>
            Ops Manager (Coastal)
          </button>
          <button type="button" className="demo-chip" onClick={() => fillDemo('owner@lookara.com')}>
            Owner (Marcus S.)
          </button>
          <button type="button" className="demo-chip" onClick={() => fillDemo('vendor@lookara.com')}>
            Vendor (Apex Pro)
          </button>
          <button type="button" className="demo-chip" onClick={() => fillDemo('admin@lookara.com')}>
            Platform Admin
          </button>
        </div>
      </div>

      <button
        type="button"
        className="btn-social"
        onClick={() => showToast('Google sign-in coming in Phase 2')}
      >
        {GOOGLE_ICON}
        Or continue with Google
      </button>

      <div className="access-block">
        <div className="access-block-label">New to Lookara?</div>
        <div className="access-rows">
          <div className="access-row">
            <div className="access-row-label">Property Manager</div>
            <Link to="/request-access" className="access-row-link">Request access →</Link>
          </div>
          <div className="access-row">
            <div className="access-row-label">Vendor</div>
            <Link to="/request-access" className="access-row-link">Apply →</Link>
          </div>
          <div className="access-row">
            <div className="access-row-label">Owner</div>
            <Link to="/contact" className="access-row-link">Invite-only →</Link>
          </div>
        </div>
      </div>

      {/* Workspace Selector Modal */}
      {pendingWorkspaces && (
        <div className="workspace-selector-overlay">
          <div className="workspace-selector-card">
            <h3 className="workspace-selector-title">Select Workspace</h3>
            <p className="workspace-selector-sub">You have access to multiple property management organizations.</p>
            {pendingWorkspaces.map((ws) => (
              <button
                key={ws.organizationId}
                type="button"
                className="workspace-item"
                onClick={() => selectWorkspace(ws)}
              >
                <div>
                  <div className="workspace-name">{ws.organizationName}</div>
                  <div className="workspace-role">Role: {ws.role}</div>
                </div>
                <span>→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════ FORGOT ═══════════ */
function ForgotForm({ onBack, showToast }: { onBack: () => void; showToast: (m: string) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError(true);
      showToast('Enter a valid email.');
      return;
    }
    setError(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Reset link sent — check your inbox.');
      setEmail('');
    }, 700);
  };

  return (
    <>
      <button type="button" className="back-link" onClick={onBack}>
        {ARROW_LEFT}
        Back to login
      </button>

      <div className="form-header">
        <h2>Forgot password?</h2>
        <p>Enter your email and we'll send a reset link</p>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-input ${error ? 'error' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(false);
            }}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Sending…' : (<>Send Reset Link {SEND_ICON}</>)}
        </button>
      </form>

      <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
        <button type="button" className="form-link" onClick={onBack}>Back to login</button>
      </div>
    </>
  );
}

/* ═══════════ RESET ═══════════ */
function ResetForm({ onBack, showToast }: { onBack: () => void; showToast: (m: string) => void }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ pw?: boolean; confirm?: boolean }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: { pw?: boolean; confirm?: boolean } = {};
    if (pw.length < 8) next.pw = true;
    if (pw !== confirm) next.confirm = true;

    if (Object.keys(next).length) {
      setErrors(next);
      showToast('Passwords must match and be at least 8 characters.');
      return;
    }

    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Password updated. Logging you in…');
      setTimeout(onBack, 1500);
    }, 700);
  };

  return (
    <>
      <button type="button" className="back-link" onClick={onBack}>
        {ARROW_LEFT}
        Back to login
      </button>

      <div className="success-banner">
        {CHECK_ICON}
        <span>Email verified. Set your new password below.</span>
      </div>

      <div className="form-header">
        <h2>Set new password</h2>
        <p>Must be at least 8 characters</p>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <PasswordInput
            value={pw}
            onChange={(v) => {
              setPw(v);
              if (errors.pw) setErrors((x) => ({ ...x, pw: false }));
            }}
            error={errors.pw}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <PasswordInput
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              if (errors.confirm) setErrors((x) => ({ ...x, confirm: false }));
            }}
            error={errors.confirm}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving…' : (<>Reset Password {ARROW_RIGHT}</>)}
        </button>
      </form>
    </>
  );
}