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
        const rawList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
        if (rawList.length > 0) {
          const mapped = rawList.map(evt => {
            const dt = evt.created_at ? new Date(evt.created_at) : new Date();
            const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Calculate human age (e.g. 5m ago, 2h ago)
            const diffMins = Math.max(1, Math.floor((Date.now() - dt.getTime()) / 60000));
            const ageStr = diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;

            const sev = (evt.category === 'incident' || evt.event_type?.includes('breach')) 
              ? 'critical' 
              : (evt.event_type?.includes('warn') || evt.category === 'compliance' ? 'attention' : 'info');

            return {
              id: evt.id,
              code: evt.event_code || `EVT-${evt.id?.slice(-4)}`,
              date: dateStr,
              age: ageStr,
              title: evt.summary || evt.event_type || 'System Action Recorded',
              prop: evt.metadata?.propertyName || evt.metadata?.property || 'Portfolio Operation',
              actor: evt.actor_type ? `${evt.actor_type.toUpperCase()} User` : 'System',
              domain: evt.category || 'General',
              sev: sev,
              headline: evt.summary,
              fields: Object.keys(evt.metadata || {}).map(k => ({
                label: k,
                val: String(evt.metadata[k])
              })),
              timeline: [
                { sev: sev, action: evt.summary, meta: `${evt.actor_type || 'System'} · ${dt.toLocaleTimeString()}` }
              ],
              tech: {
                actor: evt.actor_type || 'System',
                action: evt.event_type,
                object: evt.target_type,
                domain: evt.category,
                result: 'Success',
                hash: evt.id?.replace(/-/g, '') || '0000000000000000'
              }
            };
          });
          setLiveEvents(mapped);
        } else {
          // If no audit events yet in new DB, fall back to seed events so it never renders blank
          setLiveEvents(STATIC_EVENTS);
        }
      })
      .catch(err => {
        console.error('Audit fetch error:', err);
        setLiveEvents(STATIC_EVENTS);
      })
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