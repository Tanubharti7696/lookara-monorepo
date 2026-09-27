// src/views/audit/AuditFilters.jsx
import { useState, useEffect, useRef } from 'react';

export default function AuditFilters({ query, onQueryChange, onExport }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleExport = (type) => {
    setOpen(false);
    onExport(type);
  };

  return (
    <div className="audit-action-bar">
      <input
        className="audit-search"
        type="text"
        placeholder="🔍  Search audit history…"
        autoComplete="off"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <div className="audit-export-wrap" ref={wrapRef}>
        <button
          type="button"
          className="audit-export-btn"
          onClick={() => setOpen(v => !v)}
        >
          ⬇ Export <span style={{ fontSize: 11, opacity: 0.6 }}>▾</span>
        </button>

        {open && (
          <div className="audit-export-menu">
            <div className="audit-export-menu__label">CSV</div>
            <div className="audit-export-opt" onClick={() => handleExport('csv-filtered')}>
              Export Current Results
            </div>
            <div className="audit-export-opt audit-export-opt--border" onClick={() => handleExport('csv-all')}>
              Export All Events
            </div>

            <div className="audit-export-menu__label">Report</div>
            <div className="audit-export-opt" onClick={() => handleExport('pdf')}>
              PDF Report
            </div>
          </div>
        )}
      </div>
    </div>
  );
}