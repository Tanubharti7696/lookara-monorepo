import { createContext, useCallback, useContext, useState } from 'react';

/* ── Toast ── */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

const TOAST_COLORS = {
  info: 'var(--charcoal-lighter, #1B1F26)',
  success: 'var(--success, #22C55E)',
  amber: 'var(--amber, #F59E0B)',
  crimson: 'var(--crimson, #DC2626)',
  error: 'var(--crimson, #DC2626)',
};

export function ToastProvider({ children, onExternalToast }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    if (onExternalToast) {
      onExternalToast(message, type);
    }
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, [onExternalToast]);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{ background: TOAST_COLORS[t.type] || TOAST_COLORS.info }}>
          {t.message}
        </div>
      ))}
    </ToastCtx.Provider>
  );
}

/* ── Toggle ── */
export function Toggle({ active, onToggle, locked = false, style }) {
  return (
    <div
      className={`toggle${active ? ' active' : ''}`}
      onClick={locked ? undefined : onToggle}
      style={{ ...(locked ? { opacity: 0.5, cursor: 'not-allowed' } : null), ...style }}
    />
  );
}

/* ── Card ── */
export function Card({ children, style, className = '', onClick }) {
  return <div className={`card ${className}`} style={style} onClick={onClick}>{children}</div>;
}

/* ── Section header row (title left, muted note right) ── */
export function CardHeader({ title, note, right, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3, 12px)' }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
      {right || (note && <div style={{ fontSize: 14, color: 'var(--white-muted, rgba(255,255,255,0.7))' }}>{note}</div>)}
      {children}
    </div>
  );
}

/* ── Labeled field ── */
export function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted, rgba(255,255,255,0.7))', marginBottom: 'var(--space-2, 8px)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Simple table shell ── */
export const thStyle = {
  textAlign: 'left',
  padding: 'var(--space-2, 8px)',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--white-muted, rgba(255,255,255,0.7))',
  textTransform: 'uppercase',
};

export const tdStyle = { padding: 'var(--space-2, 8px)', fontSize: 14 };
