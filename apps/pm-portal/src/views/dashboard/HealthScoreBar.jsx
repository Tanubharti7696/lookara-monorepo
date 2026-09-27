// src/views/dashboard/HealthScoreBar.jsx
import { dashboardData } from '../../data/dashboardData';

export default function HealthScoreBar() {
  const { score, delta, drivers } = dashboardData.status.healthScore;

  return (
    <div className="health-bar">
      <div className="health-bar__left">
        <div className="health-bar__dot" />
        <div className="health-bar__label">Portfolio Health Score</div>
        <div className="health-bar__score">
          {score}
          <span className="health-bar__denom"> / 100</span>
        </div>
        <div className="health-bar__delta">↑ {delta}</div>
      </div>

      <div className="health-bar__drivers">
        {drivers.map((d, i) => (
          <div key={i} className={`health-bar__driver health-bar__driver--${d.tone}`}>
            {d.text}
          </div>
        ))}
      </div>
    </div>
  );
}