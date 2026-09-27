// apps/owner-portal/src/pages/Approvals/components/ApprovalDrawer.tsx
import type { Approval } from '../../../context/OwnerContext';

interface ApprovalDrawerProps {
  target: Approval | null;
  onClose: () => void;
  onApprove: (approval: Approval) => void;
  onDecline: (approval: Approval) => void;
}

export default function ApprovalDrawer({ target, onClose, onApprove, onDecline }: ApprovalDrawerProps) {
  return (
    <>
      <div className={`overlay${target ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer drawer--right${target ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Approval detail"
      >
        {target && (
          <>
            <header className="d-hdr">
              <div>
                <div className="d-title">{target.title}</div>
                <div className="d-sub">{target.propertyName} · {target.detail}</div>
              </div>
              <button type="button" className="d-close" onClick={onClose} aria-label="Close">✕</button>
            </header>

            <div className="d-body">
              <div className="detail-block">
                <div className="detail-block__label">PM Recommendation</div>
                <div className="detail-block__text">
                  Immediate repair recommended to prevent guest disruption and structural damage.
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-stat">
                  <div className="detail-stat__label">Amount</div>
                  <div className="detail-stat__value gold">${target.amount.toLocaleString()}</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat__label">Deadline</div>
                  <div className="detail-stat__value warning">{target.deadlineLabel}</div>
                </div>
              </div>

              <div>
                <div className="d-lbl">Details</div>
                <div className="d-panel">
                  <div className="d-row"><span className="d-row-lbl">Category</span><span className="d-row-val">{target.category}</span></div>
                  <div className="d-row"><span className="d-row-lbl">Property</span><span className="d-row-val">{target.propertyName}</span></div>
                  <div className="d-row"><span className="d-row-lbl">Location</span><span className="d-row-val">{target.detail}</span></div>
                  <div className="d-row"><span className="d-row-lbl">Amount</span><span className="d-row-val gold">${target.amount.toLocaleString()}</span></div>
                  <div className="d-row"><span className="d-row-lbl">Deadline</span><span className="d-row-val">{target.deadlineLabel}</span></div>
                </div>
              </div>

              <div>
                <div className="d-lbl">Evidence / Quote</div>
                <div className="detail-evidence">
                  Vendor quote attached. Includes labour, materials, and cleanup. Quote valid 48h.
                </div>
              </div>

              <div className="detail-actions">
                <button type="button" className="btn btn-primary" onClick={() => onApprove(target)}>
                  Approve
                </button>
                <button type="button" className="btn btn-danger-ghost" onClick={() => onDecline(target)}>
                  Decline
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
