// src/views/dashboard/HealthDetails.jsx
import { useState } from 'react';
import { dashboardData } from '../../data/dashboardData';

export default function HealthDetails() {
  const [open, setOpen] = useState(false);

  return (
    <section className={`collapsible ${open ? 'open' : ''}`}>
      <button className="collapsible__toggle" onClick={() => setOpen(v => !v)}>
        <div className="collapsible__left">
          <span className="collapsible__icon">📊</span>
          <span className="collapsible__title">Portfolio Health Details</span>
          <span className="collapsible__sub">Reference metrics · Current state</span>
        </div>
        <span className={`collapsible__chev ${open ? 'open' : ''}`}>▼</span>
      </button>

      <div className="collapsible__body">
        <div className="scorecard">
          <div className="scorecard__row scorecard__row--head">
            <div className="scorecard__metric">Metric</div>
            <div className="scorecard__current">Current</div>
          </div>
          {dashboardData.healthScorecard.map((r, i) => (
            <div key={i} className="scorecard__row">
              <div className="scorecard__metric">{r.metric}</div>
              <div className={`scorecard__current scorecard__current--${r.tone}`}>
                {r.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}