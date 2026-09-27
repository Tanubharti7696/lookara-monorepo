// src/data/signals.js

export const SIGNAL_SECTIONS = [
  { key: 'critical',  label: 'Critical',           tone: 'crimson', defaultCollapsed: false },
  { key: 'attention', label: 'Attention',          tone: 'amber',   defaultCollapsed: false },
  { key: 'automated', label: 'Automated',          tone: 'success', defaultCollapsed: true, countSuffix: ' today' },
  { key: 'payment',   label: '💸 Payment Signals', tone: 'gold',    defaultCollapsed: false },
  { key: 'info',      label: 'FYI',                tone: 'slate',   defaultCollapsed: true },
];

export const SIGNAL_FILTER_TABS = [
  { key: 'all',       label: 'All',       dotColor: 'var(--text)' },
  { key: 'critical',  label: 'Critical',  dotColor: 'var(--crimson)',  matches: c => c.section === 'critical' },
  { key: 'attention', label: 'Attention', dotColor: 'var(--amber)',    matches: c => c.section === 'attention' },
  { key: 'automated', label: 'Automated', dotColor: 'var(--success)',  matches: c => c.section === 'automated' },
  { key: 'info',      label: 'FYI',       dotColor: 'var(--slate)',    matches: c => c.section === 'info' },
  { key: 'payment',   label: 'Payments',  dotColor: 'var(--gold)',     matches: c => c.section === 'payment' },
  { key: 'unread',    label: 'Unread',    dotColor: 'var(--gold)',     matches: c => c.unread === true },
];

/* ────────── Signal cards ────────── */
export const SIGNAL_CARDS = [
  /* ── CRITICAL ── */
  {
    id: 'sig-water-leak', section: 'critical', unread: true, icon: '🚰',
    property: '345 Henry St · Brooklyn', nickname: 'The Henry',
    event: 'Water Leak — Active Incident',
    context: 'Vendor ETA delayed 18m · Guest check-in in 2h · Auto-dispatch exhausted 2 vendors',
    riskTimer: '⏱ 1h 42m SLA remaining', riskLevel: 'urgent',
    whyKey: 'water-leak',
    actions: [
      { label: 'Open Incident',  style: 'primary',   action: { type: 'openTask', task: 'Emergency Plumbing - Burst Pipe' } },
      { label: 'Escalate Vendor', style: 'secondary', action: { type: 'openTask', task: 'Emergency Plumbing - Burst Pipe' } },
    ],
  },
  {
    id: 'sig-sla-breach', section: 'critical', unread: true, icon: '⚡',
    property: '789 5th Ave · Manhattan', nickname: '5th Ave Penthouse',
    event: 'SLA Breach Imminent — Toilet Repair',
    context: 'Dispatch failed · 2 vendors attempted (1 rejected, 1 ignored) · 45m until hard SLA breach',
    riskTimer: '⏱ 45m until breach', riskLevel: 'urgent',
    whyKey: 'sla-breach',
    actions: [
      { label: 'Assign Vendor', style: 'primary',   action: { type: 'openTask', task: 'Toilet Repair - Unit 4B' } },
      { label: 'Find Coverage', style: 'secondary', action: { type: 'devNote', label: 'Trade-Based Vendor Search' } },
    ],
  },
  {
    id: 'sig-compliance-fail', section: 'critical', unread: true, icon: '⚖️',
    property: '2210 Collins Ave · Miami Beach', nickname: null,
    event: 'Compliance Failure — License Expired',
    context: 'Short-term rental license expired 3 days ago · Active booking in 6h · Legal risk: HIGH',
    riskTimer: '⏱ Guest arrives 6h', riskLevel: 'urgent',
    whyKey: 'compliance-fail',
    actions: [
      { label: 'Open Compliance', style: 'primary',   action: { type: 'devNote', label: 'Compliance view' } },
      { label: 'Notify Owner',    style: 'secondary', action: { type: 'toast', msg: 'Owner notified via push + email' } },
    ],
  },
  {
    id: 'sig-pay-disputed', section: 'critical', unread: false, icon: '🚨',
    property: '321 Oak St · Queens', nickname: 'Oak Street Studios',
    event: 'Vendor reports payment NOT received',
    context: 'Task: Ceiling Water Damage Repair · Amount: $240 · NYC Water Pros · 3 days since recorded',
    riskTimer: '🚨 Payment disputed', riskLevel: 'urgent',
    badges: [
      { text: 'CRITICAL', tone: 'crimson' },
      { text: 'DISPUTED', tone: 'crimson' },
    ],
    actions: [
      { label: 'Open Dispute', style: 'primary',   action: { type: 'openTask', task: 'Ceiling Water Damage Repair' } },
      { label: 'Upload Proof', style: 'secondary', action: { type: 'openTask', task: 'Vendor Payment Dispute — Plumbing' } },
    ],
  },

  /* ── ATTENTION ── */
  {
    id: 'sig-owner-auth-pending', section: 'attention', unread: true, icon: '⏳',
    property: '123 Main St · Manhattan', nickname: 'Main Street Loft',
    event: 'Owner Authorization Pending — Roof Repair',
    context: 'Quote: $1,200 · Sent to Robert Kim · Awaiting approval before dispatch · SLA: 48h window',
    riskTimer: '⏱ Response due Tomorrow 9:05 AM', riskLevel: 'warn',
    badges: [{ text: 'AWAITING OWNER', tone: 'amber' }],
    actions: [
      { label: 'View Task',        style: 'amber',     action: { type: 'openTask', task: 'Roof Repair — Pending Owner Approval' } },
      { label: 'Resend to Owner',  style: 'secondary', action: { type: 'toast', msg: 'Authorization request resent to Robert Kim' } },
    ],
  },
  {
    id: 'sig-owner-stay', section: 'attention', unread: true, icon: '🏠',
    property: '812 Gulf Blvd · Clearwater Beach', nickname: 'Seaside Villa',
    event: 'Owner Stay Request — Apr 14–16',
    context: 'Requested by: Maria Gonzalez (Owner) · 2 nights · Note: "Family visit, need early check-in if possible"',
    riskTimer: '⏱ Respond within 24h', riskLevel: 'warn',
    badges: [{ text: 'NEW REQUEST', tone: 'amber', id: 'owner-stay-status-pill' }],
    actions: [
      { label: 'Review Request', style: 'amber',     action: { type: 'openOwnerStay' } },
      { label: 'Decline',        style: 'secondary', action: { type: 'quickDeclineOwnerStay' } },
    ],
  },
  {
    id: 'sig-approval-inquiry', section: 'attention', unread: true, icon: '💬',
    property: '9450 Lake Nona Dr · Orlando', nickname: 'Lake Nona Villa',
    event: 'Owner question pending response — HVAC Service',
    context: '"Can we get a second quote first?" · Asked 12 min ago · $2,400 approval request',
    riskTimer: '⏱ Owner waiting on your response', riskLevel: 'warn',
    badges: [{ text: 'QUESTION PENDING', tone: 'amber', id: 'approval-inquiry-status-pill' }],
    actions: [
      { label: 'Respond →',      style: 'amber',     action: { type: 'openApprovalInquiry' } },
      { label: 'Withdraw Request', style: 'secondary', action: { type: 'withdrawApproval' } },
    ],
  },
  {
    id: 'sig-pay-overdue-attention', section: 'attention', unread: false, icon: '💸',
    property: 'Multiple Properties', nickname: null,
    event: '⚠ Vendor Flagged Overdue Payments',
    context: 'Vendor: Metro Plumbing · 2 unpaid tasks · Oldest: 4 days · Action required before escalation',
    riskTimer: '💰 4 days overdue', riskLevel: 'warn',
    badges: [{ text: 'VENDOR FLAGGED', tone: 'amber' }],
    actions: [
      { label: 'View Tasks', style: 'primary', action: { type: 'devNote', label: 'Awaiting Payment filter' } },
    ],
  },
  {
    id: 'sig-turnover-stack', section: 'attention', unread: false, icon: '📦',
    property: 'Portfolio-Wide', nickname: null,
    event: '4 Turnovers Stacking Tomorrow',
    context: 'All 4 due between 10 AM–2 PM · Only 2 cleaners available · 2 gaps unassigned',
    riskTimer: '⏱ Act in next 3h', riskLevel: 'warn',
    whyKey: 'turnover-stack',
    actions: [
      { label: 'View Schedule', style: 'amber',     action: { type: 'devNote', label: 'Turnover calendar' } },
      { label: 'Find Cleaners', style: 'secondary', action: { type: 'devNote', label: 'Cleaning Trade Vendor Search' } },
    ],
  },
  {
    id: 'sig-vendor-reliability', section: 'attention', unread: false, icon: '👤',
    property: 'Quick Plumbing · Plumbing', nickname: null,
    event: 'Vendor Reliability Dropping',
    context: 'Quick Plumbing: 2 ignores in 7 days · Reliability review recommended · Coverage gap risk increasing',
    riskTimer: '⏱ Review soon', riskLevel: 'warn',
    whyKey: 'vendor-reliability',
    actions: [
      { label: 'View Vendor',   style: 'amber',     action: { type: 'devNote', label: 'Vendor Profile' } },
      { label: 'Recruit Backup', style: 'secondary', action: { type: 'toast', msg: 'Backup vendor recruitment flagged for review' } },
    ],
  },
  {
    id: 'sig-cleaning-delayed', section: 'attention', unread: false, icon: '🧹',
    property: '123 Main St · Manhattan', nickname: 'Main Street Loft',
    event: 'Cleaning Completion Delayed — 45m Behind',
    context: 'Vendor on-site but running late · Next guest check-in: 4:00 PM · Buffer: 35m',
    riskTimer: '⏱ 35m buffer left', riskLevel: 'warn',
    whyKey: 'cleaning-delayed',
    actions: [
      { label: 'Track Progress', style: 'amber', action: { type: 'openTask', task: 'Deep Cleaning - Turnover' } },
    ],
  },
  {
    id: 'sig-compliance-queue', section: 'attention', unread: false, icon: '📋',
    property: 'Portfolio-Wide', nickname: null,
    event: '5 Compliance Items Due This Week',
    context: 'Fire inspection (2), insurance renewal (2), permit renewal (1) · 3 owners unresponsive',
    riskTimer: '⏱ Earliest due: 2 days', riskLevel: 'warn',
    whyKey: 'compliance-queue',
    actions: [
      { label: 'Open Compliance', style: 'amber', action: { type: 'devNote', label: 'Compliance queue' } },
    ],
  },

  /* ── AUTOMATED ── */
  {
    id: 'sig-auto-backup-cleaner', section: 'automated', unread: false, icon: '🤖',
    property: '123 Main St · Manhattan', nickname: 'Main Street Loft',
    event: 'Backup Cleaner Assigned Automatically',
    context: 'Primary cleaner canceled 3h before turnover · System found and dispatched SunClean LLC automatically · No PM action required',
    riskTimer: '✓ Resolved · 4m ago', riskLevel: 'ok',
    autoTag: true,
    actions: [{ label: 'View Task', style: 'secondary', action: { type: 'openTask', task: 'Deep Cleaning - Turnover' } }],
  },
  {
    id: 'sig-auto-compliance-reminder', section: 'automated', unread: false, icon: '📨',
    property: '2210 Collins Ave · Miami', nickname: null,
    event: 'Compliance Reminder Sent to Owner',
    context: '30-day advance notice triggered for insurance renewal · Owner notified via email + SMS · Follow-up scheduled T+7',
    riskTimer: '✓ Sent · 1h ago', riskLevel: 'ok',
    autoTag: true,
    actions: [{ label: 'View Compliance', style: 'secondary', action: { type: 'devNote', label: 'Compliance item' } }],
  },
  {
    id: 'sig-auto-backup-hvac', section: 'automated', unread: false, icon: '🔧',
    property: '654 Cedar Ln · Queens', nickname: null,
    event: 'Backup HVAC Vendors Identified',
    context: 'Coverage gap detected after vendor deactivation. Two eligible vendors found in the directory for PM review.',
    riskTimer: '⏳ Awaiting PM review · 3h ago', riskLevel: 'warn',
    autoTag: true,
    actions: [{ label: 'Review Vendors', style: 'secondary', action: { type: 'devNote', label: 'Vendor Directory' } }],
  },

  /* ── PAYMENT ── */
  {
    id: 'sig-pay-overdue', section: 'payment', unread: false, icon: '⚠️',
    property: 'Multiple Properties', nickname: null,
    event: 'Vendor flagged payment as overdue',
    context: 'Vendor: Metro Plumbing · 2 unpaid tasks · Oldest delay: 4 days · $340 total',
    riskTimer: '💰 4 days overdue', riskLevel: 'warn',
    badges: [{ text: 'VENDOR FLAGGED', tone: 'amber' }],
    actions: [
      { label: 'View Tasks', style: 'primary', action: { type: 'devNote', label: 'Awaiting Payment filter' } },
    ],
  },
  {
    id: 'sig-pay-awaiting', section: 'payment', unread: false, icon: '💸',
    property: '789 5th Ave · Manhattan', nickname: '5th Ave Penthouse',
    event: 'Vendor completed job · awaiting payment',
    context: 'Vendor: NYC Tile Works · Task: Bathroom Tile Repair · Amount: $285 · Waiting: 52h',
    riskTimer: '⏱ 52h waiting', riskLevel: 'normal',
    badges: [{ text: 'AUTO-ESCALATED', tone: 'gold' }],
    actions: [
      { label: 'Record Payment Confirmation', style: 'primary', action: { type: 'openTask', task: 'Bathroom Tile Repair' } },
    ],
  },

  /* ── INFO / FYI ── */
  {
    id: 'sig-info-statement-viewed', section: 'info', unread: false, icon: '👁',
    property: 'Owner Portal', nickname: null,
    event: 'Owner Viewed Monthly Statement',
    context: 'Sarah M. (345 Henry St) viewed February financial report · No questions submitted',
    riskTimer: '14m ago', riskLevel: 'ok',
    actions: [{ label: 'View Report', style: 'ghost', action: { type: 'devNote', label: 'Owner Statement Viewer' } }],
  },
  {
    id: 'sig-info-perf-report', section: 'info', unread: false, icon: '📄',
    property: 'System', nickname: null,
    event: 'February Performance Report Generated',
    context: '48 properties · Revenue, SLA compliance, vendor performance included · Ready for review',
    riskTimer: '2h ago', riskLevel: 'ok',
    actions: [{ label: 'Open Report', style: 'ghost', action: { type: 'devNote', label: 'Performance Reports' } }],
  },
  {
    id: 'sig-info-vendor-coi', section: 'info', unread: false, icon: '🛡',
    property: 'Elite Construction', nickname: null,
    event: 'Vendor Updated Insurance Certificate',
    context: 'Elite Construction submitted new COI · Valid through Dec 2026 · Auto-verified and logged',
    riskTimer: 'Yesterday', riskLevel: 'ok',
    actions: [{ label: 'View Vendor', style: 'ghost', action: { type: 'devNote', label: 'Vendor Profile' } }],
  },
];

/* ────────── Why Panel data ────────── */
export const WHY_DATA = {
  'water-leak': {
    signalTitle: 'Active incident: water leak — burst pipe',
    meta: '345 Henry St · Brooklyn · CRITICAL · Score 94',
    trigger: 'Vendor ETA drift + active incident + guest check-in < 2h',
    threshold: 'Active incident score ≥ 0.90',
    sources: 'Incident Engine, SLA Timer, Vendor Graph',
    objects: 'incident_8801, task_3344, vendor_12, vendor_19',
    confidence: '0.94',
    attempts: [
      { num: '#1', text: 'Auto-dispatch: Manhattan Plumbing', status: 'fail',    label: 'REJECTED' },
      { num: '#2', text: 'Auto-dispatch: Quick Plumbing',     status: 'fail',    label: 'IGNORED' },
      { num: '#3', text: 'Ladder exhausted — PM escalation triggered', status: 'pending', label: 'PENDING' },
    ],
    raw: 'event_type: incident_active\ntask_id: task_3344\nincident_id: incident_8801\nproperty: 345_henry_st_brooklyn\nguest_checkin_utc: 2026-02-22T18:00:00Z\nvendor_eta_drift_min: 18\nsla_remaining_min: 102\nscore: 0.94\nescalated: true\nts: 2026-02-22T15:42:11Z',
  },
  'sla-breach': {
    signalTitle: 'SLA breach imminent: toilet repair unit 4B',
    meta: '789 5th Ave · Manhattan · CRITICAL · Score 88',
    trigger: 'SLA timer > 90% elapsed + no assigned vendor',
    threshold: 'SLA risk score ≥ 0.85',
    sources: 'SLA Engine, Dispatch Log, Task Engine',
    objects: 'task_2291, vendor_07, vendor_14',
    confidence: '0.88',
    attempts: [
      { num: '#1', text: 'Quick Plumbing dispatched', status: 'fail',    label: 'REJECTED' },
      { num: '#2', text: 'Metro Plumbing dispatched', status: 'fail',    label: 'TIMEOUT' },
      { num: '#3', text: 'Ladder exhausted — awaiting PM manual override', status: 'pending', label: 'PENDING' },
    ],
    raw: 'event_type: sla_breach_imminent\ntask_id: task_2291\nproperty: 789_5th_ave_manhattan\nsla_target_min: 240\nsla_elapsed_min: 195\nsla_remaining_min: 45\ndispatch_attempts: 2\nladder_exhausted: true\nscore: 0.88\nts: 2026-02-22T12:15:44Z',
  },
  'compliance-fail': {
    signalTitle: 'Compliance failure: STR license expired',
    meta: '2210 Collins Ave · Miami Beach · CRITICAL · Score 91',
    trigger: 'License expiry date crossed + active booking < 24h',
    threshold: 'Expired doc + guest arrival score ≥ 0.88',
    sources: 'Compliance Engine, Booking Calendar',
    objects: 'property_miami_2210, compliance_doc_441, booking_9923',
    confidence: '0.91',
    attempts: [
      { num: '#1', text: 'Owner reminder sent 30 days ago (auto)', status: 'success', label: 'SENT' },
      { num: '#2', text: 'Owner reminder sent 7 days ago (auto)',  status: 'success', label: 'SENT' },
      { num: '#3', text: 'Owner unresponsive — PM escalation required', status: 'pending', label: 'PENDING' },
    ],
    raw: 'event_type: compliance_failure\nproperty: 2210_collins_miami\ndoc_type: str_license\nexpiry_date: 2026-02-19\ndays_expired: 3\nbooking_id: booking_9923\nguest_checkin_utc: 2026-02-22T21:00:00Z\nlegal_risk: HIGH\nscore: 0.91\nts: 2026-02-22T09:00:01Z',
  },
  'turnover-stack': {
    signalTitle: 'SLA risk: 4 turnovers stacking tomorrow',
    meta: 'Portfolio-wide · NYC · ATTENTION · Score 71',
    trigger: 'Turnover density > 2× cleaner capacity in same window',
    threshold: 'Turnover cluster score ≥ 0.65',
    sources: 'Calendar Engine, Vendor Availability Engine',
    objects: 'turnover_t1, turnover_t2, turnover_t3, turnover_t4',
    confidence: '0.71',
    attempts: [
      { num: '#1', text: 'SunClean LLC — assigned to Slot 1 (10 AM)', status: 'success', label: 'ASSIGNED' },
      { num: '#2', text: 'BrightClean — assigned to Slot 2 (11 AM)',  status: 'success', label: 'ASSIGNED' },
      { num: '#3', text: 'Slots 3–4 unresolved — no available cleaners', status: 'pending', label: 'PENDING' },
    ],
    raw: 'event_type: turnover_cluster\ndate: 2026-02-23\nturnover_count: 4\ncleaner_capacity: 2\ngap_count: 2\nwindow: 10:00–14:00\nscore: 0.71\nts: 2026-02-22T08:30:00Z',
  },
  'vendor-reliability': {
    signalTitle: 'Vendor reliability dropping: Quick Plumbing',
    meta: 'Vendor Pool · Plumbing · ATTENTION · Score 63',
    trigger: 'Vendor ETA drift + 2 dispatch ignores in 7-day window',
    threshold: 'Reliability score ≤ 0.65 after 2+ ignores',
    sources: 'Dispatch Log, Penalty Engine, Vendor Graph',
    objects: 'vendor_14, dispatch_d881, dispatch_d902',
    confidence: '0.63',
    attempts: [
      { num: '#1', text: 'Dispatch priority auto-downgraded (Rank #2 → #4)', status: 'success', label: 'DONE' },
      { num: '#2', text: 'PM alert triggered for manual review', status: 'success', label: 'SENT' },
      { num: '#3', text: 'Emergency pool demotion pending PM confirmation', status: 'pending', label: 'PENDING' },
    ],
    raw: 'event_type: vendor_reliability_drop\nvendor_id: vendor_14\nname: Quick_Plumbing\nignores_7d: 2\nacceptance_rate: 0.61\nnew_rank: 4\nemergency_eligible: false\nscore: 0.63\nts: 2026-02-22T11:05:00Z',
  },
  'cleaning-delayed': {
    signalTitle: 'SLA risk: linen delivery delayed',
    meta: '123 Main St · Manhattan · ATTENTION · Score 67',
    trigger: 'Vendor ETA drift + task due < 2h',
    threshold: 'SLA risk score ≥ 0.70',
    sources: 'Task Engine, Vendor Graph',
    objects: 'task_5122, vendor_91',
    confidence: '0.67',
    attempts: [
      { num: '#1', text: 'Auto-reminder sent to vendor (in-app)', status: 'success', label: 'SUCCESS' },
      { num: '#2', text: 'Buffer alert sent to PM — 35m window remaining', status: 'pending', label: 'PENDING' },
    ],
    raw: 'event_type: cleaning_delay\ntask_id: task_5122\nvendor_id: vendor_91\nproperty: 123_main_manhattan\ndelay_min: 45\nbuffer_min: 35\nguest_checkin_utc: 2026-02-22T16:00:00Z\nscore: 0.67\nts: 2026-02-22T13:25:00Z',
  },
  'compliance-queue': {
    signalTitle: '5 compliance items due this week',
    meta: 'Portfolio-wide · ATTENTION · Score 72',
    trigger: 'Compliance due-date engine: 5 items in 7-day window',
    threshold: 'Compliance queue score ≥ 0.65',
    sources: 'Compliance Registry, Owner Comm Log',
    objects: 'compliance_q_batch_0219',
    confidence: '0.72',
    attempts: [
      { num: '#1', text: 'Reminders sent to all 5 owners (auto)', status: 'success', label: 'SENT' },
      { num: '#2', text: '3 owners unresponsive after 48h — PM action required', status: 'pending', label: 'PENDING' },
    ],
    raw: 'event_type: compliance_queue\ndue_count: 5\nowner_unresponsive: 3\nearliest_due_days: 2\nrisk_categories: [fire_inspection, insurance, permit]\nscore: 0.72\nts: 2026-02-22T06:00:00Z',
  },
};

/* ────────── Owner Stay Request detail (single mocked item) ────────── */
export const OWNER_STAY_REQUEST = {
  property: 'Seaside Villa — Clearwater Beach',
  submittedAt: 'Apr 12, 2026 · 9:14 AM',
  checkIn:  { date: 'Apr 14, 2026', day: 'Monday' },
  checkOut: { date: 'Apr 16, 2026', day: 'Wednesday · 2 nights' },
  ownerNote: 'Family visit, need early check-in if possible',
  owner: { name: 'Maria Gonzalez', initials: 'MG', role: 'Owner · Seaside Villa' },
  conflicts: [
    { tone: 'ok',    text: 'No confirmed bookings in requested window' },
    { tone: 'ok',    text: 'No scheduled maintenance during Apr 14–16' },
    { tone: 'warn',  text: 'Turnover scheduled Apr 13 — verify completion before check-in' },
  ],
  impact: {
    revenue: '2 nights blocked (~$840)',
    vendor:  'Cleaning reschedule may be needed',
    guest:   'None',
  },
};

/* ────────── Approval Inquiry detail (single mocked item) ────────── */
export const APPROVAL_INQUIRY = {
  title: 'HVAC Service — Full Unit Replacement',
  property: 'Lake Nona Villa · Orlando · TSK-0089',
  vendor: { name: 'AirPro HVAC Services', meta: 'Licensed · COI on file' },
  amount: '$2,400',
  amountNote: '⚠ Exceeds NTE cap',
  recommendation: 'Unit is 11 years old. Repair cost ($900) is 37% of replacement. Full replacement recommended — better ROI over 5 years. AirPro has completed 12 prior jobs at this property with 100% SLA.',
  owner: { name: 'Robert Kim', initials: 'RK', role: 'Owner · Lake Nona Villa' },
  question: '"Can we get a second quote first? $2,400 seems high for what was quoted last year. Also want to confirm this is truly unrepairable."',
  askedAt: '12 min ago',
};