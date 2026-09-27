// src/data/taskMeta.js

export const STATE_META = {
  pending:                { label: 'Pending',                  color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' },
  unassigned:             { label: 'Unassigned',               color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' },
  blocked:                { label: 'Blocked',                  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  escalated:              { label: 'Escalated',                color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  dispatching:            { label: 'Dispatching',              color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  dispatched:             { label: 'Dispatched',               color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  accepted:               { label: 'Accepted',                 color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'en-route':             { label: 'En Route',                 color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  'on-site':              { label: 'On Site',                  color: '#60A5FA', bg: 'rgba(96,165,250,0.18)' },
  'in-progress':          { label: 'In Progress',              color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'quote-pending':        { label: 'Quote Pending',            color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  'quote-rejected':       { label: 'Quote Rejected',           color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  approved:               { label: 'Approved',                 color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'assessment-dispatched':{ label: 'Assessment Dispatched',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  'assessment-accepted':  { label: 'Assessment Accepted',      color: '#60A5FA', bg: 'rgba(96,165,250,0.20)' },
  'verification-pending': { label: 'Verification Pending',     color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
  'awaiting-payment':     { label: 'Awaiting Payment',         color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
  'payment-disputed':     { label: 'Payment Disputed',         color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  'escalated-to-admin':   { label: 'Escalated to Admin',       color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  'pending-owner-approval':{ label: 'Pending Owner Approval',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'owner-clarification':  { label: 'Owner Clarification',      color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  'owner-rejected':       { label: 'Owner Rejected',           color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  'rework-required':      { label: 'Rework Required',          color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  'vendor-declined':      { label: 'Vendor Declined',          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  'resume-requested':     { label: 'Resume Requested',         color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  'payment-sent':         { label: 'Payment Sent',             color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'payment-confirmed':    { label: 'Payment Confirmed',        color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  completed:              { label: 'Completed',                color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
  closed:                 { label: 'Closed',                   color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
  cancelled:              { label: 'Cancelled',                color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  dismissed:              { label: 'Dismissed',                color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
  compliant:              { label: 'Compliant',                 color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  'non-compliant':        { label: 'Non-Compliant',             color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  overdue:                { label: 'Overdue',                   color: '#DC2626', bg: 'rgba(220,38,38,0.12)' },
  waived:                 { label: 'Waived',                    color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

export const SOURCE_LABELS = {
  incident:          { label: '🚨 Incident',    cls: 'incident' },
  manual_intake:     { label: '✍ Manual',       cls: 'manual' },
  calendar:          { label: '📅 Calendar',    cls: 'calendar' },
  recurring_service: { label: '🔁 Recurring',   cls: 'recurring' },
  compliance:        { label: '📋 Compliance',  cls: 'compliance' },
  automation:        { label: '⚙️ Automation', cls: 'automation' },
  emergency:         { label: '🚨 Emergency',   cls: 'incident' },
  manual:            { label: '✍ Manual',       cls: 'manual' },
};

export const SEVERITY_TO_STRIPE = {
  CRITICAL: 'critical',
  HIGH:     'high',
  MEDIUM:   'medium',
  NORMAL:   'normal',
  LOW:      'low',
};

export const SEVERITY_TO_PRIORITY = {
  CRITICAL: { cls: 'critical', label: 'CRITICAL' },
  HIGH:     { cls: 'high',     label: 'HIGH' },
  MEDIUM:   { cls: 'normal',   label: 'MEDIUM' },
  NORMAL:   { cls: 'normal',   label: 'NORMAL' },
  LOW:      { cls: 'low',      label: 'LOW' },
};

/* Archived states → History tab. Everything else lives in Active. */
export const ARCHIVE_STATES = new Set(['closed', 'cancelled', 'dismissed', 'payment-confirmed']);

/* Group routing — determines which group header a task falls under */
export const STATE_TO_GROUP = {
  unassigned: 'needs', blocked: 'needs', escalated: 'needs',
  'owner-rejected': 'needs', 'pending-owner-approval': 'needs',
  'owner-clarification': 'needs', 'rework-required': 'needs',
  'resume-requested': 'needs', 'vendor-declined': 'needs', 'quote-rejected': 'needs',

  dispatching: 'dispatch', dispatched: 'dispatch', accepted: 'dispatch',
  pending: 'dispatch', 'assessment-dispatched': 'dispatch', 'assessment-accepted': 'dispatch',

  'in-progress': 'active', 'en-route': 'active', 'on-site': 'active',

  'quote-pending': 'financial', 'awaiting-payment': 'financial',
  'payment-disputed': 'financial', 'escalated-to-admin': 'financial', approved: 'financial',

  'verification-pending': 'reviews', 'payment-sent': 'reviews',
  'payment-confirmed': 'reviews', closed: 'reviews', cancelled: 'reviews',
  dismissed: 'reviews', completed: 'reviews',
  compliant: 'terminal', 'non-compliant': 'terminal', overdue: 'blocked', waived: 'terminal',
};

export const GROUP_META = {
  needs:     { label: 'Needs Attention',        accent: '#DC2626' },
  dispatch:  { label: 'Dispatch & Assignment',  accent: '#60A5FA' },
  active:    { label: 'Active Work',            accent: '#22C55E' },
  financial: { label: 'Financial',              accent: '#A78BFA' },
  reviews:   { label: 'Reviews & Approvals',    accent: '#D4AF37' },
  terminal:  { label: 'Completed & Closed',     accent: '#6B7280' },
};

export function getNatureIcon(title = '') {
  const t = title.toLowerCase();
  if (/assessment|damage assessment/.test(t))               return '🔍';
  if (/plumbing|pipe|leak|water|drain|toilet|sink|bathroom/.test(t)) return '🔧';
  if (/hvac|ac filter|heating|cooling/.test(t))             return '❄️';
  if (/electrical|electric/.test(t))                        return '⚡';
  if (/clean|turnover|window/.test(t))                      return '🧹';
  if (/roof|balcony|pool|structural|resurfac|deck/.test(t)) return '🏗️';
  if (/payment|dispute|invoice/.test(t))                    return '💸';
  if (/compliance|coi|renewal|license|smoke|detector/.test(t)) return '📋';
  if (/tile|paint|cosmetic/.test(t))                        return '🖌️';
  if (/lock|security|access/.test(t))                       return '🔒';
  if (/inspection|inspect/.test(t))                         return '🔍';
  if (/dispatch|escalation/.test(t))                        return '⚙️';
  return '🔧';
}

/* KPI counter groupings */
export const COUNTER_MATCHERS = {
  overdue:            (t) => t.dueOverdue === true,
  'due-7':            (t) => t.dueSoon === true,
  unassigned:         (t) => t.state === 'unassigned' || (!t.vendor && ['needs', 'dispatch'].includes(t.group)),
  dispatched:         (t) => t.state === 'dispatched' || t.state === 'dispatching',
  'in-progress':      (t) => ['in-progress', 'en-route', 'on-site'].includes(t.state),
  'awaiting-payment': (t) => t.state === 'awaiting-payment',
};

/* Search keyword matchers (used by free-text search) */
export const SEARCH_KEYWORDS = {
  overdue:    (t) => t.dueOverdue === true,
  payment:    (t) => ['awaiting-payment', 'payment-disputed', 'payment-sent', 'payment-confirmed'].includes(t.state),
  blocked:    (t) => t.state === 'blocked',
  escalated:  (t) => t.state === 'escalated' || t.state === 'escalated-to-admin',
  unassigned: (t) => t.state === 'unassigned' || (!t.vendor && ['needs', 'dispatch'].includes(t.group)),
  vacant:     (t) => /vacant/i.test(t.occupancy || ''),
};
