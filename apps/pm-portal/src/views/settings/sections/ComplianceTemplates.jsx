import { useMemo, useState, useEffect } from 'react';
import { Card, useToast } from '../ui';
import { apiFetch } from '../../../utils/api';

/* ── Template data ── */
const DEFAULT_CT_TEMPLATES = {
  'nyc-str': {
    id: 'nyc-str', name: 'NYC STR Compliance', icon: '🗽',
    jurisdiction: 'New York City', cycle: 'Annual', status: 'active',
    desc: 'Short-term rental requirements for New York City properties',
    autoRemind: true, blockOps: true, notifyOwner: true,
    requirements: [
      { name: 'STR License',            type: 'License',     cycle: 'Annual',    dueMonth: 1,  dueDay: 1,  docsRequired: ['NYC STR License Certificate'], inspectionRequired: false, opsBlocker: true },
      { name: 'Fire Safety Inspection', type: 'Inspection',  cycle: 'Annual',    dueMonth: 6,  dueDay: 1,  docsRequired: ['Fire Inspection Certificate', 'Safety Checklist'], inspectionRequired: true, opsBlocker: true },
      { name: 'Building Insurance COI', type: 'Insurance',   cycle: 'Annual',    dueMonth: 3,  dueDay: 15, docsRequired: ['Certificate of Insurance', 'Policy Declaration'], inspectionRequired: false, opsBlocker: true },
      { name: 'Smoke Detector Test',    type: 'Inspection',  cycle: 'Annual',    dueMonth: 3,  dueDay: 20, docsRequired: ['Detector Test Report'], inspectionRequired: true, opsBlocker: false },
      { name: 'Gas Line Inspection',    type: 'Inspection',  cycle: 'Annual',    dueMonth: 4,  dueDay: 2,  docsRequired: ['Gas Inspection Certificate'], inspectionRequired: true, opsBlocker: false },
      { name: 'Pest Control Log',       type: 'Certificate', cycle: 'Quarterly', dueMonth: 3,  dueDay: 30, docsRequired: ['Pest Control Report'], inspectionRequired: false, opsBlocker: false },
      { name: 'Liability Insurance',    type: 'Insurance',   cycle: 'Annual',    dueMonth: 10, dueDay: 15, docsRequired: ['Liability Policy', 'Endorsement Page'], inspectionRequired: false, opsBlocker: false },
      { name: 'Fire Extinguisher Check', type: 'Inspection', cycle: 'Annual',    dueMonth: 9,  dueDay: 1,  docsRequired: ['Extinguisher Tag'], inspectionRequired: true, opsBlocker: false },
    ],
    appliedTo: ['345 Henry St · NYC', '567 Park Ave · NYC', '112 Grand Concourse · NYC', '789 Oak Ave · NYC'],
  },
  'fl-str': {
    id: 'fl-str', name: 'Florida STR Compliance', icon: '🌴',
    jurisdiction: 'Florida / Orange County', cycle: 'Annual', status: 'active',
    desc: 'State and county requirements for Florida properties',
    autoRemind: true, blockOps: true, notifyOwner: true,
    requirements: [
      { name: 'FL STR License',         type: 'License',     cycle: 'Annual',      dueMonth: 12, dueDay: 1,  docsRequired: ['FL STR License Certificate'], inspectionRequired: false, opsBlocker: true },
      { name: 'HOA Certificate',        type: 'HOA',         cycle: 'Annual',      dueMonth: 1,  dueDay: 1,  docsRequired: ['HOA Certificate'], inspectionRequired: false, opsBlocker: false },
      { name: 'Liability Insurance',    type: 'Insurance',   cycle: 'Annual',      dueMonth: 10, dueDay: 15, docsRequired: ['Liability COI'], inspectionRequired: false, opsBlocker: false },
      { name: 'Fire Safety Inspection', type: 'Inspection',  cycle: 'Annual',      dueMonth: 6,  dueDay: 1,  docsRequired: ['Fire Safety Certificate'], inspectionRequired: true, opsBlocker: true },
      { name: 'Pool Safety Certificate', type: 'Certificate', cycle: 'Semi-annual', dueMonth: 4, dueDay: 1,  docsRequired: ['Pool Safety Certificate', 'Water Quality Test'], inspectionRequired: true, opsBlocker: false },
      { name: 'Smoke Detector Test',    type: 'Inspection',  cycle: 'Annual',      dueMonth: 3,  dueDay: 20, docsRequired: ['Detector Test Report'], inspectionRequired: true, opsBlocker: false },
    ],
    appliedTo: ['12 Ocean Dr · Miami', '88 Lake Eola · Orlando'],
  },
  'pool': {
    id: 'pool', name: 'Pool Safety Pack', icon: '🏊',
    jurisdiction: 'All markets', cycle: 'Semi-annual', status: 'draft',
    desc: 'Safety certificates, barrier checks, water quality',
    autoRemind: true, blockOps: false, notifyOwner: false,
    requirements: [
      { name: 'Pool Safety Certificate', type: 'Certificate', cycle: 'Semi-annual', dueMonth: 4,  dueDay: 1, docsRequired: ['Pool Safety Certificate'], inspectionRequired: true, opsBlocker: false },
      { name: 'Water Quality Test',      type: 'Certificate', cycle: 'Semi-annual', dueMonth: 10, dueDay: 1, docsRequired: ['Water Quality Report'], inspectionRequired: false, opsBlocker: false },
      { name: 'Barrier Inspection',      type: 'Inspection',  cycle: 'Annual',      dueMonth: 4,  dueDay: 1, docsRequired: ['Barrier Inspection Report'], inspectionRequired: true, opsBlocker: false },
      { name: 'Lifesaving Equipment Log', type: 'Certificate', cycle: 'Annual',     dueMonth: 4,  dueDay: 1, docsRequired: ['Equipment Inventory Log'], inspectionRequired: false, opsBlocker: false },
    ],
    appliedTo: [],
  },
  'gas': {
    id: 'gas', name: 'Gas Inspection Pack', icon: '⛽',
    jurisdiction: 'All markets', cycle: 'Annual', status: 'active',
    desc: 'Gas line safety and annual inspection requirements',
    autoRemind: true, blockOps: true, notifyOwner: false,
    requirements: [
      { name: 'Gas Line Inspection',     type: 'Inspection',  cycle: 'Annual', dueMonth: 4, dueDay: 2, docsRequired: ['Gas Inspection Certificate'], inspectionRequired: true, opsBlocker: true },
      { name: 'Gas Safety Certificate',  type: 'Certificate', cycle: 'Annual', dueMonth: 4, dueDay: 2, docsRequired: ['Gas Safety Certificate'], inspectionRequired: false, opsBlocker: false },
      { name: 'Carbon Monoxide Detector', type: 'Inspection', cycle: 'Annual', dueMonth: 9, dueDay: 1, docsRequired: ['CO Detector Test Report'], inspectionRequired: true, opsBlocker: false },
    ],
    appliedTo: ['345 Henry St · NYC', '789 Oak Ave · NYC'],
  },
  'fire': {
    id: 'fire', name: 'Fire Safety Pack', icon: '🔥',
    jurisdiction: 'All markets', cycle: 'Annual', status: 'active',
    desc: 'Detectors, extinguishers, egress, fire certificate',
    autoRemind: true, blockOps: true, notifyOwner: true,
    requirements: [
      { name: 'Fire Safety Inspection',  type: 'Inspection',  cycle: 'Annual', dueMonth: 6, dueDay: 1,  docsRequired: ['Fire Inspection Certificate'], inspectionRequired: true, opsBlocker: true },
      { name: 'Fire Extinguisher Check', type: 'Inspection',  cycle: 'Annual', dueMonth: 9, dueDay: 1,  docsRequired: ['Extinguisher Tag'], inspectionRequired: true, opsBlocker: false },
      { name: 'Smoke Detector Test',     type: 'Inspection',  cycle: 'Annual', dueMonth: 3, dueDay: 20, docsRequired: ['Detector Test Report'], inspectionRequired: true, opsBlocker: false },
      { name: 'Egress Route Inspection', type: 'Inspection',  cycle: 'Annual', dueMonth: 6, dueDay: 1,  docsRequired: ['Egress Inspection Report'], inspectionRequired: true, opsBlocker: false },
      { name: 'Fire Safety Certificate', type: 'Certificate', cycle: 'Annual', dueMonth: 6, dueDay: 1,  docsRequired: ['Fire Safety Certificate'], inspectionRequired: false, opsBlocker: true },
    ],
    appliedTo: ['345 Henry St · NYC', '567 Park Ave · NYC', '12 Ocean Dr · Miami'],
  },
};

const ALL_PROPERTIES = [
  ['p1', '145 Henry St', 'NYC'], ['p2', '245 Park Ave', 'NYC'], ['p3', '345 Grand Concourse', 'NYC'],
  ['p4', '445 Oak Ave', 'NYC'], ['p5', '545 Madison Ave', 'NYC'], ['p6', '645 Lexington Ave', 'NYC'],
  ['p7', '745 Amsterdam Ave', 'NYC'], ['p8', '845 Broadway', 'NYC'], ['p9', '945 Riverside Dr', 'NYC'],
  ['p10', '1045 West End Ave', 'NYC'], ['p11', '1145 Columbus Ave', 'NYC'], ['p12', '1245 Central Park West', 'NYC'],
  ['p13', '1345 Fifth Ave', 'NYC'], ['p14', '1445 Seventh Ave', 'NYC'], ['p15', '1545 Eighth Ave', 'NYC'],
  ['p16', '1645 Fulton St', 'NYC'], ['p17', '1745 Atlantic Ave', 'NYC'], ['p18', '1845 Bedford Ave', 'NYC'],
  ['p19', '1945 Court St', 'NYC'], ['p20', '2045 Flatbush Ave', 'NYC'],
  ['p21', '22 Ocean Dr', 'Miami'], ['p22', '32 Collins Ave', 'Miami'], ['p23', '42 Washington Ave', 'Miami'],
  ['p24', '52 Biscayne Blvd', 'Miami'], ['p25', '62 Coral Way', 'Miami'], ['p26', '72 SW 8th St', 'Miami'],
  ['p27', '82 NW 2nd Ave', 'Miami'], ['p28', '92 Brickell Ave', 'Miami'], ['p29', '102 Bayshore Dr', 'Miami'],
  ['p30', '112 Miracle Mile', 'Miami'],
  ['p31', '88 Lake Eola Dr', 'Orlando'], ['p32', '96 Orange Ave', 'Orlando'], ['p33', '104 Colonial Dr', 'Orlando'],
  ['p34', '112 Sand Lake Rd', 'Orlando'], ['p35', '120 International Dr', 'Orlando'], ['p36', '128 Vineland Ave', 'Orlando'],
  ['p37', '136 Oak Ridge Rd', 'Orlando'], ['p38', '144 Goldenrod Rd', 'Orlando'], ['p39', '152 Alafaya Trail', 'Orlando'],
  ['p40', '160 University Blvd', 'Orlando'],
].map(([id, name, city]) => ({ id, name, city, full: `${name} · ${city}` }));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TYPE_COLORS = { Inspection: '#3B82F6', License: '#D4AF37', Insurance: '#06B6D4', Certificate: '#22C55E', HOA: '#F59E0B' };

function CTEditorDrawer({ open, mode, template, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [desc, setDesc] = useState('');
  const [cycle, setCycle] = useState('Annual');
  const [reqs, setReqs] = useState([]);
  const [behaviour, setBehaviour] = useState({ autoRemind: true, blockOps: true, notifyOwner: true });

  useMemo(() => {
    if (!open) return;
    if (mode === 'new') {
      setName(''); setJurisdiction(''); setDesc(''); setCycle('Annual'); setReqs([]);
      setBehaviour({ autoRemind: true, blockOps: true, notifyOwner: true });
    } else if (template) {
      setName(template.name); setJurisdiction(template.jurisdiction);
      setDesc(template.desc); setCycle(template.cycle || 'Annual');
      setReqs(template.requirements ? [...template.requirements] : []);
      setBehaviour({
        autoRemind: template.autoRemind ?? true,
        blockOps: template.blockOps ?? true,
        notifyOwner: template.notifyOwner ?? true,
      });
    }
  }, [open, mode, template]);

  const addReq = (type) => setReqs(r => [...r, {
    name: `New ${type}`, type, cycle: 'Annual', dueMonth: 1, dueDay: 1,
    docsRequired: [], inspectionRequired: type === 'Inspection', opsBlocker: false,
  }]);

  const removeReq = (i) => setReqs(r => r.filter((_, idx) => idx !== i));
  const isActive = mode !== 'new' && template?.status === 'active';

  return (
    <>
      <div className={`sla-drawer-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`sla-drawer${open ? ' open' : ''}`} style={{ width: 500 }}>
        <div style={{
          padding: 20, borderBottom: '1px solid var(--border)', flexShrink: 0,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)' }}>
              {mode === 'new' ? 'New Template' : template?.name || 'Edit Template'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 2 }}>
              {mode === 'new' ? 'Create a new compliance requirement pack' : `Editing: ${template?.jurisdiction || ''}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px',
              background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
              color: isActive ? '#22C55E' : '#3B82F6',
              border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
            }}>
              {isActive ? 'ACTIVE' : 'DRAFT'}
            </span>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'var(--white-muted)',
              fontSize: 18, cursor: 'pointer', padding: '2px 6px',
            }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={sectionLabel}>Template Identity</div>

          <div style={{ marginBottom: 12 }}>
            <div style={fieldLabel}>Template Name <span style={{ color: '#DC2626' }}>*</span></div>
            <input style={textInput} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NYC STR Compliance" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div>
              <div style={fieldLabel}>Jurisdiction</div>
              <input style={textInput} value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} placeholder="e.g. New York City" />
            </div>
            <div>
              <div style={fieldLabel}>Default Renewal Cycle</div>
              <select style={{ ...textInput, cursor: 'pointer' }} value={cycle} onChange={e => setCycle(e.target.value)}>
                <option>Annual</option><option>Semi-annual</option>
                <option>Quarterly</option><option>Monthly</option><option>One-time</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={fieldLabel}>Description</div>
            <textarea rows={2} style={{ ...textInput, resize: 'vertical' }}
              value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="What does this template cover?" />
          </div>

          <div style={sectionLabel}>Requirements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {reqs.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 7,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[r.type] || '#6B7280', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>
                    {r.type} · Due {MONTHS[r.dueMonth - 1]} {r.dueDay} · {r.docsRequired.length} doc{r.docsRequired.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button onClick={() => removeReq(i)} style={{
                  background: 'none', border: 'none', color: 'var(--white-muted)',
                  cursor: 'pointer', fontSize: 14, padding: '2px 5px',
                }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['Inspection', 'License', 'Insurance', 'Certificate'].map(t => (
              <button key={t} onClick={() => addReq(t)} style={{
                fontSize: 12, fontWeight: 700, padding: '6px 12px',
                border: '1px dashed var(--border)', borderRadius: 6,
                background: 'transparent', color: 'var(--white-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>+ {t}</button>
            ))}
          </div>

          <div style={sectionLabel}>Behaviour</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              ['autoRemind', 'Auto-remind PM 30 days before each due date', '#D4AF37'],
              ['blockOps', 'Block operations if overdue', '#DC2626'],
              ['notifyOwner', 'Notify owner on overdue', '#D4AF37'],
            ].map(([key, label, color]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={behaviour[key]}
                  onChange={() => setBehaviour(b => ({ ...b, [key]: !b[key] }))}
                  style={{ accentColor: color, width: 16, height: 16 }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn btn-primary" style={{ flex: 1 }}
            onClick={() => onSave({ name, jurisdiction, desc, cycle, requirements: reqs, ...behaviour })}>
            {mode === 'new' ? 'Create Template' : 'Save Template'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          {mode !== 'new' && (
            <button className="btn btn-outline" onClick={onDelete}
              style={{ color: '#DC2626', borderColor: 'rgba(220,38,38,0.3)' }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const sectionLabel = {
  fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.5px', color: 'var(--white-muted)', marginBottom: 10,
};
const fieldLabel = { fontSize: 12, fontWeight: 700, color: 'var(--white-muted)', marginBottom: 5 };
const textInput = {
  width: '100%', background: '#1B1F26', border: '1px solid var(--border)',
  borderRadius: 6, padding: '8px 12px', color: 'var(--white)', fontSize: 14,
  fontFamily: 'inherit', outline: 'none', colorScheme: 'dark',
};

function CTApplyModal({ open, templateId, templates, onClose, onApplied }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [mode, setMode] = useState('single');
  const [search, setSearch] = useState('');

  const tmpl = templateId ? templates[templateId] : null;

  const reset = () => { setStep(1); setSelected(new Set()); setMode('single'); setSearch(''); };
  const close = () => { onClose(); reset(); };

  const markets = useMemo(() => {
    const m = {};
    ALL_PROPERTIES.forEach(p => { (m[p.city] ||= []).push(p); });
    return m;
  }, []);

  const filteredProps = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_PROPERTIES.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleProp = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleGroup = (city) => {
    const props = markets[city] || [];
    const allSel = props.every(p => selected.has(p.id));
    setSelected(s => {
      const n = new Set(s);
      props.forEach(p => allSel ? n.delete(p.id) : n.add(p.id));
      return n;
    });
  };

  const setSelMode = (m) => {
    setMode(m);
    setSelected(new Set());
    if (m === 'all') {
      setSelected(new Set(ALL_PROPERTIES.map(p => p.id)));
    }
  };

  const selectedProps = ALL_PROPERTIES.filter(p => selected.has(p.id));
  const total = (tmpl?.requirements?.length || 0) * selectedProps.length;

  const next = () => {
    if (step === 1) { setStep(2); return; }
    if (step === 2) {
      onApplied(templateId, selectedProps);
      setStep(3);
    }
  };

  const stepDot = (n) => {
    const cls = n === step ? 'active' : n < step ? 'done' : '';
    return <div className={`ct-step-dot ${cls}`}>{n < step ? '✓' : n}</div>;
  };
  const stepLbl = (n, label) => {
    const cls = n === step ? 'active' : n < step ? 'done' : '';
    return <span className={`ct-step-lbl ${cls}`}>{label}</span>;
  };

  return (
    <div className={`modal-backdrop${open ? ' open' : ''}`}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={close} />
      <div className="modal-box" style={{ width: 600, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="modal-title">Apply Template</div>
            <div className="modal-sub" style={{ marginBottom: 0 }}>
              Step {step} of 2 — {step === 1 ? 'Select Properties' : step === 2 ? 'Confirm & Apply' : 'Done'}
            </div>
          </div>
          <button onClick={close} style={{
            background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: 18, cursor: 'pointer',
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          <div className="ct-step-item">{stepDot(1)}{stepLbl(1, 'Select Properties')}</div>
          <div className={`ct-step-line ${step > 1 ? 'done' : ''}`} />
          <div className="ct-step-item">{stepDot(2)}{stepLbl(2, 'Confirm')}</div>
          <div className={`ct-step-line ${step > 2 ? 'done' : ''}`} />
          <div className="ct-step-item">{stepDot(3)}{stepLbl(3, 'Done')}</div>
        </div>

        {step === 1 && (
          <>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 14 }}>
              Select the properties to apply <strong style={{ color: 'var(--white)' }}>{tmpl?.name || 'this template'}</strong> to.
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[['single', 'Single'], ['group', 'By Market'], ['all', 'All']].map(([key, label]) => (
                <button key={key} onClick={() => setSelMode(key)} style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${mode === key ? '#D4AF37' : 'var(--border)'}`,
                  background: mode === key ? 'rgba(212,175,55,0.12)' : 'transparent',
                  color: mode === key ? '#D4AF37' : 'var(--white-muted)',
                }}>{label}</button>
              ))}
            </div>

            {mode === 'single' && (
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search properties..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  padding: '7px 12px', color: 'var(--white)', fontSize: 13,
                  fontFamily: 'inherit', outline: 'none', marginBottom: 10,
                }}
              />
            )}

            {mode === 'group' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(markets).map(([city, props]) => {
                    const allSel = props.every(p => selected.has(p.id));
                    const someSel = props.some(p => selected.has(p.id));
                    const applied = props.filter(p => tmpl?.appliedTo?.includes(p.full)).length;
                    return (
                      <div key={city} onClick={() => toggleGroup(city)} style={{
                        padding: '10px 16px', borderRadius: 8,
                        border: `2px solid ${allSel ? '#D4AF37' : 'var(--border)'}`,
                        background: allSel ? 'rgba(212,175,55,0.08)' : someSel ? 'rgba(212,175,55,0.04)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', transition: 'all 0.15s', minWidth: 120, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: allSel ? '#D4AF37' : 'var(--white)' }}>{city}</div>
                        <div style={{ fontSize: 12, color: 'var(--white-muted)', marginTop: 3 }}>{props.length} properties</div>
                        {applied > 0 && <div style={{ fontSize: 11, color: '#22C55E', marginTop: 2 }}>{applied} applied</div>}
                        {allSel && <div style={{ fontSize: 11, color: '#D4AF37', marginTop: 2, fontWeight: 700 }}>✓ Selected</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white-muted)' }}>
                {selected.size} propert{selected.size === 1 ? 'y' : 'ies'} selected
              </div>
            </div>

            {mode !== 'all' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                {(mode === 'single' ? filteredProps : ALL_PROPERTIES).map(p => {
                  const sel = selected.has(p.id);
                  const hasIt = tmpl?.appliedTo?.includes(p.full);
                  return (
                    <div key={p.id} className={`ct-prop-item${sel ? ' selected' : ''}`} onClick={() => toggleProp(p.id)}>
                      <div className="ct-prop-checkbox">{sel ? '✓' : ''}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>{p.city}</div>
                      </div>
                      {hasIt && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: '#22C55E',
                          background: 'rgba(34,197,94,0.1)', borderRadius: 4,
                          padding: '2px 7px', border: '1px solid rgba(34,197,94,0.25)',
                        }}>Applied</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 14, marginBottom: 14,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: 'var(--white-muted)', marginBottom: 10,
              }}>Apply Summary</div>
              {[
                ['Template', tmpl?.name || '—'],
                ['Requirements', `${tmpl?.requirements?.length || 0} per property`],
                ['Properties', selectedProps.map(p => p.name).join(', ')],
                ['Items to create', ''],
              ].map(([l, v], i) => (
                <div key={l} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14,
                }}>
                  <span style={{ color: 'var(--white-muted)' }}>{l}</span>
                  {i === 3
                    ? <span style={{ color: '#D4AF37', fontWeight: 800 }}>{total} compliance items</span>
                    : <span style={{ fontWeight: 600 }}>{v}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)', marginBottom: 6 }}>Template Applied</div>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 20 }}>
              {total} compliance items created across {selectedProps.length} properties.
            </div>
            <button className="btn btn-primary" onClick={close}>Done</button>
          </div>
        )}

        {step < 3 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>
              {selected.size > 0 && `${selected.size} properties selected`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {step > 1 && (
                <button className="btn btn-outline" onClick={() => setStep(step - 1)}>← Back</button>
              )}
              <button className="btn btn-primary" onClick={next} disabled={selected.size === 0}>
                {selected.size === 0 ? 'Select Properties First' : step === 1 ? 'Next →' : '✓ Apply Template'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CTManageDrawer({ open, propertyFull, appliedNames, templates, onClose, onRemove }) {
  const TYPE_ICONS = { 'NYC STR': '🗽', 'Florida STR': '🌴', 'Pool Safety': '🏊', Gas: '⛽', 'Fire Safety': '🔥' };

  return (
    <>
      <div className={`sla-drawer-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`sla-drawer${open ? ' open' : ''}`} style={{ width: 440 }}>
        <div style={{
          padding: 20, borderBottom: '1px solid var(--border)', flexShrink: 0,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--white)' }}>Manage Templates</div>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 2 }}>{propertyFull}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--white-muted)', fontSize: 18, cursor: 'pointer',
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {appliedNames.map(name => {
              const tmplId = Object.keys(templates).find(k => templates[k].name.includes(name.split(',')[0]));
              const tmpl = tmplId ? templates[tmplId] : null;
              const icon = Object.entries(TYPE_ICONS).find(([k]) => name.includes(k))?.[1] || '📋';
              return (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 8,
                }}>
                  <div style={{ fontSize: 18 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{name} Compliance</div>
                    <div style={{ fontSize: 12, color: 'var(--white-muted)', marginTop: 2 }}>
                      {tmpl?.requirements?.length || '—'} requirements · {tmpl?.cycle || 'Annual'}
                    </div>
                  </div>
                  <button onClick={() => onRemove(name, propertyFull)} style={{
                    fontSize: 12, fontWeight: 700, color: '#DC2626',
                    background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
                    borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Remove</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ComplianceTemplates() {
  const showToast = useToast();
  const [templates, setTemplates] = useState(() => JSON.parse(JSON.stringify(DEFAULT_CT_TEMPLATES)));

  const [editor, setEditor] = useState({ open: false, mode: 'edit', id: null });
  const [apply, setApply] = useState({ open: false, templateId: null });
  const [manage, setManage] = useState({ open: false, propertyFull: '', names: [] });

  const [mapSearch, setMapSearch] = useState('');
  const [mapCity, setMapCity] = useState('');

  useEffect(() => {
    apiFetch('/api/v1/compliance/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = {};
          data.forEach(d => {
            mapped[d.id] = {
              id: d.id,
              name: d.name,
              icon: '📋',
              jurisdiction: d.jurisdiction || 'General',
              cycle: 'Annual',
              status: d.status || 'active',
              desc: `${d.name} requirement template`,
              autoRemind: true,
              blockOps: true,
              notifyOwner: true,
              requirements: d.items || [],
              appliedTo: [],
            };
          });
          setTemplates(prev => ({ ...prev, ...mapped }));
        }
      })
      .catch(() => {});
  }, []);

  const mappingRows = useMemo(() => {
    const map = {};
    ALL_PROPERTIES.forEach(p => { map[p.full] = { prop: p, templates: [], reqCount: 0, lastApplied: '—' }; });
    Object.values(templates).forEach(t => {
      (t.appliedTo || []).forEach(full => {
        if (!map[full]) map[full] = { prop: { full, name: full, city: '—' }, templates: [], reqCount: 0, lastApplied: '—' };
        map[full].templates.push(t.name.replace(' Compliance', '').replace(' Pack', ''));
        map[full].reqCount += (t.requirements?.length || 0);
        map[full].lastApplied = 'Oct 5, 2025';
      });
    });
    return Object.values(map).filter(r => r.templates.length > 0);
  }, [templates]);

  const filteredRows = useMemo(() => mappingRows.filter(r => {
    if (mapCity && r.prop.city !== mapCity) return false;
    if (mapSearch) {
      const q = mapSearch.toLowerCase();
      if (!r.prop.full.toLowerCase().includes(q) && !r.templates.join(',').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [mappingRows, mapSearch, mapCity]);

  const saveTemplate = (payload, id, mode) => {
    if (!payload.name.trim()) { showToast('Template name is required', 'error'); return; }

    if (mode === 'new') {
      const newId = 'custom-' + Date.now();
      setTemplates(t => ({
        ...t,
        [newId]: {
          id: newId, ...payload, status: 'draft',
          icon: '📋', appliedTo: [],
        },
      }));
      showToast(`Template created: ${payload.name}`, 'success');
    } else {
      setTemplates(t => ({
        ...t,
        [id]: { ...t[id], ...payload },
      }));
      showToast(`Template saved: ${payload.name}`, 'success');
    }
    setEditor({ open: false, mode: 'edit', id: null });
  };

  const deleteTemplate = () => {
    const id = editor.id;
    const tmpl = templates[id];
    if (tmpl?.appliedTo?.length) {
      showToast(`Cannot delete — template is applied to ${tmpl.appliedTo.length} properties.`, 'error');
      return;
    }
    setTemplates(t => {
      const n = { ...t };
      delete n[id];
      return n;
    });
    setEditor({ open: false, mode: 'edit', id: null });
    showToast('Template deleted', 'info');
  };

  const handleApplied = (templateId, props) => {
    setTemplates(t => {
      const tmpl = t[templateId];
      if (!tmpl) return t;
      const appliedTo = [...tmpl.appliedTo];
      props.forEach(p => { if (!appliedTo.includes(p.full)) appliedTo.push(p.full); });
      return { ...t, [templateId]: { ...tmpl, appliedTo } };
    });
  };

  const templateList = Object.values(templates);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Compliance Templates</div>
          <div style={{ fontSize: 13, color: 'var(--white-muted)', lineHeight: 1.6, maxWidth: 600 }}>
            Requirement packs applied to properties during onboarding or at any time. Each template defines what gets
            tracked — licenses, inspections, insurance, certificates.
          </div>
        </div>
        <button className="btn btn-primary btn-small" style={{ flexShrink: 0, marginLeft: 16 }}
          onClick={() => setEditor({ open: true, mode: 'new', id: null })}>
          + New Template
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {templateList.map(t => {
          const isActive = t.status === 'active';
          return (
            <Card key={t.id} className="ct-card"
              style={{ padding: 16, marginBottom: 0, borderColor: isActive ? 'rgba(212,175,55,0.2)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 18 }}>{t.icon}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 7px',
                  background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
                  color: isActive ? '#22C55E' : '#3B82F6',
                  border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
                }}>{isActive ? 'ACTIVE' : 'DRAFT'}</span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 6 }}>{t.desc}</div>
              <div style={{ fontSize: 12, color: 'var(--white-muted)', marginBottom: 10 }}>
                {t.requirements?.length || 0} requirements · {t.cycle} ·{' '}
                {t.appliedTo?.length ? `Applied to ${t.appliedTo.length} properties` : 'Not applied'}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-outline btn-small" style={{ flex: 1 }}
                  onClick={() => setEditor({ open: true, mode: 'edit', id: t.id })}>
                  Edit
                </button>
                <button className="btn btn-outline btn-small" style={{ flex: 1 }}
                  onClick={() => setApply({ open: true, templateId: t.id })}>
                  Apply
                </button>
              </div>
            </Card>
          );
        })}

        <Card
          style={{
            padding: 16, marginBottom: 0, borderStyle: 'dashed',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 140,
          }}
          onClick={() => setEditor({ open: true, mode: 'new', id: null })}
        >
          <div style={{ fontSize: 22, opacity: 0.4 }}>+</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white-muted)' }}>New Template</div>
          <div style={{ fontSize: 12, color: 'var(--white-muted)', textAlign: 'center' }}>
            Build a custom requirement pack for your market
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Template → Property Mapping</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={mapSearch}
              onChange={e => setMapSearch(e.target.value)}
              placeholder="🔍 Search..."
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '6px 10px', color: 'var(--white)',
                fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 180,
              }}
            />
            <select
              value={mapCity}
              onChange={e => setMapCity(e.target.value)}
              style={{
                background: '#1B1F26', border: '1px solid var(--border)', borderRadius: 6,
                padding: '6px 10px', color: 'var(--white-muted)', fontSize: 13,
                fontFamily: 'inherit', outline: 'none', cursor: 'pointer', colorScheme: 'dark',
              }}
            >
              <option value="">All Cities</option>
              <option value="NYC">NYC</option>
              <option value="Miami">Miami</option>
              <option value="Orlando">Orlando</option>
            </select>
          </div>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Property', 'Applied Templates', 'Requirements', 'Last Applied'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: 8, fontSize: 11, fontWeight: 700,
                    color: 'var(--white-muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 28, textAlign: 'center', color: 'var(--white-muted)', fontSize: 13 }}>
                    No properties match your filter.
                  </td>
                </tr>
              ) : filteredRows.map(r => (
                <tr key={r.prop.full} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px', fontSize: 14, fontWeight: 600 }}>{r.prop.full}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--white-muted)' }}>{r.templates.join(', ')}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--white-muted)' }}>{r.reqCount} active</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--white-muted)' }}>{r.lastApplied}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    <button className="btn btn-outline btn-small"
                      onClick={() => setManage({ open: true, propertyFull: r.prop.full, names: r.templates })}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CTEditorDrawer
        open={editor.open}
        mode={editor.mode}
        template={editor.id ? templates[editor.id] : null}
        onClose={() => setEditor({ open: false, mode: 'edit', id: null })}
        onSave={(payload) => saveTemplate(payload, editor.id, editor.mode)}
        onDelete={deleteTemplate}
      />

      <CTApplyModal
        open={apply.open}
        templateId={apply.templateId}
        templates={templates}
        onClose={() => setApply({ open: false, templateId: null })}
        onApplied={handleApplied}
      />

      <CTManageDrawer
        open={manage.open}
        propertyFull={manage.propertyFull}
        appliedNames={manage.names}
        templates={templates}
        onClose={() => setManage({ open: false, propertyFull: '', names: [] })}
        onRemove={(name, prop) => showToast(`Removed ${name} from ${prop}`, 'info')}
      />
    </>
  );
}
