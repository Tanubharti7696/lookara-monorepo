// apps/vendor-portal/src/pages/Earnings/EarningsDrawers.tsx
import type { LedgerEntry } from './Earnings';
import './EarningsDrawers.css';

type Toast = (msg: string, tone?: 'info' | 'success' | 'danger' | 'warn' | 'emg') => void;

/* ── Shared shell ── */
function Shell({
  onClose, header, children, footer,
}: {
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <aside className="drawer open">
        <div className="drawer-hdr">{header}</div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-foot">{footer}</div>
      </aside>
    </>
  );
}

/* ═══════════════ DELAYED DRAWER ═══════════════ */
export function DelayedDrawer({
  entries, total, onClose, showToast,
}: {
  entries: LedgerEntry[];
  total: number;
  onClose: () => void;
  showToast: Toast;
}) {
  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">⚠ ${total} Delayed by PM</div>
            <div className="dh-sub" style={{ color: 'var(--amber)' }}>
              SunState Rentals · Payment approval slower than normal
            </div>
          </div>
          <button className="dh-close" onClick={onClose}>×</button>
        </>
      }
      footer={
        <>
          <button className="btn-prim" onClick={() => { showToast('Reminder sent to PM', 'success'); onClose(); }}>Send Reminder to PM</button>
          <button className="btn-sec" onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="drawer-note is-amber">
        SunState Rentals is averaging <strong>3.1 days</strong> to approve payments.
        Lookara avg is 1.8 days. These jobs are flagged.
      </div>
      {entries.map((t) => (
        <div key={t.id} className="ds-block">
          <div className="ds-block-title">{t.prop} · {t.date}</div>
          <div className="ds-row"><span className="ds-lbl">Amount</span><span className="ds-val amber">${t.payout}</span></div>
          <div className="ds-row"><span className="ds-lbl">Days waiting</span><span className="ds-val amber">{t.daysWaiting} days</span></div>
          <div className="ds-row"><span className="ds-lbl">PM</span><span className="ds-val">{t.pm}</span></div>
        </div>
      ))}
    </Shell>
  );
}

/* ═══════════════ BUCKET DRAWER ═══════════════ */
export function BucketDrawer({
  title, sub, entries, onClose,
}: {
  title: string;
  sub: string;
  entries: LedgerEntry[];
  onClose: () => void;
}) {
  const total = entries.reduce((s, t) => s + t.payout, 0);
  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">{title}</div>
            <div className="dh-sub">{entries.length} jobs · ${total} · {sub}</div>
          </div>
          <button className="dh-close" onClick={onClose}>×</button>
        </>
      }
      footer={<button className="btn-sec full" onClick={onClose}>Close</button>}
    >
      {entries.map((t) => (
        <div key={t.id} className="ds-block">
          <div className="ds-block-title">{t.prop} · {t.date}</div>
          <div className="ds-row"><span className="ds-lbl">Amount</span><span className="ds-val gold">${t.payout}</span></div>
          <div className="ds-row"><span className="ds-lbl">PM</span><span className="ds-val">{t.pm}</span></div>
          {t.payDate && <div className="ds-row"><span className="ds-lbl">Payout date</span><span className="ds-val green">{t.payDate}</span></div>}
        </div>
      ))}
    </Shell>
  );
}

/* ═══════════════ JOB DRAWER ═══════════════ */
export function JobDrawer({
  entry, onClose, showToast,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
  showToast: Toast;
}) {
  if (!entry) return null;

  const statusLabels: Record<string, string> = {
    paid: 'Paid',
    'pending-payout': 'Payout Fri',
    awaiting: 'Awaiting PM',
    delayed: 'Delayed',
    disputed: 'Disputed',
  };

  const statusChipClass: Record<string, string> = {
    paid: 'chip-paid',
    'pending-payout': 'chip-pending',
    awaiting: 'chip-awaiting',
    delayed: 'chip-delayed',
    disputed: 'chip-disputed',
  };

  const isDelayed = entry.status === 'delayed';

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">${entry.payout} · {entry.prop}</div>
            <div className="dh-meta">
              <span className={`rr-chip ${statusChipClass[entry.status]}`}>{statusLabels[entry.status]}</span>
              <span className="dh-sub">{entry.pm} · {entry.date}</span>
            </div>
          </div>
          <button className="dh-close" onClick={onClose}>×</button>
        </>
      }
      footer={
        isDelayed ? (
          <>
            <button className="btn-prim" onClick={() => { showToast('Reminder sent to PM · Logged', 'success'); onClose(); }}>Send Reminder to PM</button>
            <button className="btn-sec btn-crimson" onClick={() => { showToast('Dispute filed', 'danger'); onClose(); }}>File Dispute</button>
          </>
        ) : (
          <button className="btn-sec full" onClick={onClose}>Close</button>
        )
      }
    >
      <div className="ds-block">
        <div className="ds-block-title">Payment Details</div>
        <div className="ds-row"><span className="ds-lbl">Amount</span><span className="ds-val gold">${entry.payout}</span></div>
        <div className="ds-row"><span className="ds-lbl">Status</span><span className="ds-val">{statusLabels[entry.status]}</span></div>
        <div className="ds-row"><span className="ds-lbl">PM</span><span className="ds-val">{entry.pm}</span></div>
        <div className="ds-row"><span className="ds-lbl">Job Type</span><span className="ds-val">{entry.jobType}</span></div>
        <div className="ds-row"><span className="ds-lbl">Completed</span><span className="ds-val">{entry.date}</span></div>
        {entry.payDate && <div className="ds-row"><span className="ds-lbl">Payout date</span><span className="ds-val green">{entry.payDate}</span></div>}
        {entry.daysWaiting > 0 && <div className="ds-row"><span className="ds-lbl">Days waiting</span><span className="ds-val amber">{entry.daysWaiting} days</span></div>}
      </div>
    </Shell>
  );
}

/* ═══════════════ PAYMENT METHOD DRAWER ═══════════════ */
export function PaymentMethodDrawer({
  onClose, showToast,
}: {
  onClose: () => void;
  showToast: Toast;
}) {
  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div><div className="dh-title">Payment Method</div></div>
          <button className="dh-close" onClick={onClose}>×</button>
        </>
      }
      footer={
        <>
          <button className="btn-prim" onClick={() => { showToast('Opening Settings…'); onClose(); }}>Go to Settings →</button>
          <button className="btn-sec" onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="ds-block">
        <div className="ds-block-title">Current Account</div>
        <div className="ds-row"><span className="ds-lbl">Type</span><span className="ds-val">ACH Bank Transfer</span></div>
        <div className="ds-row"><span className="ds-lbl">Bank</span><span className="ds-val">Chase</span></div>
        <div className="ds-row"><span className="ds-lbl">Account</span><span className="ds-val">•••• 4821</span></div>
        <div className="ds-row"><span className="ds-lbl">Status</span><span className="ds-val green">✓ Verified · Feb 2</span></div>
      </div>
      <div className="drawer-note is-blue">
        ℹ Full payment settings are in Settings. Changes take effect on the next payout cycle.
      </div>
    </Shell>
  );
}