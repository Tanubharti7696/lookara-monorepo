// src/views/reports/InsightsSection.jsx
import { KEY_INSIGHTS } from '../../data/reports.jsx';

export default function InsightsSection({ filterQuery }) {
  const q = filterQuery?.toLowerCase() || '';
  const visible = KEY_INSIGHTS.filter(i => {
    if (!q) return true;
    return [i.num, i.label, i.sub].join(' ').toLowerCase().includes(q);
  });
  if (visible.length === 0) return null;

  return (
    <div className="reports-section">
      <div className="reports-section__head">
        <div className="reports-section__title">Key Insights</div>
        <div className="reports-section__aside">Last 30 days</div>
      </div>
      <div className="reports-insights-grid">
        {visible.map((i, idx) => (
          <div key={idx} className={`reports-insight reports-insight--${i.tone}`}>
            <div className="reports-insight__num">{i.num}</div>
            <div className="reports-insight__body">
              <div className="reports-insight__label">{i.label}</div>
              <div className="reports-insight__sub">{i.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}