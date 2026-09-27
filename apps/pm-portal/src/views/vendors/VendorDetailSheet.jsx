// src/views/vendors/VendorDetailSheet.jsx
import { useState, useEffect } from 'react';
import { VD, getTradeCompliance } from '../../data/vendors';

const TABS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'profile',     label: 'Profile' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'work',        label: 'Work' },
  { key: 'compliance',  label: 'Compliance' },
  { key: 'history',     label: 'History' },
  { key: 'impact',      label: 'Portfolio Impact' },
];

export default function VendorDetailSheet({ vendorId, attachments, onClose, onOpenDispatch, onOpenAttach, onToast }) {
  const [tab, setTab] = useState('overview');

  useEffect(() => { setTab('overview'); }, [vendorId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const v = VD[vendorId];
  if (!v) return null;

  const initials = v.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const activePerf = v.trust !== null;

  const trustColor = v.trust === null ? 'var(--slate)'
    : v.trust >= 90 ? 'var(--success)'
    : v.trust >= 75 ? 'var(--gold)'
    : v.trust >= 60 ? 'var(--amber)'
    : 'var(--crimson)';

  const trustLabel = v.trust === null ? '—'
    : v.trust >= 90 ? 'Elite'
    : v.trust >= 75 ? 'Solid'
    : v.trust >= 60 ? 'Warning'
    : 'Risk';

  const assignments = attachments[vendorId] || [];
  const complianceReqs = getTradeCompliance(v.trade);

  return (
    <>
      <div className="vs-backdrop open" onClick={onClose} />
      <div className="vs-sheet open" onClick={e => e.stopPropagation()}>
        <div className="vs-handle" />
        <button className="vs-close" onClick={onClose}>×</button>

        <div className="vs-header">
          <div className="vs-identity">
            <div className="vs-avatar" style={{ background: v.avatarBg, color: v.avatarColor }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="vs-name">{v.name}</div>
              <div className="vs-sub">{v.sub}</div>
              {v.confCls && (
                <div className={`vs-conf vs-conf--${v.confCls}`}>
                  {v.confCls === 'high' ? '⚡ ' : ''}{v.conf} · {v.confSub}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="vs-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              className={`vs-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="vs-body">
          {tab === 'overview' && (
            <>
              <Section title="Availability & Readiness">
                <Metric label="Status"             value={<span style={{ color: v.availColor }}>{v.avail}</span>} />
                <Metric label="After-Hours"        value={v.ah} />
                <Metric label="Emergency Eligible" value={<span style={{ color: v.emgColor }}>{v.emg}</span>} />
                <Metric label="Active Jobs"        value={v.jobs} />
              </Section>

              <Section title="Performance Snapshot">
                {activePerf ? (
                  <>
                    <div className="vs-perf-grid">
                      <PerfTile label="Reliability" value={`${v.slaReliability}%`} />
                      <PerfTile label="Acceptance Rate" value={`${v.acceptanceRate}%`} />
                      <PerfTile label="Avg Response" value={`${v.avgResponseMin}m`} />
                    </div>
                    <Metric label="Last 10 Jobs" value={<LastTen arr={v.lastTen} />} />
                    <Metric label="Open Disputes" value={<span style={{ color: v.paymentDisputes === 0 ? 'var(--success)' : v.paymentDisputes === 1 ? 'var(--amber)' : 'var(--crimson)' }}>{v.paymentDisputes}</span>} />
                    <Metric label="Trust Score"   value={<span style={{ color: trustColor }}>{v.trust}% · {trustLabel}</span>} />
                    <div style={{ marginTop: 12 }}>
                      <ScoreBar label="SLA Reliability" value={`${v.slaReliability}%`} pct={v.slaReliability} color={v.slaReliability >= 90 ? 'var(--success)' : 'var(--amber)'} />
                      <ScoreBar label="Acceptance Rate" value={`${v.acceptanceRate}%`} pct={v.acceptanceRate} color={v.acceptanceRate >= 90 ? 'var(--success)' : 'var(--amber)'} />
                      <ScoreBar label="Rework Rate (lower is better)" value={`${v.reworkRate}%`} pct={v.reworkRate * 5} color={v.reworkRate <= 5 ? 'var(--success)' : v.reworkRate <= 10 ? 'var(--amber)' : 'var(--crimson)'} />
                    </div>
                  </>
                ) : (
                  <div className="vs-perf-empty">No performance data available — vendor inactive.</div>
                )}
              </Section>

              <Section title="Coverage Areas">
                <div className="vs-coverage">{v.coverage}</div>
              </Section>
            </>
          )}

          {tab === 'profile' && (
            <>
              <Section title="Contact">
                <Metric label="Phone"  value={v.phone} />
                <Metric label="Email"  value={<span style={{ fontSize: 11 }}>{v.email}</span>} />
                <Metric label="Region" value={v.region} />
              </Section>
              <Section title="Business">
                <Metric label="Trade"        value={v.trade} />
                <Metric label="Team Size"    value={v.team} />
                <Metric label="Member Since" value={v.since} />
              </Section>
            </>
          )}

          {tab === 'assignments' && (
            <Section title="Properties Assigned">
              {assignments.length === 0 ? (
                <div className="vs-empty">Not yet attached to any property.</div>
              ) : (
                assignments.map((r, i) => {
                  const propRec = r.property;
                  return <Metric key={i} label={propRec} value={<span style={{ fontSize: 11 }}>{r.label}</span>} />;
                })
              )}
              <button
                className="vs-attach-btn"
                onClick={() => onOpenAttach(vendorId, v.name, v.trade)}
              >
                + Assign to Another Property
              </button>
            </Section>
          )}

          {tab === 'work' && (
            <Section title="Active Jobs">
              <div className="vs-job-card vs-job-card--inprogress">
                <div className="vs-job-status" style={{ color: 'var(--success)' }}>IN PROGRESS</div>
                <div className="vs-job-title">TSK-2901 · Turnover Clean</div>
                <div className="vs-job-prop">Apt 4B · Brooklyn Heights</div>
              </div>
              <div className="vs-job-card">
                <div className="vs-job-status" style={{ color: 'var(--amber)' }}>SCHEDULED</div>
                <div className="vs-job-title">TSK-2888 · Standard Clean</div>
                <div className="vs-job-prop">Loft 2A · DUMBO</div>
              </div>
            </Section>
          )}

          {tab === 'compliance' && (
            <>
              <Section title="Universal Documents">
                <DocRow name="COI (Certificate of Insurance)" value="✓ Valid — Dec 2026" tone="ok" />
                <DocRow name="W-9"                             value="✓ Verified"           tone="ok" />
                <DocRow name="Background Check"                value="✓ Clear — Jan 2025"   tone="ok" />
              </Section>
              <Section title="Trade-Specific Requirements">
                {complianceReqs.length === 0 ? (
                  <div className="vs-empty">No trade-specific license required for {v.trade}.</div>
                ) : complianceReqs.map((r, i) => (
                  <DocRow
                    key={i}
                    name={r.name + (r.note ? ` (${r.note})` : '')}
                    value={r.required ? '⚠ Required' : 'Optional'}
                    tone={r.required ? 'warn' : 'muted'}
                  />
                ))}
              </Section>
              <button className="vs-outline-btn" onClick={() => onToast('Request document upload — flow coming soon', 'info')}>
                Request Document Upload
              </button>
            </>
          )}

          {tab === 'history' && (
            <Section title="Activity Summary">
              <Metric label="Jobs Completed" value="147" />
              <Metric label="Incidents"      value={<span style={{ color: 'var(--success)' }}>0</span>} />
              <Metric label="Timeouts"       value="2" />
              <Metric label="Timeout %"      value="1.4%" />
              <Metric label="Last Job"       value="Jan 14, 2026" />
            </Section>
          )}

          {tab === 'impact' && (
            <Section title="Portfolio Impact">
              <Metric label="My Portfolio"      value="3 properties" />
              <Metric label="Other PMs"         value="8 properties" />
              <Metric label="Platform SLA Rank" value={<span style={{ color: 'var(--success)' }}>#4 of 42 vendors</span>} />
              <Metric label="Primary Vendor"    value="2 properties" />
              <Metric label="Backup Vendor"     value="1 property" />
            </Section>
          )}
        </div>

        <div className="vs-footer">
          <button className="vs-dispatch-btn" onClick={() => onOpenDispatch(vendorId)}>
            Dispatch Now
          </button>
          <button className="vs-outline-btn" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="vs-section">
      <div className="vs-section-title">{title}</div>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="vs-metric">
      <span className="vs-metric-label">{label}</span>
      <span className="vs-metric-value">{value}</span>
    </div>
  );
}

function PerfTile({ label, value }) {
  return (
    <div className="vs-perf-tile">
      <div className="vs-perf-tile__value">{value}</div>
      <div className="vs-perf-tile__label">{label}</div>
    </div>
  );
}

function LastTen({ arr }) {
  if (!arr) return <span>—</span>;
  return (
    <span>
      {arr.map((v, i) => (
        <span
          key={i}
          title={v ? 'Pass' : 'Issue'}
          style={{
            display: 'inline-block',
            width: 10, height: 10, borderRadius: 2,
            background: v ? '#22C55E' : '#DC2626',
            margin: 1,
          }}
        />
      ))}
    </span>
  );
}

function ScoreBar({ label, value, pct, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: 'var(--slate)' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ background: '#1B1F26', borderRadius: 3, height: 4 }}>
        <div style={{ background: color, width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', borderRadius: 3 }} />
      </div>
    </div>
  );
}

function DocRow({ name, value, tone }) {
  const colorClass = {
    ok:    'vs-doc-ok',
    warn:  'vs-doc-warn',
    muted: 'vs-doc-muted',
  }[tone] || 'vs-doc-muted';
  return (
    <div className="vs-doc-row">
      <span className="vs-doc-name">{name}</span>
      <span className={`vs-doc-valid ${colorClass}`}>{value}</span>
    </div>
  );
}