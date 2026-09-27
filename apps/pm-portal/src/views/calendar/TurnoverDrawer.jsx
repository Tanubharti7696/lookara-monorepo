// src/views/calendar/TurnoverDrawer.jsx
import { useEffect } from 'react';
import { TURNOVER_DATA } from '../../data/calendar';

const READINESS_COLORS = {
  ready: '#22C55E',
  cleaning: '#D4AF37',
  'at-risk': '#DC2626',
  offline: '#6B7280',
};

const STATUS_COLORS = {
  accepted: '#22C55E',
  dispatched: '#F59E0B',
  unassigned: '#DC2626',
  'in-progress': '#22C55E',
};

export default function TurnoverDrawer({ turnoverKey, onClose, onOpenTask, onAssignCleaner, onToast }) {
  useEffect(() => {
    if (!turnoverKey) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [turnoverKey, onClose]);

  if (!turnoverKey) return null;
  const data = TURNOVER_DATA[turnoverKey];
  if (!data) return null;

  const rColor = READINESS_COLORS[data.readiness] || '#D4AF37';
  const sColor = STATUS_COLORS[data.cleanerStatus] || '#F59E0B';

  return (
    <>
      <div className="turnover-backdrop" onClick={onClose} />
      <aside className="turnover-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="turnover-drawer__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="turnover-drawer__eyebrow">Turnover Details</div>
            <div className="turnover-drawer__sub">{data.property} · {turnoverKey.split('|')[1]}</div>
          </div>
          <button className="turnover-drawer__close" onClick={onClose}>×</button>
        </div>

        <div className="turnover-drawer__body">
          <div className="turnover-drawer__hero">
            <div className="turnover-drawer__hero-title">
              <span>📅</span> Turnover Cleaning
            </div>
            <div className="turnover-drawer__hero-sub">{data.property} · {turnoverKey.split('|')[1]}</div>
            <div
              className="turnover-drawer__readiness"
              style={{ color: rColor, borderColor: `${rColor}33`, background: 'rgba(0,0,0,0.2)' }}
            >
              {data.readinessLabel}
            </div>
          </div>

          <div className="turnover-drawer__block turnover-drawer__block--gold">
            <div className="turnover-drawer__block-title">Turnover Window</div>
            <div className="turnover-drawer__grid">
              <div>
                <div className="turnover-drawer__cell-label">Checkout</div>
                <div className="turnover-drawer__cell-value">{data.checkoutTime}</div>
              </div>
              <div>
                <div className="turnover-drawer__cell-label">Check-in</div>
                <div className="turnover-drawer__cell-value">{data.checkinTime}</div>
              </div>
              <div>
                <div className="turnover-drawer__cell-label">Window</div>
                <div className="turnover-drawer__cell-value turnover-drawer__cell-value--gold">
                  {data.cleaningWindow}
                </div>
              </div>
            </div>
          </div>

          <div className="turnover-drawer__block">
            <div className="turnover-drawer__block-title">Assigned Cleaner</div>
            <div className="turnover-drawer__row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: sColor, display: 'inline-block',
                }} />
                <span style={{ color: data.cleaner ? 'var(--text)' : 'var(--crimson)', fontWeight: 600, fontSize: 12 }}>
                  {data.cleaner || 'No cleaner assigned'}
                </span>
              </div>
              <span className="turnover-drawer__status" style={{ color: sColor }}>
                {data.cleanerStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="turnover-drawer__meta">
            <span className="turnover-drawer__task-id">{data.taskId}</span>
            <span className="turnover-drawer__source">📅 {data.source}</span>
          </div>

          <div className="turnover-drawer__actions">
            {data.cleanerStatus === 'unassigned' ? (
              <button className="turnover-drawer__btn turnover-drawer__btn--gold" onClick={onAssignCleaner}>
                Assign Cleaner
              </button>
            ) : (
              <button
                className="turnover-drawer__btn turnover-drawer__btn--secondary"
                onClick={() => onToast('Opening call/text flow…', 'info')}
              >
                Contact Cleaner
              </button>
            )}
            <button
              className="turnover-drawer__btn turnover-drawer__btn--ghost"
              onClick={() => onOpenTask(data.taskId)}
            >
              View Full Task
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}