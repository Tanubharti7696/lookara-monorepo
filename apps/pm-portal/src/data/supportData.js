// src/data/supportData.js

export const SYSTEM_STATUS = {
  state: 'operational', // 'operational' | 'degraded' | 'outage'
  label: 'All systems operational',
  updated: 'Checked 2 min ago',
};

export const QUICK_ACTIONS = [
  { key: 'contact',  icon: '✉️', title: 'Contact Support',    sub: 'Email our team · replies within 4 hours',  tone: 'gold'  },
  { key: 'chat',     icon: '💬', title: 'Start Live Chat',    sub: 'Mon–Fri · 9am–6pm ET · avg wait 3 min',    tone: 'blue'  },
  { key: 'bug',      icon: '🐞', title: 'Report a Bug',       sub: 'Something not working as expected',        tone: 'crimson' },
  { key: 'feature',  icon: '💡', title: 'Request a Feature',  sub: 'Ideas go straight to the product team',    tone: 'violet' },
];

export const FAQ = [
  {
    category: 'Compliance',
    icon: '📋',
    questions: [
      {
        q: 'How do compliance templates work?',
        a: 'A template is a reusable set of requirements scoped to a jurisdiction (e.g. NYC STR). When you apply a template to a property, Lookara generates a tracked compliance item for every requirement — each with its own due date, cycle, and document checklist. Edits to a published template propagate to all applied properties, so duplicate before making breaking changes.',
      },
      {
        q: 'What happens when a requirement becomes overdue?',
        a: 'The compliance status flips to Overdue, the property is flagged as at-risk, and — if Ops Blocker is enabled on that requirement — operations are blocked on the property. Depending on your Notification Rules, the PM, Manager, and Owner (via Owner Portal) are alerted.',
      },
      {
        q: 'Can I have more than one template on a single property?',
        a: 'No. Each property is bound to one template at a time. If you need overlapping rules (e.g. state + city), combine them into a single template using requirement-level jurisdiction notes.',
      },
      {
        q: 'How do I change the renewal cycle for a requirement?',
        a: 'Open the template in the Compliance Template Builder, expand the requirement card, and change the Renewal Cycle dropdown. Per-property overrides are not supported — the cycle is defined at the template level.',
      },
    ],
  },
  {
    category: 'Work Orders',
    icon: '🔧',
    questions: [
      {
        q: 'How do SLA targets work?',
        a: 'Each ticket priority maps to an SLA Template (Emergency, Urgent, Standard, Low Priority, Inspection). Each template defines a response target, a resolution target, and an escalation cadence. If a target is breached, the ticket is flagged on the Work Orders board and escalated per your SLA rules.',
      },
      {
        q: 'Can I assign a work order to a vendor directly?',
        a: 'Yes. Open the WO, click Assign, and pick a vendor from the list. They receive an email with the WO details and can accept, decline, or mark in-progress without a Lookara login. Vendor activity is logged on the WO timeline.',
      },
      {
        q: 'What does the "Inspection" SLA priority mean?',
        a: 'Inspection is a distinct SLA category used for compliance-driven inspections. It defaults to 2-hour response / 48-hour resolution and escalates every 12 hours. You can override any of these values in Settings → SLA Templates.',
      },
    ],
  },
  {
    category: 'Billing & Payments',
    icon: '💳',
    questions: [
      {
        q: 'Which payment processors are supported?',
        a: 'Stripe is the default processor for rent, invoices, and guest payments. QuickBooks integration syncs invoices and expenses two-way. If you need a different processor, contact us — we support custom PCI-compliant checkout on Enterprise plans.',
      },
      {
        q: 'When are management fees deducted?',
        a: 'Management fees are deducted automatically from each booking payout on the day the payout lands. The fee percentage is configured per property in the property settings.',
      },
      {
        q: 'How do I download a financial report?',
        a: 'Settings → Reports has scheduled reports you can enable. For one-off exports, go to Reports in the main nav, filter by date range, and click Export (PDF / XLSX / CSV).',
      },
    ],
  },
  {
    category: 'Account & Team',
    icon: '👥',
    questions: [
      {
        q: 'How do I invite a team member?',
        a: 'Settings → Team → Invite Member. Enter their email, pick a role (Owner / Admin / Manager / Technician / Viewer), and send. They receive a link to set their password. Roles control what each member can view and edit.',
      },
      {
        q: 'What is the difference between Admin and Owner?',
        a: 'Owner has full control including billing and account deletion. Admin can do everything except billing and destructive account operations. Both can manage properties, work orders, and compliance.',
      },
      {
        q: 'How do I enable two-factor authentication?',
        a: 'Settings → Security → Two-Factor Authentication. Turn it on and scan the QR code with an authenticator app (Google Authenticator, 1Password, Authy). Save your 10 backup codes somewhere safe.',
      },
      {
        q: 'Can I export all my data?',
        a: 'Yes. Settings → Reports → Export Everything generates a ZIP containing properties, work orders, compliance items, financials, and documents. Requests complete within 24 hours and you receive a download link by email.',
      },
    ],
  },
];

export const RECENT_TICKETS = [
  { id: 'TKT-2041', subject: 'STR License PDF not uploading',     status: 'open',     priority: 'high',     updated: '2 hours ago',  agent: 'Marcus R.' },
  { id: 'TKT-2038', subject: 'Question about proration on invoice',status: 'pending',  priority: 'medium',   updated: 'Yesterday',    agent: 'Priya S.'  },
  { id: 'TKT-2019', subject: 'Bulk import skipped 3 rows',         status: 'resolved', priority: 'medium',   updated: 'Feb 28, 2026', agent: 'Marcus R.' },
  { id: 'TKT-1994', subject: 'Slack integration not connecting',   status: 'closed',   priority: 'low',      updated: 'Feb 12, 2026', agent: 'Priya S.'  },
];

export const POPULAR_ARTICLES = [
  { title: 'Getting started with Compliance Templates', views: 4820 },
  { title: 'Setting up SLA targets for your team',      views: 3140 },
  { title: 'Bulk importing properties from a CSV',      views: 2870 },
  { title: 'Connecting Stripe & QuickBooks',            views: 2610 },
  { title: 'Understanding compliance status colors',    views: 1980 },
];

export const CONTACT_REASONS = [
  'Bug report',
  'Billing question',
  'Feature request',
  'Data export / import issue',
  'Compliance template help',
  'Account access problem',
  'Other',
];

export const SUPPORT_CHANNELS = [
  { icon: '✉️', label: 'Email',     value: 'support@lookara.com',   note: 'Replies within 4 business hours' },
  { icon: '📞', label: 'Phone',     value: '+1 (212) 555-0142',      note: 'Mon–Fri · 9am–6pm ET' },
  { icon: '💬', label: 'Live chat', value: 'Available in-app',       note: 'Avg wait 3 min during business hours' },
  { icon: '📚', label: 'Docs',      value: 'docs.lookara.com',       note: 'Guides, API reference, changelog' },
];