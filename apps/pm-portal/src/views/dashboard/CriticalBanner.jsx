// src/views/dashboard/CriticalBanner.jsx
import { dashboardData } from '../../data/dashboardData';

export default function CriticalBanner({ onNavigate, metrics }) {
  const m = metrics?.data?.stats || {};
  const urgent = metrics?.data?.urgentItems || [];

  const emergencies = parseInt(m.emergency_jobs || '0', 10);
  const SLAs = parseInt(m.pending_approvals || '0', 10);

  if (emergencies === 0 && SLAs === 0) {
    return null;
  }

  const latestUrgent = urgent[0] || { title: 'Emergency Reported', property_name: 'Action Required' };

  return (
    <section className="dashboard-section">
      {emergencies > 0 && (
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
                {emergencies} Active {emergencies === 1 ? 'Emergency' : 'Emergencies'}
              </div>
              <div className="critical-banner__sub">{latestUrgent.title} at {latestUrgent.property_name}</div>
            </div>
          </div>
          <button
            className="critical-banner__cta critical-banner__cta--red"
            onClick={(e) => { e.stopPropagation(); onNavigate?.('emergency'); }}
          >
            Review & Dispatch
          </button>
        </div>
      )}

      {SLAs > 0 && (
        <div
          className="critical-banner critical-banner--sla"
          onClick={() => onNavigate?.('tasks')}
          role="button"
          tabIndex={0}
        >
          <div className="critical-banner__left">
            <span className="critical-banner__icon">⚠️</span>
            <div>
              <div className="critical-banner__title">{SLAs} Pending Owner Approvals</div>
              <div className="critical-banner__sub">Awaiting decision before work can proceed</div>
            </div>
          </div>
          <button
            className="critical-banner__cta critical-banner__cta--amber"
            onClick={(e) => { e.stopPropagation(); onNavigate?.('tasks'); }}
          >
            View Approvals
          </button>
        </div>
      )}
    </section>
  );
}