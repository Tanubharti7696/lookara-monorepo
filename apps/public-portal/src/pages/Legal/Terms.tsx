// apps/public-portal/src/pages/Legal/Terms.tsx
import { Link } from 'react-router-dom';
import LegalLayout, { type TocItem } from './LegalLayout';

const TOC: TocItem[] = [
  { id: 'intro',                  num: '01', label: 'Introduction' },
  { id: 'who-we-are',             num: '02', label: 'Who We Are' },
  { id: 'definitions',            num: '03', label: 'Definitions' },
  { id: 'eligibility',            num: '04', label: 'Eligibility' },
  { id: 'accounts',               num: '05', label: 'Accounts' },
  { id: 'workspaces',             num: '06', label: 'Workspaces' },
  { id: 'user-roles',             num: '07', label: 'User Roles' },
  { id: 'vendor-relationships',   num: '08', label: 'Vendor Relationships' },
  { id: 'acceptable-use',         num: '09', label: 'Acceptable Use' },
  { id: 'customer-responsibilities', num: '10', label: 'Customer Responsibilities' },
  { id: 'operational-data',       num: '11', label: 'Operational Data' },
  { id: 'platform-boundaries',    num: '12', label: 'Platform Boundaries' },
  { id: 'third-party-integrations', num: '13', label: 'Third-Party Integrations' },
  { id: 'third-party-platforms',  num: '14', label: 'Third-Party Services' },
  { id: 'respect-platforms',      num: '15', label: 'Respect for Platforms' },
  { id: 'intellectual-property',  num: '16', label: 'Intellectual Property' },
  { id: 'customer-content',       num: '17', label: 'Customer Content' },
  { id: 'billing',                num: '18', label: 'Subscription & Billing' },
  { id: 'availability',           num: '19', label: 'Availability' },
  { id: 'updates',                num: '20', label: 'Updates' },
  { id: 'emergency',              num: '21', label: 'Emergency Operations' },
  { id: 'no-advice',              num: '22', label: 'No Professional Advice' },
  { id: 'compliance-laws',        num: '23', label: 'Compliance With Laws' },
  { id: 'disclaimers',            num: '24', label: 'Disclaimers' },
  { id: 'liability',              num: '25', label: 'Limitation of Liability' },
  { id: 'indemnification',        num: '26', label: 'Indemnification' },
  { id: 'suspension',             num: '27', label: 'Suspension & Termination' },
  { id: 'governing-law',          num: '28', label: 'Governing Law' },
  { id: 'changes',                num: '29', label: 'Changes to Terms' },
  { id: 'confidentiality',        num: '30', label: 'Confidentiality' },
  { id: 'electronic-acceptance',  num: '31', label: 'Electronic Acceptance' },
  { id: 'beta-features',          num: '32', label: 'Beta Features' },
  { id: 'force-majeure',          num: '33', label: 'Force Majeure' },
  { id: 'assignment',             num: '34', label: 'Assignment' },
  { id: 'severability',           num: '35', label: 'Severability & Waiver' },
  { id: 'entire-agreement',       num: '36', label: 'Entire Agreement' },
  { id: 'notices',                num: '37', label: 'Notices' },
  { id: 'contact',                num: '38', label: 'Contact' },
];

const DEFINITIONS = [
  ['"Services"', 'The Lookara platform, websites, mobile applications, APIs, and all related tools and features provided by Lookara Systems LLC.'],
  ['"Workspace"', 'A dedicated operational environment within the Services, administered by a Property Manager, through which Authorized Users coordinate property management activities.'],
  ['"Account"', 'A registered user profile associated with an email address and role within the Services.'],
  ['"Customer"', 'The property management organization or individual that holds a subscription and administers one or more Workspaces.'],
  ['"Authorized User"', 'Any individual granted access to a Workspace by a Customer, including Property Managers, Sub-administrators, Vendors, and Property Owners.'],
  ['"Property Manager"', 'A Customer or Authorized User designated as the administrator of a Workspace, with full operational control over that Workspace.'],
  ['"Sub-administrator"', 'An Authorized User invited by a Property Manager with a defined operational role and scoped permissions within a Workspace.'],
  ['"Vendor"', 'An Authorized User — either invited by a Property Manager or approved through an application process — who performs operational tasks such as cleaning, maintenance, or inspection.'],
  ['"Property Owner"', 'An Authorized User invited by a Property Manager with visibility into designated properties and limited authority to respond to approval requests assigned to them. Property Owners do not administer Workspaces, assign Vendors, create operational tasks, or modify operational records except through specifically authorized approval, acknowledgment, or response workflows.'],
  ['"Operational Data"', 'Information created, entered, or uploaded by Authorized Users within a Workspace, including task records, vendor assignments, compliance logs, property information, and audit history.'],
  ['"Integration"', 'A connection between the Services and a third-party platform established through authorized APIs and authentication mechanisms.'],
  ['"Third-Party Platform"', 'Any external system, service, or marketplace — including Property Management Systems (PMSs) and Online Travel Agency (OTA) platforms — that may be connected to the Services through an Integration.'],
];

const PROHIBITED = [
  'Using the Services for any illegal purpose or in violation of any applicable law or regulation',
  'Uploading or transmitting malware, viruses, or malicious code of any kind',
  'Sharing account credentials or allowing unauthorized individuals to access your Account',
  'Scraping, crawling, or extracting data from the Services through automated means without written authorization',
  'Reverse engineering, decompiling, or attempting to extract the source code of the Services',
  'Using automated tools, bots, or scripts to interact with the Services in unauthorized ways',
  'Circumventing, disabling, or interfering with security controls, access restrictions, or authentication systems',
  'Impersonating any person, organization, or Authorized User',
  'Interfering with the operation of the Services or the experience of other users',
  'Using the Services to store or transmit content that is defamatory, obscene, or unlawful',
  'Attempting to access Workspaces, accounts, or data to which you have not been granted access',
  'Using the Services to circumvent the terms, policies, or technical controls of any Third-Party Platform',
  'Using Integration access beyond the scope of permissions granted by the connected platform',
];

const CUSTOMER_RESP = [
  'All Operational Data entered into or managed within their Workspace',
  'Ensuring that Authorized Users are who they claim to be and are authorized to use the Services',
  'Assigning appropriate roles and permissions to each Authorized User',
  'Ensuring that the use of the Services complies with applicable laws, regulations, and contractual obligations',
  'The conduct of all Vendors engaged through the platform, including their compliance with applicable licensing, insurance, tax, worker-classification, employment, and independent-contractor requirements',
  'Ensuring that any data entered into the platform — including operational notes, property information, and vendor data — does not violate any third-party rights or applicable law',
  'Maintaining accurate and current subscription and billing information',
  'Activity performed through Accounts and permissions administered by the Customer, except to the extent directly caused by Lookara\'s breach of these Terms or failure to implement the security measures described in the Privacy Policy',
];

const BOUNDARIES = [
  'A booking platform or reservation management system',
  'A marketplace for properties, guests, or services',
  'A channel manager or listing distribution service',
  'A pricing engine or revenue management tool',
  'A payment processor or financial services provider',
  'A guest messaging or guest engagement platform',
  'A property management system (PMS) replacement',
  'An emergency dispatch service for police, fire, or medical responders',
  'A provider of legal, tax, accounting, or professional advisory services',
];

const CONTACTS = [
  { purpose: 'Legal',                    email: 'legal@lookara.com' },
  { purpose: 'General inquiries',        email: 'hello@lookara.com' },
  { purpose: 'Support',                  email: 'support@lookara.com' },
  { purpose: 'Security',                 email: 'security@lookara.com' },
  { purpose: 'Platform & integrations',  email: 'integrations@lookara.com' },
  { purpose: 'Privacy Officer',          email: 'privacy@lookara.com' },
];

export default function Terms() {
  return (
    <LegalLayout
      tag="Lookara Systems LLC"
      title="Terms of Service"
      meta={['Effective date: July 1, 2026', 'Last updated: July 16, 2026', 'Version 1.0']}
      intro={
        <>
          These Terms of Service ("Terms") govern your access to and use of the Lookara
          platform, websites, mobile applications, APIs, and related services (collectively,
          the "Services"). By accessing or using the Services, you agree to be bound by these
          Terms and our <Link to="/privacy">Privacy Policy</Link>. If you do not agree, do
          not use the Services.
        </>
      }
      tocNote={<>Read with our <Link to="/privacy">Privacy Policy</Link></>}
      toc={TOC}
      footerEntity={<>Terms of Service · Version 1.0<br />Effective July 1, 2026 · Last Updated July 16, 2026</>}
    >
      {/* 01 INTRO */}
      <section id="intro" className="legal-section">
        <span className="legal-anchor">01 — Introduction</span>
        <h2 className="legal-section-title">About these Terms</h2>
        <div className="legal-body">
          <p>These Terms constitute a binding agreement between you and Lookara Systems LLC ("Lookara," "we," "our," or "us"). They apply to all users of the Services, including Property Managers, Vendors, Property Owners, Sub-administrators, and any other Authorized Users who access the platform through an invitation or approved application.</p>
          <p>Lookara is an operational software platform designed for professional property management organizations. These Terms reflect the nature of that platform: business software used by professionals, governed by clearly defined roles, permissions, and operational boundaries. They should be read together with our <Link to="/privacy">Privacy Policy</Link>, which describes how we handle personal information.</p>
          <p>Where these Terms refer to a "Customer," that means the property management organization that holds the primary subscription and administers one or more Workspaces. Where these Terms refer to an "Authorized User," that means any individual granted access to a Workspace by a Customer.</p>
        </div>
      </section>

      {/* 02 WHO WE ARE */}
      <section id="who-we-are" className="legal-section">
        <span className="legal-anchor">02 — Who We Are</span>
        <h2 className="legal-section-title">Lookara Systems LLC</h2>
        <div className="legal-body">
          <p>Lookara Systems LLC is a Florida limited liability company that develops and operates an operational software platform for professional property management organizations. The platform centralizes task orchestration, vendor coordination, compliance tracking, emergency response, and operational reporting within the short-term rental industry.</p>
          <p>Lookara is not a marketplace, booking platform, channel manager, pricing engine, payment processor, or guest-facing service. We are a business-to-business software company. Our customers are professional property managers and the authorized teams they supervise.</p>
          <p>Business operations and the provision of the Services are governed by applicable United States laws. Lookara Systems LLC is established in Florida, United States.</p>
        </div>
      </section>

      {/* 03 DEFINITIONS */}
      <section id="definitions" className="legal-section">
        <span className="legal-anchor">03 — Definitions</span>
        <h2 className="legal-section-title">Terms used in this agreement</h2>
        <div className="legal-body">
          <p>The following terms are used consistently throughout this agreement and our Privacy Policy.</p>
          <table className="legal-table">
            <thead>
              <tr><th>Term</th><th>Definition</th></tr>
            </thead>
            <tbody>
              {DEFINITIONS.map(([term, def]) => (
                <tr key={term}><td>{term}</td><td>{def}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 04 ELIGIBILITY */}
      <section id="eligibility" className="legal-section">
        <span className="legal-anchor">04 — Eligibility</span>
        <h2 className="legal-section-title">Who may use the Services</h2>
        <div className="legal-body">
          <p>The Services are designed for professional business use. To access or use the Services, you must:</p>
          <ul className="legal-list">
            <li>Be at least 18 years of age</li>
            <li>Have the legal capacity to enter into a binding agreement</li>
            <li>Be acting on behalf of yourself or a legitimate business organization</li>
            <li>Have received an invitation or been approved through the applicable access process</li>
            <li>Not be prohibited from using the Services under applicable law</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Lookara operates an invite-only and application-reviewed access architecture. Property Managers must submit a reviewed request for access. Vendors must be invited by a Property Manager or approved through the vendor application process. Property Owners may only access the Services after being explicitly invited by a Property Manager. No user may self-register independently without completing the applicable controlled entry process.</p>
          <p>By using the Services, you represent and warrant that you meet these eligibility requirements. Lookara reserves the right to suspend or terminate access if eligibility requirements are not met.</p>
        </div>
      </section>

      {/* 05 ACCOUNTS */}
      <section id="accounts" className="legal-section">
        <span className="legal-anchor">05 — Accounts</span>
        <h2 className="legal-section-title">Account responsibilities</h2>
        <div className="legal-body">
          <p>Each Authorized User is issued an individual Account associated with a verified email address and an assigned role. Accounts are personal and non-transferable.</p>
          <p>You are responsible for:</p>
          <ul className="legal-list">
            <li>Maintaining the confidentiality of your password and account credentials</li>
            <li>All activity that occurs under your Account</li>
            <li>Providing accurate, current, and complete information when creating or updating your Account</li>
            <li>Notifying Lookara promptly if you become aware of unauthorized access to your Account</li>
            <li>Using your actual identity — impersonation of any person or entity is prohibited</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Lookara may suspend or terminate an Account that appears to be compromised, that contains inaccurate information, or that is being used in violation of these Terms. You may be responsible for losses resulting from unauthorized Account use to the extent caused by your failure to maintain reasonable credential security, subject to applicable law and the Limitation of Liability section.</p>
        </div>
      </section>

      {/* 06 WORKSPACES */}
      <section id="workspaces" className="legal-section">
        <span className="legal-anchor">06 — Workspaces</span>
        <h2 className="legal-section-title">Workspace administration and ownership</h2>
        <div className="legal-body">
          <p>Each Workspace is associated with the Customer that created or contracted for it and is administered by one or more designated Property Managers. Where the Customer is an organization, the Workspace and its subscription belong to that organization rather than to any individual Authorized User.</p>
          <p>As Workspace administrator, the Property Manager is solely responsible for:</p>
          <ul className="legal-list">
            <li>Inviting and removing Authorized Users</li>
            <li>Assigning and modifying user roles and permissions</li>
            <li>Determining what Operational Data is entered into the Workspace</li>
            <li>Ensuring that Authorized Users comply with these Terms</li>
            <li>Maintaining the subscription associated with the Workspace</li>
            <li>All Operational Data created, entered, or managed within the Workspace</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>A Workspace belongs to the Customer that created or contracted for it. Lookara may change Workspace administration upon verified instruction from an authorized representative of the Customer, pursuant to the Customer's internal authority structure, or in response to a valid legal requirement. Lookara may request documentation reasonably necessary to verify such authority.</p>
          <p>Lookara may host multiple Workspaces for different Customers. Each Workspace is logically isolated. Authorized Users of one Workspace do not have access to the data or operations of another Workspace unless explicitly granted access by that Workspace's administrator.</p>
        </div>
      </section>

      {/* 07 USER ROLES */}
      <section id="user-roles" className="legal-section">
        <span className="legal-anchor">07 — User Roles</span>
        <h2 className="legal-section-title">Role-based access and permissions</h2>
        <div className="legal-body">
          <p>Access within the Services is governed by assigned roles. Each role carries a defined set of permissions that cannot be self-elevated. Role assignments are controlled by the Property Manager.</p>
          <div className="legal-sub">
            <div className="legal-sub-title">Property Manager</div>
            <p>Full operational control over the Workspace. May create and manage tasks, dispatch Vendors, configure compliance settings, manage team members, view all operational activity, and administer Workspace settings. Responsible for all activity within the Workspace.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Sub-administrator</div>
            <p>An operational team member with permissions scoped by the Property Manager. May perform task management, vendor coordination, and compliance tracking within their assigned scope. Does not have access to billing, Workspace settings, or controls explicitly reserved for the Property Manager.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Vendor</div>
            <p>An operational executor with access to job assignments and completion workflows. Vendors see only the tasks assigned to them. Vendors do not have visibility into other Vendors' information, internal Vendor-ranking logic, portfolio-wide dispatch rules, or Workspace administration. Vendors may view the deadlines, response targets, status requirements, and performance information applicable to their own assignments.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Property Owner</div>
            <p>An observer with visibility into operational activity for designated properties and limited access to approval workflows assigned by the Property Manager. Property Owners may approve, reject, acknowledge, or respond to designated requests but do not control Workspace administration, task execution, Vendor assignment, or system configuration.</p>
          </div>
        </div>
      </section>

      {/* 08 VENDOR RELATIONSHIPS */}
      <section id="vendor-relationships" className="legal-section">
        <span className="legal-anchor">08 — Vendor Relationships</span>
        <h2 className="legal-section-title">Lookara is not a party to Vendor engagements</h2>
        <div className="legal-body">
          <p>Lookara provides tools that allow Customers to coordinate work with Vendors. Lookara does not employ, hire, supervise, direct, insure, license, endorse, or guarantee any Vendor.</p>
          <p>Any agreement for services, pricing, scope of work, access to property, payment, insurance, licensing, taxes, or job performance exists solely between the Customer and the applicable Vendor. Lookara is not a party to that agreement and is not responsible for the acts, omissions, qualifications, availability, safety practices, work quality, or payment obligations of either party.</p>
          <p>Vendors act as independent businesses or service providers and not as employees, agents, representatives, joint venturers, or partners of Lookara. Use of Lookara does not create an employment, agency, brokerage, fiduciary, or contractor relationship between Lookara and any Vendor.</p>
          <p>Operational metrics displayed by Lookara — such as task completion rates, response times, or job history — are based on platform activity and are not endorsements, professional certifications, background checks, guarantees of performance, or substitutes for Customer due diligence in selecting and engaging Vendors.</p>
        </div>
      </section>

      {/* 09 ACCEPTABLE USE */}
      <section id="acceptable-use" className="legal-section">
        <span className="legal-anchor">09 — Acceptable Use</span>
        <h2 className="legal-section-title">What you may and may not do</h2>
        <div className="legal-body">
          <p>You may use the Services only for lawful, professional operational purposes consistent with these Terms. You may not use the Services in any way that violates applicable law, harms others, or undermines the integrity of the platform.</p>
          <div className="legal-sub">
            <div className="legal-sub-title">Prohibited activities</div>
            <ul className="legal-list">
              {PROHIBITED.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <p style={{ marginTop: '1.25rem' }}>Violations of this section may result in immediate suspension or termination of access and, where applicable, referral to appropriate legal authorities.</p>
        </div>
      </section>

      {/* 10 CUSTOMER RESPONSIBILITIES */}
      <section id="customer-responsibilities" className="legal-section">
        <span className="legal-anchor">10 — Customer Responsibilities</span>
        <h2 className="legal-section-title">What Customers are responsible for</h2>
        <div className="legal-body">
          <p>Customers are the primary accountable parties for all activity within their Workspaces. Lookara provides the software infrastructure. Customers control what is done with it.</p>
          <p>Each Customer is responsible for:</p>
          <ul className="legal-list">
            {CUSTOMER_RESP.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <p style={{ marginTop: '1rem' }}>Lookara does not audit or verify the accuracy, legality, or appropriateness of Operational Data entered by Customers. Customers assume full responsibility for their data and for ensuring their use of the platform is lawful.</p>
        </div>
      </section>

      {/* 11 OPERATIONAL DATA */}
      <section id="operational-data" className="legal-section">
        <span className="legal-anchor">11 — Operational Data</span>
        <h2 className="legal-section-title">Ownership and processing of Operational Data</h2>
        <div className="legal-body">
          <p>Customers own their Operational Data. Lookara does not claim ownership of any Operational Data entered into or managed within a Customer's Workspace.</p>
          <div className="legal-highlight">
            <p>By using the Services, the Customer grants Lookara a limited, non-exclusive license to access, store, process, and transmit Operational Data solely as necessary to provide, secure, support, maintain, and improve the Services for the Customer, including through aggregated or de-identified service analytics, and otherwise as described in the <Link to="/privacy">Privacy Policy</Link>. Lookara will not use identifiable Customer Content to train general-purpose artificial intelligence models. This license does not permit Lookara to use Operational Data for advertising or sale to third parties.</p>
          </div>
          <p style={{ marginTop: '1.25rem' }}>Lookara processes Operational Data as a software platform provider on behalf of its Customers, as further described in our <Link to="/privacy">Privacy Policy</Link>. Customers remain the data controllers of their Operational Data and are responsible for ensuring that its collection, entry, and processing complies with applicable data protection laws and any contractual obligations they have with third parties.</p>
          <p>Upon termination of a subscription, Customers may request export of their Operational Data in accordance with the applicable subscription terms. Data deletion timelines are described in the <Link to="/privacy">Privacy Policy</Link>.</p>
        </div>
      </section>

      {/* 12 PLATFORM BOUNDARIES */}
      <section id="platform-boundaries" className="legal-section">
        <span className="legal-anchor">12 — Platform Boundaries</span>
        <h2 className="legal-section-title">What Lookara is — and is not</h2>
        <div className="legal-body">
          <p>Lookara is designed as an operational coordination platform. Its operational boundaries are intentional. Understanding what Lookara does not do is as important as understanding what it does.</p>
          <div className="legal-boundary">
            <div className="legal-boundary-label">Lookara does not function as</div>
            <ul className="legal-list">
              {BOUNDARIES.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
          <p style={{ marginTop: '1.25rem' }}>Customers remain solely responsible for all reservation management, guest communications, pricing decisions, and financial transactions conducted through third-party platforms. Lookara does not participate in, influence, or have visibility into those activities.</p>
          <p>Features within the Services that reference financial thresholds — such as approval limits — are operational configuration tools that record information for workflow purposes only. Lookara does not process, hold, transfer, or facilitate payments of any kind.</p>
        </div>
      </section>

      {/* 13 THIRD-PARTY INTEGRATIONS */}
      <section id="third-party-integrations" className="legal-section">
        <span className="legal-anchor">13 — Third-Party Integrations</span>
        <h2 className="legal-section-title">How Lookara connects to external platforms</h2>
        <div className="legal-body">
          <p>Lookara may offer Integrations with Third-Party Platforms to support authorized operational workflows. Lookara establishes Integrations only through authorized technical mechanisms supported or permitted by the applicable provider, such as approved APIs, authentication protocols, webhooks, calendar feeds, or other documented connection methods.</p>
          <p>When an Integration is established:</p>
          <ul className="legal-list">
            <li>Lookara accesses only the information explicitly necessary to perform the authorized operational function</li>
            <li>Integration behavior is strictly limited to the permissions granted by the connected platform and the Customer</li>
            <li>Lookara does not use Integration access to collect data beyond its operational scope</li>
            <li>Lookara does not circumvent security controls, scrape data, or access information outside the authorized Integration scope</li>
            <li>Lookara does not impersonate users or automate actions that require user intent beyond granted permissions</li>
            <li>Access tokens and credentials provided through Integrations are used only for their intended purpose and are not shared with unauthorized parties</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Customers are responsible for ensuring they have the authority to connect Third-Party Platform accounts to the Services and that doing so complies with the applicable terms of those platforms.</p>
          <p>Availability of any Integration is not guaranteed. A Third-Party Platform may modify, restrict, suspend, or terminate access to its services at any time, and Lookara may discontinue an Integration when continued operation is no longer technically, legally, or contractually feasible.</p>
          <p>Lookara may disable or suspend an Integration at any time if it determines the Integration poses a security risk, violates these Terms, or conflicts with the policies of the connected platform.</p>
        </div>
      </section>

      {/* 14 THIRD-PARTY SERVICES */}
      <section id="third-party-platforms" className="legal-section">
        <span className="legal-anchor">14 — Third-Party Services</span>
        <h2 className="legal-section-title">External platforms and services</h2>
        <div className="legal-body">
          <p>The Services may connect with or reference third-party services including, without limitation, Property Management Systems (PMSs), Online Travel Agency (OTA) platforms, calendar providers, email delivery services, SMS providers, mapping services, authentication providers, and cloud infrastructure providers.</p>
          <p>Each of these services is governed exclusively by its own terms of service, privacy policy, and usage requirements. Lookara is not responsible for:</p>
          <ul className="legal-list">
            <li>The availability, accuracy, or security of any Third-Party Platform</li>
            <li>Changes to the APIs, terms, or features of any Third-Party Platform</li>
            <li>Any data shared between Customers and Third-Party Platforms outside the scope of a Lookara Integration</li>
            <li>The privacy practices of any Third-Party Platform</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Links or references to Third-Party Platforms within the Services do not constitute an endorsement of those platforms by Lookara.</p>
        </div>
      </section>

      {/* 15 RESPECT FOR THIRD-PARTY PLATFORMS */}
      <section id="respect-platforms" className="legal-section">
        <span className="legal-anchor">15 — Respect for Third-Party Platforms</span>
        <h2 className="legal-section-title">Platform policy compliance</h2>
        <div className="legal-body">
          <p>Customers may use Lookara only in a manner that complies with the applicable terms, policies, and authorization requirements of any Third-Party Platform to which their Workspace is connected.</p>
          <div className="legal-highlight">
            <p>Lookara is designed to complement Third-Party Platforms — not to circumvent, replicate, or undermine them. Customers may not use the Services to bypass security controls, access restrictions, or usage policies of any Third-Party Platform. Customers may not use Integration access to perform actions that the connected platform prohibits or has not explicitly authorized.</p>
          </div>
          <p style={{ marginTop: '1.25rem' }}>Lookara may suspend or disable Integrations — including at the request of a Third-Party Platform — if those Integrations are found to violate platform policies, create security risks, or operate outside the scope of authorized use.</p>
          <p>Customers who use the Services in a way that causes Lookara to violate the terms of a Third-Party Platform assume full responsibility for any resulting consequences, including suspension of the relevant Integration and any claims made against Lookara by the Third-Party Platform.</p>
        </div>
      </section>

      {/* 16 INTELLECTUAL PROPERTY */}
      <section id="intellectual-property" className="legal-section">
        <span className="legal-anchor">16 — Intellectual Property</span>
        <h2 className="legal-section-title">Lookara's intellectual property</h2>
        <div className="legal-body">
          <p>All intellectual property in the Services — including but not limited to the Lookara name and logo, software, source code, platform architecture, design, documentation, APIs, and all content created by Lookara — is owned by or licensed to Lookara Systems LLC. Nothing in these Terms transfers any intellectual property rights to you.</p>
          <p>You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Services solely for your authorized operational purposes during the term of your subscription. This license does not permit you to:</p>
          <ul className="legal-list">
            <li>Copy, modify, or create derivative works based on the Services</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Services</li>
            <li>Sublicense, resell, or transfer access to the Services</li>
            <li>Use the Lookara name, logo, or branding without written authorization</li>
            <li>Remove or alter any proprietary notices or labels on the Services</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Feedback, suggestions, or ideas you provide about the Services may be used by Lookara without payment or obligation, provided that doing so does not identify the Customer or disclose Customer Confidential Information.</p>
        </div>
      </section>

      {/* 17 CUSTOMER CONTENT */}
      <section id="customer-content" className="legal-section">
        <span className="legal-anchor">17 — Customer Content</span>
        <h2 className="legal-section-title">Ownership of content you provide</h2>
        <div className="legal-body">
          <p>Customers retain ownership of all Operational Data and other content they enter into the Services ("Customer Content"). Lookara does not claim ownership of Customer Content.</p>
          <p>By entering Customer Content into the Services, you grant Lookara a limited, non-exclusive, worldwide, royalty-free license to use, store, reproduce, transmit, and display that content solely as necessary to provide the Services and as described in our Privacy Policy. This license terminates when Customer Content is deleted or the subscription ends, subject to retention obligations described in the Privacy Policy.</p>
          <p>You represent and warrant that you have all rights necessary to enter Customer Content into the Services and that doing so does not violate any third-party rights, applicable law, or contractual obligation. Lookara does not verify the accuracy, legality, or ownership of Customer Content and is not responsible for it.</p>
        </div>
      </section>

      {/* 18 BILLING */}
      <section id="billing" className="legal-section">
        <span className="legal-anchor">18 — Subscription &amp; Billing</span>
        <h2 className="legal-section-title">Plans, payments, and billing</h2>
        <div className="legal-body">
          <p>Access to certain features of the Services requires a paid subscription. Subscription plans, pricing, and features are described on our Pricing page and may be updated from time to time with reasonable notice.</p>
          <div className="legal-sub">
            <div className="legal-sub-title">Subscription renewal</div>
            <p>Unless otherwise stated in an Order Form, subscriptions automatically renew for successive periods equal to the initial subscription term until canceled. By purchasing a subscription, the Customer authorizes Lookara and its payment processor to charge the applicable subscription fees and taxes at the beginning of each billing period. Failure to cancel a subscription before the renewal date will result in renewal under the then-current subscription terms.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Cancellation</div>
            <p>Customers may cancel a subscription through the available account-management process or by contacting <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>support@lookara.com</strong>. Cancellation prevents the next renewal charge and becomes effective at the end of the current paid billing period unless otherwise required by applicable law or agreed in writing. Canceling a subscription does not ordinarily result in a prorated refund.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Plan and property changes</div>
            <p>Subscription charges may change when the Customer adds or removes properties, changes plans, adds paid functionality, or modifies the applicable billing scope. Applicable charges and their effective dates will be presented before the change is confirmed or described in the applicable Order Form.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Price changes</div>
            <p>Lookara may change subscription pricing by providing reasonable advance notice. Pricing changes ordinarily take effect at the next renewal period unless otherwise stated or agreed in an Order Form.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Billing and payment</div>
            <p>Lookara does not process property-management or Vendor payments through the Services. Subscription payments owed to Lookara may be processed by an authorized third-party payment provider. Customers are responsible for maintaining accurate billing information and ensuring payment is received when due.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Failed payments</div>
            <p>If a payment fails, Lookara may retry the charge and will notify the Customer. Continued failure to pay may result in suspension of Workspace access following reasonable notice. Customers remain responsible for all fees accrued prior to suspension.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Taxes</div>
            <p>Subscription fees are exclusive of applicable taxes. Customers are responsible for all taxes, duties, and levies applicable to their subscriptions under applicable law.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Refunds</div>
            <p>Subscription fees are generally non-refundable except where required by applicable law or as expressly agreed in writing. Customers who terminate their subscription mid-period will retain access through the end of the paid billing period.</p>
          </div>
          <div className="legal-sub">
            <div className="legal-sub-title">Payment processor terms</div>
            <p>Subscription payments are processed by a third-party payment provider. By purchasing a subscription, the Customer also agrees to the applicable terms of that payment provider. Lookara is not responsible for errors, delays, or failures attributable to the payment processor.</p>
          </div>
        </div>
      </section>

      {/* 19 AVAILABILITY */}
      <section id="availability" className="legal-section">
        <span className="legal-anchor">19 — Availability</span>
        <h2 className="legal-section-title">Service availability and maintenance</h2>
        <div className="legal-body">
          <p>Lookara strives to provide commercially reasonable availability of the Services. We do not guarantee uninterrupted or error-free access at all times. Any uptime commitment or service credit applies only if expressly stated in a separate written Service Level Agreement or Order Form.</p>
          <p>The Services may be temporarily unavailable due to:</p>
          <ul className="legal-list">
            <li>Scheduled maintenance, which we will endeavor to communicate in advance</li>
            <li>Unplanned outages or infrastructure failures</li>
            <li>Events outside our reasonable control, including failures of Third-Party Platforms or infrastructure providers</li>
            <li>Security incidents requiring immediate remediation</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Lookara will use reasonable efforts to restore service availability promptly following any unplanned interruption. We are not liable for losses or damages arising from service unavailability, subject to the limitations in Section 24.</p>
        </div>
      </section>

      {/* 20 UPDATES */}
      <section id="updates" className="legal-section">
        <span className="legal-anchor">20 — Updates</span>
        <h2 className="legal-section-title">Platform updates and changes</h2>
        <div className="legal-body">
          <p>Lookara continuously develops the Services. We may add, modify, or remove features, update APIs, change user interfaces, or adjust platform behavior at any time. We will endeavor to provide reasonable notice of material changes that may affect how Customers use the Services.</p>
          <p>We are not required to maintain any specific feature or functionality indefinitely. Customers who rely on specific API behavior or platform functionality for their operations are responsible for monitoring release notes and communications from Lookara regarding upcoming changes.</p>
          <p>Where a change to the Services materially degrades functionality that Customers rely on, Lookara will provide reasonable transition time or alternatives where practicable.</p>
        </div>
      </section>

      {/* 21 EMERGENCY */}
      <section id="emergency" className="legal-section">
        <span className="legal-anchor">21 — Emergency Operations</span>
        <h2 className="legal-section-title">Emergency workflows and limitations</h2>
        <div className="legal-body">
          <p>Lookara includes operational workflows designed to assist Property Managers in coordinating responses to property-level emergencies — such as maintenance failures, safety incidents, and urgent vendor dispatch. These features are coordination tools, not emergency services.</p>
          <div className="legal-warning">
            <p>The Lookara platform assists in coordinating operational responses but is not an emergency dispatch service. It should never be used as a substitute for contacting police, fire departments, medical responders, or other emergency services. In any situation involving risk to life, physical safety, or immediate property threat, contact the appropriate emergency authorities directly and immediately.</p>
            <p>Lookara does not guarantee response times, vendor availability, or operational outcomes in emergency situations. Emergency workflows within the platform are subject to the same availability limitations described in Section 18.</p>
          </div>
          <p style={{ marginTop: '1.25rem' }}>Customers are responsible for establishing appropriate emergency protocols for their properties and teams that do not rely solely on the Services. Lookara's emergency coordination features supplement, but do not replace, proper emergency preparedness.</p>
        </div>
      </section>

      {/* 22 NO ADVICE */}
      <section id="no-advice" className="legal-section">
        <span className="legal-anchor">22 — No Professional Advice</span>
        <h2 className="legal-section-title">The Services do not provide professional advice</h2>
        <div className="legal-body">
          <p>Lookara provides operational software tools. Nothing within the Services constitutes or should be relied upon as:</p>
          <ul className="legal-list">
            <li>Legal advice or legal services of any kind</li>
            <li>Accounting, tax, or financial advice</li>
            <li>Engineering, construction, or structural advice</li>
            <li>Compliance certification or regulatory approval</li>
            <li>Insurance advice or risk assessment</li>
            <li>Employment or labor law guidance</li>
            <li>Healthcare or safety certification</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Compliance templates, checklists, task workflows, and other operational tools within the platform are configuration aids provided for operational convenience only. They do not constitute legal compliance advice and should not be treated as a substitute for qualified professional guidance.</p>
          <p>Customers are responsible for consulting qualified professionals — attorneys, accountants, engineers, compliance specialists, and others — for advice relevant to their specific circumstances and applicable legal requirements.</p>
        </div>
      </section>

      {/* 23 COMPLIANCE WITH LAWS */}
      <section id="compliance-laws" className="legal-section">
        <span className="legal-anchor">23 — Compliance With Laws</span>
        <h2 className="legal-section-title">Customer responsibility for legal compliance</h2>
        <div className="legal-body">
          <p>Lookara provides software. Customers are solely responsible for ensuring that their use of the Services and their underlying property management activities comply with all applicable laws, regulations, and contractual obligations.</p>
          <p>This includes, without limitation, compliance with:</p>
          <ul className="legal-list">
            <li>Short-term rental regulations, licensing requirements, and local ordinances applicable to managed properties</li>
            <li>Employment and labor laws governing any vendors, contractors, or employees engaged through the platform</li>
            <li>Data protection and privacy laws applicable to information entered into the Services</li>
            <li>The terms and policies of any Third-Party Platforms to which Customers connect their Workspace</li>
            <li>Insurance, safety, and property maintenance requirements applicable to managed properties</li>
            <li>Anti-discrimination laws and fair housing requirements</li>
            <li>Any applicable tax obligations arising from property management activities</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Lookara does not monitor Customer compliance with applicable law and is not responsible for Customer violations. Features within the platform that support compliance tracking — such as inspection logs and compliance checklists — are operational tools provided for Customer use. Their presence does not imply that Lookara has verified or certified compliance with any specific legal requirement.</p>
        </div>
      </section>

      {/* 24 DISCLAIMERS */}
      <section id="disclaimers" className="legal-section">
        <span className="legal-anchor">24 — Disclaimers</span>
        <h2 className="legal-section-title">Disclaimers of warranties</h2>
        <div className="legal-body">
          <p>To the fullest extent permitted by applicable law, the Services are provided "as is" and "as available" without warranties of any kind, express or implied.</p>
          <p>Lookara expressly disclaims all warranties, including but not limited to:</p>
          <ul className="legal-list">
            <li>Implied warranties of merchantability and fitness for a particular purpose</li>
            <li>Warranties that the Services will be uninterrupted, error-free, or completely secure</li>
            <li>Warranties regarding the accuracy, reliability, or completeness of any content within the Services</li>
            <li>Warranties that the Services will meet any specific operational or legal requirements</li>
            <li>Warranties regarding the conduct, quality, or reliability of any Vendor or other Authorized User</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Some jurisdictions do not allow the exclusion of implied warranties. In such jurisdictions, the above exclusions apply to the fullest extent permitted by applicable law.</p>
        </div>
      </section>

      {/* 25 LIABILITY */}
      <section id="liability" className="legal-section">
        <span className="legal-anchor">25 — Limitation of Liability</span>
        <h2 className="legal-section-title">Limits on Lookara's liability</h2>
        <div className="legal-body">
          <p>To the fullest extent permitted by applicable law, Lookara Systems LLC and its officers, directors, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to loss of data, loss of revenue, loss of business opportunity, or operational disruption — arising from your use of or inability to use the Services.</p>
          <p>In no event will Lookara's total aggregate liability to you for all claims arising out of or relating to these Terms or the Services exceed the greater of: (a) the total fees paid by you to Lookara in the twelve months immediately preceding the claim; or (b) one hundred US dollars (USD $100).</p>
          <p>These limitations apply regardless of the legal theory on which the claim is based, whether in contract, tort, strict liability, or otherwise, and even if Lookara has been advised of the possibility of such damages.</p>
          <p>Some jurisdictions do not allow certain limitations of liability. In such jurisdictions, these limitations apply to the fullest extent permitted by applicable law.</p>
        </div>
      </section>

      {/* 26 INDEMNIFICATION */}
      <section id="indemnification" className="legal-section">
        <span className="legal-anchor">26 — Indemnification</span>
        <h2 className="legal-section-title">Your obligation to indemnify Lookara</h2>
        <div className="legal-body">
          <p>You agree to defend, indemnify, and hold harmless Lookara Systems LLC and its officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:</p>
          <ul className="legal-list">
            <li>Your use of the Services in violation of these Terms</li>
            <li>Operational Data or Customer Content that you enter into the Services, including any claim that such content violates the rights of a third party</li>
            <li>Unauthorized access to a Workspace or Account occurring under your control</li>
            <li>Your violation of any applicable law, regulation, or third-party agreement</li>
            <li>Any claim arising from your use of Third-Party Platform Integrations beyond the scope of authorized permissions</li>
            <li>Any claim brought against Lookara by a Third-Party Platform arising from your use of Integration access in violation of that platform's terms</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Lookara reserves the right to assume exclusive control of any matter subject to indemnification by you, at your expense. You will cooperate with Lookara's defense of any such claim.</p>
        </div>
      </section>

      {/* 27 SUSPENSION */}
      <section id="suspension" className="legal-section">
        <span className="legal-anchor">27 — Suspension &amp; Termination</span>
        <h2 className="legal-section-title">When access may be suspended or terminated</h2>
        <div className="legal-body">
          <p>Lookara may suspend or terminate access to the Services — in whole or in part — at any time for any of the following reasons:</p>
          <ul className="legal-list">
            <li>Non-payment of subscription fees following reasonable notice</li>
            <li>Violation of the Acceptable Use provisions in Section 08</li>
            <li>A security incident, active threat, or compromise of an Account or Workspace</li>
            <li>A lawful request from a government authority, court, or regulatory body</li>
            <li>Use of the Services in a manner that violates the terms of a connected Third-Party Platform</li>
            <li>Any other material violation of these Terms</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Where practicable, Lookara will provide advance notice before suspension. In cases involving active security threats or legal requirements, suspension may occur without prior notice.</p>
          <p>Customers may terminate their subscription at any time by following the account closure process. Upon termination, access to the Workspace will end at the close of the paid subscription period. Lookara will provide Customers with the opportunity to export their Operational Data for the period specified in the applicable plan, Order Form, or account-closure notice prior to Workspace deletion.</p>
          <p>Sections of these Terms that by their nature should survive termination — including Sections 10, 15, 23, 24, 25, and 27 — will continue in effect after termination.</p>
        </div>
      </section>

      {/* 28 GOVERNING LAW */}
      <section id="governing-law" className="legal-section">
        <span className="legal-anchor">28 — Governing Law</span>
        <h2 className="legal-section-title">Applicable law and dispute resolution</h2>
        <div className="legal-body">
          <p>These Terms are governed by and construed in accordance with the laws of the State of Florida, United States, without regard to its conflict of laws principles.</p>
          <p>Any dispute arising out of or relating to these Terms or the Services that cannot be resolved informally will be subject to the exclusive jurisdiction of the state and federal courts located in the State of Florida, United States, in the county and district corresponding to Lookara's principal place of business. You consent to the personal jurisdiction of such courts for this purpose.</p>
          <p>Before initiating any formal legal proceeding, you agree to contact Lookara at <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>legal@lookara.com</strong> and provide a written description of the dispute. The parties agree to make reasonable good-faith efforts to resolve the dispute informally within thirty (30) days of such notice before pursuing formal proceedings.</p>
        </div>
      </section>

      {/* 29 CHANGES */}
      <section id="changes" className="legal-section">
        <span className="legal-anchor">29 — Changes to Terms</span>
        <h2 className="legal-section-title">How we update these Terms</h2>
        <div className="legal-body">
          <p>Lookara may update these Terms from time to time to reflect changes in our platform, legal requirements, or business practices. When we make material changes, we will update the "Last updated" date at the top of this page and notify Customers through the platform or by email with reasonable advance notice.</p>
          <p>Your continued use of the Services after the effective date of updated Terms constitutes acceptance of those Terms. If you do not agree with material changes, you may terminate your subscription prior to the effective date of the changes.</p>
          <p>We maintain versioned records of these Terms. The version in effect at the time of any relevant event governs that event. Version history is available upon request by contacting <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>legal@lookara.com</strong>.</p>
        </div>
      </section>

      {/* 30 CONFIDENTIALITY */}
      <section id="confidentiality" className="legal-section">
        <span className="legal-anchor">30 — Confidentiality</span>
        <h2 className="legal-section-title">Confidential information</h2>
        <div className="legal-body">
          <p>Each party may receive non-public information from the other that is identified as confidential or that a reasonable party would understand to be confidential given the nature of the information and circumstances of disclosure ("Confidential Information").</p>
          <p>The receiving party will: (a) use Confidential Information only to perform its obligations or exercise its rights under these Terms; (b) protect Confidential Information using at least the same degree of care it uses to protect its own confidential information, and no less than reasonable care; and (c) disclose Confidential Information only to those of its personnel, contractors, and advisors who need to know it and who are bound by confidentiality obligations at least as protective as those in this section.</p>
          <p>Confidential Information does not include information that: (a) is or becomes publicly available through no breach of these Terms by the receiving party; (b) the receiving party independently develops without use of or reference to the disclosing party's Confidential Information; (c) is lawfully received from a third party without confidentiality restrictions; or (d) the receiving party already knew without any obligation of confidentiality.</p>
          <p>Either party may disclose Confidential Information to the extent required by law, regulation, or court order, provided that — where legally permitted — the receiving party provides reasonable prior notice to the disclosing party and cooperates with reasonable efforts to seek confidential treatment.</p>
          <p>Confidentiality obligations survive termination of these Terms for a period of three (3) years, except that obligations with respect to trade secrets continue for as long as the information qualifies as a trade secret under applicable law.</p>
        </div>
      </section>

      {/* 31 ELECTRONIC ACCEPTANCE */}
      <section id="electronic-acceptance" className="legal-section">
        <span className="legal-anchor">31 — Electronic Communications and Acceptance</span>
        <h2 className="legal-section-title">Electronic assent and communications</h2>
        <div className="legal-body">
          <p>You consent to receive agreements, notices, disclosures, and other communications from Lookara electronically, including by email and through the Services. Electronic communications satisfy any legal requirement that communications be in writing to the extent permitted by applicable law.</p>
          <p>Selecting an acceptance control, creating an Account, purchasing a subscription, or using the Services constitutes your electronic acceptance of these Terms and any policies incorporated by reference. Electronic acceptance carries the same legal effect as a written signature under applicable law, including the Florida Electronic Signature Act and the federal Electronic Signatures in Global and National Commerce Act (E-SIGN).</p>
        </div>
      </section>

      {/* 32 BETA */}
      <section id="beta-features" className="legal-section">
        <span className="legal-anchor">32 — Beta and Preview Features</span>
        <h2 className="legal-section-title">Early-access and experimental features</h2>
        <div className="legal-body">
          <p>Lookara may offer beta, preview, pilot, or early-access features as part of the Services. Such features are provided for evaluation purposes and may be incomplete, subject to change, suspended, or discontinued at any time without notice. Beta features may be subject to additional terms communicated at the time of access.</p>
          <p>Unless otherwise agreed in writing, beta and preview features are provided without service commitments, uptime guarantees, or support obligations. Customers should not rely on beta features for critical operational workflows. Lookara is not liable for losses arising from the modification, suspension, or discontinuation of any beta or preview feature.</p>
          <p>Feedback relating to beta features may be used by Lookara to improve the Services without compensation or attribution.</p>
        </div>
      </section>

      {/* 33 FORCE MAJEURE */}
      <section id="force-majeure" className="legal-section">
        <span className="legal-anchor">33 — Force Majeure</span>
        <h2 className="legal-section-title">Events beyond reasonable control</h2>
        <div className="legal-body">
          <p>Neither party will be liable for delay or failure in performance caused by circumstances beyond its reasonable control, including natural disasters, acts of God, utility or internet infrastructure failures, labor disputes, governmental actions, war, civil unrest, epidemics or pandemics, third-party cyberattacks or security incidents, or failures of Third-Party Platforms or subprocessors.</p>
          <p>The affected party will provide prompt notice to the other party and use commercially reasonable efforts to resume performance as soon as practicable. Force majeure events do not excuse payment obligations that have already accrued.</p>
        </div>
      </section>

      {/* 34 ASSIGNMENT */}
      <section id="assignment" className="legal-section">
        <span className="legal-anchor">34 — Assignment</span>
        <h2 className="legal-section-title">Transfer of rights and obligations</h2>
        <div className="legal-body">
          <p>Customers may not assign these Terms, transfer a subscription, or delegate their obligations under these Terms without Lookara's prior written consent, except in connection with a permitted merger, reorganization, or sale of substantially all of the assets to which these Terms relate — provided that the assignee agrees in writing to be bound by these Terms.</p>
          <p>Lookara may assign these Terms in connection with a merger, financing, reorganization, acquisition, or sale of its business or substantially all of its assets, without Customer consent, provided that the assignee assumes Lookara's obligations under these Terms.</p>
          <p>Any purported assignment in violation of this section is null and void.</p>
        </div>
      </section>

      {/* 35 SEVERABILITY */}
      <section id="severability" className="legal-section">
        <span className="legal-anchor">35 — Severability and Waiver</span>
        <h2 className="legal-section-title">Enforceability of individual provisions</h2>
        <div className="legal-body">
          <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable, that provision will be modified to the minimum extent necessary to make it enforceable, or — if modification is not possible — severed from these Terms. The remaining provisions will continue in full force and effect.</p>
          <p>Lookara's failure to enforce any provision on any occasion is not a waiver of the right to enforce that provision on any other occasion. No waiver is effective unless made in writing by an authorized representative of Lookara.</p>
        </div>
      </section>

      {/* 36 ENTIRE AGREEMENT */}
      <section id="entire-agreement" className="legal-section">
        <span className="legal-anchor">36 — Entire Agreement and Order of Precedence</span>
        <h2 className="legal-section-title">Complete agreement between the parties</h2>
        <div className="legal-body">
          <p>These Terms, the Privacy Policy, any applicable Order Form, any executed Data Processing Agreement, and any policies expressly incorporated by reference constitute the entire agreement between Lookara and the Customer concerning the Services and supersede all prior agreements and understandings on the same subject matter.</p>
          <p>Where these documents conflict, the following order of precedence applies:</p>
          <ul className="legal-list">
            <li>Any executed Order Form — for commercial and subscription terms</li>
            <li>Any executed Data Processing Agreement — for personal data processing obligations</li>
            <li>These Terms of Service — for general platform use and all other matters</li>
            <li>The <Link to="/privacy">Privacy Policy</Link> — for data handling practices</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>No modification of these Terms is effective unless made in writing and either signed by an authorized representative of Lookara or published through the standard Terms update process described in the Changes to Terms section.</p>
        </div>
      </section>

      {/* 37 NOTICES */}
      <section id="notices" className="legal-section">
        <span className="legal-anchor">37 — Notices</span>
        <h2 className="legal-section-title">How formal notices must be delivered</h2>
        <div className="legal-body">
          <p>Legal notices to Lookara must be sent to <strong style={{ color: 'var(--champagne-gold)', fontFamily: 'var(--mono)', fontWeight: 400 }}>legal@lookara.com</strong> and to the legal mailing address on file for Lookara Systems LLC. Notices are effective upon confirmed delivery.</p>
          <p>Lookara may deliver notices to Customers at the email address associated with the primary Customer Account or through in-platform communications. Notices sent to the registered email address are effective upon transmission. Customers are responsible for maintaining a current and accessible email address on their Account.</p>
          <p>Routine operational communications do not require the formal notice process described in this section.</p>
        </div>
      </section>

      {/* 38 CONTACT */}
      <section id="contact" className="legal-section">
        <span className="legal-anchor">38 — Contact</span>
        <h2 className="legal-section-title">How to reach us</h2>
        <div className="legal-body">
          <p>For questions about these Terms, legal correspondence, or any matter related to your use of the Services, use the appropriate contact below.</p>
        </div>
        <div className="legal-contact-grid">
          {CONTACTS.map((c) => (
            <div key={c.purpose} className="legal-contact-card">
              <div className="legal-contact-purpose">{c.purpose}</div>
              <div className="legal-contact-email">{c.email}</div>
            </div>
          ))}
        </div>
        <div className="legal-entity-box">
          <div className="legal-entity-box-label">Registered entity</div>
          <div className="legal-entity-box-body">
            Lookara Systems LLC<br />
            Florida, United States
          </div>
          <p className="legal-entity-box-note">
            A complete registered mailing address will be published here prior to launch.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}