// src/views/alerts/ApprovalInquiryDrawer.jsx
import { useState, useEffect } from 'react';
import { APPROVAL_INQUIRY as AI } from '../../data/signals';

const STATE_META = {
  'question-pending': { icon: '💬', label: 'Owner Question Pending PM Response', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', awaiting: 'PM' },
  'pm-responded':     { icon: '✓',  label: 'PM Responded — Awaiting Owner Decision', color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', awaiting: 'Owner' },
  withdrawn:          { icon: '↩',  label: 'Withdrawn by PM', color: '#6B7280', bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.2)', awaiting: 'none' },
};

export default function ApprovalInquiryDrawer({ open, onClose, onStateChange, onToast }) {
  const [state, setState]           = useState('question-pending');
  const [response, setResponse]     = useState('');
  const [respondedText, setRT]      = useState('');
  const [respondedAt, setRAt]       = useState('');
  const [audit, setAudit]           = useState([
    { ts: 'Apr 12 · 8:30 AM', text: 'PM submitted approval request — $2,400 · HVAC Full Replacement · AirPro HVAC Services' },
    { ts: 'Apr 12 · 9:14 AM', text: 'Approval sent to owner · Status: Awaiting Owner Decision' },
    { ts: 'Apr 12 · 9:26 AM', text: 'Owner asked question · "Can we get a second quote first?" · Status: Owner Question Pending PM Response', tone: 'amber' },
  ]);

  useEffect(() => {
    if (open) { setState('question-pending'); setResponse(''); setRT(''); setRAt(''); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const meta = STATE_META[state] || STATE_META['question-pending'];

  const logAudit = (text, tone) => {
    const now = new Date();
    const label = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setAudit(prev => [...prev, { ts: label, text, tone }]);
  };

  const handleRespond = () => {
    const text = response.trim();
    if (!text) return;
    setRT(text);
    setRAt('PM · ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    setState('pm-responded');
    onStateChange?.('pm-responded');
    logAudit('PM responded to owner question · Status: PM Responded — Awaiting Owner Decision');
    logAudit('Owner notified of PM response');
    onToast?.('Response sent — owner notified', 'success');
  };

  const handleWithdraw = () => {
    if (!window.confirm('Withdraw this approval request?')) return;
    setState('withdrawn');
    onStateChange?.('withdrawn');
    logAudit('PM withdrew approval request · Owner and vendor notified');
    onToast?.('Approval request withdrawn', 'info');
    setTimeout(onClose, 1500);
  };

  return (
    <>
      <div className="alerts-drawer-overlay open" onClick={onClose} />
      <aside className="alerts-drawer alerts-drawer--wide open" onClick={(e) => e.stopPropagation()}>
        <div className="alerts-drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="alerts-drawer-eyebrow" style={{ color: '#F59E0B' }}>Approval Inquiry</div>
            <div className="alerts-drawer-title">{AI.title}</div>
            <div className="alerts-drawer-sub">{AI.property}</div>
          </div>
          <button className="alerts-drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="alerts-drawer-body">
          <div className="alerts-section-title">Approval Status</div>
          <div className="aid-status-banner" style={{ background: meta.bg, borderColor: meta.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15 }}>{meta.icon}</span>
              <div>
                <div className="aid-status-label" style={{ color: meta.color }}>{meta.label}</div>
                {state === 'question-pending' && (
                  <div className="aid-status-hint">Owner is waiting. Respond to move this forward.</div>
                )}
              </div>
            </div>
            {meta.awaiting !== 'none' && (
              <span className="aid-awaiting-badge" style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                Awaiting: {meta.awaiting}
              </span>
            )}
          </div>

          {/* Approval item */}
          <div className="alerts-section-title">Approval Item</div>
          <div className="osd-grid-2">
            <div className="osd-tile">
              <div className="osd-tile-label">Vendor</div>
              <div className="osd-tile-value">{AI.vendor.name}</div>
              <div className="osd-tile-sub">{AI.vendor.meta}</div>
            </div>
            <div className="osd-tile">
              <div className="osd-tile-label">Amount</div>
              <div className="osd-tile-value" style={{ color: 'var(--gold)', fontSize: 16 }}>{AI.amount}</div>
              <div className="osd-tile-sub" style={{ color: '#F59E0B' }}>{AI.amountNote}</div>
            </div>
          </div>
          <div className="osd-tile" style={{ marginBottom: 20 }}>
            <div className="osd-tile-label">PM Recommendation</div>
            <div className="osd-tile-quote">{AI.recommendation}</div>
          </div>

          {/* Owner question */}
          <div className="alerts-section-title">Owner Question</div>
          <div className="aid-question-block">
            <div className="aid-owner-row">
              <div className="osd-owner-avatar">{AI.owner.initials}</div>
              <div>
                <div className="osd-owner-name">{AI.owner.name}</div>
                <div className="osd-owner-role">{AI.owner.role} · Asked {AI.askedAt}</div>
              </div>
            </div>
            <div className="aid-quote">{AI.question}</div>
          </div>

          {/* Respond */}
          {state === 'question-pending' && (
            <>
              <div className="alerts-section-title">Your Response</div>
              <textarea
                className="alerts-input"
                rows={4}
                placeholder="Reply to owner — be direct. Address the question specifically."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="alerts-btn alerts-btn--gold" onClick={handleRespond} style={{ flex: 2 }}>
                  Send Response
                </button>
                <button
                  className="alerts-btn alerts-btn--secondary"
                  onClick={() => setResponse(r => 'I have updated my recommendation based on your question. ' + r)}
                  style={{ flex: 1 }}
                >
                  Update Rec
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="alerts-btn alerts-btn--ghost" style={{ flex: 1 }}>
                  📎 Attach Revised Quote
                </button>
                <button className="alerts-btn alerts-btn--danger" onClick={handleWithdraw} style={{ flex: 1 }}>
                  Withdraw Request
                </button>
              </div>
            </>
          )}

          {state === 'pm-responded' && (
            <>
              <div className="alerts-section-title">Your Response</div>
              <div className="aid-response-block">
                <div className="aid-owner-row">
                  <div className="osd-owner-avatar" style={{ background: '#22C55E' }}>PM</div>
                  <div>
                    <div className="osd-owner-name">You (PM)</div>
                    <div className="osd-owner-role">{respondedAt}</div>
                  </div>
                </div>
                <div className="aid-quote">{respondedText}</div>
              </div>
              <div className="aid-info-callout">
                ✓ Response sent — owner has been notified. Awaiting owner decision.
              </div>
            </>
          )}

          {state === 'withdrawn' && (
            <div className="osd-done">
              <div className="osd-done-title" style={{ color: '#6B7280' }}>Approval Request Withdrawn</div>
              <div className="osd-done-sub">Owner and vendor have been notified</div>
            </div>
          )}

          {/* Audit */}
          <div className="alerts-section-title">Audit Trail</div>
          <div>
            {audit.map((a, i) => (
              <div key={i} className="aid-audit-row">
                <div className={`aid-audit-ts ${a.tone === 'amber' ? 'amber' : ''}`}>{a.ts}</div>
                <div className={`aid-audit-text ${a.tone === 'amber' ? 'amber' : ''}`}>{a.text}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}