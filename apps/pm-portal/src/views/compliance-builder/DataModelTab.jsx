// src/views/compliance-builder/DataModelTab.jsx
import { TEMPLATE_FIELDS, REQUIREMENT_FIELDS } from '../../data/complianceTemplates';

export default function DataModelTab() {
  return (
    <div className="ctb-tab-pane">
      <div className="ctb-tab-pane__title" style={{ fontSize: 16 }}>Data Model</div>
      <div className="ctb-tab-pane__sub" style={{ marginBottom: 24 }}>
        Every field a developer needs to implement. Locked fields are pre-filled
        from the template and cannot be changed per-property.
      </div>

      <div className="ctb-data-box">
        <div className="ctb-data-title">Template Object</div>
        {TEMPLATE_FIELDS.map(([k, t, d]) => (
          <DataRow key={k} k={k} t={t} d={d} />
        ))}
      </div>

      <div className="ctb-data-box">
        <div className="ctb-data-title">Requirement Object (nested in template)</div>
        {REQUIREMENT_FIELDS.map(([k, t, d, locked]) => (
          <DataRow key={k} k={k} t={t} d={d} locked={locked} />
        ))}
      </div>
    </div>
  );
}

function DataRow({ k, t, d, locked }) {
  return (
    <div className="ctb-data-row">
      <span className="ctb-data-key">
        {k}
        {locked && <span className="ctb-data-locked">locked</span>}
      </span>
      <span className="ctb-data-right">
        <span className="ctb-data-val">{t}</span>
        <br />
        <span className="ctb-data-type">{d}</span>
      </span>
    </div>
  );
}