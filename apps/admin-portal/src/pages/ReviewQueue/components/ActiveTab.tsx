// src/pages/ReviewQueue/components/ActiveTab.tsx
import { useState, useMemo } from 'react';
import type { DisputeItem, FlagItem, ComplianceItem } from './data';
import type { DrawerState } from '../ReviewQueue';
import type { ModalState } from './DecisionModals';

type Props = {
  disputes: DisputeItem[];
  flags: FlagItem[];
  compliance: ComplianceItem[];
  onOpenModal: (m: ModalState) => void;
  onOpenDrawer: (d: DrawerState) => void;
};

export default function ActiveTab({ disputes, flags, compliance, onOpenModal, onOpenDrawer }: Props) {
  const [q, setQ] = useState('');
  const [priority, setPriority] = useState('all');
  const [section, setSection] = useState('all');

  const matches = (text: string, p: string, _sec: string, itemSection: string) => {
    if (priority !== 'all' && priority !== p) return false;
    if (section !== 'all' && section !== itemSection) return false;
    if (q && !text.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  };

  const filteredDisputes = useMemo(
    () => disputes.filter((d) => matches(d.title + d.subtitle + d.evidence, d.priority, section === 'dispute' || section === 'all' ? 'all' : section, 'dispute')),
    [disputes, q, priority, section],
  );
  const filteredFlags = useMemo(
    () => flags.filter((f) => matches(f.vendor + f.service + f.evidence, f.priority, section === 'flag' || section === 'all' ? 'all' : section, 'flag')),
    [flags, q, priority, section],
  );
  const filteredCompliance = useMemo(
    () => compliance.filter((c) => matches(c.title + c.subtitle + c.docType, c.priority, section === 'compliance' || section === 'all' ? 'all' : section, 'compliance')),
    [compliance, q, priority, section],
  );

  const showSection = (s: string) => section === 'all' || section === s;

  return (
    <>
      {/* Filters */}
      <div className="rq-filters">
        <input
          className="rq-search"
          placeholder="Search dispute, vendor, PM, document, organization…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="rq-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">⚪ Low</option>
        </select>
        <select className="rq-select" value={section} onChange={(e) => setSection(e.target.value)}>
          <option value="all">All Sections</option>
          <option value="dispute">Disputes</option>
          <option value="flag">Flagged Vendors</option>
          <option value="compliance">Compliance</option>
        </select>
        <button
          className="rq-clear"
          onClick={() => { setQ(''); setPriority('all'); setSection('all'); }}
        >
          Clear all
        </button>
      </div>

      {/* ── SECTION 1: DISPUTES ── */}
      {showSection('dispute') && (
        <div className="rq-section">
          <div className="rq-section__head">
            <h3 className="rq-section__title">Disputes</h3>
            <div className="rq-section__meta">
              <span className="rq-count">{filteredDisputes.length} open</span>
            </div>
          </div>

          {filteredDisputes.length === 0 ? (
            <div className="rq-empty">No open disputes</div>
          ) : (
            filteredDisputes.map((d) => (
              <div key={d.id} className="rq-item">
                <div className="rq-item__header">
                  <div>
                    <div className="rq-item__title">{d.title}</div>
                    <div className="rq-item__subtitle">{d.subtitle}</div>
                  </div>
                  <span className={`rq-chip is-${d.chip.tone}`}>{d.chip.text}</span>
                </div>

                <div className="rq-strip">
                  <div className="rq-sla">
                    <span className={`rq-sla__timer is-${d.slaTimer.tone}`}>{d.slaTimer.text}</span>
                    <span className="rq-sla__label">{d.slaTimer.label}</span>
                  </div>
                  <span className="rq-escalation">{d.escalationNote}</span>
                </div>

                <div className="rq-facts">
                  {d.facts.map(([k, v, danger]) => (
                    <FactRow key={k} label={k} value={v} danger={!!danger} />
                  ))}
                </div>

                <div className="rq-evidence">
                  <div className="rq-evidence__label">Evidence on file</div>
                  {d.evidence}
                </div>

                <div className="rq-impact">
                  <span className="rq-impact__prefix">Outcome:</span>&nbsp;
                  {d.impact}
                </div>

                <div className="rq-actions">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="rq-btn--pm" onClick={() => onOpenModal({ type: 'resolve', disputeId: d.id, party: 'PM' })}>
                        Support PM Position
                      </button>
                      <button className="rq-btn--vendor" onClick={() => onOpenModal({ type: 'resolve', disputeId: d.id, party: 'Vendor' })}>
                        Support Vendor Position
                      </button>
                    </div>
                    <button className="rq-btn--request" onClick={() => window.dispatchEvent(new CustomEvent('toast', { detail: 'Additional evidence requested · PM and Vendor notified.' }))}>
                      Request Additional Evidence
                    </button>
                  </div>
                  <div className="rq-divider" />
                  <button className="rq-btn--tertiary" onClick={() => onOpenDrawer({ type: 'evidence', dispute: d })}>
                    View full evidence →
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
                  Resolution based on available evidence
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── SECTION 2: FLAGS ── */}
      {showSection('flag') && (
        <div className="rq-section">
          <div className="rq-section__head">
            <h3 className="rq-section__title">Flagged Vendors</h3>
            <div className="rq-section__meta">
              {flags.some((f) => f.slaTimer.tone === 'breach') && (
                <span className="rq-count rq-count--red">1 SLA breached</span>
              )}
              <span className="rq-count">{filteredFlags.length} active</span>
            </div>
          </div>

          {filteredFlags.length === 0 ? (
            <div className="rq-empty">No flagged vendors</div>
          ) : (
            filteredFlags.map((f) => (
              <div key={f.id} className={`rq-item ${f.escalated ? 'is-escalated' : ''}`}>
                <div className="rq-item__header">
                  <div>
                    <div className="rq-item__title">{f.vendor}</div>
                    <div className="rq-item__subtitle">
                      {f.service} · <span className={`rq-vendor-badge is-${f.statusBadge}`}>
                        {f.statusBadge.charAt(0).toUpperCase() + f.statusBadge.slice(1)}
                      </span>
                    </div>
                  </div>
                  <span className={`rq-chip is-${f.chip.tone}`}>{f.chip.text}</span>
                </div>

                <div className="rq-strip">
                  <span className={`rq-syscheck is-${f.systemCheck.state}`}>{f.systemCheck.text}</span>
                  <div className="rq-sla">
                    <span className={`rq-sla__timer is-${f.slaTimer.tone}`}>{f.slaTimer.text}</span>
                  </div>
                  {f.escalated && <span className="rq-escalation is-danger">Escalated</span>}
                </div>

                <div className="rq-facts">
                  {f.facts.map(([k, v, danger]) => (
                    <FactRow key={k} label={k} value={v} danger={!!danger} />
                  ))}
                </div>

                <div className="rq-evidence">
                  <div className="rq-evidence__label">Context</div>
                  {f.evidence}
                </div>

                {f.recommendation && <div className="rq-rec">{f.recommendation}</div>}

                <div className="rq-actions">
                  <button className="rq-btn rq-btn--red" onClick={() => onOpenModal({ type: 'suspend', vendor: f.vendor })}>
                    Suspend Vendor
                  </button>
                  <button className="rq-btn rq-btn--sec-yellow" onClick={() => onOpenModal({ type: 'warn', vendor: f.vendor })}>
                    Issue Warning
                  </button>
                  <div className="rq-divider" />
                  <button className="rq-btn--tertiary" onClick={() => onOpenModal({ type: 'dismiss', vendor: f.vendor })}>
                    Dismiss flag
                  </button>
                  <button className="rq-btn--tertiary" onClick={() => onOpenDrawer({ type: 'flag', drawerKey: f.drawerKey })}>
                    View flag record →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── SECTION 3: COMPLIANCE ── */}
      {showSection('compliance') && (
        <div className="rq-section">
          <div className="rq-section__head">
            <h3 className="rq-section__title">Compliance Reviews</h3>
            <div className="rq-section__meta">
              <span className="rq-count">{filteredCompliance.length} pending</span>
            </div>
          </div>

          {filteredCompliance.length === 0 ? (
            <div className="rq-empty">No pending compliance reviews</div>
          ) : (
            filteredCompliance.map((c) => (
              <div key={c.id} className={`rq-item ${c.escalated ? 'is-escalated' : ''}`}>
                <div className="rq-item__header">
                  <div>
                    <div className="rq-item__title">{c.title}</div>
                    <div className="rq-item__subtitle">
                      {c.subtitle} · <span className={`rq-vendor-badge is-${c.vendorStatus}`}>
                        {c.vendorStatus.charAt(0).toUpperCase() + c.vendorStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <span className={`rq-chip is-${c.chip.tone}`}>{c.chip.text}</span>
                </div>

                <div className="rq-strip">
                  {c.systemValidation && (
                    <div className={`rq-validation is-${c.systemValidation.state}`}>
                      <span className="rq-validation__label">System Validation</span>
                      <span className="rq-validation__value">
                        {c.systemValidation.state === 'passed' ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </div>
                  )}
                  {c.systemCheck && (
                    <span className={`rq-syscheck is-${c.systemCheck.state}`}>{c.systemCheck.text}</span>
                  )}
                  <div className="rq-sla">
                    <span className={`rq-sla__timer is-${c.slaTimer.tone}`}>{c.slaTimer.text}</span>
                    {c.slaTimer.label && <span className="rq-sla__label">{c.slaTimer.label}</span>}
                  </div>
                  {c.escalationNote && (
                    <span className={`rq-escalation ${c.escalated ? 'is-danger' : ''}`}>{c.escalationNote}</span>
                  )}
                </div>

                <div className="rq-facts">
                  {c.facts.map(([k, v, danger]) => (
                    <FactRow key={k} label={k} value={v} danger={!!danger} />
                  ))}
                </div>

                <div className="rq-impact">{c.impact}</div>

                <div className="rq-actions">
                  {c.actions.includes('approve') && (
                    <button className="rq-btn rq-btn--green" onClick={() => onOpenModal({ type: 'quickApprove', title: c.title })}>
                      ✓ Approve
                    </button>
                  )}
                  {c.actions.includes('reject') && (
                    <button className="rq-btn rq-btn--sec-red" onClick={() => onOpenModal({ type: 'reject', docType: c.docType, vendor: c.vendorName, itemId: c.id })}>
                      {c.id === 'license-chris' ? 'Request New Upload' : 'Reject'}
                    </button>
                  )}
                  <div className="rq-divider" />
                  {c.actions.includes('view') && (
                    <button className="rq-btn--tertiary" onClick={() => onOpenModal({ type: 'docViewer', docType: c.docType, vendorName: c.vendorName, filename: c.docFilename })}>
                      View {c.docType === 'Background Check' ? 'Report' : 'Document'} →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

function FactRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <>
      <span className="rq-fact-label">{label}</span>
      <span className={`rq-fact-value ${danger ? 'is-danger' : ''}`}>{value}</span>
    </>
  );
}