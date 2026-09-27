// src/views/tasks/drawer/overlays/QuoteReviewOverlay.jsx
import { useState } from 'react';
import { useTaskActions } from '../useTaskActions';

export default function QuoteReviewOverlay({ task, onClose, onUpdate }) {
  const actions = useTaskActions(task, onUpdate);
  const [approvedAmt, setApprovedAmt] = useState(task.quote?.amount?.replace(/[$,]/g, '') || '');

  if (!task.quote) return null;
  const q = task.quote;

  const rawAmount = parseFloat(String(q.amount).replace(/[^0-9.]/g, '')) || 0;
  const threshold = 500; // hardcoded portfolio threshold for prototype
  const overThreshold = rawAmount >= threshold;

  const handleApprove = () => {
    onUpdate?.({
      state: 'approved',
      paymentAmount: approvedAmt,
      quote: { ...q, approvedAmount: approvedAmt },
    });
    actions.addTimeline(`PM approved quote — $${approvedAmt}`, 'complete', 'PM');
    actions.setState('approved');
    onClose();
  };

  const handleReject = () => {
    onUpdate?.({
      state: 'quote-rejected',
      quote: { ...q, rejectedReason: 'Quote rejected by PM — awaiting next step.' },
    });
    actions.addTimeline('Quote rejected — vendor notified', 'block', 'PM');
    onClose();
  };

  const handleSendToOwner = () => {
    onUpdate?.({
      state: 'pending-owner-approval',
      pendingOwnerApproval: {
        sentAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        ownerName: 'Owner',
        slaDue: '48h window',
      },
    });
    actions.addTimeline('Quote sent to owner for authorization', 'status', 'PM');
    onClose();
  };

  return (
    <div className="lk-overlay" onClick={onClose}>
      <div className="lk-overlay__panel" onClick={(e) => e.stopPropagation()}>
        <div className="lk-overlay__head">
          <div>
            <div className="lk-overlay__title">Quote Review</div>
            <div className="lk-overlay__sub">{task.name}</div>
          </div>
          <button className="lk-overlay__close" onClick={onClose}>✕</button>
        </div>

        <div className="lk-overlay__body">
          {overThreshold && (
            <div className="lk-threshold">
              <div className="lk-threshold__title">⚠️ Owner Authorization Recommended</div>
              <div className="lk-threshold__sub">
                This quote (${rawAmount.toLocaleString()}) meets or exceeds your portfolio
                threshold of ${threshold.toLocaleString()}. Consider requesting owner
                authorization before approving.
              </div>
              <div className="lk-threshold__actions">
                <button className="lk-btn lk-btn--primary" onClick={handleSendToOwner}>
                  Request Owner Authorization
                </button>
              </div>
            </div>
          )}

          <div className="lk-block">
            <div className="lk-block__title">Quote Breakdown</div>
            <div className="lk-quote-row"><span className="lk-quote-row__label">Vendor</span><span className="lk-quote-row__value">{q.vendor}</span></div>
            <div className="lk-quote-row"><span className="lk-quote-row__label">Submitted</span><span className="lk-quote-row__value">{q.submitted}</span></div>
            {q.labor && <div className="lk-quote-row"><span className="lk-quote-row__label">Labor</span><span className="lk-quote-row__value">{q.labor}</span></div>}
            {q.materials && <div className="lk-quote-row"><span className="lk-quote-row__label">Materials</span><span className="lk-quote-row__value">{q.materials}</span></div>}
            {q.laborHrs && <div className="lk-quote-row"><span className="lk-quote-row__label">Est. Hours</span><span className="lk-quote-row__value">{q.laborHrs}</span></div>}
            <div className="lk-quote-total">
              <span className="lk-quote-total__label">Total</span>
              <span className="lk-quote-total__value">{q.amount}</span>
            </div>
          </div>

          {q.scope && (
            <div className="lk-block">
              <div className="lk-block__title">Scope of Work</div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                {q.scope}
              </p>
            </div>
          )}

          <div className="lk-field">
            <label className="lk-field__label">Approved Amount (edit if negotiated)</label>
            <input
              className="lk-field__input"
              type="number"
              value={approvedAmt}
              onChange={(e) => setApprovedAmt(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="lk-overlay__foot">
          <button className="lk-btn lk-btn--danger" onClick={handleReject}>Reject</button>
          <button className="lk-btn lk-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="lk-btn lk-btn--primary" onClick={handleApprove}>✓ Approve Quote</button>
        </div>
      </div>
    </div>
  );
}