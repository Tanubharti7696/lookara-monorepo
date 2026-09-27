// apps/public-portal/src/pages/Onboarding/Onboarding.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Onboarding.css';

type Screen = 'welcome' | 'step1' | 'step2' | 'boot' | 'dashboard';

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

const CHECK_CIRCLE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
);

const TZ_OPTIONS = [
  { value: 'America/New_York',    label: 'Eastern Time (ET)' },
  { value: 'America/Chicago',     label: 'Central Time (CT)' },
  { value: 'America/Denver',      label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix',     label: 'Arizona (MST)' },
  { value: 'America/Anchorage',   label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii (HST)' },
];

const BOOT_STEPS = [
  {
    label: 'Creating initial task structure',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    label: 'Initializing compliance tracking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'Preparing vendor dispatch flow',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export default function Onboarding() {
  const { showToast } = useToast();

  const [screen, setScreen] = useState<Screen>('welcome');
  const [bootIndex, setBootIndex] = useState(-1);

  const [wsName, setWsName] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [propName, setPropName] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propType, setPropType] = useState<'STR' | 'Mixed'>('STR');

  const [errors, setErrors] = useState<{ ws?: boolean; prop?: boolean; city?: boolean }>({});

  /* Vendor overlay + first action tip */
  const [vendorOverlay, setVendorOverlay] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorService, setVendorService] = useState<'Cleaning' | 'Maintenance'>('Cleaning');
  const [vendorAdded, setVendorAdded] = useState(false);

  /* Auto-detect timezone */
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (TZ_OPTIONS.some((o) => o.value === tz)) setTimezone(tz);
    } catch {
      /* noop */
    }
  }, []);

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
        setTimeout(() => setScreen('dashboard'), 1000);
      }
    };
    const timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [screen]);

  /* First-action tip */
  useEffect(() => {
    if (screen !== 'dashboard') return;
    const t = setTimeout(() => setTipVisible(true), 1200);
    return () => clearTimeout(t);
  }, [screen]);

  const submitWorkspace = () => {
    if (!wsName.trim()) {
      setErrors({ ws: true });
      return;
    }
    setErrors({});
    setScreen('step2');
  };

  const submitProperty = () => {
    const next: { prop?: boolean; city?: boolean } = {};
    if (!propName.trim()) next.prop = true;
    if (!propCity.trim()) next.city = true;
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setScreen('boot');
  };

  const openVendorOverlay = () => {
    setVendorOverlay(true);
    setTipVisible(false);
  };

  const addVendor = () => {
    if (!vendorName.trim()) return;
    setVendorAdded(true);
    setVendorOverlay(false);
    showToast('Vendor assigned. SLA started. Audit logged.');
  };

  /* ── RENDER ── */
  return (
    <div className="ob-page">
      {/* ══════════ WELCOME ══════════ */}
      {screen === 'welcome' && (
        <div className="ob-screen ob-setup">
          <Logo />

          <div className="ob-card ob-card--centered">
            <div className="ob-success-icon">{CHECK_CIRCLE}</div>
            <div className="ob-eyebrow">Access Approved</div>
            <h1 className="ob-title">Welcome to Lookara</h1>
            <p className="ob-sub" style={{ marginBottom: 0 }}>
              Let's set up your workspace.
            </p>
            <button className="ob-btn-primary" onClick={() => setScreen('step1')} style={{ marginTop: '2rem' }}>
              Start Setup {ARROW_RIGHT}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ STEP 1 — WORKSPACE ══════════ */}
      {screen === 'step1' && (
        <div className="ob-screen ob-setup">
          <Logo />
          <div className="ob-progress">
            <span className="ob-dot active" />
            <span className="ob-dot" />
          </div>

          <div className="ob-card">
            <div className="ob-step-label">Step 1 of 2</div>
            <h2 className="ob-title">
              Your <span className="highlight">workspace</span>
            </h2>
            <p className="ob-sub">This is your operations base.</p>

            <div className="ob-form-group">
              <label className="ob-form-label">Workspace name</label>
              <input
                type="text"
                className={`ob-input ${errors.ws ? 'error' : ''}`}
                value={wsName}
                onChange={(e) => {
                  setWsName(e.target.value);
                  if (errors.ws) setErrors({});
                }}
                placeholder="e.g. Coastal Properties"
                autoFocus
              />
            </div>
            <div className="ob-form-group">
              <label className="ob-form-label">Primary timezone</label>
              <select
                className="ob-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TZ_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <button className="ob-btn-primary" onClick={submitWorkspace}>
              Continue {ARROW_RIGHT}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ STEP 2 — PROPERTY ══════════ */}
      {screen === 'step2' && (
        <div className="ob-screen ob-setup">
          <Logo />
          <div className="ob-progress">
            <span className="ob-dot active" />
            <span className="ob-dot active" />
          </div>

          <div className="ob-card">
            <div className="ob-step-label">Step 2 of 2</div>
            <h2 className="ob-title">
              Add your <span className="highlight">first property</span>
            </h2>
            <p className="ob-sub">You can add more after setup.</p>

            <div className="ob-form-group">
              <label className="ob-form-label">Property name</label>
              <input
                type="text"
                className={`ob-input ${errors.prop ? 'error' : ''}`}
                value={propName}
                onChange={(e) => {
                  setPropName(e.target.value);
                  if (errors.prop) setErrors((x) => ({ ...x, prop: false }));
                }}
                placeholder="e.g. Ocean View Suite"
              />
            </div>
            <div className="ob-form-group">
              <label className="ob-form-label">City / State</label>
              <input
                type="text"
                className={`ob-input ${errors.city ? 'error' : ''}`}
                value={propCity}
                onChange={(e) => {
                  setPropCity(e.target.value);
                  if (errors.city) setErrors((x) => ({ ...x, city: false }));
                }}
                placeholder="e.g. Miami, FL"
              />
            </div>

            <div className="ob-form-group" style={{ marginBottom: 0 }}>
              <label className="ob-form-label">Property type</label>
              <div className="ob-radio-group" style={{ marginTop: '0.375rem' }}>
                <label className={`ob-radio ${propType === 'STR' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    checked={propType === 'STR'}
                    onChange={() => setPropType('STR')}
                  />
                  <span className="ob-radio-dot" />
                  <span className="ob-radio-label">STR only</span>
                </label>
                <label className={`ob-radio ${propType === 'Mixed' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    checked={propType === 'Mixed'}
                    onChange={() => setPropType('Mixed')}
                  />
                  <span className="ob-radio-dot" />
                  <span className="ob-radio-label">Mixed (STR + LTR)</span>
                </label>
              </div>
            </div>

            <button className="ob-btn-primary" onClick={submitProperty}>
              Continue {ARROW_RIGHT}
            </button>

            <button className="ob-btn-ghost" onClick={() => setScreen('step1')}>
              {ARROW_LEFT}
              Back
            </button>
          </div>
        </div>
      )}

      {/* ══════════ BOOT ══════════ */}
      {screen === 'boot' && (
        <div className="ob-screen ob-boot">
          <Logo />
          <h2 className="ob-boot-title">Setting up your operations…</h2>
          <p className="ob-boot-sub">This takes a few seconds.</p>

          <div className="ob-boot-steps">
            {BOOT_STEPS.map((s, i) => {
              const state = i < bootIndex ? 'done' : i === bootIndex ? 'active' : 'idle';
              return (
                <div key={i} className={`ob-boot-step ob-boot-step--${state}`}>
                  <div className="ob-boot-icon">{s.icon}</div>
                  <div className="ob-boot-text">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ DASHBOARD ══════════ */}
      {screen === 'dashboard' && (
        <div className="ob-screen ob-dashboard">
          {/* Topbar */}
          <div className="ob-topbar">
            <div className="ob-topbar__left">
              <div className="ob-logo ob-logo--sm">
                <div className="ob-logo-mark" />
                <span>Lookara</span>
              </div>
              <span className="ob-ws-name">{wsName || 'My Workspace'}</span>
              <span className="ob-ws-tag">Live</span>
            </div>
            <div className="ob-topbar__right">
              <span className="ob-user-name">Property Manager</span>
              <div className="ob-avatar">PM</div>
            </div>
          </div>

          <div className="ob-body">
            {/* Sidebar */}
            <aside className="ob-sidebar">
              <div className="ob-nav-section">Operations</div>
              <button className="ob-nav-item active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Dashboard
              </button>
              <button className="ob-nav-item" onClick={() => showToast('Opening Task Board…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                Tasks
              </button>
              <button className="ob-nav-item" onClick={openVendorOverlay}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                Vendors
              </button>
              <div className="ob-nav-section">System</div>
              <button className="ob-nav-item" onClick={() => showToast('Compliance module loading…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Compliance
              </button>
              <button className="ob-nav-item" onClick={() => showToast('Audit trail loading…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
                Audit Trail
              </button>
              <button className="ob-nav-item" onClick={() => showToast('Properties module loading…')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                Properties
              </button>
            </aside>

            {/* Main */}
            <main className="ob-main">
              <div className="ob-stats">
                <div className="ob-stat">
                  <div className="ob-stat-val gold">1</div>
                  <div className="ob-stat-label">Active Properties</div>
                </div>
                <div className="ob-stat">
                  <div className="ob-stat-val">{vendorAdded ? 1 : 3}</div>
                  <div className="ob-stat-label">Open Tasks</div>
                </div>
                <div className="ob-stat">
                  <div className="ob-stat-val green">1</div>
                  <div className="ob-stat-label">SLA Running</div>
                </div>
              </div>

              <div className="ob-section-header">
                <div className="ob-section-title">Your operations are live</div>
                <div className="ob-section-sub">
                  {propName}{propCity ? ` · ${propCity}` : ''}
                </div>
              </div>

              <div className="ob-task-list">
                <div className="ob-task-card">
                  <div className="ob-task-status pending" />
                  <div className="ob-task-info">
                    <div className="ob-task-name">Initial inspection</div>
                    <div className="ob-task-meta">
                      {propName}{propCity ? `, ${propCity}` : ''} · {vendorAdded ? `Assigned to ${vendorName}` : 'No vendor assigned'}
                    </div>
                  </div>
                  <span className="ob-task-sla running">SLA running</span>
                  {vendorAdded ? (
                    <button className="ob-task-action done" disabled>✓ Assigned</button>
                  ) : (
                    <button className="ob-task-action" onClick={openVendorOverlay}>Assign vendor →</button>
                  )}
                </div>

                <div className="ob-task-card">
                  <div className={`ob-task-status ${vendorAdded ? 'pending' : 'waiting'}`} />
                  <div className="ob-task-info">
                    <div className="ob-task-name">
                      {vendorAdded ? `${vendorName} added to vendor pool` : 'Vendor assignment pending'}
                    </div>
                    <div className="ob-task-meta">
                      {vendorAdded ? `${vendorService} · Active` : 'Awaiting first vendor in pool'}
                    </div>
                  </div>
                  <span className={`ob-task-sla ${vendorAdded ? 'running' : 'pending'}`}>
                    {vendorAdded ? 'Active' : 'Pending'}
                  </span>
                  {vendorAdded ? (
                    <button className="ob-task-action done" disabled>✓ Done</button>
                  ) : (
                    <button className="ob-task-action" onClick={openVendorOverlay}>Add vendor →</button>
                  )}
                </div>

                <div className="ob-task-card">
                  <div className="ob-task-status open" />
                  <div className="ob-task-info">
                    <div className="ob-task-name">Compliance baseline</div>
                    <div className="ob-task-meta">System-generated · Review required</div>
                  </div>
                  <span className="ob-task-sla pending">Pending</span>
                  <button className="ob-task-action" onClick={() => showToast('Opening compliance module…')}>
                    Review →
                  </button>
                </div>
              </div>

              <div className="ob-audit">
                <div className="ob-audit__header">
                  <div className="ob-audit__title">Audit Log</div>
                  <div className="ob-audit__live">Recording</div>
                </div>
                <div className="ob-audit__entries">
                  {vendorAdded && (
                    <>
                      <AuditRow action={<><strong>Vendor added</strong> — {vendorName} · {vendorService}</>} />
                      <AuditRow action={<><strong>Task assigned</strong> — Initial inspection → {vendorName}</>} />
                      <AuditRow action={<><strong>SLA started</strong> — Task #1 timer active</>} />
                      <AuditRow action={<><strong>Audit record created</strong> — Immutable entry logged</>} />
                    </>
                  )}
                  <AuditRow action={<><strong>Workspace created</strong></>} />
                  <AuditRow action={<><strong>Property added</strong> — {propName}{propCity ? `, ${propCity}` : ''}</>} />
                  <AuditRow action={<><strong>Task structure initialized</strong> — 3 tasks generated</>} />
                  <AuditRow action={<><strong>SLA timer started</strong> — Initial inspection</>} />
                </div>
              </div>
            </main>
          </div>

          {/* Vendor overlay */}
          {vendorOverlay && (
            <div className="ob-overlay" onClick={() => setVendorOverlay(false)}>
              <div className="ob-overlay-card" onClick={(e) => e.stopPropagation()}>
                <button className="ob-overlay-close" onClick={() => setVendorOverlay(false)}>×</button>
                <div className="ob-overlay-eyebrow">Start here</div>
                <h3 className="ob-overlay-title">Add a vendor</h3>
                <p className="ob-overlay-sub">Assign to your first task immediately.</p>

                <div className="ob-form-group">
                  <label className="ob-form-label">Vendor name</label>
                  <input
                    type="text"
                    className="ob-input"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                  <label className="ob-form-label">Service type</label>
                  <div className="ob-radio-group" style={{ marginTop: '0.375rem' }}>
                    <label className={`ob-radio ${vendorService === 'Cleaning' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        checked={vendorService === 'Cleaning'}
                        onChange={() => setVendorService('Cleaning')}
                      />
                      <span className="ob-radio-dot" />
                      <span className="ob-radio-label">Cleaning</span>
                    </label>
                    <label className={`ob-radio ${vendorService === 'Maintenance' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        checked={vendorService === 'Maintenance'}
                        onChange={() => setVendorService('Maintenance')}
                      />
                      <span className="ob-radio-dot" />
                      <span className="ob-radio-label">Maintenance</span>
                    </label>
                  </div>
                </div>

                <button className="ob-btn-primary" onClick={addVendor} disabled={!vendorName.trim()}>
                  Add Vendor {ARROW_RIGHT}
                </button>
              </div>
            </div>
          )}

          {/* First-action tip */}
          {tipVisible && (
            <div className="ob-tip">
              <div className="ob-tip__inner">
                <div>
                  <div className="ob-tip__label">Start here</div>
                  <div className="ob-tip__text">Assign your first vendor</div>
                </div>
                <button className="ob-tip__btn" onClick={openVendorOverlay}>Assign vendor →</button>
                <button className="ob-tip__dismiss" onClick={() => setTipVisible(false)}>Dismiss</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function Logo() {
  return (
    <div className="ob-logo">
      <div className="ob-logo-mark" />
      <span>Lookara</span>
    </div>
  );
}

function AuditRow({ action }: { action: React.ReactNode }) {
  return (
    <div className="ob-audit__entry">
      <div className="ob-audit__action">{action}</div>
      <div className="ob-audit__time">Just now</div>
    </div>
  );
}