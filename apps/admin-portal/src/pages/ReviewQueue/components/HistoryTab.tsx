// src/pages/ReviewQueue/components/HistoryTab.tsx
import { useState, useMemo } from 'react';
import type { HistoryRow } from './data';

export default function HistoryTab({ rows }: { rows: HistoryRow[] }) {
  const [q, setQ] = useState('');
  const [time, setTime] = useState('all');
  const [resolution, setResolution] = useState('all');
  const [type, setType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (type !== 'all' && r.type !== type) return false;
      if (resolution !== 'all' && !r.resolution.toLowerCase().includes(resolution)) return false;
      if (q && !(r.item + r.note + r.admin).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, type, resolution]);

  const toggleRow = (id: string) => {
    setExpandedId((cur) => (cur === id ? null : id));
  };

  return (
    <>
      <div className="rq-history-filters">
        <input
          className="rq-search"
          placeholder="Search history…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="rq-select" value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="all">All Time</option>
          <option value="30">Last 30 days</option>
          <option value="7">Last 7 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <select className="rq-select" value={resolution} onChange={(e) => setResolution(e.target.value)}>
          <option value="all">All Resolutions</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
          <option value="warning">Warning Issued</option>
          <option value="dismissed">Dismissed</option>
          <option value="resolved">Dispute Resolved</option>
        </select>
        <select className="rq-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="compliance">Compliance</option>
          <option value="flag">Flags</option>
          <option value="dispute">Disputes</option>
        </select>
        <button
          className="rq-clear"
          onClick={() => { setQ(''); setTime('all'); setResolution('all'); setType('all'); }}
        >
          Clear all
        </button>
      </div>

      <div className="rq-section">
        {filtered.length === 0 ? (
          <div className="rq-empty">No history matches filters</div>
        ) : (
          <table className="rq-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Item</th>
                <th>Resolution</th>
                <th>Vendor Status</th>
                <th>Admin</th>
                <th>Admin Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isOpen = expandedId === r.id;
                return (
                  <>
                    <tr key={r.id}>
                      <td>{r.timestamp}</td>
                      <td><TypeChip type={r.type} /></td>
                      <td>{r.item}</td>
                      <td><span className={`rq-chip is-${r.resolutionTone}`}>{r.resolution}</span></td>
                      <td>
                        {r.vendorBadge ? (
                          <span className={`rq-vendor-badge is-${r.vendorBadge}`}>{r.vendorStatus}</span>
                        ) : (
                          r.vendorStatus
                        )}
                      </td>
                      <td>{r.admin}</td>
                      <td><div className="rq-note-preview">{r.note}</div></td>
                      <td>
                        <button className="rq-btn-view" onClick={() => toggleRow(r.id)}>
                          {isOpen ? 'Close' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${r.id}-expand`}>
                        <td colSpan={8} style={{ padding: 0 }}>
                          <div className="rq-expand-body">
                            <div className="rq-hex-grid">
                              {r.decisionHex.map((h, i) => (
                                <div key={i} className="rq-hex-item">
                                  <span className="rq-hex-label">{h.label}</span>
                                  <span className={`rq-hex-val${h.tone ? ' is-' + h.tone : ''}`}>{h.value}</span>
                                </div>
                              ))}
                            </div>
                            <div className="rq-hex-note-label">Admin Note</div>
                            <div className="rq-hex-note">{r.note}</div>
                            {r.correctionTask && (
                              <>
                                <div className="rq-hex-note-label" style={{ marginTop: 10 }}>Correction Task</div>
                                <div className="rq-hex-note" style={{ borderLeftColor: 'rgba(245,158,11,0.4)' }}>
                                  {r.correctionTask}
                                  <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                    Assigned to vendor · Visible to PM · SLA: 48h · Auto-flag if ignored
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function TypeChip({ type }: { type: 'compliance' | 'flag' | 'dispute' }) {
  const map = {
    compliance: { tone: 'green', text: 'Compliance' },
    flag: { tone: 'red', text: 'Flag' },
    dispute: { tone: 'blue', text: 'Dispute' },
  };
  const t = map[type];
  return <span className={`rq-chip is-${t.tone}`}>{t.text}</span>;
}