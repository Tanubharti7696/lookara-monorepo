// src/views/compliance/BulkActionBar.jsx

export default function BulkActionBar({ count, onClear, onAction }) {
  if (count === 0) return null;

  return (
    <div className="cmp-bulk">
      <div className="cmp-bulk__count">
        <strong>{count}</strong> selected
      </div>
      <div className="cmp-bulk__actions">
        <button className="lk-btn lk-btn--primary"   onClick={() => onAction('dispatch')}>📌 Dispatch All</button>
        <button className="lk-btn lk-btn--secondary" onClick={() => onAction('assign')}>👤 Assign To…</button>
        <button className="lk-btn lk-btn--secondary" onClick={() => onAction('snooze')}>⏱ Snooze 7d</button>
        <button className="lk-btn lk-btn--secondary" onClick={() => onAction('waive')}>⛔ Waive</button>
        <button className="lk-btn lk-btn--ghost"     onClick={() => onAction('export')}>📤 Export CSV</button>
      </div>
      <button className="cmp-bulk__clear" onClick={onClear} type="button" aria-label="Clear selection">
        ✕
      </button>
    </div>
  );
}