// src/views/compliance/ComplianceView.jsx
import { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import { ComplianceRow, CompliantMini } from './compliance/ComplianceRow';
import ComplianceDrawer from './compliance/ComplianceDrawer';
import TemplateModal from './compliance/modals/TemplateModal';
import CreateTaskModal from './compliance/modals/CreateTaskModal';
import {
  isOverdue, isDueSoon, classify,
  PROPS_BY_CITY, ALL_PROPS
} from '../data/compliance';
import './ComplianceView.css';
import { apiFetch } from '../utils/api';
import { useEffect } from 'react';

const KPI_DEFS = [
  { key: 'overdue',   label: 'Overdue',        sub: 'Past due',        color: '#DC2626' },
  { key: 'duesoon',   label: 'Due Soon',       sub: 'Within 30 days',  color: '#F59E0B' },
  { key: 'scheduled', label: 'Scheduled',      sub: 'Booked',          color: '#3B82F6' },
  { key: 'review',    label: 'Pending Review', sub: 'Docs uploaded',   color: 'rgba(139,92,246,0.9)' },
  { key: 'compliant', label: 'Compliant',      sub: 'All clear',       color: '#22C55E' },
];

export default function ComplianceView() {
  const [items, setItems]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [city, setCity]                   = useState('');
  const [prop, setProp]                   = useState('');
  const [kpi, setKpi]                     = useState('');           // '' | 'overdue' | ...
  const [compliantOpen, setCompliantOpen] = useState(false);
  const [openItemId, setOpenItemId]       = useState(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [createTaskItem, setCreateTaskItem] = useState(null);
  const [toast, setToast]                 = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/compliance');
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openItem = useMemo(
    () => items.find(i => i.id === openItemId) || null,
    [items, openItemId]
  );

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const updateItem = (id, patch) => {
    setItems(list => list.map(i => (i.id === id ? { ...i, ...patch } : i)));
  };

  /* ─── Filter ─── */
  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(r => {
      if (q && !r.name.toLowerCase().includes(q) && !r.prop.toLowerCase().includes(q)) return false;
      if (prop && r.prop !== prop) return false;
      if (city && r.city !== city) return false;
      return true;
    });
  }, [items, search, prop, city]);

  const kpiFiltered = useMemo(() => {
    if (!kpi) return baseFiltered;
    if (kpi === 'overdue')   return baseFiltered.filter(r => isOverdue(r));
    if (kpi === 'duesoon')   return baseFiltered.filter(r => isDueSoon(r));
    if (kpi === 'scheduled') return baseFiltered.filter(r => r.status === 'scheduled');
    if (kpi === 'review')    return baseFiltered.filter(r => r.status === 'review');
    if (kpi === 'compliant') return baseFiltered.filter(r => r.status === 'compliant');
    return baseFiltered;
  }, [baseFiltered, kpi]);

  /* ─── Sections ─── */
  const action    = useMemo(() => kpiFiltered.filter(r => classify(r) === 'action'),    [kpiFiltered]);
  const scheduled = useMemo(() => kpiFiltered.filter(r => classify(r) === 'scheduled'), [kpiFiltered]);
  const review    = useMemo(() => kpiFiltered.filter(r => classify(r) === 'review'),    [kpiFiltered]);
  const compliant = useMemo(() => kpiFiltered.filter(r => classify(r) === 'compliant'), [kpiFiltered]);

  /* ─── KPI counts (based on baseFiltered, not kpi-filtered) ─── */
  const counts = useMemo(() => ({
    overdue:   baseFiltered.filter(r => isOverdue(r)).length,
    duesoon:   baseFiltered.filter(r => isDueSoon(r)).length,
    scheduled: baseFiltered.filter(r => r.status === 'scheduled').length,
    review:    baseFiltered.filter(r => r.status === 'review').length,
    compliant: baseFiltered.filter(r => r.status === 'compliant').length,
  }), [baseFiltered]);

  /* ─── Property list (depends on city) ─── */
  const propertyOptions = city && PROPS_BY_CITY[city] ? PROPS_BY_CITY[city] : ALL_PROPS;

  const hasFilter = search || prop || city;

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setProp('');
    setKpi('');
  };

  /* ─── Confirm Create Task ─── */
  const handleCreateTaskConfirm = async (id) => {
    try {
      const res = await apiFetch(`/api/v1/compliance/${id}/schedule`, { method: 'POST' });
      if (res.ok) {
        updateItem(id, {
          status: 'scheduled',
          inspStatus: 'Scheduled — pending vendor confirmation',
        });
        showToast('Task created · Calendar event generated · Compliance updated', 'success');
        loadData();
      } else {
        showToast('Failed to schedule task', 'error');
      }
    } catch (e) {
      showToast('Error scheduling task', 'error');
    } finally {
      setCreateTaskItem(null);
      setOpenItemId(null);
    }
  };

  /* ─── Template apply ─── */
  const handleApplyTemplate = (pack) => {
    setTemplateModal(false);
    showToast(`Template applied: ${pack.name}`, 'success');
  };

  return (
    <div className="compliance-view">
      <PageHeader
        title="Compliance"
        right={
          <button
            className="page-header__bell"
            aria-label="Alerts"
            onClick={() => showToast('Notifications', 'info')}
          >
            🔔
            <span className="page-header__bell-badge">3</span>
          </button>
        }
      />

      {/* Filter strip */}
      <div className="cmp-filterbar">
        <div className="cmp-searchbox" style={{ flex: '0 0 280px' }}>
          <input
            className="cmp-searchinput"
            type="text"
            placeholder="🔍  Search compliance items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cmp-searchbox" style={{ flex: '0 0 auto' }}>
          <select
            className="cmp-searchselect"
            value={city}
            onChange={(e) => { setCity(e.target.value); setProp(''); }}
          >
            <option value="">City</option>
            <option>NYC</option>
            <option>Miami</option>
            <option>Orlando</option>
          </select>
        </div>

        <div className="cmp-searchbox" style={{ flex: '0 0 auto' }}>
          <select
            className="cmp-searchselect"
            value={prop}
            onChange={(e) => setProp(e.target.value)}
          >
            <option value="">Property ▾</option>
            {propertyOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {hasFilter && (
            <button className="cmp-clearbtn" onClick={clearFilters} title="Clear filters">✕</button>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="cmp-kpi-wrap">
        <div className="cmp-kpi-grid">
          {KPI_DEFS.map(k => (
            <button
              key={k.key}
              type="button"
              className={`tk-counter ${kpi === k.key ? 'active' : ''}`}
              style={{ '--accent': k.color }}
              onClick={() => setKpi(kpi === k.key ? '' : k.key)}
            >
              <div className="tk-counter-num">{counts[k.key]}</div>
              <div>
                <div className="tk-counter-label">{k.label}</div>
                <div className="tk-counter-sub">{k.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="cmp-last-updated">Last updated 2m ago</div>
      </div>

      {/* Content */}
      <div className="cmp-content">
        {/* ACTION REQUIRED */}
        <Section
          title="Action Required"
          color="var(--danger)"
          count={action.length}
        >
          {action.length === 0 ? (
            <div className="section-empty">No items need action right now.</div>
          ) : action.map(r => (
            <ComplianceRow key={r.id} item={r} kind="action" onOpen={setOpenItemId} />
          ))}
        </Section>

        {/* SCHEDULED */}
        <Section
          title="📅 Scheduled"
          color="var(--info)"
          count={scheduled.length}
        >
          {scheduled.length === 0 ? (
            <div className="section-empty">No scheduled inspections.</div>
          ) : scheduled.map(r => (
            <ComplianceRow key={r.id} item={r} kind="scheduled" onOpen={setOpenItemId} />
          ))}
        </Section>

        {/* PENDING REVIEW */}
        <Section
          title="🕐 Pending Review"
          color="rgba(139,92,246,0.9)"
          count={review.length}
        >
          {review.length === 0 ? (
            <div className="section-empty">Nothing pending review.</div>
          ) : review.map(r => (
            <ComplianceRow key={r.id} item={r} kind="review" onOpen={setOpenItemId} />
          ))}
        </Section>

        {/* COMPLIANT (collapsed) */}
        <div className="section">
          <div className="section-header">
            <div className="section-title" style={{ color: 'var(--success)' }}>✓ Compliant</div>
            <div className="section-count">{compliant.length}</div>
            <button
              className="section-toggle"
              onClick={() => setCompliantOpen(v => !v)}
              type="button"
            >
              <span>{compliantOpen ? 'Hide' : 'Show'}</span> <span>▾</span>
            </button>
          </div>

          {!compliantOpen && compliant.length > 0 && (
            <div className="section-collapsed-hint" onClick={() => setCompliantOpen(true)}>
              <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 700 }}>✓</span>
              <div className="collapsed-hint-items">
                {compliant.map(r => (
                  <span key={r.id} className="collapsed-item-tag">✓ {r.name}</span>
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to expand</span>
            </div>
          )}

          {compliantOpen && (
            <div className="compliant-grid open">
              {compliant.length === 0 ? (
                <div className="section-empty" style={{ gridColumn: '1 / -1' }}>
                  Nothing compliant yet.
                </div>
              ) : compliant.map(r => (
                <CompliantMini key={r.id} item={r} onOpen={setOpenItemId} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      <ComplianceDrawer
        item={openItem}
        onClose={() => setOpenItemId(null)}
        onUpdate={updateItem}
        onOpenCreateTask={setCreateTaskItem}
        onToast={showToast}
      />

      {/* Modals */}
      <TemplateModal
        open={templateModal}
        onClose={() => setTemplateModal(false)}
        onApply={handleApplyTemplate}
      />
      <CreateTaskModal
        item={createTaskItem}
        onClose={() => setCreateTaskItem(null)}
        onConfirm={handleCreateTaskConfirm}
      />

      {/* Toast */}
      {toast && (
        <div
          className="cmp-toast show"
          style={{
            borderColor:
              toast.type === 'success' ? 'var(--success)'
              : toast.type === 'warning' ? 'var(--warning)'
              : toast.type === 'error' ? 'var(--danger)'
              : 'var(--info)',
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Section({ title, color, count, children }) {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title" style={{ color }}>{title}</div>
        <div className="section-count">{count}</div>
      </div>
      <div className="item-list">{children}</div>
    </div>
  );
}