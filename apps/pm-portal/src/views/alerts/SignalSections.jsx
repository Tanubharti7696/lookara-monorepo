// src/views/alerts/SignalSections.jsx
import { useState, useEffect } from 'react';
import { SIGNAL_SECTIONS } from '../../data/signals';

export default function SignalSections({
  cards, onAction, onOpenWhy, onToggleUnread, filter,
}) {
  const visibleSections = SIGNAL_SECTIONS.map(section => {
    const sectionCards = cards.filter(c => c.section === section.key);
    return { ...section, cards: sectionCards };
  }).filter(section => {
    if (filter === 'all') return true;
    if (filter === 'unread') return section.cards.some(c => c.unread);
    return section.key === filter;
  });

  return (
    <div className="signal-stream">
      {visibleSections.map(section => (
        <SignalSection
          key={section.key}
          section={section}
          filter={filter}
          onAction={onAction}
          onOpenWhy={onOpenWhy}
          onToggleUnread={onToggleUnread}
        />
      ))}
    </div>
  );
}

function SignalSection({ section, filter, onAction, onOpenWhy, onToggleUnread }) {
  const isInfo = section.key === 'info';
  // Info + automated both default collapsed; everything else expanded.
  // When a filter is active, force-expand the matching section so the user
  // isn't left staring at a collapsed bar after clicking "Critical".
  const [collapsed, setCollapsed] = useState(
    filter === 'all' ? section.defaultCollapsed : false
  );
  useEffect(() => {
    if (filter !== 'all') setCollapsed(false);
    else setCollapsed(section.defaultCollapsed);
  }, [filter, section.defaultCollapsed]);

  // Card count for header
  const countSuffix = section.countSuffix || '';

  return (
    <div className={`signal-section signal-section--${section.tone} ${collapsed ? 'collapsed' : ''} ${isInfo ? 'info-section' : ''}`}>
      <div className="signal-section-header">
        <span className="signal-section-label" style={{ color: sectionColor(section.tone) }}>
          {section.label}
        </span>
        <span className="signal-section-count">
          {section.cards.length}{countSuffix}
        </span>
        <div className="signal-section-rule" />
        <button
          type="button"
          className="signal-section-toggle-btn"
          onClick={() => setCollapsed(v => !v)}
        >
          {collapsed ? 'Show ▾' : 'Hide ▴'}
        </button>
      </div>

      {!collapsed && (
        <div className="signal-cards-wrap">
          {section.cards.length === 0 ? (
            <div className="signal-empty">Nothing here right now.</div>
          ) : section.cards.map(card => (
            <SignalCard
              key={card.id}
              card={card}
              onAction={onAction}
              onOpenWhy={onOpenWhy}
              onToggleUnread={onToggleUnread}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SignalCard({ card, onAction, onOpenWhy, onToggleUnread }) {
  const sevClass = card.section === 'critical' ? 'critical'
    : card.section === 'attention' ? 'attention'
    : card.section === 'automated' ? 'automated'
    : card.section === 'payment'   ? 'critical'  // payment disputed inherits critical
    : 'info';

  const handleCardClick = () => {
    onToggleUnread(card.id);
    // Default click = first action
    if (card.actions[0]) onAction(card.actions[0].action, card);
  };

  const riskClass = card.riskLevel === 'urgent' ? 'urgent'
    : card.riskLevel === 'warn' ? 'warn'
    : '';

  return (
    <div
      className={`signal-card ${sevClass} ${card.unread ? 'unread' : ''}`}
      onClick={handleCardClick}
    >
      <div className="signal-card-icon">{card.icon}</div>

      <div className="signal-card-body">
        <div className="signal-card-property">
          {card.property}
          {card.nickname && (
            <span style={{ color: 'var(--slate)', fontStyle: 'italic', fontWeight: 400 }}>
              {' '}({card.nickname})
            </span>
          )}
        </div>
        <div className="signal-card-event">{card.event}</div>
        <div className="signal-card-context">{card.context}</div>

        <div className="signal-card-meta">
          <div className={`signal-risk-timer ${riskClass}`}>{card.riskTimer}</div>
          {card.whyKey && (
            <button
              type="button"
              className="why-link"
              onClick={(e) => { e.stopPropagation(); onOpenWhy(card.whyKey); }}
              title="Why this alert"
            >
              ⓘ
            </button>
          )}
          {card.autoTag && <span className="auto-tag">Auto</span>}
          {card.badges && card.badges.map((b, i) => (
            <span
              key={i}
              id={b.id}
              className={`signal-badge signal-badge--${b.tone}`}
            >
              {b.text}
            </span>
          ))}
        </div>
      </div>

      <div className="signal-card-actions" onClick={(e) => e.stopPropagation()}>
        {card.actions.map((a, i) => (
          <button
            key={i}
            type="button"
            className={`sig-btn sig-btn--${a.style}`}
            onClick={() => onAction(a.action, card)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function sectionColor(tone) {
  return {
    crimson: 'var(--crimson)',
    amber:   'var(--amber)',
    success: 'var(--success)',
    gold:    'var(--gold)',
    slate:   'var(--slate)',
  }[tone] || 'var(--text-2)';
}