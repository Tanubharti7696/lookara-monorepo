// src/pages/ReviewQueue/components/EvidenceDrawer.tsx
import { useState } from 'react';
import type { DisputeItem } from './data';
import type { ModalState } from './DecisionModals';

type Props = {
  dispute: DisputeItem;
  onClose: () => void;
  onOpenModal: (m: ModalState) => void;
};

const LIFECYCLE = [
  { tone: 'green',  text: 'Job created & vendor assigned', time: 'Apr 9, 2026 · 11:42 AM · PM' },
  { tone: 'blue',   text: 'Job accepted',                   time: 'Apr 9, 2026 · 12:15 PM · Vendor' },
  { tone: 'green',  text: 'Job marked complete · photos submitted', time: 'Apr 11, 2026 · 4:17 PM · Vendor' },
  { tone: 'red',    text: 'Completion rejected — dispute opened · wrong filter grade', time: 'Apr 12, 2026 · 9:02 AM · PM' },
  { tone: 'yellow', text: 'Dispute position submitted',     time: 'Apr 12, 2026 · 9:15 AM · PM' },
  { tone: 'grey',   text: 'Response pending · SLA expires Apr 14, 2026 · 9:02 AM', time: 'Vendor' },
];

const MESSAGES = [
  { sender: 'PM',     text: 'Please use MERV 13 — owner has allergies',            time: 'Apr 9 · 11:51 AM' },
  { sender: 'Vendor', text: 'Got it, will bring MERV 8 as usual for this property', time: 'Apr 9 · 12:04 PM' },
  { sender: 'PM',     text: 'No — MERV 13 specifically, per spec',                  time: 'Apr 9 · 12:09 PM' },
  { sender: 'Vendor', text: 'Ok',                                                   time: 'Apr 9 · 12:11 PM' },
];

export default function EvidenceDrawer({ dispute, onClose, onOpenModal }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <>
      <div className="rq-drawer-overlay" onClick={onClose} />
      <aside className="rq-drawer">
        <header className="rq-drawer__head">
          <div>
            <div className="rq-drawer__title">Dispute #{dispute.id} — Evidence File</div>
            <div className="rq-drawer__meta">
              Job #4520 · HVAC filter replacement · $280 · PM Linda Torres → Vendor Alex Rivera
            </div>
          </div>
          <button className="rq-drawer__close" onClick={onClose}>✕</button>
        </header>

        <div className="rq-readiness">
          <div>
            <div className="rq-readiness__label is-waiting">Waiting on Vendor · 30h remaining (SLA 48h)</div>
            <div className="rq-readiness__detail">Admin may decide after SLA expires or when both sides submit</div>
          </div>
          <div className="rq-party-status">
            <span className="rq-party-pill is-submitted">PM: Submitted</span>
            <span className="rq-party-pill is-pending">Vendor: Pending (30h)</span>
          </div>
        </div>

        <div className="rq-drawer__body">
          {/* Section 1: System Evidence */}
          <div className="rq-evsec">
            <div className="rq-evsec__head" onClick={() => setCollapsed((c) => ({ ...c, sys: !c.sys }))}>
              <div className="rq-evsec__title">
                System Evidence
                <span className="rq-lock">SYSTEM · IMMUTABLE</span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{collapsed.sys ? '▶' : '▼'}</span>
            </div>
            {!collapsed.sys && (
              <div className="rq-evsec__body">
                <div className="rq-sysev">
                  <div className="rq-sysev__icon">📋</div>
                  <div className="rq-sysev__body">
                    <div className="rq-sysev__label">Original Job Specification</div>
                    <div className="rq-sysev__detail is-gold">Filter type specified: MERV 13 — High-efficiency allergen filter</div>
                    <div className="rq-sysev__detail">Created by PM Linda Torres · Apr 9, 2026 · 11:42 AM · Job #4520</div>
                  </div>
                  <button className="rq-sysev__action">View spec →</button>
                </div>

                <div className="rq-sysev">
                  <div className="rq-sysev__icon">📷</div>
                  <div className="rq-sysev__body">
                    <div className="rq-sysev__label">Task Completion Photos (3)</div>
                    <div className="rq-sysev__detail is-danger">Filter label visible: MERV 8 · Nordic Pure 20×25×1</div>
                    <div className="rq-sysev__detail">Submitted by Alex Rivera · Apr 11, 2026 · 4:17 PM on job completion</div>
                  </div>
                  <button className="rq-sysev__action">View photos →</button>
                </div>

                <div className="rq-sysev">
                  <div className="rq-sysev__icon">💬</div>
                  <div className="rq-sysev__body">
                    <div className="rq-sysev__label">Message Log Excerpt — Job #4520</div>
                    <div className="rq-sysev__detail" style={{ marginBottom: 6 }}>Auto-extracted from job messages · Read-only</div>
                    <div className="rq-msg-excerpt">
                      {MESSAGES.map((m, i) => (
                        <div key={i} className="rq-msg-row">
                          <span className="rq-msg-sender">{m.sender}</span>
                          <span className="rq-msg-text">{m.text}</span>
                          <span className="rq-msg-time">{m.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rq-sysev">
                  <div className="rq-sysev__icon">🕐</div>
                  <div className="rq-sysev__body">
                    <div className="rq-sysev__label">Dispute Lifecycle</div>
                    <div className="rq-mini-tl">
                      {LIFECYCLE.map((l, i) => (
                        <div key={i} className="rq-mini-tl__item">
                          <div className={`rq-tl-dot is-${l.tone}`} />
                          <div className="rq-tl-text">
                            {l.text}
                            <span className="rq-tl-time">{l.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rq-sysev">
                  <div className="rq-sysev__icon">⚙</div>
                  <div className="rq-sysev__body">
                    <div className="rq-sysev__label">Vendor Activity</div>
                    <div className="rq-sysev__detail">
                      Job accepted · Job marked complete · Completion photos uploaded · Dispute notification received (Apr 12 · 9:05 AM)
                    </div>
                    <div className="rq-sysev__detail is-danger" style={{ marginTop: 4 }}>
                      No dispute response submitted as of Apr 13 · 3:00 PM
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: PM Position */}
          <div className="rq-position">
            <div className="rq-position__head">
              <div className="rq-position__title">PM Position — Linda Torres</div>
              <span className="rq-party-pill is-submitted">PM: Submitted</span>
            </div>
            <div className="rq-position__body">
              <div className="rq-position__claim">
                Spec required MERV 13. Vendor installed MERV 8 without notice. Work does not meet requirement.
              </div>
              <button className="rq-attach__btn" style={{ fontSize: 12, marginBottom: 10 }}>
                View full statement →
              </button>
              <div className="rq-attach-label">Attachments (2 of 3 max)</div>
              <div className="rq-attach">
                <span>📄</span>
                <span className="rq-attach__name">job-4520-specification.pdf</span>
                <span className="rq-attach__size">142 KB</span>
                <button className="rq-attach__btn">View</button>
              </div>
              <div className="rq-attach">
                <span>📷</span>
                <span className="rq-attach__name">filter-closeup-merv8-label.jpg</span>
                <span className="rq-attach__size">2.1 MB</span>
                <button className="rq-attach__btn">View</button>
              </div>
            </div>
          </div>

          {/* Section 3: Vendor Position */}
          <div className="rq-position">
            <div className="rq-position__head">
              <div className="rq-position__title">Vendor Position — Alex Rivera</div>
              <span className="rq-party-pill is-pending">Vendor: Pending (30h)</span>
            </div>
            <div className="rq-position__body">
              <div className="rq-pending-pos">
                <div className="rq-pending-pos__label">No response · 30h remaining (SLA)</div>
                <div className="rq-pending-pos__detail">
                  Deadline: Apr 14, 2026 · 9:02 AM<br />
                  Admin may decide on available evidence if no response by deadline.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Resolution Decision */}
          <div className="rq-position">
            <div className="rq-position__head">
              <div className="rq-position__title">Resolution Decision</div>
            </div>
            <div className="rq-position__body" style={{ paddingTop: 12 }}>
              <div className="rq-evidence" style={{ marginBottom: 14 }}>
                <div className="rq-evidence__label">Outcome if selected</div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <span><span style={{ color: 'rgba(255,255,255,0.35)' }}>PM →</span> refund recommended</span>
                  <span><span style={{ color: 'rgba(255,255,255,0.35)' }}>Vendor →</span> $280 supported</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <button className="rq-btn--pm" onClick={() => onOpenModal({ type: 'resolve', disputeId: dispute.id, party: 'PM' })}>
                  Support PM Position
                </button>
                <button className="rq-btn--vendor" onClick={() => onOpenModal({ type: 'resolve', disputeId: dispute.id, party: 'Vendor' })}>
                  Support Vendor Position
                </button>
              </div>
              <button className="rq-btn--request">Request Additional Evidence</button>
            </div>
          </div>
        </div>

        <div style={{
          padding: '10px 24px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          lineHeight: 1.6,
          background: 'var(--charcoal)',
        }}>
          Resolution based on available evidence · Lookara facilitates resolution based on provided information.
          Final responsibility remains between parties.
        </div>

        <footer className="rq-drawer__foot">
          <span className="rq-drawer__note">Decision logged to audit trail · No in-platform appeal</span>
        </footer>
      </aside>
    </>
  );
}