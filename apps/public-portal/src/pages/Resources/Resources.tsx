// apps/public-portal/src/pages/Resources/Resources.tsx
import { Link } from 'react-router-dom';
import './Resources.css';

const GETTING_STARTED = [
  { type: 'Property Managers', title: 'Getting started as a Property Manager', to: '/solutions/pm' },
  { type: 'Vendors',           title: 'Getting started as a Vendor',           to: '/solutions/vendor' },
  { type: 'Owners',            title: 'Getting started as an Owner',           to: '/solutions/owner' },
];

const PRODUCT_LINKS = [
  { label: 'Product Overview',   to: '/product' },
  { label: 'Operational Tools',  to: '/tools' },
  { label: 'Developer Portal',   to: 'https://dev.lookara.com', external: true },
];

const GUIDE_ITEMS = [
  'Setting up your vendor pool',
  'Compliance tracking',
  'Emergency workflow',
  'SLA management',
  'Audit trail',
  'Owner visibility',
];

const TRUST_LINKS = [
  { label: 'Trust & Security Overview', to: '/security' },
  { label: 'OTA Integration Review',    to: 'https://dev.lookara.com', external: true },
  { label: 'System Status',             to: '/status' },
];

const SUPPORT_ROWS = [
  { role: 'Property Managers',          email: 'support@lookara.com' },
  { role: 'Security',                   email: 'security@lookara.com' },
  { role: 'Enterprise & Partnerships',  email: 'hello@lookara.com' },
];

export default function Resources() {
  return (
    <div className="res-page">
      {/* ── HERO ── */}
      <section className="res-hero">
        <div className="res-container">
          <div className="res-label">Resources</div>
          <h1 className="res-hero__title">
            Understand how the system works.
            <br />
            <span className="highlight">Nothing extra. Nothing hidden.</span>
          </h1>
          <p className="res-hero__sub">
            Documentation, guides, security references, and contact information.
          </p>
        </div>
      </section>

      {/* ── GETTING STARTED ── */}
      <section className="res-block">
        <div className="res-container">
          <div className="res-label">Getting Started</div>
          <h2 className="res-title">Start here</h2>
          <p className="res-sub">Onboarding guides for each role.</p>

          <div className="res-grid-3">
            {GETTING_STARTED.map(item => (
              <Link key={item.title} to={item.to} className="res-card">
                <div className="res-card__type">{item.type}</div>
                <div className="res-card__title">{item.title}</div>
                <div className="res-card__arrow">Read →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT ── */}
      <section className="res-block res-block--alt">
        <div className="res-container">
          <div className="res-label">Product</div>
          <h2 className="res-title">How the system works.</h2>

          <div className="res-link-list">
            {PRODUCT_LINKS.map(link => (
              link.external ? (
                <a key={link.label} href={link.to} target="_blank" rel="noreferrer" className="res-link-row">
                  <span>{link.label}</span>
                  <span>→</span>
                </a>
              ) : (
                <Link key={link.label} to={link.to} className="res-link-row">
                  <span>{link.label}</span>
                  <span>→</span>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ── OPERATIONAL GUIDES ── */}
      <section className="res-block">
        <div className="res-container">
          <div className="res-guides">
            <div className="res-guides__left">
              <div className="res-label">Operational Guides</div>
              <h2 className="res-title">Available soon.</h2>
              <p className="res-sub">
                Practical guides for running structured STR operations.
              </p>
            </div>

            <ul className="res-guides__list">
              {GUIDE_ITEMS.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── TRUST & SECURITY ── */}
      <section className="res-block res-block--alt">
        <div className="res-container">
          <div className="res-label">Trust & Security</div>
          <h2 className="res-title">
            What we don't touch — and how the system is built.
          </h2>
          <p className="res-sub res-sub--spaced">
            OTA-safe by design. Architectural constraints, not policies.
          </p>

          <div className="res-link-list">
            {TRUST_LINKS.map(link => (
              link.external ? (
                <a key={link.label} href={link.to} target="_blank" rel="noreferrer" className="res-link-row">
                  <span>{link.label}</span>
                  <span>→</span>
                </a>
              ) : (
                <Link key={link.label} to={link.to} className="res-link-row">
                  <span>{link.label}</span>
                  <span>→</span>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORT ── */}
      <section className="res-block">
        <div className="res-container">
          <div className="res-label">Support</div>
          <h2 className="res-title">Get help.</h2>

          <div className="res-support-list">
            {SUPPORT_ROWS.map(row => (
              <div key={row.role} className="res-support-row">
                <div className="res-support-row__role">{row.role}</div>
                <a href={`mailto:${row.email}`} className="res-support-row__email">
                  {row.email} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INVESTORS ── */}
      <section className="res-investors">
        <div className="res-container">
          <div className="res-investors__inner">
            <div className="res-investors__label">For Investors</div>
            <div className="res-investors__text">
              Company information available upon request.{' '}
              <a href="mailto:investors@lookara.com">investors@lookara.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="res-cta">
        <div className="res-container">
          <div className="res-cta__inner">
            <h2 className="res-cta__title">See the system in action.</h2>
            <div className="res-cta__btns">
              <Link to="/request-access" className="res-btn res-btn--primary" data-tip="Start as a Property Manager">
                Start as Property Manager →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}