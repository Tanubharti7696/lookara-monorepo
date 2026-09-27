// src/portals/admin/AdminPortal.tsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import { AdminDashboard, AdminUsers, AdminOrganizations, AdminSystem } from './views/AdminStubs';

const NAV_ITEMS = [
  { label: 'Dashboard',      icon: '📊', path: '/admin/dashboard' },
  { label: 'Users',          icon: '👥', path: '/admin/users' },
  { label: 'Organizations',  icon: '🏢', path: '/admin/organizations' },
  { label: 'System Health',  icon: '🛡️', path: '/admin/system' },
];

export default function AdminPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppSidebar
        items={NAV_ITEMS}
        portalName="Platform Admin"
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
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="users"          element={<AdminUsers />} />
          <Route path="organizations"  element={<AdminOrganizations />} />
          <Route path="system"         element={<AdminSystem />} />
          <Route path="*"              element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
