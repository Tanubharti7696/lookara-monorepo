// src/views/properties/PropertyMap.jsx
// Simplified SVG map — pins positioned by lat/lng normalized to the continental US bounding box.
const US_BOUNDS = { minLat: 24, maxLat: 49, minLng: -125, maxLng: -66 };

export default function PropertyMap({ properties, onSelect }) {
  const toXY = (lat, lng) => ({
    x: ((lng - US_BOUNDS.minLng) / (US_BOUNDS.maxLng - US_BOUNDS.minLng)) * 100,
    y: (1 - (lat - US_BOUNDS.minLat) / (US_BOUNDS.maxLat - US_BOUNDS.minLat)) * 100,
  });

  return (
    <div className="pmap">
      <div className="pmap__canvas">
        <svg className="pmap__bg" viewBox="0 0 100 60" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="60" fill="url(#grid)" />
        </svg>

        {properties.map(p => {
          const { x, y } = toXY(p.lat, p.lng);
          return (
            <button
              key={p.id}
              className={`pmap__pin pmap__pin--${p.complianceStatus}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onSelect(p.id)}
              title={`${p.name} · ${p.city}`}
            >
              <span className="pmap__pin-dot" />
              <span className="pmap__pin-label">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="pmap__legend">
        <LegendDot label="Compliant"  cls="compliant" />
        <LegendDot label="Attention"  cls="attention" />
        <LegendDot label="Overdue"    cls="overdue"   />
      </div>
    </div>
  );
}

function LegendDot({ label, cls }) {
  return (
    <div className="pmap__legend-item">
      <span className={`pmap__legend-dot pmap__legend-dot--${cls}`} />
      <span>{label}</span>
    </div>
  );
}