const TABS = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'datamodel',    label: 'Data Model' },
  { id: 'applied',      label: 'Applied To' },
  { id: 'history',      label: 'Change Log' },
];

export default function TabBar({ active, onChange, reqCount }) {
  return (
    <div className="tab-bar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.id === 'requirements' && <span className="tab-badge">{reqCount}</span>}
        </button>
      ))}
    </div>
  );
}
