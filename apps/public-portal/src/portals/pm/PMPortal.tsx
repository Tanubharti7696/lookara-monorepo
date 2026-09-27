// src/portals/pm/PMPortal.tsx
// PM Portal shell — wraps all PM views under /pm/* routes
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';

import PMDashboard from './views/PMDashboard';
import PMTasks from './views/PMTasks';
import PMProperties from './views/PMProperties';
import { PMVendors, PMCompliance, PMReports, PMSettings } from './views/PMStubs';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: '📊', path: '/pm/dashboard' },
  { label: 'Tasks',       icon: '✅', path: '/pm/tasks' },
  { label: 'Properties',  icon: '🏠', path: '/pm/properties' },
  { label: 'Vendors',     icon: '👷', path: '/pm/vendors' },
  { label: 'Compliance',  icon: '📋', path: '/pm/compliance' },
  { label: 'Reports',     icon: '📈', path: '/pm/reports' },
  { label: 'Settings',    icon: '⚙️', path: '/pm/settings' },
];

export default function PMPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppSidebar
        items={NAV_ITEMS}
        portalName="Property Manager"
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
          <Route path="dashboard"  element={<PMDashboard />} />
          <Route path="tasks"      element={<PMTasks />} />
          <Route path="properties" element={<PMProperties />} />
          <Route path="vendors"    element={<PMVendors />} />
          <Route path="compliance" element={<PMCompliance />} />
          <Route path="reports"    element={<PMReports />} />
          <Route path="settings"   element={<PMSettings />} />
          <Route path="*"          element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
