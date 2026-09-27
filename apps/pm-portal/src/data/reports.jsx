// src/data/reports.js

export const KEY_INSIGHTS = [
  { tone: 'good', num: '+14%',  label: 'Vendor Response',    sub: '3.7h → 3.2h improved' },
  { tone: 'good', num: '7→2',   label: 'Compliance',         sub: 'Overdue items resolved' },
  { tone: 'good', num: '91%',   label: 'Autodispatch',       sub: 'Up from 84%' },
  { tone: 'warn', num: '+$1.2k',label: 'Billing Exceptions', sub: '2 unresolved' },
];

export const TOP_RISKS = [
  { id: 'metro-plumbing',    tone: 'critical', icon: '🔴', title: 'Metro Plumbing — 3 SLA Breaches',            sub: '345 Henry St · Brooklyn',               trend: '↑ Worsening', trendCls: 'worsening' },
  { id: 'compliance-gap',    tone: 'critical', icon: '🔴', title: 'Compliance Gap — Fire Safety',                sub: '345 Henry St · Brooklyn · Overdue 90 days', trend: '↑ Worsening', trendCls: 'worsening' },
  { id: 'billing-cleanpro',  tone: 'warning',  icon: '🟡', title: 'Duplicate Billing — CleanPro',                sub: '$940 unresolved · 2 duplicate charges',     trend: '→ Stable',    trendCls: 'stable' },
  { id: 'torres-electric',   tone: 'warning',  icon: '🟡', title: 'Vendor Reliability Drop — Torres Electric',   sub: 'Rework rate +10% this month',               trend: '↑ Worsening', trendCls: 'worsening' },
];

export const INTEL_FEED = [
  {
    drawerId: 'metro-plumbing', tone: 'critical', tag: 'Vendors', time: '2h ago',
    text: <>Metro Plumbing reliability declined due to <strong>3 delayed responses</strong> and <strong>2 cancellations</strong> during the last 30 days.</>,
  },
  {
    drawerId: 'compliance-gap', tone: 'critical', tag: 'Compliance', time: '5h ago',
    text: <>Compliance exposure increased — <strong>9 properties</strong> have requirements due within 30 days. 2 are currently overdue.</>,
  },
  {
    drawerId: 'billing-cleanpro', tone: 'warning', tag: 'Billing', time: '1d ago',
    text: <>Billing exception cluster detected for <strong>CleanPro</strong>. Two duplicate charges totalling <strong>$940</strong> remain unresolved.</>,
  },
  {
    drawerId: 'autodispatch', tone: 'good', tag: 'Operations', time: '2d ago',
    text: <>Autodispatch success improved from <strong>84% to 91%</strong> following vendor pool rebalancing for the NYC portfolio.</>,
  },
  {
    drawerId: 'torres-electric', tone: 'warning', tag: 'Vendors', time: '3d ago',
    text: <>Torres Electric rework rate increased <strong>+10%</strong> this month. Two jobs required revisits at 345 Henry St and Chelsea Studio.</>,
  },
];

/* ────────── Drawer content ────────── */
export const INTELLIGENCE = {
  'metro-plumbing': {
    sev: 'critical',
    title: 'Metro Plumbing — Reliability Declining',
    sub: 'Vendor · SLA Performance · Last 30 days',
    plain: <>Metro Plumbing reliability declined due to <strong>3 delayed responses</strong> and <strong>2 cancellations</strong> during the last 30 days. Average response time is now 4.1 hours against a 2-hour SLA target.</>,
    matters: [
      { icon: '🏠', text: '3 properties directly affected' },
      { icon: '⚠️', text: 'Higher SLA breach risk on future dispatches' },
      { icon: '💰', text: '2 NTE overruns linked to late arrivals' },
    ],
    impact: { cls: 'bad', arrow: '▲', text: 'Risk increased 21% — vendor on watch list' },
    evidence: [
      { sev: 'critical',  text: 'Feb 25 · Deep Cleaning missed 3h 14m — 345 Henry St',      link: 'Open Task →' },
      { sev: 'critical',  text: 'Feb 22 · Dispatch no-response — Austin House',             link: 'Open Task →' },
      { sev: 'attention', text: 'Feb 19 · HVAC Service — 4.5h response (NTE 2h)',            link: 'Open Task →' },
    ],
    actions: [
      'Reduce routing weight for Metro Plumbing',
      'Review vendor performance in vendor profile',
      'Identify backup vendor for plumbing category',
    ],
    deepLink: { label: 'Open Vendor →', target: 'Metro Plumbing' },
  },

  'compliance-gap': {
    sev: 'critical',
    title: 'Compliance Gap — Fire Safety',
    sub: 'Compliance · 345 Henry St · Brooklyn',
    plain: <>Fire safety inspection at <strong>345 Henry St</strong> is overdue by <strong>90 days</strong>. This is a hard blocker — the property cannot legally operate as an STR without a valid certificate. 9 additional properties have requirements due within 30 days.</>,
    matters: [
      { icon: '⚖️', text: 'Legal exposure — STR operating without valid certificate' },
      { icon: '🏠', text: '9 more properties due within 30 days' },
      { icon: '🚨', text: 'Potential fines and listing suspension' },
    ],
    impact: { cls: 'bad', arrow: '▲', text: 'Critical — immediate action required' },
    evidence: [
      { sev: 'critical',  text: 'Fire Safety Cert expired — 90 days overdue',    link: 'Open Property →' },
      { sev: 'critical',  text: 'STR License renewal overdue — Austin House',     link: 'Open Property →' },
      { sev: 'attention', text: 'Insurance renewal due in 5 days — Park Slope',   link: 'Open Property →' },
    ],
    actions: [
      'Schedule fire safety inspection immediately',
      'Upload certificate within 24h of inspection',
      'Review all 9 upcoming compliance deadlines',
    ],
    deepLink: { label: 'Open Property →', target: '345 Henry St' },
  },

  'billing-cleanpro': {
    sev: 'warning',
    title: 'Duplicate Billing — CleanPro',
    sub: 'Billing · $940 unresolved',
    plain: <>Two duplicate charges from <strong>CleanPro</strong> totalling <strong>$940</strong> were detected this month. Both invoices reference the same job IDs. PM sign-off is required before these can be disputed.</>,
    matters: [
      { icon: '💰', text: '$940 at risk — duplicate charges unresolved' },
      { icon: '📋', text: 'Audit trail flagged for manual review' },
      { icon: '⏱', text: 'Dispute window closes in 7 days' },
    ],
    impact: { cls: 'warn', arrow: '→', text: '$940 exposure — action before dispute window closes' },
    evidence: [
      { sev: 'attention', text: 'Invoice #4821 · $480 · Feb 23 · 345 Henry St', link: 'Open Invoice →' },
      { sev: 'attention', text: 'Invoice #4822 · $460 · Feb 23 · Same job ID',  link: 'Open Invoice →' },
      { sev: 'info',      text: 'Previous clean charge — Feb 18 · $240 · confirmed' },
    ],
    actions: [
      'Review both invoices against job records',
      'Dispute duplicate charge via billing portal',
      'Flag CleanPro for invoice review before next payout',
    ],
    deepLink: { label: 'Open Vendor →', target: 'CleanPro' },
  },

  'autodispatch': {
    sev: 'good',
    title: 'Autodispatch Success Improved',
    sub: 'Operations · NYC Portfolio · Last 30 days',
    plain: <>Autodispatch success rate improved from <strong>84% to 91%</strong> following vendor pool rebalancing for the NYC portfolio. Fewer tasks now require manual PM intervention before a vendor is confirmed.</>,
    matters: [
      { icon: '⏱', text: 'Average dispatch time reduced by 22 minutes' },
      { icon: '👷', text: '4 fewer manual overrides per week' },
      { icon: '🟢', text: 'SLA compliance improved as a result' },
    ],
    impact: { cls: 'good', arrow: '▼', text: 'Risk reduced — operations running more autonomously' },
    evidence: [
      { sev: 'info', text: 'Feb 24 · Turnover cleaning — dispatched in 4 min',       link: 'Open Task →' },
      { sev: 'info', text: 'Feb 22 · Locksmith job — auto-confirmed immediately',     link: 'Open Task →' },
      { sev: 'info', text: 'Feb 20 · HVAC maintenance — dispatched without override', link: 'Open Task →' },
    ],
    actions: [
      'No action required — monitor trend',
      'Consider expanding pool to Miami portfolio',
    ],
    deepLink: null,
  },

  'torres-electric': {
    sev: 'warning',
    title: 'Vendor Reliability Drop — Torres Electric',
    sub: 'Vendor · Rework Rate · Last 30 days',
    plain: <>Torres Electric rework rate increased by <strong>+10%</strong> this month. Two jobs at 345 Henry St and Chelsea Studio required revisits after initial work did not pass PM verification.</>,
    matters: [
      { icon: '🔄', text: '2 rework jobs — cost absorbed by vendor (this time)' },
      { icon: '⏱', text: 'Each rework added avg 1.5 days to resolution' },
      { icon: '⚠️', text: 'Pattern may indicate quality decline' },
    ],
    impact: { cls: 'warn', arrow: '▲', text: 'Risk increasing — watch for third rework this month' },
    evidence: [
      { sev: 'attention', text: 'Feb 21 · Rework required — Chelsea Studio · electrical outlet', link: 'Open Task →' },
      { sev: 'attention', text: 'Feb 18 · Rework required — 345 Henry St · panel issue',        link: 'Open Task →' },
      { sev: 'info',      text: 'Feb 12 · Job completed first-time — Brooklyn Heights' },
    ],
    actions: [
      'Require photo evidence before job sign-off',
      'Schedule performance review with Torres Electric',
      'Identify backup electrical vendor in NYC',
    ],
    deepLink: { label: 'Open Vendor →', target: 'Torres Electric' },
  },
};

/* ────────── Search index ────────── */
export const SEARCH_INDEX = [
  { type: 'vendor',     icon: '👷', title: 'Metro Plumbing',           sub: 'SLA 78% · 3 breaches · At risk',       tag: 'Critical', tagCls: 'critical', drawerId: 'metro-plumbing' },
  { type: 'vendor',     icon: '👷', title: 'Torres Electric',           sub: 'Rework rate +10% · NYC',               tag: 'Warning',  tagCls: 'warning',  drawerId: 'torres-electric' },
  { type: 'vendor',     icon: '👷', title: 'BK Cleaning Pro',           sub: 'SLA 98% · Best performer',             tag: 'Good',     tagCls: 'good',     drawerId: null },
  { type: 'vendor',     icon: '👷', title: 'NYC Plumbing Experts',      sub: 'COI expires Mar 9',                    tag: 'Warning',  tagCls: 'warning',  drawerId: null },
  { type: 'vendor',     icon: '👷', title: 'Austin Locksmith 24/7',     sub: 'SLA 100% · 31 jobs',                   tag: 'Good',     tagCls: 'good',     drawerId: null },
  { type: 'vendor',     icon: '👷', title: 'Metro HVAC',                sub: 'NTE exceeded · At risk',               tag: 'Warning',  tagCls: 'warning',  drawerId: null },
  { type: 'property',   icon: '🏠', title: '345 Henry St · Brooklyn',   sub: 'Fire Safety overdue · 3 active tasks', tag: 'Critical', tagCls: 'critical', drawerId: 'compliance-gap' },
  { type: 'property',   icon: '🏠', title: 'Park Slope Loft',           sub: 'Insurance due in 5 days',              tag: 'Warning',  tagCls: 'warning',  drawerId: null },
  { type: 'property',   icon: '🏠', title: 'Austin House',              sub: 'Water leak incident · Offline',        tag: 'Critical', tagCls: 'critical', drawerId: null },
  { type: 'property',   icon: '🏠', title: 'Chelsea Studio',            sub: 'Torres Electric rework',               tag: 'Warning',  tagCls: 'warning',  drawerId: null },
  { type: 'property',   icon: '🏠', title: 'Brooklyn Heights',          sub: 'Compliance current · Healthy',         tag: 'Good',     tagCls: 'good',     drawerId: null },
  { type: 'property',   icon: '🏠', title: 'Miami Beach Condo',         sub: 'STR renewal in 21 days',               tag: 'Warning',  tagCls: 'warning',  drawerId: null },
  { type: 'compliance', icon: '⚖️', title: 'COI — Metro HVAC',          sub: 'Expires Mar 9 · 14 days',              tag: 'Warning',  tagCls: 'warning',  drawerId: 'compliance-gap' },
  { type: 'compliance', icon: '⚖️', title: 'Fire Safety Certificate',   sub: '345 Henry St · 90 days overdue',       tag: 'Critical', tagCls: 'critical', drawerId: 'compliance-gap' },
  { type: 'compliance', icon: '⚖️', title: 'STR License — Austin House', sub: 'Renewal overdue',                     tag: 'Critical', tagCls: 'critical', drawerId: 'compliance-gap' },
  { type: 'compliance', icon: '⚖️', title: 'Insurance Renewal',         sub: 'Park Slope · Due in 5 days',            tag: 'Warning',  tagCls: 'warning',  drawerId: null },
  { type: 'billing',    icon: '💳', title: 'CleanPro Duplicate Charge',  sub: '$940 unresolved · 2 invoices',          tag: 'Warning',  tagCls: 'warning',  drawerId: 'billing-cleanpro' },
  { type: 'billing',    icon: '💳', title: 'Missing OTA Payout',        sub: '$820 · Chelsea Studio · Dispute open',  tag: 'Warning',  tagCls: 'warning',  drawerId: 'billing-cleanpro' },
  { type: 'billing',    icon: '💳', title: 'Metro HVAC NTE Exceeded',   sub: '$60 over limit · Park Slope',           tag: 'Warning',  tagCls: 'warning',  drawerId: null },
  { type: 'insight',    icon: '📈', title: 'Autodispatch Success',       sub: 'Improved 84% → 91%',                    tag: 'Good',     tagCls: 'good',     drawerId: 'autodispatch' },
  { type: 'insight',    icon: '📈', title: 'Vendor Response Improved',   sub: '+14% · Avg 3.7h → 3.2h',               tag: 'Good',     tagCls: 'good',     drawerId: 'metro-plumbing' },
  { type: 'insight',    icon: '📈', title: 'Billing Exceptions',         sub: '+$1,240 · 2 unresolved',                tag: 'Warning',  tagCls: 'warning',  drawerId: 'billing-cleanpro' },
  { type: 'insight',    icon: '📈', title: 'Compliance Improving',       sub: '7 → 2 overdue items',                   tag: 'Good',     tagCls: 'good',     drawerId: 'compliance-gap' },
];

export const TYPE_LABELS = {
  vendor: 'Vendors',
  property: 'Properties',
  compliance: 'Compliance',
  billing: 'Billing',
  insight: 'Insights',
};

/* ────────── Report generation data ────────── */
export const REPORT_DATA = {
  'Portfolio Health': {
    kpis: [
      { label: 'Risk Score',         val: '67 / 100', delta: '↓ from 71',       deltaColor: '#F59E0B' },
      { label: 'Critical Properties', val: '3',        delta: '↑ +1 this month', deltaColor: '#DC2626' },
      { label: 'Attention Required',  val: '5',        delta: '→ Unchanged',     deltaColor: '#9ca3af' },
      { label: 'Open Tasks Overdue',  val: '4',        delta: '↓ from 7',        deltaColor: '#16a34a' },
    ],
    insights: [
      { signal: 'Autodispatch Success', change: '+7%',     detail: '84% → 91% — NYC portfolio', color: '#16a34a' },
      { signal: 'Compliance Improving', change: '7 → 2',   detail: '5 overdue items resolved',   color: '#16a34a' },
      { signal: 'Billing Exceptions',   change: '+$1,240', detail: '2 unresolved this month',    color: '#F59E0B' },
      { signal: 'Vendor Response Time', change: '+14%',    detail: 'Avg 3.7h → 3.2h improved',  color: '#16a34a' },
    ],
    risks: [
      { title: 'Metro Plumbing — 3 SLA Breaches',   location: '345 Henry St',   trend: '↑ Worsening', tColor: '#DC2626' },
      { title: 'Compliance Gap — Fire Safety',       location: '345 Henry St',   trend: '↑ Worsening', tColor: '#DC2626' },
      { title: 'Duplicate Billing — CleanPro',       location: 'Portfolio-wide', trend: '→ Stable',    tColor: '#9ca3af' },
      { title: 'Torres Electric — Rework Rate +10%', location: 'NYC',            trend: '↑ Worsening', tColor: '#F59E0B' },
    ],
    events: [
      { date: 'Feb 25', sev: 'Critical',  event: 'Task Escalated — SLA Breach',          property: '345 Henry St · Brooklyn', actor: 'Autopilot OS',   result: 'Escalated' },
      { date: 'Feb 25', sev: 'Critical',  event: 'Access Code Revealed — Lockbox',        property: '345 Henry St · Brooklyn', actor: 'Sarah Chen (PM)', result: 'Logged' },
      { date: 'Feb 24', sev: 'Critical',  event: 'Incident — Water Leak',                 property: 'Austin House · Austin',    actor: 'Sarah Chen (PM)', result: 'Active' },
      { date: 'Feb 24', sev: 'Attention', event: 'Vendor Dispatch Failed',                property: 'Austin House · Austin',    actor: 'Autopilot OS',    result: 'Failed' },
      { date: 'Feb 23', sev: 'Attention', event: 'COI Expiring in 14 Days',               property: 'Park Slope Loft',          actor: 'System',          result: 'Flagged' },
      { date: 'Feb 22', sev: 'Attention', event: 'Vendor NTE Exceeded — Metro HVAC',      property: 'Park Slope Loft',          actor: 'Metro HVAC',      result: 'Flagged' },
      { date: 'Feb 25', sev: 'Info',      event: 'Compliance Certificate Uploaded',       property: 'Brooklyn Heights',         actor: 'Sarah Chen (PM)', result: 'Success' },
      { date: 'Feb 24', sev: 'Info',      event: 'Task Completed — Verification Pending', property: 'Chelsea Studio',           actor: 'BK Cleaning Pro', result: 'Pending' },
    ],
  },
  'SLA Performance': {
    kpis: [
      { label: 'SLA Breaches',      val: '6',    delta: '↑ +2 vs last month',  deltaColor: '#DC2626' },
      { label: 'Avg Response Time', val: '3.2h', delta: '↓ improved from 3.7h', deltaColor: '#16a34a' },
      { label: 'Escalations',       val: '4',    delta: '↑ +1 vs last month',  deltaColor: '#F59E0B' },
      { label: 'On-Time Rate',      val: '94%',  delta: '→ Portfolio average',  deltaColor: '#9ca3af' },
    ],
    insights: [
      { signal: 'Response Improved', change: '+14%', detail: 'Avg 3.7h → 3.2h across portfolio', color: '#16a34a' },
      { signal: 'Cleaning Category', change: '100%', detail: 'Zero breaches this month',           color: '#16a34a' },
      { signal: 'Plumbing Category', change: '-18%', detail: '3 of 6 breaches in plumbing',        color: '#DC2626' },
      { signal: 'Escalation Rate',   change: '+1',   detail: '4 total — 1 more than last month',   color: '#F59E0B' },
    ],
    risks: [
      { title: 'Metro Plumbing — 3 breaches, avg 4.1h late', location: '345 Henry St / Austin', trend: '↑ Worsening', tColor: '#DC2626' },
      { title: 'Plumbing category consistently over SLA',     location: 'Portfolio-wide',        trend: '↑ Worsening', tColor: '#DC2626' },
      { title: 'Torres Electric — 1 breach + rework',         location: 'NYC',                    trend: '→ Stable',    tColor: '#F59E0B' },
      { title: 'Metro HVAC — Response 4.5h (NTE 2h)',         location: 'Park Slope Loft',       trend: '→ Stable',    tColor: '#F59E0B' },
    ],
    events: [
      { date: 'Feb 25', sev: 'Critical',  event: 'Deep Cleaning — SLA Breached 3h 14m',   property: '345 Henry St',     actor: 'Metro Plumbing',  result: 'Escalated' },
      { date: 'Feb 24', sev: 'Critical',  event: 'Plumbing Repair — No Vendor Response',  property: 'Austin House',     actor: 'Autopilot OS',    result: 'Failed' },
      { date: 'Feb 22', sev: 'Attention', event: 'HVAC Service — Response 4.5h (NTE 2h)', property: 'Park Slope Loft',  actor: 'Metro HVAC',      result: 'Late' },
      { date: 'Feb 21', sev: 'Attention', event: 'Torres Electric — Rework Required',      property: 'Chelsea Studio',   actor: 'Torres Electric', result: 'Rework' },
      { date: 'Feb 20', sev: 'Attention', event: 'Turnover Cleaning — Window Missed',      property: 'Chelsea Studio',   actor: 'Autopilot OS',    result: 'Missed' },
      { date: 'Feb 19', sev: 'Info',      event: 'Lock Replacement — On Time',             property: 'Brooklyn Heights', actor: 'Metro Locksmith', result: 'On-time' },
      { date: 'Feb 18', sev: 'Info',      event: 'Deep Clean — Completed On Time',         property: '345 Henry St',     actor: 'BK Cleaning Pro', result: 'On-time' },
    ],
  },
  'Vendor Performance': {
    kpis: [
      { label: 'At-Risk Vendors', val: '2',   delta: '↑ +1 this month',  deltaColor: '#DC2626' },
      { label: 'Lowest SLA',      val: '78%', delta: 'Metro Plumbing',    deltaColor: '#DC2626' },
      { label: 'Rework Jobs',     val: '3',   delta: '↑ +2 vs last month', deltaColor: '#F59E0B' },
      { label: 'Active Vendors',  val: '18',  delta: '→ In network',      deltaColor: '#9ca3af' },
    ],
    insights: [
      { signal: 'BK Cleaning Pro',  change: '98%',  detail: 'Best performer — zero issues',     color: '#16a34a' },
      { signal: 'Austin Locksmith', change: '100%', detail: 'Perfect SLA — 31 jobs this month', color: '#16a34a' },
      { signal: 'Metro Plumbing',   change: '-18%', detail: 'SLA dropped from 96% to 78%',      color: '#DC2626' },
      { signal: 'Torres Electric',  change: '+10%', detail: 'Rework rate increasing',            color: '#F59E0B' },
    ],
    risks: [
      { title: 'Metro Plumbing — SLA 78%, 3 late arrivals', location: 'NYC / Austin',   trend: '↑ Worsening', tColor: '#DC2626' },
      { title: 'Torres Electric — 2 rework jobs',            location: 'NYC',            trend: '↑ Worsening', tColor: '#DC2626' },
      { title: 'NYC Plumbing Experts — COI expires Mar 9',   location: 'All properties', trend: '→ Stable',    tColor: '#F59E0B' },
      { title: 'Metro HVAC — NTE exceeded $60',              location: 'Park Slope',     trend: '→ Stable',    tColor: '#F59E0B' },
    ],
    events: [
      { date: 'Feb 25', sev: 'Critical',  event: 'Metro HVAC — NTE Exceeded $60',         property: 'Park Slope Loft',  actor: 'Metro HVAC',           result: 'Flagged' },
      { date: 'Feb 24', sev: 'Critical',  event: 'Dispatch Failed — No Response',         property: 'Austin House',     actor: 'NYC Plumbing Experts', result: 'Failed' },
      { date: 'Feb 23', sev: 'Attention', event: 'COI Expiring in 14 Days',               property: 'All Properties',   actor: 'System',               result: 'Alert' },
      { date: 'Feb 21', sev: 'Attention', event: 'Torres Electric — Rework Required',     property: 'Chelsea Studio',   actor: 'Torres Electric',      result: 'Rework' },
      { date: 'Feb 18', sev: 'Attention', event: 'Torres Electric — Rework Required',     property: '345 Henry St',     actor: 'Torres Electric',      result: 'Rework' },
      { date: 'Feb 24', sev: 'Info',      event: 'Task Completed — Verification Pending', property: 'Chelsea Studio',   actor: 'BK Cleaning Pro',      result: 'Pending' },
      { date: 'Feb 22', sev: 'Info',      event: 'Lock Replacement — On Time',            property: 'Brooklyn Heights', actor: 'Metro Locksmith',      result: 'On-time' },
    ],
  },
  'Compliance': {
    kpis: [
      { label: 'Overdue Items', val: '2',  delta: '↓ from 7 last month',  deltaColor: '#16a34a' },
      { label: 'Due < 7 Days',  val: '4',  delta: '↑ Requires attention', deltaColor: '#F59E0B' },
      { label: 'Due < 30 Days', val: '14', delta: 'Plan ahead',           deltaColor: '#9ca3af' },
      { label: 'Health Score',  val: '82', delta: '↑ from 74 last month', deltaColor: '#16a34a' },
    ],
    insights: [
      { signal: 'Compliance Improving',  change: '7 → 2',   detail: '5 overdue items resolved this month',  color: '#16a34a' },
      { signal: 'Fire Safety Overdue',   change: '90 days', detail: '345 Henry St — critical hard blocker', color: '#DC2626' },
      { signal: '9 Properties Due Soon', change: '30d',     detail: 'Upcoming deadlines need scheduling',   color: '#F59E0B' },
      { signal: 'Brooklyn Heights',      change: 'Current', detail: 'Fire Safety cert uploaded — resolved', color: '#16a34a' },
    ],
    risks: [
      { title: 'Fire Safety Inspection — 90 days overdue', location: '345 Henry St',      trend: '↑ Critical', tColor: '#DC2626' },
      { title: 'STR License Renewal — overdue',             location: 'Austin House',      trend: '↑ Critical', tColor: '#DC2626' },
      { title: 'Insurance Renewal — due in 5 days',         location: 'Park Slope Loft',   trend: '↑ Urgent',   tColor: '#F59E0B' },
      { title: 'Metro HVAC COI — expires Mar 9',            location: 'Vendor / All props', trend: '↑ Urgent',   tColor: '#F59E0B' },
      { title: 'STR License Renewal — due in 21 days',      location: 'Miami Beach Condo', trend: '→ Planned',  tColor: '#9ca3af' },
    ],
    events: [
      { date: 'Feb 25', sev: 'Critical',  event: 'Fire Inspection — Overdue 90 Days',      property: '345 Henry St',     actor: 'System',         result: 'Overdue' },
      { date: 'Feb 24', sev: 'Critical',  event: 'STR License — Renewal Overdue',          property: 'Austin House',     actor: 'System',         result: 'Overdue' },
      { date: 'Feb 23', sev: 'Attention', event: 'COI Expiring in 14 Days — Metro HVAC',   property: 'All Properties',   actor: 'System',         result: 'Alert' },
      { date: 'Feb 22', sev: 'Attention', event: 'Insurance Renewal Due in 5 Days',        property: 'Park Slope Loft',  actor: 'System',         result: 'Alert' },
      { date: 'Feb 20', sev: 'Attention', event: 'STR License Renewal Due in 21 Days',     property: 'Miami Beach Condo', actor: 'System',         result: 'Planned' },
      { date: 'Feb 25', sev: 'Info',      event: 'Fire Safety Certificate Uploaded',       property: 'Brooklyn Heights', actor: 'Sarah Chen (PM)', result: 'Resolved' },
      { date: 'Feb 19', sev: 'Info',      event: 'Building Insurance — Current Confirmed', property: 'Chelsea Studio',   actor: 'System',         result: 'Current' },
    ],
  },
  'Billing Exceptions': {
    kpis: [
      { label: 'Total At Risk',      val: '$4,180', delta: '↑ +$1,240 this month', deltaColor: '#DC2626' },
      { label: 'Duplicate Charges',  val: '2',      delta: '→ Unresolved',         deltaColor: '#F59E0B' },
      { label: 'Missing References', val: '3',      delta: 'Unlinked invoices',    deltaColor: '#F59E0B' },
      { label: 'Payout Gap',         val: '$820',   delta: 'OTA pending',          deltaColor: '#F59E0B' },
    ],
    insights: [
      { signal: 'CleanPro Duplicate',   change: '$940', detail: '2 invoices — same job ID',           color: '#DC2626' },
      { signal: 'Missing OTA Payout',   change: '$820', detail: 'Unreconciled — dispute window open', color: '#DC2626' },
      { signal: 'Metro HVAC Invoice',   change: '+$60', detail: 'NTE exceeded — PM review needed',    color: '#F59E0B' },
      { signal: 'Negative Margin Stay', change: '-$40', detail: 'Feb 20 · expenses exceeded revenue', color: '#F59E0B' },
    ],
    risks: [
      { title: 'CleanPro — Duplicate charge $940', location: '345 Henry St',    trend: '→ Unresolved', tColor: '#DC2626' },
      { title: 'Missing OTA Payout — $820',        location: 'Chelsea Studio',  trend: '→ Dispute open', tColor: '#DC2626' },
      { title: 'Metro HVAC Invoice — NTE +$60',    location: 'Park Slope Loft', trend: '→ Pending PM', tColor: '#F59E0B' },
      { title: 'Negative margin stay — Feb 20',    location: '345 Henry St',    trend: '→ Review',     tColor: '#F59E0B' },
      { title: 'Vendor invoice unapproved — $120', location: 'Park Slope Loft', trend: '→ No sign-off', tColor: '#F59E0B' },
    ],
    events: [
      { date: 'Feb 25', sev: 'Critical',  event: 'Vendor NTE Exceeded — $60 Over Limit', property: 'Park Slope Loft',  actor: 'Metro HVAC', result: 'Flagged' },
      { date: 'Feb 23', sev: 'Critical',  event: 'Duplicate Invoice Detected — $940',    property: '345 Henry St',     actor: 'CleanPro',   result: 'Flagged' },
      { date: 'Feb 22', sev: 'Attention', event: 'Missing OTA Payout — $820',            property: 'Chelsea Studio',   actor: 'System',     result: 'Unresolved' },
      { date: 'Feb 21', sev: 'Attention', event: 'Duplicate Invoice #4822 Detected',     property: '345 Henry St',     actor: 'CleanPro',   result: 'Flagged' },
      { date: 'Feb 20', sev: 'Attention', event: 'Negative Margin Stay — -$40',          property: '345 Henry St',     actor: 'System',     result: 'Alert' },
      { date: 'Feb 18', sev: 'Attention', event: 'Vendor Invoice Unapproved — $120',     property: 'Park Slope Loft',  actor: 'Metro HVAC', result: 'Pending' },
      { date: 'Feb 24', sev: 'Info',      event: 'Payout Received — $1,230',             property: 'Brooklyn Heights', actor: 'Airbnb',     result: 'Confirmed' },
    ],
  },
};

export const REPORT_TYPES   = ['Portfolio Health', 'SLA Performance', 'Vendor Performance', 'Compliance', 'Billing Exceptions'];
export const DATE_RANGES    = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom range'];