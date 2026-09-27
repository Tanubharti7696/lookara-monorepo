// src/views/audit/AuditDrawer.jsx
import { useState, useEffect } from 'react';
import { EVENTS, SEV_META } from '../../data/audit';
import { exportEventPDF } from './auditExport';

export default function AuditDrawer({ eventId, onClose, onToast }) {
  const [techOpen, setTechOpen] = useState(false);

  useEffect(() => { setTechOpen(false); }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [eventId, onClose]);

  if (!eventId) return null;

  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev) return null;

  const meta = SEV_META[ev.sev] || SEV_META.info;

  const copyHash = () => {
    navigator.clipboard?.writeText(ev.tech.hash).catch(() => {});
    onToast?.('Hash copied', 'success');
  };

  return (
    <>
      <div className="audit-backdrop open" onClick={onClose} />
      <aside className="audit-drawer open" onClick={(e) => e.stopPropagation()}>
        <div className="audit-drawer__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="audit-drawer__eyebrow" style={{ color: meta.color }}>{meta.label}</div>
            <div className="audit-drawer__title">{ev.title}</div>
            <div className="audit-drawer__sub">{ev.prop} · {ev.age}</div>
          </div>
          <button className="audit-drawer__close" onClick={onClose}>×</button>
        </div>

        <div className="audit-drawer__body">
          <p className="audit-drawer__headline">{ev.headline}</p>

          {ev.fields?.length > 0 && (
            <div className="audit-drawer__story-grid">
              {ev.fields.map((f, i) => (
                <div key={i} className="audit-drawer__story-cell">
                  <div className="audit-drawer__story-key">{f.label}</div>
                  <div className={`audit-drawer__story-val ${f.flag ? `audit-drawer__story-val--${f.flag}` : ''}`}>
                    {f.val}
                  </div>
                </div>
              ))}
            </div>
          )}

          {ev.links?.length > 0 && (
            <div className="audit-drawer__links">
              {ev.links.map((l, i) => (
                <span key={i} className="audit-drawer__hint-wrap">
                  <button
                    type="button"
                    className="audit-drawer__deep-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {l.label}
                  </button>
                  <span className="audit-drawer__hint-tip">Will open when integrated →</span>
                </span>
              ))}
            </div>
          )}

          <div className="audit-drawer__section-label">Timeline</div>
          <div className="audit-drawer__timeline">
            {ev.timeline?.map((t, i) => (
              <div key={i} className="audit-drawer__tl-item">
                <div className={`audit-drawer__tl-dot audit-drawer__tl-dot--${t.sev}`} />
                <div>
                  <div className="audit-drawer__tl-action">{t.action}</div>
                  <div className="audit-drawer__tl-meta">{t.meta}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="audit-drawer__tech-toggle"
            onClick={() => setTechOpen(v => !v)}
          >
            Technical Details <span>{techOpen ? '▾ Hide' : '▸ Show'}</span>
          </div>
          {techOpen && (
            <div className="audit-drawer__tech-body">
              <TechRow label="Event ID" value={ev.id} />
              <TechRow label="Actor"    value={ev.tech.actor} />
              <TechRow label="Action"   value={ev.tech.action} />
              <TechRow label="Object"   value={ev.tech.object} />
              <TechRow label="Domain"   value={ev.tech.domain} />
              <TechRow label="Result"   value={ev.tech.result} />
              <div className="audit-drawer__tech-row">
                <span className="audit-drawer__tech-label">Ledger Hash</span>
                <span className="audit-drawer__tech-val">
                  <span className="audit-drawer__hash-mono">{ev.tech.hash}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="audit-drawer__foot">
          <button className="audit-drawer__btn" onClick={() => exportEventPDF(ev, onToast)}>
            ⬇ Export Event
          </button>
          <button className="audit-drawer__btn" onClick={copyHash}>
            Copy Hash
          </button>
        </div>
      </aside>
    </>
  );
}

function TechRow({ label, value }) {
  return (
    <div className="audit-drawer__tech-row">
      <span className="audit-drawer__tech-label">{label}</span>
      <span className="audit-drawer__tech-val">{value}</span>
    </div>
  );
}