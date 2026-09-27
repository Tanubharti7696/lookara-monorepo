// src/data/settings.js

export const SETTINGS_CATEGORIES = [
  { key: 'profile',              label: 'Profile' },
  { key: 'account',              label: 'Account' },
  { key: 'notifications',        label: 'Notifications' },
  { key: 'preferences',          label: 'Preferences' },
  { key: 'team',                 label: 'Team' },
  { key: 'integrations',         label: 'Integrations' },
  { key: 'security',             label: 'Security' },
  { key: 'reports',              label: 'Scheduled Reports' },
  { key: 'complianceTemplates',  label: 'Compliance Templates' },
  { key: 'slaTemplates',         label: 'SLA Templates' },
];

export const NOTIFICATION_ROWS = [
  { key: 'emergencies',  icon: '🚨', label: 'Emergencies',        sub: 'Critical property alerts',    inapp: true, email: true, push: true, sms: true, locked: true },
  { key: 'tasks',        icon: '✓',  label: 'Task Updates',       sub: 'Status changes, completions', inapp: true, email: true, push: false, sms: false },
  { key: 'compliance',   icon: '⚖️', label: 'Compliance Deadlines',sub: 'Licenses, permits, inspections', inapp: true, email: true, push: true, sms: false },
  { key: 'vendor',       icon: '👥', label: 'Vendor Actions',     sub: 'Assignments, arrivals, completions', inapp: true, email: false, push: false, sms: false },
  { key: 'billing',      icon: '💳', label: 'Billing & Payments', sub: 'Invoices, failed payments',   inapp: true, email: true, push: false, sms: false },
  { key: 'reports',      icon: '📊', label: 'Reports',            sub: 'Scheduled reports ready',     inapp: true, email: true, push: false, sms: false },
  { key: 'system',       icon: '🔔', label: 'System Updates',     sub: 'New features, maintenance',   inapp: true, email: false, push: false, sms: false },
];

export const TEAM_MEMBERS = [
  { id: 'u1', name: 'Sarah', email: 'sarah@example.com', role: 'Manager', scope: 'Portfolio: NYC' },
  { id: 'u2', name: 'Mike',  email: 'mike@example.com',  role: 'Manager', scope: 'Portfolio: Miami' },
  { id: 'u3', name: 'Alex',  email: 'alex@example.com',  role: 'Viewer',  scope: 'All properties' },
];

export const ROLE_MATRIX = [
  { capability: 'View properties',           viewer: true,  manager: true,  portfolioAdmin: true,  admin: true },
  { capability: 'Manage tasks',              viewer: false, manager: true,  portfolioAdmin: true,  admin: true },
  { capability: 'Manage vendors',            viewer: false, manager: true,  portfolioAdmin: true,  admin: true },
  { capability: 'Add / remove properties',   viewer: false, manager: false, portfolioAdmin: true,  admin: true },
  { capability: 'Billing access',            viewer: false, manager: false, portfolioAdmin: false, admin: true },
  { capability: 'Admin overrides',           viewer: false, manager: false, portfolioAdmin: 'LIMITED', admin: true },
];

export const INTEGRATIONS_ACTIVE = [
  { key: 'airbnb',     name: 'Airbnb',          sub: 'Listings, reservations, messages', status: 'active',  connected: '2 days ago', sync: 'Every 5 min',  cta: 'Manage' },
  { key: 'quickbooks', name: 'QuickBooks',      sub: 'Accounting, expenses, invoices',   status: 'active',  connected: '5 hours ago', sync: 'Daily at 2am', cta: 'Manage' },
  { key: 'stripe',     name: 'Stripe',          sub: 'Payments, subscriptions',           status: 'active',  connected: '1 hour ago',  sync: 'Real-time',    cta: 'Manage' },
  { key: 'gcal',       name: 'Google Calendar', sub: 'Events, scheduling',                status: 'warning', connected: '7 days ago',  sync: 'Hourly',       cta: 'Reconnect' },
];

export const INTEGRATIONS_AVAILABLE = [
  { key: 'vrbo',    name: 'Vrbo',        sub: 'Sync listings and reservations' },
  { key: 'booking', name: 'Booking.com', sub: 'Channel management' },
  { key: 'zapier',  name: 'Zapier',      sub: 'Automate workflows' },
  { key: 'slack',   name: 'Slack',       sub: 'Team notifications' },
  { key: 'xero',    name: 'Xero',        sub: 'Accounting integration' },
  { key: 'twilio',  name: 'Twilio',      sub: 'SMS messaging' },
];

export const SESSIONS = [
  { id: 's1', device: '💻 Chrome on MacOS',  ip: '192.168.1.105', location: 'New York, NY',  lastActive: 'Current',    isCurrent: true },
  { id: 's2', device: '📱 Safari on iPhone', ip: '10.0.0.23',      location: 'New York, NY',  lastActive: '2 hours ago' },
  { id: 's3', device: '💻 Firefox on Windows', ip: '73.45.123.89', location: 'Miami, FL',     lastActive: '3 days ago' },
];

export const SECURITY_EVENTS = [
  { icon: '✓', text: 'Login successful from Chrome on MacOS',      time: '2 hours ago', tone: 'ok' },
  { icon: '✓', text: '2FA verified via authenticator app',          time: '2 hours ago', tone: 'ok' },
  { icon: '✓', text: 'Password changed successfully',                time: '45 days ago', tone: 'ok' },
  { icon: '⚠️', text: 'Failed login attempt from unknown IP',        time: '3 days ago',  tone: 'warn' },
];

export const SCHEDULED_REPORTS = [
  { key: 'pl',         name: 'P&L Summary',              sub: 'Revenue, expenses, net income',  frequency: 'Weekly Mon', recipients: '3 recipients', nextRun: 'Mon, 9:00 AM',  enabled: true },
  { key: 'occupancy',  name: 'Occupancy Report',         sub: 'Bookings, vacancy rates, ADR',   frequency: 'Daily',      recipients: '5 recipients', nextRun: 'Tomorrow, 8:00 AM', enabled: true },
  { key: 'tasks',      name: 'Task Completion Summary',  sub: 'Completed, pending, overdue',    frequency: 'Weekly Fri', recipients: '2 recipients', nextRun: 'Fri, 5:00 PM',  enabled: true },
  { key: 'compliance', name: 'Compliance Dashboard',     sub: 'Licenses, permits, deadlines',   frequency: 'Monthly 1st',recipients: '4 recipients', nextRun: 'Feb 1, 9:00 AM', enabled: false },
];

export const REPORT_TEMPLATES = [
  { key: 'financial',   icon: '💰', name: 'Financial Performance', sub: 'Revenue, expenses, margins',       formats: 'PDF, Excel, CSV' },
  { key: 'property',    icon: '🏠', name: 'Property Performance',  sub: 'Occupancy, ADR, RevPAR',           formats: 'PDF, Excel' },
  { key: 'vendor',      icon: '👥', name: 'Vendor Performance',    sub: 'Response time, completion rate',   formats: 'PDF, Excel' },
  { key: 'guest',       icon: '📊', name: 'Guest Analytics',       sub: 'Reviews, ratings, demographics',   formats: 'PDF, Excel' },
  { key: 'maintenance', icon: '🔧', name: 'Maintenance Log',       sub: 'Work orders, costs, frequency',    formats: 'PDF, Excel, CSV' },
  { key: 'custom',      icon: '⚙️', name: 'Custom Report',         sub: 'Build your own report',            formats: 'All' },
];

export const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia'];

export const TIMEZONES = ['Eastern (ET)', 'Central (CT)', 'Mountain (MT)', 'Pacific (PT)'];

export const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

export const TIME_FORMATS = ['12-hour (AM/PM)', '24-hour'];

export const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)'];

export const LANGUAGE_OPTIONS = ['English (US)', 'English (UK)', 'Spanish', 'French'];

export const PROPERTY_TYPE_OPTIONS = ['Entire Apartment', 'House', 'Condo', 'Studio'];