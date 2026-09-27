// src/portals/vendor/VendorPortal.tsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import { VendorDashboard, VendorJobs, VendorCompliance, VendorSettings } from './views/VendorStubs';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: '📊', path: '/vendor/dashboard' },
  { label: 'Jobs',        icon: '🔧', path: '/vendor/jobs' },
  { label: 'Compliance',  icon: '📋', path: '/vendor/compliance' },
  { label: 'Settings',    icon: '⚙️', path: '/vendor/settings' },
];

export default function VendorPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppSidebar
        items={NAV_ITEMS}
        portalName="Service Vendor"
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
          <Route path="dashboard"  element={<VendorDashboard />} />
          <Route path="jobs"       element={<VendorJobs />} />
          <Route path="compliance" element={<VendorCompliance />} />
          <Route path="settings"   element={<VendorSettings />} />
          <Route path="*"          element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
