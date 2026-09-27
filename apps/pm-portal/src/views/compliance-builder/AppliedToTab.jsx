// src/views/compliance-builder/AppliedToTab.jsx
export default function AppliedToTab({ template, onView, onRemove, onApplyMore }) {
  return (
    <div className="ctb-tab-pane">
      <div className="ctb-tab-pane__title" style={{ fontSize: 16 }}>Applied To</div>
      <div className="ctb-tab-pane__sub" style={{ marginBottom: 24 }}>
        Properties currently using this template. Changes to published templates
        propagate to all applied properties.
      </div>

      <div className="ctb-warn-banner">
        ⚠ Editing a published template affects all properties listed below.
        Consider duplicating before making breaking changes.
      </div>

      {template.appliedTo.map((a, i) => (
        <div key={i} className="ctb-applied-row">
          <div>
            <div className="ctb-applied-prop">{a.property}</div>
            <div className="ctb-applied-sub">{a.reqs} active requirements · Applied {a.appliedAt}</div>
          </div>
          <div className="ctb-applied-actions">
            <button className="ctb-btn ctb-btn--outline ctb-btn--sm" onClick={() => onView(a.property)}>
              View
            </button>
            <button className="ctb-btn ctb-btn--danger ctb-btn--sm" onClick={() => onRemove(a.property)}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <button className="ctb-btn ctb-btn--outline ctb-apply-more-btn" onClick={onApplyMore}>
        + Apply to More Properties
      </button>
    </div>
  );
}