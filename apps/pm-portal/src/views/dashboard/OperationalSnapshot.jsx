// src/views/dashboard/OperationalSnapshot.jsx
import { dashboardData } from '../../data/dashboardData';

// Static cards moved inside component

export default function OperationalSnapshot({ onNavigate, metrics }) {
  const m = metrics?.data?.stats || {};

  const CARDS = [
    { key: 'active_jobs',      tone: 'slate', label: 'Active Tasks',    sub: 'Tasks in progress', route: 'tasks', val: m.active_jobs || 0 },
    { key: 'active_incidents', tone: 'amber', label: 'Incidents',       sub: 'Open incidents',    route: 'emergency', val: m.active_incidents || 0 },
    { key: 'pending_approvals',tone: 'red',   label: 'Approvals',       sub: 'Awaiting owner',    route: 'tasks', val: m.pending_approvals || 0 },
    { key: 'active_properties',tone: 'gold',  label: 'Properties',      sub: 'Active in portfolio', route: 'properties', val: m.active_properties || 0 },
  ];

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__label">Operational Snapshot</div>
      <div className="snapshot-grid">
        {CARDS.map(card => (
          <button
            key={card.key}
            className={`snap-card snap-card--${card.tone}`}
            onClick={() => onNavigate?.(card.route)}
          >
            <div className="snap-card__num">{card.val}</div>
            <div className="snap-card__label">{card.label}</div>
            <div className="snap-card__sub">{card.sub}</div>
            <span className="snap-card__arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}