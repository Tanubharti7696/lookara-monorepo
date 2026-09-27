// src/views/compliance-builder/LeftPanel.jsx
import { PROP_TYPE_OPTIONS, CYCLE_OPTIONS } from '../../data/complianceTemplates';

export default function LeftPanel({ template, onChange, onPublish, onSaveDraft, onDelete }) {
  const set = (patch) => onChange(patch);
  const setBehavior = (key, val) => onChange({ behavior: { ...template.behavior, [key]: val } });

  return (
    <aside className="ctb-left">
      <div className="ctb-left__head">
        <div className="ctb-left__logo">Lookara PM</div>
        <div className="ctb-left__head-row">
          <div>
            <div className="ctb-left__title">{template.name || 'Untitled Template'}</div>
            <div className="ctb-left__sub">Compliance Template</div>
          </div>
          <span className={`ctb-status ctb-status--${template.status}`}>
            {template.status === 'active' ? 'Active' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="ctb-left__body">
        <div className="ctb-section-title">Template Identity</div>

        <Field label="Template Name" required>
          <input
            className="ctb-input"
            type="text"
            value={template.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. NYC STR Compliance"
          />
        </Field>

        <Field label="Jurisdiction" required hint="The regulatory body or location this template applies to">
          <input
            className="ctb-input"
            type="text"
            value={template.jurisdiction}
            onChange={(e) => set({ jurisdiction: e.target.value })}
            placeholder="e.g. New York City, Orange County"
          />
        </Field>

        <Field label="Property Type">
          <select
            className="ctb-input"
            value={template.propertyType}
            onChange={(e) => set({ propertyType: e.target.value })}
          >
            {PROP_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>

        <Field label="Default Renewal Cycle" hint="Applied to requirements that don't specify their own cycle">
          <select
            className="ctb-input"
            value={template.cycle}
            onChange={(e) => set({ cycle: e.target.value })}
          >
            {CYCLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            className="ctb-input ctb-input--textarea"
            value={template.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="What does this template cover? Who should apply it?"
          />
        </Field>

        <div className="ctb-divider" />

        <div className="ctb-section-title">Behaviour</div>

        <ToggleRow
          label="Auto-remind PM"
          sub="30 days before each due date"
          checked={template.behavior.autoRemind}
          onChange={(v) => setBehavior('autoRemind', v)}
        />
        <ToggleRow
          label="Block ops if overdue"
          sub="Flags property as non-operational"
          checked={template.behavior.blockOps}
          onChange={(v) => setBehavior('blockOps', v)}
        />
        <ToggleRow
          label="Require inspection for all"
          sub="Override per-requirement setting"
          checked={template.behavior.requireInspectionAll}
          onChange={(v) => setBehavior('requireInspectionAll', v)}
        />
        <ToggleRow
          label="Notify owner on overdue"
          sub="Sends alert to Owner Portal"
          checked={template.behavior.notifyOwner}
          onChange={(v) => setBehavior('notifyOwner', v)}
        />
      </div>

      <div className="ctb-left__actions">
        <button className="ctb-btn ctb-btn--primary" onClick={onPublish}>
          ✓ Publish Template
        </button>
        <button className="ctb-btn ctb-btn--outline" onClick={onSaveDraft}>
          Save Draft
        </button>
        <button className="ctb-btn ctb-btn--danger ctb-btn--sm" onClick={onDelete}>
          Delete Template
        </button>
      </div>
    </aside>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="ctb-field">
      <div className="ctb-field__label">
        {label}
        {required && <span className="ctb-required">*</span>}
      </div>
      {children}
      {hint && <div className="ctb-field__hint">{hint}</div>}
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div className="ctb-toggle-row">
      <div>
        <div className="ctb-toggle-label">{label}</div>
        <div className="ctb-toggle-sub">{sub}</div>
      </div>
      <label className="ctb-toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="ctb-toggle__slider" />
      </label>
    </div>
  );
}