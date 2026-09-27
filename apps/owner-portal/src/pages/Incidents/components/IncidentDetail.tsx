// apps/owner-portal/src/pages/Incidents/components/IncidentDetail.tsx
import type { Incident } from '../../../context/OwnerContext';

interface IncidentDetailProps {
  target: Incident | null;
  onClose: () => void;
}

export default function IncidentDetail({ target, onClose }: IncidentDetailProps) {
  return (
    <>
      <div className={`overlay${target ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer drawer--right${target ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Incident detail"
        style={{ width: 440 }}
      >
        {target && (
          <>
            <header className="d-hdr">
              <div>
                <div className="d-title">{target.title}</div>
                <div className="d-sub">
                  {target.propertyName} ·{' '}
                  {target.severity.charAt(0).toUpperCase() + target.severity.slice(1)} ·{' '}
                  {target.status === 'in-progress' ? 'In Progress' : target.status === 'monitoring' ? 'Monitoring' : 'Resolved'}
                </div>
              </div>
              <button type="button" className="d-close" onClick={onClose} aria-label="Close">✕</button>
            </header>

            <div className="d-body">
              {/* Control status */}
              <div className={`control-banner ${target.controlled ? 'cb-controlled' : 'cb-attention'}`}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {target.controlled ? (
                    <path d="M2 9l4 4 8-8" />
                  ) : (
                    <>
                      <circle cx="8" cy="8" r="7" />
                      <path d="M8 4v4l2.5 2.5" />
                    </>
                  )}
                </svg>
                {target.controlSignal}
              </div>

              {/* Summary */}
              <div>
                <div className="d-lbl">Summary</div>
                <div className="d-panel">
                  <div className="d-row"><span className="d-row-lbl">Property</span><span className="d-row-val">{target.propertyName}</span></div>
                  <div className="d-row"><span className="d-row-lbl">Location</span><span className="d-row-val">{target.location}</span></div>
                  <div className="d-row"><span className="d-row-lbl">Type</span><span className="d-row-val">{target.type}</span></div>
                  <div className="d-row">
                    <span className="d-row-lbl">Severity</span>
                    <span className={`d-row-val ${target.severity === 'critical' ? 'amber' : ''}`}>
                      {target.severity.charAt(0).toUpperCase() + target.severity.slice(1)}
                    </span>
                  </div>
                  <div className="d-row"><span className="d-row-lbl">Reported</span><span className="d-row-val">{target.startedLabel}</span></div>
                  {target.resolvedAt && (
                    <div className="d-row"><span className="d-row-lbl">Resolved</span><span className="d-row-val green">{target.resolvedAt}</span></div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="d-lbl">Timeline</div>
                <div className="timeline">
                  {target.timeline.map((entry, idx) => (
                    <div key={idx} className="tl-item">
                      <div className={`tl-dot ${entry.state}`}>
                        {entry.state === 'done' && (
                          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="2.5">
                            <path d="M2 9l4 4 8-8" />
                          </svg>
                        )}
                        {entry.state === 'active' && (
                          <span className="tl-dot-active" />
                        )}
                      </div>
                      <div className="tl-content">
                        <div className={`tl-event${entry.state === 'pending' ? ' pending' : ''}`}>{entry.event}</div>
                        <div className="tl-time">{entry.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos */}
              {target.photos.length > 0 && (
                <div>
                  <div className="d-lbl">Photos</div>
                  <div className="photo-grid">
                    {target.photos.map((photo, idx) => (
                      <button key={idx} type="button" className="photo-item" onClick={() => {}}>
                        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block', background: photo.bg }}>
                          <rect width="200" height="120" fill={photo.bg} />
                          <ellipse cx="100" cy="60" rx="50" ry="30" fill="rgba(255,255,255,0.04)" />
                          <path d="M65,45 Q90,30 118,46 Q132,56 122,70 Q108,84 82,78 Q62,70 65,45Z" fill="rgba(180,140,100,0.16)" />
                          <path d="M88,38 Q96,52 91,65" stroke="rgba(150,120,80,0.4)" strokeWidth="1.5" fill="none" />
                          <rect x="0" y="96" width="200" height="24" fill="rgba(0,0,0,0.6)" />
                          <text x="8" y="112" fontFamily="DM Sans, sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.65)">{photo.label}</text>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial */}
              <div>
                <div className="d-lbl">Financial Impact</div>
                <div className="d-panel">
                  {target.financial.map((row, idx) => (
                    <div key={idx} className="d-row">
                      <span className="d-row-lbl">{row.l}</span>
                      <span className={`d-row-val${row.gold ? ' gold' : row.color ? ` ${row.color}` : ''}`}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Owner action */}
              {target.ownerAction && (
                <div>
                  <div className="d-lbl">
                    {target.ownerAction.type === 'approval' ? 'Your Approval' : 'PM Question · Your Response'}
                  </div>
                  <div className="owner-action">
                    <div className="owner-action-meta">
                      {target.ownerAction.label} · {target.ownerAction.time}
                    </div>
                    <div className="owner-action-prompt">{target.ownerAction.detail}</div>
                    {target.ownerAction.ownerReply && (
                      <div className="owner-action-reply">
                        <div className="owner-action-reply-label">Your reply</div>
                        {target.ownerAction.ownerReply}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PM note */}
              <div>
                <div className="d-lbl">PM Notes</div>
                <div className="pm-note">
                  <div className="pm-note-text">{target.pmNote}</div>
                  <div className="pm-note-sig">{target.pmName}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
