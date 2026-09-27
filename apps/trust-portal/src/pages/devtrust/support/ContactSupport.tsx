// src/pages/devtrust/support/ContactSupport.tsx
import ContactCard from '../../../components/devtrust/ContactCard';

export default function ContactSupport() {
  return (
    <>
      <h1 className="dt-title">Contact &amp; Support</h1>
      <p className="dt-subtitle">
        Dedicated channels for integration support and security incidents.
      </p>

      <h2 className="dt-section-title">Integration Support</h2>
      <div className="dt-contacts">
        <ContactCard
          title="Integration Requests"
          email="integrations@lookara.com"
          sla={<><strong>SLA:</strong> 48h for partner requests, 4h for production incidents</>}
        />
        <ContactCard
          title="Security Contact"
          email="security@lookara.com"
          sla={<><strong>SLA:</strong> 24/7 monitoring, critical incidents acknowledged within 1h</>}
        />
      </div>

      <h2 className="dt-section-title">Legal &amp; Compliance</h2>
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

      <h2 className="dt-section-title">Additional Resources</h2>
      <div className="dt-card">
        <ul className="dt-principles">
          <li>
            <span className="dt-principle__num">→</span>
            <span><strong>Documentation:</strong> <a href="https://docs.lookara.com" style={{ color: 'var(--dt-gold)' }}>docs.lookara.com</a></span>
          </li>
          <li>
            <span className="dt-principle__num">→</span>
            <span><strong>System Status:</strong> Available upon partner integration approval</span>
          </li>
          <li>
            <span className="dt-principle__num">→</span>
            <span><strong>Main Site:</strong> <a href="https://lookara.com" style={{ color: 'var(--dt-gold)' }}>lookara.com</a></span>
          </li>
        </ul>
      </div>
    </>
  );
}