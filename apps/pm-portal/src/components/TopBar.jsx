import { useLocation } from 'react-router-dom';
import './TopBar.css';

const TITLES = {
  '/dashboard':  { title: 'Dashboard',  sub: 'Portfolio overview' },
  '/tasks':      { title: 'Tasks',      sub: 'Operational execution' },
  '/calendar':   { title: 'Calendar',   sub: 'Scheduling & bookings' },
  '/properties': { title: 'Properties', sub: 'Portfolio inventory' },
  '/compliance': { title: 'Compliance', sub: 'Requirements & tracking' },
  '/vendors':    { title: 'Vendors',    sub: 'Coverage & directory' },
  '/reports':    { title: 'Reports',    sub: 'Operational intelligence' },
  '/billing':    { title: 'Billing',    sub: 'Subscription & payments' },
  '/settings':   { title: 'Settings',   sub: 'Preferences & configuration' },
  '/audit':      { title: 'Audit',      sub: 'Exports & activity log' },
};

export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation();
  const meta = TITLES[pathname] || { title: 'Lookara', sub: '' };

  return (
    <header className="lk-topbar">
      <div className="lk-topbar-left">
        <button
          className="lk-topbar-menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          ☰
        </button>
        <div className="lk-topbar-titles">
          <div className="lk-topbar-title">{meta.title}</div>
          {meta.sub && <div className="lk-topbar-sub">{meta.sub}</div>}
        </div>
      </div>

      <div className="lk-topbar-right">
        <button className="lk-topbar-bell" aria-label="Notifications">
          <span aria-hidden="true">◉</span>
          <span className="lk-topbar-bell-badge">3</span>
        </button>
      </div>
    </header>
  );
}