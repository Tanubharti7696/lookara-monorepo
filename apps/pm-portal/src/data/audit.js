// src/data/audit.js

export const EVENTS = [
  {
    id: 'EVT-8841', sev: 'critical', date: 'Feb 25', age: '2h ago',
    title: 'Task Escalated — SLA Breach',
    prop: '345 Henry St · Brooklyn', actor: 'Autopilot OS', domain: 'Tasks',
    headline: 'A cleaning task missed its SLA window and was automatically escalated. PM review required.',
    fields: [
      { label: 'Task',         val: 'T-1283 · Deep Cleaning' },
      { label: 'SLA Window',   val: '2 hours' },
      { label: 'Time Elapsed', val: '3h 14m',    flag: 'bad' },
      { label: 'Status',       val: 'Escalated', flag: 'bad' },
    ],
    links: [{ label: 'Open Task →', target: 'T-1283' }],
    timeline: [
      { sev: 'critical', action: 'SLA breached — task escalated automatically', meta: 'Autopilot OS · Feb 25, 9:30 AM' },
      { sev: 'info',     action: 'Vendor dispatched — BK Cleaning Pro',           meta: 'Autopilot OS · Feb 25, 7:05 AM' },
      { sev: 'info',     action: 'Task created',                                  meta: 'Sarah Chen · Feb 25, 7:00 AM' },
    ],
    tech: { actor: 'Autopilot OS', action: 'Escalated', object: 'Task T-1283', domain: 'Tasks', result: 'Success', hash: 'a3f9b2c1d4e5f6a7b8c9d0e1f2a3b4c5' },
  },
  {
    id: 'EVT-8840', sev: 'critical', date: 'Feb 25', age: '3h ago',
    title: 'Access Code Revealed — Lockbox',
    prop: '345 Henry St · Brooklyn', actor: 'Sarah Chen (PM)', domain: 'Access',
    headline: 'A lockbox code was revealed after re-authentication. This action is permanently recorded and cannot be modified.',
    fields: [
      { label: 'Access Type', val: 'Lockbox · Front door' },
      { label: 'Revealed By', val: 'Sarah Chen (PM)' },
      { label: 'Re-auth',     val: 'Confirmed ✓', flag: 'good' },
      { label: 'Record',      val: 'Immutable',   flag: 'good' },
    ],
    links: [{ label: 'Open Property →', target: '345 Henry St' }],
    timeline: [
      { sev: 'critical', action: 'Lockbox code revealed',      meta: 'Sarah Chen · Feb 25, 8:14 AM' },
      { sev: 'info',     action: 'Re-authentication confirmed', meta: 'System · Feb 25, 8:13 AM' },
    ],
    tech: { actor: 'Sarah Chen (PM)', action: 'Accessed', object: 'Lockbox Code', domain: 'Access', result: 'Success', hash: 'b7e4d6a2c1f0e9b8a7d6c5b4a3f2e1d0' },
  },
  {
    id: 'EVT-8839', sev: 'attention', date: 'Feb 25', age: '4h ago',
    title: 'Vendor Exceeded Approved NTE',
    prop: 'Park Slope Loft · Brooklyn', actor: 'Metro HVAC', domain: 'Finance',
    headline: 'Metro HVAC submitted a quote for $340. The approved NTE is $280. PM review required before work can proceed.',
    fields: [
      { label: 'Quote Submitted', val: '$340', flag: 'bad' },
      { label: 'Approved NTE',    val: '$280' },
      { label: 'Variance',        val: '+$60 over limit', flag: 'bad' },
      { label: 'Next Step',       val: 'PM approval required' },
    ],
    links: [
      { label: 'Open Task →',   target: 'WO-892' },
      { label: 'Open Vendor →', target: 'Metro HVAC' },
    ],
    timeline: [
      { sev: 'attention', action: 'Quote submitted — $340 (NTE: $280)', meta: 'Metro HVAC · Feb 25, 7:55 AM' },
      { sev: 'info',      action: 'PM notified for review',              meta: 'System · Feb 25, 7:55 AM' },
    ],
    tech: { actor: 'Metro HVAC (Vendor)', action: 'Updated', object: 'Work Order WO-892', domain: 'Finance', result: 'Flagged', hash: 'c2a8f1b4d3e6c7a0b9f8e7d6c5a4b3f2' },
  },
  {
    id: 'EVT-8838', sev: 'info', date: 'Feb 25', age: '5h ago',
    title: 'Compliance Certificate Uploaded',
    prop: 'Brooklyn Heights · Brooklyn', actor: 'Sarah Chen (PM)', domain: 'Compliance',
    headline: 'A fire safety certificate was uploaded and the compliance status for this property is now Current.',
    fields: [
      { label: 'Certificate', val: 'Fire Safety 2026' },
      { label: 'Valid Until', val: 'Feb 2027',           flag: 'good' },
      { label: 'Status',      val: 'Compliance → Current', flag: 'good' },
      { label: 'Uploaded By', val: 'Sarah Chen (PM)' },
    ],
    links: [{ label: 'Open Property →', target: 'Brooklyn Heights' }],
    timeline: [
      { sev: 'info', action: 'Certificate uploaded — Fire Safety 2026', meta: 'Sarah Chen · Feb 25, 7:02 AM' },
      { sev: 'info', action: 'Compliance status updated to Current',    meta: 'System · Feb 25, 7:02 AM' },
    ],
    tech: { actor: 'Sarah Chen (PM)', action: 'Created', object: 'Fire Safety Cert 2026', domain: 'Compliance', result: 'Success', hash: 'd5b3e2a1c8f7d6e5b4a3c2f1e0d9c8b7' },
  },
  {
    id: 'EVT-8837', sev: 'attention', date: 'Feb 24', age: '15h ago',
    title: 'Vendor Dispatch Failed — No Response',
    prop: 'Austin House · Austin', actor: 'Autopilot OS', domain: 'Vendors',
    headline: 'The system attempted to dispatch a plumbing vendor but received no response within 30 minutes. A fallback search was triggered automatically.',
    fields: [
      { label: 'Task',             val: 'T-1279 · Plumbing Repair' },
      { label: 'Vendor Contacted', val: 'NYC Plumbing Experts' },
      { label: 'Response',         val: 'No response — timeout', flag: 'bad' },
      { label: 'Fallback',         val: 'Initiated automatically' },
    ],
    links: [
      { label: 'Open Task →',   target: 'T-1279' },
      { label: 'Open Vendor →', target: 'NYC Plumbing Experts' },
    ],
    timeline: [
      { sev: 'attention', action: 'Dispatch attempt failed — no response after 30 min', meta: 'Autopilot OS · Feb 24, 6:45 PM' },
      { sev: 'info',      action: 'Fallback vendor search initiated',                     meta: 'System · Feb 24, 6:46 PM' },
    ],
    tech: { actor: 'Autopilot OS', action: 'Dispatched', object: 'Task T-1279', domain: 'Vendors', result: 'Failed', hash: 'e1c9a7b5f3d1e9c7a5b3f1d9e7c5a3b1' },
  },
  {
    id: 'EVT-8836', sev: 'info', date: 'Feb 24', age: '17h ago',
    title: 'Task Completed — Verification Pending',
    prop: 'Chelsea Studio · Manhattan', actor: 'BK Cleaning Pro', domain: 'Tasks',
    headline: 'BK Cleaning Pro marked the turnover cleaning complete and submitted 4 photos as evidence. Awaiting PM sign-off.',
    fields: [
      { label: 'Task',             val: 'T-1276 · Turnover Cleaning' },
      { label: 'Photos Submitted', val: '4 photos', flag: 'good' },
      { label: 'Duration',         val: '1h 42m' },
      { label: 'Status',           val: 'Awaiting PM sign-off' },
    ],
    links: [
      { label: 'Open Task →',   target: 'T-1276' },
      { label: 'Open Vendor →', target: 'BK Cleaning Pro' },
    ],
    timeline: [
      { sev: 'info', action: 'Task marked complete with 4 photos', meta: 'BK Cleaning Pro · Feb 24, 4:20 PM' },
      { sev: 'info', action: 'PM review triggered',                 meta: 'System · Feb 24, 4:20 PM' },
    ],
    tech: { actor: 'BK Cleaning Pro (Vendor)', action: 'Completed', object: 'Task T-1276', domain: 'Tasks', result: 'Success', hash: 'f4d2b0e8c6a4f2d0b8e6c4a2f0d8c6a4' },
  },
  {
    id: 'EVT-8835', sev: 'critical', date: 'Feb 24', age: '19h ago',
    title: 'Incident Reported — Water Leak',
    prop: 'Austin House · Austin', actor: 'Sarah Chen (PM)', domain: 'Incidents',
    headline: 'An active water leak was reported at Austin House. The property is currently offline. Emergency vendor dispatch is in progress.',
    fields: [
      { label: 'Incident',        val: 'INC-043 · Water Leak' },
      { label: 'Property Status', val: 'Offline', flag: 'bad' },
      { label: 'Emergency Vendor',val: 'Searching…', flag: 'warn' },
      { label: 'Action Required', val: 'PM monitoring' },
    ],
    links: [{ label: 'Open Property →', target: 'Austin House' }],
    timeline: [
      { sev: 'critical',  action: 'Incident created — Water leak (active)', meta: 'Sarah Chen · Feb 24, 2:10 PM' },
      { sev: 'attention', action: 'Emergency vendor search started',         meta: 'Autopilot OS · Feb 24, 2:11 PM' },
    ],
    tech: { actor: 'Sarah Chen (PM)', action: 'Created', object: 'Incident INC-043', domain: 'Incidents', result: 'Success', hash: 'a9c7e5b3f1d9a7c5e3b1f9d7a5c3e1b9' },
  },
  {
    id: 'EVT-8834', sev: 'info', date: 'Feb 24', age: '22h ago',
    title: 'Property SLA Settings Updated',
    prop: '345 Henry St · Brooklyn', actor: 'Sarah Chen (PM)', domain: 'Properties',
    headline: 'The cleaning SLA window for this property was tightened from 4 hours to 2 hours. Takes effect immediately.',
    fields: [
      { label: 'Setting',   val: 'Cleaning SLA' },
      { label: 'Previous',  val: '4 hours' },
      { label: 'New Value', val: '2 hours', flag: 'good' },
      { label: 'Effective', val: 'Immediately' },
    ],
    links: [{ label: 'Open Property →', target: '345 Henry St' }],
    timeline: [
      { sev: 'info', action: 'SLA updated: Cleaning 4h → 2h', meta: 'Sarah Chen · Feb 24, 11:30 AM' },
    ],
    tech: { actor: 'Sarah Chen (PM)', action: 'Updated', object: 'Property Settings', domain: 'Properties', result: 'Success', hash: 'b6e4c2a0f8d6b4e2c0a8f6d4b2e0c8a6' },
  },
  {
    id: 'EVT-8833', sev: 'attention', date: 'Feb 23', age: '1d ago',
    title: 'COI Expiring in 14 Days',
    prop: 'Park Slope Loft · Brooklyn', actor: 'System', domain: 'Compliance',
    headline: "Metro HVAC's Certificate of Insurance expires in 14 days. Work orders for this vendor will be automatically blocked if not renewed.",
    fields: [
      { label: 'Vendor',   val: 'Metro HVAC' },
      { label: 'Document', val: 'Certificate of Insurance' },
      { label: 'Expires',  val: 'Mar 9, 2026', flag: 'bad' },
      { label: 'Impact',   val: 'Work orders blocked', flag: 'bad' },
    ],
    links: [{ label: 'Open Vendor →', target: 'Metro HVAC' }],
    timeline: [
      { sev: 'attention', action: 'COI expiry alert — 14 days remaining', meta: 'System · Feb 23, 5:15 PM' },
      { sev: 'info',      action: 'PM notified via Alerts',                meta: 'System · Feb 23, 5:15 PM' },
    ],
    tech: { actor: 'System', action: 'Updated', object: 'COI — Metro HVAC', domain: 'Compliance', result: 'Flagged', hash: 'd8f6c4a2e0b8f6d4c2a0e8b6f4d2c0a8' },
  },
  {
    id: 'EVT-8832', sev: 'info', date: 'Feb 23', age: '1d ago',
    title: 'Report Exported',
    prop: 'All Properties', actor: 'Sarah Chen (PM)', domain: 'System',
    headline: 'A monthly compliance report was exported as a 14-page PDF.',
    fields: [
      { label: 'Report',      val: 'Compliance · Feb 2026' },
      { label: 'Format',      val: 'PDF · 14 pages' },
      { label: 'Exported By', val: 'Sarah Chen (PM)' },
      { label: 'Properties',  val: 'All (12)' },
    ],
    links: [],
    timeline: [
      { sev: 'info', action: 'Report exported as PDF — 14 pages', meta: 'Sarah Chen · Feb 23, 9:00 AM' },
    ],
    tech: { actor: 'Sarah Chen (PM)', action: 'Exported', object: 'Compliance Report Feb 2026', domain: 'System', result: 'Success', hash: 'c3a1f9d7b5e3c1a9f7d5b3e1c9a7f5d3' },
  },
];

/* ────────── Counts (always over full set) ────────── */
export function getCounts() {
  return {
    all:       EVENTS.length,
    critical:  EVENTS.filter(e => e.sev === 'critical').length,
    attention: EVENTS.filter(e => e.sev === 'attention').length,
  };
}

/* ────────── Shared filter ────────── */
export function filterEvents(events, { sev, query }) {
  const q = (query || '').trim().toLowerCase();
  return events.filter(ev => {
    if (sev && sev !== 'all' && ev.sev !== sev) return false;
    if (!q) return true;
    const haystack = [
      ev.title, ev.prop, ev.actor, ev.domain, ev.id,
      ...(ev.fields || []).map(f => f.val),
    ];
    return haystack.some(f => f && f.toLowerCase().includes(q));
  });
}

/* ────────── Group by day ────────── */
export function groupByDate(events) {
  return events.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});
}

/* ────────── Severity meta ────────── */
export const SEV_META = {
  critical:  { color: 'var(--crimson)',  label: '● Critical',  textCls: 'critical' },
  attention: { color: 'var(--amber)',    label: '● Attention', textCls: 'attention' },
  info:      { color: 'var(--text-2)',   label: '● Info',      textCls: 'info' },
};