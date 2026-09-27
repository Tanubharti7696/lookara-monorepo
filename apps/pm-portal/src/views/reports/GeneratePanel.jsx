// src/views/reports/GeneratePanel.jsx
import { useState } from 'react';
import { REPORT_TYPES, DATE_RANGES } from '../../data/reports.jsx';

export default function GeneratePanel({ onGenerate }) {
  const [type, setType]   = useState('Portfolio Health');
  const [range, setRange] = useState('Last 30 days');
  const [format, setFormat] = useState('pdf');

  return (
    <div className="reports-section">
      <div className="reports-section__head">
        <div className="reports-section__title">Generate Custom Report</div>
      </div>

      <div className="reports-gen-panel">
        <div className="reports-gen-grid">
          <div>
            <label className="reports-gen-label">Report Type</label>
            <select className="reports-gen-select" value={type} onChange={(e) => setType(e.target.value)}>
              {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="reports-gen-label">Date Range</label>
            <select className="reports-gen-select" value={range} onChange={(e) => setRange(e.target.value)}>
              {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="reports-gen-label">Format</label>
            <div className="reports-gen-formats">
              <button
                type="button"
                className={`reports-gen-format ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
              >PDF</button>
              <button
                type="button"
                className={`reports-gen-format ${format === 'csv' ? 'active' : ''}`}
                onClick={() => setFormat('csv')}
              >CSV</button>
            </div>
          </div>
          <button
            className="reports-gen-submit"
            onClick={() => onGenerate({ type, range, format })}
          >
            Generate →
          </button>
        </div>
      </div>
    </div>
  );
}