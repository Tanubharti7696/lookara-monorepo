// src/pages/ReviewQueue/components/data.ts
import type { ReactNode } from 'react';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type DisputeItem = {
  id: string;
  title: string;
  subtitle: string;
  chip: { tone: 'green'|'yellow'|'red'|'blue'; text: string };
  slaTimer: { tone: 'ok'|'warn'|'breach'; text: string; label: string };
  escalationNote: string;
  facts: [string, string, boolean?][];
  evidence: string;
  impact: ReactNode;
  priority: Priority;
};

export type FlagItem = {
  id: string;
  vendor: string;
  service: string;
  statusBadge: 'active'|'limited'|'blocked'|'suspended';
  chip: { tone: 'green'|'yellow'|'red'|'blue'; text: string };
  systemCheck: { state: 'passed'|'failed'|'manual'|'na'; text: string };
  slaTimer: { tone: 'ok'|'warn'|'breach'; text: string };
  escalationNote?: string;
  escalated?: boolean;
  facts: [string, string, boolean?][];
  evidence: string;
  recommendation?: string;
  priority: Priority;
  drawerKey: 'jake' | 'david';
};

export type ComplianceItem = {
  id: string;
  title: string;
  subtitle: string;
  vendorStatus: 'active'|'limited'|'blocked'|'suspended';
  chip: { tone: 'green'|'yellow'|'red'|'blue'; text: string };
  systemValidation?: { state: 'passed'|'failed'; };
  systemCheck?: { state: 'passed'|'failed'|'manual'|'na'; text: string };
  slaTimer: { tone: 'ok'|'warn'|'breach'; text: string; label?: string };
  escalationNote?: string;
  escalated?: boolean;
  facts: [string, string, boolean?][];
  impact: ReactNode;
  docType: string;
  vendorName: string;
  docFilename: string;
  actions: ('approve'|'reject'|'view')[];
  priority: Priority;
};

export type HistoryRow = {
  id: string;
  timestamp: string;
  type: 'compliance' | 'flag' | 'dispute';
  item: string;
  resolution: string;
  resolutionTone: 'green'|'yellow'|'red'|'blue';
  vendorStatus: string;
  vendorBadge?: 'active'|'limited'|'blocked'|'suspended';
  admin: string;
  note: string;
  decisionHex: { label: string; value: string; tone?: string }[];
  correctionTask?: string;
};

/* ── DISPUTES ── */
export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'D-893',
    title: 'D-893 · Payment Dispute',
    subtitle: 'PM Linda Torres → Vendor Alex Rivera',
    chip: { tone: 'yellow', text: 'Waiting on Vendor' },
    slaTimer: { tone: 'warn', text: 'Waiting 18h', label: '· SLA 48h' },
    escalationNote: 'Within SLA',
    facts: [
      ['Job', '#4520 · HVAC filter replacement · $280'],
      ['Issue', 'Wrong filter installed — MERV 8 vs MERV 13 specified'],
      ['PM claim', 'Spec required MERV 13 in writing'],
      ['Vendor claim', 'Verbal request was MERV 8; original job scope'],
    ],
    evidence: 'PM: Original job spec (written) · Filter photos  |  Vendor: Text thread (MERV 8 mentioned) · Invoice for MERV 8',
    impact: 'PM → refund recommended · Vendor → $280 supported',
    priority: 'medium',
  },
];

/* ── FLAGS ── */
export const INITIAL_FLAGS: FlagItem[] = [
  {
    id: 'flag-jake',
    vendor: 'Jake Morris',
    service: 'Plumbing',
    statusBadge: 'limited',
    chip: { tone: 'red', text: '3 Flags · Critical' },
    systemCheck: { state: 'failed', text: '⚠ SLA breached' },
    slaTimer: { tone: 'breach', text: 'SLA breached · 24h' },
    escalated: true,
    facts: [
      ['Pattern', '3 flags in 30 days (threshold reached)'],
      ['Most recent', 'No-show — job assigned 48h prior, no response · Apr 13'],
      ['Prior flags', 'Late arrival · Apr 6  ·  No-show · Mar 29'],
    ],
    evidence: 'Flagged by 2 separate PMs (Linda Torres, Mike Chen). System auto-escalated after 3rd flag. Guest reported unresolved issue.',
    recommendation: 'System recommends: Suspend',
    priority: 'critical',
    drawerKey: 'jake',
  },
  {
    id: 'flag-david',
    vendor: 'David Liu',
    service: 'Landscaping',
    statusBadge: 'active',
    chip: { tone: 'yellow', text: '2 Flags · Under Review' },
    systemCheck: { state: 'na', text: '— PM-initiated flags' },
    slaTimer: { tone: 'breach', text: 'SLA breached · 24h' },
    escalated: true,
    facts: [
      ['Pattern', '2 quality flags in 14 days — same PM'],
      ['Most recent', 'Quality issue — uneven mowing patches · Apr 12'],
      ['Prior flag', 'Quality issue · Apr 3 · same property'],
    ],
    evidence: 'Both flags from PM Sarah Kim, same property. Second occurrence. Vendor acknowledged issue.',
    priority: 'high',
    drawerKey: 'david',
  },
];

/* ── COMPLIANCE ── */
export const INITIAL_COMPLIANCE: ComplianceItem[] = [
  {
    id: 'coi-marcus',
    title: 'COI — Marcus Reed',
    subtitle: 'Pool & Water Systems',
    vendorStatus: 'limited',
    chip: { tone: 'green', text: 'Ready for Review' },
    systemValidation: { state: 'passed' },
    slaTimer: { tone: 'ok', text: 'Waiting 8h', label: '· SLA 24h' },
    escalationNote: 'Within SLA',
    facts: [
      ['Source', 'Vendor upload · Extracted data — verify if needed'],
      ['Coverage', '$2,000,000 General Liability'],
      ['Expiry', 'Apr 13, 2027 (1 year)'],
      ['Submitted', '6:32 AM · Apr 13, 2026'],
    ],
    impact: 'If approved → Vendor becomes fully eligible for dispatch · If rejected → Vendor remains Limited until re-upload',
    docType: 'COI',
    vendorName: 'Marcus Reed',
    docFilename: 'coi-marcus-reed-2026.pdf',
    actions: ['approve', 'reject', 'view'],
    priority: 'high',
  },
  {
    id: 'license-chris',
    title: 'License — Chris Nakamura',
    subtitle: 'Electrical',
    vendorStatus: 'blocked',
    chip: { tone: 'red', text: 'System Check Failed' },
    systemValidation: { state: 'failed' },
    slaTimer: { tone: 'breach', text: 'Waiting 36h · SLA breached' },
    escalationNote: 'Escalated',
    escalated: true,
    facts: [
      ['Source', 'Vendor upload · Extracted data — verify if needed'],
      ['Issue', 'Expired Mar 15, 2026 (29 days ago)', true],
      ['Submitted', '2:18 PM · Apr 12, 2026'],
      ['Vendor status', 'Blocked — expired license (Mar 15, 2026)'],
    ],
    impact: 'If rejected → Vendor notified to upload renewed license · Remains Blocked until compliant',
    docType: 'License',
    vendorName: 'Chris Nakamura',
    docFilename: 'electrician-license-nakamura.pdf',
    actions: ['reject', 'view'],
    priority: 'critical',
  },
  {
    id: 'bgcheck-emma',
    title: 'Background Check — Emma Garcia',
    subtitle: 'HVAC',
    vendorStatus: 'limited',
    chip: { tone: 'yellow', text: 'Manual Review' },
    systemCheck: { state: 'passed', text: '✓ Provider verified · Checkr' },
    slaTimer: { tone: 'ok', text: 'Waiting 4h', label: '· SLA 24h' },
    escalationNote: 'Within SLA',
    facts: [
      ['Source', 'Checkr (verified provider) · Report ID: CHK-2026-04-10-EG'],
      ['Result', 'Clean · No criminal history · No adverse findings'],
      ['Report date', 'Apr 10, 2026'],
      ['Coverage', '7-year lookback · Federal + state · Identity verified'],
    ],
    impact: 'If approved → Vendor verified for safety compliance · Fully eligible for dispatch · If rejected → Vendor blocked pending further safety review',
    docType: 'Background Check',
    vendorName: 'Emma Garcia',
    docFilename: 'checkr-report-garcia-2026.pdf',
    actions: ['approve', 'reject', 'view'],
    priority: 'medium',
  },
];

/* ── HISTORY ── */
export const INITIAL_HISTORY: HistoryRow[] = [
  {
    id: 'h1',
    timestamp: 'Apr 13 · 2:32 PM',
    type: 'compliance',
    item: 'COI — Marcus Reed',
    resolution: 'Approved',
    resolutionTone: 'green',
    vendorStatus: 'Active',
    vendorBadge: 'active',
    admin: 'Sarah Chen',
    note: 'Coverage meets threshold, vendor verified with 2-year track record...',
    decisionHex: [
      { label: 'Decision', value: 'Approved', tone: 'green' },
      { label: 'Decided by', value: 'Sarah Chen (Admin)' },
      { label: 'Timestamp', value: 'Apr 13, 2026 · 2:32 PM' },
      { label: 'Vendor status after', value: 'Active' },
    ],
  },
  {
    id: 'h2',
    timestamp: 'Apr 13 · 2:28 PM',
    type: 'flag',
    item: 'Jake Morris',
    resolution: 'Suspended',
    resolutionTone: 'red',
    vendorStatus: 'Suspended',
    vendorBadge: 'suspended',
    admin: 'Sarah Chen',
    note: '3 no-shows in 30 days, pattern of unresponsive behavior...',
    decisionHex: [
      { label: 'Decision', value: 'Suspended', tone: 'red' },
      { label: 'Decided by', value: 'Sarah Chen (Admin)' },
      { label: 'Timestamp', value: 'Apr 13, 2026 · 2:28 PM' },
      { label: 'Vendor status after', value: 'Suspended' },
    ],
  },
  {
    id: 'h3',
    timestamp: 'Apr 13 · 1:42 PM',
    type: 'dispute',
    item: 'D-892 · Payment',
    resolution: 'Vendor Approved',
    resolutionTone: 'green',
    vendorStatus: '—',
    admin: 'Sarah Chen',
    note: 'Photos confirm HVAC filter replacement completed as specified...',
    decisionHex: [
      { label: 'Decision', value: 'Vendor Approved', tone: 'green' },
      { label: 'Decided by', value: 'Sarah Chen (Admin)' },
      { label: 'Timestamp', value: 'Apr 13, 2026 · 1:42 PM' },
      { label: 'Dispute type', value: 'Payment · Job #4517 · $280' },
    ],
  },
  {
    id: 'h4',
    timestamp: 'Apr 13 · 12:18 PM',
    type: 'compliance',
    item: 'License — Chris Nakamura',
    resolution: 'Rejected',
    resolutionTone: 'red',
    vendorStatus: 'Blocked',
    vendorBadge: 'blocked',
    admin: 'Sarah Chen',
    note: 'License expired Mar 15, 2026. Blocked until renewed license approved...',
    decisionHex: [
      { label: 'Decision', value: 'Rejected', tone: 'red' },
      { label: 'Decided by', value: 'Sarah Chen (Admin)' },
      { label: 'Timestamp', value: 'Apr 13, 2026 · 12:18 PM' },
      { label: 'Vendor status after', value: 'Blocked' },
    ],
  },
  {
    id: 'h5',
    timestamp: 'Apr 12 · 4:15 PM',
    type: 'flag',
    item: 'Rachel Kim',
    resolution: 'Warning Issued',
    resolutionTone: 'yellow',
    vendorStatus: 'Active',
    vendorBadge: 'active',
    admin: 'Sarah Chen',
    note: 'First-time late (30 min). Valid traffic incident documentation provided...',
    decisionHex: [
      { label: 'Decision', value: 'Warning Issued', tone: 'yellow' },
      { label: 'Decided by', value: 'Sarah Chen (Admin)' },
      { label: 'Timestamp', value: 'Apr 12, 2026 · 4:15 PM' },
      { label: 'Vendor status after', value: 'Active' },
    ],
  },
  {
    id: 'h6',
    timestamp: 'Apr 11 · 3:22 PM',
    type: 'compliance',
    item: 'COI — Lisa Wong',
    resolution: 'Approved',
    resolutionTone: 'green',
    vendorStatus: 'Active',
    vendorBadge: 'active',
    admin: 'Michael Torres',
    note: 'All requirements met. $1M coverage, clean underwriting history...',
    decisionHex: [
      { label: 'Decision', value: 'Approved', tone: 'green' },
      { label: 'Decided by', value: 'Michael Torres (Admin)' },
      { label: 'Timestamp', value: 'Apr 11, 2026 · 3:22 PM' },
      { label: 'Vendor status after', value: 'Active' },
    ],
  },
];

/* ── FLAG DRAWER CONTENT ── */
export const FLAG_DRAWER_DATA = {
  jake: {
    title: 'Flag Record — Jake Morris',
    meta: 'Plumbing · 3 flags in 30 days · SLA breached',
    statusLabel: 'Severity: Critical — 3 flags in 30 days · SLA breached',
    statusColor: 'var(--red)',
    statusDetail: 'Status: Limited · No prior warnings',
    flags: [
      {
        n: 'Flag #3 — No-show', isLatest: true, date: 'Apr 13 · 8:45 AM · PM Linda Torres', typeChip: 'noshow',
        facts: [
          ['Job', '#4521 · Emergency pipe repair · Orlando'],
          ['Scheduled', 'Apr 13 · 9:00 AM · Assigned 48h prior'],
          ['Result', 'No arrival · No contact · Guest impacted', true],
          ['System events', 'Accepted Apr 11 · No check-in · Auto-flagged 2h after window'],
        ],
        response: { text: 'No response · Notified Apr 13 · 11:00 AM', none: true },
      },
      {
        n: 'Flag #2 — Late arrival', date: 'Apr 6 · 2:30 PM · PM Mike Chen', typeChip: 'late',
        facts: [
          ['Job', '#4487 · Plumbing inspection · Lake Nona Villa'],
          ['Scheduled', 'Apr 6 · 10:00 AM'],
          ['Result', 'Arrived 12:47 PM — 2h 47min late · No advance notice', true],
          ['System events', 'Check-in 12:47 PM · PM notified 11:00 AM · Guest impacted'],
        ],
        response: { text: '"Traffic on I-4 was bad. I should have called ahead. Won\'t happen again." · Apr 6 · 3:15 PM' },
      },
      {
        n: 'Flag #1 — No-show', date: 'Mar 29 · 11:00 AM · PM Linda Torres', typeChip: 'noshow',
        facts: [
          ['Job', '#4432 · Water heater check · Seaside Villa'],
          ['Scheduled', 'Mar 29 · 9:00 AM'],
          ['Result', 'No arrival · No contact', true],
          ['System events', 'Accepted Mar 27 · No check-in · Auto-flagged 2h after window'],
        ],
        response: { text: '"Family emergency. I apologize." · Mar 29 · 2:00 PM' },
      },
    ],
    priorRecord: [
      ['Jobs', '47 total · 12 last 90d'],
      ['Active PMs', '2 (Linda Torres, Mike Chen)'],
      ['On platform', 'Since Jan 2024'],
      ['Prior record', 'No warnings · No suspensions', true],
    ],
    recommendation: '→ System recommends: Suspend (3 flags in 30 days)',
    recColor: 'var(--red)',
    recDetail: 'If suspended — removed from dispatch pool across all PMs',
  },
  david: {
    title: 'Flag Record — David Liu',
    meta: 'Landscaping · 2 flags in 14 days · Same PM, same property',
    statusLabel: 'Severity: Moderate — 2 flags in 14 days',
    statusColor: 'var(--yellow)',
    statusDetail: 'Status: Active · No prior warnings',
    flags: [
      {
        n: 'Flag #2 — Quality issue', isLatest: true, date: 'Apr 12 · 3:00 PM · PM Sarah Kim', typeChip: 'quality',
        facts: [
          ['Job', '#4518 · Lawn maintenance · Palm Grove Retreat'],
          ['Completed', 'Apr 12 · 1:30 PM'],
          ['Issue', 'Uneven mowing — patches unmowed along east fence line', true],
          ['System events', 'Marked complete 1:30 PM · PM flagged 3:00 PM · Same-day'],
        ],
        response: { text: '"The mower blade caught on the fence post. I can come back to fix it Saturday." · Apr 12 · 4:22 PM' },
      },
      {
        n: 'Flag #1 — Quality issue', date: 'Apr 3 · 4:15 PM · PM Sarah Kim', typeChip: 'quality',
        facts: [
          ['Job', '#4489 · Lawn maintenance · Palm Grove Retreat'],
          ['Completed', 'Apr 3 · 2:45 PM'],
          ['Issue', 'Clippings on walkway — guest tripped, reported to PM', true],
          ['System events', 'Marked complete 2:45 PM · PM flagged same day · Guest incident logged'],
        ],
        response: { text: '"I thought the blower cleared it. My mistake. I\'ll be more careful." · Apr 3 · 5:30 PM' },
      },
    ],
    priorRecord: [
      ['Jobs', '31 total · 8 last 90d'],
      ['Active PMs', '1 (Sarah Kim)'],
      ['On platform', 'Since Mar 2025'],
      ['Prior record', 'No warnings · No suspensions', true],
    ],
    recommendation: '→ System recommends: Issue Warning (2nd occurrence, same context)',
    recColor: 'var(--yellow)',
    recDetail: 'If warned — vendor notified, flag logged to profile, remains active',
  },
};

export const CURRENT_ADMIN = { name: 'Sarah Chen', role: 'Admin' };
export const adminLabel = () => `${CURRENT_ADMIN.name} · ${CURRENT_ADMIN.role}`;