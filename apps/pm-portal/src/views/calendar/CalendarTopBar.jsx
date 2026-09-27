// src/views/calendar/CalendarTopBar.jsx
import { useState } from 'react';
import { CAL_VIEWS } from '../../data/calendar';

export default function CalendarTopBar({
  view, onViewChange, dateLabel, onToday, onPrev, onNext,
  search, onSearch, onToast,
}) {
  const [hintsOpen, setHintsOpen] = useState(false);
  const hints = ['vacant', 'turnover', 'occupied', 'owner stay', 'pending', 'offline'];

  return (
    <div className="cal-topbar">
      <div className="cal-topbar__left">
        <strong style={{ fontSize: 15 }}>Calendar</strong>
        <div className="cal-date-label">{dateLabel}</div>
        <button className="cal-btn" onClick={onToday}>Today</button>
        <button className="cal-btn cal-btn--icon" onClick={onPrev} title="Previous">←</button>
        <button className="cal-btn cal-btn--icon" onClick={onNext} title="Next">→</button>

        <div className="cal-view-switch">
          {CAL_VIEWS.map(v => (
            <button
              key={v.key}
              type="button"
              className={`cal-view-btn ${view === v.key ? 'active' : ''}`}
              onClick={() => onViewChange(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cal-topbar__right">
        <div className="cal-search">
          <span className="cal-search__icon">🔍</span>
          <input
            type="text"
            className="cal-search__input"
            placeholder="Search properties…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setHintsOpen(true)}
            onBlur={() => setTimeout(() => setHintsOpen(false), 180)}
          />
          {hintsOpen && (
            <div className="cal-search__hints">
              <div className="cal-search__hints-title">Try searching</div>
              <div className="cal-search__hints-pills">
                {hints.map(h => (
                  <button
                    key={h}
                    type="button"
                    className="cal-search__hint"
                    onMouseDown={(e) => { e.preventDefault(); onSearch(h); setHintsOpen(false); }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}