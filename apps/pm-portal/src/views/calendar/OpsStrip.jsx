// src/views/calendar/OpsStrip.jsx
import { OPS_KPIS } from '../../data/calendar';

export default function OpsStrip() {
  return (
    <div className="cal-ops-strip">
      {OPS_KPIS.map(k => (
        <div key={k.key} className={`cal-ops-kpi cal-ops-kpi--${k.tone}`}>
          <div className="cal-ops-kpi__dot" />
          <div className="cal-ops-kpi__num">{k.value}</div>
          <div className="cal-ops-kpi__label">{k.label}</div>
        </div>
      ))}
    </div>
  );
}