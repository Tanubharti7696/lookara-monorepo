// src/data/calendar.js

/* ────────── Week lane data ──────────
   Each property gets 7 day-cell descriptors.
   state: 'occupied' | 'vacant' | 'turnover' | 'owner' | 'owner-pending' | 'offline'
   events: array of small chips shown inside the cell
*/
export const WEEK_START = new Date('2026-01-12');
export const DEMO_CLOCK = new Date('2026-01-16T11:00:00');

export const WEEK_LANES = [
  {
    id: 'occupantburg', name: 'Occupantburg Loft', badge: { label: 'Cleaning', tone: 'cleaning' },
    days: [
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'turnover', event: { type: 'turnover', time: '10:00 AM–3:00 PM', status: 'accepted', key: 'occupantburg|Jan 13' } },
      { state: 'vacant', event: { type: 'task', label: '🔁 Pool Service', recurrence: 'weekly' } },
      { state: 'vacant' },
      { state: 'occupied', event: { type: 'compliance', label: 'Fire Inspection', taskId: 'TSK-0110' }, event2: { type: 'task', label: 'Prep: Docs Upload', taskId: 'TSK-0111' } },
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'occupied', chip: 'Stay Block' },
    ],
  },
  {
    id: 'chelsea', name: 'Chelsea Studio', badge: { label: '⚠ At Risk', tone: 'at-risk' },
    days: [
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'turnover', event: { type: 'turnover', time: '11:00 AM–4:00 PM', status: 'at-risk', key: 'chelsea|Jan 14' } },
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'occupied', event: { type: 'incident', label: 'Occupant Lockout', taskId: 'TSK-0112' }, event2: { type: 'vendor', label: 'Vendor: Locksmith (ETA)', taskId: 'TSK-0113' } },
      { state: 'vacant', event: { type: 'task', label: '🔁 Landscaping', recurrence: 'biweekly' } },
      { state: 'vacant' },
    ],
  },
  {
    id: 'brooklyn', name: 'Brooklyn Heights', badge: { label: 'Cleaning', tone: 'cleaning' },
    days: [
      { state: 'vacant', chip: 'Vacant 3d' },
      { state: 'vacant', event: { type: 'task', label: '🔁 Pest Control', recurrence: 'monthly' } },
      { state: 'vacant' },
      { state: 'turnover', event: { type: 'turnover', time: '10:00 AM–2:00 PM', status: 'dispatched', key: 'brooklyn|Jan 15' }, event2: { type: 'compliance', label: 'Deadline: COI Renewal', taskId: 'TSK-0114' } },
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'occupied', chip: 'Stay Block' },
    ],
  },
  {
    id: 'parkslope', name: 'Park Slope Loft', badge: { label: 'Ready', tone: 'ready' },
    days: [
      { state: 'owner', chip: 'Owner Stay' },
      { state: 'owner', chip: 'Owner Stay' },
      { state: 'vacant', event: { type: 'task', label: '🔁 Trash & Recycling', recurrence: 'weekly' } },
      { state: 'vacant' },
      { state: 'vacant', event: { type: 'task', label: 'HVAC Service', taskId: 'TSK-0115' }, event2: { type: 'vendor', label: 'Vendor Visit: HVAC Tech', taskId: 'TSK-0116' } },
      { state: 'occupied', chip: 'Stay Block' },
      { state: 'occupied', chip: 'Stay Block' },
    ],
  },
  {
    id: 'seaside-villa', name: 'Seaside Villa', badge: { label: '⏳ Owner Req', tone: 'owner-req' },
    days: [
      { state: 'vacant' },
      { state: 'vacant' },
      { state: 'owner-pending' },
      { state: 'owner-pending' },
      { state: 'owner-pending' },
      { state: 'vacant' },
      { state: 'vacant' },
    ],
  },
  {
    id: 'austin', name: 'Austin House', badge: { label: 'Offline', tone: 'offline' },
    offline: true,
    days: [
      { state: 'vacant', chip: 'Offline' },
      { state: 'vacant' },
      { state: 'vacant', event: { type: 'vendor', label: 'Vendor Visit: Plumbing', taskId: 'TSK-0117' } },
      { state: 'vacant' },
      { state: 'vacant' },
      { state: 'vacant' },
      { state: 'vacant' },
    ],
  },
];

/* ────────── Month cell state ──────────
   Keyed by day-of-month (Jan 2026).
   Special: `dots` = array of { type, title }
   `flag` = 'owner-pending' | 'vacant' | 'turnover' ...
*/
export const MONTH_CELLS = {
  1:  { state: 'occupied', dots: ['stay'] },
  2:  { state: 'occupied', dots: ['stay'] },
  3:  { state: 'turnover', dots: ['task'] },
  4:  { state: 'occupied', dots: ['stay'] },
  5:  { state: 'occupied', dots: ['stay'] },
  6:  { state: 'vacant', dots: ['compliance'], flag: 'vacant' },
  7:  { state: 'vacant' },
  8:  { state: 'vacant' },
  9:  { state: 'turnover', dots: ['task','compliance'] },
  10: { state: 'occupied', dots: ['stay','compliance'] },
  11: { state: 'occupied', dots: ['stay'] },
  12: { state: 'occupied', dots: ['stay','stay','owner'] },
  13: { state: 'turnover', dots: ['stay','stay','owner'], flag: 'turnover' },
  14: { state: 'turnover', dots: ['task','task','owner-pending'], flag: 'owner' },
  15: { state: 'occupied', dots: ['stay','task','stay','owner-pending'] },
  16: { state: 'occupied', dots: ['compliance','incident','task','owner-pending'] },
  17: { state: 'occupied', dots: ['stay','stay','stay'] },
  18: { state: 'turnover', dots: ['stay','stay','stay'] },
  19: { state: 'occupied', dots: ['stay'] },
  20: { state: 'occupied', dots: ['stay','incident'] },
  21: { state: 'vacant' },
  22: { state: 'vacant' },
  23: { state: 'vacant', dots: ['task','owner'], flag: 'vacant' },
  24: { state: 'vacant' },
  25: { state: 'vacant' },
  26: { state: 'turnover', dots: ['task','compliance'] },
  27: { state: 'occupied', dots: ['stay'] },
  28: { state: 'occupied', dots: ['stay'] },
  29: { state: 'occupied', dots: ['stay'] },
  30: { state: 'occupied', dots: ['stay'] },
  31: { state: 'turnover', dots: ['task'] },
};

export const MONTH_STATS = {
  occupiedNights: 18,
  vacantNights: 13,
  occupancyRate: 58,
};

/* ────────── Day dispatch lanes (keyed by 'Jan-12' etc) ────────── */
export const DAY_LANES = {
  'Jan-12': [
    { prop: 'Occupantburg Loft', state: 'occupied', events: [{ type: 'stay',    time: 'All day', label: 'Stay Block' }] },
    { prop: 'Chelsea Studio',    state: 'occupied', events: [{ type: 'stay',    time: 'All day', label: 'Stay Block' }] },
    { prop: 'Park Slope Loft',   state: 'occupied', events: [{ type: 'stay',    time: 'All day', label: 'Owner Stay (confirmed)' }] },
    { prop: 'Brooklyn Heights',  state: 'vacant',   events: [{ type: 'block',   time: 'All day', label: 'Vacant — 3 nights gap' }] },
    { prop: 'Seaside Villa',     state: 'vacant',   events: [{ type: 'block',   time: 'All day', label: 'Vacant' }] },
    { prop: 'Austin House',      state: 'offline',  events: [{ type: 'block',   time: 'All day', label: 'Offline — Water outage' }] },
  ],
  'Jan-13': [
    { prop: 'Occupantburg Loft', state: 'turnover', events: [{ type: 'turnover', time: '10:00 AM–3:00 PM', label: 'Turnover Cleaning (Accepted)', outcome: 'completed' }] },
    { prop: 'Chelsea Studio',    state: 'occupied', events: [{ type: 'stay',     time: 'All day', label: 'Stay Block' }] },
    { prop: 'Park Slope Loft',   state: 'occupied', events: [{ type: 'stay',     time: 'All day', label: 'Owner Stay (confirmed)' }] },
    { prop: 'Brooklyn Heights',  state: 'vacant',   events: [{ type: 'block',    time: 'All day', label: 'Vacant' }] },
    { prop: 'Seaside Villa',     state: 'vacant',   events: [{ type: 'block',    time: 'All day', label: 'Vacant' }] },
    { prop: 'Austin House',      state: 'vacant',   events: [{ type: 'block',    time: 'All day', label: 'Offline' }] },
  ],
  'Jan-14': [
    { prop: 'Occupantburg Loft', state: 'vacant',    events: [{ type: 'block',    time: 'All day', label: 'Vacant' }] },
    { prop: 'Chelsea Studio',    state: 'turnover',  events: [{ type: 'turnover', time: '11:00 AM–4:00 PM', label: 'Turnover Cleaning (⚠ At Risk — No cleaner)', outcome: 'missed' }] },
    { prop: 'Park Slope Loft',   state: 'vacant',    events: [{ type: 'block',    time: 'All day', label: 'Vacant' }] },
    { prop: 'Brooklyn Heights',  state: 'vacant',    events: [{ type: 'block',    time: 'All day', label: 'Vacant' }] },
    { prop: 'Seaside Villa',     state: 'owner-pending', events: [{ type: 'block', time: 'All day', label: '⏳ Owner Stay Request — Pending PM Approval' }] },
    { prop: 'Austin House',      state: 'vacant',    events: [{ type: 'vendor',   time: '2:30 PM', label: 'Vendor Visit: Plumbing', outcome: 'completed' }] },
  ],
  'Jan-15': [
    { prop: 'Occupantburg Loft', state: 'vacant',    events: [{ type: 'block',    time: 'All day', label: 'Vacant' }] },
    { prop: 'Chelsea Studio',    state: 'occupied',  events: [{ type: 'stay',     time: 'All day', label: 'Stay Block' }] },
    { prop: 'Park Slope Loft',   state: 'vacant',    events: [{ type: 'block',    time: 'All day', label: 'Vacant' }] },
    { prop: 'Brooklyn Heights',  state: 'turnover',  events: [{ type: 'turnover', time: '10:00 AM–2:00 PM', label: 'Turnover Cleaning (Dispatching)', outcome: 'completed' }, { type: 'compliance', time: '5:00 PM', label: 'COI Renewal Deadline', outcome: 'completed' }] },
    { prop: 'Seaside Villa',     state: 'owner-pending', events: [{ type: 'block', time: 'All day', label: '⏳ Owner Stay Request — Pending PM Approval' }] },
    { prop: 'Austin House',      state: 'vacant',    events: [{ type: 'block',    time: 'All day', label: 'Offline' }] },
  ],
  'Jan-16': [
    { prop: 'Occupantburg Loft', state: 'occupied',  events: [{ type: 'compliance', time: '5:00 PM', label: 'Fire Inspection', outcome: 'upcoming' }, { type: 'task', time: '9:00 AM', label: 'Prep: Docs Upload', outcome: 'completed' }] },
    { prop: 'Chelsea Studio',    state: 'vacant',    events: [{ type: 'incident',  time: 'All day', label: 'Occupant Lockout (active)', outcome: 'in-progress' }, { type: 'vendor', time: 'ETA pending', label: 'Vendor: Locksmith', outcome: 'in-progress' }] },
    { prop: 'Park Slope Loft',   state: 'occupied',  events: [{ type: 'task',      time: '10:00 AM', label: 'HVAC Service', outcome: 'completed' }, { type: 'vendor', time: '10:00 AM', label: 'Vendor Visit: HVAC Tech', outcome: 'completed' }] },
    { prop: 'Brooklyn Heights',  state: 'occupied',  events: [{ type: 'stay',      time: 'All day', label: 'Stay Block' }] },
    { prop: 'Seaside Villa',     state: 'owner-pending', events: [{ type: 'block', time: 'All day', label: '⏳ Owner Stay Request — Pending PM Approval' }] },
    { prop: 'Austin House',      state: 'vacant',    events: [{ type: 'block',     time: 'All day', label: 'Offline' }] },
  ],
  'Jan-17': [
    { prop: 'Occupantburg Loft', state: 'occupied', events: [{ type: 'stay', time: 'All day', label: 'Stay Block' }] },
    { prop: 'Chelsea Studio',    state: 'vacant',   events: [{ type: 'block',time: 'All day', label: 'Vacant' }] },
    { prop: 'Park Slope Loft',   state: 'occupied', events: [{ type: 'stay', time: 'All day', label: 'Stay Block' }] },
    { prop: 'Brooklyn Heights',  state: 'occupied', events: [{ type: 'stay', time: 'All day', label: 'Stay Block' }] },
    { prop: 'Seaside Villa',     state: 'vacant',   events: [{ type: 'block',time: 'All day', label: 'Vacant' }] },
    { prop: 'Austin House',      state: 'vacant',   events: [{ type: 'block',time: 'All day', label: 'Offline' }] },
  ],
  'Jan-18': [
    { prop: 'Occupantburg Loft', state: 'occupied', events: [{ type: 'stay', time: 'All day', label: 'Stay Block' }] },
    { prop: 'Chelsea Studio',    state: 'vacant',   events: [{ type: 'block',time: 'All day', label: 'Vacant' }] },
    { prop: 'Park Slope Loft',   state: 'occupied', events: [{ type: 'stay', time: 'All day', label: 'Stay Block' }] },
    { prop: 'Brooklyn Heights',  state: 'occupied', events: [{ type: 'stay', time: 'All day', label: 'Stay Block' }] },
    { prop: 'Seaside Villa',     state: 'vacant',   events: [{ type: 'block',time: 'All day', label: 'Vacant' }] },
    { prop: 'Austin House',      state: 'vacant',   events: [{ type: 'block',time: 'All day', label: 'Offline' }] },
  ],
};

/* ────────── Agenda events (per week) ────────── */
export const AGENDA_EVENTS = [
  { dow: 0, time: '10:00 AM', title: 'Turnover Cleaning',        type: 'turnover', property: 'Occupantburg Loft' },
  { dow: 0, time: 'All day',  title: 'Stay Block',               type: 'stay',     property: 'Chelsea Studio' },
  { dow: 1, time: '8:00 AM',  title: 'HVAC Service',             type: 'task',     property: 'Park Slope Loft' },
  { dow: 2, time: 'Due 5:00 PM', title: 'Fire Inspection Certificate', type: 'compliance', property: 'Brooklyn Heights' },
  { dow: 3, time: '12:15 PM', title: 'Occupant Lockout (Resolved)', type: 'incident', property: 'Chelsea Studio' },
  { dow: 4, time: '2:30 PM',  title: 'Vendor Visit: Plumbing',   type: 'vendor',   property: 'Austin House' },
  { dow: 5, time: 'All day',  title: 'Vacant Window (2 nights)', type: 'vacant',   property: 'Chelsea Studio' },
];

/* ────────── Turnover drawer data ────────── */
export const TURNOVER_DATA = {
  'occupantburg|Jan 13': {
    property: 'Occupantburg Loft',
    checkoutTime: '10:00 AM', checkinTime: '3:00 PM',
    cleaningWindow: '10:30 AM – 2:30 PM',
    cleaner: 'BK Cleaning Pro', cleanerStatus: 'accepted',
    readiness: 'cleaning', readinessLabel: '🧹 Cleaning In Progress',
    taskId: 'TSK-0107', source: 'Calendar Generated',
  },
  'chelsea|Jan 14': {
    property: 'Chelsea Studio',
    checkoutTime: '11:00 AM', checkinTime: '4:00 PM',
    cleaningWindow: '11:30 AM – 3:30 PM',
    cleaner: null, cleanerStatus: 'unassigned',
    readiness: 'at-risk', readinessLabel: '⚠ Not Ready — No Cleaner',
    taskId: 'TSK-0108', source: 'Calendar Generated',
  },
  'brooklyn|Jan 15': {
    property: '345 Henry St',
    checkoutTime: '10:00 AM', checkinTime: '3:00 PM',
    cleaningWindow: '10:30 AM – 2:30 PM',
    cleaner: 'Park Maintenance Co', cleanerStatus: 'dispatched',
    readiness: 'ready', readinessLabel: '✓ Ready for Check-in',
    taskId: 'TSK-0109', source: 'Calendar Generated',
  },
};

export const OPS_KPIS = [
  { key: 'checkins',   label: 'Check-ins Today',  value: 2, tone: 'success' },
  { key: 'checkouts',  label: 'Check-outs Today', value: 3, tone: 'amber'   },
  { key: 'turnovers',  label: 'Turnovers Today',  value: 2, tone: 'gold'    },
  { key: 'vacant',     label: 'Vacant',           value: 1, tone: 'slate'   },
  { key: 'at-risk',    label: '⚠ At Risk',        value: 1, tone: 'crimson' },
];

/* Views available */
export const CAL_VIEWS = [
  { key: 'week',   label: 'Week'   },
  { key: 'month',  label: 'Month'  },
  { key: 'day',    label: 'Day'    },
  { key: 'agenda', label: 'Agenda' },
];