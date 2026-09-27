// apps/owner-portal/src/pages/Incidents/components/IncidentCard.tsx
import type { Incident } from '../../../context/OwnerContext';

interface IncidentCardProps {
  incident: Incident;
  onViewDetail: () => void;
  onReviewApproval: () => void;
}

export default function IncidentCard({
  incident,
  onViewDetail,
  onReviewApproval,
}: IncidentCardProps) {
  const severityLabel =
    incident.severity === 'critical'
      ? '🚨'
      : incident.severity === 'moderate'
      ? '⚠'
      : '';

  const statusClass =
    incident.status === 'in-progress' ? 'isb-progress' : 'isb-monitoring';

  const statusLabel =
    incident.status === 'in-progress' ? 'In Progress' : 'Monitoring';

  return (
    <article className={`incident-card ${incident.severity}`}>
      <header className="ic-header">
        <div className="ic-header-left">
          <div className="ic-title-row">
            <div className="ic-title">
              {severityLabel && <span className="ic-title-emoji">{severityLabel}</span>}
              {incident.title}
            </div>
          </div>
          <div className="ic-meta">
            <span>{incident.propertyName}</span>
            <span>·</span>
            <span>{incident.type}</span>
            <span>·</span>
            <span>{incident.startedLabel}</span>
          </div>
        </div>
        <div className={`ic-status-badge ${statusClass}`}>
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="8" r="7" />
            <path d="M8 4v4l2.5 2.5" />
          </svg>
          {statusLabel}
        </div>
      </header>

      <div className="ic-body">
        <div className="ic-section">
          <div className="ic-location">{incident.location}</div>
          <div className="ic-duration">{incident.durationLabel}</div>
          <div className="ic-signal ic-signal--green">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 9l4 4 8-8" />
            </svg>
            {incident.recurrenceNote}
          </div>
          <div className={`ic-signal ${incident.severity === 'critical' ? 'ic-signal--amber' : 'ic-signal--green'}`}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              {incident.severity === 'critical' ? (
                <>
                  <circle cx="8" cy="8" r="7" />
                  <path d="M8 5v4M8 11v.5" />
                </>
              ) : (
                <path d="M2 9l4 4 8-8" />
              )}
            </svg>
            {incident.guestImpactNote}
          </div>
        </div>

        <div className="ic-section">
          <div className="ic-section-lbl">Status</div>
          <div className={`control-signal${incident.controlled ? '' : ' attention'}`}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              {incident.controlled ? (
                <path d="M2 9l4 4 8-8" />
              ) : (
                <>
                  <circle cx="8" cy="8" r="7" />
                  <path d="M8 4v4l2.5 2.5" />
                </>
              )}
            </svg>
            {incident.controlSignal}
          </div>
        </div>

        <div className="ic-section">
          <div className="ic-section-lbl">Financial Impact</div>
          <div className="ic-cost">{incident.costEstimate}</div>
          {incident.costApprovalNote && (
            <div className="ic-cost-sub">{incident.costApprovalNote}</div>
          )}
        </div>
      </div>

      <footer className="ic-footer">
        <button type="button" className="btn-link" onClick={onViewDetail}>
          View details →
        </button>
        {incident.awaitingApproval && (
          <button
            type="button"
            className="btn btn-ghost btn-sm ic-footer-cta"
            onClick={onReviewApproval}
          >
            Review approval →
          </button>
        )}
      </footer>
    </article>
  );
}
