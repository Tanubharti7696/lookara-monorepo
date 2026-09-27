// apps/owner-portal/src/pages/Incidents/Incidents.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwner, type Incident } from '../../context/OwnerContext';
import { useToast } from '../../context/ToastContext';
import IncidentCard from './components/IncidentCard';
import ResolvedHistory from './components/ResolvedHistory';
import IncidentDetail from './components/IncidentDetail';
import './Incidents.css';

export default function Incidents() {
  const navigate = useNavigate();
  const {
    incidents,
    resolvedIncidents,
    historyIncidents,
    approvals,
  } = useOwner();
  const { showToast } = useToast();

  const [detailTarget, setDetailTarget] = useState<Incident | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const awaitingApprovalCount = incidents.filter((i) => i.awaitingApproval).length;
  const avgCost = 218;

  const resolvedYtd = resolvedIncidents.length + historyIncidents.length;

  const handleReviewApproval = (approvalId: string | undefined) => {
    if (!approvalId) return;
    const exists = approvals.some((a) => a.id === approvalId);
    if (!exists) {
      showToast('Approval already resolved', 'info');
      return;
    }
    navigate('/approvals');
  };

  return (
    <div className="page-body">
      {/* Summary */}
      <div className="summary-bar">
        <button
          type="button"
          className="sum-stat"
          onClick={() => showToast(`${incidents.length} active incidents this month`, 'info')}
        >
          <div className="sum-stat-lbl">Active</div>
          <div className="sum-stat-val amber">{incidents.length}</div>
          <div className="sum-stat-sub">In progress now</div>
        </button>

        <button
          type="button"
          className="sum-stat"
          onClick={() => showToast(`${criticalCount} critical incident`, 'info')}
        >
          <div className="sum-stat-lbl">Critical</div>
          <div className="sum-stat-val red">{criticalCount}</div>
          <div className="sum-stat-sub">Requires your approval</div>
        </button>

        <button
          type="button"
          className="sum-stat"
          onClick={() => showToast(`${resolvedYtd} incidents resolved this year`, 'info')}
        >
          <div className="sum-stat-lbl">Resolved YTD</div>
          <div className="sum-stat-val">{resolvedYtd}</div>
          <div className="sum-stat-sub">Avg 6h resolution</div>
        </button>

        <button
          type="button"
          className="sum-stat controlled"
          onClick={() =>
            showToast(`${awaitingApprovalCount} of ${incidents.length} awaiting your approval`, 'info')
          }
        >
          <div className="sum-stat-lbl">Avg Cost</div>
          <div className="sum-stat-val green">${avgCost}</div>
          <div className="sum-stat-sub">Per incident YTD</div>
        </button>
      </div>

      {/* Active */}
      <section className="active-section">
        <div className="section-label">Active</div>
        {incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onViewDetail={() => setDetailTarget(incident)}
            onReviewApproval={() => handleReviewApproval(incident.approvalId)}
          />
        ))}
      </section>

      {/* Recently resolved */}
      <ResolvedHistory
        title="Recently Resolved"
        subtitle="No recurring issues — system stable"
        incidents={resolvedIncidents}
        onSelect={setDetailTarget}
        variant="card"
      />

      {/* Older history (collapsed) */}
      <section className="history-section">
        <button
          type="button"
          className="history-toggle"
          onClick={() => setHistoryOpen((v) => !v)}
        >
          <span className="history-toggle-label">
            Older incidents — {historyIncidents.length} more
          </span>
          <svg
            className={`history-toggle-icon${historyOpen ? ' open' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        {historyOpen && (
          <div className="history-body">
            <div className="history-group-label">Recent — last 60 days</div>
            {historyIncidents.slice(0, 3).map((incident) => (
              <button
                key={incident.id}
                type="button"
                className="history-row"
                onClick={() => setDetailTarget(incident)}
              >
                <span className="hr-left">
                  <span className={`hr-badge ${incident.controlled ? 'hb-resolved' : 'hb-escalated'}`}>
                    {incident.controlled ? 'Resolved' : 'Escalated'} · {incident.resolutionSpeed?.split('·')[1]?.trim() ?? ''}
                  </span>
                  <span>{incident.title} — {incident.propertyName}</span>
                </span>
                <span className="hr-right">
                  <span>{incident.finalCost}</span>
                  <span>{incident.startedLabel}</span>
                </span>
              </button>
            ))}

            {historyIncidents.length > 3 && (
              <>
                <div className="history-group-label history-group-label--older">Older</div>
                {historyIncidents.slice(3).map((incident) => (
                  <button
                    key={incident.id}
                    type="button"
                    className="history-row"
                    onClick={() => setDetailTarget(incident)}
                  >
                    <span className="hr-left">
                      <span className={`hr-badge ${incident.controlled ? 'hb-resolved' : 'hb-escalated'}`}>
                        {incident.controlled ? 'Resolved' : 'Escalated'} · {incident.resolutionSpeed?.split('·')[1]?.trim() ?? ''}
                      </span>
                      <span>{incident.title} — {incident.propertyName}</span>
                    </span>
                    <span className="hr-right">
                      <span>{incident.finalCost}</span>
                      <span>{incident.startedLabel}</span>
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      <IncidentDetail target={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  );
}
