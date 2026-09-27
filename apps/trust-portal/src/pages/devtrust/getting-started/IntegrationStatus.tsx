// src/pages/devtrust/getting-started/IntegrationStatus.tsx
import { InfoBox, TableBadge, StatusPill } from '../../../components/devtrust/Primitives';
import FlowPanel from '../../../components/devtrust/FlowPanel';

const PARTNERS = [
  { name: 'Airbnb', cal: 'yes', hook: 'planned', api: 'planned', type: 'Read-only', status: { kind: 'operational' as const, label: 'Pending Partner Approval' } },
  { name: 'Booking.com', cal: 'yes', hook: 'planned', api: 'no', type: 'Read-only', status: { kind: 'degraded' as const, label: 'Planned' } },
  { name: 'VRBO', cal: 'yes', hook: 'no', api: 'no', type: 'Read-only', status: { kind: 'degraded' as const, label: 'Planned' } },
  { name: 'iCal (Standard)', cal: 'yes', hook: 'no', api: 'no', type: 'Read-only', status: { kind: 'operational' as const, label: 'Supported' } },
];

export default function IntegrationStatus() {
  return (
    <>
      <h1 className="dt-title">Integration Status</h1>
      <p className="dt-subtitle">
        Current state of OTA partner integrations and API access levels.
      </p>

      <h2 className="dt-section-title">Partner Integration Readiness</h2>
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              <th>Partner</th>
              <th>Calendar Sync</th>
              <th>Webhooks</th>
              <th>API Access</th>
              <th>Access Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {PARTNERS.map((p) => (
              <tr key={p.name}>
                <td><strong>{p.name}</strong></td>
                <td><TableBadge kind={p.cal as any}>{p.cal === 'yes' ? 'YES' : 'N/A'}</TableBadge></td>
                <td><TableBadge kind={p.hook as any}>{p.hook === 'planned' ? 'PLANNED' : 'N/A'}</TableBadge></td>
                <td><TableBadge kind={p.api as any}>{p.api === 'planned' ? 'PENDING APPROVAL' : p.api === 'yes' ? 'YES' : 'PLANNED'}</TableBadge></td>
                <td>{p.type}</td>
                <td><StatusPill kind={p.status.kind}>{p.status.label}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoBox title="📋 Status Definitions">
        <strong>PLANNED</strong> indicates implementation-ready but inactive pending partner
        approval. No outbound calls are made prior to approval. <strong>PENDING APPROVAL</strong>{' '}
        indicates integration documentation submitted and awaiting partner security review.
      </InfoBox>

      <h2 className="dt-section-title">Integration Details</h2>

      <FlowPanel number={1} title="Airbnb Integration">
        <p><strong>What we support:</strong></p>
        <ul>
          <li>Calendar iCal sync (read-only reservation dates)</li>
          <li>Property metadata (address, amenities—no guest PII)</li>
          <li>Operational event webhooks (planned: check-in/out, maintenance flags)</li>
        </ul>
        <p><strong>What we don't yet:</strong></p>
        <ul>
          <li>Guest messaging content parsing (Phase 1 uses keyword triggers only)</li>
          <li>Booking creation/modification (operations-only)</li>
          <li>Pricing or availability updates (out of scope)</li>
        </ul>
        <p><strong>Required from Airbnb:</strong></p>
        <ul>
          <li>API access approval for calendar + property metadata</li>
          <li>Webhook endpoint registration for operational events</li>
          <li>Documentation on event payload schemas</li>
        </ul>
      </FlowPanel>

      <FlowPanel number={2} title="Booking.com Integration">
        <p><strong>Planned capabilities:</strong></p>
        <ul>
          <li>Property synchronization (metadata only)</li>
          <li>Reservation calendar sync</li>
          <li>Check-in/out event webhooks</li>
        </ul>
        <p><strong>Out of scope:</strong></p>
        <ul>
          <li>Guest communications access</li>
          <li>Pricing or inventory management</li>
          <li>Reviews or ratings integration</li>
        </ul>
      </FlowPanel>

      <FlowPanel number={3} title="VRBO Integration">
        <p><strong>Planned capabilities:</strong></p>
        <ul>
          <li>Property metadata synchronization</li>
          <li>Reservation calendar (iCal or API)</li>
          <li>Operational event notifications</li>
        </ul>
        <p><strong>Out of scope:</strong></p>
        <ul>
          <li>Guest portal or communications</li>
          <li>Dynamic pricing integration</li>
          <li>Booking creation/modification</li>
        </ul>
      </FlowPanel>

      <InfoBox title="📧 Contact for Integration Requests">
        For partner integration setup or questions:{' '}
        <a href="mailto:integrations@lookara.com">integrations@lookara.com</a>
      </InfoBox>
    </>
  );
}