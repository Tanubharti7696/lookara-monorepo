// src/views/calendar/WeekView.jsx
import { WEEK_LANES, WEEK_START } from '../../data/calendar';

export default function WeekView({ search, onOpenDay, onOpenTurnover, onToast, onOpenTask }) {
  const term = search.trim().toLowerCase();

  // Day headers: Mon Jan 12 ... Sun Jan 18
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(WEEK_START);
    d.setDate(WEEK_START.getDate() + i);
    const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
    const mon = d.toLocaleDateString('en-US', { month: 'short' });
    const key = `${mon}-${d.getDate()}`;
    return { dow, label: `${mon} ${d.getDate()}`, key };
  });

  // Filter lanes by search
  const visibleLanes = WEEK_LANES.filter(lane => {
    if (!term) return true;
    const text = lane.name.toLowerCase();
    if (term === 'offline') return lane.offline === true;
    if (term === 'vacant')  return lane.days.some(d => d.state === 'vacant');
    if (term === 'turnover')return lane.days.some(d => d.state === 'turnover');
    if (term === 'occupied')return lane.days.some(d => d.state === 'occupied');
    if (term === 'owner stay' || term === 'pending')
      return lane.days.some(d => d.state === 'owner' || d.state === 'owner-pending');
    return text.includes(term);
  });

  const stateClassFor = (day) => {
    if (day.state === 'occupied')      return 'week-cell occupied-cell';
    if (day.state === 'vacant')        return 'week-cell vacant-cell';
    if (day.state === 'turnover')      return 'week-cell turnover-cell';
    if (day.state === 'owner')         return 'week-cell owner-block';
    if (day.state === 'owner-pending') return 'week-cell owner-block-pending';
    return 'week-cell';
  };

  return (
    <div className="week-view">
      <div className="week-grid">
        {/* Header row */}
        <div className="week-header">
          <div className="week-head-spacer">Property</div>
          {days.map(d => (
            <div key={d.key} className="week-head-cell">
              <div className="wh-day">{d.dow}</div>
              <div
                className="wh-date"
                onClick={() => onOpenDay(d.key)}
                role="button"
                tabIndex={0}
              >
                {d.label}
              </div>
            </div>
          ))}
        </div>

        {/* Property rows */}
        {visibleLanes.map(lane => (
          <div
            key={lane.id}
            className={`week-row ${lane.offline ? 'is-offline' : ''}`}
            data-property={lane.id}
          >
            <div className="property-label">
              <span className="prop-name">{lane.name}</span>
              <span className={`readiness-badge readiness-badge--${lane.badge.tone}`}>
                {lane.badge.label}
              </span>
            </div>

            {lane.days.map((day, idx) => (
              <div key={idx} className={stateClassFor(day)}>
                {day.chip && (
                  day.state === 'vacant'
                    ? <span className="vacant-label">{day.chip}</span>
                    : <div className={`event ${day.state === 'owner' ? 'owner' : 'stay'}`}>{day.chip}</div>
                )}

                {day.event && (
                  <CellEvent
                    event={day.event}
                    onOpenTurnover={onOpenTurnover}
                    onOpenTask={onOpenTask}
                    onToast={onToast}
                  />
                )}

                {day.event2 && (
                  <CellEvent
                    event={day.event2}
                    onOpenTurnover={onOpenTurnover}
                    onOpenTask={onOpenTask}
                    onToast={onToast}
                    style={{ marginTop: 3 }}
                  />
                )}

                {day.state === 'owner-pending' && !day.event && (
                  <div
                    className="event owner-pending"
                    onClick={() => onToast('Owner Stay Request — open Alerts to review', 'info')}
                  >
                    ⏳ Owner Req · Pending
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CellEvent({ event, onOpenTurnover, onOpenTask, onToast, style }) {
  if (event.type === 'turnover') {
    const dotColor = event.status === 'accepted' ? '#22C55E'
      : event.status === 'dispatched' ? '#F59E0B'
      : event.status === 'at-risk' ? '#DC2626'
      : '#6B7280';
    return (
      <div
        className="event turnover"
        style={style}
        onClick={() => onOpenTurnover(event.key)}
        role="button"
        tabIndex={0}
      >
        <span>📅 {event.time}</span>
        <span
          className="event-status-dot"
          style={{ background: dotColor }}
          title={event.status}
        />
      </div>
    );
  }

  if (event.type === 'task' && event.recurrence) {
    return (
      <div
        className="event task"
        style={style}
        onClick={() => onToast(`${event.label} — recurs ${event.recurrence}`, 'info')}
      >
        {event.label}
      </div>
    );
  }

  if (event.taskId) {
    return (
      <div
        className={`event ${event.type}`}
        style={{ ...style, cursor: 'pointer' }}
        onClick={() => onOpenTask(event.taskId, event.label)}
      >
        {event.label}
      </div>
    );
  }

  return <div className={`event ${event.type}`} style={style}>{event.label}</div>;
}