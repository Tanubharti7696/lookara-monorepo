// src/components/Modal.jsx
import { useEffect } from 'react';
import './Modal.css';

export default function Modal({ open, onClose, title, sub, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lk-modal-backdrop" onClick={onClose}>
      <div
        className={`lk-modal lk-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="lk-modal__head">
            <div>
              <div className="lk-modal__title">{title}</div>
              {sub && <div className="lk-modal__sub">{sub}</div>}
            </div>
            <button className="lk-modal__close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        )}
        <div className="lk-modal__body">{children}</div>
        {footer && <div className="lk-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}