// src/views/vendors/MoreSheet.jsx
import { useEffect } from 'react';

const ACTIONS = [
  { key: 'profile',     icon: '👤', label: 'View Profile' },
  { key: 'attach',      icon: '🏠', label: 'Attach to This Property' },
  { key: 'autodispatch',icon: '⚡', label: 'Enable Autodispatch' },
  { key: 'suspend',     icon: '⏸', label: 'Suspend Vendor' },
  { key: 'compliance',  icon: '📋', label: 'Compliance' },
  { key: 'history',     icon: '📂', label: 'Vendor History' },
  { key: 'emergency',   icon: '🚨', label: 'Emergency Eligibility' },
  { key: 'block',       icon: '⛔', label: 'Block Vendor', danger: true },
];

export default function MoreSheet({ vendorId, vendorName, onClose, onAction }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="vs-backdrop open" onClick={onClose} />
      <div className="vs-sheet open vs-sheet--narrow" onClick={e => e.stopPropagation()}>
        <div className="vs-handle" />
        <button className="vs-close" onClick={onClose}>×</button>

        <div className="vs-simple-header">
          <div className="vs-simple-title">{vendorName}</div>
        </div>

        <div className="vs-body" style={{ padding: '8px 20px 20px' }}>
          {ACTIONS.map(a => (
            <div
              key={a.key}
              className={`vs-more-action ${a.danger ? 'danger' : ''}`}
              onClick={() => onAction(a.key, vendorId)}
            >
              <span className="vs-more-icon">{a.icon}</span>
              {a.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}