// src/pages/Organizations/components/data.ts
export type OrgStatus = 'healthy' | 'needs-attention' | 'at-risk' | 'restricted' | 'suspended';
export type PerfLevel = 'good' | 'ok' | 'warn' | 'bad';

export type BillingCredit = {
  desc: string;
  adminName?: string;
  by?: string;
  reason: string;
  ref?: string;
  date: string;
};

export type BillingInfo = {
  plan: string;
  status: string;
  rate: string;
  lastBilling: string;
  renewal: string;
  accountManager: string;
  customRate?: string;
  customerSince?: string;
  credits: BillingCredit[];
};

export type PerfRow = { name: string; value: string; signal: string; level: PerfLevel };
export type Property = { name: string; address: string; issue: 'none'|'gap'|'incident'; issueLabel: string };
export type OrgVendor = { name: string; trade: string; jobs: number | string; signal: 'reliable'|'attention'|'risk' };
export type OrgUser = { name: string; email: string; role: 'admin'|'pm'; lastActive: string };
export type ComplianceRow = { label: string; value: string; badge: 'ok'|'warn'|'bad'; badgeLabel: string };
export type FinancialRow = { label: string; value: string };

export type Org = {
  id: string;
  name: string;
  subAge: string;
  location: string;
  properties: number;
  vendors: number;
  owners: number;
  activeIssues: number;
  compRate: string;
  status: OrgStatus;
  pmHealth: 'healthy' | 'review' | 'limited' | 'suspended';
  pmHealthLabel: string;
  overview: { properties: number; occupancyAvg: string; activeIncidents: number; pendingApprovals: number };
  performance: PerfRow[];
  properties_list: Property[];
  vendors_list: OrgVendor[];
  users: OrgUser[];
  compliance: ComplianceRow[];
  financial: FinancialRow[];
  billing: BillingInfo;
};

export function statusLabel(s: OrgStatus) {
  return s === 'healthy' ? 'Healthy' : s === 'needs-attention' ? 'Needs attention' : s === 'at-risk' ? 'At risk' : s === 'restricted' ? 'Restricted' : 'Suspended';
}

export const STATUS_ORDER: Record<OrgStatus, number> = {
  'at-risk': 0, 'needs-attention': 1, 'healthy': 2, 'restricted': 3, 'suspended': 4,
};

export const INITIAL_ORGS: Org[] = [
  {
    id: 'o1', name: 'Coastal STR', subAge: '3.6 yrs', location: 'Orlando, FL · Est. Jan 2023',
    properties: 47, vendors: 32, owners: 28, activeIssues: 3, compRate: '91%', status: 'needs-attention',
    pmHealth: 'review', pmHealthLabel: '🟡 Under Review',
    overview: { properties: 47, occupancyAvg: '78%', activeIncidents: 2, pendingApprovals: 4 },
    performance: [
      { name: 'PM Response Time (avg)', value: '1h 42m', signal: 'Acceptable', level: 'ok' },
      { name: 'Dispute Rate (last 30d)', value: '3.1%', signal: 'Above average', level: 'warn' },
      { name: 'Job Completion Rate', value: '94%', signal: 'Good', level: 'good' },
      { name: 'Approval Delays (avg)', value: '2h 18m', signal: 'Acceptable', level: 'ok' },
      { name: 'Vendor No-show Rate', value: '4.2%', signal: 'Needs attention', level: 'warn' },
      { name: 'Flagged Vendor Rate', value: '9.4%', signal: '3 of 32 vendors flagged', level: 'warn' },
    ],
    properties_list: [
      { name: 'Seaside Villa', address: '1204 Ocean Dr, Orlando', issue: 'none', issueLabel: 'No issues' },
      { name: '2847 Sunset Blvd', address: 'Orlando, FL', issue: 'incident', issueLabel: 'Active incident' },
      { name: 'Palm Grove Retreat', address: 'Kissimmee, FL', issue: 'gap', issueLabel: 'Calendar gap' },
      { name: 'Lake Nona Villa', address: 'Lake Nona, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'Harbor View Suite', address: 'Orlando, FL', issue: 'gap', issueLabel: 'Calendar gap' },
    ],
    vendors_list: [
      { name: 'Marcus Reed', trade: 'Pool & Water Systems', jobs: 47, signal: 'reliable' },
      { name: 'Alex Rivera', trade: 'HVAC · Plumbing', jobs: 28, signal: 'reliable' },
      { name: 'Jake Morris', trade: 'Plumbing', jobs: 31, signal: 'risk' },
      { name: 'David Liu', trade: 'Landscaping', jobs: 31, signal: 'attention' },
      { name: 'Chris Nakamura', trade: 'Electrical', jobs: 22, signal: 'attention' },
    ],
    users: [
      { name: 'Linda Torres', email: 'linda@coastalstr.com', role: 'admin', lastActive: '2h ago' },
      { name: 'Mike Chen', email: 'mike@coastalstr.com', role: 'pm', lastActive: '4h ago' },
      { name: 'Sarah Kim', email: 'sarah@coastalstr.com', role: 'pm', lastActive: 'Yesterday' },
    ],
    compliance: [
      { label: 'Vendor compliance rate', value: '91%', badge: 'warn', badgeLabel: 'Below target' },
      { label: 'Vendors with expired docs', value: '1', badge: 'bad', badgeLabel: 'Action needed' },
      { label: 'Vendors with expiring docs', value: '2', badge: 'warn', badgeLabel: 'Within 30 days' },
      { label: 'Active flags (vendor)', value: '5', badge: 'warn', badgeLabel: 'Under review' },
      { label: 'Open disputes', value: '1', badge: 'warn', badgeLabel: 'D-893 · Pending' },
      { label: 'Resolved disputes (30d)', value: '2', badge: 'ok', badgeLabel: 'Closed' },
    ],
    financial: [
      { label: 'Reported payouts (last 30d)', value: '$14,280' },
      { label: 'Delayed payouts (>7d)', value: '2' },
      { label: 'Average payout cycle', value: '4.2 days' },
      { label: 'Disputed amounts (open)', value: '$280' },
    ],
    billing: {
      plan: 'Professional', status: 'Current', rate: '$299/mo',
      lastBilling: 'Aug 2, 2026', renewal: 'Sep 2, 2026', accountManager: 'Jennifer Walsh',
      customerSince: 'Jun 2021', credits: [],
    },
  },
  {
    id: 'o2', name: 'SunState Rentals', subAge: '4.4 yrs', location: 'Kissimmee, FL · Est. Mar 2022',
    properties: 31, vendors: 18, owners: 19, activeIssues: 1, compRate: '97%', status: 'healthy',
    pmHealth: 'healthy', pmHealthLabel: '🟢 Healthy',
    overview: { properties: 31, occupancyAvg: '82%', activeIncidents: 0, pendingApprovals: 2 },
    performance: [
      { name: 'PM Response Time (avg)', value: '58m', signal: 'Good', level: 'good' },
      { name: 'Dispute Rate (last 30d)', value: '1.2%', signal: 'Low', level: 'good' },
      { name: 'Job Completion Rate', value: '97%', signal: 'Excellent', level: 'good' },
      { name: 'Approval Delays (avg)', value: '1h 05m', signal: 'Good', level: 'good' },
      { name: 'Vendor No-show Rate', value: '1.1%', signal: 'Low', level: 'good' },
      { name: 'Flagged Vendor Rate', value: '5.6%', signal: '1 of 18 vendors flagged', level: 'ok' },
    ],
    properties_list: [
      { name: 'Sunset Palms', address: 'Kissimmee, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'Emerald Bay Cottage', address: 'Kissimmee, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'Lakeside Manor', address: 'St. Cloud, FL', issue: 'gap', issueLabel: 'Calendar gap' },
    ],
    vendors_list: [
      { name: 'Emma Garcia', trade: 'HVAC', jobs: 19, signal: 'reliable' },
      { name: 'Alex Rivera', trade: 'HVAC · Plumbing', jobs: 12, signal: 'reliable' },
      { name: 'David Liu', trade: 'Landscaping', jobs: 8, signal: 'attention' },
    ],
    users: [
      { name: 'James Rivera', email: 'james@sunstate.com', role: 'admin', lastActive: '1h ago' },
      { name: 'Priya Nair', email: 'priya@sunstate.com', role: 'pm', lastActive: '3h ago' },
    ],
    compliance: [
      { label: 'Vendor compliance rate', value: '97%', badge: 'ok', badgeLabel: 'On target' },
      { label: 'Vendors with expired docs', value: '0', badge: 'ok', badgeLabel: 'None' },
      { label: 'Vendors with expiring docs', value: '1', badge: 'warn', badgeLabel: 'Within 30 days' },
      { label: 'Active flags (vendor)', value: '2', badge: 'warn', badgeLabel: 'Under review' },
      { label: 'Open disputes', value: '0', badge: 'ok', badgeLabel: 'None' },
      { label: 'Resolved disputes (30d)', value: '1', badge: 'ok', badgeLabel: 'Closed' },
    ],
    financial: [
      { label: 'Reported payouts (last 30d)', value: '$9,450' },
      { label: 'Delayed payouts (>7d)', value: '0' },
      { label: 'Average payout cycle', value: '3.1 days' },
      { label: 'Disputed amounts (open)', value: '$0' },
    ],
    billing: {
      plan: 'Growth', status: 'Current', rate: '$149/mo',
      lastBilling: 'Jul 28, 2026', renewal: 'Aug 28, 2026', accountManager: '—',
      customerSince: 'Mar 2022', credits: [],
    },
  },
  {
    id: 'o3', name: 'Blue Wave Hospitality', subAge: '5.1 yrs', location: 'Tampa, FL · Est. Jun 2021',
    properties: 83, vendors: 51, owners: 44, activeIssues: 7, compRate: '74%', status: 'at-risk',
    pmHealth: 'limited', pmHealthLabel: '🔴 Suspended',
    overview: { properties: 83, occupancyAvg: '71%', activeIncidents: 5, pendingApprovals: 11 },
    performance: [
      { name: 'PM Response Time (avg)', value: '4h 12m', signal: 'Slow', level: 'bad' },
      { name: 'Dispute Rate (last 30d)', value: '6.8%', signal: 'High — investigate', level: 'bad' },
      { name: 'Job Completion Rate', value: '81%', signal: 'Below threshold', level: 'warn' },
      { name: 'Approval Delays (avg)', value: '5h 40m', signal: 'Needs attention', level: 'bad' },
      { name: 'Vendor No-show Rate', value: '8.1%', signal: 'Critical', level: 'bad' },
      { name: 'Flagged Vendor Rate', value: '19.6%', signal: '10 of 51 vendors flagged', level: 'bad' },
    ],
    properties_list: [
      { name: 'Bayfront Penthouse', address: 'Tampa, FL', issue: 'incident', issueLabel: 'Active incident' },
      { name: 'Harbour Isle Villa', address: 'Tampa, FL', issue: 'incident', issueLabel: 'Active incident' },
      { name: 'Clearwater Beach House', address: 'Clearwater, FL', issue: 'gap', issueLabel: 'Calendar gap' },
      { name: 'Davis Island Suite', address: 'Tampa, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'Hyde Park Loft', address: 'Tampa, FL', issue: 'gap', issueLabel: 'Calendar gap' },
    ],
    vendors_list: [
      { name: 'Multiple flagged vendors', trade: 'See Vendors page', jobs: '—', signal: 'risk' },
      { name: 'Vendor compliance: 74%', trade: '13 docs missing or expired', jobs: '—', signal: 'risk' },
    ],
    users: [
      { name: 'Carlos Mendez', email: 'carlos@bluewave.com', role: 'admin', lastActive: '6h ago' },
      { name: 'Tina Huang', email: 'tina@bluewave.com', role: 'pm', lastActive: '2d ago' },
      { name: 'Brett Walsh', email: 'brett@bluewave.com', role: 'pm', lastActive: '3d ago' },
    ],
    compliance: [
      { label: 'Vendor compliance rate', value: '74%', badge: 'bad', badgeLabel: 'Critical' },
      { label: 'Vendors with expired docs', value: '7', badge: 'bad', badgeLabel: 'Action required' },
      { label: 'Vendors with expiring docs', value: '6', badge: 'bad', badgeLabel: 'Within 30 days' },
      { label: 'Active flags (vendor)', value: '14', badge: 'bad', badgeLabel: 'Needs review' },
      { label: 'Open disputes', value: '4', badge: 'bad', badgeLabel: 'Active' },
      { label: 'Resolved disputes (30d)', value: '3', badge: 'ok', badgeLabel: 'Closed' },
    ],
    financial: [
      { label: 'Reported payouts (last 30d)', value: '$31,640' },
      { label: 'Delayed payouts (>7d)', value: '6' },
      { label: 'Average payout cycle', value: '8.4 days' },
      { label: 'Disputed amounts (open)', value: '$3,120' },
    ],
    billing: {
      plan: 'Professional', status: 'Past Due', rate: '$299/mo',
      lastBilling: 'Jul 1, 2026', renewal: 'Aug 1, 2026', accountManager: 'Michael Torres',
      customerSince: 'Jun 2021', credits: [],
    },
  },
  {
    id: 'o4', name: 'Gateway Stays', subAge: '2.8 yrs', location: 'Orlando, FL · Est. Nov 2023',
    properties: 12, vendors: 9, owners: 8, activeIssues: 0, compRate: '100%', status: 'healthy',
    pmHealth: 'healthy', pmHealthLabel: '🟢 Healthy',
    overview: { properties: 12, occupancyAvg: '86%', activeIncidents: 0, pendingApprovals: 1 },
    performance: [
      { name: 'PM Response Time (avg)', value: '44m', signal: 'Excellent', level: 'good' },
      { name: 'Dispute Rate (last 30d)', value: '0%', signal: 'Excellent', level: 'good' },
      { name: 'Job Completion Rate', value: '100%', signal: 'Excellent', level: 'good' },
      { name: 'Approval Delays (avg)', value: '48m', signal: 'Excellent', level: 'good' },
      { name: 'Vendor No-show Rate', value: '0%', signal: 'None', level: 'good' },
      { name: 'Flagged Vendor Rate', value: '0%', signal: '0 of 9 vendors flagged', level: 'good' },
    ],
    properties_list: [
      { name: 'Gateway Suite A', address: 'Orlando, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'Gateway Suite B', address: 'Orlando, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'International Drive Villa', address: 'Orlando, FL', issue: 'none', issueLabel: 'No issues' },
    ],
    vendors_list: [
      { name: 'Lisa Wong', trade: 'Cleaning', jobs: 24, signal: 'reliable' },
      { name: 'Tom Halloway', trade: 'Maintenance', jobs: 18, signal: 'reliable' },
    ],
    users: [
      { name: 'Angela Foster', email: 'angela@gatewaystays.com', role: 'admin', lastActive: '30m ago' },
    ],
    compliance: [
      { label: 'Vendor compliance rate', value: '100%', badge: 'ok', badgeLabel: 'Fully compliant' },
      { label: 'Vendors with expired docs', value: '0', badge: 'ok', badgeLabel: 'None' },
      { label: 'Vendors with expiring docs', value: '0', badge: 'ok', badgeLabel: 'None' },
      { label: 'Active flags (vendor)', value: '0', badge: 'ok', badgeLabel: 'None' },
      { label: 'Open disputes', value: '0', badge: 'ok', badgeLabel: 'None' },
      { label: 'Resolved disputes (30d)', value: '0', badge: 'ok', badgeLabel: 'None' },
    ],
    financial: [
      { label: 'Reported payouts (last 30d)', value: '$4,890' },
      { label: 'Delayed payouts (>7d)', value: '0' },
      { label: 'Average payout cycle', value: '2.8 days' },
      { label: 'Disputed amounts (open)', value: '$0' },
    ],
    billing: {
      plan: 'Starter', status: 'Trial', rate: '$0/mo',
      lastBilling: 'Jul 15, 2026', renewal: 'Aug 15, 2026', accountManager: '—',
      customerSince: 'Nov 2023', credits: [],
    },
  },
  {
    id: 'o5', name: 'Horizon Property Group', subAge: '4.3 yrs', location: 'Jacksonville, FL · Est. Apr 2022',
    properties: 28, vendors: 21, owners: 17, activeIssues: 2, compRate: '88%', status: 'needs-attention',
    pmHealth: 'review', pmHealthLabel: '🟡 Under Review',
    overview: { properties: 28, occupancyAvg: '74%', activeIncidents: 1, pendingApprovals: 3 },
    performance: [
      { name: 'PM Response Time (avg)', value: '2h 05m', signal: 'Acceptable', level: 'ok' },
      { name: 'Dispute Rate (last 30d)', value: '2.4%', signal: 'Slightly elevated', level: 'warn' },
      { name: 'Job Completion Rate', value: '92%', signal: 'Good', level: 'good' },
      { name: 'Approval Delays (avg)', value: '2h 55m', signal: 'Acceptable', level: 'ok' },
      { name: 'Vendor No-show Rate', value: '3.3%', signal: 'Watch', level: 'warn' },
      { name: 'Flagged Vendor Rate', value: '9.5%', signal: '2 of 21 vendors flagged', level: 'warn' },
    ],
    properties_list: [
      { name: 'Riverside Retreat', address: 'Jacksonville, FL', issue: 'incident', issueLabel: 'Active incident' },
      { name: 'Oceanside Bungalow', address: 'Jacksonville Beach, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'St. Johns View', address: 'Jacksonville, FL', issue: 'gap', issueLabel: 'Calendar gap' },
    ],
    vendors_list: [
      { name: 'Various vendors', trade: 'Multiple trades', jobs: '—', signal: 'attention' },
    ],
    users: [
      { name: 'Derek Owens', email: 'derek@horizonpg.com', role: 'admin', lastActive: '1d ago' },
      { name: 'Nadia Patel', email: 'nadia@horizonpg.com', role: 'pm', lastActive: '5h ago' },
    ],
    compliance: [
      { label: 'Vendor compliance rate', value: '88%', badge: 'warn', badgeLabel: 'Below target' },
      { label: 'Vendors with expired docs', value: '2', badge: 'bad', badgeLabel: 'Action needed' },
      { label: 'Vendors with expiring docs', value: '1', badge: 'warn', badgeLabel: 'Within 30 days' },
      { label: 'Active flags (vendor)', value: '3', badge: 'warn', badgeLabel: 'Under review' },
      { label: 'Open disputes', value: '1', badge: 'warn', badgeLabel: 'Active' },
      { label: 'Resolved disputes (30d)', value: '1', badge: 'ok', badgeLabel: 'Closed' },
    ],
    financial: [
      { label: 'Reported payouts (last 30d)', value: '$11,200' },
      { label: 'Delayed payouts (>7d)', value: '1' },
      { label: 'Average payout cycle', value: '5.1 days' },
      { label: 'Disputed amounts (open)', value: '$640' },
    ],
    billing: {
      plan: 'Growth', status: 'Current', rate: '$149/mo',
      lastBilling: 'Aug 5, 2026', renewal: 'Sep 5, 2026', accountManager: '—',
      customerSince: 'Apr 2022', credits: [],
    },
  },
  {
    id: 'o6', name: 'Premier Vacation Homes', subAge: '5.8 yrs', location: 'Miami, FL · Est. Aug 2020',
    properties: 62, vendors: 44, owners: 38, activeIssues: 0, compRate: '95%', status: 'healthy',
    pmHealth: 'healthy', pmHealthLabel: '🟢 Healthy',
    overview: { properties: 62, occupancyAvg: '84%', activeIncidents: 0, pendingApprovals: 2 },
    performance: [
      { name: 'PM Response Time (avg)', value: '1h 12m', signal: 'Good', level: 'good' },
      { name: 'Dispute Rate (last 30d)', value: '1.8%', signal: 'Low', level: 'good' },
      { name: 'Job Completion Rate', value: '96%', signal: 'Excellent', level: 'good' },
      { name: 'Approval Delays (avg)', value: '1h 30m', signal: 'Good', level: 'good' },
      { name: 'Vendor No-show Rate', value: '1.9%', signal: 'Low', level: 'ok' },
      { name: 'Flagged Vendor Rate', value: '4.5%', signal: '2 of 44 vendors flagged', level: 'ok' },
    ],
    properties_list: [
      { name: 'South Beach Penthouse', address: 'Miami Beach, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'Brickell City Loft', address: 'Miami, FL', issue: 'none', issueLabel: 'No issues' },
      { name: 'Coral Gables Estate', address: 'Coral Gables, FL', issue: 'none', issueLabel: 'No issues' },
    ],
    vendors_list: [
      { name: 'Multiple vendors', trade: 'Various trades', jobs: '—', signal: 'reliable' },
    ],
    users: [
      { name: 'Maria Santos', email: 'maria@premiervh.com', role: 'admin', lastActive: '2h ago' },
      { name: 'Luis Vega', email: 'luis@premiervh.com', role: 'pm', lastActive: '4h ago' },
      { name: 'Diana Cruz', email: 'diana@premiervh.com', role: 'pm', lastActive: '1d ago' },
    ],
    compliance: [
      { label: 'Vendor compliance rate', value: '95%', badge: 'ok', badgeLabel: 'On target' },
      { label: 'Vendors with expired docs', value: '1', badge: 'warn', badgeLabel: 'In review' },
      { label: 'Vendors with expiring docs', value: '2', badge: 'warn', badgeLabel: 'Within 30 days' },
      { label: 'Active flags (vendor)', value: '2', badge: 'warn', badgeLabel: 'Under review' },
      { label: 'Open disputes', value: '0', badge: 'ok', badgeLabel: 'None' },
      { label: 'Resolved disputes (30d)', value: '4', badge: 'ok', badgeLabel: 'Closed' },
    ],
    financial: [
      { label: 'Reported payouts (last 30d)', value: '$24,110' },
      { label: 'Delayed payouts (>7d)', value: '1' },
      { label: 'Average payout cycle', value: '3.8 days' },
      { label: 'Disputed amounts (open)', value: '$0' },
    ],
    billing: {
      plan: 'Enterprise', status: 'Current', rate: 'Custom',
      lastBilling: 'Aug 1, 2026', renewal: 'Sep 1, 2026', accountManager: 'Jennifer Walsh',
      customerSince: 'Aug 2020', credits: [],
    },
  },
];