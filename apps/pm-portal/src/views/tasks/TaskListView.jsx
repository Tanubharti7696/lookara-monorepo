// src/views/tasks/TaskListView.jsx
import { useMemo, useState, Fragment } from 'react';
import { GROUP_META, getNatureIcon } from '../../data/taskMeta';

const GROUP_ORDER = ['needs', 'dispatch', 'active', 'financial', 'reviews'];

export default function TaskListView({ tasks, onOpenTask }) {
  const [collapsed, setCollapsed] = useState({});

  const grouped = useMemo(() => {
    const g = {};
    GROUP_ORDER.forEach(k => { g[k] = []; });
    tasks.forEach(t => { (g[t.group] ||= []).push(t); });
    return g;
  }, [tasks]);

  const visibleTotal = tasks.length;
  if (visibleTotal === 0) {
    return (
      <div className="tk-empty">
        <div className="tk-empty__icon">🔍</div>
        <div className="tk-empty__title">No tasks match</div>
        <p className="tk-empty__sub">Try a different search or clear the filter.</p>
      </div>
    );
  }

  return (
    <div className="tk-list-wrap">
      <table className="lk-table tk-list-table">
        <thead>
          <tr>
            <th style={{ width: 4, padding: 0 }} />
            <th>Task</th>
            <th>Property</th>
            <th>Status</th>
            <th>Due</th>
            <th>Vendor</th>
          </tr>
        </thead>
        <tbody>
          {GROUP_ORDER.map(groupKey => {
            const rows = grouped[groupKey];
            if (!rows || rows.length === 0) return null;
            const meta = GROUP_META[groupKey];
            const isCollapsed = collapsed[groupKey];

            return (
              <Fragment key={groupKey}>
                <tr
                  className="tk-group-row"
                  onClick={() => setCollapsed(c => ({ ...c, [groupKey]: !c[groupKey] }))}
                >
                  <td colSpan={6} style={{ borderLeft: `4px solid ${meta.accent}` }}>
                    <span className="tk-group-label">{meta.label}</span>
                    <span className="tk-group-count">{rows.length}</span>
                    <span className={`tk-group-chev ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
                  </td>
                </tr>

                {!isCollapsed && rows.map(task => (
                  <TaskRow key={task.id} task={task} onOpen={() => onOpenTask(task.id)} />
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TaskRow({ task, onOpen }) {
  const icon = getNatureIcon(task.name);

  return (
    <tr className="tk-row" onClick={onOpen}>
      <td style={{ padding: 0 }} data-label="">
        <div className={`tl-stripe tl-stripe--${task.stripe}`} />
      </td>

      <td data-label="Task">
        <div className="tl-title">
          <span className="tl-title__icon">{icon}</span>
          {task.name}
        </div>
        <div className="tl-sub">
          <span className={`src-tag src-tag--${task.sourceCls}`}>
            {task.sourceLabel}
          </span>
          {!task.vendor && (task.group === 'needs' || task.group === 'dispatch') && (
            <span className="tl-flag tl-flag--danger">⚠ Unassigned</span>
          )}
          {task.taskTypeLabel && task.taskType !== 'Emergency' && (
            <span className="tl-flag tl-flag--muted">{task.taskTypeLabel}</span>
          )}
        </div>
      </td>

      <td data-label="Property">
        <div className="tl-prop">{task.property}</div>
        {task.city && <div className="tl-city">{task.city}</div>}
      </td>

      <td data-label="Status">
        <span className={`tl-badge tl-badge--${task.state}`}>
          {task.state.replace(/-/g, ' ')}
        </span>
      </td>

      <td data-label="Due">
        <span className={task.dueOverdue ? 'tl-overdue' : 'tl-dim'}>
          {task.due}
        </span>
      </td>

      <td data-label="Vendor">
        {task.vendor ? (
          <span className="tl-dim">{task.vendor}</span>
        ) : (
          <span className="tl-flag tl-flag--warn">⚠ No Vendor</span>
        )}
      </td>
    </tr>
  );
}