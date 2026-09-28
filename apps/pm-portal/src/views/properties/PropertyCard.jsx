// src/views/properties/PropertyCard.jsx
const COMPLIANCE_LABEL = { compliant: 'Compliant', attention: 'Attention', overdue: 'Overdue' };

export default function PropertyCard({ property: p, onClick }) {
  return (
    <article className="pcard" onClick={onClick}>
      <div className="pcard__hero" style={{ background: p.image }}>
        {(!p.image || !p.image.includes('url(')) && (
          <span className="pcard__emoji">{p.emoji}</span>
        )}
        <span className={`pcard__status pcard__status--${p.status}`}>{p.status}</span>
        {p.openWOs > 0 && (
          <span className="pcard__wo-badge">🔧 {p.openWOs}</span>
        )}
      </div>

      <div className="pcard__body">
        <div className="pcard__name">{p.name}{p.unit ? ` · ${p.unit}` : ''}</div>
        <div className="pcard__address">📍 {p.city}, {p.state}</div>

        <div className="pcard__meta">
          <span>{(p.beds ?? 0) > 0 ? `${p.beds} bd` : '—'} · {p.baths ?? 1} ba · {(p.sqft ?? 1200).toLocaleString()} ft²</span>
        </div>

        <div className="pcard__compliance">
          <div className="pcard__compliance-row">
            <span className="pcard__compliance-lbl">Compliance</span>
            <span className={`pcard__compliance-val pcard__compliance-val--${p.complianceStatus || 'compliant'}`}>
              {COMPLIANCE_LABEL[p.complianceStatus || 'compliant'] || 'Compliant'}
            </span>
          </div>
          <div className="pcard__bar">
            <div
              className={`pcard__bar-fill pcard__bar-fill--${p.complianceStatus || 'compliant'}`}
              style={{ width: `${p.compliance ?? 100}%` }}
            />
          </div>
        </div>

        <div className="pcard__footer">
          <div>
            <div className="pcard__rev">${(p.revenueMtd ?? 0).toLocaleString()}</div>
            <div className="pcard__rev-lbl">MTD · {p.occupancy ?? 100}% occ</div>
          </div>
          <div className="pcard__next">
            <div className="pcard__next-lbl">Next due</div>
            <div className="pcard__next-val">{p.nextDue || 'On Track'}</div>
          </div>
        </div>
      </div>
    </article>
  );
}