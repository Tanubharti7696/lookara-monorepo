// apps/public-portal/src/pages/Legal/Privacy.tsx
import { Link } from 'react-router-dom';
import LegalLayout, { type TocItem } from './LegalLayout';

const TOC: TocItem[] = [
  { id: 'intro',              num: '01', label: 'Introduction' },
  { id: 'tos-relationship',   num: '—',  label: 'Relationship to ToS' },
  { id: 'who-we-are',         num: '02', label: 'Who We Are' },
  { id: 'scope',              num: '03', label: 'Scope' },
  { id: 'information-collected', num: '04', label: 'Information We Collect' },
  { id: 'not-collected',      num: '05', label: 'What We Do Not Collect' },
  { id: 'how-we-use',         num: '06', label: 'How We Use Information' },
  { id: 'legal-basis',        num: '07', label: 'Legal Basis' },
  { id: 'integrations',       num: '08', label: 'Third-Party Integrations' },
  { id: 'sharing',            num: '09', label: 'Sharing Information' },
  { id: 'retention',          num: '10', label: 'Data Retention' },
  { id: 'security',           num: '11', label: 'Security' },
  { id: 'rights',             num: '12', label: 'Your Rights' },
  { id: 'cookies',            num: '13', label: 'Cookies' },
  { id: 'children',           num: '14', label: "Children's Privacy" },
  { id: 'international',      num: '15', label: 'International Users' },
  { id: 'controller-processor', num: '16', label: 'Controller / Processor' },
  { id: 'operational-data',   num: '17', label: 'Operational Data' },
  { id: 'platform-auth',      num: '18', label: 'Platform Integrations' },
  { id: 'automated-decisions', num: '19', label: 'Automated Decisions' },
  { id: 'changes',            num: '20', label: 'Policy Changes' },
  { id: 'contact',            num: '21', label: 'Contact' },
];

const ENTITY_TABLE = [
  ['Legal entity', 'Lookara Systems LLC'],
  ['State of formation', 'Florida, United States'],
  ['Industry', 'Property management operations software'],
  ['Established', '2026'],
  ['Privacy contact', 'privacy@lookara.com'],
];

const RIGHTS_TABLE = [
  ['Access', 'Request a copy of the personal information Lookara holds about you.'],
  ['Correction', 'Request correction of inaccurate or incomplete personal information.'],
  ['Deletion', 'Request deletion of your personal information, subject to legal and operational retention requirements.'],
  ['Data portability', 'Request an export of your personal information in a structured, commonly used format.'],
  ['Restriction', 'Request that we restrict processing of your personal information in certain circumstances.'],
  ['Objection', 'Object to processing of your personal information based on legitimate interests.'],
  ['Withdraw consent', 'Where processing is based on consent, withdraw that consent at any time without affecting prior processing.'],
];

export default function Privacy() {
  return (
    <LegalLayout
      tag="Lookara Systems LLC"
      title="Privacy Policy"
      meta={['Effective date: July 1, 2026', 'Last updated: July 16, 2026']}
      intro={
        <>
          This Privacy Policy describes how Lookara Systems LLC ("Lookara," "we," "our," or "us")
          collects, uses, stores, and protects information when you use our software platform,
          websites, mobile applications, and related services (collectively, the "Services"). It
          also explains the choices available to you regarding your personal information and how
          to contact us with privacy-related questions. This policy should be read together with
          our <Link to="/terms">Terms of Service</Link>.
        </>
      }
      tocNote={<>Read with our <Link to="/terms">Terms of Service</Link></>}
      toc={TOC}
      footerEntity={<>Privacy Policy · Version 1.0<br />Effective July 1, 2026 · Last Updated July 16, 2026</>}
    >
      {/* 01 INTRO */}
      <section id="intro" className="legal-section">
        <span className="legal-anchor">01 — Introduction</span>
        <h2 className="legal-section-title">What this policy covers</h2>
        <div className="legal-body">
          <p>Lookara operates an operational software platform designed to help professional property managers coordinate short-term rental operations. This policy applies to all individuals who interact with our Services in any capacity, including Property Managers, Sub-administrators, Vendors, Property Owners, and visitors to our public website.</p>
          <p>By accessing or using the Services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with the terms described here, please do not use the Services.</p>
          <p>This policy is written in plain language. Where legal or technical terms are used, we have defined them. If you have questions not answered here, contact us at <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>privacy@lookara.com</strong>.</p>
        </div>
      </section>

      {/* RELATIONSHIP TO TOS */}
      <section id="tos-relationship" className="legal-section">
        <span className="legal-anchor">— Relationship to Terms of Service</span>
        <h2 className="legal-section-title">How this policy relates to our Terms of Service</h2>
        <div className="legal-body">
          <p>This Privacy Policy should be read together with the <Link to="/terms">Lookara Terms of Service</Link>. While this policy explains how personal information is collected, used, and protected, the Terms of Service govern the use of the platform and the contractual relationship between Lookara and its customers. Defined terms used in both documents — such as "Services," "Workspace," "Property Manager," "Authorized User," and "Operational Data" — carry consistent meanings across both documents.</p>
        </div>
      </section>

      {/* 02 WHO WE ARE */}
      <section id="who-we-are" className="legal-section">
        <span className="legal-anchor">02 — Who We Are</span>
        <h2 className="legal-section-title">Lookara Systems LLC</h2>
        <div className="legal-body">
          <p>Lookara Systems LLC is a Florida limited liability company that develops and operates an operational software platform for professional property management organizations. We provide software tools for task orchestration, vendor coordination, compliance tracking, emergency response, and operational reporting within the short-term rental industry.</p>
          <p>Lookara is not a marketplace, booking platform, payment processor, or guest-facing service. We are a business-to-business software company whose customers are professional property managers and the authorized operational teams they supervise.</p>
          <table className="legal-table">
            <thead>
              <tr><th>Detail</th><th>Information</th></tr>
            </thead>
            <tbody>
              {ENTITY_TABLE.map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 03 SCOPE */}
      <section id="scope" className="legal-section">
        <span className="legal-anchor">03 — Scope</span>
        <h2 className="legal-section-title">What this policy applies to</h2>
        <div className="legal-body">
          <p>This Privacy Policy applies to all components of the Lookara platform and Services, including:</p>
          <div className="legal-sub">
            <div className="legal-sub-title">Covered by this policy</div>
            <ul className="legal-list">
              <li>The Lookara public website (lookara.com)</li>
              <li>The Property Manager (PM) portal and administrative tools</li>
              <li>The Vendor portal and job management interface</li>
              <li>The Owner portal and read-only property view</li>
              <li>Lookara mobile applications (iOS and Android)</li>
              <li>The Lookara API and developer integrations</li>
              <li>Email communications and notifications sent by Lookara</li>
              <li>Customer support interactions</li>
              <li>Customer-controlled operational content entered into Workspaces (processed on behalf of customers — customers remain responsible for ensuring they have the appropriate rights to process such information)</li>
            </ul>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Not covered by this policy</div>
            <ul className="legal-list">
              <li>Third-party websites, services, or platforms linked from Lookara</li>
              <li>Property Management Systems (PMSs) or Online Travel Agency (OTA) platforms that Lookara may integrate with</li>
              <li>The internal privacy practices of integration partners</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 04 INFO WE COLLECT */}
      <section id="information-collected" className="legal-section">
        <span className="legal-anchor">04 — Information We Collect</span>
        <h2 className="legal-section-title">Information we collect and why</h2>
        <div className="legal-body">
          <p>Lookara collects only the information necessary to provide, maintain, and improve the Services. We do not collect information speculatively. The categories below describe what we collect, with examples.</p>
          <div className="legal-sub">
            <div className="legal-sub-title">Account information</div>
            <p>Collected when you create an account or are invited to join a workspace.</p>
            <ul className="legal-list">
              <li>Full name and email address</li>
              <li>Company or organization name</li>
              <li>Phone number (optional)</li>
              <li>Password (stored as a cryptographic hash — never in plain text)</li>
              <li>Role assignment (Property Manager, Vendor, Owner, Sub-administrator)</li>
              <li>Account creation date and invite source</li>
            </ul>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Operational information</div>
            <p>Created or entered by users during normal platform use.</p>
            <ul className="legal-list">
              <li>Task records, assignments, and status history</li>
              <li>Vendor dispatch records and job completions</li>
              <li>Property information and location data (city and region level)</li>
              <li>Compliance records and inspection logs</li>
              <li>Calendar events and scheduling data</li>
              <li>Audit history entries</li>
              <li>Operational notes and communications within the platform</li>
            </ul>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Device and technical information</div>
            <p>Collected automatically when you access the Services.</p>
            <ul className="legal-list">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address</li>
              <li>Device identifiers (mobile)</li>
              <li>Application version</li>
              <li>Time zone and language settings</li>
            </ul>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Usage information</div>
            <p>Collected to support platform reliability, security, and improvement.</p>
            <ul className="legal-list">
              <li>Login history and session timestamps</li>
              <li>Pages and features accessed</li>
              <li>Actions performed within the platform</li>
              <li>Settings changes and configuration activity</li>
              <li>Error logs and performance data</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 05 NOT COLLECTED */}
      <section id="not-collected" className="legal-section">
        <span className="legal-anchor">05 — What We Do Not Collect</span>
        <h2 className="legal-section-title">Information we are not designed to collect</h2>
        <div className="legal-body">
          <p>Lookara's operational scope is deliberately narrow. The platform does not require, and is not designed to collect or process, the following categories of information:</p>
          <div className="legal-boundary">
            <div className="legal-boundary-label">Not collected by Lookara</div>
            <ul className="legal-list">
              <li>Credit card numbers, banking information, or payment credentials</li>
              <li>Government-issued identification documents</li>
              <li>Biometric data of any kind</li>
              <li>Social media account credentials or profile data</li>
              <li>Personal browsing history outside the Lookara platform</li>
              <li>Advertising identifiers or behavioral profiles</li>
              <li>Guest personal information beyond what is operationally necessary to perform authorized workflows</li>
              <li>Reservation or booking data from OTA platforms</li>
            </ul>
          </div>
          <div className="legal-highlight">
            <p>Lookara is not designed to collect or process guest personal information except where limited guest-related information is operationally necessary to support authorized workflows initiated by our customers. Where such information is entered — such as access instructions or turnover notes — it is treated as operational workflow data and is not used for any purpose other than supporting the relevant operational task.</p>
          </div>
        </div>
      </section>

      {/* 06 HOW WE USE */}
      <section id="how-we-use" className="legal-section">
        <span className="legal-anchor">06 — How We Use Information</span>
        <h2 className="legal-section-title">How we use the information we collect</h2>
        <div className="legal-body">
          <p>Lookara uses collected information only for the following purposes:</p>
          <ul className="legal-list">
            <li>Creating, authenticating, and managing user accounts and workspace access</li>
            <li>Assigning and enforcing role-based permissions across the platform</li>
            <li>Enabling task creation, assignment, dispatch, and completion workflows</li>
            <li>Coordinating vendor operations and tracking job status</li>
            <li>Maintaining compliance records, inspection logs, and audit history</li>
            <li>Generating operational reports for property managers and owners</li>
            <li>Sending platform notifications, system alerts, and operational updates</li>
            <li>Providing customer support and responding to inquiries</li>
            <li>Detecting and preventing unauthorized access, fraud, and security threats</li>
            <li>Maintaining platform reliability, performance, and error monitoring</li>
            <li>Complying with applicable legal obligations</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>We do not use collected information for advertising, behavioral profiling, or sale to third parties.</p>
        </div>
      </section>

      {/* 07 LEGAL BASIS */}
      <section id="legal-basis" className="legal-section">
        <span className="legal-anchor">07 — Legal Basis</span>
        <h2 className="legal-section-title">Legal basis for processing</h2>
        <div className="legal-body">
          <p>Lookara is a United States company. For users located in jurisdictions with data protection laws that require a stated legal basis for processing personal information — including the European Union (GDPR), the United Kingdom (UK GDPR), and California (CCPA) — the following legal bases apply:</p>
          <table className="legal-table legal-table--plain">
            <thead>
              <tr><th>Legal basis</th><th>When it applies</th></tr>
            </thead>
            <tbody>
              <tr><td>Performance of a contract</td><td>Processing necessary to provide the Services under our Terms of Service — account management, operational workflows, platform functionality.</td></tr>
              <tr><td>Legitimate interests</td><td>Security monitoring, fraud prevention, platform performance, and product improvement — balanced against user privacy interests.</td></tr>
              <tr><td>Legal obligation</td><td>Compliance with applicable laws, regulations, court orders, or lawful government requests.</td></tr>
              <tr><td>Consent</td><td>Where required by applicable law, we obtain explicit consent before processing — such as for optional communications.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 08 INTEGRATIONS */}
      <section id="integrations" className="legal-section">
        <span className="legal-anchor">08 — Third-Party Integrations</span>
        <h2 className="legal-section-title">How Lookara connects to external platforms</h2>
        <div className="legal-body">
          <p>Lookara may integrate with third-party platforms and services to support authorized operational workflows. All integrations are implemented through official, published APIs and authorized authentication mechanisms only.</p>
          <p>The types of external services Lookara may connect with include:</p>
          <ul className="legal-list">
            <li>Property Management Systems (PMSs) — to receive operational scheduling data</li>
            <li>Online Travel Agency (OTA) platforms — to receive check-in and check-out timing for operational purposes</li>
            <li>Calendar and scheduling providers — to synchronize operational event data</li>
            <li>Email and SMS providers — to deliver platform notifications</li>
            <li>Authentication providers — to support secure login flows</li>
            <li>Cloud infrastructure providers — to host and operate the platform</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>For each integration, Lookara accesses only the information explicitly necessary to perform the authorized operational function requested by the customer. Integration behavior is strictly limited to the permissions granted by the connected platform and the customer.</p>
          <p>Lookara does not use integration access to collect data beyond its operational scope, monitor user behavior outside the platform, or share data received from one integration with any other external service.</p>
        </div>
      </section>

      {/* 09 SHARING */}
      <section id="sharing" className="legal-section">
        <span className="legal-anchor">09 — Sharing Information</span>
        <h2 className="legal-section-title">When and how we share information</h2>
        <div className="legal-body">
          <p>Lookara does not sell personal information. We do not share personal information with advertisers or data brokers. Information is shared only in the following limited circumstances:</p>
          <div className="legal-sub">
            <div className="legal-sub-title">Service providers</div>
            <p>We work with a limited number of third-party vendors who assist in operating the platform. These include cloud infrastructure providers, email delivery services, authentication providers, and monitoring tools. Service providers are contractually required to use information only as directed by Lookara and to maintain appropriate security standards.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Within a workspace</div>
            <p>Within a Lookara workspace, information is visible to users according to their assigned role and permissions. Property managers control who has access to what within their Workspace. Vendors, for example, do not have access to other vendors' information, dispatch logic, or SLA data.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Legal requirements</div>
            <p>Lookara may disclose information if required to do so by law, court order, or lawful government request, or if we believe disclosure is necessary to protect the rights, property, or safety of Lookara, our customers, or others.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Business transfers</div>
            <p>In the event of a merger, acquisition, or sale of all or a portion of our business, customer information may be transferred as part of that transaction. We will provide notice before any such transfer and before your information becomes subject to a materially different privacy policy.</p>
          </div>
        </div>
      </section>

      {/* 10 RETENTION */}
      <section id="retention" className="legal-section">
        <span className="legal-anchor">10 — Data Retention</span>
        <h2 className="legal-section-title">How long we retain information</h2>
        <div className="legal-body">
          <p>Lookara retains information only for as long as necessary to fulfill the purposes described in this policy, to meet our legal and contractual obligations, and to resolve disputes. Retention periods vary by data type and purpose.</p>
          <table className="legal-table legal-table--plain">
            <thead>
              <tr><th>Data type</th><th>Retention approach</th></tr>
            </thead>
            <tbody>
              <tr><td>Account records</td><td>Retained for the duration of the account and for a reasonable period thereafter for legal and dispute resolution purposes.</td></tr>
              <tr><td>Operational data</td><td>Retained for the duration of the Workspace subscription and for the period required by applicable law or customer contractual requirements.</td></tr>
              <tr><td>Audit history</td><td>Retained for the duration of the workspace and for a minimum period to support operational accountability and legal compliance.</td></tr>
              <tr><td>System logs</td><td>Retained for a limited period for security monitoring and performance analysis, then deleted.</td></tr>
              <tr><td>Deleted workspaces</td><td>Data associated with deleted Workspaces is removed within a reasonable period following deletion, subject to legal hold requirements.</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: '1rem' }}>Operational data is retained only as necessary to support platform functionality, customer requirements, and applicable legal obligations. Customers may request deletion of their Workspace in accordance with the <Link to="/terms">Terms of Service</Link>, subject to applicable legal, contractual, and security retention requirements.</p>
          <p>Upon account closure, customers may export their complete operational data. Lookara does not retain identifiable operational records beyond the period required by applicable law or the terms of the applicable subscription.</p>
        </div>
      </section>

      {/* 11 SECURITY */}
      <section id="security" className="legal-section">
        <span className="legal-anchor">11 — Security</span>
        <h2 className="legal-section-title">How we protect your information</h2>
        <div className="legal-body">
          <p>Lookara implements security controls designed to protect information against unauthorized access, disclosure, alteration, and destruction. Security is a foundational platform requirement, not an optional feature.</p>
          <ul className="legal-list">
            <li>Encryption of data in transit and, where appropriate, encryption of sensitive data at rest</li>
            <li>Role-based access controls enforced at the platform level</li>
            <li>Cryptographic password hashing — passwords are never stored in plain text</li>
            <li>Comprehensive audit logging of significant operational and administrative actions</li>
            <li>Invite-only access architecture — users cannot self-register outside controlled flows</li>
            <li>Session management and authentication controls</li>
            <li>Ongoing security monitoring and incident response procedures</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>No security system is infallible. While we apply these controls consistently, we cannot guarantee absolute security. We regularly review and update our administrative, technical, and organizational security measures to address evolving risks and industry practices. If you become aware of a potential security issue involving the Lookara platform, please contact us immediately at <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>security@lookara.com</strong>.</p>
        </div>
      </section>

      {/* 12 RIGHTS */}
      <section id="rights" className="legal-section">
        <span className="legal-anchor">12 — Your Rights</span>
        <h2 className="legal-section-title">Your privacy rights</h2>
        <div className="legal-body">
          <p>Depending on your location and applicable law, you may have the following rights with respect to your personal information. To exercise any of these rights, contact us at <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>privacy@lookara.com</strong>.</p>
          <table className="legal-table legal-table--plain">
            <thead>
              <tr><th>Right</th><th>Description</th></tr>
            </thead>
            <tbody>
              {RIGHTS_TABLE.map(([r, d]) => (
                <tr key={r}><td>{r}</td><td>{d}</td></tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: '1rem' }}>Note that some rights may be limited by legal obligations, contractual requirements, or the nature of the operational data involved. Where a request relates to operational data within a workspace controlled by a property manager, we may need to coordinate with the relevant Workspace administrator to fulfill the request.</p>
          <p>California residents may have additional rights under the California Consumer Privacy Act (CCPA). EU and UK residents may have additional rights under the GDPR and UK GDPR respectively.</p>
        </div>
      </section>

      {/* 13 COOKIES */}
      <section id="cookies" className="legal-section">
        <span className="legal-anchor">13 — Cookies &amp; Similar Technologies</span>
        <h2 className="legal-section-title">Cookies and session management</h2>
        <div className="legal-body">
          <p>Lookara uses a limited set of cookies and similar technologies strictly necessary for the operation of the Services. We do not use advertising cookies, behavioral tracking cookies, or third-party retargeting technologies.</p>
          <table className="legal-table legal-table--plain">
            <thead>
              <tr><th>Cookie type</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              <tr><td>Authentication</td><td>Required to maintain your logged-in session. Without these cookies, the platform cannot function.</td></tr>
              <tr><td>Security</td><td>Used to detect and prevent unauthorized access and fraudulent activity.</td></tr>
              <tr><td>Preferences</td><td>Used to remember your settings and preferences within the platform.</td></tr>
              <tr><td>Analytics</td><td>Where used, analytics cookies help us understand platform usage patterns to improve reliability. These are not linked to individual identities.</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: '1rem' }}>Lookara does not use cookies for advertising, interest-based targeting, cross-site tracking, or to build advertising profiles. Most browsers allow you to manage cookie settings. Disabling necessary cookies may prevent the platform from functioning correctly.</p>
        </div>
      </section>

      {/* 14 CHILDREN */}
      <section id="children" className="legal-section">
        <span className="legal-anchor">14 — Children's Privacy</span>
        <h2 className="legal-section-title">The platform is not for children</h2>
        <div className="legal-body">
          <p>Lookara is a business software platform intended exclusively for professional use by adults. The Services are not directed to, and we do not knowingly collect personal information from, individuals under the age of 13. Lookara's access architecture — which requires invitation or reviewed application to enter the platform — further limits access to individuals acting in a professional capacity.</p>
          <p>If we become aware that personal information has been collected from a person under 13, we will take prompt steps to delete that information. If you believe we may have information from a minor, contact us at <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>privacy@lookara.com</strong>.</p>
        </div>
      </section>

      {/* 15 INTERNATIONAL */}
      <section id="international" className="legal-section">
        <span className="legal-anchor">15 — International Users</span>
        <h2 className="legal-section-title">Users outside the United States</h2>
        <div className="legal-body">
          <p>Lookara Systems LLC is based in Florida, United States. The Services are operated from infrastructure located in the United States. If you access the Services from outside the United States, your information will be transferred to, processed in, and stored in the United States, where data protection laws may differ from those in your jurisdiction.</p>
          <p>By using the Services, you acknowledge that your information may be transferred to and processed in the United States. We apply the protections described in this Privacy Policy regardless of where you are located.</p>
          <p>Data may also be processed by service providers located in jurisdictions where Lookara or its infrastructure providers operate, subject to appropriate contractual and legal safeguards. If you are located in the European Economic Area, the United Kingdom, or another jurisdiction with data transfer requirements, we implement appropriate safeguards to protect your information during any such transfer.</p>
        </div>
      </section>

      {/* 16 CONTROLLER/PROCESSOR */}
      <section id="controller-processor" className="legal-section">
        <span className="legal-anchor">16 — Data Controller and Data Processor Roles</span>
        <h2 className="legal-section-title">When Lookara acts as controller vs. processor</h2>
        <div className="legal-body">
          <p>Depending on the context, Lookara may act as either a data controller or a data processor. This distinction is relevant to enterprise customers, GDPR-governed users, and platform reviewers evaluating our data governance model.</p>
          <table className="legal-table legal-table--plain">
            <thead>
              <tr><th>Context</th><th>Lookara's role</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td>Account management</td><td>Data controller</td><td>For information relating to customer accounts, platform administration, and direct interactions with Lookara, Lookara acts as the data controller and determines the purposes and means of processing.</td></tr>
              <tr><td>Workspace operational data</td><td>Data processor</td><td>For operational information processed within customer Workspaces — such as task records, vendor assignments, and compliance logs — Lookara typically acts as a data processor on behalf of the property management organization that administers the Workspace.</td></tr>
              <tr><td>Security and platform monitoring</td><td>Data controller</td><td>For security logs, fraud detection, and platform reliability monitoring, Lookara acts as the data controller in pursuit of its legitimate interest in maintaining a secure and reliable platform.</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: '1rem' }}>Where Lookara acts as a data processor, the relevant property management organization is the data controller responsible for the lawful basis of processing within their Workspace. Customers who require a formal Data Processing Agreement (DPA) may contact us at <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>privacy@lookara.com</strong>.</p>
        </div>
      </section>

      {/* 17 OPERATIONAL DATA */}
      <section id="operational-data" className="legal-section">
        <span className="legal-anchor">17 — Operational Data Responsibility</span>
        <h2 className="legal-section-title">Who controls the operational data in your Workspace</h2>
        <div className="legal-body">
          <p>Lookara provides software infrastructure that enables customers to manage operational workflows. The operational data within each Workspace — including property information, task records, vendor assignments, compliance logs, and team communications — is created and controlled by the property manager who administers that Workspace.</p>
          <div className="legal-highlight">
            <p>Property managers and other authorized Workspace administrators are responsible for determining what information is entered into the platform, assigning user permissions, and ensuring that data entered into Lookara complies with applicable laws and contractual obligations.</p>
            <p>Lookara acts as a software platform provider in relation to workspace operational data. We process that data on behalf of our customers according to the terms of our agreements and this Privacy Policy, but we do not control the content or nature of the operational data that customers choose to enter.</p>
          </div>
          <p style={{ marginTop: '1.25rem' }}>If you are a Vendor or Property Owner with questions about the specific operational data held within a Lookara workspace, your primary point of contact is the property manager who administers that Workspace.</p>
        </div>
      </section>

      {/* 18 PLATFORM AUTH */}
      <section id="platform-auth" className="legal-section">
        <span className="legal-anchor">18 — Platform Integrations and Authorization</span>
        <h2 className="legal-section-title">How Lookara handles third-party authorization</h2>
        <div className="legal-body">
          <p>This section is provided specifically for platform integration reviewers, API authorization teams, and technical compliance evaluators.</p>
          <div className="legal-highlight">
            <p>Lookara connects to third-party platforms only through authorized integration mechanisms. We access only the information required to perform the operational functions requested by our customers and within the permissions explicitly granted by each connected platform.</p>
            <p>Lookara does not circumvent platform security controls, scrape data, or access information outside the authorized integration scope. Lookara follows documented authentication and authorization mechanisms provided by integration partners and does not use credentials or access tokens beyond their intended purpose.</p>
            <p>Lookara does not impersonate users, automate actions beyond granted permissions, or attempt to access data outside authorized integration scopes. Lookara does not automate actions that require user intent or approval beyond the permissions explicitly granted by the connected platform.</p>
            <p>Lookara is designed to participate responsibly within the broader property technology ecosystem, respecting the roles, responsibilities, technical boundaries, and authorization scopes of the platforms with which it integrates.</p>
          </div>
        </div>
      </section>

      {/* 19 AUTOMATED DECISIONS */}
      <section id="automated-decisions" className="legal-section">
        <span className="legal-anchor">19 — Automated Decision-Making</span>
        <h2 className="legal-section-title">Automated decision-making and profiling</h2>
        <div className="legal-body">
          <p>Lookara does not use automated decision-making or profiling that produces legal or similarly significant effects on individuals. The platform does not use artificial intelligence or algorithmic systems to make autonomous decisions about users that affect their rights, access, or operational standing.</p>
          <p>Platform automations within Lookara — such as task routing, SLA timers, notification triggers, and compliance reminders — are operational workflow tools configured by customers within their Workspaces. These automations execute actions defined and controlled by the Property Manager, not by Lookara independently.</p>
          <p>Lookara does not use customer operational data to train general-purpose artificial intelligence models.</p>
        </div>
      </section>

      {/* 20 CHANGES */}
      <section id="changes" className="legal-section">
        <span className="legal-anchor">20 — Changes to this Policy</span>
        <h2 className="legal-section-title">How we communicate policy updates</h2>
        <div className="legal-body">
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices, platform capabilities, legal requirements, or industry standards. When we make material changes, we will update the "Last updated" date at the top of this page and, where appropriate, notify users through the platform or by email.</p>
          <p>We encourage you to review this policy periodically. Your continued use of the Services after a policy update constitutes acceptance of the revised terms. If you do not agree with a material change, you may discontinue use of the Services and contact us to request deletion of your information. For contractual terms governing your use of the platform, see the <Link to="/terms">Terms of Service</Link>.</p>
          <p>The version of this policy published at the time of any relevant event governs how information collected at that time was handled.</p>
        </div>
      </section>

      {/* 21 CONTACT */}
      <section id="contact" className="legal-section">
        <span className="legal-anchor">21 — Contact</span>
        <h2 className="legal-section-title">Privacy questions and requests</h2>
        <div className="legal-body">
          <p>For privacy-related questions, data access requests, or concerns about how Lookara handles your information, contact us using the appropriate channel below. We will respond to privacy inquiries within a reasonable timeframe.</p>
        </div>
        <div className="legal-contact-grid">
          <div className="legal-contact-card">
            <div className="legal-contact-purpose">Privacy Officer</div>
            <div className="legal-contact-email">privacy@lookara.com</div>
          </div>
          <div className="legal-contact-card">
            <div className="legal-contact-purpose">General inquiries</div>
            <div className="legal-contact-email">hello@lookara.com</div>
          </div>
          <div className="legal-contact-card">
            <div className="legal-contact-purpose">Security</div>
            <div className="legal-contact-email">security@lookara.com</div>
          </div>
          <div className="legal-contact-card">
            <div className="legal-contact-purpose">Platform &amp; integrations</div>
            <div className="legal-contact-email">integrations@lookara.com</div>
          </div>
          <div className="legal-contact-card">
            <div className="legal-contact-purpose">Legal</div>
            <div className="legal-contact-email">legal@lookara.com</div>
          </div>
        </div>
        <div className="legal-entity-box">
          <div className="legal-entity-box-label">Mailing address</div>
          <div className="legal-entity-box-body">
            Lookara Systems LLC<br />
            Florida, United States
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}