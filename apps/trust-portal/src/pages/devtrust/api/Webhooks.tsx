// src/pages/devtrust/api/Webhooks.tsx
import { TableBadge } from '../../../components/devtrust/Primitives';
import CodeBlock from '../../../components/devtrust/CodeBlock';

const EVENTS = [
  { type: 'task.created', desc: 'New operational task created', status: 'LIVE' },
  { type: 'task.completed', desc: 'Task marked complete by vendor', status: 'LIVE' },
  { type: 'task.failed', desc: 'Task failed or missed SLA deadline', status: 'LIVE' },
  { type: 'emergency.triggered', desc: 'Emergency mode activated for property', status: 'LIVE' },
  { type: 'emergency.resolved', desc: 'Emergency incident resolved', status: 'LIVE' },
  { type: 'compliance.deadline_approaching', desc: 'Compliance item due within 30 days', status: 'PLANNED' },
  { type: 'vendor.check_in', desc: 'Vendor checked in at property', status: 'PLANNED' },
];

const STATUS_MAP: Record<string, 'yes' | 'planned'> = { LIVE: 'yes', PLANNED: 'planned' };

export default function Webhooks() {
  return (
    <>
      <h1 className="dt-title">Webhooks</h1>
      <p className="dt-subtitle">
        Reliable, signed event delivery with automatic retries and idempotency.
      </p>

      <h2 className="dt-section-title">Event Model</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          Lookara uses webhooks to notify partners of operational events in real-time. Events
          are JSON payloads delivered via HTTPS POST to registered endpoints.
        </p>
        <ul className="dt-principles">
          <li><span className="dt-principle__num">→</span><span><strong>At-least-once delivery:</strong> Events may be delivered multiple times—use idempotency keys</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>Signed payloads:</strong> HMAC-SHA256 signature in header for verification</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>Automatic retries:</strong> Exponential backoff (1s, 5s, 25s, 125s, 10min) up to 5 attempts</span></li>
        </ul>
      </div>

      <h2 className="dt-section-title">Event Types</h2>
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr><th>Event Type</th><th>Description</th><th>Status</th></tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.type}>
                <td><code>{e.type}</code></td>
                <td>{e.desc}</td>
                <td><TableBadge kind={STATUS_MAP[e.status]}>{e.status}</TableBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="dt-section-title">Signature Verification</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          Webhook requests include an <code>X-Lookara-Signature</code> header. Verify this
          signature using your webhook secret:
        </p>
      </div>

      <CodeBlock lang="Node.js">{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const computed = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}`}</CodeBlock>

      <h2 className="dt-section-title">Example Payload</h2>
      <CodeBlock lang="JSON">{`{
  "event_id": "evt_1a2b3c4d5e6f",
  "event_type": "task.completed",
  "timestamp": "2026-01-06T15:42:33Z",
  "data": {
    "task_id": "task_xyz789",
    "property_id": "prop_abc123",
    "task_type": "turnover_cleaning",
    "vendor_id": "vendor_clean_001",
    "completed_at": "2026-01-06T15:40:12Z",
    "status": "completed"
  },
  "idempotency_key": "idem_task_xyz789_completed"
}`}</CodeBlock>
    </>
  );
}