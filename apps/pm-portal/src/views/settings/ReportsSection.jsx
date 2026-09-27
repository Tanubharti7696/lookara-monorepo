// src/views/settings/ReportsSection.jsx
import { useState } from 'react';
import { SCHEDULED_REPORTS } from '../../data/settingsData';

export default function ReportsSection({ onToast }) {
  const [reports, setReports] = useState(SCHEDULED_REPORTS);

  const toggle = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Reports</h1>
          <p className="settings-section__sub">
            Schedule recurring reports and control who receives them.
          </p>
        </div>
        <button
          className="stg-btn stg-btn--primary"
          onClick={() => onToast?.('Report builder will open when integrated', 'info')}
        >
          + New Schedule
        </button>
      </header>

      <div className="report-list">
        {reports.map(r => (
          <div key={r.id} className={`report-row ${r.enabled ? '' : 'is-off'}`}>
            <div className="report-row__main">
              <div className="report-row__name">{r.name}</div>
              <div className="report-row__meta">
                {r.frequency} · {r.format} · Next run {r.nextRun}
              </div>
              <div className="report-row__recipients">
                {r.recipients.map(e => <span key={e} className="report-chip">{e}</span>)}
              </div>
            </div>
            <div className="report-row__right">
              <label className="stg-toggle stg-toggle--sm">
                <input type="checkbox" checked={r.enabled} onChange={() => toggle(r.id)} />
                <span className="stg-toggle__slider" />
              </label>
              <button
                className="stg-btn stg-btn--ghost stg-btn--sm"
                onClick={() => onToast?.(`Edit "${r.name}"`, 'info')}
              >
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}