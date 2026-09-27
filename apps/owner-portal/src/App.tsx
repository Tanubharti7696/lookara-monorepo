// apps/owner-portal/src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { OwnerProvider } from './context/OwnerContext';
import { ToastProvider } from './context/ToastContext';
import OwnerLayout from './layouts/OwnerLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Approvals from './pages/Approvals/Approvals';
import Incidents from './pages/Incidents/Incidents';
import Calendar from './pages/Calendar/Calendar';
import Properties from './pages/Properties/Properties';
import Financials from './pages/Financials/Financials';
import Documents from './pages/Documents/Documents';
import Updates from './pages/Updates/Updates';
import Settings from './pages/Settings/Settings';

export default function App() {
  return (
    <AuthGuard>
      <OwnerProvider>
        <ToastProvider>
          <Routes>
            <Route element={<OwnerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="calendar"   element={<Calendar />} />
              <Route path="financials" element={<Financials />} />
              <Route path="approvals"  element={<Approvals />} />
              <Route path="incidents"  element={<Incidents />} />
              <Route path="documents"  element={<Documents />} />
              <Route path="updates"    element={<Updates />} />
              <Route path="settings"   element={<Settings />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </OwnerProvider>
    </AuthGuard>
  );
}
