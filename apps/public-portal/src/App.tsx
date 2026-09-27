// apps/public-portal/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout/PublicLayout';
import Home from './pages/Home/Home';
import Product from './pages/Product/Product';
import Pricing from './pages/Pricing/Pricing';
import Tools from './pages/Tools/Tools';
import Security from './pages/Security/Security';
import SolutionsPM from './pages/Solutions/SolutionsPM';
import SolutionsVendor from './pages/Solutions/SolutionsVendor';
import SolutionsOwner from './pages/Solutions/SolutionsOwner';
import Resources from './pages/Resources/Resources';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Onboarding from './pages/Onboarding/Onboarding';
import InviteFlow from './pages/InviteFlow/InviteFlow';
import RequestAccess from './pages/RequestAccess/RequestAccess';
import VendorFlow from './pages/VendorFlow/VendorFlow';
import OwnerFlow from './pages/OwnerFlow/OwnerFlow';
import About from './pages/About/About';
import EmailVerification from './pages/EmailVerification/EmailVerification';
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import './App.css';

const Placeholder = ({ title }: { title: string }) => (
  <div className="pp-placeholder">
    <div className="pp-placeholder__eyebrow">Coming soon</div>
    <h1 className="pp-placeholder__title">{title}</h1>
    <p className="pp-placeholder__sub">
      This page is scaffolded and will be built in a follow-up drop.
    </p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ═══════════════════════════════════════════════════════
            STANDALONE ROUTES (no public nav / footer)
            ═══════════════════════════════════════════════════════ */}

        {/* Auth */}
        <Route path="/login"           element={<Login />} />
        <Route path="/request-access"  element={<RequestAccess />} />
        <Route path="/verify-email"    element={<EmailVerification />} />

        {/* Onboarding */}
        <Route path="/onboarding"      element={<Onboarding />} />
        <Route path="/join"            element={<InviteFlow />} />
        <Route path="/join/:token"     element={<InviteFlow />} />

        {/* Role portals (vendor / owner) */}
        <Route path="/vendor"          element={<VendorFlow />} />
        <Route path="/vendor/*"        element={<VendorFlow />} />
        <Route path="/owner"           element={<OwnerFlow />} />
        <Route path="/owner/*"         element={<OwnerFlow />} />

        {/* Legal & company (own minimal nav) */}
        <Route path="/about"           element={<About />} />
        <Route path="/terms"           element={<Terms />} />
        <Route path="/privacy"         element={<Privacy />} />

        {/* ═══════════════════════════════════════════════════════
            PUBLIC MARKETING ROUTES (with nav / footer shell)
            ═══════════════════════════════════════════════════════ */}
        <Route element={<PublicLayout />}>
          <Route path="/"                 element={<Home />} />
          <Route path="/product"          element={<Product />} />
          <Route path="/pricing"          element={<Pricing />} />
          <Route path="/tools"            element={<Tools />} />
          <Route path="/security"         element={<Security />} />
          <Route path="/solutions"        element={<Navigate to="/solutions/pm" replace />} />
          <Route path="/solutions/pm"     element={<SolutionsPM />} />
          <Route path="/solutions/vendor" element={<SolutionsVendor />} />
          <Route path="/solutions/owner"  element={<SolutionsOwner />} />
          <Route path="/resources"        element={<Resources />} />
          <Route path="/contact"          element={<Contact />} />
          <Route path="/status"           element={<Placeholder title="System Status" />} />
          <Route path="*"                 element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}