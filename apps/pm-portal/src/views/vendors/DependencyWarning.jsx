// src/views/vendors/DependencyWarning.jsx
export default function DependencyWarning({ vendorName, action, onReviewFirst, onProceed, onCancel }) {
  return (
    <div className="vs-dep-backdrop open" onClick={onCancel}>
      <div className="vs-dep-modal" onClick={e => e.stopPropagation()}>
        <div className="vs-dep-title">⚠ Vendor Dependency Warning</div>
        <div className="vs-dep-box">
          <div className="vs-dep-vname">{vendorName}</div>
          <div className="vs-dep-text">
            Assigned to <strong>12 properties</strong><br />
            7 properties have no backup vendor<br />
            Removing may create coverage gaps
          </div>
        </div>
        <button className="vs-dep-btn vs-dep-btn--review" onClick={onReviewFirst}>Review Coverage First</button>
        <button className="vs-dep-btn vs-dep-btn--proceed" onClick={onProceed}>
          Proceed Anyway
        </button>
        <button className="vs-dep-btn vs-dep-btn--cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}