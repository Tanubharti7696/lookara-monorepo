import { useState, useRef, useCallback, useEffect } from 'react';
import Toast from '../components/Toast';
import './post-apply.css';

/* ──────────────────────────────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────────────────────────────── */

const APPLY_BANNER = {
  title: 'NYC STR Compliance applied to 789 Oak Ave · NYC',
  sub: '8 compliance items created · Due dates set · Document checklists attached · PM reminders scheduled',
  pills: [
    { tone: 'green', text: '✓ 8 items created' },
    { tone: 'gold',  text: '📅 Due dates set' },
    { tone: 'blue',  text: '🔍 3 inspections ready to schedule' },
  ],
};

const KPIS = [
  { accent: '#DC2626', num: 0, label: 'Overdue',        sub: 'Past due' },
  { accent: '#F59E0B', num: 3, label: 'Due Soon',       sub: 'Within 30 days', newBadge: 'NEW' },
  { accent: '#3B82F6', num: 0, label: 'Scheduled',      sub: 'Booked' },
  { accent: 'rgba(139,92,246,0.9)', num: 0, label: 'Pending Review', sub: 'Docs uploaded' },
  { accent: '#22C55E', num: 8, label: 'Action Required',sub: 'Needs attention', newBadge: '+8 NEW' },
];

const ITEMS = [
  { id: 1, name: 'STR License',             due: 'Jan 1, 2027', docs: '1/1', docsMissing: true,  inspMissing: false, variant: 'missing', status: 'Missing' },
  { id: 2, name: 'Fire Safety Inspection',  due: 'Jun 1, 2026', docs: '2/2', docsMissing: true,  inspMissing: true,  variant: 'missing', status: 'Missing' },
  { id: 3, name: 'Building Insurance COI',  due: 'Mar 15, 2026', docs: '2/2', docsMissing: true, inspMissing: false, variant: 'duesoon', status: 'Due Soon' },
  { id: 4, name: 'Smoke Detector Test',     due: 'Mar 20, 2026', docs: '1/1', docsMissing: true, inspMissing: true,  variant: 'duesoon', status: 'Due Soon' },
  { id: 5, name: 'Gas Line Inspection',     due: 'Apr 2, 2026',  docs: '1/1', docsMissing: true, inspMissing: true,  variant: 'missing', status: 'Missing' },
  { id: 6, name: 'Pest Control Log',        due: 'Mar 30, 2026', docs: '1/1', docsMissing: true, inspMissing: false, variant: 'missing', status: 'Missing' },
  { id: 7, name: 'Liability Insurance',     due: 'Oct 15, 2026', docs: '2/2', docsMissing: true, inspMissing: false, variant: 'missing', status: 'Missing' },
  { id: 8, name: 'Fire Extinguisher Check', due: 'Sep 1, 2026',  docs: '1/1', docsMissing: true, inspMissing: true,  variant: 'missing', status: 'Missing' },
];

const TEMPLATE_MAP = [
  ['requirement.name',                    'item.name',            'Direct copy'],
  ['requirement.type',                    'item.type',            'Direct copy'],
  ['requirement.renewal_cycle',           'item.cycle',           'Direct copy'],
  ['requirement.due_date_month + day',    'item.due',             'Resolved to next occurrence from today'],
  ['requirement.docs_required',           'item.docs[]',          'Each doc → {name, ok: false}'],
  ['requirement.inspection_required',     'item.insp',            'Boolean → inspStatus: "Not Scheduled"'],
  ['requirement.ops_blocker',             'item.blocker',         'Direct copy'],
  ['requirement.priority',                'item.risk',            'critical→HIGH, high→HIGH, medium→MEDIUM'],
  ['template.id',                         'item.source_template', 'Linked for traceability'],
  ['property.id',                         'item.property_id',     'Set on apply'],
];

const AUTO_GENERATED = [
  ['item.compliance_id',  'UUID',                          'Generated fresh per item'],
  ['item.status',         '"missing"',                     'Always starts as missing'],
  ['item.inspStatus',     '"Not Scheduled"',               'If inspection_required = true'],
  ['item.created_at',     'timestamp',                     'ISO 8601 — time of apply'],
  ['item.created_by',     'PM user_id',                    'Who triggered the apply'],
  ['item.timeline[0]',    'Event: "Requirement Created"',  'First timeline entry'],
  ['item.owner',          'property.owner_name',           'Pulled from property record'],
  ['item.prop',           'property.address',              'Pulled from property record'],
  ['item.city',           'property.city',                 'Pulled from property record'],
  ['notifications[]',     'PM + Owner alerts',             'Triggered if template.notify_owner = true'],
];

/* ──────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ────────────────────────────────────────────────────────────────────── */

function ApplyBanner({ data }) {
  return (
    <div className="apply-banner">
      <div className="apply-banner-left">
        <div className="apply-banner-icon">✅</div>
        <div style={{ minWidth: 0 }}>
          <div className="apply-banner-title">{data.title}</div>
          <div className="apply-banner-sub">{data.sub}</div>
        </div>
      </div>
      <div className="apply-banner-pills">
        {data.pills.map((p, i) => (
          <span key={i} className={`apply-pill ${p.tone}`}>{p.text}</span>
        ))}
      </div>
    </div>
  );
}

function DevCallout() {
  return (
    <div className="dev-callout">
      <div style={{ fontSize: 18, flexShrink: 0 }}>🛠</div>
      <div>
        <div className="dev-callout-label">Developer Reference — Post-Apply State</div>
        This is what the Compliance page renders immediately after{' '}
        <code>applyTemplate(templateId, propertyId[])</code> resolves.
        All 8 new items appear in <strong>Needs Action</strong> with status <code>missing</code>
        {' '}— no documents uploaded, no inspections scheduled yet.
        KPI counters update in real time. The NEW badge is a UI-only indicator cleared after first PM view.
      </div>
    </div>
  );
}

function PageHeader({ kpis, onBellClick, onToast }) {
  return (
    <div className="ph-zone">
      <div className="ph-titlebar">
        <div>
          <div className="ph-title">Compliance</div>
          <div className="ph-sub">Track inspections, licenses, insurance, and requirements across your portfolio</div>
        </div>
        <button className="ph-bell" onClick={onBellClick} aria-label="Notifications" style={{ border: '1px solid var(--border)' }}>
          🔔<div className="ph-bell-badge">3</div>
        </button>
      </div>

      <div className="ph-search-row">
        <div className="ph-search-box grow">
          <input
            className="ph-search-input"
            type="text"
            placeholder="🔍  Search compliance items..."
            onChange={(e) => {
              // handled by parent via controlled input if needed; local state is fine
            }}
          />
        </div>
        <div className="ph-search-box">
          <select className="ph-select" defaultValue="NYC">
            <option>City</option>
            <option>NYC</option>
            <option>Miami</option>
            <option>Orlando</option>
          </select>
        </div>
        <div className="ph-search-box">
          <select className="ph-select" defaultValue="789 Oak Ave · NYC">
            <option>Property</option>
            <option>789 Oak Ave · NYC</option>
          </select>
        </div>
      </div>

      <div className="ph-kpi-wrap">
        <div className="ph-kpi-grid">
          {kpis.map((k, i) => (
            <div key={i} className="tk-counter" style={{ '--accent': k.accent }}>
              <div className="tk-counter-num">{k.num}</div>
              <div style={{ minWidth: 0 }}>
                <div className="tk-counter-label">{k.label}</div>
                <div className="tk-counter-sub">{k.sub}</div>
              </div>
              {k.newBadge && <div className="kpi-new-badge">{k.newBadge}</div>}
            </div>
          ))}
        </div>
        <div className="ph-updated">Last updated just now</div>
      </div>
    </div>
  );
}

function ItemRow({ item, onOpen }) {
  return (
    <div
      className={`item-row is-${item.variant}`}
      onClick={() => onOpen(item.name)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(item.name); }}
    >
      <div className="item-main">
        <div className="item-name">{item.name}</div>
        <div className="item-prop">789 Oak Ave · NYC</div>
        <div className="item-meta">
          <span className="meta-pill warn">📅 Due {item.due}</span>
          {item.docsMissing && (
            <span className="meta-pill danger">📎 {item.docs} Docs Missing</span>
          )}
          {item.inspMissing && (
            <span className="meta-pill danger">⚠ Inspection Not Scheduled</span>
          )}
        </div>
      </div>
      <div className="item-actions">
        <span className="item-new-badge">NEW</span>
        <span className={`badge ${item.variant === 'duesoon' ? 'badge-duesoon' : 'badge-missing'}`}>
          {item.status}
        </span>
      </div>
    </div>
  );
}

function Section({ title, color, count, newTag, children }) {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title" style={{ color }}>{title}</div>
        <div className="section-count">{count}</div>
        {newTag && <span className="new-tag">{newTag}</span>}
      </div>
      {children}
    </div>
  );
}

function MappingRow({ from, to, note }) {
  return (
    <div className="mapping-row">
      <span className="mapping-key">{from}</span>
      <span className="mapping-val-wrap">
        <span className="mapping-val">{to}</span>
        <br />
        <span className="mapping-source">{note}</span>
      </span>
    </div>
  );
}

function MappingBox() {
  return (
    <div className="mapping-box">
      <div className="mapping-title">Developer Reference — Field Mapping: Template → Compliance Item</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>
        For each requirement in the template, one compliance item is created per selected property. Here's how fields map:
      </div>

      <div className="mapping-grid">
        <div>
          <div className="mapping-col-title">Template Field → Compliance Item Field</div>
          {TEMPLATE_MAP.map(([f, t, n]) => <MappingRow key={f} from={f} to={t} note={n} />)}
        </div>
        <div>
          <div className="mapping-col-title">Auto-generated on Apply</div>
          {AUTO_GENERATED.map(([f, t, n]) => <MappingRow key={f} from={f} to={t} note={n} />)}
        </div>
      </div>

      <div className="mapping-footer">
        <div className="mapping-col-title">API Endpoint (suggested)</div>
        <div className="api-block">
          <span className="method">POST</span> /api/compliance/apply<br />
          <span className="label">Body:</span> {'{ template_id: "nyc-str", property_ids: ["p4"] }'}<br />
          <span className="label">Returns:</span> {'{ created: 8, items: ComplianceItem[], errors: [] }'}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────────── */

export default function PostApplyPage() {
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const openDrawer = (name) => showToast(`Opens compliance drawer: ${name}`, 'info');

  return (
    <div>
      <ApplyBanner data={APPLY_BANNER} />
      <DevCallout />

      <PageHeader
        kpis={KPIS}
        onBellClick={() => showToast('3 notifications', 'info')}
      />

      <div className="pa-content">
        <div className="dev-annotation">
          🛠
          <div>
            <strong>Section: Needs Action Now</strong> — All 8 items land here on apply.
            Status = <code>missing</code>. No docs uploaded, no inspections scheduled. PM must action each one.
          </div>
        </div>

        <Section
          title="Action Required"
          color="var(--danger)"
          count={ITEMS.length}
          newTag="+8 from NYC STR Compliance"
        >
          <div className="item-list">
            {ITEMS.map((item) => (
              <ItemRow key={item.id} item={item} onOpen={openDrawer} />
            ))}
          </div>
        </Section>

        <div className="dev-annotation">
          🛠
          <div>
            <strong>Sections: Scheduled, Pending Review</strong> — both empty on apply.
            Items move here as PM takes action: schedules inspections → Scheduled; uploads all docs → Pending Review.
          </div>
        </div>

        <Section title="✓ Compliant" color="var(--success)" count={0}>
          <div className="compliant-hint">
            <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 700 }}>✓</span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>
              No compliant items yet — items move here once all docs are uploaded and inspections complete.
            </span>
          </div>
        </Section>

        <MappingBox />
      </div>

      <Toast toast={toast} />
    </div>
  );
}
