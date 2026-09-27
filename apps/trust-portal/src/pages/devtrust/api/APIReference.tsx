// src/pages/devtrust/api/APIReference.tsx
import { InfoBox, WarningBox, TableBadge } from '../../../components/devtrust/Primitives';
import CodeBlock from '../../../components/devtrust/CodeBlock';

const ENDPOINTS = [
  { path: '/properties', method: 'GET', desc: 'List properties with metadata', status: 'LIVE' },
  { path: '/tasks', method: 'GET', desc: 'List operational tasks', status: 'LIVE' },
  { path: '/tasks', method: 'POST', desc: 'Create internal operational tasks (non-booking, non-guest, non-pricing)', status: 'PLANNED', internal: true },
  { path: '/audit', method: 'GET', desc: 'Query audit log (read-only)', status: 'LIVE' },
  { path: '/bookings', method: 'POST', desc: 'Create/modify bookings', status: 'NEVER' },
];

const STATUS_MAP: Record<string, 'yes' | 'planned' | 'never'> = {
  LIVE: 'yes', PLANNED: 'planned', NEVER: 'never',
};

export default function APIReference() {
  return (
    <>
      <h1 className="dt-title">API Reference</h1>
      <p className="dt-subtitle">
        RESTful API for programmatic access to operational data. OAuth 2.0 support planned for Q2 2026.
      </p>

      <h2 className="dt-section-title">Authentication</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          <strong>Current:</strong> API key authentication (Bearer tokens)<br />
          <strong>Planned:</strong> OAuth 2.0 for partner integrations
        </p>
        <p className="dt-text">
          All requests require <code>Authorization: Bearer {'{api_key}'}</code> header. API
          keys are scoped per account and rotatable via PM portal.
        </p>
      </div>

      <InfoBox title="📋 Endpoint Availability">
        Endpoints marked <strong>LIVE</strong> are available in limited partner beta;{' '}
        <strong>PLANNED</strong> endpoints are not yet accessible and are documented for
        review purposes only.
      </InfoBox>

      <h2 className="dt-section-title">Base URL</h2>
      <CodeBlock lang="PRODUCTION">{`https://api.lookara.com/v1`}</CodeBlock>
      <CodeBlock lang="SANDBOX">{`Provided upon partner approval`}</CodeBlock>

      <InfoBox title="🧪 Sandbox Environment">
        Sandbox access is provided for payload structure validation and event simulation only.
        No live properties or guest data are accessible in sandbox environments. Sandbox
        environments do not connect to live OTA accounts and cannot send outbound requests to
        partner platforms. Sandbox environments cannot trigger outbound calls to partner platforms.
      </InfoBox>

      <h2 className="dt-section-title">Core Endpoints</h2>
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map((e, i) => (
              <tr key={i}>
                <td><code>{e.path}</code></td>
                <td>{e.method}</td>
                <td>
                  {e.desc}
                  {e.internal && <> <TableBadge kind="internal">INTERNAL OPS ONLY</TableBadge></>}
                </td>
                <td><TableBadge kind={STATUS_MAP[e.status]}>{e.status}</TableBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="dt-section-title">Example Request</h2>
      <CodeBlock lang="cURL">{`curl -X GET https://api.lookara.com/v1/properties \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</CodeBlock>

      <h2 className="dt-section-title">Example Response</h2>
      <CodeBlock lang="JSON">{`{
  "properties": [
    {
      "id": "prop_abc123",
      "name": "Downtown Loft",
      "address": "123 Main St, Denver, CO",
      "status": "active",
      "pm_id": "pm_xyz789"
    }
  ],
  "total": 1,
  "page": 1
}`}</CodeBlock>

      <WarningBox title="⚠ Guest Data Restriction">
        API responses do NOT include guest names, contact info, or booking references.
        Operations-only data is exposed.
      </WarningBox>

      <h2 className="dt-section-title">Change Management &amp; Versioning</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          Lookara follows strict change management practices to ensure partner integration stability:
        </p>
        <ul className="dt-principles">
          <li><span className="dt-principle__num">→</span><span><strong>Backward-compatible changes only:</strong> New fields, optional parameters, additional endpoints—never breaking existing integrations</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>Breaking changes require 90-day notice:</strong> Advance notification via email + developer portal dashboard</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>Versioned endpoints:</strong> <code>/v1</code>, <code>/v2</code> namespace isolation—old versions supported during migration period</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>Partner notification:</strong> All API changes communicated via email + changelog + dashboard alerts</span></li>
        </ul>
      </div>
    </>
  );
}