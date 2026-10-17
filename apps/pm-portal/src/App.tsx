// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { RoleGuard } from './components/RoleGuard';
import { ShellContext } from './context/ShellContext';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';
import EmergencyView from './views/EmergencyView';
import ComplianceView from './views/ComplianceView';
import AlertsView from './views/AlertsView';
import CalendarView from './views/CalendarView';
import VendorsView from './views/VendorsView';
import IncidentsView from './views/IncidentsView';
import BillingView from './views/BillingView';
import Settings from './views/SettingsView';
import Toast from './components/Toast';
import ReportsView from './views/ReportsView';
import AuditView from './views/AuditView';
import Properties     from './views/Properties';
import PropertyDetail from './views/PropertyDetail';
import Support from './views/Support';
import ComplianceTemplateBuilder from './views/ComplianceTemplateBuilder';
import './styles/drawer.css';

import { apiFetch } from './utils/api';

type ToastState = {
  msg: string;
  type: string;
  id: number;
} | null;

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('lookara_theme');
    if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.remove('light-theme');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthGuard>
        <Shell />
      </AuthGuard>
    </BrowserRouter>
  );
}

function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/v1/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        const u = data?.data || data?.user || (data?.email ? data : null);
        if (u) {
          setUser(u);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user', err);
        // Could redirect to login here if token is entirely invalid
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, []);

  // Auto-close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const showToast = (msg: string, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 2800);
  };

  const ctx = {
    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
    user,
    isLoadingUser,
  };

  // Read dynamic preferences
  const [sidebarMode, setSidebarMode] = useState(() => localStorage.getItem('lookara_pref_sidebar') || 'Expanded');
  const [defaultRoute, setDefaultRoute] = useState(() => {
    const pref = (localStorage.getItem('lookara_pref_dashboardDefault') || 'Overview').toLowerCase();
    if (pref === 'tasks') return '/tasks';
    if (pref === 'properties') return '/properties';
    if (pref === 'calendar') return '/calendar';
    return '/dashboard';
  });

  useEffect(() => {
    const handlePrefChange = () => {
      const mode = localStorage.getItem('lookara_pref_sidebar') || 'Expanded';
      setSidebarMode(mode);

      const pref = (localStorage.getItem('lookara_pref_dashboardDefault') || 'Overview').toLowerCase();
      if (pref === 'tasks') setDefaultRoute('/tasks');
      else if (pref === 'properties') setDefaultRoute('/properties');
      else if (pref === 'calendar') setDefaultRoute('/calendar');
      else setDefaultRoute('/dashboard');
    };

    window.addEventListener('storage', handlePrefChange);
    window.addEventListener('lookara-pref-change', handlePrefChange);
    return () => {
      window.removeEventListener('storage', handlePrefChange);
      window.removeEventListener('lookara-pref-change', handlePrefChange);
    };
  }, []);

  const shellClasses = [
    'app-shell',
    sidebarMode.toLowerCase() === 'collapsed' ? 'sidebar-collapsed' : '',
    sidebarMode.toLowerCase().includes('hide') ? 'sidebar-hidden' : '',
  ].filter(Boolean).join(' ');

  return (
    <ShellContext.Provider value={ctx}>
      <div className={shellClasses}>
        <Sidebar />
        <button
          className="mobile-sidebar-toggle"
          type="button"
          onClick={() => setSidebarOpen((isOpen) => !isOpen)}
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>
        <div className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/emergency" element={<EmergencyView />} />
            <Route path="/compliance" element={<ComplianceView />} />
            <Route path="/alerts" element={<AlertsView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/vendors" element={<VendorsView />} />
            <Route path="/incidents" element={<IncidentsView onToast={showToast} />} />
            <Route path="/billing"  element={<RoleGuard minRole="admin"><BillingView onToast={showToast} /></RoleGuard>} />
            <Route path="/settings" element={<RoleGuard minRole="admin"><Settings onToast={showToast} /></RoleGuard>} />
            <Route path="/settings/:section" element={<RoleGuard minRole="admin"><Settings onToast={showToast} /></RoleGuard>} />
            <Route path="/reports" element={<RoleGuard minRole="manager"><ReportsView /></RoleGuard>} />
            <Route path="/audit" element={<RoleGuard minRole="admin"><AuditView /></RoleGuard>} />
            <Route path="/properties"     element={<Properties onToast={showToast} />} />
            <Route path="/properties/:id" element={<PropertyDetail onToast={showToast} />} />
            <Route path="/settings/compliance-templates/:id" element={
              <RoleGuard minRole="admin">
                <ComplianceTemplateBuilder
                  onNavigateBack={() => navigate('/settings/compliance-templates')}
                  onToast={showToast} 
                />
              </RoleGuard>
            }/>
              <Route path="/support" element={<Support onToast={showToast} />} />
          </Routes>
        </div>
      </div>
      <Toast toast={toast} />
    </ShellContext.Provider>
  );
}