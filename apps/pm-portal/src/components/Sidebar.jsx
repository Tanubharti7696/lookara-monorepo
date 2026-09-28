// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useShell } from '../context/ShellContext';
import './Sidebar.css';

/* ── SVG icons (Lucide-style, copied from Dashboard HTML) ── */
const IconDashboard = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);
const IconTasks = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.344" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);
const IconEmergency = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);
const IconCalendar = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);
const IconAlerts = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
const IconProperties = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const IconVendors = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const IconCompliance = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11c0 2.5-2 4.5-4 6-2-1.5-4-3.5-4-6a4 4 0 1 1 8 0Z" />
    <path d="M12 2v2" />
    <path d="m6.6 15.6-1.4 1.4" />
    <path d="M2 21h20" />
    <path d="M6 21v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
  </svg>
);
const IconPayments = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);
const IconReports = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="18" y1="20" y2="10" />
    <line x1="12" x2="12" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="14" />
  </svg>
);
const IconSettings = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconAudit = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const IconSupport = () => (
  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

/* ── Nav structure (matches Dashboard HTML exactly) ── */
const NAV = [
  {
    section: 'Operations',
    items: [
      { to: '/dashboard',   icon: <IconDashboard />, label: 'Dashboard' },
      { to: '/tasks',       icon: <IconTasks />,     label: 'Tasks' },
      { to: '/emergency',   icon: <IconEmergency />, label: 'Emergency',  badge: 1,  badgeTone: 'crimson' },
      { to: '/calendar',    icon: <IconCalendar />,  label: 'Calendar' },
      { to: '/alerts',      icon: <IconAlerts />,    label: 'Alerts',     badge: 12, badgeTone: 'amber' },
    ],
  },
  {
    section: 'Portfolio',
    items: [
      { to: '/properties',  icon: <IconProperties />, label: 'Properties' },
      { to: '/vendors',     icon: <IconVendors />,    label: 'Vendors' },
      { to: '/compliance',  icon: <IconCompliance />, label: 'Compliance', badge: 3, badgeTone: 'amber' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/billing',     icon: <IconPayments />,   label: 'Billing',    badge: 3, badgeTone: 'amber' },
      { to: '/reports',     icon: <IconReports />,    label: 'Reports' },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/settings',    icon: <IconSettings />,   label: 'Settings' },
      { to: '/audit',       icon: <IconAudit />,      label: 'Audit Exports' },
      { to: '/support',     icon: <IconSupport />,    label: 'Support' },
    ],
  },
];

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useShell();

  const handleExit = () => {
    localStorage.removeItem('lookara_token');
    localStorage.removeItem('lookara_user');
    localStorage.removeItem('lookara_workspace');
    sessionStorage.clear();
    const metaEnv = typeof import.meta !== 'undefined' ? import.meta.env : null;
    const target = metaEnv?.VITE_PUBLIC_PORTAL_URL
      ? `${metaEnv.VITE_PUBLIC_PORTAL_URL}/login`
      : (window.location.hostname === 'localhost' ? 'http://localhost:5173/login' : 'https://public-portal-cyan.vercel.app/login');
    window.location.href = target;
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="logo">LOOKARA</div>

        <div className="pm-profile">
          <div className="pm-avatar">DN</div>
          <div className="pm-info">
            <div className="pm-name">David Nor</div>
            <div className="pm-role">NYC Premium Portfolio</div>
          </div>
        </div>

        <nav>
          {NAV.map(group => (
            <div className="nav-section" key={group.section}>
              <div className="nav-section-title">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge != null && (
                    <span className={`nav-badge ${item.badgeTone || ''}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-sidebar-footer">
          <button
            type="button"
            className="pm-exit-btn"
            onClick={handleExit}
            title="Exit Portal / Sign Out"
            aria-label="Exit Portal"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
}