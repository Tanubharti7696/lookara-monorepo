// apps/admin-portal/src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import Overview from './pages/Overview/Overview';
import { ToastProvider } from './pages/context/ToastContext';
import ReviewQueue from './pages/ReviewQueue/ReviewQueue';
import Vendors from './pages/Vendors/Vendors';
import Organizations from './pages/Organizations/Organizations';
import AuditActivity from './pages/AuditActivity/AuditActivity';
import SystemHealth from './pages/SystemHealth/SystemHealth';
import Settings from './pages/Settings/Settings';
import { AuthGuard } from './components/AuthGuard';
import './App.css';

const NAV_ITEMS = [
  { to: '/',                    label: 'Overview',         end: true },
  { to: '/review-queue',        label: 'Review Queue' },
  { to: '/vendors',             label: 'Vendors' },
  { to: '/organizations',       label: 'Organizations' },
  { to: '/audit',               label: 'Audit & Activity' },
  { to: '/system-health',       label: 'System Health' },
  { to: '/settings',            label: 'Settings' },
];

function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
    <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="admin-sidebar__logo">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>LOOKARA</h1>
          <button className="admin-sidebar-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <div className="admin-sidebar__role">Admin Portal</div>
      </div>
      <nav>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `admin-nav-item${isActive ? ' is-active' : ''}`}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar__footer">
        <button
          type="button"
          className="admin-exit-btn"
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
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-container">
      {/* Mobile Topbar */}
      <header className="admin-mobile-bar">
        <button
          className="admin-hamburger-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          <span className="ham-line" />
          <span className="ham-line" />
          <span className="ham-line" />
        </button>
        <div className="admin-mobile-logo">LOOKARA</div>
        <div className="admin-mobile-role">ADMIN PORTAL</div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-main">
        <Routes>
          <Route path="/"                 element={<Overview />} />
          <Route path="/review-queue" element={<ReviewQueue />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/audit" element={<AuditActivity />} />
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="*"                 element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthGuard>
    </BrowserRouter>
  );
}