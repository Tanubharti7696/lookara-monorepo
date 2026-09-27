// src/views/properties/PropertyRow.jsx
export default function PropertyRow({ property: p, onClick }) {
  return (
    <div className="prow" onClick={onClick}>
      <div className="prow__main">
        <div className="prow__thumb" style={{ background: p.image }}>
          <span>{p.emoji}</span>
        </div>
        <div className="prow__info">
          <div className="prow__name">{p.name}{p.unit ? ` · ${p.unit}` : ''}</div>
          <div className="prow__addr">{p.address}, {p.city}, {p.state}</div>
        </div>
      </div>
      <div><span className="prow__type">{p.type}</span></div>
      <div><span className={`prow__status prow__status--${p.status}`}>{p.status}</span></div>
      <div className="prow__compliance">
        <div className="prow__bar">
          <div className={`prow__bar-fill prow__bar-fill--${p.complianceStatus || 'compliant'}`} style={{ width: `${p.compliance ?? 100}%` }} />
        </div>
        <span className="prow__pct">{p.compliance ?? 100}%</span>
      </div>
      <div className="prow__occ">{p.occupancy ?? 100}%</div>
      <div className="prow__rev">${(p.revenueMtd ?? 0).toLocaleString()}</div>
      <div className="prow__wos">{(p.openWOs ?? 0) > 0 ? <span className="prow__wo-chip">{p.openWOs}</span> : <span className="prow__muted">—</span>}</div>
    </div>
  );
}