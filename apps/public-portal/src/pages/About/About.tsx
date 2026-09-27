// apps/public-portal/src/pages/About/About.tsx
import { Link } from 'react-router-dom';
import './About.css';

const ARROW_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const WHAT_LOOKARA_MANAGES = [
  'Task orchestration',
  'Vendor coordination',
  'Operational scheduling',
  'Compliance tracking',
  'Emergency response',
  'Audit history',
  'Operational reporting',
  'Team coordination',
];

const WHAT_LOOKARA_DOES_NOT = [
  'Reservations or availability management',
  'Pricing or revenue optimization',
  'Guest messaging or communication',
  'Reviews or reputation management',
  'Payment processing',
  'Marketplace listings',
  'Channel management',
];

const INTEGRATION_PRINCIPLES = [
  { label: 'Read-first architecture', text: 'Lookara consumes only the data required to initiate and coordinate operations. It does not write to, modify, or mirror external platform data.' },
  { label: 'No OTA operational dependency', text: 'If an OTA connection fails, Property Managers can still create and manage properties, tasks, vendors, compliance records, incidents, and schedules. External integrations are enhancements, not prerequisites.' },
  { label: 'Customer authorization', text: 'Every external connection must be initiated and authorized by the Property Manager organization that controls the connected account. Lookara does not establish integrations unilaterally.' },
  { label: 'Source attribution', text: 'Every imported reservation, calendar block, task trigger, or property record must show its source. Data origin is recorded and visible to authorized administrators.' },
  { label: 'Safe disconnection', text: 'Revoking an integration stops future synchronization but does not destroy the customer\'s independent Lookara operational records. Data portability and continuity are protected.' },
];

const PLATFORM_PRINCIPLES = [
  { label: 'Operational first', text: 'Every feature must improve day-to-day operational execution. Features that do not serve this purpose are out of scope.' },
  { label: 'Role-based access', text: 'Users receive only the permissions necessary for their operational responsibilities. Access is assigned by the primary property manager and cannot be self-elevated.' },
  { label: 'Auditability', text: 'Significant operational actions are recorded to support accountability, traceability, and operational review across teams.' },
  { label: 'Least necessary data', text: 'The platform collects only the information required to perform operational workflows. Data is not collected speculatively or retained beyond its operational purpose.' },
  { label: 'Respect for external platforms', text: 'Lookara complements existing systems and operates within the published capabilities and authorization boundaries of authorized integrations. It does not attempt to expand beyond its granted scope.' },
  { label: 'Long-term stability', text: 'Product decisions prioritize reliability, maintainability, and responsible growth over rapid feature expansion. We build for long-term operational reliability.' },
];

const TRUST_PRINCIPLES = [
  { label: 'Respect platform boundaries', text: 'Lookara does not modify pricing, availability, reservations, reviews, or marketplace behavior on any external platform. These boundaries intentionally define the operational scope of the platform.' },
  { label: 'Operational transparency', text: 'All operational actions taken within Lookara are recorded through a comprehensive audit history. This creates accountability and traceability across teams and over time.' },
  { label: 'Least-privilege access', text: 'Every user receives only the permissions required for their operational role. Access is assigned and controlled by the primary property manager, not self-selected.' },
  { label: 'Data minimization', text: 'Lookara only collects and stores information necessary to support operational workflows. We do not aggregate, resell, or profile user data beyond its operational purpose. Operational data is retained only as necessary to support platform functionality, customer requirements, and applicable legal obligations.' },
  { label: 'Responsible integrations', text: 'External platform integrations are designed to respect published APIs, authorization models, rate limits, and platform policies. Lookara follows documented authentication and authorization mechanisms provided by integration partners. We do not use scraping, reverse engineering, or unauthorized access methods.' },
  { label: 'Security by design', text: 'Security, access control, auditability, and operational resilience are foundational platform requirements. They are not optional features or post-launch additions.' },
];

const CONTACTS = [
  { purpose: 'General inquiries',      email: 'hello@lookara.com' },
  { purpose: 'Support',                email: 'support@lookara.com' },
  { purpose: 'Security',               email: 'security@lookara.com' },
  { purpose: 'Platform & integrations', email: 'integrations@lookara.com' },
  { purpose: 'Partnerships',           email: 'partners@lookara.com' },
];

export default function About() {
  return (
    <div className="about-page">
      <nav className="about-nav">
        <div className="about-nav-logo">
          <div className="about-logo-mark" />
          <span>Lookara</span>
        </div>
        <Link to="/" className="about-nav-back">
          {ARROW_LEFT}
          Back to site
        </Link>
      </nav>

      <div className="about-page-wrap">
        {/* Header */}
        <header className="about-header">
          <span className="about-tag">Lookara Systems LLC</span>
          <h1 className="about-title">About Lookara</h1>
          <p className="about-intro">
            Lookara Systems LLC develops software that helps professional property managers
            coordinate operational activities across short-term rental portfolios. This page
            explains the purpose of the platform, its operational scope, and the principles
            that govern its design and integrations. It is intended for customers, platform
            partners, integration reviewers, security teams, and technical evaluators.
          </p>
        </header>

        {/* 01 MISSION */}
        <section id="mission" className="about-section">
          <span className="about-anchor">01 — Mission</span>
          <h2 className="about-section-title">Keep operations organized, accountable, and reliable.</h2>
          <div className="about-body">
            <p>Lookara exists to help professional property managers coordinate the daily execution of short-term rental operations through a structured, auditable platform.</p>
            <p>Our mission is to reduce operational friction by connecting people, tasks, vendors, compliance requirements, and property activity into a single accountable system. We believe that disciplined operational execution supports better guest experiences, stronger owner confidence, and more reliable property management businesses.</p>
            <p>Lookara does not pursue growth at the expense of operational integrity. We are building long-term infrastructure for a professional industry, not a consumer product optimized for rapid adoption.</p>
          </div>
        </section>

        {/* 02 PLATFORM DEFINITION */}
        <section id="what-lookara-is" className="about-section">
          <span className="about-anchor">02 — Platform Definition</span>
          <h2 className="about-section-title">What Lookara is — and is not.</h2>
          <div className="about-body">
            <p>Lookara is an operational software platform (Operations OS) that converts authorized reservation, property, compliance, incident, and operational events into structured tasks, dispatch, vendor execution, owner visibility, SLA monitoring, and auditable resolution.</p>
            <p>Lookara does not control bookings, rates, availability, payouts, or guest ownership.</p>
            <p>Lookara is designed to complement existing Property Management Systems (PMSs) and Online Travel Agency (OTA) platforms rather than replace them. The platform is intended for professional property management organizations and their authorized operational teams.</p>
            <p>Lookara is intentionally focused on operational execution. It is not a reservation management system, a guest engagement platform, a channel manager, a pricing engine, or a marketplace.</p>
            <p>The platform supports structured collaboration between three defined roles — Property Managers, Vendors, and Property Owners — through clearly scoped permissions, audit history, and operational workflows. Each role has access only to the functions appropriate to their operational position.</p>
          </div>

          <div className="about-principles">
            <div className="about-principle">
              <div className="about-principle-label">What Lookara manages</div>
              <div className="about-principle-text">
                <ul className="about-inline-list">
                  {WHAT_LOOKARA_MANAGES.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            </div>
            <div className="about-principle">
              <div className="about-principle-label">What Lookara does not manage</div>
              <div className="about-principle-text">
                <ul className="about-inline-list">
                  {WHAT_LOOKARA_DOES_NOT.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            </div>
            <div className="about-principle">
              <div className="about-principle-label">Integration scope</div>
              <div className="about-principle-text">
                Where Lookara integrates with third-party platforms, it does so solely to receive
                authorized operational data — such as check-in and check-out timing — necessary
                to trigger operational workflows. Integration behavior is limited to the
                permissions explicitly granted by each connected platform. Lookara does not
                write back to, modify, or circumvent any external platform function.
              </div>
            </div>
          </div>

          <div className="about-sub" style={{ marginTop: '2rem' }}>
            <div className="about-sub-title">Integration principles</div>
            <div className="about-principles">
              {INTEGRATION_PRINCIPLES.map((p) => (
                <div key={p.label} className="about-principle">
                  <div className="about-principle-label">{p.label}</div>
                  <div className="about-principle-text">{p.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 COMPANY */}
        <section id="company" className="about-section">
          <span className="about-anchor">03 — Company</span>
          <h2 className="about-section-title">Built for professional operations.</h2>
          <div className="about-body">
            <p>Lookara is developed by a team with experience in property management operations, software engineering, and workflow automation. The company is focused on building durable infrastructure for the property management industry.</p>
            <p>Lookara develops and maintains its own software platform and operational architecture. Our product philosophy is grounded in operational accountability, transparency, security, and structured execution. We do not make promises we cannot deliver, and we do not position our platform as a solution to problems outside its defined scope.</p>
          </div>

          <div className="about-company-block">
            <div className="about-company-rows">
              <div className="about-company-row">
                <div className="about-company-key">Legal entity</div>
                <div className="about-company-val"><strong>Lookara Systems LLC</strong></div>
              </div>
              <div className="about-company-row">
                <div className="about-company-key">State of formation</div>
                <div className="about-company-val">Florida, United States</div>
              </div>
              <div className="about-company-row">
                <div className="about-company-key">Entity type</div>
                <div className="about-company-val">Florida Limited Liability Company</div>
              </div>
              <div className="about-company-row">
                <div className="about-company-key">Industry focus</div>
                <div className="about-company-val">Professional short-term rental operations management</div>
              </div>
              <div className="about-company-row">
                <div className="about-company-key">Established</div>
                <div className="about-company-val">2026</div>
              </div>
              <div className="about-company-row">
                <div className="about-company-key">Governing law</div>
                <div className="about-company-val">Business operations, contracts, intellectual property, and platform development are managed under applicable United States laws and regulations.</div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 PLATFORM PRINCIPLES */}
        <section id="platform-principles" className="about-section">
          <span className="about-anchor">04 — Platform Principles</span>
          <h2 className="about-section-title">Engineering principles that guide product decisions.</h2>
          <div className="about-body">
            <p>These principles govern how Lookara is designed and how product decisions are evaluated. They are not aspirational — they are active constraints applied to every feature and integration.</p>
          </div>
          <div className="about-principles">
            {PLATFORM_PRINCIPLES.map((p) => (
              <div key={p.label} className="about-principle">
                <div className="about-principle-label">{p.label}</div>
                <div className="about-principle-text">{p.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 05 TRUST PHILOSOPHY */}
        <section id="trust" className="about-section">
          <span className="about-anchor">05 — Trust Philosophy</span>
          <h2 className="about-section-title">Built to work with the ecosystem — not around it.</h2>
          <div className="about-body">
            <p>Lookara is designed to complement existing Property Management Systems and industry platforms by improving operational coordination rather than replacing or circumventing them. Every design decision is made with platform integrity, data responsibility, and operational accountability as primary constraints.</p>
          </div>
          <div className="about-principles">
            {TRUST_PRINCIPLES.map((p) => (
              <div key={p.label} className="about-principle">
                <div className="about-principle-label">{p.label}</div>
                <div className="about-principle-text">{p.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 06 PLATFORM INTEGRITY */}
        <section id="platform-integrity" className="about-section">
          <span className="about-anchor">06 — Platform Integrity</span>
          <h2 className="about-section-title">Designed to be a responsible ecosystem participant.</h2>
          <div className="about-body">
            <p>This section is provided specifically for platform integration reviewers, API authorization teams, and technical compliance evaluators.</p>
          </div>
          <div className="about-integrity-block">
            <p>Lookara is an operational coordination platform. It does not function as a booking marketplace, channel manager, pricing engine, payment processor, or guest communication platform.</p>
            <p>When integrated with third-party services, Lookara uses authorized APIs solely to support operational workflows — such as maintenance coordination, compliance tracking, task management, and operational reporting. The platform does not manipulate marketplace behavior, interfere with reservation processes, or circumvent the intended functionality of partner platforms.</p>
            <p>Lookara does not store guest personal data beyond what is operationally necessary, does not share platform data with third parties outside the defined integration scope, and does not attempt to replicate or replace any function of a host-facing or guest-facing OTA product. Lookara does not impersonate users, automate actions beyond granted permissions, or attempt to access data outside authorized integration scopes. Lookara does not automate actions that require user intent or approval beyond the permissions explicitly granted by the connected platform.</p>
            <p>We believe long-term partnerships are built through transparency, responsible engineering, and respect for the operational boundaries established by our integration partners. Lookara is designed to participate responsibly within the broader property technology ecosystem, respecting the roles, responsibilities, and technical boundaries of the platforms with which it integrates.</p>
          </div>
        </section>

        {/* 07 CONTACT */}
        <section id="contact" className="about-section">
          <span className="about-anchor">07 — Contact</span>
          <h2 className="about-section-title">Get in touch.</h2>
          <div className="about-body">
            <p>For integration inquiries, security disclosures, legal correspondence, or general questions, use the appropriate contact below.</p>
          </div>
          <div className="about-contact-grid">
            {CONTACTS.map((c) => (
              <div key={c.purpose} className="about-contact-card">
                <div className="about-contact-purpose">{c.purpose}</div>
                <div className="about-contact-email">{c.email}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <div className="about-closing">
          <p className="about-closing-text">
            <strong>Lookara is committed to building responsible operational software that
            strengthens execution while respecting the policies, authorization boundaries, and
            ecosystem responsibilities of the platforms and partners with which it integrates.</strong>
          </p>
        </div>
      </div>

      <footer className="about-footer">
        <div className="about-footer-copy">© 2026 Lookara Systems LLC. All rights reserved.</div>
        <div className="about-footer-entity">Lookara Systems LLC · Florida, United States</div>
      </footer>
    </div>
  );
}