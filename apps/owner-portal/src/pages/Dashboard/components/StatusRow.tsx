// apps/owner-portal/src/pages/Dashboard/components/StatusRow.tsx
import { useNavigate } from 'react-router-dom';
import { useOwner } from '../../../context/OwnerContext';

export default function StatusRow() {
  const navigate = useNavigate();
  const { financial, approvals, incidents } = useOwner();

  return (
    <div className="status-row">
      <button
        type="button"
        className="stat-card primary"
        onClick={() => navigate('/financials')}
        title="View Financials"
      >
        <div className="stat-label">Net Owner Payout</div>
        <div className="stat-value gold">
          ${financial.netPayout.toLocaleString()}
        </div>
        <div className="stat-sub">
          <span className="stat-delta delta-up">▲ {financial.netPayoutDelta}</span>
          <span>vs last month</span>
        </div>
        <div className="stat-footnote">
          Next payout:{' '}
          <span className="stat-footnote__strong">{financial.nextPayout}</span>
        </div>
      </button>

      <button
        type="button"
        className="stat-card healthy"
        onClick={() => navigate('/calendar')}
        title="View Calendar"
      >
        <div className="stat-label">Occupancy</div>
        <div className="stat-value">{financial.occupancy}%</div>
        <div className="stat-sub">
          <span className="stat-status">
            <span className="dot dot-green" />
            Above seasonal avg
          </span>
        </div>
      </button>

      <button
        type="button"
        className="stat-card action-needed"
        onClick={() => navigate('/approvals')}
        title="View Approvals"
      >
        <div className="stat-label">Approvals Pending</div>
        <div className="stat-value">{approvals.length}</div>
        <div className="stat-sub">
          <span className="stat-status">
            <span className="dot dot-amber" />
            Action required
          </span>
        </div>
      </button>

      <button
        type="button"
        className="stat-card incident-active"
        onClick={() => navigate('/incidents')}
        title="View Incidents"
      >
        <div className="stat-label">Property Health</div>
        <div className="stat-value">
          {incidents.length} Issue{incidents.length === 1 ? '' : 's'}
        </div>
        <div className="stat-sub">
          <span className="stat-status">
            <span className="dot dot-red" />
            Active incident
          </span>
        </div>
      </button>
    </div>
  );
}
