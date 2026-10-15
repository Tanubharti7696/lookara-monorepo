import { useState } from 'react';
import { Card, Toggle, useToast } from '../ui';

/* ── Template rule sets ── */
const TEMPLATE_RULES = {
  'Residential STR': [
    { type: 'Water Leak',         response: 15,   responseUnit: 'min', arrival: 45,   arrivalUnit: 'min', completion: 4,   completionUnit: 'hr', escalate: 10, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'HVAC Failure',       response: 30,   responseUnit: 'min', arrival: 120,  arrivalUnit: 'min', completion: 8,   completionUnit: 'hr', escalate: 30, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Lockout',            response: 10,   responseUnit: 'min', arrival: 30,   arrivalUnit: 'min', completion: 1,   completionUnit: 'hr', escalate: 10, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Turnover Cleaning',  response: null, responseUnit: '',    arrival: null, arrivalUnit: 'Before check-in', completion: null, completionUnit: 'Before check-in', escalate: 60, escalateUnit: 'min before', color: '#3B82F6' },
    { type: 'Routine Maintenance', response: null, responseUnit: '',   arrival: 48,   arrivalUnit: 'hr',  completion: 5,   completionUnit: 'days', escalate: 24, escalateUnit: 'hr before', color: '#22C55E' },
    { type: 'Fire Inspection',    response: null, responseUnit: '',    arrival: null, arrivalUnit: 'Scheduled', completion: null, completionUnit: 'Before due date', escalate: 7, escalateUnit: 'days before', color: '#D4AF37' },
  ],
  'Luxury STR': [
    { type: 'Water Leak',         response: 10, responseUnit: 'min', arrival: 30,  arrivalUnit: 'min', completion: 2,   completionUnit: 'hr', escalate: 5,  escalateUnit: 'min before', color: '#DC2626' },
    { type: 'HVAC Failure',       response: 20, responseUnit: 'min', arrival: 60,  arrivalUnit: 'min', completion: 4,   completionUnit: 'hr', escalate: 15, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Lockout',            response: 5,  responseUnit: 'min', arrival: 20,  arrivalUnit: 'min', completion: 45,  completionUnit: 'min', escalate: 5, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Turnover Cleaning',  response: null, responseUnit: '',  arrival: null, arrivalUnit: 'Before check-in', completion: null, completionUnit: 'Before check-in', escalate: 120, escalateUnit: 'min before', color: '#3B82F6' },
    { type: 'Routine Maintenance', response: null, responseUnit: '',  arrival: 24,  arrivalUnit: 'hr', completion: 3,   completionUnit: 'days', escalate: 12, escalateUnit: 'hr before', color: '#22C55E' },
    { type: 'Fire Inspection',    response: null, responseUnit: '',  arrival: null, arrivalUnit: 'Scheduled', completion: null, completionUnit: 'Before due date', escalate: 14, escalateUnit: 'days before', color: '#D4AF37' },
  ],
  'Commercial': [
    { type: 'Water Leak',         response: 30, responseUnit: 'min', arrival: 90,  arrivalUnit: 'min', completion: 8,  completionUnit: 'hr', escalate: 20, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'HVAC Failure',       response: 60, responseUnit: 'min', arrival: 180, arrivalUnit: 'min', completion: 24, completionUnit: 'hr', escalate: 30, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Lockout',            response: 15, responseUnit: 'min', arrival: 45,  arrivalUnit: 'min', completion: 2,  completionUnit: 'hr', escalate: 10, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Turnover Cleaning',  response: null, responseUnit: '',  arrival: null, arrivalUnit: 'Business hours', completion: null, completionUnit: 'Business hours', escalate: 60, escalateUnit: 'min before', color: '#3B82F6' },
    { type: 'Routine Maintenance', response: null, responseUnit: '',  arrival: 72,  arrivalUnit: 'hr', completion: 7,  completionUnit: 'days', escalate: 48, escalateUnit: 'hr before', color: '#22C55E' },
    { type: 'Fire Inspection',    response: null, responseUnit: '',  arrival: null, arrivalUnit: 'Scheduled', completion: null, completionUnit: 'Before due date', escalate: 14, escalateUnit: 'days before', color: '#D4AF37' },
  ],
  'Self Managed': [
    { type: 'Water Leak',         response: 60,  responseUnit: 'min', arrival: 180, arrivalUnit: 'min', completion: 24, completionUnit: 'hr', escalate: 30, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'HVAC Failure',       response: 120, responseUnit: 'min', arrival: 360, arrivalUnit: 'min', completion: 48, completionUnit: 'hr', escalate: 60, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Lockout',            response: 30,  responseUnit: 'min', arrival: 60,  arrivalUnit: 'min', completion: 2,  completionUnit: 'hr', escalate: 15, escalateUnit: 'min before', color: '#DC2626' },
    { type: 'Turnover Cleaning',  response: null, responseUnit: '',   arrival: null, arrivalUnit: 'Before check-in', completion: null, completionUnit: 'Before check-in', escalate: 120, escalateUnit: 'min before', color: '#3B82F6' },
    { type: 'Routine Maintenance', response: null, responseUnit: '',   arrival: 72,  arrivalUnit: 'hr', completion: 14, completionUnit: 'days', escalate: 48, escalateUnit: 'hr before', color: '#22C55E' },
    { type: 'Fire Inspection',    response: null, responseUnit: '',   arrival: null, arrivalUnit: 'Scheduled', completion: null, completionUnit: 'Before due date', escalate: 30, escalateUnit: 'days before', color: '#D4AF37' },
  ],
  'Custom': [
    { type: 'New Rule', response: null, responseUnit: 'min', arrival: null, arrivalUnit: 'min', completion: null, completionUnit: 'hr', escalate: null, escalateUnit: 'min before', color: '#D4AF37' },
  ],
};

const MARKETS = {
  nyc:     { label: 'New York City', org: 'Coastal STR' },
  orlando: { label: 'Orlando',       org: 'Coastal STR' },
  miami:   { label: 'Miami',         org: 'Coastal STR' },
};

const SLA_TMPL_DESCS = {
  'Residential STR': 'This template provides recommended SLA targets for standard short-term rental operations. Applied organization-wide unless overridden per market.',
  'Luxury STR':      'Premium SLA targets for high-end properties. Tighter response windows and elevated service expectations.',
  'Commercial':      'SLA targets tailored for commercial property operations and business-hour scheduling.',
  'Self Managed':    'Relaxed SLA targets for self-managed portfolios with flexible scheduling.',
  'Custom':          'Fully customizable SLA targets. Edit any rule below to match your operational standards.',
};

const TEMPLATE_NAMES = Object.keys(TEMPLATE_RULES);

const deepClone = obj => JSON.parse(JSON.stringify(obj));
const getDefaultRules = tmpl => deepClone(TEMPLATE_RULES[tmpl] || TEMPLATE_RULES['Residential STR']);

const fmt = (val, unit) => (val === null || val === undefined ? (unit || '—') : `${val} ${unit}`);

const ESCALATIONS = [
  { icon: '⏱', title: 'Vendor has not accepted within response window', desc: 'Auto-escalate to next available vendor or PM' },
  { icon: '🚗', title: 'Vendor is late to arrival window',              desc: 'Alert PM and log SLA breach on vendor record' },
  { icon: '🔍', title: 'No eligible vendor exists for task type',       desc: 'Immediately alert PM — task cannot auto-dispatch' },
  { icon: '❌', title: 'Two consecutive vendor declines',               desc: 'Escalate to PM for manual assignment' },
  { icon: '⚠️', title: 'Completion deadline missed',                    desc: 'Log SLA breach, notify PM and owner if enabled' },
  { icon: '📷', title: 'Evidence missing on completion',                desc: 'Vendor marks work complete without required evidence — move to Verification Pending and notify PM' },
];

const IMPACTS = [
  '📊 Dashboard SLA Pressure', '🚀 Auto Dispatch', '⚡ Task Prioritization',
  '🔔 Notifications', '⭐ Vendor Performance', '📈 Reports',
];

const EMPTY_DRAWER_FORM = { response: '', arrival: '', completion: '', escalate: '' };

export default function SLATemplates() {
  const showToast = useToast();
  const [market, setMarket] = useState('nyc');
  const [propertyOverride, setPropertyOverride] = useState(false);
  const [pmOverride, setPmOverride] = useState(true);

  const [data, setData] = useState(() => {
    const d = {};
    Object.keys(MARKETS).forEach(k => {
      d[k] = { template: 'Residential STR', rules: getDefaultRules('Residential STR'), history: {} };
    });
    return d;
  });

  const [drawer, setDrawer] = useState({ open: false, index: null, type: '', color: '#D4AF37' });
  const [form, setForm] = useState(EMPTY_DRAWER_FORM);
  const [priority, setPriority] = useState('Emergency');

  const current = data[market];
  const marketMeta = MARKETS[market];

  const isModified = (rule, index) => {
    const def = getDefaultRules(current.template)[index];
    if (!def || !rule) return false;
    return rule.response !== def.response || rule.arrival !== def.arrival || rule.completion !== def.completion;
  };

  const selectTemplate = (name) => {
    setData(prev => {
      const d = { ...prev };
      const cur = { ...d[market] };
      const prevTemplate = cur.template;
      const history = { ...(cur.history || {}) };

      if (prevTemplate && prevTemplate !== name) {
        history[prevTemplate] = deepClone(cur.rules);
      }

      const rules = history[name] ? deepClone(history[name]) : getDefaultRules(name);
      d[market] = { template: name, rules, history };
      return d;
    });
  };

  const openDrawerForRow = (index) => {
    const rule = current.rules[index];
    if (!rule) return;
    setDrawer({ open: true, index, type: rule.type, color: rule.color });
    setForm({
      response: rule.response ?? '',
      arrival: rule.arrival ?? '',
      completion: rule.completion ?? '',
      escalate: rule.escalate ?? '',
    });
    setPriority('Emergency');
  };

  const openNewRuleDrawer = () => {
    setDrawer({ open: true, index: null, type: 'New SLA Rule', color: '#D4AF37' });
    setForm(EMPTY_DRAWER_FORM);
  };

  const closeDrawer = () => setDrawer(d => ({ ...d, open: false }));

  const resetToDefault = () => {
    if (drawer.index === null) return;
    const def = getDefaultRules(current.template)[drawer.index];
    if (!def) return;
    setForm({
      response: def.response ?? '',
      arrival: def.arrival ?? '',
      completion: def.completion ?? '',
      escalate: def.escalate ?? '',
    });
    showToast(`Reset to ${current.template} template default`, 'info');
  };

  const saveRule = () => {
    const parse = v => (v === '' || v === null ? null : parseFloat(v));
    const r = parse(form.response);
    const a = parse(form.arrival);
    const c = parse(form.completion);
    const e = parse(form.escalate);

    setData(prev => {
      const d = { ...prev };
      const cur = { ...d[market] };
      const rules = [...cur.rules];

      if (drawer.index !== null && rules[drawer.index]) {
        const rule = { ...rules[drawer.index] };
        if (r !== null && !isNaN(r)) rule.response = r;
        if (a !== null && !isNaN(a)) rule.arrival = a;
        if (c !== null && !isNaN(c)) rule.completion = c;
        if (e !== null && !isNaN(e)) rule.escalate = e;
        rules[drawer.index] = rule;
      } else {
        rules.push({
          type: drawer.type || 'New Rule',
          response: r, responseUnit: 'min',
          arrival: a, arrivalUnit: 'min',
          completion: c, completionUnit: 'hr',
          escalate: e, escalateUnit: 'min before',
          color: '#D4AF37',
        });
      }

      d[market] = { ...cur, rules };
      return d;
    });

    closeDrawer();
    showToast('SLA rule saved', 'success');
  };

  const marketScopeLabel = `${marketMeta.org} · ${marketMeta.label}`;
  const drawerRule = drawer.index !== null ? current.rules[drawer.index] : null;
  const modified = drawerRule ? isModified(drawerRule, drawer.index) : false;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>SLA Templates</div>
        <div style={{ fontSize: 14, color: 'var(--white-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Lookara includes built-in SLA templates based on industry best practices. The selected template provides the
          SLA Rule Table, which automatically governs:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
          {[
            'Response targets', 'Notification triggers', 'Arrival targets', 'Dashboard SLA indicators',
            'Completion targets', 'Task prioritization', 'Escalation timing', 'Vendor performance metrics',
          ].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--white-muted)' }}>
              <span style={{ color: '#D4AF37' }}>·</span> {t}
            </div>
          ))}
        </div>

        {[
          "The SLA Rule Table is the system's default operational engine and requires no initial configuration.",
          'Property Managers may optionally customize individual SLA rules to match their operational policies. Any customization overrides the selected template for that organization only.',
          'Templates provide recommended operational targets based on common property management practices. Organizations may customize any rule to match local market conditions, vendor availability, or internal service standards.',
        ].map((p, i) => (
          <div key={i} style={{ fontSize: 13, color: 'var(--white-muted)', lineHeight: 1.6, marginTop: i === 0 ? 0 : 12 }}>
            {p}
          </div>
        ))}
      </div>

      <Card style={{ marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>Override Permissions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>Allow Property-Level Overrides</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 2 }}>
                Individual properties can deviate from the portfolio SLA template
              </div>
            </div>
            <Toggle active={propertyOverride} onToggle={() => {
              setPropertyOverride(v => !v);
              showToast((!propertyOverride ? 'Enabled: ' : 'Disabled: ') + 'Property-Level Overrides', !propertyOverride ? 'success' : 'info');
            }} style={{ marginLeft: 16 }} />
          </label>

          <div style={{ borderTop: '1px solid var(--border)' }} />

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>Allow PM Task-Level Overrides</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 2 }}>
                PMs can adjust SLA targets on individual tasks when needed
              </div>
            </div>
            <Toggle active={pmOverride} onToggle={() => {
              setPmOverride(v => !v);
              showToast((!pmOverride ? 'Enabled: ' : 'Disabled: ') + 'PM Task-Level Overrides', !pmOverride ? 'success' : 'info');
            }} style={{ marginLeft: 16 }} />
          </label>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{
          background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 8, padding: 14, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>Market</div>
              <div style={{ fontSize: 12, color: 'var(--white-muted)', marginTop: 2 }}>
                Auto-detected from property addresses{' '}
                <span style={{
                  background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                  borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 700,
                }}>Auto</span>
              </div>
            </div>
            <select
              className="input"
              value={market}
              onChange={e => setMarket(e.target.value)}
              style={{ minWidth: 160, fontSize: 13, padding: '7px 12px' }}
            >
              {Object.entries(MARKETS).map(([key, m]) => (
                <option key={key} value={key}>{m.label}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 12, color: 'var(--white-muted)', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            SLA changes apply to: <span style={{ color: 'var(--white)', fontWeight: 600 }}>{marketScopeLabel}</span>
            {' '}· Changes are saved per organization + market.
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>
          Active Template — <span style={{ color: 'var(--white-muted)', fontWeight: 500 }}>{current.template}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEMPLATE_NAMES.map(name => (
            <button
              key={name}
              className={`sla-tmpl-btn${current.template === name ? ' active' : ''}`}
              onClick={() => selectTemplate(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--white-muted)' }}>
          {SLA_TMPL_DESCS[current.template]}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>SLA Rule Table</div>
          <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>Select a rule to modify</div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Task Type', 'Response', 'Arrival', 'Completion', 'Escalate'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700,
                    color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {current.rules.map((r, i) => (
                <tr key={`${r.type}-${i}`} className="sla-row" onClick={() => openDrawerForRow(i)}>
                  <td style={{ padding: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{r.type}</span>
                    </span>
                  </td>
                  <td style={{ padding: 10, fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>
                    {fmt(r.response, r.responseUnit)}
                  </td>
                  <td style={{ padding: 10, fontSize: 13, color: 'var(--white-muted)' }}>
                    {fmt(r.arrival, r.arrivalUnit)}
                  </td>
                  <td style={{ padding: 10, fontSize: 13, color: 'var(--white-muted)' }}>
                    {fmt(r.completion, r.completionUnit)}
                  </td>
                  <td style={{ padding: 10, fontSize: 13, color: 'var(--white-muted)' }}>
                    {fmt(r.escalate, r.escalateUnit)}
                  </td>
                  <td style={{ padding: 10, textAlign: 'right', fontSize: 13, color: 'var(--white-muted)' }}>›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>
            {current.rules.length} rules · {current.template} template
          </div>
          <button className="btn btn-outline btn-small" onClick={openNewRuleDrawer}>+ New SLA Rule</button>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 14 }}>Escalation Rules</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ESCALATIONS.map(e => (
            <div key={e.title} className="sla-esc-row">
              <span style={{ fontSize: 14 }}>{e.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{e.title}</div>
                <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 1 }}>{e.desc}</div>
              </div>
              <span className="sla-esc-badge active">Active</span>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ background: 'rgba(212,175,55,0.04)', borderColor: 'rgba(212,175,55,0.15)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>These SLA rules affect</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {IMPACTS.map(t => <div key={t} className="sla-impact-item">{t}</div>)}
          <div className="sla-impact-item" style={{ gridColumn: '1 / -1' }}>🤖 AI Recommendations</div>
        </div>
      </Card>

      {/* SLA Drawer */}
      <div className={`sla-drawer-backdrop${drawer.open ? ' open' : ''}`} onClick={closeDrawer} />
      <div className={`sla-drawer${drawer.open ? ' open' : ''}`}>
        <div style={{
          padding: 20, borderBottom: '1px solid var(--border)', flexShrink: 0,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: drawer.index === null ? 'var(--white)' : drawer.color }}>
              {drawer.type}
            </div>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 2 }}>
              {drawer.index === null ? 'Define a new rule for this template' : 'Edit SLA Rule · Active Template'}
            </div>
          </div>
          <button onClick={closeDrawer} style={{
            background: 'none', border: 'none', color: 'var(--white-muted)',
            fontSize: 18, cursor: 'pointer', padding: '2px 6px',
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '10px 14px', marginBottom: 16,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.5px', color: 'var(--white-muted)', marginBottom: 8,
            }}>Scope</div>
            {[
              ['Organization', marketMeta.org],
              ['Market', marketMeta.label],
              ['Template', current.template],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 13,
                marginBottom: i < arr.length - 1 ? 5 : 0,
              }}>
                <span style={{ color: 'var(--white-muted)' }}>{k}</span>
                <span style={{ color: 'var(--white)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: 'var(--white-muted)', marginBottom: 12,
          }}>SLA Targets</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { key: 'response',   label: 'Response Time',     unit: drawerRule?.responseUnit ?? 'min',       hint: 'Time to acknowledge task' },
              { key: 'arrival',    label: 'Arrival Window',    unit: drawerRule?.arrivalUnit ?? 'min',        hint: 'Time to be on-site' },
              { key: 'completion', label: 'Completion Target', unit: drawerRule?.completionUnit ?? 'hr',      hint: 'Task must be done by' },
              { key: 'escalate',   label: 'Escalate At',       unit: drawerRule?.escalateUnit ?? 'min before', hint: 'Before deadline' },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white-muted)', marginBottom: 5 }}>{f.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={form[f.key]}
                    onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))}
                    style={{
                      flex: 1, background: '#1B1F26', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '8px 12px', color: 'var(--white)',
                      fontSize: 14, fontFamily: 'inherit', outline: 'none', colorScheme: 'dark',
                    }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--white-muted)', whiteSpace: 'nowrap', minWidth: 32 }}>
                    {f.unit}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--white-muted)', marginTop: 4 }}>{f.hint}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)', marginBottom: 16,
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>
                Source: <span style={{ color: 'var(--white)', fontWeight: 600 }}>{current.template} Template</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--white-muted)', marginTop: 2 }}>
                Market adjustment: <span style={{ color: 'var(--white)' }}>None</span>
              </div>
              {modified && (
                <div style={{ fontSize: 12, color: '#F59E0B', marginTop: 2 }}>
                  Organization override: Modified
                </div>
              )}
            </div>
            <button
              onClick={resetToDefault}
              disabled={drawer.index === null}
              style={{
                fontSize: 12, fontWeight: 700, color: '#F59E0B',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 6, padding: '5px 12px',
                cursor: drawer.index === null ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: drawer.index === null ? 0.4 : 1,
              }}
            >
              ↺ Reset to Default
            </button>
          </div>

          <div style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: 'var(--white-muted)', marginBottom: 10,
          }}>Priority</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['Emergency', 'High', 'Medium', 'Low'].map(p => {
              const active = priority === p;
              const isEmergency = p === 'Emergency';
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${active ? (isEmergency ? '#DC2626' : '#D4AF37') : 'var(--border)'}`,
                    background: active ? (isEmergency ? 'rgba(220,38,38,0.15)' : 'rgba(212,175,55,0.12)') : 'transparent',
                    color: active ? (isEmergency ? '#DC2626' : '#D4AF37') : 'var(--white-muted)',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <div style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: 'var(--white-muted)', marginBottom: 8,
          }}>Internal Notes</div>
          <textarea
            placeholder="Notes for your team about this rule..."
            style={{
              width: '100%', background: '#1B1F26', border: '1px solid var(--border)',
              borderRadius: 6, padding: '8px 12px', color: 'var(--white)',
              fontSize: 13, fontFamily: 'inherit', outline: 'none',
              resize: 'vertical', minHeight: 60, colorScheme: 'dark',
            }}
          />
        </div>

        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, flexShrink: 0,
        }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveRule}>
            {drawer.index === null ? 'Create Rule' : 'Save Rule'}
          </button>
          <button className="btn btn-outline" onClick={closeDrawer}>Cancel</button>
        </div>
      </div>
    </>
  );
}
