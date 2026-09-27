// src/views/alerts/WhyPanel.jsx
import { useEffect, useState } from 'react';
import { WHY_DATA } from '../../data/signals';

export default function WhyPanel({ whyKey, onClose }) {
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => { setShowRaw(false); }, [whyKey]);

  useEffect(() => {
    if (!whyKey) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [whyKey, onClose]);

  if (!whyKey) return null;
  const d = WHY_DATA[whyKey];
  if (!d) return null;

  return (
    <>
      <div className="why-panel-overlay open" onClick={onClose} />
      <aside className="why-panel open" onClick={(e) => e.stopPropagation()}>
        <div className="why-panel-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="why-panel-signal-title">{d.signalTitle}</div>
            <div className="why-panel-meta">{d.meta}</div>
          </div>
          <button className="why-panel-close" onClick={onClose}>×</button>
        </div>

        <div className="why-trigger-row">Why am I seeing this?</div>

        <div className="why-panel-body">
          <Field label="Trigger"     value={d.trigger} />
          <Field label="Threshold"   value={d.threshold} />
          <Field label="Sources"     value={d.sources} />
          <Field label="Objects"     value={d.objects} mono />
          <Field label="Confidence"  value={d.confidence} />

          <div className="why-automation-section">
            <div className="why-automation-header">Automation Attempts</div>
            {d.attempts.map((a, i) => (
              <div key={i} className="why-attempt">
                <span className="why-attempt-num">{a.num}</span>
                <span className="why-attempt-text">{a.text}</span>
                <span className={`why-attempt-status ${a.status}`}>{a.label}</span>
              </div>
            ))}
          </div>

          <div className="why-raw-section">
            <div className="why-raw-header" onClick={() => setShowRaw(v => !v)}>
              <span>Raw event (for audit)</span>
              <span className="why-raw-toggle">{showRaw ? '▴ Hide' : '▾ Show'}</span>
            </div>
            {showRaw && <pre className="why-raw-body">{d.raw}</pre>}
          </div>
        </div>
      </aside>
    </>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="why-field">
      <span className="why-field-label">{label}</span>
      <span className={`why-field-value ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}