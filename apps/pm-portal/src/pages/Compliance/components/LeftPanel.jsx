function Toggle({ label, sub, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        <div className="toggle-sub">{sub}</div>
      </div>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function LeftPanel({
  isOpen, onClose, template, setTemplate,
  behaviour, setBehaviour,
  onPublish, onSaveDraft, onDelete,
}) {
  const update = (key) => (e) => setTemplate({ ...template, [key]: e.target.value });
  const updateBehaviour = (key) => (v) => setBehaviour({ ...behaviour, [key]: v });

  return (
    <aside className={`left-panel ${isOpen ? 'open' : ''}`}>
      <div className="lp-head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div className="lp-logo">Lookara PM</div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="lp-head-row">
          <div style={{ minWidth: 0 }}>
            <div className="lp-title">{template.name || 'Untitled Template'}</div>
            <div className="lp-sub">Compliance Template</div>
          </div>
          <span className={template.status === 'active' ? 'status-active' : 'status-draft'}>
            {template.status === 'active' ? 'Active' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="lp-body">
        <div className="lp-section-title">Template Identity</div>

        <div className="field">
          <div className="field-label">Template Name <span className="required">*</span></div>
          <input className="f-input" type="text" value={template.name}
            onChange={update('name')} placeholder="e.g. NYC STR Compliance" />
        </div>

        <div className="field">
          <div className="field-label">Jurisdiction <span className="required">*</span></div>
          <input className="f-input" type="text" value={template.jurisdiction}
            onChange={update('jurisdiction')} placeholder="e.g. New York City, Orange County" />
          <div className="field-hint">The regulatory body or location this template applies to</div>
        </div>

        <div className="field">
          <div className="field-label">Property Type</div>
          <select className="f-input" value={template.propType} onChange={update('propType')}>
            <option>Short-Term Rental (STR)</option>
            <option>Long-Term Rental</option>
            <option>Commercial</option>
            <option>Mixed Use</option>
          </select>
        </div>

        <div className="field">
          <div className="field-label">Default Renewal Cycle</div>
          <select className="f-input" value={template.cycle} onChange={update('cycle')}>
            <option>Annual</option>
            <option>Semi-annual</option>
            <option>Quarterly</option>
            <option>Monthly</option>
            <option>One-time</option>
          </select>
          <div className="field-hint">Applied to requirements that don't specify their own cycle</div>
        </div>

        <div className="field">
          <div className="field-label">Description</div>
          <textarea className="f-input" value={template.description}
            onChange={update('description')}
            placeholder="What does this template cover? Who should apply it?" />
        </div>

        <hr className="lp-divider" />
        <div className="lp-section-title">Behaviour</div>

        <Toggle label="Auto-remind PM" sub="30 days before each due date"
          checked={behaviour.autoRemind} onChange={updateBehaviour('autoRemind')} />
        <Toggle label="Block ops if overdue" sub="Flags property as non-operational"
          checked={behaviour.blockOps} onChange={updateBehaviour('blockOps')} />
        <Toggle label="Require inspection for all" sub="Override per-requirement setting"
          checked={behaviour.requireInspection} onChange={updateBehaviour('requireInspection')} />
        <Toggle label="Notify owner on overdue" sub="Sends alert to Owner Portal"
          checked={behaviour.notifyOwner} onChange={updateBehaviour('notifyOwner')} />
      </div>

      <div className="lp-actions">
        <button className="btn btn-primary btn-block" onClick={onPublish}>✓ Publish Template</button>
        <button className="btn btn-outline btn-block" onClick={onSaveDraft}>Save Draft</button>
        <button className="btn btn-danger-outline btn-sm btn-block"
          style={{ marginTop: 4 }} onClick={onDelete}>Delete Template</button>
      </div>
    </aside>
  );
}
