// src/layouts/DevTrustLayout/DevTrustLayout.tsx
import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import DevTrustSidebar from './DevTrustSidebar';
import './DevTrust.css';

const HEADER_LINKS = [
  { to: '/developers/overview', label: 'Overview' },
  { to: '/developers/api',      label: 'API' },
  { to: '/developers/security', label: 'Security' },
  { to: '/developers/contact',  label: 'Contact' },
];

export default function DevTrustLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="devtrust">
      <header className="dt-header">
        <div className="dt-header__left">
          <button
            type="button"
            className="dt-mobile-menu"
            onClick={() => setSidebarOpen((isOpen) => !isOpen)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>
          <Link to="/developers/overview" className="dt-logo">L</Link>
          <span className="dt-header__title">Lookara Developer Trust Portal</span>
        </div>
        <nav className="dt-header__right">
          {HEADER_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `dt-header__link${isActive ? ' is-active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="dt-layout">
        <DevTrustSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="dt-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}