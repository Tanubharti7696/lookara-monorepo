// src/pages/AuditActivity/components/data.ts
export type Severity = 'critical' | 'high' | 'medium' | 'info';
export type Category = 'compliance' | 'vendor' | 'dispute' | 'flag' | 'system';
export type ActorType = 'admin' | 'pm' | 'vendor' | 'system';
export type ChipTone = 'approved' | 'rejected' | 'suspended' | 'warned' | 'disputed' | 'resolved' | 'flagged' | 'system';

export type AuditEvent = {
  id: string;
  severity: Severity;
  org: string;
  category: Category;
  actorType: ActorType;
  time: string;
  date: string;
  chip: ChipTone;
  chipLabel: string;
  actor: string;
  actorRole: string;
  target: string;
  targetRole: string;
  summary: string;
  session: string;
  detail: Record<string, string>;
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: '🔴 Critical',
  high:     '🟠 High',
  medium:   '🟡 Medium',
  info:     '⚪ Info',
};

export const INITIAL_EVENTS: AuditEvent[] = [
  {
    id: 'EVT-002397', severity: 'info', org: 'Coastal STR', category: 'compliance', actorType: 'admin',
    time: '2:32 PM', date: 'Apr 13',
    chip: 'approved', chipLabel: 'Doc Approved',
    actor: 'Sarah Chen', actorRole: 'Admin',
    target: 'Marcus Reed', targetRole: 'Vendor',
    summary: 'COI approved · Exp Apr 2027 · $2M coverage',
    session: 'Admin',
    detail: {
      'Event ID': 'EVT-002397',
      'Outcome': 'Approved',
      'Timestamp': '2026-04-13T14:32:11Z · 2:32 PM Apr 13',
      'Category': 'Compliance',
      'Event Type': 'Document Approved',
      'Document': 'Certificate of Insurance (COI)',
      'Coverage': '$2,000,000 General Liability',
      'Expiry': 'Apr 13, 2027',
      'Auto-validation': 'Passed',
      'Decision note': 'Coverage meets threshold. Vendor verified with 2-year track record.',
      'Session': 'Verified · IP [redacted]',
    },
  },
  {
    id: 'EVT-002396', severity: 'critical', org: 'Blue Wave Hospitality', category: 'vendor', actorType: 'admin',
    time: '2:28 PM', date: 'Apr 13',
    chip: 'suspended', chipLabel: 'Vendor Suspended',
    actor: 'Sarah Chen', actorRole: 'Admin',
    target: 'Jake Morris', targetRole: 'Vendor',
    summary: '3 no-shows in 30 days · Removed from dispatch',
    session: 'Admin',
    detail: {
      'Event ID': 'EVT-002396',
      'Outcome': 'Suspended',
      'Timestamp': '2026-04-13T14:28:44Z · 2:28 PM Apr 13',
      'Category': 'Vendor Action',
      'Event Type': 'Vendor Suspended',
      'Trigger': '3 flags in 30 days — auto-escalated',
      'Decision note': '3 no-shows in 30 days. Pattern of unresponsive behavior flagged by 2 PMs.',
      'Vendor status': 'Suspended — removed from all dispatch pools',
      'Session': 'Verified · IP [redacted]',
    },
  },
  {
    id: 'EVT-002395', severity: 'high', org: 'Coastal STR', category: 'dispute', actorType: 'admin',
    time: '1:42 PM', date: 'Apr 13',
    chip: 'resolved', chipLabel: 'Dispute Resolved',
    actor: 'Sarah Chen', actorRole: 'Admin',
    target: 'D-892', targetRole: 'Dispute',
    summary: 'Vendor position supported · $280 · HVAC filter',
    session: 'Admin',
    detail: {
      'Event ID': 'EVT-002395',
      'Outcome': 'Vendor position supported',
      'Timestamp': '2026-04-13T13:42:08Z · 1:42 PM Apr 13',
      'Category': 'Dispute',
      'Event Type': 'Dispute Resolved',
      'Dispute ID': 'D-892',
      'Resolution': 'Vendor position supported',
      'Financial outcome': 'Payment adjustment recommended — $280 to vendor',
      'Decision note': 'Photos confirm HVAC filter replacement completed as specified.',
      'Session': 'Verified · IP [redacted]',
    },
  },
  {
    id: 'EVT-002394', severity: 'high', org: 'SunState Rentals', category: 'compliance', actorType: 'admin',
    time: '12:18 PM', date: 'Apr 13',
    chip: 'rejected', chipLabel: 'Doc Rejected',
    actor: 'Sarah Chen', actorRole: 'Admin',
    target: 'Chris Nakamura', targetRole: 'Vendor',
    summary: 'License expired Mar 15, 2026 · Re-upload required',
    session: 'Admin',
    detail: {
      'Event ID': 'EVT-002394',
      'Outcome': 'Rejected',
      'Timestamp': '2026-04-13T12:18:03Z · 12:18 PM Apr 13',
      'Category': 'Compliance',
      'Event Type': 'Document Rejected',
      'Document': 'Electrician License',
      'Issue': 'Expired Mar 15, 2026 (29 days ago)',
      'Auto-validation': 'Failed — expiry date in past',
      'Decision note': 'License expired March 15. Vendor blocked until renewed license uploaded.',
      'Vendor status': 'Blocked — pending re-upload',
      'Session': 'Verified · IP [redacted]',
    },
  },
  {
    id: 'EVT-002393', severity: 'critical', org: 'Blue Wave Hospitality', category: 'flag', actorType: 'system',
    time: '11:00 AM', date: 'Apr 13',
    chip: 'flagged', chipLabel: 'Auto-Escalated',
    actor: 'System', actorRole: 'Automated',
    target: 'Jake Morris', targetRole: 'Vendor',
    summary: '3rd flag threshold reached · Escalated for review',
    session: 'System',
    detail: {
      'Event ID': 'EVT-002393',
      'Outcome': 'Escalated',
      'Timestamp': '2026-04-13T11:00:00Z · 11:00 AM Apr 13',
      'Category': 'Flag',
      'Event Type': 'System Auto-Escalation',
      'Trigger': '3 flags in 30 days — threshold reached',
      'Flags': 'No-show (Apr 13) · Late arrival (Apr 6) · No-show (Mar 29)',
      'Action': 'Escalated to admin review queue',
      'Session': 'System · automated',
    },
  },
  {
    id: 'EVT-002392', severity: 'info', org: 'Platform', category: 'system', actorType: 'system',
    time: '11:03 AM', date: 'Apr 13',
    chip: 'system', chipLabel: 'Payout Recorded',
    actor: 'System', actorRole: 'Automated',
    target: 'Marcus Reed', targetRole: 'Vendor',
    summary: 'Job #4519 · $450 · Pool pump replacement',
    session: 'System',
    detail: {
      'Event ID': 'EVT-002392',
      'Outcome': 'Recorded',
      'Timestamp': '2026-04-13T11:03:42Z · 11:03 AM Apr 13',
      'Category': 'Financial (Reported)',
      'Event Type': 'Payout Recorded (PM-reported)',
      'Job ID': '#4519',
      'Amount': '$450.00',
      'Service': 'Pool pump replacement',
      'PM Approval': 'Linda Torres — Apr 13, 10:58 AM',
      'Note': 'Payout recorded for audit trail. Payment processed by PM outside platform.',
      'Session': 'System · automated',
    },
  },
  {
    id: 'EVT-002391', severity: 'medium', org: 'Coastal STR', category: 'vendor', actorType: 'admin',
    time: '4:15 PM', date: 'Apr 12',
    chip: 'warned', chipLabel: 'Warning Issued',
    actor: 'Sarah Chen', actorRole: 'Admin',
    target: 'Rachel Kim', targetRole: 'Vendor',
    summary: 'Late arrival (30 min) · First-time · Vendor remains active',
    session: 'Admin',
    detail: {
      'Event ID': 'EVT-002391',
      'Outcome': 'Warning issued',
      'Timestamp': '2026-04-12T16:15:22Z · 4:15 PM Apr 12',
      'Category': 'Vendor Action',
      'Event Type': 'Warning Issued',
      'Trigger': 'Late arrival flag — Job #4488',
      'Decision note': 'First-time late arrival (30 min). Valid traffic incident documentation provided.',
      'Vendor status': 'Active — warning on record',
      'Session': 'Verified · IP [redacted]',
    },
  },
  {
    id: 'EVT-002390', severity: 'medium', org: 'SunState Rentals', category: 'flag', actorType: 'pm',
    time: '3:00 PM', date: 'Apr 12',
    chip: 'flagged', chipLabel: 'Vendor Flagged',
    actor: 'Sarah Kim', actorRole: 'PM',
    target: 'David Liu', targetRole: 'Vendor',
    summary: 'Quality issue · Uneven mowing · Job #4518',
    session: 'PM',
    detail: {
      'Event ID': 'EVT-002390',
      'Outcome': 'Flagged',
      'Timestamp': '2026-04-12T15:00:00Z · 3:00 PM Apr 12',
      'Category': 'Flag',
      'Event Type': 'Vendor Flagged by PM',
      'Job ID': '#4518',
      'Flag type': 'Quality issue',
      'PM note': 'Uneven mowing patches along east fence line.',
      'Session': 'Verified · IP [redacted]',
    },
  },
  {
    id: 'EVT-002389', severity: 'info', org: 'Platform', category: 'compliance', actorType: 'admin',
    time: '3:22 PM', date: 'Apr 11',
    chip: 'approved', chipLabel: 'Doc Approved',
    actor: 'Michael Torres', actorRole: 'Admin',
    target: 'Lisa Wong', targetRole: 'Vendor',
    summary: 'COI approved · Exp Dec 2026 · $1M coverage',
    session: 'Admin',
    detail: {
      'Event ID': 'EVT-002389',
      'Outcome': 'Approved',
      'Timestamp': '2026-04-11T15:22:41Z · 3:22 PM Apr 11',
      'Category': 'Compliance',
      'Event Type': 'Document Approved',
      'Document': 'Certificate of Insurance (COI)',
      'Coverage': '$1,000,000 General Liability',
      'Expiry': 'Dec 2026',
      'Decision note': 'All requirements met. Clean underwriting history.',
      'Session': 'Verified · IP [redacted]',
    },
  },
  {
    id: 'EVT-002388', severity: 'medium', org: 'Coastal STR', category: 'dispute', actorType: 'pm',
    time: '9:02 AM', date: 'Apr 12',
    chip: 'disputed', chipLabel: 'Dispute Opened',
    actor: 'Linda Torres', actorRole: 'PM',
    target: 'D-893', targetRole: 'Dispute',
    summary: 'Payment dispute · Job #4520 · $280 · HVAC filter',
    session: 'PM',
    detail: {
      'Event ID': 'EVT-002388',
      'Outcome': 'Dispute opened',
      'Timestamp': '2026-04-12T09:02:00Z · 9:02 AM Apr 12',
      'Category': 'Dispute',
      'Event Type': 'Dispute Opened',
      'Dispute ID': 'D-893',
      'Job ID': '#4520',
      'Amount': '$280',
      'Reason': 'Wrong filter installed — MERV 8 vs MERV 13 specified',
      'Session': 'Verified · IP [redacted]',
    },
  },
];

export const SAVED_VIEWS: { key: string; label: string; tone: 'red'|'gold'|'default' }[] = [
  { key: 'critical',   label: 'Critical Events',    tone: 'red' },
  { key: 'billing',    label: 'Billing',            tone: 'default' },
  { key: 'compliance', label: 'Compliance',         tone: 'default' },
  { key: 'security',   label: 'Security',           tone: 'default' },
  { key: 'mine',       label: 'My Investigations',  tone: 'gold' },
];

export function categoryTimeline(cat: Category): string {
  if (cat === 'compliance') return 'Document uploaded → System validation → Admin review → Decision';
  if (cat === 'dispute')    return 'Job completed → PM dispute opened → Evidence submitted → Admin decision';
  if (cat === 'vendor')     return 'Flags accumulated → Auto-escalation → Admin review → Action taken';
  if (cat === 'flag')       return 'Event detected → System alert → Admin notified';
  if (cat === 'system')     return 'Event triggered → Logged → Audit recorded';
  return 'Event triggered → Logged → Audit recorded';
}