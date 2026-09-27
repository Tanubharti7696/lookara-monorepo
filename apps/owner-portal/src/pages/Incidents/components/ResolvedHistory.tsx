// apps/owner-portal/src/pages/Incidents/components/ResolvedHistory.tsx
import type { Incident } from '../../../context/OwnerContext';

interface ResolvedHistoryProps {
  title: string;
  subtitle?: string;
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
  variant?: 'card' | 'row';
}

export default function ResolvedHistory({
  title,
  subtitle,
  incidents,
  onSelect,
  variant = 'card',
}: ResolvedHistoryProps) {
  return (
    <section className="resolved-section">
      <div className="resolved-header">
        <div className="section-label" style={{ marginBottom: 0 }}>{title}</div>
        {subtitle && (
          <div className="resolved-subtitle">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 9l4 4 8-8" />
            </svg>
            {subtitle}
          </div>
        )}
      </div>

      {incidents.map((incident) =>
        variant === 'card' ? (
          <button
            key={incident.id}
            type="button"
            className="resolved-card"
            onClick={() => onSelect(incident)}
          >
            <span className="rc-left">
              <span className="rc-check">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#22C55E" strokeWidth="2.5">
                  <path d="M2 9l4 4 8-8" />
                </svg>
              </span>
              <span className="rc-info">
                <span className="rc-title">
                  {incident.title} — {incident.propertyName}
                </span>
                <span className="rc-meta">
                  {incident.startedLabel} · {incident.type}
                </span>
              </span>
            </span>
            <span className="rc-right">
              <span className="rc-speed">{incident.resolutionSpeed}</span>
              <span className="rc-cost">{incident.finalCost}</span>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                <path d="M6 3l5 5-5 5" />
              </svg>
            </span>
          </button>
        ) : (
          <button
            key={incident.id}
            type="button"
            className="history-row"
            onClick={() => onSelect(incident)}
          >
            <span className="hr-left">
              <span className="hr-badge hb-resolved">
                {incident.resolutionSpeed}
              </span>
              <span>{incident.title} — {incident.propertyName}</span>
            </span>
            <span className="hr-right">
              <span>{incident.finalCost}</span>
              <span>{incident.startedLabel}</span>
            </span>
          </button>
        ),
      )}
    </section>
  );
}
