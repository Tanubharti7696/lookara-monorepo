// src/views/TasksView.jsx
import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import PageHeader from '../components/PageHeader';
import TaskKpiStrip from './tasks/TaskKpiStrip';
import TaskActionBar from './tasks/TaskActionBar';
import TaskListView from './tasks/TaskListView';
import CreateTaskModal from './tasks/CreateTaskModal';
import TaskDrawer from './tasks/drawer/TaskDrawer';
import { TASKS as INITIAL_TASKS, ARCHIVE_STATES, COUNTER_MATCHERS, SEARCH_KEYWORDS } from '../data/tasks';
import './TasksView.css';

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    apiFetch('/api/v1/tasks')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const mapped = data.data.map(t => ({
            id: t.id,
            name: t.title || 'Task',
            property: t.property_name || 'Assigned Property',
            city: t.city || 'Unknown',
            trade: t.trade_code || t.trade || 'General',
            severity: t.urgency ? t.urgency.toUpperCase() : 'MEDIUM',
            state: t.status === 'open' ? 'pending' : (t.status === 'completed' ? 'completed' : 'active'),
            group: 'dispatch',
            due: 'Pending',
            slaStatus: 'ON TRACK',
            vendor: null,
            sourceCls: 'manual',
            sourceLabel: '✍ Manual',
            stripe: 'normal',
            priorityCls: 'normal',
            priorityLabel: (t.urgency || 'MEDIUM').toUpperCase(),
            ageDays: 0,
            description: t.description || '',
            createdAt: t.created_at || new Date().toISOString(),
          }));
          setTasks(mapped);
        }
      })
      .catch(err => console.error('Failed to load tasks:', err))
      .finally(() => setIsLoading(false));
  }, []);
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [counter, setCounter] = useState(null);
  const [sourceFilter, setSourceFilter] = useState(null);
  const [createModal, setCreateModal] = useState(null);
  const [openTaskId, setOpenTaskId] = useState(null);

  const openTask = useMemo(
    () => tasks.find(t => t.id === openTaskId) || null,
    [tasks, openTaskId]
  );

  const updateTask = (patch) => {
    if (!openTaskId) return;
    
    // Optimistic update
    setTasks(list => list.map(t => (t.id === openTaskId ? { ...t, ...patch } : t)));
    
    // API Call
    if (patch.state) {
      const apiStatus = patch.state === 'completed' ? 'completed' : (patch.state === 'active' ? 'in_progress' : 'pending_dispatch');
      apiFetch(`/api/v1/tasks/${openTaskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: apiStatus })
      }).catch(console.error);
    }
  };

  const baseFiltered = useMemo(() => tasks.filter(t => {
    const archived = ARCHIVE_STATES.has(t.state);
    if (tab === 'active' && archived) return false;
    if (tab === 'archive' && !archived) return false;
    return true;
  }), [tasks, tab]);

  const counts = useMemo(() => {
    const c = {};
    Object.entries(COUNTER_MATCHERS).forEach(([key, fn]) => {
      c[key] = baseFiltered.filter(fn).length;
    });
    return c;
  }, [baseFiltered]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseFiltered.filter(t => {
      if (counter && !COUNTER_MATCHERS[counter]?.(t)) return false;
      if (sourceFilter && t.sourceCls !== sourceFilter) return false;
      if (q) {
        const keywordMatch = SEARCH_KEYWORDS[q]?.(t);
        const textMatch = [t.name, t.property, t.city, t.vendor, t.id]
          .filter(Boolean)
          .some(v => v.toLowerCase().includes(q));
        if (!keywordMatch && !textMatch) return false;
      }
      return true;
    });
  }, [baseFiltered, counter, sourceFilter, search]);

  const handleCreate = (payload) => {
    const sev = payload.severity?.toUpperCase() || (payload.mode === 'incident' ? 'CRITICAL' : 'MEDIUM');
    const dbPayload = {
      propertyId: payload.propertyId || null,
      title: payload.title || payload.issue || `${payload.trade || 'General'} Task`,
      description: payload.description || payload.notes || '',
      urgency: sev.toLowerCase(),
      trade: payload.trade || 'general',
    };
    
    apiFetch('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbPayload)
    })
      .then(res => res.json())
      .then(t => {
        const data = t.data || t;
        const newTask = {
          id: data.id || `temp-${Date.now()}`,
          name: data.title || 'Task',
          property: data.property_name || payload.property || 'Property',
          city: payload.property?.split('·')[1]?.trim() || 'Unknown',
          trade: payload.trade || 'General Repair',
          severity: sev,
          state: 'pending',
          group: 'dispatch',
          due: 'Pending Dispatch',
          slaStatus: 'ON TRACK',
          vendor: null,
          sourceCls: payload.mode === 'incident' ? 'incident' : 'manual',
          sourceLabel: payload.mode === 'incident' ? '🚨 Incident' : '✍ Manual',
          stripe: sev === 'CRITICAL' ? 'critical' : sev === 'HIGH' ? 'high' : 'normal',
          priorityCls: sev === 'CRITICAL' ? 'critical' : sev === 'HIGH' ? 'high' : 'normal',
          priorityLabel: sev,
          ageDays: 0,
          description: payload.description || payload.notes || 'Newly created task',
          createdAt: t.created_at || new Date().toISOString(),
        };
        setTasks(prev => [newTask, ...prev]);
        setTab('active');
        setCounter(null);
        setSourceFilter(null);
        setSearch('');
        setCreateModal(null);
      })
      .catch(err => {
        console.error('Failed to create task:', err);
        alert('Failed to save task to backend.');
      });
  };

  return (
    <div className="tasks-view">
      <PageHeader
        title="Tasks"
        right={
          <button className="page-header__bell" aria-label="Alerts">
            🔔
            <span className="page-header__bell-badge">12</span>
          </button>
        }
      />

      <div className="tasks-body">
        <TaskActionBar
          search={search}
          onSearchChange={setSearch}
          onCreate={(type) => setCreateModal(type === 'incident' ? 'incident' : 'task')}
        />

        <TaskKpiStrip counts={counts} active={counter} onChange={setCounter} />

        <div className="tasks-tabs">
          <button
            className={`tasks-tab ${tab === 'active' ? 'active' : ''}`}
            onClick={() => { setTab('active'); setCounter(null); }}
            type="button"
          >
            Active Work
            <span className="tasks-tab__count">
              {tasks.filter(t => !ARCHIVE_STATES.has(t.state)).length}
            </span>
          </button>
          <button
            className={`tasks-tab ${tab === 'archive' ? 'active' : ''}`}
            onClick={() => { setTab('archive'); setCounter(null); }}
            type="button"
          >
            History & Recurring
            <span className="tasks-tab__count">
              {tasks.filter(t => ARCHIVE_STATES.has(t.state)).length}
            </span>
          </button>
        </div>

        <div className="tasks-source-row">
          <span className="tasks-source-row__label">Filter by source:</span>
          {[
            { key: 'incident',   label: '🚨 Incident' },
            { key: 'calendar',   label: '📅 Calendar' },
            { key: 'recurring',  label: '🔁 Recurring' },
            { key: 'manual',     label: '✍ Manual' },
            { key: 'compliance', label: '📋 Compliance' },
            { key: 'automation', label: '⚙️ Automation' },
          ].map(s => (
            <button
              key={s.key}
              className={`src-legend-tag ${sourceFilter === s.key ? 'active' : ''}`}
              onClick={() => setSourceFilter(sourceFilter === s.key ? null : s.key)}
              type="button"
            >
              {s.label}
            </button>
          ))}
          {(sourceFilter || counter || search) && (
            <button
              className="tasks-source-row__clear"
              onClick={() => { setSourceFilter(null); setCounter(null); setSearch(''); }}
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Loading tasks...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <TaskListView tasks={filtered} onOpenTask={setOpenTaskId} />
        )}
      </div>

      <CreateTaskModal
        open={createModal !== null}
        mode={createModal || 'task'}
        onClose={() => setCreateModal(null)}
        onCreate={handleCreate}
      />

      <TaskDrawer
        task={openTask}
        onClose={() => setOpenTaskId(null)}
        onUpdate={updateTask}
      />
    </div>
  );
}