import { useState } from 'react';
import { useTaskActions } from '../useTaskActions';

const METHODS = ['Check', 'ACH', 'Zelle', 'Wire', 'Cash', 'Other'];

export default function RecordPaymentOverlay({ task, onClose, onUpdate }) {
  const actions = useTaskActions(task, onUpdate);
  const [amount, setAmount] = useState(task.paymentAmount?.replace(/[$,]/g, '') || '0.00');
  const [method, setMethod] = useState('');
  const [ref, setRef] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US'));
  const [notify, setNotify] = useState(true);

  const handleRecord = () => {
    if (!amount || parseFloat(amount) <= 0 || !method) return;

    const paymentRecord = {
      amount,
      method,
      ref: ref || '—',
      date,
      status: 'sent',
      sentAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    onUpdate?.({ state: 'payment-sent', payment: paymentRecord, paymentAmount: amount });
    actions.addTimeline(
      `Payment of $${amount} recorded — sent to ${task.vendor} via ${method}${ref ? ` · Ref: ${ref}` : ''}`,
      'payment',
      'PM',
    );
    onClose();
  };

  return (
    <div className="lk-overlay" onClick={onClose}>
      <div className="lk-overlay__panel" onClick={(event) => event.stopPropagation()}>
        <div className="lk-overlay__head">
          <div>
            <div className="lk-overlay__title">Record Payment Sent</div>
            <div className="lk-overlay__sub">{task.name}</div>
          </div>
          <button className="lk-overlay__close" onClick={onClose}>✕</button>
        </div>

        <div className="lk-overlay__body">
          <div className="lk-banner lk-banner--blue" style={{ marginBottom: 14 }}>
            <div className="lk-banner__title">ℹ Payment Note</div>
            <div className="lk-banner__sub">
              Payment is completed <strong style={{ color: 'var(--text)' }}>outside of Lookara</strong>.
              This action records that payment has already been sent. Lookara does not process
              or guarantee payment delivery.
            </div>
          </div>

          <div className="lk-field">
            <label className="lk-field__label">Amount</label>
            <input className="lk-field__input" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>

          <div className="lk-field">
            <label className="lk-field__label">Payment Method <span style={{ color: 'var(--crimson)' }}>*</span></label>
            <div className="lk-method-grid">
              {METHODS.map((paymentMethod) => (
                <button
                  key={paymentMethod}
                  type="button"
                  className={`lk-method-btn ${method === paymentMethod ? 'active' : ''}`}
                  onClick={() => setMethod(paymentMethod)}
                >
                  {paymentMethod}
                </button>
              ))}
            </div>
          </div>

          <div className="lk-field">
            <label className="lk-field__label">Reference (optional)</label>
            <input className="lk-field__input" type="text" value={ref} onChange={(event) => setRef(event.target.value)} placeholder="Check #1024 · Zelle ID · ACH ref…" />
          </div>

          <div className="lk-field">
            <label className="lk-field__label">Payment Date</label>
            <input className="lk-field__input" type="text" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-0)', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={notify} onChange={(event) => setNotify(event.target.checked)} style={{ accentColor: 'var(--gold)' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Notify vendor to confirm receipt</div>
              <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 1 }}>{task.vendor} will be asked to confirm</div>
            </div>
          </label>
        </div>

        <div className="lk-overlay__foot">
          <button className="lk-btn lk-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="lk-btn lk-btn--primary" onClick={handleRecord} disabled={!amount || !method} style={{ opacity: amount && method ? 1 : 0.5 }}>
            Record Payment Sent
          </button>
        </div>
      </div>
    </div>
  );
}