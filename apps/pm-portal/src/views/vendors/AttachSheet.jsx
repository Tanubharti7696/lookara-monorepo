// src/views/vendors/AttachSheet.jsx
import { useState, useEffect } from 'react';
import { VD, PROPERTIES } from '../../data/vendors';

export default function AttachSheet({ vendorId, vendorName, vendorTrade, selectedProperty, onClose, onConfirm, onToast }) {
  const [role, setRole] = useState('Property Coverage');
  const [priority, setPriority] = useState('Preferred');
  const [autopilot, setAutopilot] = useState(true);

  useEffect(() => {
    setRole('Property Coverage');
    setPriority('Preferred');
    setAutopilot(true);
  }, [vendorId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const v = VD[vendorId] || {};
  const propRec = PROPERTIES.find(p => p.name === selectedProperty);
  const noProp = !selectedProperty;

  const handleConfirm = () => {
    if (noProp) { onToast('Please select a property first', 'error'); return; }
    onConfirm({
      vendorId, vendorName, vendorTrade,
      property: selectedProperty,
      role, priority, autopilot,
    });
  };

  return (
    <>
      <div className="vs-backdrop open" onClick={onClose} />
      <div className="vs-sheet open vs-sheet--narrow" onClick={e => e.stopPropagation()}>
        <div className="vs-handle" />
        <button className="vs-close" onClick={onClose}>×</button>

        <div className="vs-simple-header">
          <div className="vs-simple-title">Attach to This Property</div>
          <div className="vs-simple-sub">
            {vendorName}{vendorTrade ? ` · ${vendorTrade}` : ''}{v.resp ? ` · ${v.resp}` : ''}
          </div>
        </div>

        <div className="vs-body">
          <div className="vs-info-box">
            📍 {propRec
              ? <><strong style={{ color: 'var(--text)' }}>{propRec.address}, {propRec.cityState}</strong> — Vendor will be assigned to this property</>
              : <strong style={{ color: 'var(--crimson)' }}>⚠ No property selected — pick one from the Directory first</strong>}
          </div>

          <div className="vs-section-title">Coverage Role</div>
          <div className="vs-choice-chips">
            {['Property Coverage', 'Emergency Backup', 'Preferred Vendor', 'Autodispatch Only'].map(r => (
              <button
                key={r}
                type="button"
                className={`vs-choice-chip ${role === r ? 'selected' : ''}`}
                onClick={() => setRole(r)}
              >
                <span className="vs-radio-dot" />
                {r}
              </button>
            ))}
          </div>

          <div className="vs-section-title">Priority Level</div>
          <div className="vs-choice-chips">
            {['Preferred', 'Backup', 'Emergency Only', 'Under Observation'].map(p => (
              <button
                key={p}
                type="button"
                className={`vs-choice-chip ${priority === p ? 'selected' : ''}`}
                onClick={() => setPriority(p)}
              >
                <span className="vs-radio-dot" />
                {p}
              </button>
            ))}
          </div>

          <div className="vs-autopilot-row">
            <div>
              <div className="vs-autopilot-title">Autodispatch</div>
              <div className="vs-autopilot-sub">Include in automated routing</div>
            </div>
            <label className="vs-autopilot-toggle">
              <input type="checkbox" checked={autopilot} onChange={e => setAutopilot(e.target.checked)} />
              <div className="vs-ap-track" />
              <div className="vs-ap-thumb" />
            </label>
          </div>
        </div>

        <div className="vs-footer">
          <button className="vs-dispatch-btn" onClick={handleConfirm} disabled={noProp}>
            Attach to Property
          </button>
        </div>
      </div>
    </>
  );
}