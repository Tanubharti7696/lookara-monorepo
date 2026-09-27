// apps/vendor-portal/src/pages/Earnings/Earnings.tsx
import { useState, useMemo, useEffect } from 'react';
import { useVendor } from '../../context/VendorContext';
import {
  DelayedDrawer, BucketDrawer, PaymentMethodDrawer,
} from './EarningsDrawers';
import './Earnings.css';

/* ── TYPES ── */
export type PayStatus = 'paid' | 'pending-payout' | 'awaiting' | 'delayed' | 'disputed';
export interface LedgerEntry {
  id: string;
  prop: string;
  pm: string;
  payout: number;
  status: PayStatus;
  date: string;
  jobType: string;
  payDate: string | null;
  daysWaiting: number;
  payMethod?: string;
  payRef?: string;
}

/* ── DATA ── */
export const LEDGER: LedgerEntry[] = [
  { id: 't-001', prop: 'Seaside Villa',     pm: 'Coastal STR',     payout: 225, status: 'awaiting',       date: 'Mar 11', jobType: 'Emergency', payDate: null,     daysWaiting: 0 },
  { id: 't-002', prop: 'Sunset Villa',      pm: 'SunState Rentals',payout: 85,  status: 'delayed',        date: 'Mar 10', jobType: 'Repair',    payDate: null,     daysWaiting: 3 },
  { id: 't-003', prop: 'Marina Cove',       pm: 'SunState Rentals',payout: 75,  status: 'delayed',        date: 'Mar 9',  jobType: 'Recurring', payDate: null,     daysWaiting: 4 },
  { id: 't-004', prop: 'Oak Manor',         pm: 'Coastal STR',     payout: 155, status: 'pending-payout', date: 'Mar 8',  jobType: 'Repair',    payDate: 'Mar 15', daysWaiting: 0 },
  { id: 't-005', prop: 'Park Cove Retreat', pm: 'Premier Stays',   payout: 110, status: 'pending-payout', date: 'Mar 7',  jobType: 'Job',       payDate: 'Mar 15', daysWaiting: 0 },
  { id: 't-006', prop: 'Sunset Palms',      pm: 'Coastal STR',     payout: 85,  status: 'paid',           date: 'Mar 6',  jobType: 'Recurring', payDate: 'Mar 8',  daysWaiting: 0, payMethod: 'Zelle', payRef: 'ZL-88234' },
  { id: 't-007', prop: 'Lakewood Villa',    pm: 'Coastal STR',     payout: 155, status: 'paid',           date: 'Mar 4',  jobType: 'Repair',    payDate: 'Mar 6',  daysWaiting: 0, payMethod: 'ACH',   payRef: 'ACH-44102' },
  { id: 't-008', prop: 'Bay Breeze',        pm: 'SunState Rentals',payout: 85,  status: 'disputed',       date: 'Mar 3',  jobType: 'Recurring', payDate: null,     daysWaiting: 8 },
  { id: 't-009', prop: 'Palm Ridge',        pm: 'Coastal STR',     payout: 120, status: 'awaiting',       date: 'Mar 11', jobType: 'Inspection',payDate: null,     daysWaiting: 0 },
  { id: 't-010', prop: 'Sunset Villa',      pm: 'Coastal STR',     payout: 275, status: 'pending-payout', date: 'Mar 7',  jobType: 'Assessment',payDate: 'Mar 15', daysWaiting: 0 },
  { id: 't-011', prop: 'Bayfront Lodge',    pm: 'Premier Stays',   payout: 280, status: 'paid',           date: 'Mar 5',  jobType: 'Repair',    payDate: 'Mar 8',  daysWaiting: 0, payMethod: 'Zelle' },
  { id: 't-012', prop: 'Marina Cove',       pm: 'SunState Rentals',payout: 75,  status: 'paid',           date: 'Mar 2',  jobType: 'Recurring', payDate: 'Mar 4',  daysWaiting: 0, payMethod: 'Check' },
  { id: 't-013', prop: 'Oak Terrace',       pm: 'Coastal STR',     payout: 110, status: 'paid',           date: 'Mar 1',  jobType: 'Inspection',payDate: 'Mar 4',  daysWaiting: 0, payMethod: 'Zelle' },
];

const MOMENTUM_7D = [210, 340, 85, 420, 310, 295, 385];

const STATUS_META: Record<PayStatus, { icon: string; chip: string; label: string }> = {
  paid:              { icon: '✅', chip: 'chip-paid',     label: 'Paid' },
  'pending-payout':  { icon: '⏳', chip: 'chip-pending',  label: 'Payout Fri' },
  awaiting:          { icon: '🕐', chip: 'chip-awaiting', label: 'Awaiting PM' },
  delayed:           { icon: '⚠',  chip: 'chip-delayed',  label: 'Delayed' },
  disputed:          { icon: '🔴', chip: 'chip-disputed', label: 'Disputed' },
};

type Tab = 'pipeline' | 'history';

/* ═══════════════════════════════════════════════════════════════ */
export default function Earnings() {
  const { showToast } = useVendor();
  const [tab, setTab] = useState<Tab>('pipeline');
  const [drawer, setDrawer] = useState<
    | { kind: 'delayed' }
    | { kind: 'bucket'; status: PayStatus; title: string; sub: string }
    | { kind: 'job'; id: string }
    | { kind: 'payment-method' }
    | null
  >(null);

  /* ── Derived ── */
  const delayed  = LEDGER.filter((t) => t.status === 'delayed');
  const pending  = LEDGER.filter((t) => t.status === 'pending-payout');
  const awaiting = LEDGER.filter((t) => t.status === 'awaiting');
  const paid     = LEDGER.filter((t) => t.status === 'paid');

  const totalDelayed  = delayed.reduce((s, t) => s + t.payout, 0);
  const totalPending  = pending.reduce((s, t) => s + t.payout, 0);
  const totalAwaiting = awaiting.reduce((s, t) => s + t.payout, 0);
  const totalIncoming = totalDelayed + totalPending + totalAwaiting;

  /* ── Momentum chart ── */
  const momentumBars = useMemo(() => {
    const max = Math.max(...MOMENTUM_7D);
    return MOMENTUM_7D.map((v, i) => {
      const isToday = i === MOMENTUM_7D.length - 1;
      const h = Math.max(Math.round((v / max) * 22), 3);
      const color = isToday
        ? 'var(--gold)'
        : v > max * 0.6
        ? 'rgba(16,185,129,0.55)'
        : 'rgba(255,255,255,0.12)';
      return { h, color, isToday };
    });
  }, []);

  /* ── History grouping ── */
  const historyGroups = useMemo(() => {
    const groups: Record<string, LedgerEntry[]> = {};
    paid.forEach((t) => {
      const key = t.payDate || t.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const da = new Date(`${a} 2026`).getTime();
      const db = new Date(`${b} 2026`).getTime();
      return db - da;
    });
    return sortedKeys.map((k) => ({
      dateKey: k,
      jobs: groups[k],
      total: groups[k].reduce((s, t) => s + t.payout, 0),
    }));
  }, [paid]);

  const totalPaidThisMonth = paid.reduce((s, t) => s + t.payout, 0);

  /* ── ESC to close drawer ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <span className="page-title">Earnings</span>
        <div className="topbar-right">
          <button className="btn-icon" onClick={() => showToast('Opening Alerts…')} title="Alerts">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1a5 5 0 015 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" />
            </svg>
            <span className="notif-dot" />
          </button>
        </div>
      </div>

      <div className="top-strip-wrap">
        {/* KPI STRIP */}
        <div className="top-strip">
          <div className="kpi-tile">
            <div className="kpi-lbl">Today</div>
            <div className="kpi-val gold">$385</div>
            <div className="kpi-sub up">+$180 vs last Wed</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-lbl">This Week</div>
            <div className="kpi-val">$640</div>
            <div className="kpi-sub up">▲ 12% vs last week</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-lbl">This Month</div>
            <div className="kpi-val">$2,870</div>
            <div className="kpi-sub up">Above last month — good momentum</div>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* DELAYED ALERT */}
        {delayed.length > 0 && (
          <button className="delayed-alert" onClick={() => setDrawer({ kind: 'delayed' })}>
            <div className="da-icon">⚠</div>
            <div className="da-body">
              <div className="da-title">${totalDelayed} delayed by PM approval</div>
              <div className="da-sub">
                SunState Rentals · avg 3.1 days — slower than normal · tap to review
              </div>
            </div>
          </button>
        )}

        {/* MOMENTUM */}
        <div className="momentum-strip">
          <div className="mom-spark">
            {momentumBars.map((b, i) => (
              <div
                key={i}
                className="mom-bar"
                style={{
                  height: b.h,
                  background: b.color,
                  boxShadow: b.isToday ? '0 0 4px rgba(212,175,55,.35)' : 'none',
                }}
              />
            ))}
          </div>
          <div className="mom-stat">
            <div className="mom-pct up">▲ +18%</div>
            <div className="mom-label">vs last week</div>
          </div>
          <div className="mom-insight">Lake Nona jobs driving +18% this week</div>
        </div>

        {/* TABS */}
        <div className="earnings-tabs">
          <button
            className={`earnings-tab ${tab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setTab('pipeline')}
          >
            Getting Paid
          </button>
          <button
            className={`earnings-tab ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            History
          </button>
        </div>

        {tab === 'pipeline' ? (
          <div className="getting-paid">
            <div className="gp-header">
              <div className="gp-title">${totalIncoming.toLocaleString()} coming in</div>
              <div className="gp-count">{delayed.length + pending.length + awaiting.length} items</div>
            </div>

            {/* Needs attention */}
            {delayed.length > 0 && (
              <>
                <div className="gp-section-lbl is-amber">⚠ Needs Attention</div>
                <button className="gp-row" onClick={() => setDrawer({ kind: 'delayed' })}>
                  <div className="gp-row-left">
                    <div className="gp-row-label is-amber">Delayed by PM</div>
                    <div className="gp-row-sub">SunState Rentals · avg 3.1 days · slow</div>
                  </div>
                  <div className="gp-row-right">
                    <div className="gp-amount delayed">${totalDelayed}</div>
                    <div className="gp-chip delayed">View jobs →</div>
                  </div>
                </button>
              </>
            )}

            {/* In progress */}
            {awaiting.length > 0 && (
              <>
                <div className="gp-section-lbl is-blue">⏳ In Progress</div>
                <button
                  className="gp-row"
                  onClick={() => setDrawer({ kind: 'bucket', status: 'awaiting', title: 'Awaiting PM Approval', sub: 'PM review in progress' })}
                >
                  <div className="gp-row-left">
                    <div className="gp-row-label">Awaiting Approval</div>
                    <div className="gp-row-sub">{awaiting.length} jobs · PM review pending</div>
                  </div>
                  <div className="gp-row-right">
                    <div className="gp-amount awaiting">${totalAwaiting}</div>
                    <div className="gp-chip awaiting">View jobs →</div>
                  </div>
                </button>
              </>
            )}

            {/* Scheduled */}
            {pending.length > 0 && (
              <>
                <div className="gp-section-lbl is-emerald">✓ Scheduled</div>
                <button
                  className="gp-row"
                  onClick={() => setDrawer({ kind: 'bucket', status: 'pending-payout', title: 'Pending Payout', sub: 'Verified · Scheduled Mar 15' })}
                >
                  <div className="gp-row-left">
                    <div className="gp-row-label is-emerald">Pending Payout</div>
                    <div className="gp-row-sub">Verified · arrives Mar 15</div>
                  </div>
                  <div className="gp-row-right">
                    <div className="gp-amount pending">${totalPending}</div>
                    <div className="gp-chip pending">View payout →</div>
                  </div>
                </button>
              </>
            )}

            {/* Reliability footer */}
            <div className="reliability-row">
              <div className="rel-stat flex-2">
                <div className="rel-lbl">Payout reliability</div>
                <div className="rel-val warn">64% on time · avg 2.3 days</div>
              </div>
              <div className="rel-divider" />
              <div className="rel-stat">
                <div className="rel-lbl">Forecast</div>
                <div className="rel-val gold">On track $846</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="getting-paid">
            <div className="gp-header">
              <div className="gp-title">Closed &amp; Paid</div>
              <div className="gp-count is-emerald">${totalPaidThisMonth} this month</div>
            </div>

            {historyGroups.length === 0 ? (
              <div className="history-empty">No completed payments yet.</div>
            ) : (
              historyGroups.map((g) => (
                <div key={g.dateKey}>
                  <div className="history-group-head">
                    <div>
                      <div className="hgh-title">{g.dateKey} Payout</div>
                      <div className="hgh-sub">{g.jobs.length} job{g.jobs.length > 1 ? 's' : ''}</div>
                    </div>
                    <div className="hgh-total">${g.total}</div>
                  </div>
                  {g.jobs.map((j) => (
                    <button
                      key={j.id}
                      className="gp-row"
                      onClick={() => setDrawer({ kind: 'job', id: j.id })}
                    >
                      <div className="gp-row-left">
                        <div className="gp-row-label">{j.prop}</div>
                        <div className="gp-row-sub">{j.pm} · {j.date}</div>
                      </div>
                      <div className="gp-row-right">
                        <div className="gp-amount paid">${j.payout}</div>
                        <div className="gp-chip paid">Paid</div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}

            <button className="view-all-btn" onClick={() => showToast('Full earnings ledger — coming soon')}>
              View All Earnings →
            </button>
          </div>
        )}

        {/* PAYMENT METHOD */}
        <div className="section-block">
          <div className="pay-row">
            <div className="pay-icon">🏦</div>
            <div className="flex-1">
              <div className="pay-name">ACH ••••4821 · Chase</div>
              <div className="pay-verified">✓ Verified · Updated Feb 2</div>
            </div>
            <button className="pay-update" onClick={() => setDrawer({ kind: 'payment-method' })}>
              Update →
            </button>
          </div>
        </div>
      </div>

      {/* DRAWERS */}
      {drawer?.kind === 'delayed' && (
        <DelayedDrawer
          entries={delayed}
          total={totalDelayed}
          onClose={() => setDrawer(null)}
          showToast={showToast}
        />
      )}
      {drawer?.kind === 'bucket' && (
        <BucketDrawer
          title={drawer.title}
          sub={drawer.sub}
          entries={LEDGER.filter((t) => t.status === drawer.status)}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer?.kind === 'job' && (
        <JobDrawer
          entry={LEDGER.find((t) => t.id === drawer.id) ?? null}
          onClose={() => setDrawer(null)}
          showToast={showToast}
        />
      )}
      {drawer?.kind === 'payment-method' && (
        <PaymentMethodDrawer onClose={() => setDrawer(null)} showToast={showToast} />
      )}
    </>
  );
}

/* ── JobDrawer (imported lazily to avoid cycle) ── */
function JobDrawer({
  entry, onClose, showToast,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
  showToast: (m: string, t?: 'info' | 'success' | 'danger' | 'warn') => void;
}) {
  if (!entry) return null;
  const s = STATUS_META[entry.status];
  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <aside className="drawer open">
        <div className="drawer-hdr">
          <div>
            <div className="dh-title">${entry.payout} · {entry.prop}</div>
            <div className="dh-meta">
              <span className={`rr-chip ${s.chip}`}>{s.label}</span>
              <span className="dh-sub">{entry.pm} · {entry.date}</span>
            </div>
          </div>
          <button className="dh-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          <div className="ds-block">
            <div className="ds-block-title">Payment Details</div>
            <div className="ds-row"><span className="ds-lbl">Amount</span><span className="ds-val gold">${entry.payout}</span></div>
            <div className="ds-row"><span className="ds-lbl">Status</span><span className="ds-val">{s.label}</span></div>
            <div className="ds-row"><span className="ds-lbl">PM</span><span className="ds-val">{entry.pm}</span></div>
            <div className="ds-row"><span className="ds-lbl">Job Type</span><span className="ds-val">{entry.jobType}</span></div>
            <div className="ds-row"><span className="ds-lbl">Completed</span><span className="ds-val">{entry.date}</span></div>
            {entry.payDate && <div className="ds-row"><span className="ds-lbl">Payout date</span><span className="ds-val green">{entry.payDate}</span></div>}
            {entry.daysWaiting > 0 && <div className="ds-row"><span className="ds-lbl">Days waiting</span><span className="ds-val amber">{entry.daysWaiting} days</span></div>}
          </div>
        </div>
        <div className="drawer-foot">
          {entry.status === 'delayed' ? (
            <>
              <button className="btn-prim" onClick={() => { showToast('Reminder sent to PM · Logged', 'success'); onClose(); }}>Send Reminder to PM</button>
              <button className="btn-sec btn-crimson" onClick={() => { showToast('Dispute filed', 'danger'); onClose(); }}>File Dispute</button>
            </>
          ) : (
            <button className="btn-sec full" onClick={onClose}>Close</button>
          )}
        </div>
      </aside>
    </>
  );
}