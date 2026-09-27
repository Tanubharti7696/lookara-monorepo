// src/views/alerts/CommandHeader.jsx
import { SIGNAL_FILTER_TABS } from '../../data/signals';

export default function CommandHeader({
  cards, filter, onFilterChange,
  search, onSearchChange,
  onMarkLowRead, onPauseAlerts, paused,
  onOpenRules, onSearch,
}) {
  const counts = SIGNAL_FILTER_TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.matches ? cards.filter(tab.matches).length : cards.length;
    return acc;
  }, {});

  return (
    <div className="signal-command-header">
      <div className="signal-command-row1">
        <div>
          <div className="signal-command-title">Alerts</div>
          <div className="signal-command-sub">
            Operational signals, system actions, and decisions requiring attention.
          </div>
        </div>
        <div className="signal-timestamp">
          Saturday, Feb 21, 2026 · 11:00 AM EST · <span style={{ color: 'var(--slate)' }}>updated now</span>
        </div>
      </div>

      <div className="signal-command-row2">
        <div className="signal-header-actions">
          <input
            type="text"
            className="signal-search-input"
            placeholder="Search alerts…"
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); onSearch(e.target.value); }}
          />
          <button className="signal-header-btn" onClick={onMarkLowRead}>
            Mark Low Priority Read
          </button>
          <button
            className={`signal-header-btn ${paused ? 'paused' : ''}`}
            onClick={onPauseAlerts}
          >
            {paused ? 'Resume Alerts' : 'Pause Non-Critical Alerts (30m)'}
          </button>
          <button className="signal-header-btn signal-rules-btn" onClick={onOpenRules}>
            Notification Settings →
          </button>
        </div>
      </div>

      <div className="notif-filter-strip">
        {SIGNAL_FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`notif-filter-btn ${filter === tab.key ? 'active' : ''}`}
            onClick={() => onFilterChange(tab.key)}
          >
            <span className="filter-dot" style={{ background: tab.dotColor }} />
            {tab.label}
            <span className="notif-filter-count">{counts[tab.key] ?? 0}</span>
          </button>
        ))}
        <button
          type="button"
          className="notif-filter-btn"
          onClick={() => onOpenRules()}
        >
          <span className="filter-dot" style={{ background: 'var(--muted)' }} />
          Filters
        </button>
      </div>
    </div>
  );
}