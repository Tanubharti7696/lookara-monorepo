// src/views/reports/RisksSection.jsx
import { TOP_RISKS } from '../../data/reports.jsx';

export default function RisksSection({ onOpenDrawer, filterQuery }) {
  const q = filterQuery?.toLowerCase() || '';
  const visible = TOP_RISKS.filter(r => {
    if (!q) return true;
    return [r.title, r.sub].join(' ').toLowerCase().includes(q);
  });
  if (visible.length === 0) return null;

  return (
    <div className="reports-section">
      <div className="reports-section__head">
        <div className="reports-section__title">Top Risks</div>
      </div>
      <div className="reports-risks">
        {visible.map(r => (
          <div
            key={r.id}
            className={`reports-risk reports-risk--${r.tone}`}
            onClick={() => onOpenDrawer(r.id)}
          >
            <div className="reports-risk__sev">{r.icon}</div>
            <div className="reports-risk__body">
              <div className={`reports-risk__title reports-risk__title--${r.tone}`}>{r.title}</div>
              <div className="reports-risk__sub">{r.sub}</div>
            </div>
            <div className={`reports-risk__trend reports-risk__trend--${r.trendCls}`}>{r.trend}</div>
            <div className="reports-risk__arrow">›</div>
          </div>
        ))}
      </div>
    </div>
  );
}