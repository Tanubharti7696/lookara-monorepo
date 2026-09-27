// apps/vendor-portal/src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useVendor } from './context/VendorContext';
import Dashboard from './pages/Dashboard/Dashboard';
import W9Form from './pages/Compliance/W9Form';
import Compliance from './pages/Compliance/Compliance';
import Earnings from './pages/Earnings/Earnings';
import Schedule from './pages/Schedule/Schedule';
import Jobs from './pages/Jobs/Jobs';
import './App.css';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';

/* ── Inline icons ── */
const IconDashboard = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>;
const IconJobs = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><path d="M2 4h12M2 8h8M2 12h10" /></svg>;
const IconSchedule = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><rect x="2" y="2" width="12" height="12" rx="1.5" /><path d="M5 1v2M11 1v2M2 6h12" /></svg>;
const IconEarnings = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><path d="M2 11l3-5 3 2 3-4 3 3" /><path d="M2 14h12" /></svg>;
const IconCompliance = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><path d="M8 1l1.5 3 3.5.5-2.5 2.5.5 3.5L8 9l-3 1.5.5-3.5L3 4.5 6.5 4z" /></svg>;
const IconProfile = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" /></svg>;
const IconSettings = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15"><circle cx="8" cy="8" r="2" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" /></svg>;

interface NavItem {
  to: string;
  label: string;
  Icon: () => React.ReactNode;
  badge?: string;
  badgeGold?: boolean;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { to: '/', end: true, label: 'Dashboard', Icon: IconDashboard },
      { to: '/jobs', label: 'Jobs & Tasks', badge: '5', Icon: IconJobs },
      { to: '/schedule', label: 'Schedule', Icon: IconSchedule },
      { to: '/earnings', label: 'Earnings', Icon: IconEarnings },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/compliance', label: 'Compliance', badge: '!', badgeGold: true, Icon: IconCompliance },
      { to: '/profile', label: 'Profile', Icon: IconProfile },
      { to: '/settings', label: 'Settings', Icon: IconSettings },
    ],
  },
];

import { AuthGuard } from './components/AuthGuard';

export default function App() {
  const v = useVendor();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleExit = () => {
    localStorage.removeItem('lookara_token');
    localStorage.removeItem('lookara_user');
    localStorage.removeItem('lookara_workspace');
    sessionStorage.clear();
    const metaEnv = (import.meta as any).env;
    const target = metaEnv?.VITE_PUBLIC_PORTAL_URL
      ? `${metaEnv.VITE_PUBLIC_PORTAL_URL}/login`
      : (window.location.hostname === 'localhost' ? 'http://localhost:5173/login' : 'https://public-portal-cyan.vercel.app/login');
    window.location.href = target;
  };

  return (
    <AuthGuard>
      <div className="vp-shell">
      {/* Mobile Top Bar */}
      <header className="vp-mobile-bar">
        <button
          className="vp-hamburger-btn"
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div className="vp-mobile-brand">
          <span className="logo-w">LOOKARA</span>
          <span className="logo-s">Vendor</span>
        </div>
      </header>

      {/* Sidebar Overlay on Mobile */}
      <div
        className={`vp-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`vp-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sb-logo">
          <div className="logo-w">LOOKARA</div>
          <div className="logo-s">Vendor Portal</div>
        </div>

        <div className="sb-id">
          <div className="sb-id-top">
            <div className="v-avatar">{v.vendorInitials}</div>
            <div>
              <div className="v-name">{v.vendorName}</div>
              <div className="v-type">★ {v.vendorTier} · {v.vendorTrade}</div>
            </div>
          </div>
          <div className="net-status-grid">
            <div className="ns-row">
              <span className="ns-label">Network</span>
              <span className="ns-val active">● Active</span>
            </div>
            <div className="ns-row">
              <span className="ns-label">Emergency</span>
              <span className="ns-val emg">{v.emergency ? 'Enabled' : 'Off'}</span>
            </div>
            <div className="ns-row">
              <span className="ns-label">Pools</span>
              <span className="ns-val">{v.poolsActive} Active</span>
            </div>
            <div className="ns-row">
              <span className="ns-label">Coverage</span>
              <span className="ns-val">30 mi radius</span>
            </div>
          </div>
        </div>

        <nav className="nav-sec">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="nav-lbl">{g.label}</div>
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="sb-nav-ic"><item.Icon /></span>
                  {item.label}
                  {item.badge && (
                    <span className={`nav-badge ${item.badgeGold ? 'g' : ''}`}>{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sb-avail">
          <div className="avail-card">
            <div className="avail-title">Work Status</div>
            <div className="ws-row">
              {(['online', 'paused', 'offline'] as const).map((s) => (
                <button
                  key={s}
                  className={`ws-btn ${v.workState === s ? `ws-${s} active` : ''}`}
                  onClick={() => v.setWorkState(s)}
                >
                  {s === 'online' ? '● Online' : s === 'paused' ? '⏸ Paused' : '○ Offline'}
                </button>
              ))}
            </div>
            <div className="avail-note">
              {v.workState === 'online' ? 'Receiving all job types.'
                : v.workState === 'paused' ? 'New jobs paused — active jobs continue.'
                  : 'Offline — not receiving any jobs.'}
            </div>
            <div className="avail-sub">
              <div className="avail-row">
                <span className="avail-label">Emergency Dispatch</span>
                <div className="avail-toggle-wrap">
                  <span className={`toggle-label ${v.emergency ? 'on' : 'off'}`}>{v.emergency ? 'On' : 'Off'}</span>
                  <div className={`toggle ${v.emergency ? 'on' : 'off'}`} onClick={() => v.setEmergency(!v.emergency)} />
                </div>
              </div>
              <div className="avail-row">
                <span className="avail-label">New Jobs</span>
                <div className="avail-toggle-wrap">
                  <span className={`toggle-label ${v.acceptingJobs ? 'on' : 'off'}`}>{v.acceptingJobs ? 'Accepting' : 'Paused'}</span>
                  <div className={`toggle ${v.acceptingJobs ? 'on' : 'off'}`} onClick={() => v.setAcceptingJobs(!v.acceptingJobs)} />
                </div>
              </div>
            </div>
          </div>

          <div className="status-strip">
            <div className="ss-cell">
              <div className="ss-lbl">Coverage</div>
              <div className="ss-val">30 mi</div>
            </div>
            <div className="ss-cell">
              <div className="ss-lbl">Emergency</div>
              <div className="ss-val" style={{ color: v.emergency ? 'var(--emerald)' : '#9CA3AF' }}>
                {v.emergency ? 'Eligible' : 'Off'}
              </div>
            </div>
            <div className="ss-cell">
              <div className="ss-lbl">Compliance</div>
              <div className="ss-val" style={{ color: v.complianceAtRisk ? 'var(--amber)' : 'var(--emerald)' }}>
                {v.complianceAtRisk ? 'At Risk' : 'OK'}
              </div>
            </div>
          </div>
        </div>

        <div className="vp-sidebar-footer">
          <button
            type="button"
            className="vp-exit-btn"
            onClick={handleExit}
            title="Exit Portal / Sign Out"
            aria-label="Exit Portal"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>

      <main className="vp-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/compliance/w9" element={<W9Form />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
    </AuthGuard>
  );
}