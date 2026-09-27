import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV = [
  {
    section: 'Operations',
    items: [
      { to: '/dashboard',   icon: '▣', label: 'Dashboard' },
      { to: '/tasks',       icon: '✓', label: 'Tasks',      badge: 23 },
      { to: '/emergency',   icon: '⚠', label: 'Emergency',  badge: 1, badgeColor: 'crimson' },
      { to: '/calendar',    icon: '▤', label: 'Calendar' },
      { to: '/alerts',      icon: '◉', label: 'Alerts',     badge: 12, badgeColor: 'amber' },
    ],
  },
  {
    section: 'Portfolio',
    items: [
      { to: '/properties',  icon: '⌂', label: 'Properties' },
      { to: '/vendors',     icon: '⚒', label: 'Vendors' },
      { to: '/compliance',  icon: '⚖', label: 'Compliance', badge: 3, badgeColor: 'amber' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/billing',     icon: '▭', label: 'Billing',    badge: 3, badgeColor: 'amber' },
      { to: '/reports',     icon: '▥', label: 'Reports' },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/settings',    icon: '⚙', label: 'Settings' },
      { to: '/audit',       icon: '↧', label: 'Audit Exports' },
      { to: '/support',     icon: '◌', label: 'Support' },
    ],
  },
];

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`lk-sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
        aria-label="Primary navigation"
      >
        {/* Logo row */}
        <div className="lk-sidebar-logo-row">
          <div className="lk-sidebar-logo">
            {collapsed ? 'L' : 'LOOKARA'}
          </div>
          <button
            className="lk-sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* User chip */}
        {!collapsed && (
          <div className="lk-sidebar-user">
            <div className="lk-sidebar-avatar">DN</div>
            <div className="lk-sidebar-user-info">
              <div className="lk-sidebar-user-name">David Nor</div>
              <div className="lk-sidebar-user-role">NYC Premium</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="lk-sidebar-nav">
          {NAV.map(group => (
            <div key={group.section} className="lk-sidebar-section">
              {!collapsed && (
                <div className="lk-sidebar-section-title">{group.section}</div>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `lk-nav-item ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="lk-nav-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="lk-nav-label">{item.label}</span>
                      {item.badge != null && (
                        <span className={`lk-nav-badge ${item.badgeColor || ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}