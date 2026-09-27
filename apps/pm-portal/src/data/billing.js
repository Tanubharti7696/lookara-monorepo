// src/data/billing.js

export const ACCOUNT_DATA = {
  activeProperties: 15,
  maxProperties: 15,
  nextBillingDate: 'Feb 1, 2026',
  subscriptionEndDate: 'Feb 1, 2026',
  planName: 'Professional',
  currentPlan: 'professional',
  planRates: {
    starter:      { base: 39,  perProperty: 6, range: '1–3 properties',    tagline: 'MANUAL OPERATIONS OS',    engineLevel: 'Engines: L0-L1 (Manual → Assisted)',  howItWorks: 'AI suggests, never decides' },
    growth:       { base: 99,  perProperty: 4, range: '4–20 properties',   tagline: 'ASSISTED OPERATIONS OS',  engineLevel: 'Engines: L1-L2 (Assisted → Automated)', howItWorks: 'System advises, you decide' },
    professional: { base: 299, perProperty: 3, range: '21–99 properties',  tagline: 'AUTOMATED OPERATIONS OS', engineLevel: 'Advanced automation enabled',         howItWorks: 'System executes, you supervise' },
  },
  planFeatures: {
    starter: [
      'All 11 tools (basic mode)',
      'Emergency Mode (manual)',
      'Full visibility',
      'You control everything',
      'Email support',
    ],
    growth: [
      'Everything in Starter, plus:',
      'AI task prioritization',
      'SLA engine (monitoring)',
      'Compliance workflows',
      'Owner transparency',
      'Priority support',
    ],
    professional: [
      'Everything in Growth, plus:',
      'Smart task routing',
      'Forecasting & capacity planning',
      'Auto-assignment & escalation',
      'Dedicated success manager',
      'API access',
    ],
  },
};

export function planTotal(planKey, activeProperties) {
  const r = ACCOUNT_DATA.planRates[planKey];
  return r.base + activeProperties * r.perProperty;
}

export const INVOICES = [
  { id: 'INV-2025-12', date: 'Dec 18, 2025', description: 'Professional Plan - December 2025', amount: 344.00, status: 'Paid' },
  { id: 'INV-2025-11', date: 'Nov 18, 2025', description: 'Professional Plan - November 2025', amount: 344.00, status: 'Paid' },
  { id: 'INV-2025-10', date: 'Oct 18, 2025', description: 'Professional Plan - October 2025', amount: 344.00, status: 'Paid' },
];

export const ADDONS = [
  { key: 'compliance', name: 'Compliance Manager', desc: 'Automated compliance tracking, deadlines, and document management', priceLabel: '$9–$29/month per property', defaultOn: true, perProperty: 9,  perAccount: 0 },
  { key: 'vendor',     name: 'Vendor Ops Manager', desc: 'Enhanced vendor management and performance tracking',                priceLabel: '$15/month per account',  defaultOn: true, perProperty: 0,  perAccount: 15 },
  { key: 'analytics',  name: 'Analytics Module',   desc: 'Advanced reporting and business intelligence',                        priceLabel: '$25/month per account',  defaultOn: false, perProperty: 0, perAccount: 25 },
];

export function addonTotal(addons, activeProperties) {
  return addons.reduce((sum, a) => {
    if (!a.on) return sum;
    return sum + (a.perProperty * activeProperties) + a.perAccount;
  }, 0);
}

export const STATUS_OPTIONS = [
  { key: 'active',     label: '✅ Active' },
  { key: 'trial',      label: '⏳ Trial' },
  { key: 'past_due',   label: '⚠️ Past Due' },
  { key: 'restricted', label: '🔒 Restricted' },
  { key: 'suspended',  label: '🚫 Suspended' },
];

export const STATUS_META = {
  active:     { badgeCls: 'bs-badge--active',     text: '✅ Active',      statusText: 'Active',     statusColor: 'var(--success)',  message: 'Account in good standing',           gracePeriod: 'None',                banner: null },
  trial:      { badgeCls: 'bs-badge--trial',      text: '⏳ Trial',       statusText: 'Trial',      statusColor: 'var(--gold)',     message: '7 days remaining',                    gracePeriod: 'None',                banner: { tone: 'amber', icon: '⏳', title: 'Trial Period Active - 7 Days Left', message: 'Add a payment method now to avoid service interruption when your trial ends.', actions: [{ text: 'Add Payment Method', kind: 'updateCard' }, { text: 'View Plans', kind: 'changePlan' }] } },
  past_due:   { badgeCls: 'bs-badge--past-due',   text: '⚠️ Past Due',    statusText: 'Past Due',   statusColor: 'var(--amber)',    message: 'Payment failed - grace period active', gracePeriod: '7 days remaining',    banner: { tone: 'amber', icon: '⚠️', title: 'Payment Failed - Grace Period Active', message: "Your last payment didn't process. Please update your payment method within 7 days to avoid service interruption.", actions: [{ text: 'Update Payment Method', kind: 'updateCard' }, { text: 'View Failed Invoice', kind: 'scrollToHistory' }] } },
  restricted: { badgeCls: 'bs-badge--restricted', text: '🔒 Restricted',  statusText: 'Restricted', statusColor: 'var(--amber)',    message: 'Some features disabled',              gracePeriod: '2 days remaining',    banner: { tone: 'amber', icon: '🔒', title: 'Account Restricted - Limited Access', message: 'Payment is overdue. Emergency Mode disabled, new tasks blocked, vendor assignments suspended.', actions: [{ text: 'Update Payment Now', kind: 'updateCard' }, { text: 'Contact Support', kind: 'toast', toastMsg: 'Support team notified' }] } },
  suspended:  { badgeCls: 'bs-badge--suspended',  text: '🚫 Suspended',   statusText: 'Suspended',  statusColor: 'var(--crimson)',  message: 'Read-only mode active',               gracePeriod: 'Expired',             banner: { tone: 'crimson', icon: '🚫', title: 'Account Suspended - Read-Only Mode', message: 'All operations disabled. Pay outstanding balance immediately to restore service.', actions: [{ text: 'Pay Outstanding Balance', kind: 'updateCard' }, { text: 'Contact Support', kind: 'toast', toastMsg: 'Support team notified' }] } },
};