// src/views/emergency/TriageCard.jsx
import { STATE_META, SOURCE_LABELS } from '../../data/taskMeta';

const SEV_STRIPE = {
  CRITICAL: 'var(--crimson)',
  HIGH:     'var(--amber)',
  MEDIUM:   'var(--blue)',
  NORMAL:   'var(--slate)',
  LOW:      'var(--line)',
};

export default function TriageCard({ task, onOpen, onQuickAction }) {
  const meta = STATE_META[task.state] || { label: task.state, color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' };
  const src  = SOURCE_LABELS[task.source] || SOURCE_LABELS.manual_intake;
  const stripe = SEV_STRIPE[task.severity] || 'var(--line)';

  const slaCls =
    task.slaStatus === 'OVERDUE' ? 'overdue'
    : task.slaStatus === 'AT RISK' ? 'risk'
    : task.slaStatus === 'ON TRACK' ? 'ok'
    : 'none';

  const actions = getQuickActions(task);

  return (
    <div
      className={`tri-card tri-card--sev-${task.severity.toLowerCase()}`}
      style={{ borderLeftColor: stripe }}
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(task.id); }}
    >
      {/* Top row: severity + age */}
      <div className="tri-card__top">
        <span className={`tri-card__sev tri-card__sev--${task.severity.toLowerCase()}`}>
          {task.severity}
        </span>
        {task.ageLabel && (
          <span className={`tri-card__age tri-card__age--${slaCls}`}>
            {task.slaStatus === 'OVERDUE' ? '⏱ ' : ''}{task.ageLabel}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="tri-card__name">{task.name}</div>

      {/* Location */}
      <div className="tri-card__loc">
        {[task.property, task.city].filter(Boolean).join(' · ')}
      </div>

      {/* State + source */}
      <div className="tri-card__pills">
        <span
          className="tri-card__state-pill"
          style={{
            background: meta.bg,
            color: meta.color,
            borderColor: `${meta.color}44`,
            borderLeftColor: meta.color,
          }}
        >
          {meta.label.toUpperCase()}
        </span>
        <span className="tri-card__src">{src.label}</span>
      </div>

      {/* SLA */}
      {task.slaTarget && task.slaTarget !== '—' && (
        <div className={`tri-card__sla tri-card__sla--${slaCls}`}>
          <span className="tri-card__sla-icon">⏱</span>
          <span className="tri-card__sla-text">
            {task.slaStatus === 'OVERDUE'
              ? `OVERDUE · Target was ${task.slaTarget}`
              : `${task.slaRemaining} remaining · Target ${task.slaTarget}`}
          </span>
        </div>
      )}

      {/* Meta row */}
      <div className="tri-card__meta">
        {task.trade && <span className="tri-card__meta-item">🔧 {task.trade}</span>}
        {task.vendor
          ? <span className="tri-card__meta-item">👤 {task.vendor}</span>
          : <span className="tri-card__meta-item tri-card__meta-item--warn">⚠ Unassigned</span>}
      </div>

      {/* Quick actions */}
      <div className="tri-card__actions" onClick={(e) => e.stopPropagation()}>
        {actions.map(a => (
          <button
            key={a.key}
            type="button"
            className={`tri-card__action tri-card__action--${a.variant}`}
            onClick={() => onQuickAction(a.key, task)}
          >
            {a.label}
          </button>
        ))}
        <button
          type="button"
          className="tri-card__action tri-card__action--ghost"
          onClick={() => onOpen(task.id)}
        >
          Open →
        </button>
      </div>
    </div>
  );
}

/* Quick actions per state — kept short, full controls live in drawer */
function getQuickActions(task) {
  const s = task.state;
  if (s === 'blocked' || s === 'escalated' || s === 'unassigned' || s === 'vendor-declined') {
    return [
      { key: 'assign',   label: '📌 Assign',   variant: 'primary' },
      { key: 'escalate', label: '🚨 Escalate', variant: 'danger'  },
    ];
  }
  if (s === 'dispatching') {
    return [
      { key: 'cancelDispatch', label: 'Stop Dispatch', variant: 'danger'  },
      { key: 'assign',         label: '📌 Assign',     variant: 'primary' },
    ];
  }
  if (s === 'payment-disputed' || s === 'escalated-to-admin') {
    return [
      { key: 'escalate', label: '🚨 Escalate to Admin', variant: 'danger' },
    ];
  }
  if (s === 'in-progress' || s === 'on-site' || s === 'en-route') {
    return [
      { key: 'call',   label: '📞 Call',  variant: 'secondary' },
      { key: 'verify', label: '✓ Verify', variant: 'primary'   },
    ];
  }
  if (s === 'verification-pending' || s === 'completed') {
    return [
      { key: 'verify', label: '✓ Verify Work', variant: 'primary' },
    ];
  }
  if (s === 'awaiting-payment') {
    return [
      { key: 'payment', label: '💳 Record Payment', variant: 'primary' },
    ];
  }
  return [
    { key: 'assign', label: '📌 Assign', variant: 'primary' },
  ];
}