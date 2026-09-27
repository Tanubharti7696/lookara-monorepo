// src/views/alerts/OwnerStayDrawer.jsx
import { useState, useEffect } from 'react';
import { OWNER_STAY_REQUEST as R } from '../../data/signals';

const STATE_BANNER = {
  new:              { icon: '🕐', label: 'New request — respond within 24h', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', color: '#F59E0B', badge: '23h 46m remaining' },
  'awaiting-owner': { icon: '🔄', label: 'Awaiting owner confirmation',      bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)', color: '#3B82F6', badge: 'Owner notified' },
  approved:         { icon: '✓',  label: 'Approved — Calendar blocked Apr 14–16', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', color: '#22C55E', badge: null },
  declined:         { icon: '✕',  label: 'Request declined',                 bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.20)', color: '#DC2626', badge: null },
};

export default function OwnerStayDrawer({ open, onClose, onStateChange, onToast }) {
  const [state, setState]       = useState('new');
  const [showAdjust, setAdjust] = useState(false);
  const [showDecline, setDecl]  = useState(false);
  const [audit, setAudit]       = useState([
    { ts: 'Apr 12 · 9:14 AM', text: 'Owner submitted stay request — Apr 14–16 · Seaside Villa' },
  ]);

  useEffect(() => {
    if (open) { setState('new'); setAdjust(false); setDecl(false); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const banner = STATE_BANNER[state] || STATE_BANNER.new;

  const logAudit = (text) => {
    const now = new Date();
    const label = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setAudit(prev => [...prev, { ts: label, text }]);
  };

  const handleApprove = () => {
    setState('approved');
    onStateChange?.('approved');
    logAudit('PM approved request — Apr 14–16 · Calendar blocked · OTA sync triggered');
    onToast?.('Owner stay approved — Calendar blocked Apr 14–16', 'success');
  };

  const handleSendAdjusted = () => {
    setState('awaiting-owner');
    onStateChange?.('awaiting-owner');
    logAudit('PM proposed adjusted dates · Awaiting owner confirmation');
    onToast?.('Proposal sent to owner — awaiting confirmation', 'info');
  };

  const handleConfirmDecline = () => {
    setState('declined');
    onStateChange?.('declined');
    logAudit('PM declined request · Owner notified');
    onToast?.('Request declined — owner notified', 'danger');
  };

  return (
    <>
      <div className="alerts-drawer-overlay open" onClick={onClose} />
      <aside className="alerts-drawer open" onClick={(e) => e.stopPropagation()}>
        <div className="alerts-drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="alerts-drawer-eyebrow" style={{ color: '#F59E0B' }}>Owner Stay Request</div>
            <div className="alerts-drawer-title">{R.property}</div>
            <div className="alerts-drawer-sub">Submitted {R.submittedAt}</div>
          </div>
          <button className="alerts-drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="alerts-drawer-body">
          {/* Status banner */}
          <div className="osd-status-banner" style={{
            background: banner.bg, borderColor: banner.border, color: banner.color,
          }}>
            <span>{banner.icon}</span>
            <span>{banner.label}</span>
            {banner.badge && <span className="osd-countdown">{banner.badge}</span>}
          </div>

          <SectionTitle>Request Details</SectionTitle>

          <div className="osd-grid-2">
            <div className="osd-tile">
              <div className="osd-tile-label">Check-in</div>
              <div className="osd-tile-value">{R.checkIn.date}</div>
              <div className="osd-tile-sub">{R.checkIn.day}</div>
            </div>
            <div className="osd-tile">
              <div className="osd-tile-label">Check-out</div>
              <div className="osd-tile-value">{R.checkOut.date}</div>
              <div className="osd-tile-sub">{R.checkOut.day}</div>
            </div>
          </div>

          <div className="osd-tile" style={{ marginBottom: 14 }}>
            <div className="osd-tile-label">Owner Note</div>
            <div className="osd-tile-quote">"{R.ownerNote}"</div>
          </div>

          <div className="osd-tile" style={{ marginBottom: 20 }}>
            <div className="osd-tile-label">Requested By</div>
            <div className="osd-owner-row">
              <div className="osd-owner-avatar">{R.owner.initials}</div>
              <div>
                <div className="osd-owner-name">{R.owner.name}</div>
                <div className="osd-owner-role">{R.owner.role}</div>
              </div>
            </div>
          </div>

          {/* Conflict check */}
          <SectionTitle>Conflict Check</SectionTitle>
          <div style={{ marginBottom: 20 }}>
            {R.conflicts.map((c, i) => (
              <div key={i} className={`osd-conflict osd-conflict--${c.tone}`}>
                <span>{c.tone === 'ok' ? '✓' : '⚠'}</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>

          {/* Impact */}
          <SectionTitle>Impact Summary</SectionTitle>
          <div className="osd-tile" style={{ marginBottom: 20 }}>
            <Row label="Revenue impact" value={R.impact.revenue} tone="amber" />
            <Row label="Vendor impact"  value={R.impact.vendor}  tone="amber" />
            <Row label="Guest impact"   value={R.impact.guest}   tone="green" />
          </div>

          {/* Adjust panel */}
          {showAdjust && (
            <div style={{ marginBottom: 20 }}>
              <SectionTitle>Propose New Dates</SectionTitle>
              <div className="osd-grid-2">
                <div>
                  <div className="osd-tile-label">New Check-in</div>
                  <input type="date" className="alerts-input" defaultValue="2026-04-15" />
                </div>
                <div>
                  <div className="osd-tile-label">New Check-out</div>
                  <input type="date" className="alerts-input" defaultValue="2026-04-17" />
                </div>
              </div>
              <textarea className="alerts-input" rows={2} placeholder="Reason for adjustment (optional)…" style={{ marginTop: 10 }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="alerts-btn alerts-btn--gold" onClick={handleSendAdjusted} style={{ flex: 1 }}>
                  Send Proposal to Owner
                </button>
                <button className="alerts-btn alerts-btn--ghost" onClick={() => setAdjust(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Decline panel */}
          {showDecline && (
            <div style={{ marginBottom: 20 }}>
              <SectionTitle>Decline Request</SectionTitle>
              <textarea className="alerts-input" rows={2} placeholder="Reason (optional — sent to owner)…" />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="alerts-btn alerts-btn--danger" onClick={handleConfirmDecline} style={{ flex: 1 }}>
                  Confirm Decline
                </button>
                <button className="alerts-btn alerts-btn--ghost" onClick={() => setDecl(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Action panel */}
          {state === 'new' && !showAdjust && !showDecline && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <button className="alerts-btn alerts-btn--gold" onClick={handleApprove}>
                ✓ Approve As-Is — Block Calendar
              </button>
              <button className="alerts-btn alerts-btn--secondary" onClick={() => setAdjust(true)}>
                ✏ Adjust Dates — Propose New Dates
              </button>
              <button className="alerts-btn alerts-btn--danger" onClick={() => setDecl(true)}>
                ✕ Decline Request
              </button>
            </div>
          )}

          {state === 'approved' && (
            <div className="osd-done osd-done--success">
              <div style={{ fontSize: 20, marginBottom: 6 }}>✓</div>
              <div className="osd-done-title" style={{ color: '#22C55E' }}>Calendar Blocked</div>
              <div className="osd-done-sub">Apr 14–16 · Seaside Villa · OTA sync rules applied</div>
            </div>
          )}

          {state === 'awaiting-owner' && (
            <div className="osd-done">
              <div className="osd-done-title" style={{ color: '#3B82F6' }}>Proposal Sent</div>
              <div className="osd-done-sub">Awaiting owner confirmation before calendar is blocked</div>
            </div>
          )}

          {state === 'declined' && (
            <div className="osd-done osd-done--danger">
              <div className="osd-done-title" style={{ color: '#DC2626' }}>Request Declined</div>
              <div className="osd-done-sub">Owner has been notified</div>
            </div>
          )}

          {/* Audit */}
          <SectionTitle>Audit Trail</SectionTitle>
          <div>
            {audit.map((a, i) => (
              <div key={i} className="aid-audit-row">
                <div className="aid-audit-ts">{a.ts}</div>
                <div className="aid-audit-text">{a.text}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ children }) {
  return <div className="alerts-section-title">{children}</div>;
}

function Row({ label, value, tone }) {
  return (
    <div className="osd-row">
      <span className="osd-row-label">{label}</span>
      <span className={`osd-row-value osd-row-value--${tone || ''}`}>{value}</span>
    </div>
  );
}