// src/views/reports/IntelligenceFeed.jsx
import { INTEL_FEED } from '../../data/reports.jsx';

export default function IntelligenceFeed({ onOpenDrawer, filterQuery }) {
  const q = filterQuery?.toLowerCase() || '';
  const visible = INTEL_FEED.filter(item => {
    if (!q) return true;
    // INTEL_FEED text is JSX, so search against tag + time only for filter
    return [item.tag, item.time].join(' ').toLowerCase().includes(q);
  });
  if (visible.length === 0) return null;

  return (
    <div className="reports-section">
      <div className="reports-section__head">
        <div className="reports-section__title">Portfolio Insights</div>
      </div>
      <div className="reports-feed">
        {visible.map((item, idx) => (
          <div key={idx} className="reports-feed-item" onClick={() => onOpenDrawer(item.drawerId)}>
            <div className={`reports-feed-item__dot reports-feed-item__dot--${item.tone}`} />
            <div className="reports-feed-item__body">
              <div className="reports-feed-item__text">{item.text}</div>
              <div className="reports-feed-item__meta">
                <span className="reports-feed-item__tag">{item.tag}</span>
                <span>{item.time}</span>
              </div>
            </div>
            <div className="reports-feed-item__arrow">›</div>
          </div>
        ))}
      </div>
    </div>
  );
}