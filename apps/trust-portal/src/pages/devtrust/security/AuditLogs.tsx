// src/pages/devtrust/security/AuditLogs.tsx
import { InfoBox } from '../../../components/devtrust/Primitives';
import CodeBlock from '../../../components/devtrust/CodeBlock';

const FIELDS = [
  ['User ID:', 'Who performed the action'],
  ['Action type:', 'What they did (e.g., "emergency_mode.activate", "task.create")'],
  ['Resource affected:', 'Which property/task/vendor was involved'],
  ['Timestamp:', 'When it happened (UTC)'],
  ['IP address:', 'Where the request originated'],
  ['Status:', 'Success or failure'],
];

export default function AuditLogs() {
  return (
    <>
      <h1 className="dt-title">Audit Logs</h1>
      <p className="dt-subtitle">
        Immutable audit trail for accountability and forensic investigation.
      </p>

      <h2 className="dt-section-title">What's Logged</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          Every significant action in Lookara is logged to an immutable audit trail:
        </p>
        <ul className="dt-principles">
          {FIELDS.map(([k, v]) => (
            <li key={k}>
              <span className="dt-principle__num">→</span>
              <span><strong>{k}</strong> {v}</span>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="dt-section-title">Sample Audit Event</h2>
      <CodeBlock lang="JSON">{`{
  "event_id": "ae_1a2b3c4d5e6f",
  "timestamp": "2026-01-06T14:32:18Z",
  "user_id": "pm_abc123",
  "action": "emergency_mode.activate",
  "resource": "property_xyz789",
  "ip_address": "203.0.113.42",
  "status": "success",
  "metadata": {
    "incident_type": "lockout",
    "vendor_dispatched": "vendor_locksmith_001"
  }
}`}</CodeBlock>

      <h2 className="dt-section-title">Retention &amp; Access</h2>
      <div className="dt-two-col">
        <div className="dt-col-card">
          <h4>Immutability</h4>
          <ul>
            <li>Append-only storage (write-once)</li>
            <li>No edits or deletions permitted</li>
            <li>Cryptographic integrity checks</li>
          </ul>
        </div>
        <div className="dt-col-card">
          <h4>Retention</h4>
          <ul>
            <li>Minimum 2 years</li>
            <li>Configurable per compliance needs</li>
            <li>Archived to cold storage after 1 year</li>
          </ul>
        </div>
      </div>

      <InfoBox title="🔍 Access Controls">
        Audit logs are read-only for Property Managers via Reports → Audit History. Full
        forensic access requires admin privileges with justification logged.
      </InfoBox>
    </>
  );
}