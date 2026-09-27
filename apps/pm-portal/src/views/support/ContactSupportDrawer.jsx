// src/views/support/ContactSupportDrawer.jsx
import { useState } from 'react';
import { CONTACT_REASONS } from '../../data/supportData';

export default function ContactSupportDrawer({ defaultReason, onClose, onToast }) {
  const [form, setForm] = useState({
    subject: '',
    reason: defaultReason || CONTACT_REASONS[0],
    priority: 'medium',
    description: '',
    attachment: '',
    ccMe: true,
  });
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSend = form.subject.trim().length > 0 && form.description.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onToast?.('Ticket created — we\'ll reply within 4 business hours', 'success');
      onClose();
    }, 900);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="overlay-drawer" onClick={e => e.stopPropagation()}>
        <header className="overlay-drawer__head">
          <div>
            <div className="overlay-drawer__eyebrow">Support</div>
            <div className="overlay-drawer__title">Contact Support</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </header>

        <div className="overlay-drawer__body">
          <div className="form-group">
            <div className="form-group__title">Ticket Details</div>

            <div className="form-row">
              <label className="form-row__label">Subject *</label>
              <div className="form-row__input">
                <input
                  className="stg-input"
                  autoFocus
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  placeholder="Briefly describe the issue"
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-row__label">Reason</label>
              <div className="form-row__input">
                <select className="stg-input" value={form.reason} onChange={e => set('reason', e.target.value)}>
                  {CONTACT_REASONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <label className="form-row__label">Priority</label>
              <div className="form-row__input">
                <div className="sup-priority-grid">
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`sup-priority-btn sup-priority-btn--${p} ${form.priority === p ? 'active' : ''}`}
                      onClick={() => set('priority', p)}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <label className="form-row__label">Description *</label>
              <div className="form-row__input">
                <textarea
                  className="stg-input"
                  rows={7}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="What were you doing? What did you expect? What happened instead? Screenshots help."
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-row__label">Attachment</label>
              <div className="form-row__input">
                <button
                  type="button"
                  className="sup-attach-btn"
                  onClick={() => set('attachment', 'screenshot.png')}
                >
                  📎 {form.attachment || 'Attach a screenshot or file'}
                </button>
              </div>
            </div>

            <label className="sup-cc">
              <input
                type="checkbox"
                checked={form.ccMe}
                onChange={e => set('ccMe', e.target.checked)}
              />
              <span>Email me a copy of this ticket</span>
            </label>
          </div>

          <div className="sup-drawer-tip">
            💡 The more context you share, the faster we can help. Include the property name or ticket ID if relevant.
          </div>
        </div>

        <footer className="overlay-drawer__foot">
          <button className="stg-btn stg-btn--outline" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            className="stg-btn stg-btn--primary"
            onClick={submit}
            disabled={!canSend || sending}
          >
            {sending ? 'Sending…' : 'Submit Ticket'}
          </button>
        </footer>
      </aside>
    </div>
  );
}