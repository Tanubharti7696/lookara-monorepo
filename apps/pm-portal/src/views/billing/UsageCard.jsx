// src/views/billing/UsageCard.jsx
export default function UsageCard({ data }) {
  const pct = Math.round((data.activeProperties / data.maxProperties) * 100);
  const bars = [
    { label: 'Properties', value: `${data.activeProperties} / ${data.maxProperties} (${pct}%)`, pct },
    { label: 'Team Members', value: '1 / 3 (33%)', pct: 33 },
    { label: 'Storage', value: '2.4 GB / 10 GB (24%)', pct: 24 },
  ];

  return (
    <div className="bs-card">
      <div className="bs-card__topline">
        <div className="bs-card__title">Current Usage</div>
        <div className="bs-card__meta">Within plan limits</div>
      </div>

      <div className="bs-usage-grid">
        {bars.map(b => (
          <div key={b.label}>
            <div className="bs-usage-row">
              <span className="bs-usage-label">{b.label}</span>
              <span className="bs-usage-value">{b.value}</span>
            </div>
            <div className="bs-progress"><div className="bs-progress__fill" style={{ width: `${b.pct}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}