// apps/owner-portal/src/pages/Financials/components/SummaryCards.tsx
import type { FinancialSnapshot } from '../../../context/OwnerContext';
import type { TxFilter } from './TransactionLedger';

interface SummaryCardsProps {
  financial: FinancialSnapshot;
  onCardClick: (filter: TxFilter) => void;
}

export default function SummaryCards({ financial, onCardClick }: SummaryCardsProps) {
  return (
    <div className="summary-row">
      {/* Net payout card with sparkline */}
      <button
        type="button"
        className="sum-card gold-top"
        onClick={() => onCardClick('payouts')}
      >
        <div className="sum-lbl">Net Owner Payout</div>
        <div className="sum-val gold">${financial.netPayout.toLocaleString()}</div>
        <div className="sum-delta delta-up">▲ {financial.netPayoutDelta} vs last month</div>
        <div className="sum-sub">On track for ${financial.forecastTarget.toLocaleString()} this month</div>

        <svg viewBox="0 0 200 44" preserveAspectRatio="none" className="sum-spark" aria-hidden="true">
          <defs>
            <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="28" x2="200" y2="28" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="3,4" opacity="0.35" />
          <path d="M0,34 C25,32 45,30 65,26 C85,22 100,30 120,24 C140,18 160,14 185,10 L185,44 L0,44 Z" fill="url(#sg1)" />
          <path d="M0,34 C25,32 45,30 65,26 C85,22 100,30 120,24 C140,18 160,14 185,10" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M185,10 C190,8 195,7 200,6" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2,3" opacity="0.4" />
          <circle cx="185" cy="10" r="3" fill="#D4AF37" />
          <circle cx="185" cy="10" r="5.5" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
        </svg>

        <div className="sum-spark-note">
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 9l4 4 8-8" />
          </svg>
          Tracking above last month average
        </div>
      </button>

      {/* Revenue */}
      <button
        type="button"
        className="sum-card green-top"
        onClick={() => onCardClick('revenue')}
      >
        <div className="sum-lbl">Total Revenue</div>
        <div className="sum-val green">${financial.revenue.toLocaleString()}</div>
        <div className="sum-delta delta-up">▲ +18% vs last month</div>
        <div className="sum-sub">Across all properties</div>
      </button>

      {/* Expenses */}
      <button
        type="button"
        className="sum-card red-top"
        onClick={() => onCardClick('expenses')}
      >
        <div className="sum-lbl">Operating Costs</div>
        <div className="sum-val red">−${financial.expenses.toLocaleString()}</div>
        <div className="sum-delta delta-down">▲ +4% vs last month (driven by cleaning)</div>
        <div className="sum-sub">Cleaning · maintenance · fees</div>
      </button>

      {/* Trust card */}
      <div className="trust-card">
        <div className="trust-title">Payout Status</div>

        <div className="next-payout-block">
          <div className="npb-row">
            <span className="npb-label">Next payout</span>
            <span className="npb-val">$980</span>
          </div>
          <div className="npb-date">Apr 15 · Seaside Villa</div>
          <div className="npb-status">
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="7" />
              <path d="M8 4v4l2.5 2.5" />
            </svg>
            PM confirming payment
          </div>
          <div className="npb-reassure">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 9l4 4 8-8" />
            </svg>
            No delays expected
          </div>
        </div>

        <div className="cashflow-snapshot">
          <span className="cashflow-muted">$540 pending</span>
          <span className="cashflow-sep">·</span>
          <span className="cashflow-gold">$980 arriving Apr 15</span>
        </div>

        <div className="trust-footnote">
          Payouts are confirmed and sent by your PM. Lookara records and reports them.
        </div>

        <div className="trust-metrics">
          <div className="tm-item">
            <div className="tm-lbl">Avg Time</div>
            <div className="tm-val">2.1 days</div>
          </div>
          <div className="tm-item">
            <div className="tm-lbl">On Time</div>
            <div className="tm-val">92%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
