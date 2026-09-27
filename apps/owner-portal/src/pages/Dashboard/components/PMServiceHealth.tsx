// apps/owner-portal/src/pages/Dashboard/components/PMServiceHealth.tsx
import { useOwner } from '../../../context/OwnerContext';
import { useToast } from '../../../context/ToastContext';

export default function PMServiceHealth() {
  const { pmStats } = useOwner();
  const { showToast } = useToast();

  return (
    <section
      className="pm-panel"
      onClick={() => showToast('PM service detail coming in Phase 2', 'info')}
    >
      <div className="pm-title">PM Service Health</div>

      <div className="pm-score-row">
        <div className="pm-score-circle">
          <div className="pm-score-num">{pmStats.score}</div>
          <div className="pm-score-label">Score</div>
        </div>

        <div className="pm-info">
          <div className="pm-name">{pmStats.name}</div>
          <div className="pm-role">{pmStats.role}</div>
          <span className="pm-tag">
            <span className="dot dot-green pm-tag-dot" />
            {pmStats.tag}
          </span>
        </div>
      </div>

      <div className="pm-stats-grid">
        <div className="pm-group">
          <div className="pm-group-label">Performance</div>
          <div className="pm-group-row">
            <div className="pm-stat-item">
              <div className="pm-stat-label">Avg. Response</div>
              <div className="pm-stat-value green">{pmStats.avgResponse}</div>
            </div>
            <div className="pm-stat-item">
              <div className="pm-stat-label">Issues Resolved</div>
              <div className="pm-stat-value green">{pmStats.issuesResolved}</div>
            </div>
          </div>
        </div>

        <div className="pm-group">
          <div className="pm-group-label">This month</div>
          <div className="pm-group-row">
            <div className="pm-stat-item">
              <div className="pm-stat-label">Jobs Completed</div>
              <div className="pm-stat-value">{pmStats.jobsCompleted}</div>
            </div>
            <div className="pm-stat-item">
              <div className="pm-stat-label">Updates Sent</div>
              <div className="pm-stat-value">{pmStats.updatesSent}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
