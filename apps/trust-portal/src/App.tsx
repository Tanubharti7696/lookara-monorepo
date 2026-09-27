import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import DevTrustLayout from './layouts/DevTrustLayout/DevTrustLayout';
import Overview from './pages/devtrust/getting-started/Overview';
import Architecture from './pages/devtrust/getting-started/Architecture';
import IntegrationStatus from './pages/devtrust/getting-started/IntegrationStatus';
import APIReference from './pages/devtrust/api/APIReference';
import Webhooks from './pages/devtrust/api/Webhooks';
import PermissionsScopes from './pages/devtrust/api/PermissionsScopes';
import RateLimits from './pages/devtrust/api/RateLimits';
import SecurityPosture from './pages/devtrust/security/SecurityPosture';
import AuditLogs from './pages/devtrust/security/AuditLogs';
import Compliance from './pages/devtrust/security/Compliance';
import PartnerReviewProcess from './pages/devtrust/support/PartnerReviewProcess';
import ContactSupport from './pages/devtrust/support/ContactSupport';
import FAQ from './pages/devtrust/support/FAQ';

function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<Navigate to="/developers/overview" replace />} />
          <Route path="/developers" element={<DevTrustLayout />}>
            <Route index element={<Navigate to="/developers/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="architecture" element={<Architecture />} />
            <Route path="integration-status" element={<IntegrationStatus />} />
            <Route path="api" element={<APIReference />} />
            <Route path="webhooks" element={<Webhooks />} />
            <Route path="permissions" element={<PermissionsScopes />} />
            <Route path="rate-limits" element={<RateLimits />} />
            <Route path="security" element={<SecurityPosture />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="partner-review" element={<PartnerReviewProcess />} />
            <Route path="contact" element={<ContactSupport />} />
            <Route path="faq" element={<FAQ />} />
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
