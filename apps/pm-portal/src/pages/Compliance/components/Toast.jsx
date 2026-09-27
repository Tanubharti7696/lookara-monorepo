const COLORS = {
  info: 'var(--info)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
};

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div id="toast" key={toast.id} style={{ borderColor: COLORS[toast.type] || COLORS.info }}>
      {toast.message}
    </div>
  );
}
