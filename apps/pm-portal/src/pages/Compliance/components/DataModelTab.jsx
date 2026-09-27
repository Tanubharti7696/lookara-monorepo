import { TEMPLATE_FIELDS, REQUIREMENT_FIELDS } from '../constants';

function DataModelBox({ title, fields }) {
  return (
    <div className="data-model-box">
      <div className="data-model-title">{title}</div>
      {fields.map(([k, t, d, locked]) => (
        <div className="data-field-row" key={k}>
          <span className="data-field-key">
            {k}
            {locked && <span className="lock-tag">locked</span>}
          </span>
          <span className="data-field-val-wrap">
            <span className="data-field-val">{t}</span>
            <br />
            <span className="data-field-type">{d}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DataModelTab() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Data Model</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
        Every field a developer needs to implement. Locked fields are pre-filled from the template and cannot be changed per-property.
      </div>
      <DataModelBox title="Template Object" fields={TEMPLATE_FIELDS} />
      <DataModelBox title="Requirement Object (nested in template)" fields={REQUIREMENT_FIELDS} />
    </div>
  );
}
