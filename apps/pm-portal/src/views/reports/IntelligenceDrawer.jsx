// src/views/reports/IntelligenceDrawer.jsx
import { useEffect } from 'react';
import { INTELLIGENCE } from '../../data/reports.jsx';

const SEV_META = {
  critical: { color: 'var(--crimson)', label: '● Critical' },
  warning:  { color: 'var(--amber)',   label: '● Attention' },
  good:     { color: 'var(--success)', label: '● Positive Signal' },
};

export default function IntelligenceDrawer({ drawerId, onClose }) {
  useEffect(() => {
    if (!drawerId) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerId, onClose]);

  if (!drawerId) return null;
  const d = INTELLIGENCE[drawerId];
  if (!d) return null;

  const meta = SEV_META[d.sev] || SEV_META.good;

  return (
    <>
      <div className="reports-backdrop open" onClick={onClose} />
      <aside className="reports-drawer open" onClick={(e) => e.stopPropagation()}>
        <div className="reports-drawer__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="reports-drawer__eyebrow" style={{ color: meta.color }}>{meta.label}</div>
            <div className="reports-drawer__title">{d.title}</div>
            <div className="reports-drawer__sub">{d.sub}</div>
          </div>
          <button className="reports-drawer__close" onClick={onClose}>×</button>
        </div>

        <div className="reports-drawer__body">
          <Section label="Plain Language">
            <div className="rd-plain">{d.plain}</div>
          </Section>

          <Section label="Why It Matters">
            <div className="rd-matters">
              {d.matters.map((m, i) => (
                <div key={i} className="rd-matters-item">
                  <span className="rd-matters-icon">{m.icon}</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section label="Impact">
            <div className={`rd-impact rd-impact--${d.impact.cls}`}>
              <div className={`rd-impact__arrow rd-impact__arrow--${d.impact.cls}`}>{d.impact.arrow}</div>
              <div className={`rd-impact__text rd-impact__text--${d.impact.cls}`}>{d.impact.text}</div>
            </div>
          </Section>

          <Section label={`Evidence · ${d.evidence.length} supporting events`}>
            <div className="rd-evidence">
              {d.evidence.map((e, i) => (
                <div key={i} className="rd-evidence-item">
                  <div className={`rd-evidence__dot rd-evidence__dot--${e.sev}`} />
                  <span style={{ flex: 1 }}>{e.text}</span>
                  {e.link && (
                    <span className="rd-hint-wrap">
                      <span className="rd-ev-link" onClick={(ev) => ev.stopPropagation()}>{e.link}</span>
                      <span className="rd-hint-tip">Will open when integrated →</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section label="Recommended Actions">
            <div className="rd-actions">
              {d.actions.map((a, i) => (
                <div key={i} className="rd-action-item">
                  <span className="rd-action-check">✓</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="reports-drawer__foot">
          {d.deepLink && (
            <span className="rd-hint-wrap" style={{ flex: 1 }}>
              <button
                className="rd-btn rd-btn--gold"
                onClick={() => { /* deep link — will open when integrated */ }}
              >
                {d.deepLink.label}
              </button>
              <span className="rd-hint-tip">Will open when integrated →</span>
            </span>
          )}
          <button className="rd-btn" onClick={onClose}>Close</button>
        </div>
      </aside>
    </>
  );
}

function Section({ label, children }) {
  return (
    <div className="rd-section">
      <div className="rd-section-label">{label}</div>
      {children}
    </div>
  );
}