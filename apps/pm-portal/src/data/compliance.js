// src/data/compliance.js

export const COMPLIANCE_TODAY = new Date('2026-03-11');

/* ─────────── City → Property map ─────────── */
export const PROPS_BY_CITY = {
  NYC:     ['345 Henry St · NYC', '567 Park Ave · NYC', '112 Grand Concourse · NYC', '789 Oak Ave · NYC'],
  Miami:   ['12 Ocean Dr · Miami'],
  Orlando: ['88 Lake Eola · Orlando'],
};
export const ALL_PROPS = Object.values(PROPS_BY_CITY).flat();

/* ─────────── Templates (used by Template Modal) ─────────── */
export const TEMPLATE_PACKS = [
  { id: 'nyc-str', icon: '🗽', name: 'NYC STR Compliance',    desc: 'Short-term rental requirements for New York City',  count: '8 requirements · Annual renewal' },
  { id: 'fl-str',  icon: '🌴', name: 'Florida STR Compliance',desc: 'State and county requirements for Florida properties', count: '6 requirements · Annual renewal' },
  { id: 'pool',    icon: '🏊', name: 'Pool Safety Pack',      desc: 'Safety certificates, barrier checks, water quality',  count: '4 requirements · Semi-annual' },
  { id: 'gas',     icon: '⛽', name: 'Gas Inspection Pack',   desc: 'Gas line safety and annual inspection requirements',  count: '3 requirements · Annual' },
  { id: 'fire',    icon: '🔥', name: 'Fire Safety Pack',      desc: 'Detectors, extinguishers, egress, fire certificate',   count: '5 requirements · Annual' },
];

/* ─────────── Compliance items ─────────── */
export const COMPLIANCE_ITEMS = [
  { id:'c01', name:'Fire Safety Inspection',    prop:'345 Henry St · NYC',        city:'NYC',     type:'Inspection',  status:'missing',   risk:'HIGH',   due:'Jun 1, 2025',   cycle:'Annual',      docs:[{name:'Fire Inspection Certificate',ok:false},{name:'Safety Checklist',ok:false}], vendor:'—',                    insp:true,  inspStatus:'Not Scheduled',        owner:'Marcus Johnson', jurisdiction:'NYC Fire Dept',   template:'Fire Safety Pack',       blocker:true },
  { id:'c02', name:'STR License Renewal',        prop:'567 Park Ave · NYC',         city:'NYC',     type:'License',     status:'missing',   risk:'HIGH',   due:'Mar 1, 2026',   cycle:'Annual',      docs:[{name:'STR License',ok:false}],                                                    vendor:'—',                    insp:false, inspStatus:'N/A',                  owner:'Clara Nguyen',   jurisdiction:'NYC DCA',         template:'NYC STR Compliance',     blocker:true },
  { id:'c03', name:'Building Insurance COI',     prop:'112 Grand Concourse · NYC',  city:'NYC',     type:'Insurance',   status:'action',    risk:'MEDIUM', due:'Mar 15, 2026',  cycle:'Annual',      docs:[{name:'Certificate of Insurance',ok:true},{name:'Policy Declaration',ok:false}],  vendor:'Allstate Insurance',   insp:false, inspStatus:'N/A',                  owner:'Ray Patel',      jurisdiction:'NYC DOB',         template:'NYC STR Compliance',     blocker:true },
  { id:'c04', name:'Pool Safety Certificate',    prop:'88 Lake Eola · Orlando',     city:'Orlando', type:'Certificate', status:'action',    risk:'MEDIUM', due:'Apr 1, 2026',   cycle:'Semi-annual', docs:[{name:'Pool Safety Certificate',ok:false},{name:'Water Quality Test',ok:true}],  vendor:'AquaSafe Inspections', insp:true,  inspStatus:'Awaiting Scheduling',  owner:'Tom Briggs',     jurisdiction:'Orange County',   template:'Pool Safety Pack',       blocker:false },
  { id:'c05', name:'Smoke Detector Test',        prop:'12 Ocean Dr · Miami',        city:'Miami',   type:'Inspection',  status:'scheduled', risk:'LOW',    due:'Mar 20, 2026',  cycle:'Annual',      docs:[{name:'Detector Test Report',ok:false}],                                           vendor:'SafeHome Inspections', insp:true,  inspStatus:'Scheduled Mar 20',     owner:'Maria Santos',   jurisdiction:'Miami-Dade Fire', template:'Fire Safety Pack',       blocker:false },
  { id:'c06', name:'Gas Line Inspection',        prop:'789 Oak Ave · NYC',          city:'NYC',     type:'Inspection',  status:'scheduled', risk:'LOW',    due:'Apr 2, 2026',   cycle:'Annual',      docs:[{name:'Gas Inspection Certificate',ok:false}],                                     vendor:'ConEdison Services',   insp:true,  inspStatus:'Scheduled Apr 2',      owner:'Ray Patel',      jurisdiction:'NYC DOB',         template:'Gas Inspection Pack',    blocker:false },
  { id:'c07', name:'Smoke Detector Annual',      prop:'345 Henry St · NYC',         city:'NYC',     type:'Inspection',  status:'scheduled', risk:'LOW',    due:'Mar 25, 2026',  cycle:'Annual',      docs:[{name:'Detector Test Log',ok:false}],                                              vendor:'SafeHome Inspections', insp:true,  inspStatus:'Scheduled Mar 25',     owner:'Marcus Johnson', jurisdiction:'NYC Fire Dept',   template:'Fire Safety Pack',       blocker:false },
  { id:'c08', name:'Pest Control Log',           prop:'345 Henry St · NYC',         city:'NYC',     type:'Certificate', status:'review',    risk:'LOW',    due:'Mar 30, 2026',  cycle:'Quarterly',   docs:[{name:'Pest Control Report',ok:true}],                                             vendor:'TermiMax NYC',         insp:false, inspStatus:'N/A',                  owner:'Marcus Johnson', jurisdiction:'NYC DOH',         template:'NYC STR Compliance',     blocker:false },
  { id:'c09', name:'Insurance Liability Review', prop:'567 Park Ave · NYC',         city:'NYC',     type:'Insurance',   status:'review',    risk:'MEDIUM', due:'Apr 5, 2026',   cycle:'Annual',      docs:[{name:'Liability Policy',ok:true},{name:'Endorsement Page',ok:true}],             vendor:'Nationwide Insurance', insp:false, inspStatus:'N/A',                  owner:'Clara Nguyen',   jurisdiction:'NYC DCA',         template:'NYC STR Compliance',     blocker:false },
  { id:'c10', name:'HOA Certificate',            prop:'12 Ocean Dr · Miami',        city:'Miami',   type:'HOA',         status:'compliant', risk:'LOW',    due:'Jan 1, 2027',   cycle:'Annual',      docs:[{name:'HOA Certificate',ok:true}],                                                 vendor:'Brickell HOA Mgmt',    insp:false, inspStatus:'N/A',                  owner:'Maria Santos',   jurisdiction:'HOA Board',       template:'Florida STR Compliance', blocker:false },
  { id:'c11', name:'STR License',                prop:'12 Ocean Dr · Miami',        city:'Miami',   type:'License',     status:'compliant', risk:'LOW',    due:'Dec 1, 2026',   cycle:'Annual',      docs:[{name:'FL STR License',ok:true}],                                                  vendor:'—',                    insp:false, inspStatus:'N/A',                  owner:'Maria Santos',   jurisdiction:'DBPR Florida',    template:'Florida STR Compliance', blocker:false },
  { id:'c12', name:'Liability Insurance',        prop:'88 Lake Eola · Orlando',     city:'Orlando', type:'Insurance',   status:'compliant', risk:'LOW',    due:'Oct 15, 2026',  cycle:'Annual',      docs:[{name:'Liability COI',ok:true}],                                                   vendor:'Allstate Insurance',   insp:false, inspStatus:'N/A',                  owner:'Tom Briggs',     jurisdiction:'Orange County',   template:'Florida STR Compliance', blocker:false },
  { id:'c13', name:'Fire Extinguisher Check',    prop:'789 Oak Ave · NYC',          city:'NYC',     type:'Inspection',  status:'compliant', risk:'LOW',    due:'Sep 1, 2026',   cycle:'Annual',      docs:[{name:'Extinguisher Tag',ok:true}],                                                vendor:'FireGuard NYC',        insp:true,  inspStatus:'Completed Sep 1, 2025', owner:'Ray Patel',     jurisdiction:'NYC Fire Dept',   template:'Fire Safety Pack',       blocker:false },
];

/* ─────────── Helpers ─────────── */
export function daysUntil(dueStr) {
  if (!dueStr || dueStr === '—') return 999;
  const d = new Date(dueStr);
  return isNaN(d) ? 999 : Math.ceil((d - COMPLIANCE_TODAY) / 86400000);
}
export function isOverdue(r) {
  return daysUntil(r.due) < 0 && r.status !== 'compliant';
}
export function isDueSoon(r) {
  const d = daysUntil(r.due);
  return d >= 0 && d <= 30 && r.status !== 'compliant' && r.status !== 'scheduled';
}
export function classify(r) {
  if (r.status === 'compliant') return 'compliant';
  if (r.status === 'review')    return 'review';
  if (r.status === 'scheduled') return 'scheduled';
  return 'action';
}

export const STATUS_LABELS = {
  missing:   'Non-Compliant',
  action:    'Action Needed',
  scheduled: 'Scheduled',
  review:    'Pending Review',
  compliant: 'Compliant',
};
export const STATUS_COLORS = {
  missing:   'var(--crimson)',
  action:    'var(--amber)',
  scheduled: 'var(--blue)',
  review:    'var(--purple)',
  compliant: 'var(--success)',
};

/* Timeline fixtures used by drawer (fallback covers everything) */
export const TIMELINES = {
  c01: [
    { e: '⚠️', t: 'Requirement flagged as overdue',                 d: 'Jan 1, 2026' },
    { e: '📋', t: 'Compliance template applied',                     d: 'Oct 5, 2025' },
    { e: '🔴', t: 'Fire inspection certificate expired',             d: 'Jun 1, 2025' },
    { e: '📋', t: 'Requirement created',                              d: 'Mar 10, 2025' },
  ],
  c02: [
    { e: '⚠️', t: 'STR License expired — renewal required',          d: 'Mar 1, 2026' },
    { e: '📋', t: 'Requirement created from NYC STR template',       d: 'Oct 5, 2025' },
  ],
  c05: [
    { e: '📅', t: 'Inspection scheduled with SafeHome Inspections',  d: 'Mar 5, 2026' },
    { e: '🔔', t: 'Reminder sent',                                    d: 'Mar 1, 2026' },
    { e: '📋', t: 'Requirement created from Fire Safety Pack',       d: 'Oct 5, 2025' },
  ],
};