import { TASKS } from '../data/constants';

export default function TaskHarness({ currentName, onLoad }) {
  return (
    <div className="harness">
      <div className="harness-title">Unified Task Drawer — Verification Build</div>
      <div className="harness-sub">Click any task to load its drawer. Action tab adapts per state.</div>
      <div className="task-grid">
        {TASKS.map(t => (
          <button
            key={t.name}
            className={`task-btn state-${t.state} ${currentName === t.name ? 'active' : ''}`}
            onClick={() => onLoad(t.name)}
            title={`State: ${t.state}`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
