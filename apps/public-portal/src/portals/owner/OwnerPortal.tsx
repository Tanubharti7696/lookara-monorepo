// src/portals/owner/OwnerPortal.tsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import { OwnerDashboard, OwnerProperties, OwnerFinancials, OwnerSettings } from './views/OwnerStubs';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: '📊', path: '/owner/dashboard' },
  { label: 'Properties',  icon: '🏠', path: '/owner/properties' },
  { label: 'Financials',  icon: '💰', path: '/owner/financials' },
  { label: 'Settings',    icon: '⚙️', path: '/owner/settings' },
];

export default function OwnerPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppSidebar
        items={NAV_ITEMS}
        portalName="Property Owner"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle navigation"
      >☰</button>
      <main className="app-main">
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<OwnerDashboard />} />
          <Route path="properties" element={<OwnerProperties />} />
          <Route path="financials" element={<OwnerFinancials />} />
          <Route path="settings"   element={<OwnerSettings />} />
          <Route path="*"          element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
