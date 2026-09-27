// src/views/compliance/modals/TemplateModal.jsx
import { useState } from 'react';
import { TEMPLATE_PACKS } from '../../../data/compliance';

export default function TemplateModal({ open, onClose, onApply }) {
  const [selected, setSelected] = useState(null);

  if (!open) return null;

  const handleApply = () => {
    if (!selected) return;
    const pack = TEMPLATE_PACKS.find(t => t.id === selected);
    onApply?.(pack);
    setSelected(null);
  };

  const close = () => { setSelected(null); onClose(); };

  return (
    <div className="modal-backdrop open" onClick={close}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div className="modal-title">Apply Compliance Template</div>
          <button className="btn btn-ghost" onClick={close} style={{ fontSize: 16, padding: '2px 6px' }}>✕</button>
        </div>
        <div className="modal-sub">Requirement packs loaded automatically for your properties</div>

        <div>
          {TEMPLATE_PACKS.map(t => (
            <div
              key={t.id}
              className={`tmpl-card ${selected === t.id ? 'active' : ''}`}
              onClick={() => setSelected(t.id)}
            >
              <div className="tmpl-icon">{t.icon}</div>
              <div>
                <div className="tmpl-name">{t.name}</div>
                <div className="tmpl-desc">{t.desc}</div>
                <div className="tmpl-count">{t.count}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline" onClick={close}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!selected}
            style={{ opacity: selected ? 1 : 0.45, cursor: selected ? 'pointer' : 'not-allowed' }}
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
}