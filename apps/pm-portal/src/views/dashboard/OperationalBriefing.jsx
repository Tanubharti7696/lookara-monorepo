// src/views/dashboard/OperationalBriefing.jsx
import { useState } from 'react';
import { dashboardData } from '../../data/dashboardData';

export default function OperationalBriefing({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const { attentionItems, nextBestActions, todayOperations, recentActivity } = dashboardData;

  return (
    <section className={`collapsible ${open ? 'open' : ''}`}>
      <button className="collapsible__toggle" onClick={() => setOpen(v => !v)}>
        <div className="collapsible__left">
          <span className="collapsible__icon">📋</span>
          <span className="collapsible__title">Operational Briefing</span>
          <span className="collapsible__sub">
            What Needs Attention · Next Best Actions · Today's Operations · Recent Activity
          </span>
        </div>
        <span className={`collapsible__chev ${open ? 'open' : ''}`}>▼</span>
      </button>

      <div className="collapsible__body">
        {/* What Needs Attention */}
        <div className="dashboard-section">
          <div className="dashboard-section__label">What Needs Attention</div>
          <div className="attention-list">
            {attentionItems.map((item, i) => (
              <div key={i} className={`attention-item attention-item--${item.tone}`}>
                <div className="attention-item__left">
                  <span className="attention-item__icon">{item.icon}</span>
                  <span className="attention-item__text">{item.text}</span>
                </div>
                <button
                  className="attention-item__cta"
                  onClick={(e) => { e.stopPropagation(); onNavigate?.(item.cta); }}
                >
                  {item.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column: NBA + Today's Ops */}
        <div className="briefing-two-col">
          <div className="dashboard-section">
            <div className="dashboard-section__label">Next Best Actions</div>
            <div className="nba-card">
              {nextBestActions.map((a, i) => (
                <div key={i} className="nba-item">
                  <div className="nba-item__left">
                    <div className="nba-item__title">{a.title}</div>
                    <div className="nba-item__sub">{a.sub}</div>
                    <div className="nba-item__confidence">● High confidence</div>
                  </div>
                  <button className="btn-nba" onClick={() => onNavigate?.(a.cta)}>{a.cta}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section__label">Today's Operations</div>
            <div className="ops-card">
              {todayOperations.map((op, i) => (
                <div key={i} className="ops-item">
                  <div className="ops-item__time">{op.time}</div>
                  <span className="ops-item__icon">{op.icon}</span>
                  <div className="ops-item__content">
                    <div className="ops-item__title">{op.title}</div>
                    <div className="ops-item__location">{op.location}</div>
                  </div>
                </div>
              ))}
              <div className="ops-card__footer">
                <a className="link-view-all" onClick={() => onNavigate?.('calendar')}>
                  View Full Calendar →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <div className="dashboard-section__label">Recent Critical Activity</div>
          <div className="activity-card">
            {recentActivity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-item__left">
                  <div className={`activity-dot activity-dot--${a.dot}`} />
                  <div>
                    <div className="activity-item__title">{a.title}</div>
                    <div className="activity-item__sub">{a.sub}</div>
                  </div>
                </div>
                <span className="activity-item__when">{a.when}</span>
              </div>
            ))}
            <div className="ops-card__footer">
              <a className="link-view-all" onClick={() => onNavigate?.('audit')}>
                View All Activity →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}