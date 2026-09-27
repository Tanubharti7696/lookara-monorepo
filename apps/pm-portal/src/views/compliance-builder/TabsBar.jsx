// src/views/compliance-builder/TabsBar.jsx
const TABS = [
  { key: 'requirements', label: 'Requirements' },
  { key: 'datamodel',    label: 'Data Model' },
  { key: 'applied',      label: 'Applied To' },
  { key: 'history',      label: 'Change Log' },
];

export default function TabsBar({ active, onChange, reqCount }) {
  return (
    <div className="ctb-tabs">
      {TABS.map(t => (
        <button
          key={t.key}
          type="button"
          className={`ctb-tab ${active === t.key ? 'active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
          {t.key === 'requirements' && (
            <span className="ctb-tab__badge">{reqCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}