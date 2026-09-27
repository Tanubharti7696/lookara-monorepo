// src/views/tasks/TaskKpiStrip.jsx

const COUNTERS = [
  { key: 'overdue',           tone: 'crimson', label: 'Overdue',           sub: 'Past due' },
  { key: 'due-7',             tone: 'amber',   label: 'Due in 7 Days',     sub: 'Upcoming' },
  { key: 'unassigned',        tone: 'amber',   label: 'Unassigned',        sub: 'No vendor' },
  { key: 'dispatched',        tone: 'gold',    label: 'Dispatched',        sub: 'Pending accept' },
  { key: 'in-progress',       tone: 'success', label: 'In Progress',       sub: 'Active now' },
  { key: 'awaiting-payment',  tone: 'gold',    label: 'Awaiting Payment',  sub: 'Ready to confirm' },
];

export default function TaskKpiStrip({ counts, active, onChange }) {
  return (
    <div className="tk-counters">
      {COUNTERS.map(c => (
        <button
          key={c.key}
          className={`tk-counter tk-counter--${c.tone} ${active === c.key ? 'active' : ''}`}
          onClick={() => onChange(active === c.key ? null : c.key)}
          title={`Filter by ${c.label}`}
          type="button"
        >
          <div className="tk-counter__num">{counts[c.key] ?? 0}</div>
          <div className="tk-counter__text">
            <div className="tk-counter__label">{c.label}</div>
            <div className="tk-counter__sub">{c.sub}</div>
          </div>
        </button>
      ))}
    </div>
  );
}