// src/pages/devtrust/security/SecurityPosture.tsx
import ContactCard from '../../../components/devtrust/ContactCard';

export default function SecurityPosture() {
  return (
    <>
      <h1 className="dt-title">Security Posture</h1>
      <p className="dt-subtitle">
        Designed to minimize risk, prove accountability, and support partner security review.
      </p>

      <h2 className="dt-section-title">Encryption</h2>
      <div className="dt-two-col">
        <div className="dt-col-card">
          <h4>In Transit</h4>
          <ul>
            <li>TLS 1.3 for all HTTPS connections</li>
            <li>API, webhooks, web interface</li>
            <li>Certificate pinning (mobile apps)</li>
          </ul>
        </div>
        <div className="dt-col-card">
          <h4>At Rest</h4>
          <ul>
            <li>AES-256 encryption for database</li>
            <li>AWS RDS encryption enabled</li>
            <li>Secrets vault (AWS Secrets Manager)</li>
          </ul>
        </div>
      </div>

      <h2 className="dt-section-title">Key Security Features</h2>
      <div className="dt-card">
        <ul className="dt-principles">
          <li><span className="dt-principle__num">→</span><span><strong>Property access codes:</strong> Encrypted at application layer, decrypted only on authorized request with audit log entry</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>API keys:</strong> Hashed using bcrypt, never stored in plaintext, rotatable via PM portal</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>Webhook signatures:</strong> HMAC-SHA256 validation before processing any payload</span></li>
          <li><span className="dt-principle__num">→</span><span><strong>Session management:</strong> Short-lived JWTs (15 min), automatic refresh, secure cookie flags</span></li>
        </ul>
      </div>

      <h2 className="dt-section-title">Incident Response</h2>
      <div className="dt-card">
        <p className="dt-text" style={{ marginBottom: 12 }}>
          Lookara has documented incident response procedures for security events, data
          breaches, and operational failures:
        </p>
        <ul className="dt-principles">
          <li><span className="dt-principle__num">1.</span><span><strong>Detection:</strong> Automated monitoring for anomalous access patterns, failed login attempts, API rate limit violations</span></li>
          <li><span className="dt-principle__num">2.</span><span><strong>Containment:</strong> Ability to disable compromised API keys, suspend user accounts, isolate affected systems</span></li>
          <li><span className="dt-principle__num">3.</span><span><strong>Investigation:</strong> Audit logs provide complete forensic trail—who, what, when, where</span></li>
          <li><span className="dt-principle__num">4.</span><span><strong>Notification:</strong> Affected partners and customers notified within 72 hours of confirmed breach per GDPR/CCPA</span></li>
        </ul>
      </div>

      <div className="dt-contacts">
        <ContactCard
          title="Security Contact"
          email="security@lookara.com"
          sla="Monitored 24/7, critical incidents acknowledged within 1 hour"
        />
        <ContactCard
          title="Integration Support"
          email="integrations@lookara.com"
          sla="48h for requests, 4h for production incidents"
        />
      </div>
    </>
  );
}