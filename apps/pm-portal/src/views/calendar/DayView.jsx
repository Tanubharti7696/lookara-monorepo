// src/views/calendar/DayView.jsx
import { useState } from 'react';
import { DAY_LANES } from '../../data/calendar';

const FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'task',       label: 'Tasks' },
  { key: 'vendor',     label: 'Vendor' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'incident',   label: 'Incidents' },
  { key: 'block',      label: 'Blocks' },
];

export default function DayView({ dateKey, onToast }) {
  const [filter, setFilter] = useState('all');
  const lanes = DAY_LANES[dateKey];

  if (!lanes) {
    return (
      <div className="day-view">
        <div className="day-empty">
          No data for {dateKey} — outside the demo week (Jan 12–18).
        </div>
      </div>
    );
  }

  const laneVisible = (lane) => {
    if (filter === 'all') return true;
    return lane.events.some(e => matchesFilter(e, filter));
  };

  const eventVisible = (ev) => filter === 'all' || matchesFilter(ev, filter);

  return (
    <div className="day-view">
      <div className="day-dispatch-header">
        <div>
          <div className="day-dispatch-title">Day Dispatch</div>
          <div className="day-dispatch-date">{dateKey.replace('-', ' ')}</div>
          <div className="day-dispatch-sub">Single-day schedule by property (ops-first)</div>
          <div className="day-dispatch-clock">🕐 Demo clock: Jan 16 · 11:00 AM</div>

          <div className="day-pill-row">
            {FILTERS.map(f => {
              const count = lanes.reduce((n, lane) => n + lane.events.filter(e => filter === 'all' || matchesFilter(e, filter === 'all' ? 'all' : f.key)).length, 0);
              const disabled = f.key !== 'all' && lanes.every(lane => !lane.events.some(e => matchesFilter(e, f.key)));
              return (
                <button
                  key={f.key}
                  type="button"
                  className={`day-pill ${filter === f.key ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => !disabled && setFilter(f.key)}
                >
                  {f.label} <span className="pill-count">{countForFilter(lanes, f.key)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="day-lanes">
        {lanes.filter(laneVisible).map((lane, i) => (
          <div
            key={i}
            className={`day-lane day-lane--${lane.state}`}
            data-property={lane.prop.toLowerCase().replace(/\s+/g, '-')}
          >
            <div className="lane-head">
              <div className="lane-prop">{lane.prop}</div>
              <div className="lane-state">{stateLabel(lane.state)}</div>
            </div>
            <div className="lane-body">
              {lane.events.filter(eventVisible).map((ev, j) => (
                <div key={j} className={`lane-event lane-event--${ev.type}`}>
                  {ev.time} — {ev.label}
                  {ev.outcome === 'completed'   && <span className="outcome-badge outcome-badge--completed"> ✓</span>}
                  {ev.outcome === 'missed'      && <span className="outcome-badge outcome-badge--missed"> ✗</span>}
                  {ev.outcome === 'in-progress' && <span className="outcome-badge outcome-badge--in-progress"> ⏳</span>}
                  {ev.outcome === 'upcoming'    && <span className="outcome-badge outcome-badge--upcoming"> ○</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function matchesFilter(ev, key) {
  if (key === 'block') return ev.type === 'block' || ev.type === 'stay';
  return ev.type === key;
}

function countForFilter(lanes, key) {
  return lanes.reduce((n, lane) => n + lane.events.filter(e => key === 'all' || matchesFilter(e, key)).length, 0);
}

function stateLabel(state) {
  return {
    occupied: 'Occupied',
    vacant: 'Vacant',
    turnover: 'Turnover',
    'owner-pending': 'Owner Req (Pending)',
    offline: 'Offline',
  }[state] || state;
}