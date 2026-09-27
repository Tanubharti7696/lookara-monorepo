// apps/owner-portal/src/pages/Dashboard/components/UrgentApprovals.tsx
import { useNavigate } from 'react-router-dom';
import { useOwner, type Approval } from '../../../context/OwnerContext';
import { useToast } from '../../../context/ToastContext';

interface UrgentApprovalsProps {
  onDecline: (approval: Approval) => void;
  onViewDetail: (approval: Approval) => void;
}

export default function UrgentApprovals({
  onDecline,
  onViewDetail,
}: UrgentApprovalsProps) {
  const navigate = useNavigate();
  const { approvals: allApprovals, incidents, approveApproval } = useOwner();
  const approvals = allApprovals.filter((a) => a.priority !== 'low');
  const { showToast } = useToast();

  const handleApprove = (approval: Approval) => {
    approveApproval(approval.id);
    showToast(`${approval.title} approved — PM notified`, 'success');
  };

  return (
    <aside className="action-panel">
      <div className="action-section-title">
        <svg
          width="11"
          height="11"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M8 1l2 4 4.5.7-3.25 3.15.77 4.5L8 11.1 3.98 13.35l.77-4.5L1.5 5.7 6 5z" />
        </svg>
        Approvals
        {approvals.length > 0 && (
          <span className="action-count">{approvals.length}</span>
        )}
      </div>

      {approvals.map((approval) => (
        <article
          key={approval.id}
          className={`approval-card${approval.urgent ? ' urgent' : ''}`}
        >
          <div className="approval-top">
            <div className="approval-title">{approval.title}</div>
            <div className="approval-amount">${approval.amount}</div>
          </div>

          <div className="approval-property">
            {approval.propertyName} · {approval.detail}
          </div>

          <div
            className={`approval-urgency${
              approval.urgent ? '' : ' is-muted'
            }`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="7" />
              <path d="M8 4v4l2.5 2.5" />
            </svg>
            {approval.urgencyLabel}
          </div>

          <div className="approval-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleApprove(approval)}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn btn-danger-ghost"
              onClick={() => onDecline(approval)}
            >
              Decline
            </button>
            <button
              type="button"
              className="btn-link approval-view"
              onClick={() => onViewDetail(approval)}
            >
              View →
            </button>
          </div>
        </article>
      ))}

      {approvals.length === 0 && (
        <div className="all-clear-box">
          <div className="all-clear-icon">✓</div>
          <div className="all-clear-label">No pending approvals</div>
          <div className="all-clear-sub">You're all caught up</div>
        </div>
      )}

      <div className="section-divider" />

      <div className="action-section-title">
        <svg
          width="11"
          height="11"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v4M8 11v.5" />
        </svg>
        Active Incidents
        {incidents.length > 0 && (
          <span className="action-count red">{incidents.length}</span>
        )}
      </div>

      {incidents.map((incident) => (
        <article key={incident.id} className="incident-card">
          <div className="incident-top">
            <div className="incident-title">
              <span className="severity-dot" />
              {incident.title}
            </div>
            <span className="incident-status-badge">{incident.status}</span>
          </div>

          <div className="incident-meta">
            <span>{incident.propertyName}</span>
            <span>{incident.location || incident.meta}</span>
            <span className="incident-eta">{incident.startedLabel}</span>
          </div>

          <div className="incident-cost">
            Est. cost: <span>{incident.costEstimate || incident.costRange}</span>
          </div>

          <div className="incident-cta">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/incidents')}
            >
              View Details →
            </button>
          </div>
        </article>
      ))}

      {incidents.length === 0 && (
        <div className="all-clear-box">
          <div className="all-clear-icon">✓</div>
          <div className="all-clear-label">All clear</div>
          <div className="all-clear-sub">No active incidents</div>
        </div>
      )}

      {approvals.length > 0 && (
        <div className="pending-note">
          {approvals.length} action{approvals.length === 1 ? '' : 's'} pending —
          review required
        </div>
      )}
    </aside>
  );
}
