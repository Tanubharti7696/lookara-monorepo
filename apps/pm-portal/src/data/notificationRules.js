// src/data/notificationRules.js

export const ADAPTIVE_SUGGESTIONS = [
  {
    id: 's1',
    title: 'Add SMS for high-priority work orders',
    detail: 'You receive email + push for new WOs, but 4 high-priority tickets in the last 30 days breached SLA before you opened them.',
    action: 'Add SMS channel',
    impact: 'Est. −42 min response time',
  },
  {
    id: 's2',
    title: 'Quiet hours 10pm – 7am',
    detail: '68% of your push notifications open between 7am and 10pm. Notifications fired overnight are rarely read.',
    action: 'Enable quiet hours',
    impact: 'Fewer interruptions',
  },
  {
    id: 's3',
    title: 'Escalate compliance overdue to manager',
    detail: '3 properties hit overdue this month with no escalation. Adding manager CC would route the alert to the responsible PM.',
    action: 'Add escalation rule',
    impact: 'Faster resolution',
  },
  {
    id: 's4',
    title: 'Reduce weekly digest frequency',
    detail: 'You open the Monday digest 12% of the time. Switching to bi-weekly would reduce inbox noise.',
    action: 'Switch to bi-weekly',
    impact: '25 fewer emails/year',
  },
];

export const RULE_PRESETS = {
  smart:  { label: 'Smart (Recommended)', detail: 'Rules auto-tune based on your engagement and team SLAs' },
  custom: { label: 'Custom',               detail: 'Full manual control over every channel and threshold' },
};

export const CHANNELS = [
  { key: 'email', label: 'Email',        icon: '✉️' },
  { key: 'sms',   label: 'SMS',          icon: '📱' },
  { key: 'push',  label: 'Push',         icon: '🔔' },
  { key: 'slack', label: 'Slack DM',     icon: '💬' },
];

export const EVENTS = [
  { key: 'compliance-overdue', label: 'Compliance overdue',     priority: 'critical' },
  { key: 'compliance-due',     label: 'Compliance due in N days', priority: 'high'   },
  { key: 'wo-created',         label: 'Work order created',     priority: 'medium'   },
  { key: 'wo-sla-warning',     label: 'Work order SLA warning', priority: 'high'     },
  { key: 'inspection-failed',  label: 'Inspection failed',      priority: 'critical' },
  { key: 'payment-received',   label: 'Payment received',       priority: 'low'      },
];

export const DEFAULT_THRESHOLDS = {
  daysBeforeDue:      30,
  slaWarningMinutes:  60,
  escalationDelayMin: 120,
  quietStart:         '22:00',
  quietEnd:           '07:00',
  digestDay:          'Monday',
};

export const DEFAULT_RULES = {
  'compliance-overdue': { email: true,  sms: true,  push: true,  slack: false },
  'compliance-due':     { email: true,  sms: false, push: true,  slack: false },
  'wo-created':         { email: true,  sms: true,  push: true,  slack: false },
  'wo-sla-warning':     { email: true,  sms: true,  push: true,  slack: true  },
  'inspection-failed':  { email: true,  sms: true,  push: true,  slack: true  },
  'payment-received':   { email: false, sms: false, push: false, slack: false },
};