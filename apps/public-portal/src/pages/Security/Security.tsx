// apps/public-portal/src/pages/Security/Security.tsx
import { Link } from 'react-router-dom';
import './Security.css';

const TRUST_SIGNALS = [
  { label: 'Encryption',      value: 'AES-256 / TLS 1.3' },
  { label: 'Audit Logging',   value: 'Always active' },
  { label: 'Access Control',  value: 'Role-based' },
  { label: 'Guest Data',      value: 'Never stored' },
];

const NEVER = [
  'No pricing changes',
  'No availability overrides',
  'No guest messaging bypass',
  'No review manipulation',
  'No guest data export',
  'No scraping or unauthorized access',
];

const ACCESS = [
  { role: 'Property Managers', desc: 'Full operational control — tasks, vendors, compliance, incidents.' },
  { role: 'Vendors',           desc: 'Task-based access only. Scoped to assigned jobs.' },
  { role: 'Owners',            desc: 'Read-only visibility. No operational controls.' },
  { role: 'Admins',            desc: 'Scoped oversight. Audit-visible actions only.' },
];

const AUDIT_WHAT = [
  'Who did it',
  'When it happened',
  'What changed',
  'What it was before',
];

const AUDIT_ENTRIES = [
  { action: 'Task assigned',     detail: 'Turnover #1247',   time: '14:32:18 UTC' },
  { action: 'Vendor dispatched', detail: 'Elite Clean Co',   time: '14:32:19 UTC' },
  { action: 'Status updated',    detail: 'In Progress',      time: '15:10:44 UTC' },
  { action: 'Task completed',    detail: 'Photos uploaded',  time: '16:02:31 UTC' },
];

const DATA_PRACTICES = [
  { label: 'Guest personal data',   value: 'Never stored' },
  { label: 'Payment data',          value: 'Not processed' },
  { label: 'Data sold',             value: 'Never' },
  { label: 'Retention',             value: 'Operational logs time-bound · Audit logs extended' },
  { label: 'Deletion requests',     value: 'Processed per applicable privacy regulations' },
];

const COMPLIANCE_ITEMS = [
  { title: 'GDPR-Aligned Design',      body: 'Data minimization, access control, right to deletion — built into the architecture.' },
  { title: 'CCPA-Aligned Design',      body: 'California Consumer Privacy Act principles applied for US-based users.' },
  { title: 'Least Privilege Access',   body: 'Users access only what their role requires. No exceptions.' },
];

const INFRA = [
  'Encrypted at rest (AES-256) and in transit (TLS 1.3)',
  'Monitored infrastructure',
  'Defense-in-depth architecture',
  'Every data access logged with user ID, timestamp, and action type',
];

export default function Security() {
  return (
    <div className="security-page">
      {/* ── HERO ── */}
      <section className="sec-hero">
        <div className="sec-container">
          <div className="sec-hero__inner">
            <div className="sec-eyebrow">Trust & Security</div>
            <h1 className="sec-hero__title">
              Built to protect your operations —{' '}
              <span className="highlight">and respect platform rules.</span>
            </h1>
            <p className="sec-hero__sub">
              Lookara is designed to coordinate operations without touching pricing,
              availability, or guest data.
            </p>

            <div className="sec-trust-signals">
              {TRUST_SIGNALS.map(s => (
                <div key={s.label} className="sec-trust-signal">
                  <div className="sec-trust-signal__label">{s.label}</div>
                  <div className="sec-trust-signal__val">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OTA-SAFE ── */}
      <section className="sec-section">
        <div className="sec-container">
          <div className="sec-ota">
            <div className="sec-ota__left">
              <div className="sec-label">Platform-Safe by Design</div>
              <h2 className="sec-title">Lookara does not interfere with booking platforms.</h2>
              <p className="sec-intro">
                These are not policies. They are enforced by the system. These constraints
                are architectural — not optional.
              </p>
            </div>

            <div className="sec-never-list">
              {NEVER.map(n => (
                <div key={n} className="sec-never-row">
                  <div className="sec-never-x">✕</div>
                  <div className="sec-never-text">{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCESS CONTROL ── */}
      <section className="sec-section sec-section--alt">
        <div className="sec-container">
          <div className="sec-label">Controlled Access</div>
          <h2 className="sec-title">Access is restricted by role.</h2>
          <p className="sec-intro">Role separation is enforced at the system level.</p>

          <div className="sec-access-grid">
            {ACCESS.map(a => (
              <div key={a.role} className="sec-access-card">
                <div className="sec-access-role">{a.role}</div>
                <div className="sec-access-desc">{a.desc}</div>
              </div>
            ))}
          </div>

          <div className="sec-access-footer">
            Access boundaries are enforced — not assumed.
          </div>
        </div>
      </section>

      {/* ── AUDIT TRAIL ── */}
      <section className="sec-section">
        <div className="sec-container">
          <div className="sec-audit">
            <div className="sec-audit__left">
              <div className="sec-label">Full Audit Trail</div>
              <h2 className="sec-title">Every action is recorded.</h2>
              <p className="sec-intro">Nothing is hidden. Nothing is rewritten.</p>

              <div className="sec-audit-what">
                {AUDIT_WHAT.map(item => (
                  <div key={item} className="sec-audit-row">
                    <div className="sec-audit-dot" />
                    <div className="sec-audit-text">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sec-audit-log">
              <div className="sec-audit-log__header">
                <div className="sec-audit-log__title">Audit Log</div>
                <div className="sec-audit-log__live">Recording</div>
              </div>

              <div className="sec-audit-entries">
                {AUDIT_ENTRIES.map((e, i) => (
                  <div key={i} className="sec-audit-entry">
                    <div className="sec-audit-entry__action">
                      <strong>{e.action}</strong> — {e.detail}
                    </div>
                    <div className="sec-audit-entry__time">{e.time}</div>
                  </div>
                ))}
              </div>

              <div className="sec-audit-footer">Every entry is permanent.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DATA PRACTICES ── */}
      <section className="sec-section sec-section--alt">
        <div className="sec-container">
          <div className="sec-label">Data Practices</div>
          <h2 className="sec-title">Operations-only system.</h2>

          <div className="sec-data-rows">
            {DATA_PRACTICES.map(row => (
              <div key={row.label} className="sec-data-row">
                <div className="sec-data-row__label">{row.label}</div>
                <div className="sec-data-row__val">{row.value}</div>
              </div>
            ))}
          </div>

          <p className="sec-data-note">
            Only the data required to coordinate operations is used.
          </p>
        </div>
      </section>

      {/* ── COMPLIANCE ── */}
      <section className="sec-section">
        <div className="sec-container">
          <div className="sec-compliance">
            <div className="sec-compliance__left">
              <div className="sec-label">Compliance-Aligned</div>
              <h2 className="sec-title">Built with privacy principles in mind.</h2>
              <p className="sec-intro">
                Not certified — aligned. We follow the principles, not just the labels.
              </p>
            </div>

            <div className="sec-compliance-items">
              {COMPLIANCE_ITEMS.map(c => (
                <div key={c.title} className="sec-compliance-item">
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INFRASTRUCTURE ── */}
      <section className="sec-section sec-section--alt">
        <div className="sec-container">
          <div className="sec-label">Infrastructure</div>
          <h2 className="sec-title">Secure by construction.</h2>
          <p className="sec-intro">No marketing. Just how it's built.</p>

          <div className="sec-infra-list">
            {INFRA.map(row => (
              <div key={row} className="sec-infra-row">
                <div className="sec-infra-check">✓</div>
                <div className="sec-infra-text">{row}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY CONTACT ── */}
      <section className="sec-contact">
        <div className="sec-container">
          <div className="sec-contact__inner">
            <div className="sec-contact__left">
              <h2>Security Contact</h2>
              <p>
                Report vulnerabilities:{' '}
                <a href="mailto:security@lookara.com">security@lookara.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OTA REVIEW ── */}
      <section className="sec-review-section">
        <div className="sec-container">
          <div className="sec-review-inner">
            <div className="sec-label">For Platform Review Teams</div>
            <h2 className="sec-review-title">OTA Integration Review</h2>
            <p className="sec-review-sub">
              Detailed integration documentation, API architecture, and security controls
              available upon request.
            </p>
            <a
              href="mailto:security@lookara.com"
              className="sec-btn sec-btn--primary"
              data-tip="Request reviewer access"
            >
              Request Reviewer Access →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}