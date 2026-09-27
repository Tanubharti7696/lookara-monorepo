// src/views/compliance/DeadlineTimeline.jsx
import { DEADLINE_BUCKETS } from '../../data/compliance';

export default function DeadlineTimeline({ items, active, onSelect }) {
  const counts = DEADLINE_BUCKETS.map(b => ({
    ...b,
    count: items.filter(b.match).length,
  }));
  const total = items.length || 1;

  return (
    <div className="cmp-timeline">
      <div className="cmp-timeline__head">
        <span className="cmp-timeline__title">Compliance Horizon</span>
        <span className="cmp-timeline__sub">{items.length} items in view</span>
      </div>

      <div className="cmp-timeline__bar">
        {counts.map(b => {
          const pct = (b.count / total) * 100;
          if (pct === 0) return null;
          const tone = b.key === 'overdue' ? 'crimson'
                     : b.key === 'next30'  ? 'amber'
                     : b.key === 'd31_60'  ? 'gold'
                     : b.key === 'd61_90'  ? 'blue'
                     : 'slate';
          return (
            <button
              key={b.key}
              className={`cmp-timeline__seg cmp-timeline__seg--${tone} ${active === b.key ? 'active' : ''}`}
              style={{ width: `${pct}%` }}
              onClick={() => onSelect(active === b.key ? null : b.key)}
              title={`${b.label} — ${b.count}`}
              type="button"
            />
          );
        })}
      </div>

      <div className="cmp-timeline__legend">
        {counts.map(b => {
          const tone = b.key === 'overdue' ? 'crimson'
                     : b.key === 'next30'  ? 'amber'
                     : b.key === 'd31_60'  ? 'gold'
                     : b.key === 'd61_90'  ? 'blue'
                     : 'slate';
          return (
            <button
              key={b.key}
              className={`cmp-timeline__chip cmp-timeline__chip--${tone} ${active === b.key ? 'active' : ''}`}
              onClick={() => onSelect(active === b.key ? null : b.key)}
              type="button"
            >
              <span className="cmp-timeline__dot" />
              <span className="cmp-timeline__chip-label">{b.label}</span>
              <span className="cmp-timeline__chip-count">{b.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}