// apps/vendor-portal/src/pages/Alerts/Alerts.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import './Alerts.css';

type AlertCat = 'emergency' | 'jobs' | 'payments' | 'compliance';
type AlertFilter = 'all' | AlertCat;

interface Alert {
  id: string;
  group: 'today' | 'earlier';
  category: AlertCat;
  unread: boolean;
  icon: string;
  iconClass: string;
  title: string;
  sub: string;
  time: string;
  to: string;
}

const INITIAL: Alert[] = [
  { id: 'a-001', group: 'today', category: 'emergency', unread: true,
    icon: '⚡', iconClass: 'emg',
    title: 'Emergency Dispatch — Water Leak',
    sub: 'Seaside Villa · 2.1 mi SW · $225 · Accept within 60s',
    time: '08:14 AM', to: '/jobs' },
  { id: 'a-002', group: 'today', category: 'jobs', unread: true,
    icon: '✓', iconClass: 'job',
    title: 'Quote Approved — Pump System Repair',
    sub: 'Coastal STR · Palm Ridge · $340 approved · Work can begin',
    time: '10:02 AM', to: '/jobs' },
  { id: 'a-003', group: 'today', category: 'jobs', unread: true,
    icon: '↩', iconClass: 'job',
    title: 'Rework Requested — Chemical Balance',
    sub: 'PM flagged: pH still off · Windermere property · Due by 5 PM',
    time: '11:45 AM', to: '/jobs' },
  { id: 'a-004', group: 'today', category: 'payments', unread: true,
    icon: '💰', iconClass: 'payment',
    title: 'Payment Recorded — Filter Replacement',
    sub: 'SunState Rentals · $85 · Payment recorded by PM',
    time: '01:30 PM', to: '/earnings' },
  { id: 'a-005', group: 'today', category: 'compliance', unread: true,
    icon: '⚠', iconClass: 'compliance',
    title: 'COI Expiring — 21 Days Left',
    sub: 'Certificate of Insurance · Expires Apr 1 · Emergency jobs will pause',
    time: '02:00 PM', to: '/compliance' },
  { id: 'b-001', group: 'earlier', category: 'jobs', unread: false,
    icon: '✓', iconClass: 'job',
    title: 'Job Completed — Pool Filter Replacement',
    sub: 'Sunset Villa · Marked complete · Submitted for PM review',
    time: 'Yesterday', to: '/jobs' },
  { id: 'b-002', group: 'earlier', category: 'payments', unread: false,
    icon: '💸', iconClass: 'payment',
    title: 'Payment Confirmed — $340',
    sub: 'Coastal STR · Pump Inspection · Confirmed received',
    time: 'Yesterday', to: '/earnings' },
  { id: 'b-003', group: 'earlier', category: 'compliance', unread: false,
    icon: '📄', iconClass: 'compliance',
    title: 'Document Approved — Background Check',
    sub: 'Lookara Admin · Verified · Valid until Nov 2026',
    time: 'Mar 11', to: '/compliance' },
];

/* ═══════════════════════════════════════════════════════════ */
export default function Alerts() {
  const navigate = useNavigate();
  const { showToast } = useVendor();

  const [alerts, setAlerts] = useState<Alert[]>(INITIAL);
  const [filter, setFilter] = useState<AlertFilter>('all');

  const filtered = useMemo(
    () => alerts.filter((a) => filter === 'all' || a.category === filter),
    [alerts, filter]
  );

  const today   = filtered.filter((a) => a.group === 'today');
  const earlier = filtered.filter((a) => a.group === 'earlier');

  const unread   = alerts.filter((a) => a.unread).length;
  const critical = alerts.filter((a) => a.unread && a.category === 'emergency').length;
  const todayCnt = alerts.filter((a) => a.group === 'today').length;

  const handleClick = (a: Alert) => {
    setAlerts((list) => list.map((x) => (x.id === a.id ? { ...x, unread: false } : x)));
    navigate(a.to);
  };

  const markAllRead = () => {
    setAlerts((list) => list.map((x) => ({ ...x, unread: false })));
    showToast('All alerts marked as read', 'success');
  };

  const FILTERS: { key: AlertFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'emergency', label: 'Emergency' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'payments', label: 'Payments' },
    { key: 'compliance', label: 'Compliance' },
  ];

  return (
    <>
      <div className="topbar">
        <span className="page-title">Alerts</span>
        <div className="topbar-right">
          <button className="ph-action" onClick={markAllRead}>Mark All Read</button>
          <button className="btn-icon" onClick={() => showToast('Opening Alerts…')}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1a5 5 0 015 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" />
            </svg>
            <span className="notif-dot" />
          </button>
        </div>
      </div>

      <div className="alerts-page">
        {/* Summary strip */}
        <div className="summary-strip">
          <div className="ss-cell">
            <div className="ss-val crimson">{unread}</div>
            <div className="ss-lbl">Unread Alerts</div>
          </div>
          <div className="ss-cell">
            <div className="ss-val amber">{critical}</div>
            <div className="ss-lbl">Critical</div>
          </div>
          <div className="ss-cell">
            <div className="ss-val">{todayCnt}</div>
            <div className="ss-lbl">Today</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Groups */}
        <div className="alerts-body">
          {today.length > 0 && (
            <section>
              <div className="alert-group-label">Today</div>
              <div className="alert-list">
                {today.map((a) => <AlertRow key={a.id} alert={a} onClick={() => handleClick(a)} />)}
              </div>
            </section>
          )}
          {earlier.length > 0 && (
            <section>
              <div className="alert-group-label">Earlier</div>
              <div className="alert-list">
                {earlier.map((a) => <AlertRow key={a.id} alert={a} onClick={() => handleClick(a)} />)}
              </div>
            </section>
          )}
          {!today.length && !earlier.length && (
            <div className="alerts-empty">No alerts in this category</div>
          )}
        </div>
      </div>
    </>
  );
}

function AlertRow({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  return (
    <button className={`alert-row ${alert.unread ? 'unread' : ''}`} onClick={onClick}>
      <span className={`alert-dot ${alert.unread ? 'unread' : 'read'}`} />
      <span className={`alert-icon ${alert.iconClass}`}>{alert.icon}</span>
      <span className="alert-body">
        <span className="alert-title">{alert.title}</span>
        <span className="alert-sub">{alert.sub}</span>
      </span>
      <span className="alert-time">{alert.time}</span>
      <span className="alert-caret">›</span>
    </button>
  );
}