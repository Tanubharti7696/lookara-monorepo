// apps/vendor-portal/src/pages/Compliance/Compliance.tsx
import { useMemo, useState } from 'react';
import { useVendor } from '../../context/VendorContext';
import { COIDrawer, W9Drawer, GenericDocDrawer } from './ComplianceDrawers';
import './Compliance.css';

/* ── TYPES ── */
export type DocStatus =
  | 'valid'
  | 'expiring'
  | 'failed'
  | 'missing'
  | 'pending_admin_review';

export interface Doc {
  id: string;
  name: string;
  icon: string;
  status: DocStatus;
  issuer: string | null;
  issued: string | null;
  expires: string | null;
  daysLeft: number | null;
  fileRef: string | null;
  impact: string | null;
  notes: string | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
}

export interface Activity {
  date: string;
  label: string;
  detail: string;
  type: 'ok' | 'warn' | 'info';
}

export type AccountState = 'active' | 'blocked' | 'suspended';

/* ── CONSTANTS ── */
const EXPIRY_WARNING_DAYS = 21;
const ACTIVE_TRADES = ['Pool & Water Systems', 'Plumbing'];
const ACCOUNT_STATE: AccountState = 'blocked';

const SHARED_INITIAL: Record<string, Doc> = {
  coi: {
    id: 'd-001', name: 'Certificate of Insurance (COI)', icon: '🛡',
    status: 'failed', issuer: 'Progressive Commercial',
    issued: 'Apr 1, 2024', expires: 'Apr 1, 2026', daysLeft: 21,
    fileRef: 'COI-PROG-2024-88121',
    impact: 'After Apr 1: Emergency jobs will stop',
    notes: 'General liability $1M · Auto coverage included',
    rejectionReason: 'Document appears expired — uploaded certificate shows expiry Mar 15, 2026. Please upload a current certificate.',
    rejectedAt: 'Apr 13, 2026',
  },
  background: {
    id: 'd-004', name: 'Background Check', icon: '🔍',
    status: 'valid', issuer: 'Lookara · Checkr',
    issued: 'Nov 5, 2024', expires: 'Nov 5, 2026', daysLeft: 604,
    fileRef: 'CHK-2024-LOOKARA-MR', impact: null,
    notes: 'Clear — no disqualifying records',
  },
  w9: {
    id: 'd-005', name: 'W-9 Tax Form', icon: '📄',
    status: 'missing', issuer: null, issued: null, expires: null,
    daysLeft: null, fileRef: null,
    impact: 'Required for payouts over $600', notes: null,
  },
};

const TRADE_INITIAL: Record<string, Doc[]> = {
  'Pool & Water Systems': [
    {
      id: 'd-002', name: 'Business License', icon: '🏢',
      status: 'valid', issuer: 'State of Florida',
      issued: 'Jan 15, 2024', expires: 'Jan 15, 2027', daysLeft: 675,
      fileRef: 'FL-BIZ-2024-MR-0441', impact: null, notes: null,
    },
    {
      id: 'd-003', name: 'Pool & Spa Tech Certification (CPO)', icon: '🏊',
      status: 'valid', issuer: 'NSPF',
      issued: 'Mar 10, 2023', expires: 'Mar 10, 2026', daysLeft: 356,
      fileRef: 'NSPF-CPO-2023-MR', impact: null, notes: 'Certified Pool Operator',
    },
  ],
  'Plumbing': [
    {
      id: 'd-p-001', name: 'Plumbing License', icon: '🔧',
      status: 'missing', issuer: null, issued: null, expires: null,
      daysLeft: null, fileRef: null,
      impact: 'Required to receive plumbing jobs', notes: null,
    },
  ],
};

const INITIAL_ACTIVITY: Activity[] = [
  { date: 'Mar 11', label: 'Background check',   detail: 'renewed and approved',                       type: 'ok' },
  { date: 'Mar 10', label: 'Pool certification', detail: 'approved and activated',                     type: 'ok' },
  { date: 'Feb 2',  label: 'Insurance (COI)',    detail: 'submitted — pending admin review (latest)',  type: 'warn' },
  { date: 'Jan 15', label: 'Business license',   detail: 'approved by Lookara admin',                  type: 'ok' },
];

/* ── HELPERS ── */
export function isEligible(doc: Doc): boolean {
  return doc.status === 'valid' || doc.status === 'expiring';
}
export function needsAction(doc: Doc): boolean {
  return doc.status === 'failed' || doc.status === 'expiring' || doc.status === 'missing';
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Compliance() {
  const { showToast } = useVendor();

  const [shared, setShared]     = useState<Record<string, Doc>>(SHARED_INITIAL);
  const [tradeDocs, setTradeDocs] = useState<Record<string, Doc[]>>(TRADE_INITIAL);
  const [activity, setActivity] = useState<Activity[]>(INITIAL_ACTIVITY);
  const [activityOpen, setActivityOpen] = useState(false);

  /* active drawer — either a doc object + optional context */
  const [drawerDoc, setDrawerDoc] = useState<{ doc: Doc; scope: 'shared' | string } | null>(null);

  /* ── Derived ── */
  const sharedList = useMemo(() => Object.values(shared), [shared]);
  const allDocs = useMemo(
    () => [...sharedList, ...Object.values(tradeDocs).flat()],
    [sharedList, tradeDocs]
  );

  const urgency = useMemo(
    () => allDocs.filter((d) => d.status === 'failed' || d.status === 'expiring'),
    [allDocs]
  );

  const tradeEligible = (tradeName: string): boolean => {
    const coiOk = isEligible(shared.coi);
    const bgOk  = shared.background.status === 'valid';
    const tradeOk = (tradeDocs[tradeName] ?? []).every(isEligible);
    return coiOk && bgOk && tradeOk;
  };

  const tradeMissing = (tradeName: string): string[] => {
    const missing: string[] = [];
    if (!isEligible(shared.coi)) missing.push(shared.coi.name);
    if (shared.background.status !== 'valid') missing.push(shared.background.name);
    (tradeDocs[tradeName] ?? []).forEach((r) => {
      if (!isEligible(r)) missing.push(r.name);
    });
    return missing;
  };

  const allEligible = ACTIVE_TRADES.every(tradeEligible);
  const coiExpiring = shared.coi.status === 'expiring';

  /* ── Handlers ── */
  const openDoc = (doc: Doc, scope: 'shared' | string) => setDrawerDoc({ doc, scope });

  const handleDocUpdate = (updated: Doc) => {
    /* Route update back to the right bucket */
    if (updated.id.startsWith('d-00')) {
      setShared((s) => {
        const key = Object.keys(s).find((k) => s[k].id === updated.id);
        if (!key) return s;
        return { ...s, [key]: updated };
      });
    } else {
      setTradeDocs((td) => {
        const next = { ...td };
        for (const trade of Object.keys(next)) {
          next[trade] = next[trade].map((d) => (d.id === updated.id ? updated : d));
        }
        return next;
      });
    }
    /* Log activity */
    setActivity((a) => [
      {
        date: 'Mar 11',
        label: updated.name.replace(' (COI)', '').replace(' (CPO)', ''),
        detail: 'submitted — pending admin review',
        type: 'warn',
      },
      ...a,
    ]);
  };

  return (
    <>
      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div className="topbar-title">Compliance</div>
        <button className="btn-icon" onClick={() => showToast('Opening Alerts…')} title="Alerts">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1a5 5 0 015 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" />
          </svg>
          <span className="notif-dot" />
        </button>
      </div>

      <div className="page-body">
        {/* ── ACCOUNT BANNER ── */}
        <AccountBanner state={ACCOUNT_STATE} />

        {/* ── STATUS HEADER ── */}
        <StatusHeader
          allEligible={allEligible}
          coiExpiring={coiExpiring}
          coiDaysLeft={shared.coi.daysLeft}
          activeTrades={ACTIVE_TRADES}
          tradeEligible={tradeEligible}
          urgencyCount={urgency.length}
        />

        {/* ── ACTION REQUIRED ── */}
        {urgency.length > 0 && (
          <ActionRequired docs={urgency} onOpen={(d) => openDoc(d, 'shared')} />
        )}

        {/* ── SHARED REQUIREMENTS ── */}
        <section className="doc-section">
          <div className="doc-section-hdr">
            <div className="doc-section-title">Shared Requirements</div>
            <span className="doc-section-hint">Applies to all trades</span>
          </div>
          <div className="doc-list-block">
            {sharedList.map((d) => (
              <DocRow key={d.id} doc={d} context="shared" onOpen={() => openDoc(d, 'shared')} />
            ))}
          </div>
        </section>

        {/* ── TRADE REQUIREMENTS ── */}
        {ACTIVE_TRADES.map((trade) => {
          const eligible = tradeEligible(trade);
          const missing = tradeMissing(trade);
          const coiOk = isEligible(shared.coi);
          const coiStatus = shared.coi.status;
          const coiColor = coiOk ? (coiStatus === 'expiring' ? 'amber' : 'emerald') : 'crimson';
          const coiLabel = coiOk ? 'Shared requirement — satisfied' : 'Shared requirement — failed';

          return (
            <section key={trade} className="doc-section">
              <div className="doc-section-hdr">
                <div className="doc-section-title">{trade}</div>
                <span
                  className="doc-section-badge"
                  style={{ color: eligible ? 'var(--emerald)' : 'var(--amber)' }}
                >
                  {eligible ? '✓ Eligible' : `⚠ ${missing.length} requirement${missing.length > 1 ? 's' : ''} missing`}
                </span>
              </div>
              <div className="doc-list-block">
                <div className="doc-row doc-row--readonly">
                  <div className="doc-row-icon">🛡</div>
                  <div className="doc-row-body">
                    <div className="doc-row-name">Certificate of Insurance (COI)</div>
                    <div className={`doc-row-expiry ${coiColor}`}>{coiLabel}</div>
                  </div>
                  <span className="doc-shared-lbl">Shared</span>
                </div>
                {(tradeDocs[trade] ?? []).length === 0 ? (
                  <div className="doc-empty">No additional requirements for this trade</div>
                ) : (
                  (tradeDocs[trade] ?? []).map((d) => (
                    <DocRow key={d.id} doc={d} context={trade} onOpen={() => openDoc(d, trade)} />
                  ))
                )}
              </div>
            </section>
          );
        })}

        {/* ── RECENT ACTIVITY ── */}
        <section className="doc-section">
          <button className="doc-section-hdr clickable" onClick={() => setActivityOpen((o) => !o)}>
            <div className="doc-section-title">Recent Updates</div>
            <span className="doc-toggle">{activityOpen ? 'Hide ›' : 'Show ›'}</span>
          </button>
          {activityOpen && (
            <div className="activity-list">
              {activity.map((a, i) => (
                <div key={i} className="activity-row">
                  <span className={`act-dot act-dot--${a.type}`} />
                  <span className="act-date">{a.date}</span>
                  <span className="act-label"><strong>{a.label}</strong> {a.detail}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── DRAWERS ── */}
      {drawerDoc && drawerDoc.doc.id === 'd-001' && (
        <COIDrawer
          doc={drawerDoc.doc}
          onClose={() => setDrawerDoc(null)}
          onUpdate={handleDocUpdate}
          showToast={showToast}
        />
      )}
      {drawerDoc && drawerDoc.doc.id === 'd-005' && (
        <W9Drawer
          doc={drawerDoc.doc}
          onClose={() => setDrawerDoc(null)}
          onUpdate={handleDocUpdate}
          showToast={showToast}
        />
      )}
      {drawerDoc && drawerDoc.doc.id !== 'd-001' && drawerDoc.doc.id !== 'd-005' && (
        <GenericDocDrawer
          doc={drawerDoc.doc}
          onClose={() => setDrawerDoc(null)}
          onUpdate={handleDocUpdate}
          showToast={showToast}
        />
      )}
    </>
  );
}

/* ═══════════════ Sub-components ═══════════════ */

function AccountBanner({ state }: { state: AccountState }) {
  if (state === 'active') return null;

  if (state === 'suspended') {
    return (
      <div className="account-banner suspended">
        <div className="account-banner__title">⛔ Account Suspended</div>
        <div className="account-banner__text">
          Your account has been suspended. You cannot receive or accept new jobs. Contact support for assistance.
        </div>
        <div className="account-banner__hint">
          This is a behavioral suspension — only Lookara Admin can lift it.
        </div>
      </div>
    );
  }

  return (
    <div className="account-banner blocked">
      <div className="account-banner__title">⚠ Account on Hold — Compliance Issue</div>
      <div className="account-banner__text">
        You cannot receive new jobs until your documents are renewed and approved.
      </div>
      <div className="account-banner__hint">
        Upload the required documents below to restore eligibility.
      </div>
    </div>
  );
}

function StatusHeader({
  allEligible, coiExpiring, coiDaysLeft, activeTrades, tradeEligible, urgencyCount,
}: {
  allEligible: boolean;
  coiExpiring: boolean;
  coiDaysLeft: number | null;
  activeTrades: string[];
  tradeEligible: (t: string) => boolean;
  urgencyCount: number;
}) {
  let statusClass: 'active' | 'limited' = 'active';
  let statusText = 'Active';
  let mainLine = 'Fully eligible for all jobs';
  let warnLine: string | null = null;

  if (!allEligible) {
    const blocked = activeTrades.filter((t) => !tradeEligible(t));
    statusClass = 'limited';
    statusText = 'At Risk';
    mainLine = `${blocked.join(', ')} jobs paused — missing requirements`;
  } else if (coiExpiring) {
    statusClass = 'limited';
    statusText = 'At Risk';
    mainLine = 'Action required to stay eligible';
    warnLine = `COI expires in ${coiDaysLeft} days — emergency jobs will pause`;
  }

  const scoreSignal = urgencyCount > 0
    ? <span className="sh-count warn">{urgencyCount} item{urgencyCount > 1 ? 's' : ''} need{urgencyCount > 1 ? '' : 's'} attention</span>
    : <span className="sh-count ok">All clear</span>;

  return (
    <div className="status-header">
      <div className="sh-label">Compliance Status &nbsp;·&nbsp; {scoreSignal}</div>
      <div className="sh-top">
        <span className={`sh-dot ${statusClass}`} />
        <div className={`sh-status ${statusClass}`}>{statusText} — {mainLine}</div>
      </div>
      {warnLine && (
        <div className="sh-lines">
          <div className="sh-line warn">⚠ {warnLine}</div>
        </div>
      )}
    </div>
  );
}

function ActionRequired({ docs, onOpen }: { docs: Doc[]; onOpen: (d: Doc) => void }) {
  const hasFailed = docs.some((d) => d.status === 'failed');
  const tone = hasFailed ? 'crimson' : 'amber';

  return (
    <div className="action-block">
      <div className={`action-hdr ${tone}`}>
        <span className="action-hdr__icon">{tone === 'crimson' ? '⛔' : '⚠'}</span>
        <span className="action-hdr__label">Action Required</span>
      </div>
      {docs.map((doc) => {
        const isFailed = doc.status === 'failed';
        return (
          <div key={doc.id} className={`action-card ${isFailed ? 'is-crimson' : 'is-amber'}`}>
            <div className="action-card__icon">{doc.icon}</div>
            <div className="action-card__body">
              <div className="action-card__name">{doc.name}</div>
              <div className={`action-card__expiry ${isFailed ? 'crimson' : 'amber'}`}>
                {isFailed
                  ? `Failed Admin review${doc.rejectedAt ? ` · ${doc.rejectedAt}` : ''} — re-upload required`
                  : `${doc.daysLeft} days left · Expires ${doc.expires} — action required`}
              </div>
              {isFailed && doc.rejectionReason && (
                <div className="action-card__reason">
                  <strong>Reason:</strong> {doc.rejectionReason}
                </div>
              )}
              {doc.impact && (
                <div className={`action-card__impact ${isFailed ? 'crimson' : 'amber'}`}>
                  🚫 {doc.impact}
                </div>
              )}
            </div>
            <button
              className={`doc-btn ${isFailed ? 'urgent' : 'renew'}`}
              onClick={() => onOpen(doc)}
            >
              {isFailed ? 'Re-upload' : 'Renew'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function DocRow({
  doc, context, onOpen,
}: {
  doc: Doc;
  context: 'shared' | string;
  onOpen: () => void;
}) {
  const isUrgent = doc.status === 'failed' || doc.status === 'expiring';

  /* If this doc is already shown in Action Required and it's a trade doc, show slim reference */
  if (isUrgent && context !== 'shared') {
    return (
      <div className="doc-row doc-row--slim">
        <div className="doc-row-icon">{doc.icon}</div>
        <div className="doc-row-body">
          <div className="doc-row-name">{doc.name}</div>
          <div className="doc-row-expiry slate italic">Handled above</div>
        </div>
        <StatusChip status={doc.status} />
      </div>
    );
  }

  const expiryStr = (() => {
    switch (doc.status) {
      case 'valid':    return `Expires ${doc.expires}`;
      case 'expiring': return `Expires ${doc.expires} · ${doc.daysLeft} days left`;
      case 'failed':   return `Failed Admin review${doc.rejectedAt ? ` · ${doc.rejectedAt}` : ''}`;
      case 'missing':  return doc.id === 'd-005'
        ? 'Upload before reaching $600 to avoid payout holds'
        : 'Required — not yet uploaded';
      case 'pending_admin_review': return 'Submitted · Awaiting Admin review';
    }
  })();

  const expColor =
    doc.status === 'valid' ? 'emerald' :
    doc.status === 'expiring' ? 'amber' :
    doc.status === 'failed' ? 'crimson' : 'slate';

  const btnLabel = doc.status === 'missing' ? 'Upload'
    : doc.status === 'failed' ? 'Re-upload'
    : 'View';
  const btnClass = doc.status === 'missing' || doc.status === 'failed' ? 'upload' : 'view';

  const showRenewSoon = doc.status === 'valid' && doc.daysLeft !== null && doc.daysLeft <= EXPIRY_WARNING_DAYS;

  return (
    <div className={`doc-row row-${doc.status}`} onClick={onOpen}>
      <div className="doc-row-icon">{doc.icon}</div>
      <div className="doc-row-body">
        <div className="doc-row-name">{doc.name}</div>
        <div className={`doc-row-expiry ${expColor}`}>{expiryStr}</div>
        {showRenewSoon && (
          <div className="doc-row-renew">Renew soon</div>
        )}
        {doc.status === 'failed' && doc.rejectionReason && (
          <div className="doc-row-rejection">
            <div className="doc-row-rejection__lbl">Reason</div>
            <div className="doc-row-rejection__text">{doc.rejectionReason}</div>
          </div>
        )}
      </div>
      <button
        className={`doc-btn ${btnClass}`}
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
      >
        {btnLabel}
      </button>
    </div>
  );
}

function StatusChip({ status }: { status: DocStatus }) {
  const map: Record<DocStatus, { cls: string; label: string }> = {
    valid:                 { cls: 'chip-valid',    label: 'Valid' },
    expiring:              { cls: 'chip-expiring', label: 'Expiring' },
    failed:                { cls: 'chip-failed',   label: 'Failed' },
    missing:               { cls: 'chip-missing',  label: 'Missing' },
    pending_admin_review:  { cls: 'chip-pending',  label: 'Pending' },
  };
  const { cls, label } = map[status];
  return <span className={`doc-status-chip ${cls}`}>{label}</span>;
}