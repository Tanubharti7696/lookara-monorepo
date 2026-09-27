// src/data/complianceTemplates.js

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const TYPE_META = {
  Inspection:  { cls: 'type-inspection',  accent: '#3B82F6', label: '🔍 Inspection'  },
  License:     { cls: 'type-license',     accent: '#D4AF37', label: '📄 License'     },
  Insurance:   { cls: 'type-insurance',   accent: '#8B5CF6', label: '🛡 Insurance'   },
  Certificate: { cls: 'type-certificate', accent: '#22C55E', label: '✓ Certificate'  },
  HOA:         { cls: 'type-hoa',         accent: '#F59E0B', label: '🏘 HOA'         },
};

export const CYCLE_OPTIONS   = ['Annual', 'Semi-annual', 'Quarterly', 'Monthly', 'One-time'];
export const PRIORITY_OPTIONS = ['critical', 'high', 'medium', 'low'];
export const PROP_TYPE_OPTIONS = ['Short-Term Rental (STR)', 'Long-Term Rental', 'Commercial', 'Mixed Use'];

/* ────────── Data model spec (dev-facing reference) ────────── */
export const TEMPLATE_FIELDS = [
  ['template_id',  'string (UUID)',    'Auto-generated on save',          false],
  ['name',         'string',           'Template name',                   false],
  ['jurisdiction', 'string',           'Regulatory body / location',      false],
  ['property_type','enum',             'STR | LTR | Commercial | Mixed',  false],
  ['renewal_cycle','enum',             'Annual | Semi-annual | etc.',     false],
  ['description',  'string',           'PM-facing description',           false],
  ['status',       'enum',             'draft | active | archived',       false],
  ['auto_remind',  'boolean',          'Trigger reminders 30d before',    false],
  ['block_ops',    'boolean',          'Flag property if overdue',        false],
  ['notify_owner', 'boolean',          'Alert Owner Portal on overdue',   false],
  ['requirements', 'Requirement[]',    'Array of requirement objects',    false],
  ['applied_to',   'Property[]',       'Properties using this template',  false],
  ['created_at',   'timestamp',        'ISO 8601',                        false],
  ['updated_at',   'timestamp',        'ISO 8601',                        false],
  ['created_by',   'string (user_id)', 'PM who created the template',     false],
];

export const REQUIREMENT_FIELDS = [
  ['requirement_id',       'string (UUID)',          'Auto-generated',                              false],
  ['name',                 'string',                 'Requirement name — shown on compliance page', false],
  ['type',                 'enum',                   'Inspection | License | Insurance | Certificate | HOA', false],
  ['renewal_cycle',        'enum',                   'Inherits template default if null',           false],
  ['due_date_logic',       'enum',                   'fixed_date | rolling | on_move_in',           false],
  ['due_date_month',       'integer (1–12)',         'Month for fixed_date type',                   false],
  ['due_date_day',         'integer (1–31)',         'Day for fixed_date type',                     false],
  ['inspection_required',  'boolean',                'Creates inspection subtask on trigger',       false],
  ['docs_required',        'string[]',               'List of required document names',             false],
  ['priority',             'enum',                   'critical | high | medium | low',              false],
  ['ops_blocker',          'boolean',                'Blocks operations if overdue',                false],
  ['notes',                'string',                 'Internal PM notes',                           false],
  ['source_template',      'string (template_id)',   'Linked back to parent template',              true],
  ['property_id',          'string (property_id)',   'Set on apply — locked per property',          true],
  ['compliance_id',        'string (UUID)',          'Generated on apply — unique per item',        true],
  ['status',               'enum',                   'missing | action | scheduled | review | compliant', true],
];

/* ────────── Fixture template ────────── */
export const INITIAL_TEMPLATE = {
  id: 'nyc-str',
  name: 'NYC STR Compliance',
  jurisdiction: 'New York City',
  propertyType: 'Short-Term Rental (STR)',
  cycle: 'Annual',
  description: 'Short-term rental requirements for New York City properties. Required for all STR listings operating under Local Law 18.',
  status: 'draft',
  behavior: {
    autoRemind: true,
    blockOps: true,
    requireInspectionAll: false,
    notifyOwner: true,
  },
  requirements: [
    { id: 1, name: 'STR License',             type: 'License',     cycle: 'Annual',    dueMonth: 1,  dueDay: 1,  inspection: false, opsBlocker: true,  priority: 'high',   docs: ['NYC STR License Certificate'],                 notes: '' },
    { id: 2, name: 'Fire Safety Inspection',  type: 'Inspection',  cycle: 'Annual',    dueMonth: 6,  dueDay: 1,  inspection: true,  opsBlocker: true,  priority: 'high',   docs: ['Fire Inspection Certificate', 'Safety Checklist'], notes: '' },
    { id: 3, name: 'Building Insurance COI',  type: 'Insurance',   cycle: 'Annual',    dueMonth: 3,  dueDay: 15, inspection: false, opsBlocker: true,  priority: 'medium', docs: ['Certificate of Insurance', 'Policy Declaration'], notes: '' },
    { id: 4, name: 'Smoke Detector Test',     type: 'Inspection',  cycle: 'Annual',    dueMonth: 3,  dueDay: 20, inspection: true,  opsBlocker: false, priority: 'medium', docs: ['Detector Test Report'],                        notes: '' },
    { id: 5, name: 'Gas Line Inspection',     type: 'Inspection',  cycle: 'Annual',    dueMonth: 4,  dueDay: 2,  inspection: true,  opsBlocker: false, priority: 'medium', docs: ['Gas Inspection Certificate'],                  notes: '' },
    { id: 6, name: 'Pest Control Log',        type: 'Certificate', cycle: 'Quarterly', dueMonth: 3,  dueDay: 30, inspection: false, opsBlocker: false, priority: 'low',    docs: ['Pest Control Report'],                         notes: '' },
    { id: 7, name: 'Liability Insurance',     type: 'Insurance',   cycle: 'Annual',    dueMonth: 10, dueDay: 15, inspection: false, opsBlocker: false, priority: 'medium', docs: ['Liability Policy', 'Endorsement Page'],        notes: '' },
    { id: 8, name: 'Fire Extinguisher Check', type: 'Inspection',  cycle: 'Annual',    dueMonth: 9,  dueDay: 1,  inspection: true,  opsBlocker: false, priority: 'low',    docs: ['Extinguisher Tag'],                            notes: '' },
  ],
  appliedTo: [
    { property: '345 Henry St · NYC',       city: 'NYC', reqs: 8, appliedAt: 'Oct 5, 2025' },
    { property: '567 Park Ave · NYC',        city: 'NYC', reqs: 8, appliedAt: 'Oct 5, 2025' },
    { property: '112 Grand Concourse · NYC', city: 'NYC', reqs: 8, appliedAt: 'Oct 5, 2025' },
    { property: '789 Oak Ave · NYC',         city: 'NYC', reqs: 8, appliedAt: 'Oct 5, 2025' },
  ],
  changeLog: [
    { icon: '📋', title: 'Template published',        user: 'David R.', date: 'Mar 1, 2026',  detail: 'Status changed: draft → active' },
    { icon: '✏️', title: 'Requirement updated',        user: 'David R.', date: 'Feb 28, 2026', detail: 'STR License: renewal cycle changed from Quarterly to Annual' },
    { icon: '➕', title: 'Requirement added',          user: 'David R.', date: 'Feb 20, 2026', detail: 'Added: Building Insurance COI' },
    { icon: '📋', title: 'Template created as draft', user: 'David R.', date: 'Oct 5, 2025',  detail: '8 requirements imported from NYC Local Law 18 spec' },
  ],
};