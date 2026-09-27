// src/views/dashboard/CriticalBanner.jsx
import { dashboardData } from '../../data/dashboardData';

export default function CriticalBanner({ onNavigate }) {
  const { incident, sla } = dashboardData.criticalBanner;

  return (
    <section className="dashboard-section">
      <div
        className="critical-banner critical-banner--incident"
        onClick={() => onNavigate?.('emergency')}
        role="button"
        tabIndex={0}
      >
        <div className="critical-banner__left">
          <span className="critical-banner__icon">🚨</span>
          <div>
            <div className="critical-banner__title">
              <span className="live-dot" />
              {incident.title}
            </div>
            <div className="critical-banner__sub">{incident.sub}</div>
          </div>
        </div>
        <button
          className="critical-banner__cta critical-banner__cta--red"
          onClick={(e) => { e.stopPropagation(); onNavigate?.('emergency'); }}
        >
          {incident.cta}
        </button>
      </div>

      <div
        className="critical-banner critical-banner--sla"
        onClick={() => onNavigate?.('tasks')}
        role="button"
        tabIndex={0}
      >
        <div className="critical-banner__left">
          <span className="critical-banner__icon">⚠️</span>
          <div>
            <div className="critical-banner__title">{sla.title}</div>
            <div className="critical-banner__sub">{sla.sub}</div>
          </div>
        </div>
        <button
          className="critical-banner__cta critical-banner__cta--amber"
          onClick={(e) => { e.stopPropagation(); onNavigate?.('tasks'); }}
        >
          {sla.cta}
        </button>
      </div>
    </section>
  );
}