// src/views/EmergencyView.jsx
import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import PageHeader from '../components/PageHeader';
import TriageCard from './emergency/TriageCard';
import TaskDrawer from './tasks/drawer/TaskDrawer';
import AssignVendorOverlay from './tasks/drawer/overlays/AssignVendorOverlay';
import RecordPaymentOverlay from './tasks/drawer/overlays/RecordPaymentOverlay';
import VerifyWorkOverlay from './tasks/drawer/overlays/VerifyWorkOverlay';
import { useTaskActions } from './tasks/drawer/useTaskActions';
import { ARCHIVE_STATES } from '../data/tasks';
import './EmergencyView.css';

/* ────────── Matchers ────────── */
const EMERGENCY_MATCHER = (t) => {
  if (ARCHIVE_STATES.has(t.state)) return false;
  if (t.severity === 'CRITICAL') return true;
  if (t.slaStatus === 'OVERDUE') return true;
  if (['blocked', 'escalated', 'payment-disputed', 'escalated-to-admin'].includes(t.state)) return true;
  return false;
};

const STRICT_MATCHER = (t) => {
  if (t.severity === 'CRITICAL' && (t.slaStatus === 'OVERDUE' || ['blocked', 'escalated'].includes(t.state))) return true;
  if (['blocked', 'escalated'].includes(t.state)) return true;
  if (t.severity === 'CRITICAL' && t.state === 'payment-disputed') return true;
  return false;
};

/* ────────── Sorters ────────── */
const SEV_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, NORMAL: 3, LOW: 4 };
const SLA_ORDER = { OVERDUE: 0, 'AT RISK': 1, 'ON TRACK': 2, '—': 3 };

const SORTERS = {
  priority: (a, b) => {
    const s = (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9);
    if (s) return s;
    return (SLA_ORDER[a.slaStatus] ?? 9) - (SLA_ORDER[b.slaStatus] ?? 9);
  },
  sla: (a, b) => (SLA_ORDER[a.slaStatus] ?? 9) - (SLA_ORDER[b.slaStatus] ?? 9),
  age: (a, b) => (b.ageDays || 0) - (a.ageDays || 0),
  severity: (a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9),
};

/* ────────── Filters ────────── */
const SEVERITY_CHIPS = [
  { key: 'all',      label: 'All',       match: () => true },
  { key: 'critical', label: '🚨 Critical', match: t => t.severity === 'CRITICAL' },
  { key: 'high',     label: 'High',       match: t => t.severity === 'HIGH' },
  { key: 'medium',   label: 'Medium',     match: t => t.severity === 'MEDIUM' },
];

const STATE_CHIPS = [
  { key: 'all',        label: 'Any state',     match: () => true },
  { key: 'blocked',    label: '⚠ Blocked',     match: t => t.state === 'blocked' },
  { key: 'escalated',  label: '🚨 Escalated',  match: t => t.state === 'escalated' || t.state === 'escalated-to-admin' },
  { key: 'overdue',    label: '⏱ Overdue SLA', match: t => t.slaStatus === 'OVERDUE' },
  { key: 'unassigned', label: '👤 Unassigned', match: t => !t.vendor },
];

export default function EmergencyView() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/tasks?urgency=emergency')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const mapped = data.data.map(t => ({
            id: t.id,
            name: t.title || 'Task',
            property: t.property_name || 'Assigned Property',
            city: t.city || 'Unknown',
            trade: t.trade_code || 'General',
            severity: t.severity ? t.severity.toUpperCase() : 'CRITICAL',
            state: t.status === 'open' ? 'pending' : (t.status === 'completed' ? 'completed' : 'active'),
            group: 'dispatch',
            due: 'Pending',
            slaStatus: 'OVERDUE', // Simplification for now
            vendor: null,
            sourceCls: 'incident',
            sourceLabel: '🚨 Incident',
            stripe: 'critical',
            priorityCls: 'critical',
            priorityLabel: (t.severity || 'CRITICAL').toUpperCase(),
            ageDays: 0,
            description: t.description || '',
            createdAt: t.created_at || new Date().toISOString(),
          }));
          setTasks(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  const [strictMode, setStrictMode] = useState(false);
  const [sortBy, setSortBy]         = useState('priority');
  const [sevFilter, setSevFilter]   = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [openTaskId, setOpenTaskId] = useState(null);
  const [overlay, setOverlay]       = useState(null); // { type, taskId }

  const openTask = useMemo(
    () => tasks.find(t => t.id === openTaskId) || null,
    [tasks, openTaskId]
  );

  const updateTask = (id, patch) => {
    setTasks(list => {
      const updated = list.map(t => (t.id === id ? { ...t, ...patch } : t));
      return updated;
    });
    if (patch.state) {
      const apiStatus = patch.state === 'completed' ? 'completed' : (patch.state === 'active' ? 'in_progress' : 'unassigned');
      apiFetch(`/api/v1/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: apiStatus })
      }).catch(console.error);
    }
  };

  /* Base emergency pool */
  const pool = useMemo(() => {
    const matcher = strictMode ? STRICT_MATCHER : EMERGENCY_MATCHER;
    return tasks.filter(matcher);
  }, [tasks, strictMode]);

  /* Filtered + sorted */
  const filtered = useMemo(() => {
    const sev = SEVERITY_CHIPS.find(c => c.key === sevFilter) || SEVERITY_CHIPS[0];
    const st  = STATE_CHIPS.find(c => c.key === stateFilter) || STATE_CHIPS[0];
    return pool
      .filter(t => sev.match(t) && st.match(t))
      .sort(SORTERS[sortBy] || SORTERS.priority);
  }, [pool, sevFilter, stateFilter, sortBy]);

  /* Counts for the strip */
  const counts = useMemo(() => ({
    total:      pool.length,
    critical:   pool.filter(t => t.severity === 'CRITICAL').length,
    overdue:    pool.filter(t => t.slaStatus === 'OVERDUE').length,
    unassigned: pool.filter(t => !t.vendor).length,
    blocked:    pool.filter(t => t.state === 'blocked' || t.state === 'escalated').length,
  }), [pool]);

  /* Quick actions from cards */
  const handleQuickAction = (actionKey, task) => {
    const actions = useTaskActions(task, (patch) => updateTask(task.id, patch));
    switch (actionKey) {
      case 'assign':
        setOverlay({ type: 'assign', taskId: task.id });
        break;
      case 'escalate':
        actions.setState('escalated');
        break;
      case 'cancelDispatch':
        actions.setState('unassigned');
        break;
      case 'call':
        actions.logCall();
        break;
      case 'verify':
        setOverlay({ type: 'verify', taskId: task.id });
        break;
      case 'payment':
        setOverlay({ type: 'payment', taskId: task.id });
        break;
      default:
        setOpenTaskId(task.id);
    }
  };

  const overlayTask = overlay ? tasks.find(t => t.id === overlay.taskId) : null;

  return (
    <div className="emergency-view">
      <PageHeader
        title="Emergency Triage"
        right={
          <button
            className={`em-mode-btn ${strictMode ? 'active' : ''}`}
            onClick={() => setStrictMode(v => !v)}
            type="button"
          >
            {strictMode ? '🚨 Emergency Mode ON' : '⚡ Emergency Mode'}
          </button>
        }
      />

      <div className="em-body">
        {/* Emergency banner (strict mode only) */}
        {strictMode && (
          <div className="em-banner">
            <div className="em-banner__icon">🚨</div>
            <div className="em-banner__text">
              <div className="em-banner__title">Emergency Mode Active</div>
              <div className="em-banner__sub">
                Showing only critical, blocked, escalated, and payment-disputed tasks.
                Triage from top to bottom — each card is a live action surface.
              </div>
            </div>
            <button className="em-banner__exit" onClick={() => setStrictMode(false)} type="button">
              Exit
            </button>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Loading emergency tasks...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* Count strip */}
            <div className="em-counts">
              <CountTile label="Active Emergencies" value={counts.total}      tone="gold"    accent />
          <CountTile label="Critical"           value={counts.critical}   tone="crimson" />
          <CountTile label="SLA Overdue"        value={counts.overdue}    tone="crimson" />
          <CountTile label="Blocked / Escalated" value={counts.blocked}   tone="amber"   />
          <CountTile label="Unassigned"         value={counts.unassigned} tone="amber"   />
        </div>

        {/* Controls */}
        <div className="em-controls">
          <div className="em-controls__group">
            <span className="em-controls__label">Sort</span>
            <div className="em-chiprow">
              {[
                { key: 'priority', label: 'Priority' },
                { key: 'sla',      label: 'SLA'      },
                { key: 'severity', label: 'Severity' },
                { key: 'age',      label: 'Oldest'   },
              ].map(s => (
                <button
                  key={s.key}
                  className={`em-chip ${sortBy === s.key ? 'active' : ''}`}
                  onClick={() => setSortBy(s.key)}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="em-controls__group">
            <span className="em-controls__label">Severity</span>
            <div className="em-chiprow">
              {SEVERITY_CHIPS.map(c => (
                <button
                  key={c.key}
                  className={`em-chip ${sevFilter === c.key ? 'active' : ''}`}
                  onClick={() => setSevFilter(c.key)}
                  type="button"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="em-controls__group">
            <span className="em-controls__label">State</span>
            <div className="em-chiprow">
              {STATE_CHIPS.map(c => (
                <button
                  key={c.key}
                  className={`em-chip ${stateFilter === c.key ? 'active' : ''}`}
                  onClick={() => setStateFilter(c.key)}
                  type="button"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {(sevFilter !== 'all' || stateFilter !== 'all') && (
            <button
              className="em-controls__clear"
              onClick={() => { setSevFilter('all'); setStateFilter('all'); }}
              type="button"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="em-empty">
            <div className="em-empty__icon">✓</div>
            <div className="em-empty__title">No emergencies match your filters</div>
            <div className="em-empty__sub">
              {strictMode
                ? 'Emergency mode is on and everything is under control. Nice work.'
                : 'Try relaxing severity or state filters.'}
            </div>
          </div>
        ) : (
          <div className="em-grid">
            {filtered.map(t => (
              <TriageCard
                key={t.id}
                task={t}
                onOpen={setOpenTaskId}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Drawer + overlays — reuse from TasksView */}
      <TaskDrawer
        task={openTask}
        onClose={() => setOpenTaskId(null)}
        onUpdate={(patch) => openTaskId && updateTask(openTaskId, patch)}
      />

      {overlay?.type === 'assign' && overlayTask && (
        <AssignVendorOverlay
          task={overlayTask}
          onClose={() => setOverlay(null)}
          onUpdate={(patch) => { updateTask(overlayTask.id, patch); }}
        />
      )}
      {overlay?.type === 'verify' && overlayTask && (
        <VerifyWorkOverlay
          task={overlayTask}
          onClose={() => setOverlay(null)}
          onUpdate={(patch) => { updateTask(overlayTask.id, patch); }}
        />
      )}
      {overlay?.type === 'payment' && overlayTask && (
        <RecordPaymentOverlay
          task={overlayTask}
          onClose={() => setOverlay(null)}
          onUpdate={(patch) => { updateTask(overlayTask.id, patch); }}
        />
      )}
    </div>
  );
}

/* ────────── Small sub-components ────────── */

function CountTile({ label, value, tone, accent }) {
  return (
    <div className={`em-count em-count--${tone} ${accent ? 'em-count--accent' : ''}`}>
      <div className="em-count__value">{value}</div>
      <div className="em-count__label">{label}</div>
    </div>
  );
}