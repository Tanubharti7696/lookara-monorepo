export const TYPE_COLORS = {
  Inspection:  { cls: 'type-inspection',  accent: '#3B82F6', label: '🔍 Inspection' },
  License:     { cls: 'type-license',     accent: '#D4AF37', label: '📄 License' },
  Insurance:   { cls: 'type-insurance',   accent: '#8B5CF6', label: '🛡 Insurance' },
  Certificate: { cls: 'type-certificate', accent: '#22C55E', label: '✓ Certificate' },
  HOA:         { cls: 'type-hoa',         accent: '#F59E0B', label: '🏘 HOA' },
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const CYCLES = ['Annual','Semi-annual','Quarterly','Monthly','One-time'];
export const PRIORITIES = ['critical','high','medium','low'];

export const INITIAL_REQS = [
  { id:1, name:'STR License',             type:'License',     cycle:'Annual',    dueMonth:1,  dueDay:1,  inspection:false, opsblocker:true,  priority:'high',   docs:['NYC STR License Certificate'] },
  { id:2, name:'Fire Safety Inspection',  type:'Inspection',  cycle:'Annual',    dueMonth:6,  dueDay:1,  inspection:true,  opsblocker:true,  priority:'high',   docs:['Fire Inspection Certificate','Safety Checklist'] },
  { id:3, name:'Building Insurance COI',  type:'Insurance',   cycle:'Annual',    dueMonth:3,  dueDay:15, inspection:false, opsblocker:true,  priority:'medium', docs:['Certificate of Insurance','Policy Declaration'] },
  { id:4, name:'Smoke Detector Test',     type:'Inspection',  cycle:'Annual',    dueMonth:3,  dueDay:20, inspection:true,  opsblocker:false, priority:'medium', docs:['Detector Test Report'] },
  { id:5, name:'Gas Line Inspection',     type:'Inspection',  cycle:'Annual',    dueMonth:4,  dueDay:2,  inspection:true,  opsblocker:false, priority:'medium', docs:['Gas Inspection Certificate'] },
  { id:6, name:'Pest Control Log',        type:'Certificate', cycle:'Quarterly', dueMonth:3,  dueDay:30, inspection:false, opsblocker:false, priority:'low',    docs:['Pest Control Report'] },
  { id:7, name:'Liability Insurance',     type:'Insurance',   cycle:'Annual',    dueMonth:10, dueDay:15, inspection:false, opsblocker:false, priority:'medium', docs:['Liability Policy','Endorsement Page'] },
  { id:8, name:'Fire Extinguisher Check', type:'Inspection',  cycle:'Annual',    dueMonth:9,  dueDay:1,  inspection:true,  opsblocker:false, priority:'low',    docs:['Extinguisher Tag'] },
];

export const APPLIED_PROPERTIES = [
  ['345 Henry St · NYC',        'NYC', '8 active requirements', 'Oct 5, 2025'],
  ['567 Park Ave · NYC',        'NYC', '8 active requirements', 'Oct 5, 2025'],
  ['112 Grand Concourse · NYC', 'NYC', '8 active requirements', 'Oct 5, 2025'],
  ['789 Oak Ave · NYC',         'NYC', '8 active requirements', 'Oct 5, 2025'],
];

export const CHANGE_LOG = [
  ['📋', 'Template published',         'David R.', 'Mar 1, 2026',  'Status changed: draft → active'],
  ['✏️', 'Requirement updated',        'David R.', 'Feb 28, 2026', 'STR License: renewal cycle changed from Quarterly to Annual'],
  ['➕', 'Requirement added',          'David R.', 'Feb 20, 2026', 'Added: Building Insurance COI'],
  ['📋', 'Template created as draft',  'David R.', 'Oct 5, 2025',  '8 requirements imported from NYC Local Law 18 spec'],
];

export const TEMPLATE_FIELDS = [
  ['template_id',   'string (UUID)',      'Auto-generated on save',         false],
  ['name',          'string',             'Template name',                  false],
  ['jurisdiction',  'string',             'Regulatory body / location',     false],
  ['property_type', 'enum',               'STR | LTR | Commercial | Mixed', false],
  ['renewal_cycle', 'enum',               'Annual | Semi-annual | etc.',    false],
  ['description',   'string',             'PM-facing description',          false],
  ['status',        'enum',               'draft | active | archived',      false],
  ['auto_remind',   'boolean',            'Trigger reminders 30d before',   false],
  ['block_ops',     'boolean',            'Flag property if overdue',       false],
  ['notify_owner',  'boolean',            'Alert Owner Portal on overdue',  false],
  ['requirements',  'Requirement[]',      'Array of requirement objects',   false],
  ['applied_to',    'Property[]',         'Properties using this template', false],
  ['created_at',    'timestamp',          'ISO 8601',                       false],
  ['updated_at',    'timestamp',          'ISO 8601',                       false],
  ['created_by',    'string (user_id)',   'PM who created the template',    false],
];

export const REQUIREMENT_FIELDS = [
  ['requirement_id',      'string (UUID)',        'Auto-generated',                                       false],
  ['name',                'string',               'Requirement name — shown on compliance page',          false],
  ['type',                'enum',                 'Inspection | License | Insurance | Certificate | HOA', false],
  ['renewal_cycle',       'enum',                 'Inherits template default if null',                    false],
  ['due_date_logic',      'enum',                 'fixed_date | rolling | on_move_in',                    false],
  ['due_date_month',      'integer (1–12)',       'Month for fixed_date type',                            false],
  ['due_date_day',        'integer (1–31)',       'Day for fixed_date type',                              false],
  ['inspection_required', 'boolean',              'Creates inspection subtask on trigger',                false],
  ['docs_required',       'string[]',             'List of required document names',                      false],
  ['priority',            'enum',                 'critical | high | medium | low',                       false],
  ['ops_blocker',         'boolean',              'Blocks operations if overdue',                         false],
  ['notes',               'string',               'Internal PM notes',                                    false],
  ['source_template',     'string (template_id)', 'Linked back to parent template',                       true],
  ['property_id',         'string (property_id)', 'Set on apply — locked per property',                   true],
  ['compliance_id',       'string (UUID)',        'Generated on apply — unique per item',                 true],
  ['status',              'enum',                 'missing | action | scheduled | review | compliant',    true],
];
