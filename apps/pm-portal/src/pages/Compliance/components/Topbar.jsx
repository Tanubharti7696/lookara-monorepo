export default function Topbar({ name, onPreview, onDuplicate, onToggleLeft, onTogglePreview }) {
  return (
    <div className="topbar">
      <div className="topbar-breadcrumb">
        <button className="btn btn-ghost icon-btn only-below-lg" onClick={onToggleLeft} aria-label="Open settings">☰</button>
        <span>Settings</span>
        <span style={{ color: 'var(--muted)' }}>›</span>
        <span>Compliance Templates</span>
        <span style={{ color: 'var(--muted)' }}>›</span>
        <span className="active">{name || 'Untitled Template'}</span>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost btn-sm only-below-xl" onClick={onTogglePreview} aria-label="Open preview">👁</button>
        <button className="btn btn-ghost btn-sm desktop-only" onClick={onPreview}>
          👁 <span className="btn-label">Preview</span>
        </button>
        <button className="btn btn-outline btn-sm" onClick={onDuplicate}>
          ⎘ <span className="btn-label">Duplicate</span>
        </button>
      </div>
    </div>
  );
}
