// src/views/audit/AuditCounters.jsx
export default function AuditCounters({ counts, active, onChange }) {
  const tiles = [
    { key: 'all',       accent: '#A6B0BD', value: counts.all,       label: 'Total Events', sub: 'Last 24 hours' },
    { key: 'critical',  accent: '#DC2626', value: counts.critical,  label: 'Critical',     sub: 'Needs attention' },
    { key: 'attention', accent: '#F59E0B', value: counts.attention, label: 'Attention',    sub: 'Monitor closely' },
  ];

  return (
    <>
      <div className="audit-counters">
        {tiles.map(t => (
          <button
            key={t.key}
            type="button"
            className={`audit-counter ${active === t.key ? 'active' : ''}`}
            style={{ '--accent': t.accent }}
            onClick={() => onChange(t.key)}
          >
            <div className="audit-counter__num">{t.value}</div>
            <div className="audit-counter__body">
              <div className="audit-counter__label">{t.label}</div>
              <div className="audit-counter__sub">{t.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {active !== 'all' && (
        <div className="audit-filter-clear-bar">
          <button type="button" onClick={() => onChange('all')}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>×</span> Clear filter
          </button>
        </div>
      )}
    </>
  );
}