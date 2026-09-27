// src/pages/ReviewQueue/components/FlagDrawer.tsx
import { FLAG_DRAWER_DATA } from './data';
import type { ModalState } from './DecisionModals';

type Props = {
  drawerKey: 'jake' | 'david';
  onClose: () => void;
  onOpenModal: (m: ModalState) => void;
};

export default function FlagDrawer({ drawerKey, onClose, onOpenModal }: Props) {
  const d = FLAG_DRAWER_DATA[drawerKey];
  if (!d) return null;

  const vendorName = d.title.replace('Flag Record — ', '');

  return (
    <>
      <div className="rq-drawer-overlay" onClick={onClose} />
      <aside className="rq-drawer">
        <header className="rq-drawer__head">
          <div>
            <div className="rq-drawer__title">{d.title}</div>
            <div className="rq-drawer__meta">{d.meta}</div>
          </div>
          <button className="rq-drawer__close" onClick={onClose}>✕</button>
        </header>

        <div className="rq-readiness">
          <div>
            <div className="rq-readiness__label" style={{ color: d.statusColor }}>{d.statusLabel}</div>
            <div className="rq-readiness__detail">{d.statusDetail}</div>
          </div>
        </div>

        <div className="rq-drawer__body">
          <div className="rq-flag-section-title">Flag History ({d.flags.length})</div>

          {d.flags.map((f, i) => (
            <div key={i} className="rq-flag-record">
              <div className="rq-flag-record__head">
                <div>
                  <div className="rq-flag-record__title">
                    {f.n} {f.isLatest && <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>Most recent</span>}
                  </div>
                  <div className="rq-flag-record__meta">{f.date}</div>
                </div>
                <span className={`rq-flag-type is-${f.typeChip}`}>
                  {f.typeChip === 'noshow' ? 'No-show' : f.typeChip === 'late' ? 'Late arrival' : 'Quality'}
                </span>
              </div>
              <div className="rq-flag-facts">
                {f.facts.map(([k, v, danger], j) => (
                  <>
                    <span key={`k-${j}`} className="rq-flag-fact-label">{k}</span>
                    <span key={`v-${j}`} className={`rq-flag-fact-value${danger ? ' is-danger' : ''}`}>{v}</span>
                  </>
                ))}
              </div>
              <div className="rq-vendor-response">
                <div className="rq-vendor-response__label">Vendor response</div>
                <div className={`rq-vendor-response__text${(f.response as any)?.none ? ' is-none' : ''}`}>
                  {f.response.text}
                </div>
              </div>
            </div>
          ))}

          <div className="rq-flag-section-title">Vendor History</div>
          <div className="rq-prior-record">
            {d.priorRecord.map(([k, v, none], i) => (
              <div key={i} className="rq-prior-record__row">
                <span className="rq-prior-record__label">{k}</span>
                <span className={`rq-prior-record__value${none ? ' is-none' : ''}`}>{v}</span>
              </div>
            ))}
          </div>

          <div className="rq-flag-section-title">Decision</div>
          <div className="rq-rec-block">
            <div style={{ color: d.recColor, marginBottom: 10, fontSize: 12, fontWeight: 500 }}>
              {d.recommendation}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{d.recDetail}</div>
          </div>
        </div>

        <footer className="rq-drawer__foot">
          <button className="rq-btn rq-btn--red" onClick={() => onOpenModal({ type: 'suspend', vendor: vendorName })}>
            Suspend Vendor
          </button>
          <button className="rq-btn rq-btn--sec-yellow" onClick={() => onOpenModal({ type: 'warn', vendor: vendorName })}>
            Issue Warning
          </button>
          <div className="rq-divider" />
          <button className="rq-btn--tertiary" onClick={() => onOpenModal({ type: 'dismiss', vendor: vendorName })}>
            Dismiss flag
          </button>
          <span className="rq-drawer__note">Decision logged to audit trail</span>
        </footer>
      </aside>
    </>
  );
}