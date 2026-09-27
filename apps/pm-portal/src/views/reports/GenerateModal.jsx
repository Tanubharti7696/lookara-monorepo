// src/views/reports/GenerateModal.jsx
import { useState, useEffect } from 'react';
import { REPORT_TYPES, DATE_RANGES } from '../../data/reports.jsx';

export default function GenerateModal({ open, onClose, onGenerate }) {
  const [type, setType]     = useState('Portfolio Health');
  const [range, setRange]   = useState('Last 30 days');
  const [format, setFormat] = useState('pdf');

  useEffect(() => {
    if (open) {
      setType('Portfolio Health');
      setRange('Last 30 days');
      setFormat('pdf');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleGenerate = () => {
    onGenerate({ type, range, format });
    onClose();
  };

  return (
    <div className="reports-modal-backdrop" onClick={onClose}>
      <div className="reports-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Generate Report</h2>
        <p className="reports-modal__sub">Choose type, date range, and format.</p>

        <div className="reports-modal-field">
          <label className="reports-modal-label">Report Type</label>
          <select className="reports-modal-select" value={type} onChange={(e) => setType(e.target.value)}>
            {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="reports-modal-field">
          <label className="reports-modal-label">Date Range</label>
          <select className="reports-modal-select" value={range} onChange={(e) => setRange(e.target.value)}>
            {DATE_RANGES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="reports-modal-field">
          <label className="reports-modal-label">Format</label>
          <div className="reports-modal-fmt">
            <button
              type="button"
              className={`reports-modal-fmt-btn ${format === 'pdf' ? 'active' : ''}`}
              onClick={() => setFormat('pdf')}
            >PDF</button>
            <button
              type="button"
              className={`reports-modal-fmt-btn ${format === 'csv' ? 'active' : ''}`}
              onClick={() => setFormat('csv')}
            >CSV</button>
          </div>
        </div>

        <div className="reports-modal-actions">
          <button className="reports-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="reports-modal-go" onClick={handleGenerate}>Generate →</button>
        </div>
      </div>
    </div>
  );
}