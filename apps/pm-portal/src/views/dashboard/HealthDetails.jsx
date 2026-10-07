// src/views/dashboard/HealthDetails.jsx
import { useState } from 'react';

export default function HealthDetails({ trends }) {
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
          <div className="scorecard__row">
            <div className="scorecard__metric">Operational Health</div>
            <div className="scorecard__current scorecard__current--neutral">{trends?.operationalHealth || 0}/100</div>
          </div>
          <div className="scorecard__row">
            <div className="scorecard__metric">Avg Resolution Time</div>
            <div className="scorecard__current scorecard__current--neutral">{trends?.resolutionTimeAvg || '—'}</div>
          </div>
          <div className="scorecard__row">
            <div className="scorecard__metric">Compliance Score</div>
            <div className="scorecard__current scorecard__current--good">{trends?.complianceScore || 0}%</div>
          </div>
          <div className="scorecard__row">
            <div className="scorecard__metric">Burn Rate</div>
            <div className="scorecard__current scorecard__current--neutral">{trends?.burnRate || '—'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}