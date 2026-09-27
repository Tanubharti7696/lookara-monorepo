// apps/owner-portal/src/pages/Dashboard/components/UpdatesFeed.tsx
import { useNavigate } from 'react-router-dom';
import { useOwner, type UpdateKind } from '../../../context/OwnerContext';

const ICON_CONTENT: Record<UpdateKind, string> = {
  resolved: '✓',
  payout: '$',
  action: '→',
  info: '·',
};

const BADGE_CLASS: Record<UpdateKind, string> = {
  resolved: 'badge-resolved',
  payout: 'badge-action',
  action: 'badge-action',
  info: 'badge-info',
};

export default function UpdatesFeed() {
  const navigate = useNavigate();
  const { updates } = useOwner();

  return (
    <section className="updates-panel">
      <div className="updates-header">
        <div className="updates-title">Recent Updates</div>
        <button
          type="button"
          className="view-all"
          onClick={() => navigate('/updates')}
        >
          View all →
        </button>
      </div>

      {updates.map((update) => (
        <button
          key={update.id}
          type="button"
          className="update-item"
          onClick={() => navigate(update.route)}
        >
          <span className={`update-icon ${update.kind}`}>
            {ICON_CONTENT[update.kind]}
          </span>

          <span className="update-body">
            <span className="update-text">{update.text}</span>
            <span className="update-meta">
              <span className={`update-type-badge ${BADGE_CLASS[update.kind]}`}>
                {update.badge}
              </span>
              <span>{update.meta}</span>
            </span>
          </span>
        </button>
      ))}
    </section>
  );
}
