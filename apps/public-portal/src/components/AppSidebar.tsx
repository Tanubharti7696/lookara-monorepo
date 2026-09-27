// src/components/AppSidebar.tsx
// Shared sidebar — used by all portal sections
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { clearSession, getUser } from '../utils/auth';

interface SidebarItem {
  label: string;
  icon: string;
  path: string;
}

interface Props {
  items: SidebarItem[];
  portalName: string;
  portalColor?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ items, portalName, isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const user = getUser();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  function handleExit() {
    if (!showExitConfirm) { setShowExitConfirm(true); return; }
    clearSession();
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">L</div>
          <div>
            <div className="sidebar-logo-text">Lookara</div>
            <div className="sidebar-logo-sub">{portalName}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="sidebar-nav">
          {items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">{initials}</div>
              <div>
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{user.organizationName || user.role}</div>
              </div>
            </div>
          )}
          <button
            className="sidebar-exit-btn"
            onClick={handleExit}
            style={showExitConfirm ? { background: 'rgba(239,68,68,0.25)' } : {}}
          >
            <span>{showExitConfirm ? '⚠️' : '→'}</span>
            {showExitConfirm ? 'Confirm sign out?' : 'Sign out'}
          </button>
          {showExitConfirm && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowExitConfirm(false)}
              style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
            >
              Cancel
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
