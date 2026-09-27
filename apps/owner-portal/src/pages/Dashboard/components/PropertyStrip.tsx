// apps/owner-portal/src/pages/Dashboard/components/PropertyStrip.tsx
import { useNavigate } from 'react-router-dom';
import { useOwner, type Property, type EventTone } from '../../../context/OwnerContext';

interface PropertyStripProps {
  onInvitePM: () => void;
  onRequestAccess: () => void;
}

const TONE_COLOR: Record<EventTone, string> = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  muted: 'var(--text-muted)',
};

const HouseIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2A2F38"
    strokeWidth="1.2"
    aria-hidden="true"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate();
  const hasIssue = property.issueCount > 0;

  return (
    <button
      type="button"
      className={`property-card${hasIssue ? ' has-issue' : ''}`}
      onClick={() => navigate('/properties')}
    >
      <div className="property-img-placeholder">
        <HouseIcon />
        <span
          className={`property-img-label ${
            hasIssue ? 'occ-amber' : 'occ-green'
          }`}
        >
          {property.statusLabel}
        </span>
      </div>

      <div className="property-body">
        <div className="property-name">{property.name}</div>
        <div className="property-location">{property.location}</div>

        <div className="property-stats">
          <div className="prop-stat">
            <span className="prop-stat-label">Occ. this week</span>
            <span className="prop-stat-value">
              {property.occupancyDays} / 7 days
            </span>
          </div>
          <div className="prop-stat">
            <span className="prop-stat-label">Revenue</span>
            <span className="prop-stat-value gold">
              ${property.revenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="property-footer">
        {hasIssue && (
          <span className="prop-issue-badge">
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v4M8 11v.5" />
            </svg>
            {property.issueCount} active incident
            {property.issueCount === 1 ? '' : 's'}
          </span>
        )}
        <span
          className="prop-next-event"
          style={{ color: TONE_COLOR[property.nextEventTone] }}
        >
          {property.nextEvent}
        </span>
      </div>
    </button>
  );
}

export default function PropertyStrip({
  onInvitePM,
  onRequestAccess,
}: PropertyStripProps) {
  const { properties } = useOwner();

  return (
    <section className="property-section">
      <div className="section-label">Your Properties</div>

      <div className="property-strip">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}

        <div className="property-card property-card--add">
          <div className="property-add-label">Add a property</div>
          <button type="button" className="btn btn-primary" onClick={onInvitePM}>
            Invite PM
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onRequestAccess}
          >
            Request Access
          </button>
        </div>
      </div>
    </section>
  );
}
