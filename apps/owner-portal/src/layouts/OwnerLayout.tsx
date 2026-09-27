// apps/owner-portal/src/layouts/OwnerLayout.tsx
import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useOwner } from '../context/OwnerContext';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import DateRangePicker from '../components/DateRangePicker/DateRangePicker';
import NotificationBtn from '../components/NotificationBtn/NotificationBtn';
import './OwnerLayout.css';

/* ── Icons ────────────────────────────────────────────────── */

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    className="nav-icon"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <Icon>
        <rect x="1" y="1" width="6" height="6" rx="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" />
      </Icon>
    ),
  },
  {
    to: '/properties',
    label: 'Properties',
    icon: (
      <Icon>
        <path d="M2 6l6-4 6 4v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z" />
        <path d="M6 14V9h4v5" />
      </Icon>
    ),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: (
      <Icon>
        <rect x="1" y="3" width="14" height="11" rx="1.5" />
        <path d="M1 7h14M5 1v4M11 1v4" />
      </Icon>
    ),
  },
  {
    to: '/financials',
    label: 'Financials',
    icon: (
      <Icon>
        <circle cx="8" cy="8" r="7" />
        <path d="M8 1v14M1 8h14" />
      </Icon>
    ),
  },
  {
    to: '/approvals',
    label: 'Approvals',
    badgeTone: 'amber' as const,
    icon: (
      <Icon>
        <path d="M8 1l2 4 4.5.7-3.25 3.15.77 4.5L8 11.1 3.98 13.35l.77-4.5L1.5 5.7 6 5z" />
      </Icon>
    ),
  },
  {
    to: '/incidents',
    label: 'Incidents',
    badgeTone: 'red' as const,
    icon: (
      <Icon>
        <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v4M8 11v.5" />
      </Icon>
    ),
  },
  {
    to: '/documents',
    label: 'Documents',
    icon: (
      <Icon>
        <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M5 6h6M5 9h4" />
      </Icon>
    ),
  },
  {
    to: '/updates',
    label: 'Updates',
    badgeTone: 'gold' as const,
    icon: (
      <Icon>
        <path d="M14 10a2 2 0 01-2 2H4l-3 3V4a2 2 0 012-2h9a2 2 0 012 2v6z" />
      </Icon>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <Icon>
        <circle cx="8" cy="6" r="3" />
        <path d="M2 14a6 6 0 0112 0" />
      </Icon>
    ),
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/properties': 'Properties',
  '/calendar': 'Calendar',
  '/financials': 'Financials',
  '/approvals': 'Approvals',
  '/incidents': 'Incidents',
  '/documents': 'Documents',
  '/updates': 'Updates',
  '/settings': 'Settings',
};

interface StatePill {
  tone: 'attention' | 'healthy' | 'danger' | 'success';
  text: string;
}

export default function OwnerLayout() {
  const { pathname } = useLocation();
  const { owner, approvals, incidents } = useOwner();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const title = PAGE_TITLES[pathname] ?? 'Owner Portal';

  const statePill = useMemo<StatePill | null>(() => {
    switch (pathname) {
      case '/': {
        const needsAttention = approvals.filter((a) => a.priority === 'urgent').length;
        if (needsAttention === 0) return null;
        return { tone: 'attention', text: `${needsAttention} require action today` };
      }
      case '/approvals': {
        if (approvals.length === 0) return { tone: 'healthy', text: 'All decisions up to date' };
        return { tone: 'attention', text: `${approvals.length} require action today` };
      }
      case '/incidents': {
        if (incidents.length === 0) return { tone: 'healthy', text: 'All clear — no active incidents' };
        const critical = incidents.filter((i) => i.severity === 'critical').length;
        const awaitingApproval = incidents.filter((i) => i.awaitingApproval).length;
        return {
          tone: 'danger',
          text: `${incidents.length} active incidents — ${critical} critical, ${awaitingApproval} awaiting your approval`,
        };
      }
      default:
        return null;
    }
  }, [pathname, approvals, incidents]);

  const showPropertySelector = pathname === '/';
  const showDateRange = pathname === '/';

  const UPDATES_UNREAD_BADGE = 4; // TODO: derive from context when the feed lives there

  const badgeFor = (to: string) => {
    if (to === '/approvals') return approvals.length;
    if (to === '/incidents') return incidents.length;
    if (to === '/updates') return UPDATES_UNREAD_BADGE;
    return 0;
  };

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
    <div className="shell">
      {/* Mobile Backdrop Overlay */}
      <div
        className={`overlay${mobileMenuOpen ? ' is-open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar${mobileMenuOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">Lookara</div>
          <div className="logo-sub">Owner Portal</div>
        </div>

        <nav className="nav-section">
          {NAV_ITEMS.map((item) => {
            const count = badgeFor(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
              >
                {item.icon}
                {item.label}
                {count > 0 && (
                  <span
                    className={`nav-badge${
                      item.badgeTone === 'amber' ? ' amber' :
                      item.badgeTone === 'gold' ? ' gold' : ''
                    }`}
                  >
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className="owner-card">
            <div className="owner-avatar">{owner.initials}</div>
            <div className="owner-info">
              <div className="owner-name">{owner.name}</div>
              <div className="owner-role">{owner.role}</div>
            </div>
          </NavLink>
          <button
            type="button"
            className="sidebar-exit-btn"
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

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>

            <span className="page-title">{title}</span>

            {statePill && (
              <div className={`topbar-state ${statePill.tone}`}>
                <span
                  className={`dot dot-${
                    statePill.tone === 'danger'
                      ? 'red'
                      : statePill.tone === 'healthy' || statePill.tone === 'success'
                      ? 'green'
                      : 'amber'
                  }`}
                />
                {statePill.text}
              </div>
            )}

            {showPropertySelector && <PropertySelector />}
          </div>

          <div className="topbar-right">
            {showDateRange && <DateRangePicker />}
            <NotificationBtn />
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
