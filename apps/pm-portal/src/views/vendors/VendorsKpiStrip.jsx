// src/views/vendors/VendorsKpiStrip.jsx
import { VENDOR_KPIS } from '../../data/vendors';

export default function VendorsKpiStrip() {
  return (
    <div className="vendors-kpi-strip">
      {VENDOR_KPIS.map(k => (
        <div key={k.label} className="vendors-kpi-card">
          <div className={`vendors-kpi-val vendors-kpi-val--${k.tone}`}>{k.value}</div>
          <div className="vendors-kpi-lbl">{k.label}</div>
          <div className="vendors-kpi-sub">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}