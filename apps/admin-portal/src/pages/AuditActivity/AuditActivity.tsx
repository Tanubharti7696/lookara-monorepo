// src/pages/AuditActivity/AuditActivity.tsx
import { useState, useMemo, Fragment } from 'react';
import { useToast } from '../context/ToastContext';
import {
  INITIAL_EVENTS, type AuditEvent, type Severity, type Category, type ActorType,
  SAVED_VIEWS, categoryTimeline,
} from './components/data';
import './AuditActivity.css';

const PER_PAGE = 10;

export default function AuditActivity() {
  const { toast } = useToast();
  const [events] = useState<AuditEvent[]>(INITIAL_EVENTS);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [type, setType] = useState<Category | 'all'>('all');
  const [actor, setActor] = useState<ActorType | 'all'>('all');
  const [time, setTime] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [target, setTarget] = useState<'all' | 'vendor' | 'dispute' | 'organization'>('all');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((ev) => {
      if (severity !== 'all' && ev.severity !== severity) return false;
      if (type !== 'all' && ev.category !== type) return false;
      if (actor !== 'all' && ev.actorType !== actor) return false;
      if (target !== 'all' && ev.targetRole.toLowerCase() !== target) return false;
      if (q) {
        const hay = `${ev.id} ${ev.actor} ${ev.target} ${ev.chipLabel} ${ev.summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, search, severity, type, actor, target, time]);

  const total = filtered.length;
  const start = page * PER_PAGE;
  const end = Math.min(start + PER_PAGE, total);
  const slice = filtered.slice(start, end);

  const clearAll = () => {
    setSearch(''); setSeverity('all'); setType('all');
    setActor('all'); setTime('all'); setTarget('all'); setPage(0);
  };

  const applyView = (key: string, label: string) => {
    setSearch(''); setSeverity('all'); setType('all');
    setActor('all'); setTime('all'); setTarget('all');
    if (key === 'critical') setSeverity('critical');
    if (key === 'billing') setType('system');
    if (key === 'compliance') setType('compliance');
    if (key === 'security') setType('system');
    if (key === 'mine') setActor('admin');
    setPage(0);
    toast(`View: ${label}`);
  };

  const toggleDetail = (id: string) => {
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const exportCSV = () => {
    const headers = ['Event ID','Time','Date','Event Type','Actor','Actor Role','Target','Target Role','Summary','Session'];
    const rows = filtered.map((ev) => [
      ev.id, ev.time, ev.date, ev.chipLabel,
      ev.actor, ev.actorRole, ev.target, ev.targetRole,
      `"${ev.summary}"`, ev.session,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lookara-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported.');
  };

  return (
    <div className="au-page">
      {/* ══════ HEADER ══════ */}
      <div className="au-header">
        <div>
          <h2>Audit &amp; Activity</h2>
          <p>Complete record of all platform actions</p>
        </div>
        <span className="au-immutable">🔒 Immutable · Append-only</span>
      </div>

      {/* ══════ KPI ROW ══════ */}
      <div className="au-kpis">
        <Kpi label="Events Today"   value="124" />
        <Kpi label="Admin Actions"  value="28" />
        <Kpi label="System Events"  value="63" />
        <Kpi label="PM Events"      value="33" />
        <Kpi label="Critical Events" value="4" tone="red" />
        <Kpi label="Exports"        value="2" />
      </div>

      {/* ══════ SAVED VIEWS ══════ */}
      <div className="au-views">
        <span className="au-views__lbl">Saved Views:</span>
        {SAVED_VIEWS.map((v) => (
          <button
            key={v.key}
            className={`au-view-btn is-${v.tone}`}
            onClick={() => applyView(v.key, v.label)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ══════ CONTROLS ══════ */}
      <div className="au-controls">
        <div className="au-search-wrap">
          <input
            className="au-search"
            placeholder="Search event ID, user, organization, vendor, property, document…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>

        <select className="au-select" value={severity} onChange={(e) => { setSeverity(e.target.value as any); setPage(0); }}>
          <option value="all">All Severity</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="info">⚪ Info</option>
        </select>

        <select className="au-select" value={type} onChange={(e) => { setType(e.target.value as any); setPage(0); }}>
          <option value="all">All Event Types</option>
          <option value="compliance">Compliance</option>
          <option value="vendor">Vendor Actions</option>
          <option value="dispute">Disputes</option>
          <option value="flag">Flags</option>
          <option value="system">System Events</option>
        </select>

        <select className="au-select" value={actor} onChange={(e) => { setActor(e.target.value as any); setPage(0); }}>
          <option value="all">All Actors</option>
          <option value="admin">Admin</option>
          <option value="pm">PM</option>
          <option value="vendor">Vendor</option>
          <option value="system">System</option>
        </select>

        <select className="au-select" value={time} onChange={(e) => { setTime(e.target.value as any); setPage(0); }}>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>

        <select className="au-select" value={target} onChange={(e) => { setTarget(e.target.value as any); setPage(0); }}>
          <option value="all">All Target Types</option>
          <option value="vendor">Vendor</option>
          <option value="dispute">Dispute</option>
          <option value="organization">Organization</option>
        </select>

        <button className="au-clear" onClick={clearAll}>Clear all</button>

        <div className="au-exports">
          <button className="au-export" onClick={exportCSV}>↓ CSV</button>
          <button className="au-export" onClick={() => toast('Exporting Excel…')}>↓ Excel</button>
          <button className="au-export" onClick={() => toast('Generating PDF…')}>↓ PDF</button>
        </div>
      </div>

      {/* ══════ SUMMARY ══════ */}
      <div className="au-summary">
        <span className="au-summary__count">
          {total} event{total !== 1 ? 's' : ''}
        </span>
        <span className="au-summary__sep">·</span>
        <span className="au-summary__range">
          {total > 0 ? `Showing ${start + 1}–${end}` : 'No results'}
        </span>
        <span className="au-summary__sep">·</span>
        <span className="au-summary__note">Read-only · No edits permitted</span>
      </div>

      {/* ══════ TABLE ══════ */}
      <div className="au-table-wrap">
        <table className="au-table">
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Time</th>
              <th>Severity</th>
              <th>Actor → Target</th>
              <th>Summary</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={7} className="au-empty">No events match filters</td>
              </tr>
            ) : slice.map((ev) => {
              const isOpen = expandedId === ev.id;
              const relatedLink = ev.detail['Dispute ID']
                ? { label: `Open Dispute ${ev.detail['Dispute ID']} →`, onClick: () => toast(`Opening Dispute ${ev.detail['Dispute ID']}`) }
                : ev.targetRole !== 'System' && ev.target
                ? { label: `${ev.targetRole}: ${ev.target} · Open Profile →`, onClick: () => toast(`Opening profile for ${ev.target}`) }
                : null;

              return (
                <Fragment key={ev.id}>
                  <tr className={isOpen ? 'is-expanded' : ''} onClick={() => toggleDetail(ev.id)}>
                    <td>
                      <button
                        className="au-evt-id"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard?.writeText(ev.id).then(() => toast(`${ev.id} copied`));
                        }}
                        title="Click to copy"
                      >
                        {ev.id}
                      </button>
                    </td>
                    <td className="au-time">
                      {ev.time} · {ev.date}, 2026
                    </td>
                    <td>
                      <span className={`au-chip is-${ev.chip}`}>{ev.chipLabel}</span>
                    </td>
                    <td className="au-actor-target">
                      <span className="au-actor-name">{ev.actor}</span>{' '}
                      <span className="au-actor-role">({ev.actorRole})</span>{' '}
                      <span className="au-arrow">→</span>{' '}
                      <span className="au-actor-name">{ev.target}</span>{' '}
                      <span className="au-actor-role">({ev.targetRole})</span>
                    </td>
                    <td className="au-summary-cell">{ev.summary}</td>
                    <td className="au-source">{ev.session}</td>
                    <td>
                      <button
                        className="au-btn-view"
                        onClick={(e) => { e.stopPropagation(); toggleDetail(ev.id); }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="au-expanded-row">
                      <td colSpan={7}>
                        <div className="au-expanded-content">
                          <div className="au-detail-grid">
                            {Object.entries(ev.detail).map(([k, v]) => (
                              <Fragment key={k}>
                                <div className="au-detail-label">{k}</div>
                                <div className="au-detail-value">
                                  {k === 'Event ID' ? <code>{v}</code> : v}
                                </div>
                              </Fragment>
                            ))}
                          </div>

                          <div className="au-expand-sub">
                            <div className="au-expand-sub__lbl">Related Object</div>
                            <div>
                              {relatedLink ? (
                                <button className="au-link" onClick={relatedLink.onClick}>
                                  {relatedLink.label}
                                </button>
                              ) : (
                                <span className="au-muted">—</span>
                              )}
                            </div>
                          </div>

                          <div className="au-expand-sub">
                            <div className="au-expand-sub__lbl">Event Timeline</div>
                            <div className="au-timeline">{categoryTimeline(ev.category)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {/* ══════ PAGINATION ══════ */}
        <div className="au-pagination">
          <div className="au-pagination__info">
            {total > 0 ? `Showing ${start + 1}–${end} of ${total}` : 'No events'}
            {'  ·  '}
            <span className="au-pagination__note">
              Retention: 365 days &nbsp;·&nbsp; Immutable Ledger
            </span>
          </div>
          <div className="au-pagination__controls">
            <button
              className="au-btn-page"
              disabled={page === 0}
              onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              ← Previous
            </button>
            <button
              className="au-btn-page"
              disabled={end >= total}
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'red' }) {
  return (
    <div className={`au-kpi ${tone ? 'is-' + tone : ''}`}>
      <div className="au-kpi__label">{label}</div>
      <div className={`au-kpi__value ${tone ? 'is-' + tone : ''}`}>{value}</div>
    </div>
  );
}