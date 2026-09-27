// src/views/compliance-builder/Topbar.jsx
export default function Topbar({ templateName, onPreview, onDuplicate }) {
  return (
    <div className="ctb-topbar">
      <div className="ctb-topbar__breadcrumb">
        <span>Settings</span>
        <span className="ctb-sep">›</span>
        <span>Compliance Templates</span>
        <span className="ctb-sep">›</span>
        <span className="ctb-active">{templateName || 'Untitled Template'}</span>
      </div>
      <div className="ctb-topbar__actions">
        <button className="ctb-btn ctb-btn--ghost ctb-btn--sm" onClick={onPreview}>
          👁 Preview
        </button>
        <button className="ctb-btn ctb-btn--outline ctb-btn--sm" onClick={onDuplicate}>
          ⎘ Duplicate
        </button>
      </div>
    </div>
  );
}