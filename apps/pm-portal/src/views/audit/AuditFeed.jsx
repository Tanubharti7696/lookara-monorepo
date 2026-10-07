// src/views/audit/AuditFeed.jsx
import { groupByDate } from '../../data/audit';

export default function AuditFeed({ events = [], onOpenDrawer }) {
  const safeEvents = Array.isArray(events) ? events : [];
  if (!safeEvents.length) {
    return (
      <div className="audit-empty">
        <div className="audit-empty__icon">🔍</div>
        <div className="audit-empty__title">No events match</div>
        <p style={{ fontSize: 13, marginTop: 6, color: 'var(--text-2)' }}>
          Try a different search or clear the filter.
        </p>
      </div>
    );
  }

  const grouped = groupByDate(safeEvents);

  return (
    <div className="audit-feed">
      {Object.entries(grouped).map(([date, list]) => (
        <div key={date}>
          <div className="audit-day-label">{date}</div>
          {list.map(ev => (
            <div
              key={ev.id}
              className={`audit-feed-item audit-feed-item--${ev.sev}`}
              onClick={() => onOpenDrawer(ev.id)}
            >
              <div className={`audit-sev-dot audit-sev-dot--${ev.sev}`} />
              <div className="audit-feed-item__body">
                <div className={`audit-feed-item__title audit-feed-item__title--${ev.sev}`}>
                  {ev.title}
                </div>
                <div className="audit-feed-item__meta">
                  <span className="audit-feed-item__prop">{ev.prop}</span>
                  <span className="audit-feed-item__sep">·</span>
                  <span>{ev.actor}</span>
                  <span className="audit-feed-item__age">{ev.age}</span>
                </div>
              </div>
              <div className="audit-feed-item__arrow">›</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}