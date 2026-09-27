// src/components/PageHeader.jsx
import { useShell } from '../context/ShellContext';
import './PageHeader.css';

export default function PageHeader({ title, subtitle, children, right }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useShell();

  return (
    <header className="page-header">
      <div className="page-header__left">
        <button
          className="page-header__menu"
          onClick={sidebarOpen ? closeSidebar : openSidebar}
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>

        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}

        {children}
      </div>

      {right && <div className="page-header__right">{right}</div>}
    </header>
  );
}