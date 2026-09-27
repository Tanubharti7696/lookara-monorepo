// src/pages/devtrust/support/PartnerReviewProcess.tsx
import { InfoBox } from '../../../components/devtrust/Primitives';
import FlowPanel from '../../../components/devtrust/FlowPanel';

const CHECKLIST = [
  'No guest PII stored',
  'No booking mutation',
  'No pricing control',
  'Read-only calendar ingestion',
  'Signed webhooks (HMAC-SHA256)',
  'Audit trail for all actions',
];

const STEPS = [
  { n: 1, title: 'Submit Partner Request', body: <>Complete the partner review form via email to <strong style={{ color: 'var(--dt-gold)' }}>integrations@lookara.com</strong>. Provide company details, integration scope, and technical contact. We respond within 48 hours with next steps.</> },
  { n: 2, title: 'Security Questionnaire', body: <>Complete partner security questionnaire if required (Airbnb, Booking.com typically require this). We provide detailed responses with supporting documentation (audit logs, encryption practices, RBAC model). Expected timeline: 1-2 weeks.</> },
  { n: 3, title: 'Technical Validation', body: <>Partner technical team reviews integration documentation, API endpoints, webhook delivery mechanics. Sandbox environment access provided for testing. We work directly with your engineers to validate event flows and error handling.</> },
  { n: 4, title: 'Limited Pilot', body: <>Production integration enabled for limited set of properties (5-10) to validate operational reliability, error handling, and support workflows. Monitoring period: 30 days. We provide weekly status reports and incident analysis.</> },
  { n: 5, title: 'Full Rollout', body: <>After successful pilot, integration approved for all Lookara property managers using partner platform. Ongoing monitoring and incident response procedures documented. Quarterly business reviews scheduled with partner team.</> },
];

export default function PartnerReviewProcess() {
  return (
    <>
      <h1 className="dt-title">Partner Review Process</h1>
      <p className="dt-subtitle">Clear path from initial request to full production rollout.</p>

      <h2 className="dt-section-title">Reviewer Checklist</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 14 }}>
          Quick validation checklist for security/compliance reviewers:
        </p>
        <div className="dt-checklist">
          {CHECKLIST.map((c) => (
            <div key={c} className="dt-checklist__item">
              <span className="dt-checklist__check">✓</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="dt-section-title">Review Timeline</h2>
      {STEPS.map((s) => (
        <FlowPanel key={s.n} number={s.n} title={s.title} defaultOpen={s.n === 1}>
          <p>{s.body}</p>
        </FlowPanel>
      ))}

      <InfoBox title="📧 Ready to Start?">
        Contact <strong><a href="mailto:integrations@lookara.com">integrations@lookara.com</a></strong>{' '}
        to begin the partner review process. Include: company name, integration scope
        (calendar/webhooks/API), and technical contact.
      </InfoBox>
    </>
  );
}