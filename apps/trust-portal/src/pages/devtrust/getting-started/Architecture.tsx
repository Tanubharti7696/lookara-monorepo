// src/pages/devtrust/getting-started/Architecture.tsx
import { InfoBox } from '../../../components/devtrust/Primitives';

const LAYERS = [
  {
    title: '┌─ LOOKARA CORE OS ────────────────────────────┐',
    items: [
      '├─ Identity & RBAC Engine',
      '├─ Property Graph (multi-property portfolios)',
      '├─ Task Orchestration (dispatch + SLA tracking)',
      '├─ Notification Engine (SMS/Email/Push)',
      '├─ Audit Log Writer (append-only, immutable)',
      '├─ Compliance Tracker (deadlines + alerts)',
      '├─ Emergency Response (24/7 incident routing)',
      '└─ Vendor Coordination (check-in/out + proofs)',
    ],
  },
  {
    title: '┌─ INTEGRATIONS LAYER ─────────────────────────┐',
    items: [
      '├─ Connector Adapters (Airbnb, Booking, VRBO)',
      '├─ Event Router (webhook dispatcher)',
      '├─ Calendar Sync (iCal ingestion)',
      '└─ API Gateway (REST endpoints + auth)',
    ],
  },
  {
    title: '┌─ DATA LAYER ─────────────────────────────────┐',
    items: [
      '├─ Operational DB (encrypted at rest, AES-256)',
      '├─ Audit Log Store (append-only, 2-year retention)',
      '├─ Secrets Vault (API keys, access codes, encrypted)',
      '└─ Partner Webhooks (outbound event queue)',
    ],
  },
];

const BEHAVIORS = [
  ['Every action writes to Audit Log', 'before execution completes—ensures forensic trail for security review.'],
  ['Secrets never displayed without re-auth', '—property access codes require verification before reveal.'],
  ['Least privilege by role + property scope', '—PM at Company A cannot see Company B\'s data.'],
  ['Emergency Mode coordinates internal ops only', '—coordinates internal operational responders using multi-channel notification fallbacks. Does not initiate or intercept guest communications.'],
  ['Partner adapters isolated', '—Airbnb connector failure does not affect Booking.com integration.'],
];

const FLOW = [
  ['1. Airbnb →', 'Webhook POST', '/webhooks/airbnb/check-in'],
  ['2. Event Router →', 'Validates signature (HMAC-SHA256)'],
  ['3. Property Graph →', 'Lookup property + assigned PM'],
  ['4. Task Engine →', 'Create "Post-check-in inspection" task'],
  ['5. Notification →', 'SMS to assigned cleaner/inspector'],
  ['6. Audit Log →', 'Write event: "airbnb.check_in.received"'],
  ['7. Response →', '200 OK', '(idempotency key stored)'],
];

export default function Architecture() {
  return (
    <>
      <h1 className="dt-title">System Architecture</h1>
      <p className="dt-subtitle">
        Operations OS with layered security, event-driven integrations, and audit-first design.
      </p>

      <h2 className="dt-section-title">Architecture Overview</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 16 }}>
          Lookara is structured as a <strong>three-layer system</strong>: Core OS (operational
          engines), Integrations Layer (partner adapters + event routing), and Data Layer
          (encrypted storage + audit logs). This separation ensures partner integrations can
          scale without touching core business logic.
        </p>
        <div className="dt-arch">
          {LAYERS.map((layer, i) => (
            <div key={i} className="dt-arch__layer">
              <div className="dt-arch__title">{layer.title}</div>
              <div className="dt-arch__body">
                {layer.items.map((it) => <div key={it}>{it}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="dt-section-title">Trust Behaviors in Architecture</h2>
      <div className="dt-card">
        <ul className="dt-principles" style={{ gap: 10 }}>
          {BEHAVIORS.map(([strong, rest], i) => (
            <li key={i}>
              <span className="dt-principle__num">→</span>
              <span><strong>{strong}</strong>{rest}</span>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="dt-section-title">Data Flow: OTA Integration</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          Example: Airbnb check-in event triggers operational workflow
        </p>
        <div className="dt-arch">
          {FLOW.map((parts, i) => (
            <div key={i}>
              {parts.map((p, j) => (
                <span key={j} style={{ color: j === 0 ? undefined : j === 1 && p.startsWith('/') ? 'var(--dt-gold)' : undefined }}>
                  {j > 0 ? ' ' : ''}{p}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <InfoBox title="🔐 Security Note">
        All webhook payloads are signed with HMAC-SHA256. Invalid signatures are rejected
        before touching business logic. All partner API calls use encrypted secrets (AWS
        Secrets Manager or equivalent).
      </InfoBox>
    </>
  );
}