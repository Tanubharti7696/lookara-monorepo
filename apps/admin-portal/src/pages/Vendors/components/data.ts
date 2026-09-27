// src/pages/Vendors/components/data.ts
export type VendorStatus = 'active' | 'limited' | 'blocked' | 'suspended';
export type Reliability = 'high' | 'attention' | 'risk';

export type ComplianceDoc = {
  status: 'valid' | 'expiring' | 'expired' | 'verified' | 'missing';
  label: string;
  detail: string;
  source: string;
};

export type RecentJob = {
  id: string;
  title: string;
  property: string;
  date: string;
  outcome: 'completed' | 'noshow' | 'flagged' | 'disputed';
};

export type FlagItem = { text: string; meta: string; type: 'active-flag' | 'resolved-flag' };

export type Relationship = { pm: string; jobs: number; signal: 'reliable' | 'slower'; relationship?: string };

export type AdminTimelineEntry = { event: string; by: string; time: string; dot: 'red'|'yellow'|'green'|'blue'|'gold'|'muted' };

export type Vendor = {
  id: string;
  name: string;
  trade: string;
  trades: string[];
  primaryTrade: string;
  additionalTrades: string[];
  complianceTrades: string[];
  eligibleCategories: number;
  location: string;
  type: string;
  status: VendorStatus;
  statusReason: string | null;
  statusReasonLevel: 'warn' | 'danger' | null;
  compliance: { coi: ComplianceDoc; license: ComplianceDoc; bgc: ComplianceDoc };
  compDots: ('ok'|'warn'|'fail')[];
  flags: number;
  reliability: Reliability;
  perf: { jobs: number; ontime: string; noshow: number; disputes: number };
  recentJobs: RecentJob[];
  activeFlags: FlagItem[];
  openDisputes: number;
  resolvedDisputes: number;
  relationships: Relationship[];
  kpi: { orgs: number; properties: number; activeJobs: number; lifetimeJobs: number };
  adminTimeline: AdminTimelineEntry[];
  adminNotes: string;
  isSuspended: boolean;
};

export const ALL_TRADES = [
  'Plumbing', 'Electrical', 'HVAC', 'Pool & Water Systems', 'Cleaning',
  'Landscaping', 'Handyman / General Repair', 'Carpentry', 'Painting',
  'Flooring', 'Roofing', 'Locksmith & Access', 'Appliance Repair',
  'Pest Control', 'Technology & Smart Home', 'Fire & Life Safety',
  'Security Systems', 'Pressure Washing', 'Waste Removal',
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1', name: 'Marcus Reed', trade: 'Pool & Water Systems',
    trades: ['Pool & Water Systems'], primaryTrade: 'Pool & Water Systems', additionalTrades: [],
    complianceTrades: ['Pool Contractor License', 'Business License', 'Background Check'],
    eligibleCategories: 8, location: 'Orlando · 30 mi', type: 'Individual',
    status: 'limited', statusReason: 'COI expiring in 21 days', statusReasonLevel: 'warn',
    compliance: {
      coi: { status: 'expiring', label: 'Expiring', detail: 'Exp Apr 13, 2027 · 21 days', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Jan 2028', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Apr 10, 2026', source: 'Checkr' },
    },
    compDots: ['warn', 'ok', 'ok'], flags: 0, reliability: 'high',
    perf: { jobs: 32, ontime: '94%', noshow: 1, disputes: 0 },
    recentJobs: [
      { id: '#4519', title: 'Pool pump replacement', property: '2847 Sunset Blvd', date: 'Apr 11', outcome: 'completed' },
      { id: '#4498', title: 'Filter cleaning', property: 'Seaside Villa', date: 'Apr 5', outcome: 'completed' },
      { id: '#4471', title: 'Chemical balance check', property: 'Palm Grove Retreat', date: 'Mar 28', outcome: 'completed' },
    ],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 1,
    relationships: [
      { pm: 'Coastal STR (Linda Torres)', jobs: 47, signal: 'reliable', relationship: 'Preferred' },
      { pm: 'SunState Rentals (Mike Chen)', jobs: 12, signal: 'reliable', relationship: 'Current' },
    ],
    kpi: { orgs: 2, properties: 18, activeJobs: 3, lifetimeJobs: 247 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v2', name: 'Chris Nakamura', trade: 'Electrical',
    trades: ['Electrical'], primaryTrade: 'Electrical', additionalTrades: [],
    complianceTrades: ['Electrical License', 'Business License', 'Background Check'],
    eligibleCategories: 6, location: 'Orlando · 15 mi', type: 'Individual',
    status: 'blocked', statusReason: 'License expired Mar 15, 2026', statusReasonLevel: 'danger',
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Dec 2026', source: 'Vendor upload' },
      license: { status: 'expired', label: 'Expired', detail: 'Expired Mar 15, 2026 · 29 days', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Jan 2026', source: 'Checkr' },
    },
    compDots: ['ok', 'fail', 'ok'], flags: 0, reliability: 'attention',
    perf: { jobs: 8, ontime: '88%', noshow: 0, disputes: 0 },
    recentJobs: [
      { id: '#4421', title: 'Panel inspection', property: 'Lake Nona Villa', date: 'Mar 10', outcome: 'completed' },
      { id: '#4398', title: 'Outlet replacement', property: 'Seaside Villa', date: 'Mar 2', outcome: 'completed' },
    ],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 0,
    relationships: [{ pm: 'Coastal STR (Linda Torres)', jobs: 22, signal: 'reliable' }],
    kpi: { orgs: 1, properties: 8, activeJobs: 0, lifetimeJobs: 41 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v3', name: 'Emma Garcia', trade: 'HVAC',
    trades: ['HVAC'], primaryTrade: 'HVAC', additionalTrades: [],
    complianceTrades: ['HVAC Certification', 'Business License', 'Background Check'],
    eligibleCategories: 7, location: 'Kissimmee · 20 mi', type: 'Individual',
    status: 'limited', statusReason: 'Background check pending admin approval', statusReasonLevel: 'warn',
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Aug 2026', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Mar 2027', source: 'Vendor upload' },
      bgc: { status: 'expiring', label: 'Pending review', detail: 'Submitted Apr 10, 2026', source: 'Checkr' },
    },
    compDots: ['ok', 'ok', 'warn'], flags: 0, reliability: 'high',
    perf: { jobs: 19, ontime: '96%', noshow: 0, disputes: 0 },
    recentJobs: [
      { id: '#4509', title: 'AC service', property: 'Palm Grove Retreat', date: 'Apr 10', outcome: 'completed' },
      { id: '#4488', title: 'Filter replacement', property: '2847 Sunset Blvd', date: 'Apr 3', outcome: 'completed' },
    ],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 0,
    relationships: [{ pm: 'SunState Rentals (Mike Chen)', jobs: 19, signal: 'reliable' }],
    kpi: { orgs: 1, properties: 12, activeJobs: 2, lifetimeJobs: 89 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v4', name: 'Jake Morris', trade: 'Plumbing',
    trades: ['Plumbing'], primaryTrade: 'Plumbing', additionalTrades: [],
    complianceTrades: ['Plumbing License', 'Business License', 'Background Check'],
    eligibleCategories: 9, location: 'Orlando · 25 mi', type: 'Individual',
    status: 'suspended', statusReason: '3 no-shows in 30 days', statusReasonLevel: 'danger',
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Nov 2026', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Sep 2027', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Feb 2026', source: 'Checkr' },
    },
    compDots: ['ok', 'ok', 'ok'], flags: 3, reliability: 'risk',
    perf: { jobs: 7, ontime: '71%', noshow: 3, disputes: 0 },
    recentJobs: [
      { id: '#4521', title: 'Emergency pipe repair', property: '2847 Sunset Blvd', date: 'Apr 13', outcome: 'noshow' },
      { id: '#4487', title: 'Plumbing inspection', property: 'Lake Nona Villa', date: 'Apr 6', outcome: 'flagged' },
      { id: '#4432', title: 'Water heater check', property: 'Seaside Villa', date: 'Mar 29', outcome: 'noshow' },
    ],
    activeFlags: [
      { text: 'No-show — Job #4521 · Emergency pipe repair', meta: 'Apr 13 · Flagged by PM Linda Torres', type: 'active-flag' },
      { text: 'Late arrival (2h 47min) — Job #4487', meta: 'Apr 6 · Flagged by PM Mike Chen', type: 'active-flag' },
      { text: 'No-show — Job #4432 · Water heater check', meta: 'Mar 29 · Flagged by PM Linda Torres', type: 'active-flag' },
    ],
    openDisputes: 0, resolvedDisputes: 0,
    relationships: [
      { pm: 'Coastal STR (Linda Torres)', jobs: 31, signal: 'slower' },
      { pm: 'SunState Rentals (Mike Chen)', jobs: 9, signal: 'slower' },
    ],
    kpi: { orgs: 2, properties: 11, activeJobs: 1, lifetimeJobs: 73 },
    adminTimeline: [], adminNotes: '', isSuspended: true,
  },
  {
    id: 'v5', name: 'David Liu', trade: 'Landscaping · Pressure Washing',
    trades: ['Landscaping', 'Pressure Washing'], primaryTrade: 'Landscaping', additionalTrades: ['Pressure Washing'],
    complianceTrades: ['Business License', 'Background Check'],
    eligibleCategories: 5, location: 'Orlando · 18 mi', type: 'Individual',
    status: 'active', statusReason: null, statusReasonLevel: null,
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Jul 2026', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Dec 2027', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Mar 2026', source: 'Checkr' },
    },
    compDots: ['ok', 'ok', 'ok'], flags: 2, reliability: 'attention',
    perf: { jobs: 14, ontime: '86%', noshow: 0, disputes: 0 },
    recentJobs: [
      { id: '#4518', title: 'Lawn maintenance', property: 'Palm Grove Retreat', date: 'Apr 12', outcome: 'flagged' },
      { id: '#4489', title: 'Lawn maintenance', property: 'Palm Grove Retreat', date: 'Apr 3', outcome: 'flagged' },
      { id: '#4460', title: 'Hedge trimming', property: 'Seaside Villa', date: 'Mar 24', outcome: 'completed' },
    ],
    activeFlags: [
      { text: 'Quality issue — uneven mowing patches · Job #4518', meta: 'Apr 12 · Flagged by PM Sarah Kim', type: 'active-flag' },
      { text: 'Quality issue — clippings on walkway · Job #4489', meta: 'Apr 3 · Flagged by PM Sarah Kim', type: 'active-flag' },
    ],
    openDisputes: 0, resolvedDisputes: 0,
    relationships: [{ pm: 'Coastal STR (Sarah Kim)', jobs: 31, signal: 'reliable' }],
    kpi: { orgs: 3, properties: 22, activeJobs: 4, lifetimeJobs: 312 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v6', name: 'Alex Rivera', trade: 'HVAC · Plumbing · Appliance Repair',
    trades: ['HVAC', 'Plumbing', 'Appliance Repair'],
    primaryTrade: 'HVAC', additionalTrades: ['Plumbing', 'Appliance Repair'],
    complianceTrades: ['HVAC Certification', 'Plumbing License', 'Business License', 'Background Check'],
    eligibleCategories: 17, location: 'Kissimmee · 12 mi', type: 'Individual',
    status: 'active', statusReason: null, statusReasonLevel: null,
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Feb 2027', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Oct 2027', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Nov 2025', source: 'Checkr' },
    },
    compDots: ['ok', 'ok', 'ok'], flags: 0, reliability: 'high',
    perf: { jobs: 28, ontime: '91%', noshow: 0, disputes: 1 },
    recentJobs: [
      { id: '#4520', title: 'HVAC filter replacement', property: '2847 Sunset Blvd', date: 'Apr 11', outcome: 'disputed' },
      { id: '#4503', title: 'AC coil cleaning', property: 'Lake Nona Villa', date: 'Apr 8', outcome: 'completed' },
      { id: '#4481', title: 'Pipe repair', property: 'Palm Grove Retreat', date: 'Apr 1', outcome: 'completed' },
    ],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 1,
    relationships: [{ pm: 'Coastal STR (Linda Torres)', jobs: 28, signal: 'reliable' }],
    kpi: { orgs: 2, properties: 19, activeJobs: 5, lifetimeJobs: 418 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v7', name: 'Ray Okafor', trade: 'Handyman / General Repair · Carpentry',
    trades: ['Handyman / General Repair', 'Carpentry'],
    primaryTrade: 'Handyman / General Repair', additionalTrades: ['Carpentry'],
    complianceTrades: ['Business License', 'Background Check'],
    eligibleCategories: 14, location: 'Tampa · 22 mi', type: 'Individual',
    status: 'active', statusReason: null, statusReasonLevel: null,
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Sep 2026', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Mar 2027', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Jan 2026', source: 'Checkr' },
    },
    compDots: ['ok', 'ok', 'ok'], flags: 0, reliability: 'high',
    perf: { jobs: 22, ontime: '95%', noshow: 0, disputes: 0 },
    recentJobs: [
      { id: '#4516', title: 'Door frame repair', property: '2847 Sunset Blvd', date: 'Apr 11', outcome: 'completed' },
      { id: '#4492', title: 'Cabinet install', property: 'Seaside Villa', date: 'Apr 4', outcome: 'completed' },
    ],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 0,
    relationships: [{ pm: 'SunState Rentals (Mike Chen)', jobs: 31, signal: 'reliable' }],
    kpi: { orgs: 2, properties: 14, activeJobs: 2, lifetimeJobs: 156 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v8', name: 'Priya Nair', trade: 'Technology & Smart Home · Security Systems',
    trades: ['Technology & Smart Home', 'Security Systems'],
    primaryTrade: 'Technology & Smart Home', additionalTrades: ['Security Systems'],
    complianceTrades: ['Low Voltage License', 'Business License', 'Background Check'],
    eligibleCategories: 11, location: 'Orlando · 10 mi', type: 'Individual',
    status: 'active', statusReason: null, statusReasonLevel: null,
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Jan 2027', source: 'Vendor upload' },
      license: { status: 'expiring', label: 'Expiring', detail: 'Exp Apr 30, 2026 · 17 days', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Feb 2026', source: 'Checkr' },
    },
    compDots: ['ok', 'warn', 'ok'], flags: 0, reliability: 'high',
    perf: { jobs: 11, ontime: '100%', noshow: 0, disputes: 0 },
    recentJobs: [
      { id: '#4514', title: 'Smart lock install', property: 'Lake Nona Villa', date: 'Apr 10', outcome: 'completed' },
      { id: '#4497', title: 'Keypad setup', property: 'Palm Grove Retreat', date: 'Apr 5', outcome: 'completed' },
    ],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 0,
    relationships: [{ pm: 'Coastal STR (Linda Torres)', jobs: 19, signal: 'reliable' }],
    kpi: { orgs: 1, properties: 9, activeJobs: 1, lifetimeJobs: 67 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v9', name: 'Tom Halloway', trade: 'Roofing',
    trades: ['Roofing'], primaryTrade: 'Roofing', additionalTrades: [],
    complianceTrades: ['Roofing Contractor License', 'COI (min $1M)', 'Background Check'],
    eligibleCategories: 4, location: 'Jacksonville · 15 mi', type: 'Individual',
    status: 'limited', statusReason: 'COI pending renewal — 6 days', statusReasonLevel: 'warn',
    compliance: {
      coi: { status: 'expiring', label: 'Expiring', detail: 'Exp Apr 19, 2026 · 6 days', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Aug 2027', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Mar 2026', source: 'Checkr' },
    },
    compDots: ['warn', 'ok', 'ok'], flags: 0, reliability: 'attention',
    perf: { jobs: 6, ontime: '83%', noshow: 1, disputes: 0 },
    recentJobs: [{ id: '#4476', title: 'Shingle repair', property: 'Seaside Villa', date: 'Mar 30', outcome: 'completed' }],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 0,
    relationships: [{ pm: 'Gateway Stays (Brett Walsh)', jobs: 12, signal: 'reliable' }],
    kpi: { orgs: 1, properties: 7, activeJobs: 0, lifetimeJobs: 38 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
  {
    id: 'v10', name: 'Luis Mendoza', trade: 'Pest Control · Waste Removal',
    trades: ['Pest Control', 'Waste Removal'],
    primaryTrade: 'Pest Control', additionalTrades: ['Waste Removal'],
    complianceTrades: ['Pest Control License', 'Business License', 'Background Check'],
    eligibleCategories: 6, location: 'Miami · 20 mi', type: 'Individual',
    status: 'active', statusReason: null, statusReasonLevel: null,
    compliance: {
      coi: { status: 'valid', label: 'Valid', detail: 'Exp Jun 2027', source: 'Vendor upload' },
      license: { status: 'valid', label: 'Valid', detail: 'Exp Nov 2026', source: 'Vendor upload' },
      bgc: { status: 'verified', label: 'Verified · Checkr', detail: 'Dec 2025', source: 'Checkr' },
    },
    compDots: ['ok', 'ok', 'ok'], flags: 0, reliability: 'high',
    perf: { jobs: 31, ontime: '97%', noshow: 0, disputes: 0 },
    recentJobs: [
      { id: '#4522', title: 'Quarterly pest treatment', property: 'Palm Grove Retreat', date: 'Apr 13', outcome: 'completed' },
      { id: '#4505', title: 'Rodent inspection', property: '2847 Sunset Blvd', date: 'Apr 7', outcome: 'completed' },
      { id: '#4479', title: 'Waste removal service', property: 'Lake Nona Villa', date: 'Apr 2', outcome: 'completed' },
    ],
    activeFlags: [], openDisputes: 0, resolvedDisputes: 0,
    relationships: [
      { pm: 'Coastal STR (Linda Torres)', jobs: 87, signal: 'reliable' },
      { pm: 'Premier Vacation Homes (James Park)', jobs: 64, signal: 'reliable' },
    ],
    kpi: { orgs: 3, properties: 21, activeJobs: 3, lifetimeJobs: 204 },
    adminTimeline: [], adminNotes: '', isSuspended: false,
  },
];

export function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
export function relLabel(r: Reliability) {
  return r === 'high' ? 'High reliability' : r === 'attention' ? 'Needs attention' : 'At risk';
}