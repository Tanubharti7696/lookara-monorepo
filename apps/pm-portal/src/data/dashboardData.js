// src/data/dashboardData.js

export const dashboardData = {
  subtitle: 'Monitoring 48 properties across NYC, Miami, Austin, Orlando',
  lastUpdated: '2m ago',

  status: {
    metrics: {
      openTasks: 41,
      slaRisk: 6,
      complianceRisk: 3,
      coverageGaps: 2,
      incidents: 1,
    },
    healthScore: {
      score: 87,
      delta: '+4 this month',
      drivers: [
        { tone: 'good', text: '✓ Compliance improving' },
        { tone: 'good', text: '✓ Vendor coverage improving' },
        { tone: 'warn', text: '⚠ SLA pressure increased' },
      ],
    },
  },

  trends: {
    occupancy: {
      value: '86%',
      delta: '↓ 2% vs last week',
      deltaTone: 'down-bad',
      context: '41 occupied · 7 vacant · 48 total',
      history: [
        { d: '-28d', v: 84 }, { d: '-25d', v: 85 }, { d: '-22d', v: 87 },
        { d: '-21d', v: 88 }, { d: '-18d', v: 90 }, { d: '-17d', v: 91 },
        { d: '-15d', v: 89 }, { d: '-14d', v: 88 }, { d: '-11d', v: 87 },
        { d: '-10d', v: 86 }, { d: '-8d', v: 88 },  { d: '-7d', v: 87 },
        { d: '-5d', v: 86 },  { d: '-4d', v: 85 },  { d: '-2d', v: 86 },
        { d: 'Today', v: 86 },
      ],
      forecast: [
        { d: '+4d', v: 87 }, { d: '+7d', v: 87 },
        { d: '+10d', v: 86 }, { d: '+14d', v: 88 },
      ],
    },

    sla: {
      value: '6 at risk',
      delta: '↑ 2 this week',
      deltaTone: 'up-bad',
      context: 'Next breach 45m · NYC',
      history: [
        { d: '-28d', v: 2 }, { d: '-25d', v: 1 }, { d: '-22d', v: 3 },
        { d: '-21d', v: 2 }, { d: '-18d', v: 2 }, { d: '-17d', v: 3 },
        { d: '-15d', v: 4 }, { d: '-14d', v: 3 }, { d: '-11d', v: 3 },
        { d: '-10d', v: 4 }, { d: '-8d', v: 3 },  { d: '-7d', v: 4 },
        { d: '-5d', v: 5 },  { d: '-4d', v: 5 },  { d: '-2d', v: 5 },
        { d: 'Today', v: 6 },
      ],
      forecast: [
        { d: '+4d', v: 5 }, { d: '+7d', v: 4 },
        { d: '+10d', v: 3 }, { d: '+14d', v: 3 },
      ],
    },

    compliance: {
      value: '84%',
      delta: '⚠ Safety risk increasing',
      deltaTone: 'down-bad',
      legend: [
        { color: '#22C55E', label: 'Licenses 98%' },
        { color: '#F59E0B', label: 'Insurance 82%' },
        { color: '#60A5FA', label: 'Inspections 91%' },
        { color: '#DC2626', label: 'Safety 74%' },
      ],
      series: [
        { label: 'Licenses',    color: '#22C55E', data: [98,98,97,98,98,98,98,98,98,98,98,98,98,98,98,98] },
        { label: 'Insurance',   color: '#F59E0B', data: [85,84,83,83,82,82,82,83,82,82,82,82,82,82,82,82] },
        { label: 'Inspections', color: '#60A5FA', data: [93,93,92,92,92,91,91,91,91,91,91,91,91,91,91,91] },
        { label: 'Safety',      color: '#DC2626', data: [80,79,78,77,76,76,75,75,75,75,74,74,74,74,74,74] },
      ],
    },

    vendor: {
      value: '92%',
      delta: '↑ 4% this month',
      deltaTone: 'up-good',
      context: 'Combined coverage score · 30-day trend',
      legend: [
        { color: '#D4AF37', label: 'Coverage 92%' },
        { color: '#22C55E', label: 'Reliability 94%' },
        { color: '#6B7280', label: '2 Gaps · 11 Offline' },
      ],
      history: [
        { d: '-28d', v: 88 }, { d: '-25d', v: 88 }, { d: '-22d', v: 87 },
        { d: '-21d', v: 88 }, { d: '-18d', v: 89 }, { d: '-17d', v: 89 },
        { d: '-15d', v: 90 }, { d: '-14d', v: 90 }, { d: '-11d', v: 90 },
        { d: '-10d', v: 91 }, { d: '-8d', v: 91 },  { d: '-7d', v: 91 },
        { d: '-5d', v: 92 },  { d: '-4d', v: 92 },  { d: '-2d', v: 92 },
        { d: 'Today', v: 92 },
      ],
      forecast: [
        { d: '+4d', v: 93 }, { d: '+7d', v: 93 },
        { d: '+10d', v: 94 }, { d: '+14d', v: 94 },
      ],
    },
  },

  criticalBanner: {
    incident: {
      title: 'Active Incident — Water Leak · Miami Beach',
      sub: 'Vendor ETA 18m · SLA breach risk 42m · Unit 4B · Dispatch confirmed',
      cta: 'Open Incident →',
    },
    sla: {
      title: 'SLA Pressure — 6 Tasks Approaching Breach',
      sub: 'Escalation timers running · Next breach 45m · NYC portfolio',
      cta: 'Open SLA Queue →',
    },
  },

  attentionItems: [
    { icon: '🚨', text: 'Active incident — Miami Beach · Water leak in progress', cta: 'Open Incident →', tone: 'critical' },
    { icon: '⚠️', text: '6 tasks approaching SLA breach · NYC', cta: 'Open Queue →', tone: 'warning' },
    { icon: '⚠️', text: 'Orlando locksmith coverage gap · No eligible vendor', cta: 'View Vendors →', tone: 'warning' },
    { icon: '⚠️', text: '3 compliance items due this week · Austin + Miami', cta: 'View Compliance →', tone: 'warning' },
    { icon: '⚠️', text: 'Payment dispute pending review · Vendor escalation', cta: 'View Dispute →', tone: 'warning' },
  ],

  nextBestActions: [
    { title: 'Reprioritize SLA Queue', sub: 'Move top 3 tasks into immediate dispatch · assign backup vendors', cta: 'Open Queue →' },
    { title: 'Fix Vendor Coverage', sub: 'Recruit 2 missing categories in Orlando · locksmith + HVAC', cta: 'View Vendors →' },
    { title: 'Clear Compliance Stack', sub: 'Resolve 3 upcoming deadlines · Austin + Miami · due in 7 days', cta: 'Open Compliance →' },
  ],

  todayOperations: [
    { time: '11:00 – 1:00 PM', icon: '🚨', title: 'Leak Remediation', location: 'Miami Beach · FL' },
    { time: '9:00 – 11:00 AM', icon: '⚠️', title: 'Turnover + Inspection', location: 'SoHo Loft · NYC' },
    { time: '4:00 – 6:00 PM', icon: '⚠️', title: '3 Turnovers Stacked', location: 'Lake Nona · Orlando' },
    { time: '2:00 – 4:00 PM', icon: '⚠️', title: 'Smoke Detector Audit', location: 'Austin · TX' },
  ],

  recentActivity: [
    { dot: 'red', title: 'SLA Risk — SoHo Loft Turnover', sub: '1h 42m remaining · NYC', when: '3m ago' },
    { dot: 'green', title: 'Dispatch Accepted — Leak Remediation', sub: 'Miami Beach · Vendor ETA 18m', when: '11m ago' },
    { dot: 'gold', title: 'Compliance Doc Uploaded', sub: 'Austin Safety Audit · Due Mar 02', when: '23m ago' },
    { dot: 'amber', title: 'Vendor Offline — Orlando Locksmith', sub: 'Coverage gap triggered', when: '1h ago' },
    { dot: 'green', title: 'Task Completed — Wynwood Cleaning', sub: 'Evidence submitted · Miami', when: '2h ago' },
  ],

  healthScorecard: [
    { metric: 'Occupied Properties',   value: '41 / 48', tone: 'neutral' },
    { metric: 'Open Tasks',            value: '41',      tone: 'neutral' },
    { metric: 'At-Risk Tasks',         value: '6',       tone: 'warn'    },
    { metric: 'Compliance Items Due',  value: '3',       tone: 'warn'    },
    { metric: 'Active Vendors',        value: '76',      tone: 'good'    },
    { metric: 'Coverage Gaps',         value: '2',       tone: 'warn'    },
    { metric: 'Payment Disputes',      value: '1',       tone: 'bad'     },
    { metric: 'Avg Payment Cycle',     value: '2.3 Days',tone: 'neutral' },
  ],

  financial: {
    mtd: '$312,480',
    delta: '↑ +6.3% vs budget',
    projected: '$372,900',
  },
};

export const PORTFOLIOS = [
  { id: 'all',     name: 'All Portfolios',         props: 48, cities: 'NYC · Miami · Austin · Orlando' },
  { id: 'nyc',     name: 'NYC Premium Portfolio',  props: 24, cities: 'Manhattan · Brooklyn · Queens'   },
  { id: 'miami',   name: 'Miami Beach Portfolio',  props: 12, cities: 'Miami Beach · Wynwood · Brickell' },
  { id: 'austin',  name: 'Austin Operating Group', props: 8,  cities: 'Downtown Austin · Oak Hill'      },
  { id: 'orlando', name: 'Orlando Portfolio',      props: 4,  cities: 'Lake Nona · Winter Park'         },
];