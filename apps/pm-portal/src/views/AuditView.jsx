// src/views/AuditView.jsx
import { useState, useMemo } from 'react';
import AuditHeader from './audit/AuditHeader';
import AuditFilters from './audit/AuditFilters';
import AuditCounters from './audit/AuditCounters';
import AuditFeed from './audit/AuditFeed';
import AuditDrawer from './audit/AuditDrawer';
import { EVENTS, getCounts, filterEvents } from '../data/audit';
import { exportCSV, exportPDFReport } from './audit/auditExport';
import './AuditView.css';

export default function AuditView() {
  const [sev, setSev]             = useState('all');
  const [query, setQuery]         = useState('');
  const [drawerId, setDrawerId]   = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 2000);
  };

  const counts = useMemo(() => getCounts(), []);
  const filtered = useMemo(() => filterEvents(EVENTS, { sev, query }), [sev, query]);

  const handleExport = (type) => {
    if (type === 'csv-filtered') exportCSV(filtered, showToast);
    else if (type === 'csv-all') exportCSV(EVENTS, showToast);
    else if (type === 'pdf')     exportPDFReport(filtered, showToast);
  };

  return (
    <div className="audit-view">
      <AuditHeader />

      <AuditFilters
        query={query}
        onQueryChange={setQuery}
        onExport={handleExport}
      />

      <AuditCounters
        counts={counts}
        active={sev}
        onChange={setSev}
      />

      <div className="audit-body">
        <AuditFeed events={filtered} onOpenDrawer={setDrawerId} />
      </div>

      <AuditDrawer
        eventId={drawerId}
        onClose={() => setDrawerId(null)}
        onToast={showToast}
      />

      {toast && (
        <div className={`audit-toast audit-toast--${toast.type}`} key={toast.id}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}