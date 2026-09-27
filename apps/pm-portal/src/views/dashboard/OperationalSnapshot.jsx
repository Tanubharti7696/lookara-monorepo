// src/views/dashboard/OperationalSnapshot.jsx
import { dashboardData } from '../../data/dashboardData';

const CARDS = [
  { key: 'openTasks',      tone: 'slate', label: 'Open Tasks',      sub: 'Across all portfolios',  route: 'tasks' },
  { key: 'slaRisk',        tone: 'amber', label: 'SLA Risk',        sub: 'Approaching breach',     route: 'tasks' },
  { key: 'complianceRisk', tone: 'red',   label: 'Compliance Risk', sub: 'Due within 7 days',      route: 'compliance' },
  { key: 'coverageGaps',   tone: 'gold',  label: 'Coverage Gaps',   sub: 'Missing vendor categories', route: 'vendors' },
];

export default function OperationalSnapshot({ onNavigate }) {
  const m = dashboardData.status.metrics;

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
            <div className="snap-card__num">{m[card.key]}</div>
            <div className="snap-card__label">{card.label}</div>
            <div className="snap-card__sub">{card.sub}</div>
            <span className="snap-card__arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}