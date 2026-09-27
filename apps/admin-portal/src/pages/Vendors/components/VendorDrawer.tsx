// src/pages/Vendors/components/VendorDrawer.tsx
import { useState, useEffect } from 'react';
import { type Vendor, cap, relLabel } from './data';

type Props = {
  vendor: Vendor;
  focusSection?: string;
  onClose: () => void;
  onAction: (type: 'suspend' | 'reinstate' | 'transfer' | 'grace' | 'editTrades' | 'toast', payload?: any) => void;
  onSaveNotes: (vendorId: string, notes: string) => void;
};

type SectionKey = 'trades' | 'compliance' | 'perf' | 'activity' | 'rel' | 'ops';

export default function VendorDrawer({ vendor: v, focusSection, onClose, onAction, onSaveNotes }: Props) {
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    trades: false, compliance: false, perf: false, activity: false, rel: false, ops: false,
  });
  const [notesDraft, setNotesDraft] = useState(v.adminNotes || readLocalStorage(v.id));
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    setNotesDraft(v.adminNotes || readLocalStorage(v.id));
  }, [v.id]);

  const toggle = (key: SectionKey) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  const saveNotes = () => {
    writeLocalStorage(v.id, notesDraft);
    onSaveNotes(v.id, notesDraft);
    setSavedAt('Saved ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    onAction('toast', { message: 'Admin note saved.', tone: 'neutral' });
  };

  const kpi = v.kpi;
  const statusLineColor: Record<string, string> = {
    active: 'var(--green)', limited: 'var(--yellow)', blocked: 'var(--red)', suspended: 'var(--red)',
  };

  const otClass = parseFloat(v.perf.ontime) >= 90 ? 'ok' : parseFloat(v.perf.ontime) >= 80 ? 'warn' : 'bad';
  const nsClass = v.perf.noshow === 0 ? 'ok' : v.perf.noshow >= 3 ? 'bad' : 'warn';
  const dispClass = v.perf.disputes === 0 ? 'ok' : 'warn';
  const loadLabel = v.perf.jobs >= 25 ? 'High' : v.perf.jobs >= 12 ? 'Moderate' : 'Low';
  const loadColor = v.perf.jobs >= 25 ? 'var(--yellow)' : v.perf.jobs >= 12 ? 'rgba(255,255,255,0.6)' : 'var(--green)';

  const statusEmoji: Record<string, string> = { active: '🟢', limited: '🟡', blocked: '🔴', suspended: '⛔' };

  const calloutHtml = focusSection === 'compBody'
    ? { tone: 'is-warn', icon: '⚠', text: <><strong>Action needed — Compliance.</strong> Review the flagged document below and take action.</> }
    : focusSection === 'activityBody'
    ? { tone: 'is-danger', icon: '⚑', text: <><strong>Under review — Flags.</strong> Active flags require admin decision.</> }
    : null;

  return (
    <>
      <div className="vd-overlay" onClick={onClose} />
      <aside className="vd-drawer">
        <header className="vd-drawer__head">
          <div>
            <div className="vd-drawer__name">{v.name}</div>
            <div className="vd-drawer__meta">
              {v.trade}  ·  {v.location}  ·  {v.type}
            </div>
          </div>
          <button className="vd-drawer__close" onClick={onClose}>✕</button>
        </header>

        <div className="vd-drawer__body">
          {/* KPI Strip */}
          <div className="vd-kpi-strip">
            <div className="vd-kpi-cell">
              <div className="vd-kpi-lbl">Eligible Trades</div>
              <div className="vd-kpi-val" style={{ color: 'var(--primary-gold)' }}>{v.trades.length}</div>
            </div>
            <div className="vd-kpi-cell">
              <div className="vd-kpi-lbl">Organizations</div>
              <div className="vd-kpi-val">{kpi.orgs}</div>
            </div>
            <div className="vd-kpi-cell">
              <div className="vd-kpi-lbl">Properties</div>
              <div className="vd-kpi-val">{kpi.properties}</div>
            </div>
            <div className="vd-kpi-cell">
              <div className="vd-kpi-lbl">Lifetime Jobs</div>
              <div className="vd-kpi-val">{kpi.lifetimeJobs}</div>
            </div>
            <div className="vd-kpi-cell">
              <div className="vd-kpi-lbl">Current Load</div>
              <div className="vd-kpi-val" style={{ color: loadColor }}>{loadLabel}</div>
            </div>
          </div>

          {/* Account status */}
          <div className="vd-acct-status">
            <span className={`vd-acct-badge is-${v.status}`}>
              {statusEmoji[v.status]} Account Status: {cap(v.status)}
            </span>
            {v.statusReason && <div className="vd-acct-reason">{v.statusReason}</div>}
          </div>

          {/* Callout */}
          {calloutHtml && (
            <div className={`vd-callout ${calloutHtml.tone}`}>
              <span className="vd-callout__icon">{calloutHtml.icon}</span>
              <span>{calloutHtml.text}</span>
            </div>
          )}

          {/* Identity + status line */}
          <div className="vd-identity">
            <div className="vd-status-line">
              Status: <strong style={{ color: statusLineColor[v.status] }}>{cap(v.status)}</strong>
              {v.statusReason ? ` — ${v.statusReason}` : ''}
            </div>
            <div className="vd-signal-line">
              Signal: <span className={`vd-signal-inline is-${v.reliability}`}>{relLabel(v.reliability)}</span>
            </div>
          </div>

          {/* Trades */}
          <Section
            title="Trades &amp; Certifications"
            isOpen={!collapsed.trades}
            onToggle={() => toggle('trades')}
          >
            <div className="vd-trade-lbl">Primary Trade</div>
            <div className="vd-trade-primary">{v.primaryTrade}</div>
            {v.additionalTrades.length > 0 && (
              <>
                <div className="vd-trade-lbl" style={{ marginTop: 10 }}>Additional Trades</div>
                <div className="vd-trade-chips">
                  {v.additionalTrades.map((t) => <span key={t} className="vd-trade-chip">{t}</span>)}
                </div>
              </>
            )}
            <div className="vd-comp-trades">
              <div className="vd-trade-lbl">Compliance Documents</div>
              {v.complianceTrades.map((t) => (
                <div key={t} className="vd-comp-trade-row">{t}</div>
              ))}
            </div>
            <div className="vd-trade-meta">
              <span className="vd-trade-meta__lbl">Eligible Task Categories</span>
              <span className="vd-trade-meta__val">{v.eligibleCategories} task categories</span>
            </div>
          </Section>

          {/* Compliance */}
          <Section
            title={
              <>
                Compliance
                {focusSection === 'compBody' && (
                  <span className="vd-section__badge is-warn">Action needed</span>
                )}
              </>
            }
            isOpen={!collapsed.compliance}
            onToggle={() => toggle('compliance')}
            highlight={focusSection === 'compBody' ? 'warn' : undefined}
          >
            <CompRow icon="📋" label="Certificate of Insurance (COI)" data={v.compliance.coi} />
            <CompRow icon="🪪" label="License" data={v.compliance.license} />
            <CompRow icon="🔍" label="Background Check" data={v.compliance.bgc} />
          </Section>

          {/* Performance */}
          <Section
            title="Performance · Last 30 days"
            isOpen={!collapsed.perf}
            onToggle={() => toggle('perf')}
          >
            <div className="vd-perf-grid">
              <div className="vd-perf-cell">
                <div className="vd-perf-lbl">Jobs</div>
                <div className="vd-perf-val">{v.perf.jobs}</div>
                <div className="vd-perf-sub">30d</div>
              </div>
              <div className="vd-perf-cell">
                <div className="vd-perf-lbl">On-time</div>
                <div className={`vd-perf-val is-${otClass}`}>{v.perf.ontime}</div>
                <div className="vd-perf-sub">&nbsp;</div>
              </div>
              <div className="vd-perf-cell">
                <div className="vd-perf-lbl">No-shows</div>
                <div className={`vd-perf-val is-${nsClass}`}>{v.perf.noshow}</div>
                <div className="vd-perf-sub">30d</div>
              </div>
              <div className="vd-perf-cell">
                <div className="vd-perf-lbl">Disputes</div>
                <div className={`vd-perf-val is-${dispClass}`}>{v.perf.disputes}</div>
                <div className="vd-perf-sub">open</div>
              </div>
              <div className="vd-perf-cell">
                <div className="vd-perf-lbl">Acceptance Rate</div>
                <div className="vd-perf-val is-ok">97%</div>
                <div className="vd-perf-sub">&nbsp;</div>
              </div>
            </div>
          </Section>

          {/* Activity */}
          <Section
            title={
              <>
                Activity
                {focusSection === 'activityBody' && (
                  <span className="vd-section__badge is-danger">Under review</span>
                )}
              </>
            }
            isOpen={!collapsed.activity}
            onToggle={() => toggle('activity')}
            highlight={focusSection === 'activityBody' ? 'danger' : undefined}
          >
            <div className="vd-sub-label">Recent Jobs</div>
            {v.recentJobs.map((j) => (
              <div key={j.id} className="vd-job-row">
                <div className="vd-job-main">
                  <div className="vd-job-title">
                    {j.title} <span className="vd-job-title__id">{j.id}</span>
                  </div>
                  <div className="vd-job-meta">{j.property}</div>
                </div>
                <div className="vd-job-date">{j.date}</div>
                <span className={`vd-job-outcome is-${j.outcome}`}>{outcomeLabel(j.outcome)}</span>
              </div>
            ))}

            <div className="vd-sub-label" style={{ marginTop: 20 }}>
              Active Flags
              {v.activeFlags.length > 0 && <span className="vd-sub-count">{v.activeFlags.length}</span>}
            </div>
            {v.activeFlags.length === 0 ? (
              <div className="vd-empty-inline">No active flags · Last 30d clean</div>
            ) : v.activeFlags.map((f, i) => (
              <div key={i} className="vd-flag-item">
                <div className={`vd-flag-dot is-${f.type}`} />
                <div>
                  <div className="vd-flag-text">{f.text}</div>
                  <div className="vd-flag-meta">{f.meta}</div>
                </div>
              </div>
            ))}
          </Section>

          {/* Relationships */}
          <Section
            title="Organizations Using This Vendor"
            isOpen={!collapsed.rel}
            onToggle={() => toggle('rel')}
          >
            {v.relationships.map((r, i) => {
              const pmName = r.pm.replace(/\s*\(.*?\)/, '');
              const relStatus = r.relationship || 'Current';
              const relColor = relStatus === 'Preferred' ? 'rgba(16,185,129,0.8)'
                : relStatus === 'Limited' ? 'rgba(245,158,11,0.8)'
                : relStatus === 'Suspended' ? 'rgba(239,68,68,0.8)'
                : 'rgba(255,255,255,0.35)';
              return (
                <div key={i} className="vd-rel-row">
                  <div className="vd-rel-pm">{pmName}</div>
                  <div className="vd-rel-jobs">{r.jobs} jobs</div>
                  <span className={`vd-rel-signal is-${r.signal}`}>
                    {r.signal === 'reliable' ? 'Reliable' : 'Slower approvals'}
                  </span>
                  <span className="vd-rel-status" style={{ color: relColor }}>{relStatus}</span>
                </div>
              );
            })}
          </Section>

          {/* Ops */}
          <Section
            title="Ops"
            isOpen={!collapsed.ops}
            onToggle={() => toggle('ops')}
          >
            <div className="vd-ops-row">
              Current load: <strong style={{ color: loadColor }}>{loadLabel}</strong>{' '}
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                ({v.perf.jobs} jobs last 30d)
              </span>
            </div>
          </Section>

          {/* Relationship controls */}
          <div className="vd-admin-section">
            <div className="vd-admin-head">
              <span className="vd-admin-title">Relationship Controls</span>
            </div>
            <button className="vd-rel-controls-row" onClick={() => onAction('toast', { message: 'Opening organizations view', tone: 'neutral' })}>
              <span className="vd-rel-controls-lbl">View Organizations</span>
              <div className="vd-rel-controls-right">
                <span className="vd-rel-controls-count">{kpi.orgs}</span>
                <span className="vd-rel-controls-arrow">→</span>
              </div>
            </button>
            <button className="vd-rel-controls-row" onClick={() => onAction('toast', { message: 'Opening assigned properties', tone: 'neutral' })}>
              <span className="vd-rel-controls-lbl">View Assigned Properties</span>
              <div className="vd-rel-controls-right">
                <span className="vd-rel-controls-count">{kpi.properties}</span>
                <span className="vd-rel-controls-arrow">→</span>
              </div>
            </button>
            <button className="vd-rel-controls-row" onClick={() => onAction('toast', { message: 'Opening active tasks', tone: 'neutral' })}>
              <span className="vd-rel-controls-lbl">View Active Tasks</span>
              <div className="vd-rel-controls-right">
                <span className="vd-rel-controls-count">{kpi.activeJobs} active</span>
                <span className="vd-rel-controls-arrow">→</span>
              </div>
            </button>
            <button className="vd-rel-controls-row" onClick={() => onAction('toast', { message: 'Opening dispute history', tone: 'neutral' })}>
              <span className="vd-rel-controls-lbl">View Disputes</span>
              <div className="vd-rel-controls-right">
                <span className="vd-rel-controls-count">{v.openDisputes + v.resolvedDisputes} total</span>
                <span className="vd-rel-controls-arrow">→</span>
              </div>
            </button>
            <button className="vd-rel-controls-row" onClick={() => onAction('toast', { message: 'Opening compliance history', tone: 'neutral' })}>
              <span className="vd-rel-controls-lbl">View Compliance History</span>
              <div className="vd-rel-controls-right">
                <span className="vd-rel-controls-arrow">→</span>
              </div>
            </button>
          </div>

          {/* Admin actions */}
          <div className="vd-admin-section">
            <div className="vd-admin-head">
              <span className="vd-admin-title">
                Admin Actions <span className="vd-admin-only">Admin only</span>
              </span>
            </div>
            <div className="vd-admin-grid">
              <AdminBtn icon="📋" label="View Audit" sub="Full action history" onClick={() => onAction('toast', { message: 'Opening full audit log', tone: 'neutral' })} />
              <AdminBtn icon="✉" label="Contact Vendor" sub="Send direct message" onClick={() => onAction('toast', { message: 'Opening vendor contact', tone: 'neutral' })} />
              <AdminBtn icon="👥" label="Contact PM(s)" sub="Notify assigned managers" onClick={() => onAction('toast', { message: 'Contacting assigned PMs', tone: 'neutral' })} />
              <AdminBtn icon="📄" label="Request Compliance" sub="Prompt document upload" variant="warn" onClick={() => onAction('toast', { message: 'Requesting compliance update', tone: 'yellow' })} />
              <AdminBtn icon="⏱" label="Extend Grace Period" sub="+7 / +14 / +21 / +30 days" variant="warn" onClick={() => onAction('grace')} />
              <AdminBtn icon="🔐" label="Reset Account / 2FA" sub="Account recovery" onClick={() => onAction('toast', { message: '2FA reset initiated. Vendor notified.', tone: 'neutral' })} />
              <AdminBtn icon="✏️" label="Edit Trades" sub="Add/remove certifications" onClick={() => onAction('editTrades')} />
              {!v.isSuspended && v.status !== 'limited' && (
                <AdminBtn icon="🟡" label="Limit Vendor" sub="Restrict new assignments" variant="warn"
                  onClick={() => onAction('toast', { message: 'Vendor set to Limited. Audit logged.', tone: 'yellow' })} />
              )}
              {!v.isSuspended && v.status !== 'blocked' && (
                <AdminBtn icon="🔴" label="Block Vendor" sub="Compliance issue — no new work" variant="danger"
                  onClick={() => onAction('toast', { message: 'Vendor blocked. Compliance required to reinstate.', tone: 'red' })} />
              )}
              {!v.isSuspended && (
                <AdminBtn icon="⛔" label="Suspend Vendor" sub="Full account suspension" variant="danger"
                  onClick={() => onAction('suspend')} />
              )}
              {v.isSuspended && (
                <>
                  <AdminBtn icon="✅" label="Reinstate Vendor" sub="Restore account access" variant="positive"
                    onClick={() => onAction('reinstate')} />
                  <AdminBtn icon="🔄" label="Transfer Active Jobs" sub="Reassign to other vendors" variant="warn"
                    onClick={() => onAction('transfer')} />
                </>
              )}
            </div>
          </div>

          {/* Admin timeline */}
          <div className="vd-admin-section">
            <div className="vd-admin-head">
              <span className="vd-admin-title">
                Administrative Timeline <span className="vd-admin-only">Admin only</span>
              </span>
            </div>
            {(v.adminTimeline.length > 0 ? v.adminTimeline : defaultTimeline).map((t, i) => (
              <div key={i} className="vd-tl-row">
                <div className={`vd-tl-dot is-${t.dot}`} />
                <div className="vd-tl-content">
                  <div className="vd-tl-event">{t.event}</div>
                  <div className="vd-tl-by">{t.by}</div>
                </div>
                <div className="vd-tl-time">{t.time}</div>
              </div>
            ))}
          </div>

          {/* Admin notes */}
          <div className="vd-admin-section">
            <div className="vd-admin-head">
              <span className="vd-admin-title">
                Administrative Notes <span className="vd-admin-only">Admin only</span>
              </span>
            </div>
            <div style={{ padding: '0 28px 20px' }}>
              <div className="vd-notes-hint">Not visible to PMs or vendors.</div>
              <textarea
                className="vd-notes-area"
                placeholder="e.g. Temporary suspension pending insurance renewal."
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
              />
              <div className="vd-notes-foot">
                <button className="vd-notes-save" onClick={saveNotes}>Save Note</button>
                <span className="vd-notes-ts">{savedAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="vd-drawer__foot">
          {v.isSuspended ? (
            <>
              <button className="vd-btn-primary-green" onClick={() => onAction('reinstate')}>
                Reinstate Vendor
              </button>
              <div className="vd-drawer__sep" />
              <button className="vd-btn-outline" onClick={() => onAction('toast', { message: 'Opening full audit log…', tone: 'neutral' })}>
                View Full Audit →
              </button>
            </>
          ) : (
            <>
              <button className="vd-btn-primary-red" onClick={() => onAction('suspend')}>
                Suspend Vendor
              </button>
              {v.status !== 'limited' && (
                <>
                  <div className="vd-drawer__sep" />
                  <button className="vd-btn-outline" onClick={() => onAction('toast', { message: 'Vendor set to Limited. Audit log updated.', tone: 'yellow' })}>
                    Set to Limited
                  </button>
                </>
              )}
              <div className="vd-drawer__sep" />
              <button className="vd-btn-outline" onClick={() => onAction('toast', { message: 'Opening full audit log…', tone: 'neutral' })}>
                View Full Audit →
              </button>
            </>
          )}
          <span className="vd-drawer__note">Admin actions only · All actions logged</span>
        </footer>
      </aside>
    </>
  );
}

/* ── Helpers ── */
function Section({
  title, isOpen, onToggle, highlight, children,
}: {
  title: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  highlight?: 'warn' | 'danger';
  children: React.ReactNode;
}) {
  const cls = highlight === 'warn' ? 'is-highlight-warn' : highlight === 'danger' ? 'is-highlight-danger' : '';
  return (
    <div className={`vd-section ${cls}`}>
      <div className="vd-section__head" onClick={onToggle}>
        <span className="vd-section__title">{title}</span>
        <span className={`vd-section__toggle ${isOpen ? 'is-open' : ''}`}>▶</span>
      </div>
      {isOpen && <div className="vd-section__body">{children}</div>}
    </div>
  );
}

function CompRow({ icon, label, data }: { icon: string; label: string; data: Vendor['compliance']['coi'] }) {
  const isCheckr = data.source === 'Checkr';
  const chipClass = data.status === 'expired' ? 'is-expired' : data.status === 'missing' ? 'is-missing' : data.status;

  const parts = data.detail.split(' · ');
  const details = isCheckr
    ? [data.detail, `Source: ${data.source}`]
    : [`Expires: ${parts[0] || data.detail}`, parts[1] ? `Notes: ${parts[1]}` : '', `Source: ${data.source}`].filter(Boolean);

  const danger = data.status === 'expired' || data.status === 'missing';

  return (
    <div className="vd-comp-row">
      <div className="vd-comp-row__icon">{icon}</div>
      <div className="vd-comp-row__info">
        <div className="vd-comp-row__label">{label}</div>
        {details.map((d, i) => <div key={i} className="vd-comp-row__detail">{d}</div>)}
      </div>
      <div className="vd-comp-row__status">
        <span className={`vd-comp-chip is-${chipClass}`}>{data.label}</span>
      </div>
      <div className="vd-comp-row__actions">
        <button className="vd-btn-comp">
          {isCheckr ? 'View Report →' : 'View Doc →'}
        </button>
        {danger && <button className="vd-btn-comp is-danger">Request Upload</button>}
      </div>
    </div>
  );
}

function AdminBtn({
  icon, label, sub, variant, onClick,
}: {
  icon: string;
  label: string;
  sub: string;
  variant?: 'danger' | 'positive' | 'warn';
  onClick: () => void;
}) {
  const cls = variant === 'danger' ? 'is-danger' : variant === 'positive' ? 'is-positive' : variant === 'warn' ? 'is-warn' : '';
  return (
    <button className={`vd-admin-btn ${cls}`} onClick={onClick}>
      <span className="vd-admin-btn__icon">{icon}</span>
      <div className="vd-admin-btn__body">
        <span className="vd-admin-btn__label">{label}</span>
        <span className="vd-admin-btn__sub">{sub}</span>
      </div>
    </button>
  );
}

function outcomeLabel(o: string) {
  if (o === 'completed') return 'Completed · On time';
  if (o === 'noshow') return 'No-show';
  if (o === 'flagged') return 'Flagged';
  if (o === 'disputed') return 'Disputed';
  return o;
}

const defaultTimeline = [
  { event: 'Vendor account created', by: 'System', time: 'Jan 12, 2024', dot: 'muted' as const },
  { event: 'Background check verified · Checkr', by: 'System automated', time: 'Jan 12, 2024', dot: 'green' as const },
  { event: 'COI approved · $2M coverage', by: 'Sarah Chen · Admin', time: 'Jan 14, 2024', dot: 'green' as const },
];

function readLocalStorage(id: string) {
  try { return localStorage.getItem('vendorAdminNote_' + id) || ''; } catch { return ''; }
}
function writeLocalStorage(id: string, notes: string) {
  try { localStorage.setItem('vendorAdminNote_' + id, notes); } catch { /* noop */ }
}