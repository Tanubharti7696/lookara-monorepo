// src/pages/devtrust/security/Compliance.tsx
import ContactCard from '../../../components/devtrust/ContactCard';

const SUBPROCESSORS = [
  ['Cloud Hosting', 'AWS', 'Infrastructure, compute, storage', 'us-east-1'],
  ['Database', 'AWS RDS', 'Encrypted operational database', 'us-east-1'],
  ['Secrets Management', 'AWS Secrets Manager', 'API keys, access codes', 'us-east-1'],
  ['Email Delivery', 'SendGrid', 'Transactional emails only', 'Global'],
];

const RETENTION = [
  ['Operational logs:', 'Retained while contract active; deleted within 90 days of account termination'],
  ['Audit logs:', '2 years minimum (immutable, append-only, compliance-ready)'],
  ['Guest data:', 'Never stored (operations-only platform)'],
  ['Partner integration data:', 'Deleted within 30 days of partner disconnect or integration termination'],
  ['Backup retention:', '30 days (encrypted, access-controlled)'],
];

export default function Compliance() {
  return (
    <>
      <h1 className="dt-title">Compliance</h1>
      <p className="dt-subtitle">
        Honest disclosure of current compliance status and planned certifications.
      </p>

      <h2 className="dt-section-title">SOC 2 Type I</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          <strong>Status:</strong> Planned — Control framework implemented; audit scheduled<br />
          <strong>Scope:</strong> Security, Availability, Confidentiality
        </p>
        <p className="dt-text">
          Lookara is preparing for SOC 2 Type I audit. Current security practices follow SOC 2
          control framework (access controls, encryption, change management, incident response).
        </p>
      </div>

      <h2 className="dt-section-title">Data Protection</h2>
      <div className="dt-two-col">
        <div className="dt-col-card">
          <h4>GDPR Compliance</h4>
          <ul>
            <li>Data minimization principles</li>
            <li>Right to deletion (30-day process)</li>
            <li>Breach notification within 72h</li>
            <li>DPA available on request</li>
          </ul>
        </div>
        <div className="dt-col-card">
          <h4>CCPA Compliance</h4>
          <ul>
            <li>Transparency in data collection</li>
            <li>User data access requests</li>
            <li>Opt-out mechanisms</li>
            <li>No selling of personal data</li>
          </ul>
        </div>
      </div>

      <h2 className="dt-section-title">Data Deletion Requests</h2>
      <div className="dt-card">
        <p className="dt-text">
          Property Managers can delete their accounts via <strong>Settings → Account → Delete
          Account</strong>. All operational data (properties, tasks, vendor profiles) is
          permanently deleted within 30 days. Audit logs are retained for 2 years per
          compliance/legal requirements, then purged.
        </p>
      </div>

      <h2 className="dt-section-title">Data Retention Policy</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          Lookara maintains clear data retention boundaries to minimize risk and support compliance:
        </p>
        <ul className="dt-principles">
          {RETENTION.map(([k, v]) => (
            <li key={k}><span className="dt-principle__num">→</span><span><strong>{k}</strong> {v}</span></li>
          ))}
        </ul>
      </div>

      <h2 className="dt-section-title">Subprocessors</h2>
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr><th>Service</th><th>Provider</th><th>Purpose</th><th>Region</th></tr>
          </thead>
          <tbody>
            {SUBPROCESSORS.map(([s, p, u, r]) => (
              <tr key={s}><td>{s}</td><td>{p}</td><td>{u}</td><td>{r}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dt-contacts">
        <ContactCard
          title="Legal Inquiries"
          email="legal@lookara.com"
          sla="DPA requests, subprocessor disclosures, compliance questions"
        />
        <ContactCard
          title="Privacy Requests"
          email="privacy@lookara.com"
          sla="Data deletion, access requests, GDPR/CCPA compliance"
        />
      </div>
    </>
  );
}