// apps/owner-portal/src/pages/Dashboard/components/FinancialPanel.tsx
import { useNavigate } from 'react-router-dom';
import { useOwner } from '../../../context/OwnerContext';

export default function FinancialPanel() {
  const navigate = useNavigate();
  const { financial, dateRange } = useOwner();

  return (
    <section className="financial-panel">
      <div className="fin-header">
        <div>
          <div className="fin-title">Earnings Overview</div>
          <div className="fin-subtitle">
            {dateRange.label} — All Properties
          </div>
        </div>
        <div className="fin-on-track">
          <span className="dot dot-green" />
          On track for ${financial.forecastTarget.toLocaleString()}
        </div>
      </div>

      <div className="fin-callout">{financial.chartCallout}</div>

      <div
        className="fin-metrics"
        onClick={() => navigate('/financials')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigate('/financials');
        }}
      >
        <div className="fin-metric">
          <div className="fin-metric-label">Revenue</div>
          <div className="fin-metric-value">
            ${financial.revenue.toLocaleString()}
          </div>
          <div className="fin-metric-sub">Total bookings</div>
        </div>
        <div className="fin-metric">
          <div className="fin-metric-label">Expenses</div>
          <div className="fin-metric-value red">
            −${financial.expenses.toLocaleString()}
          </div>
          <div className="fin-metric-sub">Ops + vendor</div>
        </div>
        <div className="fin-metric">
          <div className="fin-metric-label">Net Payout</div>
          <div className="fin-metric-value gold">
            ${financial.netPayout.toLocaleString()}
          </div>
          <div className="fin-metric-sub">To your account</div>
        </div>
      </div>

      <div className="chart-area">
        <svg
          className="chart-svg"
          viewBox="0 0 560 110"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0" y1="20" x2="560" y2="20" stroke="#2A2F38" strokeWidth="1" />
          <line x1="0" y1="55" x2="560" y2="55" stroke="#2A2F38" strokeWidth="1" />
          <line x1="0" y1="90" x2="560" y2="90" stroke="#2A2F38" strokeWidth="1" />

          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="M0,75 C30,65 60,45 100,50 C140,55 170,30 210,35 C250,40 280,60 320,55 C360,50 390,30 430,38 L430,90 L0,90 Z"
            fill="url(#revGrad)"
          />

          <path
            d="M0,75 C30,65 60,45 100,50 C140,55 170,30 210,35 C250,40 280,60 320,55 C360,50 390,30 430,38"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M430,38 C460,32 490,25 560,22"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeDasharray="5,4"
            opacity="0.6"
          />

          <path
            d="M430,38 C460,32 490,25 560,22 L560,90 L430,90 Z"
            fill="url(#forecastGrad)"
          />

          <line
            x1="430"
            y1="10"
            x2="430"
            y2="90"
            stroke="#2A2F38"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <text
            x="432"
            y="18"
            fill="#6B7280"
            fontSize="9"
            fontFamily="DM Sans, sans-serif"
          >
            Today
          </text>
        </svg>
      </div>

      <div className="chart-labels">
        <span>Apr 1</span>
        <span>Apr 8</span>
        <span>Apr 15</span>
        <span>Apr 22</span>
        <span>Apr 30</span>
      </div>

      <div className="forecast-note">
        <div className="forecast-line" />
        <span>Dashed line = 7-day payout forecast</span>
      </div>
    </section>
  );
}
