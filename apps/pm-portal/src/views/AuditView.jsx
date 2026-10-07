// src/views/AuditView.jsx
import { useState, useMemo, useEffect } from 'react';
import AuditHeader from './audit/AuditHeader';
import AuditFilters from './audit/AuditFilters';
import AuditCounters from './audit/AuditCounters';
import AuditFeed from './audit/AuditFeed';
import AuditDrawer from './audit/AuditDrawer';
import { EVENTS as STATIC_EVENTS, getCounts, filterEvents } from '../data/audit';
import { exportCSV, exportPDFReport } from './audit/auditExport';
import { apiFetch } from '../utils/api';
import './AuditView.css';

export default function AuditView() {
  const [sev, setSev]             = useState('all');
  const [query, setQuery]         = useState('');
  const [drawerId, setDrawerId]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    apiFetch('/api/v1/audit')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const mapped = data.data.map(evt => ({
            id: evt.id,
            code: evt.event_code,
            time: evt.created_at,
            actorType: evt.actor_type,
            actorLabel: evt.actor_type,
            targetType: evt.target_type,
            targetId: evt.target_id,
            type: evt.event_type,
            eventStr: evt.summary,
            sev: evt.category === 'incident' ? 'high' : 'normal',
            changes: Object.keys(evt.metadata || {}).map(k => `${k}: ${evt.metadata[k]}`),
            device: evt.session_label || 'Unknown',
            ip: 'Unknown'
          }));
          setLiveEvents(mapped);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 2000);
  };

  const counts = useMemo(() => {
    const c = { all: liveEvents.length, critical: 0, high: 0, normal: 0 };
    liveEvents.forEach(e => {
      if (e.sev === 'critical') c.critical++;
      if (e.sev === 'high') c.high++;
      if (e.sev === 'normal') c.normal++;
    });
    return c;
  }, [liveEvents]);

  const filtered = useMemo(() => filterEvents(liveEvents, { sev, query }), [liveEvents, sev, query]);

  const handleExport = (type) => {
    if (type === 'csv-filtered') exportCSV(filtered, showToast);
    else if (type === 'csv-all') exportCSV(liveEvents, showToast);
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
        {loading ? <div style={{ padding: '24px' }}>Loading audit events...</div> : <AuditFeed events={filtered} onOpenDrawer={setDrawerId} />}
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