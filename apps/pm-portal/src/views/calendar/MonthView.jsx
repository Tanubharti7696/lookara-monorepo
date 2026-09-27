// src/views/calendar/MonthView.jsx
import { MONTH_CELLS, MONTH_STATS } from '../../data/calendar';

export default function MonthView({ onOpenDay }) {
  // Jan 2026: Jan 1 is Thursday. Grid starts Sunday Dec 28.
  const firstDow = 4; // 0=Sun ... 4=Thu
  const leading = firstDow; // 4 empty cells before 1
  const totalCells = 35;    // 5 weeks
  const days = Object.keys(MONTH_CELLS).map(Number).sort((a, b) => a - b);
  const maxDay = 31;

  const cells = [];
  for (let i = 0; i < leading; i++) cells.push({ empty: true, key: `lead-${i}` });
  for (let d = 1; d <= maxDay; d++) {
    cells.push({ day: d, ...MONTH_CELLS[d], key: `day-${d}` });
  }
  while (cells.length < totalCells) cells.push({ empty: true, key: `tail-${cells.length}` });

  return (
    <div className="month-view">
      <div className="month-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="day-header">{d}</div>
        ))}

        {cells.map((cell, i) => {
          if (cell.empty) {
            return <div key={cell.key} className="day-cell day-cell--empty" />;
          }
          const stateClass = `day-cell day-cell--${cell.state}`;
          const flagClass = cell.flag ? `has-${cell.flag}` : '';
          return (
            <div
              key={cell.key}
              className={`${stateClass} ${flagClass}`}
              onClick={() => onOpenDay(`Jan-${cell.day}`)}
              role="button"
              tabIndex={0}
              title={`Jan ${cell.day}`}
            >
              <div className="day-num">{cell.day}</div>
              {cell.dots && (
                <div className="event-dots">
                  {cell.dots.map((t, j) => (
                    <span key={j} className={`dot dot--${t}`} />
                  ))}
                </div>
              )}
              {cell.flag === 'vacant'   && <span className="vacant-tag">Vacant</span>}
              {cell.flag === 'turnover' && <span className="vacant-tag">Turnover</span>}
              {cell.flag === 'owner'    && <span className="owner-pending-label">⏳ Owner</span>}
            </div>
          );
        })}
      </div>

      <div className="month-stats">
        <div className="stat"><span className="stat-label">Occupied Nights:</span> <span className="stat-value">{MONTH_STATS.occupiedNights}</span></div>
        <div className="stat"><span className="stat-label">Vacant Nights:</span>   <span className="stat-value">{MONTH_STATS.vacantNights}</span></div>
        <div className="stat"><span className="stat-label">Occupancy Rate:</span>  <span className="stat-value">{MONTH_STATS.occupancyRate}%</span></div>
      </div>
    </div>
  );
}