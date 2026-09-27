// src/data/settingsData.js

export const CT_TEMPLATES = [
  { id: 'nyc-str',  name: 'NYC STR Compliance',  jurisdiction: 'New York City',   reqs: 8, applied: 4, status: 'active', cycle: 'Annual',    updated: 'Mar 1, 2026'  },
  { id: 'la-str',   name: 'LA County STR',        jurisdiction: 'Los Angeles',     reqs: 6, applied: 2, status: 'active', cycle: 'Annual',    updated: 'Feb 12, 2026' },
  { id: 'ca-state', name: 'California Statewide', jurisdiction: 'California',      reqs: 5, applied: 0, status: 'draft',  cycle: 'Annual',    updated: 'Jan 28, 2026' },
  { id: 'tx-str',   name: 'Texas STR',            jurisdiction: 'Texas',           reqs: 4, applied: 1, status: 'active', cycle: 'Semi-annual', updated: 'Jan 5, 2026' },
  { id: 'chi-str',  name: 'Chicago STR',          jurisdiction: 'Chicago',         reqs: 3, applied: 0, status: 'draft',  cycle: 'Annual',    updated: 'Dec 18, 2025' },
  { id: 'fl-str',   name: 'Florida STR',          jurisdiction: 'Florida',         reqs: 7, applied: 0, status: 'archived', cycle: 'Annual',  updated: 'Nov 2, 2025'  },
];

export const NOTIFICATION_EVENTS = [
  { key: 'compliance-overdue', label: 'Compliance overdue',     sub: 'A requirement passes its due date',  default: { email: true,  sms: true,  push: true  } },
  { key: 'compliance-due',     label: 'Compliance due soon',    sub: '30 days before a due date',          default: { email: true,  sms: false, push: true  } },
  { key: 'new-work-order',     label: 'New work order',         sub: 'Assigned to you or your team',       default: { email: true,  sms: true,  push: true  } },
  { key: 'wo-completed',       label: 'Work order completed',   sub: 'A WO you created is closed',         default: { email: true,  sms: false, push: false } },
  { key: 'inspection-failed',  label: 'Inspection failed',      sub: 'Inspection result marked fail',      default: { email: true,  sms: true,  push: true  } },
  { key: 'payment-received',   label: 'Payment received',       sub: 'Rent / invoice payment lands',       default: { email: false, sms: false, push: false } },
  { key: 'new-message',        label: 'New guest message',      sub: 'Message on a managed property',      default: { email: false, sms: false, push: true  } },
  { key: 'weekly-digest',      label: 'Weekly digest',          sub: 'Monday summary of activity',         default: { email: true,  sms: false, push: false } },
];

export const TEAM_MEMBERS = [
  { id: 1, name: 'David Reyes',    email: 'david@lookara.com',    role: 'Owner',     lastActive: '2 min ago',   status: 'active',   avatar: 'DR' },
  { id: 2, name: 'Sarah Kim',      email: 'sarah@lookara.com',    role: 'Admin',     lastActive: '1 hour ago',  status: 'active',   avatar: 'SK' },
  { id: 3, name: 'Marcus Webb',    email: 'marcus@lookara.com',   role: 'Manager',   lastActive: '3 hours ago', status: 'active',   avatar: 'MW' },
  { id: 4, name: 'Priya Patel',    email: 'priya@lookara.com',    role: 'Manager',   lastActive: 'Yesterday',   status: 'active',   avatar: 'PP' },
  { id: 5, name: 'Tom Nguyen',     email: 'tom@lookara.com',      role: 'Technician', lastActive: '2 days ago', status: 'active',   avatar: 'TN' },
  { id: 6, name: 'Ana Lopez',      email: 'ana@lookara.com',      role: 'Viewer',    lastActive: '2 weeks ago', status: 'invited',  avatar: 'AL' },
];

export const INTEGRATIONS = [
  { id: 'stripe',   name: 'Stripe',           desc: 'Payment processing for rent and invoices',       status: 'connected',    icon: '💳', category: 'Payments'   },
  { id: 'qb',       name: 'QuickBooks',       desc: 'Two-way sync of invoices and expenses',          status: 'connected',    icon: '📗', category: 'Accounting' },
  { id: 'brevo',    name: 'Brevo',            desc: 'Email + SMS notifications and templates',        status: 'connected',    icon: '✉️', category: 'Messaging'  },
  { id: 'twilio',   name: 'Twilio',           desc: 'SMS gateway for guest and tenant messaging',     status: 'disconnected', icon: '📱', category: 'Messaging'  },
  { id: 'gcal',     name: 'Google Calendar',  desc: 'Sync inspections and maintenance to calendar',   status: 'connected',    icon: '📅', category: 'Productivity' },
  { id: 'slack',    name: 'Slack',            desc: 'Post notifications to a Slack channel',          status: 'disconnected', icon: '💬', category: 'Productivity' },
  { id: 'hostaway', name: 'Hostaway',         desc: 'Import STR listings and booking data',           status: 'disconnected', icon: '🏠', category: 'Property'   },
  { id: 'pricelabs',name: 'PriceLabs',        desc: 'Dynamic pricing sync for STR properties',        status: 'disconnected', icon: '💹', category: 'Property'   },
];

export const ACTIVE_SESSIONS = [
  { id: 1, device: 'MacBook Pro · Chrome',   location: 'Lahore, PK',  ip: '103.22.***.14',  lastActive: 'Active now',   current: true  },
  { id: 2, device: 'iPhone 17 · Safari',     location: 'Lahore, PK',  ip: '103.22.***.14',  lastActive: '2 hours ago',  current: false },
  { id: 3, device: 'iPad Air · Safari',      location: 'Karachi, PK', ip: '39.45.***.87',   lastActive: 'Yesterday',    current: false },
];

export const SCHEDULED_REPORTS = [
  { id: 1, name: 'Weekly Ops Digest',       frequency: 'Weekly · Monday 8am',  recipients: ['david@lookara.com','sarah@lookara.com'],  format: 'PDF',  nextRun: 'Mar 9, 2026',  enabled: true  },
  { id: 2, name: 'Monthly Compliance Report', frequency: 'Monthly · 1st 9am',  recipients: ['david@lookara.com'],                     format: 'XLSX', nextRun: 'Apr 1, 2026',  enabled: true  },
  { id: 3, name: 'Financial Summary',         frequency: 'Monthly · 1st 8am',  recipients: ['david@lookara.com','finance@lookara.com'], format: 'PDF', nextRun: 'Apr 1, 2026',  enabled: true  },
  { id: 4, name: 'Property Performance',      frequency: 'Quarterly',          recipients: ['david@lookara.com'],                     format: 'PDF',  nextRun: 'Apr 1, 2026',  enabled: false },
  { id: 5, name: 'Occupancy Snapshot',        frequency: 'Daily · 7am',        recipients: ['ops@lookara.com'],                       format: 'CSV',  nextRun: 'Mar 5, 2026',  enabled: false },
];

export const SLA_TEMPLATES = [
  { id: 1, name: 'Emergency',       response: '15 min', resolution: '2 hours',  escalation: 'Every 15 min', color: 'crimson', tickets: 12 },
  { id: 2, name: 'Urgent',          response: '1 hour',  resolution: '8 hours',  escalation: 'Every 2 hrs',  color: 'amber',   tickets: 34 },
  { id: 3, name: 'Standard',        response: '4 hours', resolution: '24 hours', escalation: 'Once',         color: 'blue',    tickets: 187 },
  { id: 4, name: 'Low Priority',    response: '1 day',   resolution: '5 days',   escalation: 'Once',         color: 'muted',   tickets: 52 },
  { id: 5, name: 'Inspection',      response: '2 hours', resolution: '48 hours', escalation: 'Every 12 hrs', color: 'gold',    tickets: 41 },
];