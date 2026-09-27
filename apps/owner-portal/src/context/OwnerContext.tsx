// apps/owner-portal/src/context/OwnerContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/* ────────────────────────────────────────────────────────────
   Domain types
   ──────────────────────────────────────────────────────────── */

export type PropertyStatus = 'occupied' | 'issue' | 'checkin' | 'vacant';
export type EventTone = 'success' | 'warning' | 'muted';

export interface Property {
  id: string;
  name: string;
  location: string;
  occupancyDays: number;
  revenue: number;
  status: PropertyStatus;
  statusLabel: string;
  issueCount: number;
  nextEvent: string;
  nextEventTone: EventTone;
}

export interface Owner {
  name: string;
  role: string;
  initials: string;
}

export interface DateRange {
  label: string;
  month: string;
  year: number;
}

/* ── Approvals ─────────────────────────────────────────────── */

export type ApprovalCategory = 'maintenance' | 'emergency' | 'preventive';
export type ApprovalPriority = 'urgent' | 'normal' | 'low';
export type ApprovalQAStatus = 'awaiting-owner' | 'awaiting-pm' | 'pm-responded';

export interface ApprovalQAEntry {
  author: 'owner' | 'pm';
  text: string;
  isFollowUp?: boolean;
}

export interface ApprovalQA {
  status: ApprovalQAStatus;
  thread: ApprovalQAEntry[];
  followUpAsked: boolean;
}

export interface Approval {
  id: string;
  title: string;
  amount: number;
  propertyId: string;
  propertyName: string;
  detail: string;
  category: ApprovalCategory;
  priority: ApprovalPriority;

  /* Dashboard compatibility */
  urgent: boolean;
  urgencyLabel: string;
  deadline?: string;
  evidence?: string;

  /* Approvals page */
  deadlineLabel: string;
  deadlineHours: number;
  aboveThreshold: boolean;
  consequence: string;
  contextNote?: string;
  contextTone?: 'success' | 'warning' | 'muted';
  recommendation: string;
  evidenceLabel: string;

  /* Detail drawer */
  drawerKey: string;

  /* PM simulation (Phase 1) */
  pmSimulatedResponse: string;
  pmResponseDelayMs: number;
}

export interface ApprovalHistoryItem {
  id: string;
  outcome: 'approved' | 'declined' | 'expired';
  title: string;
  propertyName: string;
  amount: number;
  date: string;
  note?: string;
  drawerKey: string;
}

/* ── Incidents ─────────────────────────────────────────────── */

export type IncidentSeverity = 'critical' | 'moderate' | 'minor';
export type IncidentStatus = 'in-progress' | 'monitoring' | 'resolved';

export interface IncidentTimelineEntry {
  event: string;
  time: string;
  state: 'done' | 'active' | 'pending';
}

export interface Incident {
  id: string;
  title: string;
  propertyName: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedLabel: string;

  location: string;
  durationLabel: string;
  recurrenceNote: string;
  guestImpactNote: string;

  controlSignal: string;
  controlled: boolean;

  costEstimate: string;
  costApprovalNote?: string;
  costRange?: string;
  meta?: string;

  awaitingApproval?: boolean;
  approvalId?: string;

  /* Resolved-only */
  resolutionSpeed?: string;
  finalCost?: string;
  resolvedAt?: string;

  /* Drawer data */
  timeline: IncidentTimelineEntry[];
  photos: { label: string; bg: string }[];
  financial: { l: string; v: string; gold?: boolean; color?: string }[];
  pmNote: string;
  pmName: string;
  ownerAction?: {
    type: 'approval' | 'question';
    label: string;
    detail: string;
    ownerReply?: string;
    time: string;
  };
}

/* ── Updates / PM (dashboard) ──────────────────────────────── */

export type UpdateKind = 'resolved' | 'payout' | 'action' | 'info';

export interface UpdateItem {
  id: string;
  kind: UpdateKind;
  text: string;
  badge: string;
  meta: string;
  route: string;
}

export interface PmStats {
  name: string;
  role: string;
  score: number;
  tag: string;
  avgResponse: string;
  issuesResolved: string;
  jobsCompleted: number;
  updatesSent: number;
}

export interface FinancialSnapshot {
  netPayout: number;
  netPayoutDelta: string;
  nextPayout: string;
  occupancy: number;
  revenue: number;
  expenses: number;
  forecastTarget: number;
  chartCallout: string;
}

/* ── Documents ─────────────────────────────────────────────── */

export type DocumentCategory = 'statements' | 'legal' | 'insurance' | 'other';

export interface DocumentItem {
  id: string;
  name: string;
  category: DocumentCategory;
  propertyName: string;
  date: string;
  size: string;
  typeIcon: string;
  isNew?: boolean;
  archived?: boolean;
  statementKey?: string; // opens StatementModal when present
}

/* ── Statements ───────────────────────────────────────────── */

export interface StatementRow {
  label: string;
  value: string;
  bold?: boolean;
  gold?: boolean;
  red?: boolean;
}

export interface StatementSection {
  heading: string;
  rows: StatementRow[];
}

export interface Statement {
  key: string;
  title: string;
  sub: string;
  isFinal: boolean;
  sections: StatementSection[];
}

/* ── Transactions ─────────────────────────────────────────── */

export type TransactionCategory = 'revenue' | 'expenses' | 'payouts';
export type TransactionStatus = 'settled' | 'pending';
export type TransactionGroup = 'Today' | 'This week' | 'Earlier';

export interface TransactionItem {
  id: string;
  date: string;
  group: TransactionGroup;
  propertyName: string;
  type: string;
  icon: string;
  category: TransactionCategory;
  amount: number;
  status: TransactionStatus;
}

/* ── Payouts ──────────────────────────────────────────────── */

export type PayoutStatus = 'processing' | 'paid' | 'pending' | 'delayed';

export interface PayoutItem {
  id: string;
  date: string;
  propertyName: string;
  amount: number;
  status: PayoutStatus;
  delayNote?: string;
}

export interface PmFinancialStats {
  avgPayoutTime: string;
  onTimeRate: string;
  totalManaged: string;
  disputes: number;
}

/* ────────────────────────────────────────────────────────────
   Mock data
   ──────────────────────────────────────────────────────────── */

const OWNER: Owner = {
  name: 'Marcus Reid',
  role: 'Property Owner',
  initials: 'MR',
};

const PROPERTIES: Property[] = [
  {
    id: 'seaside-villa',
    name: 'Seaside Villa',
    location: 'Clearwater Beach, FL',
    occupancyDays: 5,
    revenue: 1580,
    status: 'issue',
    statusLabel: '⚠ Issue',
    issueCount: 1,
    nextEvent: 'Gap — 2 nights next week',
    nextEventTone: 'muted',
  },
  {
    id: 'lake-nona-villa',
    name: 'Lake Nona Villa',
    location: 'Orlando, FL',
    occupancyDays: 7,
    revenue: 1240,
    status: 'occupied',
    statusLabel: '● Occupied',
    issueCount: 0,
    nextEvent: 'Booked — next 5 days',
    nextEventTone: 'success',
  },
  {
    id: 'palm-grove-retreat',
    name: 'Palm Grove Retreat',
    location: 'Tampa, FL',
    occupancyDays: 4,
    revenue: 300,
    status: 'checkin',
    statusLabel: '● Check-in Today',
    issueCount: 0,
    nextEvent: 'Gap — 3 nights next week',
    nextEventTone: 'warning',
  },
];

const DATE_RANGES: DateRange[] = [
  { label: 'April 2025', month: 'April', year: 2025 },
  { label: 'March 2025', month: 'March', year: 2025 },
  { label: 'February 2025', month: 'February', year: 2025 },
];

const APPROVALS: Approval[] = [
  {
    id: 'apr-leak',
    title: 'Leak Repair',
    amount: 680,
    propertyId: 'seaside-villa',
    propertyName: 'Seaside Villa',
    detail: 'Bathroom ceiling',
    category: 'emergency',
    priority: 'urgent',
    urgent: true,
    urgencyLabel: 'Needed within 12h — PM recommends approval',
    deadlineLabel: '12h left',
    deadlineHours: 12,
    aboveThreshold: true,
    consequence: 'Leak progresses — est. $1,800+ to repair',
    contextNote: 'Next guest check-in: Friday',
    contextTone: 'warning',
    recommendation: 'Repair now — vendor ready today.',
    evidenceLabel: 'Quote attached · View details',
    deadline: 'Within 12h',
    evidence: 'Vendor quote attached: repair of bathroom ceiling due to active pipe leak. Includes labor, materials, and drywall patch. Quote valid 48h.',
    drawerKey: 'leak',
    pmSimulatedResponse:
      "I've already sourced the best available quote at short notice. A second quote would take 24–48h and risks the next guest stay. I strongly recommend proceeding now.",
    pmResponseDelayMs: 5000,
  },
  {
    id: 'apr-electrical',
    title: 'Electrical Panel Repair',
    amount: 1200,
    propertyId: 'harbor-bluff-cottage',
    propertyName: 'Harbor Bluff Cottage',
    detail: 'Main panel — breaker box',
    category: 'emergency',
    priority: 'urgent',
    urgent: true,
    urgencyLabel: 'Needed within 4h — safety issue',
    deadlineLabel: '4h left',
    deadlineHours: 4,
    aboveThreshold: true,
    consequence: 'Circuit stays isolated — affected zone without power',
    contextNote: 'Guest currently relocated to unaffected unit at no charge',
    contextTone: 'muted',
    recommendation: 'Repair now — licensed electrician already on site.',
    evidenceLabel: 'Quote attached · View details',
    deadline: 'Within 4h',
    evidence: 'Vendor quote attached: main breaker box inspection and replacement of failing circuit component.',
    drawerKey: 'electrical',
    pmSimulatedResponse:
      "This is a safety issue — the panel component is failing and needs replacement regardless. I'd recommend approving now so the electrician can finish today; the unit is already without power in that zone.",
    pmResponseDelayMs: 5000,
  },
  {
    id: 'apr-hvac',
    title: 'HVAC Service',
    amount: 340,
    propertyId: 'lake-nona-villa',
    propertyName: 'Lake Nona Villa',
    detail: 'Preventive maintenance',
    category: 'preventive',
    priority: 'low',
    urgent: false,
    urgencyLabel: 'Review within 48h',
    deadlineLabel: '48h',
    deadlineHours: 48,
    aboveThreshold: false,
    consequence: 'Unit runs past recommended service window',
    contextNote: 'Informational — under $500 threshold',
    contextTone: 'muted',
    recommendation: 'Routine service — no urgency.',
    evidenceLabel: 'Quote attached · View details',
    deadline: 'Within 48h',
    evidence: 'Vendor quote attached: routine preventive HVAC service and coil clean.',
    drawerKey: 'hvac',
    pmSimulatedResponse:
      'Standard preventive maintenance. Scheduling now avoids peak-season surcharge.',
    pmResponseDelayMs: 5000,
  },
  {
    id: 'apr-pool',
    title: 'Pool Inspection Report',
    amount: 0,
    propertyId: 'palm-grove-retreat',
    propertyName: 'Palm Grove Retreat',
    detail: 'Informational — no action needed',
    category: 'maintenance',
    priority: 'low',
    urgent: false,
    urgencyLabel: 'Review only',
    deadlineLabel: '—',
    deadlineHours: 999,
    aboveThreshold: false,
    consequence: 'None — informational report only',
    recommendation: 'Pool in good shape. No intervention needed.',
    evidenceLabel: 'Report attached · View details',
    deadline: '—',
    evidence: 'Report attached: water chemistry and filter system checked, all parameters normal.',
    drawerKey: 'pool',
    pmSimulatedResponse: 'No further action required.',
    pmResponseDelayMs: 5000,
  },
];

const APPROVAL_HISTORY: ApprovalHistoryItem[] = [
  { id: 'h1', outcome: 'approved', title: 'Exterior Repaint — Palm Grove Retreat', propertyName: 'Palm Grove Retreat', amount: 1200, date: 'Mar 28', drawerKey: 'hist-repaint' },
  { id: 'h2', outcome: 'approved', title: 'Cleaning Supply Order — All Properties', propertyName: 'All Properties', amount: 85, date: 'Mar 14', drawerKey: 'hist-cleaning' },
  { id: 'h3', outcome: 'declined', title: 'Furniture Replacement — Seaside Villa', propertyName: 'Seaside Villa', amount: 2400, date: 'Feb 20', note: 'Requested cheaper option', drawerKey: 'hist-furniture' },
  { id: 'h4', outcome: 'expired', title: 'Window Seal Repair — Lake Nona Villa', propertyName: 'Lake Nona Villa', amount: 310, date: 'Feb 5', note: 'No response — job cancelled', drawerKey: 'hist-window' },
  { id: 'h5', outcome: 'approved', title: 'Smoke Detector Replacement — All Properties', propertyName: 'All Properties', amount: 120, date: 'Jan 18', drawerKey: 'hist-smoke' },
];

const INCIDENTS: Incident[] = [
  {
    id: 'leak',
    title: 'Water Leak — Moderate',
    propertyName: 'Seaside Villa',
    type: 'Maintenance issue',
    severity: 'moderate',
    status: 'in-progress',
    startedLabel: 'Started 2h ago',
    location: 'Bathroom ceiling',
    durationLabel: 'Started 2h ago · ETA today · Next guest Fri',
    recurrenceNote: 'First occurrence — no prior related issues',
    guestImpactNote: 'Issue isolated — no impact beyond this repair',
    controlSignal: 'Vendor on site · no guest disruption expected',
    controlled: true,
    costEstimate: '$450–$680',
    costApprovalNote: '$680 awaiting approval',
    awaitingApproval: true,
    approvalId: 'apr-leak',
    timeline: [
      { event: 'Reported by PM', time: 'Today 8:14 AM', state: 'done' },
      { event: 'Vendor AquaFix Pro dispatched', time: 'Today 8:32 AM', state: 'done' },
      { event: 'Vendor on site — work started', time: 'Today 9:05 AM', state: 'done' },
      { event: 'Repair in progress', time: 'Ongoing', state: 'active' },
      { event: 'Completion + PM sign-off', time: 'Est. today by 6 PM', state: 'pending' },
    ],
    photos: [
      { label: 'Ceiling damage — water stain', bg: '#121820' },
      { label: 'Source identified — pipe joint', bg: '#0f1a12' },
    ],
    financial: [
      { l: 'Repair estimate', v: '$450–$680', gold: true },
      { l: 'Approval status', v: 'Pending your approval', color: 'amber' },
      { l: 'Insurance applicable', v: 'Check policy' },
    ],
    pmNote:
      "Vendor located the source — a cracked pipe joint above the ceiling panel. Repair is straightforward and will be complete before Friday's guest arrival. No disruption expected.",
    pmName: 'Jordan Clarke · Your PM · Today 9:10 AM',
  },
  {
    id: 'electrical',
    title: 'Electrical Panel Failure — Critical',
    propertyName: 'Harbor Bluff Cottage',
    type: 'Safety issue',
    severity: 'critical',
    status: 'in-progress',
    startedLabel: 'Started 40m ago',
    location: 'Main panel — breaker box',
    durationLabel: 'Started 40m ago · Licensed electrician on site · Power isolated to affected circuit',
    recurrenceNote: 'First occurrence — no prior related issues',
    guestImpactNote: 'Rest of unit temporarily without power in affected zone',
    controlSignal: 'Licensed electrician on site · guest relocated to unaffected unit',
    controlled: false,
    costEstimate: '$950–$1,200',
    costApprovalNote: '$1,200 awaiting approval',
    awaitingApproval: true,
    approvalId: 'apr-electrical',
    timeline: [
      { event: 'Reported by PM — breaker box smoking', time: 'Today 11:40 AM', state: 'done' },
      { event: 'Power isolated to affected circuit', time: 'Today 11:45 AM', state: 'done' },
      { event: 'Licensed electrician dispatched', time: 'Today 11:50 AM', state: 'done' },
      { event: 'Guest relocated to unaffected unit', time: 'Today 12:05 PM', state: 'done' },
      { event: 'Diagnosis + repair', time: 'Ongoing', state: 'active' },
      { event: 'Completion + safety sign-off', time: 'Est. today by 4 PM', state: 'pending' },
    ],
    photos: [
      { label: 'Panel damage — scorch marks', bg: '#1a1210' },
      { label: 'Affected breaker — close-up', bg: '#121820' },
    ],
    financial: [
      { l: 'Repair estimate', v: '$950–$1,200', gold: true },
      { l: 'Approval status', v: 'Pending your approval', color: 'amber' },
      { l: 'Insurance applicable', v: 'Check policy' },
    ],
    pmNote:
      'Licensed electrician identified a failing breaker causing overheating. Circuit has been isolated for safety — no fire risk. Guest has been moved to an unaffected unit at no charge. Repair requires panel component replacement.',
    pmName: 'Jordan Clarke · Your PM · Today 12:10 PM',
  },
  {
    id: 'pest',
    title: 'Pest Sighting — Minor',
    propertyName: 'Palm Grove Retreat',
    type: 'Maintenance issue',
    severity: 'minor',
    status: 'monitoring',
    startedLabel: 'Started yesterday',
    location: 'Kitchen — minor ant activity',
    durationLabel: 'Reported by cleaning crew · Routine treatment scheduled',
    recurrenceNote: 'Routine — no recurring pattern',
    guestImpactNote: 'No guest impact — treated between stays',
    controlSignal: 'Pest control scheduled · no guest disruption',
    controlled: true,
    costEstimate: '$85',
    costApprovalNote: 'under $500 — informational only, PM handling directly',
    timeline: [
      { event: 'Reported by cleaning crew — minor ant activity', time: 'Yesterday 2:15 PM', state: 'done' },
      { event: 'PM logged — routine treatment scheduled', time: 'Yesterday 2:30 PM', state: 'done' },
      { event: 'Pest control treatment', time: 'Today', state: 'active' },
    ],
    photos: [],
    financial: [
      { l: 'Treatment cost', v: '$85', gold: true },
      { l: 'Approval status', v: 'Not required — under $500 threshold', color: 'green' },
    ],
    pmNote:
      'Minor ant activity near the kitchen counter — no food safety concern. Routine pest control scheduled between guest stays. Handled directly, no owner action needed.',
    pmName: 'Jordan Clarke · Your PM · Yesterday 2:30 PM',
  },
];

const INCIDENTS_RESOLVED: Incident[] = [
  {
    id: 'resolved-hvac',
    title: 'HVAC Malfunction',
    propertyName: 'Lake Nona Villa',
    type: 'Maintenance issue',
    severity: 'moderate',
    status: 'resolved',
    startedLabel: 'Apr 3',
    location: 'Central HVAC unit',
    durationLabel: 'Apr 3 · 7:40 AM → 1:55 PM',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Resolved — no further action',
    controlled: true,
    costEstimate: '$320',
    finalCost: '$320',
    resolutionSpeed: 'Resolved in 6h',
    timeline: [
      { event: 'Reported by PM', time: 'Apr 3 7:40 AM', state: 'done' },
      { event: 'Vendor dispatched', time: 'Apr 3 8:10 AM', state: 'done' },
      { event: 'Unit diagnosed — compressor fault', time: 'Apr 3 9:30 AM', state: 'done' },
      { event: 'Compressor replaced', time: 'Apr 3 12:45 PM', state: 'done' },
      { event: 'Resolved — PM signed off', time: 'Apr 3 1:55 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$320', gold: true },
      { l: 'Approval', v: 'Pre-approved under $500', color: 'green' },
    ],
    pmNote:
      'Compressor replaced, unit tested and running normally. Resolved before guest arrival with no disruption.',
    pmName: 'Jordan Clarke · Your PM · Apr 3',
  },
  {
    id: 'resolved-drain',
    title: 'Blocked Drain',
    propertyName: 'Palm Grove Retreat',
    type: 'Maintenance issue',
    severity: 'moderate',
    status: 'resolved',
    startedLabel: 'Mar 28',
    location: 'Main bathroom',
    durationLabel: 'Mar 28 · 10:15 AM → 1:20 PM',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Resolved — no further action',
    controlled: true,
    costEstimate: '$120',
    finalCost: '$120',
    resolutionSpeed: 'Resolved in 3h',
    timeline: [
      { event: 'Reported by PM', time: 'Mar 28 10:15 AM', state: 'done' },
      { event: 'Plumber dispatched', time: 'Mar 28 10:45 AM', state: 'done' },
      { event: 'Drain cleared', time: 'Mar 28 12:50 PM', state: 'done' },
      { event: 'Resolved — PM signed off', time: 'Mar 28 1:20 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$120', gold: true },
      { l: 'Approval', v: 'Pre-approved under $500', color: 'green' },
    ],
    pmNote: 'Standard blockage — cleared quickly. No damage to pipes. All drains tested and clear.',
    pmName: 'Jordan Clarke · Your PM · Mar 28',
  },
  {
    id: 'resolved-window',
    title: 'Broken Window Latch',
    propertyName: 'Seaside Villa',
    type: 'Guest damage',
    severity: 'minor',
    status: 'resolved',
    startedLabel: 'Mar 15',
    location: 'Bedroom 2 window',
    durationLabel: 'Mar 15 · 2:00 PM → 6:10 PM',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Resolved — no further action',
    controlled: true,
    costEstimate: '$85',
    finalCost: '$85',
    resolutionSpeed: 'Resolved in 4h',
    timeline: [
      { event: 'Reported by guest', time: 'Mar 15 2:00 PM', state: 'done' },
      { event: 'PM assessed — latch broken', time: 'Mar 15 2:30 PM', state: 'done' },
      { event: 'Handyman dispatched', time: 'Mar 15 3:15 PM', state: 'done' },
      { event: 'Latch replaced', time: 'Mar 15 5:50 PM', state: 'done' },
      { event: 'Resolved — PM signed off', time: 'Mar 15 6:10 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$85', gold: true },
      { l: 'Guest deposit', v: 'Deducted — notified', color: 'amber' },
    ],
    pmNote:
      'Latch replaced same day. Guest was cooperative. Deposit deduction processed per policy.',
    pmName: 'Jordan Clarke · Your PM · Mar 15',
  },
];

const INCIDENTS_HISTORY: Incident[] = [
  {
    id: 'hist-appliance',
    title: 'Appliance Fault',
    propertyName: 'Lake Nona Villa',
    type: 'Maintenance issue',
    severity: 'minor',
    status: 'resolved',
    startedLabel: 'Feb 18, 2026',
    location: 'Kitchen — dishwasher',
    durationLabel: 'Feb 18 · 9:20 AM → 2:35 PM',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Resolved — no further action',
    controlled: true,
    costEstimate: '$210',
    finalCost: '$210',
    resolutionSpeed: 'Resolved · 5h',
    timeline: [
      { event: 'Reported by PM', time: 'Feb 18 9:20 AM', state: 'done' },
      { event: 'Faulty dishwasher diagnosed', time: 'Feb 18 10:00 AM', state: 'done' },
      { event: 'Owner approved replacement part', time: 'Feb 18 10:45 AM', state: 'done' },
      { event: 'Part installed — unit tested', time: 'Feb 18 2:10 PM', state: 'done' },
      { event: 'Resolved — PM signed off', time: 'Feb 18 2:35 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$210', gold: true },
      { l: 'Approval', v: 'Owner approved · $210', color: 'green' },
    ],
    ownerAction: {
      type: 'approval',
      label: 'You approved',
      detail: 'Replacement part — $210',
      time: 'Feb 18, 10:45 AM',
    },
    pmNote: 'Dishwasher heating element replaced. Unit fully functional. Guest not affected.',
    pmName: 'Jordan Clarke · Your PM · Feb 18',
  },
  {
    id: 'hist-electrical',
    title: 'Electrical Fault',
    propertyName: 'Seaside Villa',
    type: 'Emergency',
    severity: 'critical',
    status: 'resolved',
    startedLabel: 'Jan 30, 2026',
    location: 'Main circuit breaker',
    durationLabel: 'Jan 30 → Jan 31',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Escalated — required owner action',
    controlled: false,
    costEstimate: '$540',
    finalCost: '$540',
    resolutionSpeed: 'Escalated · 33h',
    timeline: [
      { event: 'Reported by PM — circuit breaker failure', time: 'Jan 30 6:45 AM', state: 'done' },
      { event: 'Emergency electrician dispatched', time: 'Jan 30 7:30 AM', state: 'done' },
      { event: 'PM asked owner: approve full rewire?', time: 'Jan 30 9:00 AM', state: 'done' },
      { event: 'Owner responded — approved up to $600', time: 'Jan 30 9:42 AM', state: 'done' },
      { event: 'Partial rewire completed', time: 'Jan 30 4:00 PM', state: 'done' },
      { event: 'Council inspection required — escalated', time: 'Jan 30 4:30 PM', state: 'done' },
      { event: 'Inspection passed — fully resolved', time: 'Jan 31 4:00 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$540', gold: true },
      { l: 'Approval', v: 'Owner approved up to $600', color: 'green' },
      { l: 'Council inspection fee', v: 'Included in total' },
    ],
    ownerAction: {
      type: 'question',
      label: 'PM asked you',
      detail: 'Can we proceed with partial rewire up to $600?',
      ownerReply: 'Yes — approved up to $600. Keep me posted.',
      time: 'Jan 30, 9:00 AM',
    },
    pmNote:
      'Full resolution required a council inspection. Approved by owner. No recurrence expected — wiring now up to current code.',
    pmName: 'Jordan Clarke · Your PM · Jan 31',
  },
  {
    id: 'hist-pest',
    title: 'Pest Inspection',
    propertyName: 'Palm Grove Retreat',
    type: 'Inspection finding',
    severity: 'minor',
    status: 'resolved',
    startedLabel: 'Jan 12, 2026',
    location: 'Kitchen',
    durationLabel: 'Jan 12 · 11:00 AM → 1:10 PM',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Resolved — no further action',
    controlled: true,
    costEstimate: '$150',
    finalCost: '$150',
    resolutionSpeed: 'Resolved · 2h',
    timeline: [
      { event: 'Routine inspection flagged minor pest activity', time: 'Jan 12 11:00 AM', state: 'done' },
      { event: 'Pest control treatment applied', time: 'Jan 12 12:30 PM', state: 'done' },
      { event: 'Resolved — PM signed off', time: 'Jan 12 1:10 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$150', gold: true },
      { l: 'Approval', v: 'Pre-approved under $500', color: 'green' },
    ],
    pmNote:
      'Minor activity in kitchen area — treated and cleared. Preventive spray applied. No guest disruption.',
    pmName: 'Jordan Clarke · Your PM · Jan 12',
  },
  {
    id: 'hist-plumbing',
    title: 'Plumbing Issue',
    propertyName: 'Seaside Villa',
    type: 'Maintenance issue',
    severity: 'moderate',
    status: 'resolved',
    startedLabel: 'Dec 20, 2025',
    location: 'Main bathroom',
    durationLabel: 'Dec 20 · 8:00 AM → 4:10 PM',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Resolved — no further action',
    controlled: true,
    costEstimate: '$380',
    finalCost: '$380',
    resolutionSpeed: 'Resolved · 8h',
    timeline: [
      { event: 'Reported by PM — slow drain + pressure drop', time: 'Dec 20 8:00 AM', state: 'done' },
      { event: 'Plumber dispatched', time: 'Dec 20 9:15 AM', state: 'done' },
      { event: 'PM asked owner: approve pipe section replacement?', time: 'Dec 20 10:30 AM', state: 'done' },
      { event: 'Owner approved — $380 max', time: 'Dec 20 10:55 AM', state: 'done' },
      { event: 'Pipe section replaced', time: 'Dec 20 2:45 PM', state: 'done' },
      { event: 'Resolved — PM signed off', time: 'Dec 20 4:10 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$380', gold: true },
      { l: 'Approval', v: 'Owner approved · $380', color: 'green' },
    ],
    ownerAction: {
      type: 'question',
      label: 'PM asked you',
      detail: 'Corroded section needs replacing — quote is $380. Can we proceed?',
      ownerReply: 'Approved. Please proceed and keep it under $380.',
      time: 'Dec 20, 10:30 AM',
    },
    pmNote:
      'Corroded pipe section replaced. Full pressure restored. No further issues expected.',
    pmName: 'Jordan Clarke · Your PM · Dec 20',
  },
  {
    id: 'hist-roof',
    title: 'Roof Inspection Finding',
    propertyName: 'Lake Nona Villa',
    type: 'Inspection finding',
    severity: 'minor',
    status: 'resolved',
    startedLabel: 'Dec 5, 2025',
    location: 'Roof — loose tiles',
    durationLabel: 'Dec 5 → Dec 6',
    recurrenceNote: '—',
    guestImpactNote: '—',
    controlSignal: 'Resolved — no further action',
    controlled: true,
    costEstimate: '$200',
    finalCost: '$200',
    resolutionSpeed: 'Resolved · 1 day',
    timeline: [
      { event: 'Annual inspection flagged loose tiles', time: 'Dec 5 10:00 AM', state: 'done' },
      { event: 'Owner approved preventive repair', time: 'Dec 5 11:30 AM', state: 'done' },
      { event: 'Roofing crew dispatched next morning', time: 'Dec 6 9:00 AM', state: 'done' },
      { event: 'Tiles reseated and sealed', time: 'Dec 6 11:30 AM', state: 'done' },
      { event: 'Resolved — PM signed off', time: 'Dec 6 12:00 PM', state: 'done' },
    ],
    photos: [],
    financial: [
      { l: 'Final cost', v: '$200', gold: true },
      { l: 'Approval', v: 'Owner approved · $200', color: 'green' },
    ],
    ownerAction: {
      type: 'approval',
      label: 'You approved',
      detail: 'Preventive tile repair — $200',
      time: 'Dec 5, 11:30 AM',
    },
    pmNote:
      'Loose tiles reseated and sealed before rainy season. Preventive action avoided potential water ingress.',
    pmName: 'Jordan Clarke · Your PM · Dec 6',
  },
];

const UPDATES: UpdateItem[] = [
  { id: 'u1', kind: 'resolved', text: 'Leak repair approved — vendor dispatched to Seaside Villa', badge: 'Resolved', meta: '2h ago · Seaside Villa', route: '/updates' },
  { id: 'u2', kind: 'payout', text: 'March payout processed — $2,870 sent to your account', badge: 'Payout', meta: 'Yesterday · All Properties', route: '/financials' },
  { id: 'u3', kind: 'resolved', text: 'Inspection completed at Lake Nona Villa — no issues found', badge: 'Resolved', meta: 'Apr 3 · Lake Nona Villa', route: '/updates' },
  { id: 'u4', kind: 'action', text: 'HVAC service scheduled for Lake Nona Villa — pending your approval', badge: 'Action', meta: 'Apr 2 · Lake Nona Villa', route: '/approvals' },
  { id: 'u5', kind: 'info', text: 'Palm Grove Retreat guest checkout completed — property clear', badge: 'Resolved', meta: 'Apr 1 · Palm Grove Retreat', route: '/updates' },
];

const PM_STATS: PmStats = {
  name: 'Jordan Clarke',
  role: 'Your Property Manager',
  score: 94,
  tag: 'Highly Responsive',
  avgResponse: '18 min',
  issuesResolved: '100%',
  jobsCompleted: 47,
  updatesSent: 12,
};

const FINANCIAL_SNAPSHOT: FinancialSnapshot = {
  netPayout: 3120,
  netPayoutDelta: '+12%',
  nextPayout: 'Apr 15',
  occupancy: 78,
  revenue: 5840,
  expenses: 2720,
  forecastTarget: 3100,
  chartCallout: '+18% from Lake Nona — strongest week',
};

const DOCUMENTS: DocumentItem[] = [
  // Statements
  { id: 'doc-mar26', name: 'March 2026 Statement', category: 'statements', propertyName: 'All Properties', date: 'Apr 1, 2026', size: '142 KB', typeIcon: '📑', isNew: true, statementKey: 'mar26' },
  { id: 'doc-feb26', name: 'February 2026 Statement', category: 'statements', propertyName: 'All Properties', date: 'Mar 1, 2026', size: '138 KB', typeIcon: '📑', statementKey: 'feb26' },
  { id: 'doc-jan26', name: 'January 2026 Statement', category: 'statements', propertyName: 'All Properties', date: 'Feb 1, 2026', size: '131 KB', typeIcon: '📑', statementKey: 'jan26' },
  { id: 'doc-q4-25', name: 'Q4 2025 Summary', category: 'statements', propertyName: 'All Properties', date: 'Jan 5, 2026', size: '210 KB', typeIcon: '📑', statementKey: 'q4-2025' },
  { id: 'doc-2025', name: '2025 Annual Statement', category: 'statements', propertyName: 'All Properties', date: 'Jan 5, 2026', size: '384 KB', typeIcon: '📑', statementKey: '2025' },
  // Legal
  { id: 'doc-str-seaside', name: 'STR License 2026', category: 'legal', propertyName: 'Seaside Villa', date: 'Jan 1, 2026', size: '88 KB', typeIcon: '📋' },
  { id: 'doc-str-lakenona', name: 'STR License 2026', category: 'legal', propertyName: 'Lake Nona Villa', date: 'Jan 1, 2026', size: '88 KB', typeIcon: '📋' },
  { id: 'doc-op-palm', name: 'Operating Permit', category: 'legal', propertyName: 'Palm Grove Retreat', date: 'Mar 15, 2026', size: '72 KB', typeIcon: '📋' },
  { id: 'doc-hoa-seaside', name: 'HOA Approval Letter', category: 'legal', propertyName: 'Seaside Villa', date: 'Dec 10, 2025', size: '55 KB', typeIcon: '📋' },
  // Insurance
  { id: 'doc-ins-seaside', name: 'Property Insurance Policy', category: 'insurance', propertyName: 'Seaside Villa', date: 'Jan 1, 2026', size: '520 KB', typeIcon: '🔒' },
  { id: 'doc-ins-lakenona', name: 'Property Insurance Policy', category: 'insurance', propertyName: 'Lake Nona Villa', date: 'Jan 1, 2026', size: '518 KB', typeIcon: '🔒' },
  { id: 'doc-ins-summary', name: 'Coverage Summary', category: 'insurance', propertyName: 'All Properties', date: 'Jan 1, 2026', size: '95 KB', typeIcon: '🔒' },
  // Records
  { id: 'doc-pm-agreement', name: 'PM Agreement', category: 'other', propertyName: 'All Properties', date: 'Jan 1, 2026', size: '210 KB', typeIcon: '📝' },
  { id: 'doc-pool-inspection', name: 'Pool Inspection Report', category: 'other', propertyName: 'Palm Grove Retreat', date: 'Apr 8, 2026', size: '44 KB', typeIcon: '📝' },
  // Archive
  { id: 'arch-q3-25', name: 'Q3 2025 Summary', category: 'statements', propertyName: 'All Properties', date: 'Oct 3, 2025', size: '198 KB', typeIcon: '📑', archived: true },
  { id: 'arch-q2-25', name: 'Q2 2025 Summary', category: 'statements', propertyName: 'All Properties', date: 'Jul 2, 2025', size: '185 KB', typeIcon: '📑', archived: true },
  { id: 'arch-q1-25', name: 'Q1 2025 Summary', category: 'statements', propertyName: 'All Properties', date: 'Apr 1, 2025', size: '172 KB', typeIcon: '📑', archived: true },
  { id: 'arch-str-seaside-25', name: 'STR License 2025', category: 'legal', propertyName: 'Seaside Villa', date: 'Jan 1, 2025', size: '85 KB', typeIcon: '📋', archived: true },
  { id: 'arch-str-lakenona-25', name: 'STR License 2025', category: 'legal', propertyName: 'Lake Nona Villa', date: 'Jan 1, 2025', size: '85 KB', typeIcon: '📋', archived: true },
  { id: 'arch-ins-seaside-25', name: 'Property Insurance Policy 2025', category: 'insurance', propertyName: 'Seaside Villa', date: 'Jan 1, 2025', size: '510 KB', typeIcon: '🔒', archived: true },
  { id: 'arch-pm-2024', name: 'PM Agreement 2024', category: 'other', propertyName: 'All Properties', date: 'Jan 1, 2024', size: '195 KB', typeIcon: '📝', archived: true },
  { id: 'arch-inspection-2024', name: 'Property Inspection Report 2024', category: 'other', propertyName: 'All Properties', date: 'Dec 15, 2024', size: '310 KB', typeIcon: '📝', archived: true },
];

export const DOC_CATEGORY_META: Record<DocumentCategory, { icon: string; title: string; subtitle: string }> = {
  statements: { icon: '📄', title: 'Statements', subtitle: 'Monthly · Financial summaries' },
  legal:      { icon: '🏢', title: 'Legal & Permits', subtitle: 'Licenses · Permits · Compliance' },
  insurance:  { icon: '🛡', title: 'Insurance', subtitle: 'Coverage · Policies' },
  other:      { icon: '📁', title: 'Records', subtitle: 'Agreements · Inspection reports' },
};

const STATEMENTS: Record<string, Statement> = {
  mar26: {
    key: 'mar26',
    title: 'March 2026 Statement',
    sub: 'All Properties · Final · Locked',
    isFinal: true,
    sections: [
      { heading: 'Revenue', rows: [
        { label: 'Bookings — Seaside Villa', value: '+$2,180' },
        { label: 'Bookings — Lake Nona Villa', value: '+$1,940' },
        { label: 'Bookings — Palm Grove Retreat', value: '+$1,090' },
        { label: 'Total Revenue', value: '$5,210', bold: true },
      ]},
      { heading: 'Operating Costs', rows: [
        { label: 'Cleaning', value: '−$1,160', red: true },
        { label: 'Maintenance', value: '−$540', red: true },
        { label: 'PM Fees', value: '−$640', red: true },
        { label: 'Total Costs', value: '−$2,340', bold: true, red: true },
      ]},
      { heading: 'Net Owner Payout', rows: [
        { label: 'Seaside Villa', value: '$920' },
        { label: 'Lake Nona Villa', value: '$780' },
        { label: 'Palm Grove Retreat', value: '$170' },
        { label: 'Total Net Payout', value: '$2,870', bold: true, gold: true },
      ]},
      { heading: 'Adjustments', rows: [
        { label: 'PM Fee adjustment', value: '$0' },
        { label: 'Disputes', value: 'None' },
        { label: 'Late charges', value: 'None' },
      ]},
    ],
  },
  feb26: {
    key: 'feb26',
    title: 'February 2026 Statement',
    sub: 'All Properties · Final · Locked',
    isFinal: true,
    sections: [
      { heading: 'Revenue', rows: [
        { label: 'Total Revenue', value: '$4,780', bold: true },
      ]},
      { heading: 'Operating Costs', rows: [
        { label: 'Total Costs', value: '−$2,240', bold: true, red: true },
      ]},
      { heading: 'Net Owner Payout', rows: [
        { label: 'Total Net Payout', value: '$2,540', bold: true, gold: true },
      ]},
    ],
  },
  jan26: {
    key: 'jan26',
    title: 'January 2026 Statement',
    sub: 'All Properties · Final · Locked',
    isFinal: true,
    sections: [
      { heading: 'Revenue', rows: [
        { label: 'Total Revenue', value: '$3,920', bold: true },
      ]},
      { heading: 'Operating Costs', rows: [
        { label: 'Total Costs', value: '−$1,940', bold: true, red: true },
      ]},
      { heading: 'Net Owner Payout', rows: [
        { label: 'Total Net Payout', value: '$1,980', bold: true, gold: true },
      ]},
    ],
  },
  'q4-2025': {
    key: 'q4-2025',
    title: 'Q4 2025 Summary',
    sub: 'All Properties · Final · Locked',
    isFinal: true,
    sections: [
      { heading: 'Revenue', rows: [{ label: 'Total Q4 Bookings', value: '+$14,820', bold: true }] },
      { heading: 'Operating Costs', rows: [{ label: 'Total Q4 Costs', value: '−$6,240', bold: true, red: true }] },
      { heading: 'Net Owner Payout', rows: [{ label: 'Total Q4 Net Payout', value: '$8,580', bold: true, gold: true }] },
    ],
  },
  '2025': {
    key: '2025',
    title: '2025 Annual Statement',
    sub: 'All Properties · Final · Locked',
    isFinal: true,
    sections: [
      { heading: 'Full Year Revenue', rows: [
        { label: 'Total Bookings', value: '+$52,300', bold: true },
        { label: 'Seaside Villa', value: '$22,100' },
        { label: 'Lake Nona Villa', value: '$18,400' },
        { label: 'Palm Grove Retreat', value: '$11,800' },
      ]},
      { heading: 'Full Year Costs', rows: [
        { label: 'Total Costs', value: '−$23,660', bold: true, red: true },
      ]},
      { heading: 'Net Owner Payout', rows: [
        { label: 'Total Net Payout', value: '$28,640', bold: true, gold: true },
        { label: 'Avg monthly payout', value: '$2,387' },
        { label: 'Best month', value: 'August · $3,410' },
      ]},
    ],
  },
  apr26: {
    key: 'apr26',
    title: 'April 2026 — Preview',
    sub: 'In progress · Not yet final · Subject to change',
    isFinal: false,
    sections: [
      { heading: 'Revenue (to date)', rows: [{ label: 'Bookings recorded so far', value: '~$5,840' }] },
      { heading: 'Estimated Payout', rows: [
        { label: 'Net Payout (est.)', value: '~$2,120', gold: true },
        { label: 'Final statement available', value: 'Apr 30' },
      ]},
    ],
  },
  '2026': {
    key: '2026',
    title: '2026 YTD — Preview',
    sub: 'Jan–Apr · In progress · Not yet final',
    isFinal: false,
    sections: [
      { heading: 'YTD Revenue (est.)', rows: [{ label: 'Total so far', value: '~$19,750' }] },
      { heading: 'YTD Net Payout (est.)', rows: [
        { label: 'Total so far', value: '~$9,510', gold: true },
        { label: 'Final annual statement', value: 'Dec 31, 2026' },
      ]},
    ],
  },
};

const TRANSACTIONS: TransactionItem[] = [
  { id: 'tx01', date: 'Apr 9',  group: 'Today',     propertyName: 'Seaside Villa',   type: 'Booking',     icon: '💰', category: 'revenue',  amount:  320, status: 'settled' },
  { id: 'tx02', date: 'Apr 8',  group: 'This week', propertyName: 'Lake Nona Villa', type: 'Booking',     icon: '💰', category: 'revenue',  amount:  280, status: 'settled' },
  { id: 'tx03', date: 'Apr 7',  group: 'This week', propertyName: 'Seaside Villa',   type: 'Cleaning',    icon: '🧹', category: 'expenses', amount:  -85, status: 'settled' },
  { id: 'tx04', date: 'Apr 6',  group: 'This week', propertyName: 'Palm Grove',      type: 'Booking',     icon: '💰', category: 'revenue',  amount:  150, status: 'settled' },
  { id: 'tx05', date: 'Apr 5',  group: 'This week', propertyName: 'Seaside Villa',   type: 'Repair',      icon: '🔧', category: 'expenses', amount: -450, status: 'pending' },
  { id: 'tx06', date: 'Apr 4',  group: 'This week', propertyName: 'Lake Nona Villa', type: 'Booking',     icon: '💰', category: 'revenue',  amount:  310, status: 'settled' },
  { id: 'tx07', date: 'Apr 3',  group: 'Earlier',   propertyName: 'All Properties',  type: 'PM Fee',      icon: '📋', category: 'expenses', amount: -210, status: 'settled' },
  { id: 'tx08', date: 'Apr 2',  group: 'Earlier',   propertyName: 'Seaside Villa',   type: 'Cleaning',    icon: '🧹', category: 'expenses', amount:  -85, status: 'settled' },
  { id: 'tx09', date: 'Apr 1',  group: 'Earlier',   propertyName: 'All Properties',  type: 'Payout',      icon: '📤', category: 'payouts',  amount: 1420, status: 'settled' },
  { id: 'tx10', date: 'Mar 28', group: 'Earlier',   propertyName: 'Lake Nona Villa', type: 'Booking',     icon: '💰', category: 'revenue',  amount:  290, status: 'settled' },
  { id: 'tx11', date: 'Mar 22', group: 'Earlier',   propertyName: 'Seaside Villa',   type: 'Maintenance', icon: '🔧', category: 'expenses', amount: -120, status: 'settled' },
  { id: 'tx12', date: 'Mar 15', group: 'Earlier',   propertyName: 'Palm Grove',      type: 'Cleaning',    icon: '🧹', category: 'expenses', amount:  -85, status: 'settled' },
];

const PAYOUTS_UPCOMING: PayoutItem[] = [
  { id: 'po-apr15', date: 'Apr 15, 2026', propertyName: 'All Properties',    amount: 980, status: 'processing' },
  { id: 'po-apr30-a', date: 'Apr 30, 2026', propertyName: 'Lake Nona Villa', amount: 820, status: 'pending' },
  { id: 'po-apr30-b', date: 'Apr 30, 2026', propertyName: 'Palm Grove Retreat', amount: 320, status: 'pending' },
];

const PAYOUTS_COMPLETED: PayoutItem[] = [
  { id: 'po-apr01', date: 'Apr 1, 2026', propertyName: 'All Properties · March',    amount: 1420, status: 'paid' },
  { id: 'po-mar01', date: 'Mar 1, 2026', propertyName: 'All Properties · February', amount: 1280, status: 'paid' },
  { id: 'po-feb01', date: 'Feb 1, 2026', propertyName: 'All Properties · January',  amount: 1050, status: 'delayed', delayNote: 'Delayed by 3 days' },
];

const PM_FINANCIAL: PmFinancialStats = {
  avgPayoutTime: '2.1d',
  onTimeRate: '92%',
  totalManaged: '$12,840',
  disputes: 0,
};

/* ────────────────────────────────────────────────────────────
   Context
   ──────────────────────────────────────────────────────────── */

export const ALL_PROPERTIES = 'all';

interface OwnerContextValue {
  owner: Owner;
  properties: Property[];
  visibleProperties: Property[];

  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  selectedProperty: Property | null;

  dateRange: DateRange;
  dateRanges: DateRange[];
  setDateRange: (range: DateRange) => void;

  financial: FinancialSnapshot;
  updates: UpdateItem[];
  pmStats: PmStats;

  approvals: Approval[];
  approvalHistory: ApprovalHistoryItem[];
  qaMap: Record<string, ApprovalQA>;
  approveApproval: (id: string) => void;
  declineApproval: (id: string, note: string) => void;
  askQuestion: (id: string, question: string) => void;
  askFollowUp: (id: string, question: string) => void;

  incidents: Incident[];
  resolvedIncidents: Incident[];
  historyIncidents: Incident[];

  attentionCount: number;

  documents: DocumentItem[];
  statements: Record<string, Statement>;
  transactions: TransactionItem[];
  payoutsUpcoming: PayoutItem[];
  payoutsCompleted: PayoutItem[];
  pmFinancial: PmFinancialStats;
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(ALL_PROPERTIES);
  const [dateRange, setDateRange] = useState<DateRange>(DATE_RANGES[0]);
  const [approvals, setApprovals] = useState<Approval[]>(APPROVALS);
  const [qaMap, setQaMap] = useState<Record<string, ApprovalQA>>({});

  /* Ingest token from URL when redirected from Public Portal login */
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        localStorage.setItem('lookara_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, []);

  /* PM response timers — cleaned up on unmount */
  const pmTimers = useRef<Record<string, number>>({});
  useEffect(() => {
    const timers = pmTimers.current;
    return () => {
      Object.values(timers).forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const selectedProperty = useMemo(
    () => PROPERTIES.find((p) => p.id === selectedPropertyId) ?? null,
    [selectedPropertyId],
  );

  const visibleProperties = useMemo(
    () => (selectedProperty ? [selectedProperty] : PROPERTIES),
    [selectedProperty],
  );

  const approveApproval = useCallback((id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setQaMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const declineApproval = useCallback((id: string, _note: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    setQaMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const schedulePmResponse = useCallback((approval: Approval) => {
    if (pmTimers.current[approval.id]) {
      window.clearTimeout(pmTimers.current[approval.id]);
    }
    pmTimers.current[approval.id] = window.setTimeout(() => {
      setQaMap((prev) => {
        const current = prev[approval.id];
        if (!current) return prev;
        return {
          ...prev,
          [approval.id]: {
            ...current,
            status: 'pm-responded',
            thread: [
              ...current.thread,
              { author: 'pm', text: approval.pmSimulatedResponse },
            ],
          },
        };
      });
      delete pmTimers.current[approval.id];
    }, approval.pmResponseDelayMs);
  }, []);

  const askQuestion = useCallback(
    (id: string, question: string) => {
      const approval = approvals.find((a) => a.id === id);
      if (!approval) return;
      setQaMap((prev) => ({
        ...prev,
        [id]: {
          status: 'awaiting-pm',
          followUpAsked: prev[id]?.followUpAsked ?? false,
          thread: [...(prev[id]?.thread ?? []), { author: 'owner', text: question }],
        },
      }));
      schedulePmResponse(approval);
    },
    [approvals, schedulePmResponse],
  );

  const askFollowUp = useCallback(
    (id: string, question: string) => {
      const approval = approvals.find((a) => a.id === id);
      if (!approval) return;
      setQaMap((prev) => ({
        ...prev,
        [id]: {
          status: 'awaiting-pm',
          followUpAsked: true,
          thread: [
            ...(prev[id]?.thread ?? []),
            { author: 'owner', text: question, isFollowUp: true },
          ],
        },
      }));
      schedulePmResponse(approval);
    },
    [approvals, schedulePmResponse],
  );

  const attentionCount = PROPERTIES.filter((p) => p.status === 'issue').length;

  const value: OwnerContextValue = {
    owner: OWNER,
    properties: PROPERTIES,
    visibleProperties,
    selectedPropertyId,
    setSelectedPropertyId,
    selectedProperty,
    dateRange,
    dateRanges: DATE_RANGES,
    setDateRange,
    financial: FINANCIAL_SNAPSHOT,
    updates: UPDATES,
    pmStats: PM_STATS,
    approvals,
    approvalHistory: APPROVAL_HISTORY,
    qaMap,
    approveApproval,
    declineApproval,
    askQuestion,
    askFollowUp,
    incidents: INCIDENTS,
    resolvedIncidents: INCIDENTS_RESOLVED,
    historyIncidents: INCIDENTS_HISTORY,
    attentionCount,
    documents: DOCUMENTS,
    statements: STATEMENTS,
    transactions: TRANSACTIONS,
    payoutsUpcoming: PAYOUTS_UPCOMING,
    payoutsCompleted: PAYOUTS_COMPLETED,
    pmFinancial: PM_FINANCIAL,
  };

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner(): OwnerContextValue {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error('useOwner must be used inside <OwnerProvider>');
  return ctx;
}
