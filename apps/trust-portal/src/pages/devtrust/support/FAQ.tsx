// src/pages/devtrust/support/FAQ.tsx
import FlowPanel from '../../../components/devtrust/FlowPanel';

const FAQS = [
  {
    q: 'Do you have a guest portal?',
    a: 'No. Phase 1 does not include a guest-facing portal. Guests interact with property managers via OTA platform messaging channels (Airbnb app, Booking.com inbox, etc.). Lookara receives operational triggers (check-in, maintenance requests) via PM workflows + integration events when available.',
  },
  {
    q: 'How do guests report issues?',
    a: 'Guests report issues through OTA messaging channels (Airbnb app, Booking.com support). Property managers receive these messages on the OTA platform and manually create tasks in Lookara if operational response is needed (e.g., dispatch cleaner, locksmith, maintenance). Future: automated task creation via keyword detection in mirrored messages (read-only, no content analysis).',
  },
  {
    q: 'Do you monetize Emergency Mode?',
    a: 'No. Emergency Mode (always-available operational incident workflow, PM-controlled) is a core feature included in all plans at no additional charge. We believe safety and accountability are foundational—monetizing emergency response would create perverse incentives and erode trust.',
  },
  {
    q: 'What is your email support SLA?',
    a: (
      <>
        <strong>Partner integration support:</strong> 48 hours for non-urgent requests, 4 hours
        for production incidents affecting integration reliability.<br /><br />
        <strong>Security incidents:</strong> Monitored 24/7, critical incidents (data breach,
        unauthorized access) acknowledged within 1 hour, full response within 24 hours.<br /><br />
        <strong>Property Manager support:</strong> 24 hours for standard support, 1 hour for
        emergency-related issues (vendor no-show, access problems).
      </>
    ),
  },
  {
    q: 'How do you handle GDPR/CCPA data deletion requests?',
    a: (
      <>
        Property Managers can delete their accounts via Settings → Account → Delete Account.
        All operational data (properties, tasks, vendor profiles) is permanently deleted
        within 30 days. Audit logs are retained for 2 years per compliance/legal requirements,
        then purged. For vendor-initiated deletion requests, contact{' '}
        <a href="mailto:privacy@lookara.com">privacy@lookara.com</a> with subject line
        "Data Deletion Request" and account identifier.
      </>
    ),
  },
  {
    q: 'Do you share data between property managers?',
    a: "No. Property manager data is siloed per account. PM Company A cannot see PM Company B's properties, tasks, vendors, or operational metrics. The only exception: vendor SLA scoring is calculated per PM account (internal reliability metric) and never shared publicly or across PM accounts.",
  },
  {
    q: 'What happens if Lookara experiences downtime?',
    a: (
      <>
        <strong>Emergency Mode:</strong> Always-available operational incident workflow
        operates independently with fallback SMS/voice notification paths—does not rely solely
        on web interface.<br /><br />
        <strong>Webhooks:</strong> Queued during downtime, delivered with retries once service
        restored (no event loss).<br /><br />
        <strong>Status monitoring:</strong> Real-time system status available to active
        integration partners (incident notifications, estimated resolution time).
      </>
    ),
  },
];

export default function FAQ() {
  return (
    <>
      <h1 className="dt-title">FAQ</h1>
      <p className="dt-subtitle">
        Reviewer-focused questions about scope, security, and operations.
      </p>
      {FAQS.map((f, i) => (
        <FlowPanel key={i} title={f.q}>
          <p>{f.a}</p>
        </FlowPanel>
      ))}
    </>
  );
}