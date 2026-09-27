// apps/owner-portal/src/pages/Approvals/components/ApprovalCard.tsx
import type { Approval, ApprovalQA } from '../../../context/OwnerContext';

interface ApprovalCardProps {
  approval: Approval;
  qa: ApprovalQA | undefined;
  onApprove: () => void;
  onDecline: () => void;
  onAskQuestion: () => void;
  onViewDetail: () => void;
}

const CATEGORY_LABEL: Record<Approval['category'], string> = {
  maintenance: 'Maintenance',
  emergency: 'Emergency',
  preventive: 'Preventive',
};

export default function ApprovalCard({
  approval,
  qa,
  onApprove,
  onDecline,
  onAskQuestion,
  onViewDetail,
}: ApprovalCardProps) {
  const isUrgent = approval.priority === 'urgent';

  const askDisabled =
    qa?.status === 'awaiting-pm' || qa?.followUpAsked === true;

  const askLabel =
    qa?.status === 'pm-responded' && !qa.followUpAsked
      ? 'Ask follow-up'
      : 'Ask question';

  const askSuffix =
    qa?.status === 'pm-responded' && !qa.followUpAsked
      ? '· one more allowed'
      : qa?.followUpAsked
      ? '· no more questions'
      : '· ask before deciding';

  const showThread = qa && qa.thread.length > 0;
  const showStatusBar = qa && qa.status !== 'awaiting-owner';

  return (
    <article className={`approval-card ${isUrgent ? 'urgent' : 'normal'}`}>
      {/* Header */}
      <header className="ac-header">
        <div className="ac-header-left">
          <div className="ac-badges">
            {approval.deadlineHours < 900 && (
              <span className={`urgency-chip ${isUrgent ? 'uc-urgent' : 'uc-normal'}`}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M8 4v4l2.5 2.5" />
                </svg>
                {approval.deadlineLabel}
              </span>
            )}
            <span className={`ac-category cat-${approval.category}`}>
              {CATEGORY_LABEL[approval.category]}
            </span>
          </div>

          <div className="ac-title-row">
            <div className="ac-amount">${approval.amount.toLocaleString()}</div>
            <div className="ac-title">{approval.title}</div>
          </div>

          <div className="ac-meta">
            <span>{approval.propertyName}</span>
            <span>·</span>
            <span>{approval.detail}</span>
            {approval.aboveThreshold && (
              <>
                <span>·</span>
                <span className="ac-meta-hint">Above $500 threshold</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="ac-body">
        <div className="ac-section">
          <div className="ac-section-lbl">If you don't act</div>
          <div className="consequence">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v4M8 11v.5" />
            </svg>
            {approval.consequence}
          </div>
          {approval.contextNote && (
            <div className="ac-context">{approval.contextNote}</div>
          )}
        </div>

        <div className="ac-section">
          <div className="ac-section-lbl">PM Recommendation</div>
          <div className="pm-rec">
            <div className="pm-rec-icon">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#D4AF37" strokeWidth="2">
                <path d="M2 9l4 4 8-8" />
              </svg>
            </div>
            <div>
              <div className="pm-rec-text">{approval.recommendation}</div>
              <div className="pm-rec-name">Jordan Clarke · Your PM</div>
            </div>
          </div>
        </div>

        <div className="ac-section">
          <div className="ac-section-lbl">Evidence</div>
          <button type="button" className="evidence-item" onClick={onViewDetail}>
            <span className="evidence-icon">📄</span>
            <span>{approval.evidenceLabel}</span>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Q&A status bar */}
      {showStatusBar && (
        <div className={`approval-status-bar asb-${qa!.status}`}>
          {qa!.status === 'awaiting-pm' ? (
            <span className="status-chip sc-awaiting">
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="8" r="7" />
                <path d="M8 4v4l2 2" />
              </svg>
              {qa!.followUpAsked ? 'Follow-up sent · PM Responding' : 'Owner Question · PM Responding'}
            </span>
          ) : (
            <span className="status-chip sc-responded">
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 9l4 4 8-8" />
              </svg>
              PM Responded — Awaiting Your Decision
            </span>
          )}
          <span className="asb-note">
            {qa!.status === 'awaiting-pm'
              ? qa!.followUpAsked
                ? 'No further questions after this'
                : 'Card stays active'
              : 'Review and decide below'}
          </span>
        </div>
      )}

      {/* Q&A thread */}
      {showThread && (
        <div className="qa-thread">
          {qa!.thread.map((entry, idx) => (
            <div key={idx} className={`qa-block qa-${entry.author}`}>
              <div className={`qa-label qa-label-${entry.author}`}>
                <span>
                  {entry.author === 'owner'
                    ? entry.isFollowUp
                      ? 'You followed up'
                      : 'You asked'
                    : 'Jordan Clarke · Your PM'}
                </span>
                <span className="qa-timestamp">Just now</span>
              </div>
              <div className="qa-text">{entry.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Waiting indicator */}
      {qa?.status === 'awaiting-pm' && (
        <div className="awaiting-indicator">
          <span className="pulse-dot" />
          <span>Waiting for PM to respond…</span>
        </div>
      )}

      {/* Footer */}
      <footer className="ac-footer">
        <button type="button" className="btn btn-primary" onClick={onApprove}>
          Approve
        </button>

        <button
          type="button"
          className="btn btn-danger"
          onClick={onDecline}
          title="Declining may delay repair"
        >
          Decline
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm ac-ask-btn"
          onClick={onAskQuestion}
          disabled={askDisabled}
          title={askDisabled ? 'Question already in flight' : 'Ask before deciding'}
        >
          {askLabel}
          <span className="ac-ask-suffix">{askSuffix}</span>
        </button>

        <button type="button" className="btn-link ac-view-link" onClick={onViewDetail}>
          View details →
        </button>
      </footer>
    </article>
  );
}
