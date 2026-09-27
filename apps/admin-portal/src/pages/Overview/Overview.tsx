// apps/admin-portal/src/pages/Overview/Overview.tsx
import { Link } from 'react-router-dom';
import './Overview.css';

/* ── Static fixtures (later replaced by API) ── */
const KPI_ROW = [
  { label: 'Organizations', value: '6', sub: [['3 Healthy', 'green'], ['2 Attention', 'yellow'], ['1 At Risk', 'red']], to: '/organizations' },
  { label: 'Properties', value: '263', sub: [['across all orgs', 'ghost']] },
  { label: 'Vendors', value: '24', sub: [['18 active · 6 flagged', 'ghost']], to: '/vendors' },
  { label: 'PM Users', value: '18', sub: [['across all orgs', 'ghost']] },
  { label: 'Active Jobs', value: '18', tone: 'green', sub: [['in progress now', 'ghost']], to: '/review-queue' },
  { label: 'Platform Health', value: '🟡 Degraded', tone: 'yellow', sub: [['1 integration issue', 'ghost']], to: '/system-health' },
] as const;

const PRIORITY_QUEUE = [
  {
    tone: 'blue' as const,
    severity: '🟡 Medium',
    severityColor: 'yellow',
    type: 'Dispute',
    title: 'D-893 — Payment · HVAC filter replacement',
    meta: 'PM → Vendor Alex Rivera · Waiting 18h',
    chip: 'Waiting on Vendor',
  },
  {
    tone: 'red' as const,
    severity: '🔴 Critical',
    severityColor: 'red',
    type: 'Flag',
    title: 'Jake Morris — 3 flags (30d)',
    meta: 'Plumbing · SLA breached',
    chip: 'Critical',
  },
  {
    tone: 'yellow' as const,
    severity: '🟠 High',
    severityColor: 'orange',
    type: 'Compliance',
    title: 'License expired — Chris Nakamura',
    meta: 'Electrical · Blocked',
    chip: 'SLA breached',
  },
];

const RISK_SIGNALS = [
  { tone: 'red',    text: '3 vendors flagged (24h)',                       sub: 'Jake Morris · David Liu · Rachel Kim' },
  { tone: 'red',    text: 'Blue Wave Hospitality — systemic risk',         sub: '10 flagged · 4 disputes · 74% compliance' },
  { tone: 'yellow', text: '2 compliance expiries (7d)',                    sub: 'Marcus Reed COI · Emma Garcia license' },
  { tone: 'yellow', text: 'Booking.com sync degraded',                     sub: '12 properties · 18m ongoing' },
  { tone: 'blue',   text: '1 PM with repeated vendor quality issues',      sub: 'Coastal STR · PM Sarah Kim · same vendor · 14d' },
];

const ORG_HEALTH = [
  { name: 'Blue Wave Hospitality',      meta: '83 properties · 51 vendors · Tampa · 7 issues',           signal: 'At Risk',        cls: 'risk' },
  { name: 'Coastal STR',                meta: '47 properties · 32 vendors · Orlando · 3 issues',         signal: 'Needs Attention', cls: 'attention' },
  { name: 'Horizon Property Group',     meta: '28 properties · 21 vendors · Jacksonville · 2 issues',    signal: 'Needs Attention', cls: 'attention' },
  { name: 'SunState Rentals',           meta: '31 properties · 18 vendors · Kissimmee · 1 issue',        signal: 'Healthy',        cls: 'healthy' },
  { name: 'Premier Vacation Homes',     meta: '62 properties · 44 vendors · Miami · No issues',          signal: 'Healthy',        cls: 'healthy' },
];

const VENDOR_ATTENTION = [
  { tone: 'red',    name: 'Jake Morris',      meta: 'Plumbing · Suspended · 3 no-shows (30d)' },
  { tone: 'red',    name: 'Chris Nakamura',   meta: 'Electrical · Blocked · License expired Mar 15' },
  { tone: 'yellow', name: 'Marcus Reed',      meta: 'Pool & Water · Limited · COI expiring (21d)' },
];

const ADMIN_ALERTS = [
  {
    tone: 'red' as const,
    severity: '🔴 Security',
    severityColor: 'red',
    type: 'Failed Login Attempts',
    title: 'Jennifer Walsh — 5 failed login attempts detected',
    meta: '2h ago · Last attempt from Orlando, FL',
    chip: 'Investigate →',
  },
  {
    tone: 'yellow' as const,
    severity: '🟡 Permission',
    severityColor: 'yellow',
    type: 'Temporary Access Expiring',
    title: 'Marcus Webb — Temporary Billing access expires tomorrow',
    meta: 'Granted by Sarah Chen · Reason: Vacation coverage',
    chip: 'Expires tomorrow',
  },
  {
    tone: 'blue' as const,
    severity: '🔵 Info',
    severityColor: 'blue',
    type: 'Administrator Action',
    title: 'Diane Foster — Vendor suspended · Tom Halloway (Roofing)',
    meta: '3h ago · Reason: COI expired · Audit logged',
    chip: 'Logged',
  },
];

const now = new Date();
const timeStr = now.toLocaleString('en-US', {
  hour: 'numeric', minute: '2-digit', hour12: true,
});
const dateStr = now.toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
});

export default function Overview() {
  return (
    <>
      <div className="admin-page-header">
        <h2>Overview</h2>
        <div className="admin-page-header__meta">
          <span className="admin-live-dot" />
          {timeStr} · {dateStr}
        </div>
      </div>

      {/* ══════ KPI ROW ══════ */}
      <div className="admin-block ov-kpi-block">
        <div className="ov-kpi-grid">
          {KPI_ROW.map((item) => {
            const kpi = item as { label: string; value: string; sub: readonly (readonly [string, string])[]; to?: string; tone?: string };
            const Wrapper = kpi.to ? Link : 'div';
            const wrapperProps = kpi.to ? { to: kpi.to } : {};
            return (
              <Wrapper
                key={kpi.label}
                className={`ov-kpi ${kpi.to ? 'is-clickable' : ''}`}
                {...(wrapperProps as any)}
              >
                <span className="ov-kpi__label">{kpi.label}</span>
                <div className={`ov-kpi__value ${kpi.tone ? 'is-' + kpi.tone : ''}`}>
                  {kpi.value}
                </div>
                <div className="ov-kpi__sub">
                  {kpi.sub.map(([text, color], i) => (
                    <div key={i} className={`ov-kpi__sub-line is-${color}`}>{text}</div>
                  ))}
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>

      {/* ══════ GLOBAL ATTENTION BAR ══════ */}
      <div className="ov-attention">
        <div className="ov-attention__signals">
          <span className="ov-att-item">6 pending</span>
          <span className="ov-att-sep">·</span>
          <span className="ov-att-item is-danger">1 critical</span>
          <span className="ov-att-sep">·</span>
          <span className="ov-att-item is-warn">2 SLA breaches</span>
        </div>
        <Link
          to="/review-queue"
          className="ov-btn-goto"
          data-hint="Admin · Review Queue"
        >
          Open Review Queue →
        </Link>
      </div>

      {/* ══════ ROW 1 ══════ */}
      <div className="admin-two-col">
        {/* Priority Queue */}
        <div className="admin-block">
          <div className="admin-block__header">
            <div className="admin-block__title">
              Priority Queue
              <span className="admin-count-badge red">3 urgent</span>
            </div>
          </div>

          {PRIORITY_QUEUE.map((item, i) => (
            <Link
              key={i}
              to="/review-queue"
              className="ov-queue-item"
              data-hint={`Review Queue → ${item.type}`}
            >
              <div className={`ov-queue-bar is-${item.tone}`} />
              <div className="ov-queue-body">
                <div className="ov-queue-type">
                  <span className={`ov-sev is-${item.severityColor}`}>{item.severity}</span>
                  {' · '}
                  {item.type}
                </div>
                <div className="ov-queue-title">{item.title}</div>
                <div className="ov-queue-meta">{item.meta}</div>
              </div>
              <span className={`ov-queue-chip is-${item.tone}`}>{item.chip}</span>
            </Link>
          ))}

          <div className="admin-block__footer">
            <Link to="/review-queue" className="admin-nav-hint" data-hint="→ Admin · Review Queue page">
              View all →
            </Link>
          </div>
        </div>

        {/* Risk Signals */}
        <div className="admin-block">
          <div className="admin-block__header">
            <div className="admin-block__title">
              Platform Risk Signals
              <span className="admin-count-badge yellow">4 patterns</span>
            </div>
          </div>

          {RISK_SIGNALS.map((r, i) => (
            <div key={i} className="ov-risk-item">
              <div className={`ov-risk-dot is-${r.tone}`} />
              <div>
                <div className="ov-risk-text">{r.text}</div>
                <div className="ov-risk-sub">{r.sub}</div>
              </div>
            </div>
          ))}

          <div className="admin-block__footer">
            <Link to="/organizations" className="admin-nav-hint" data-hint="→ Admin · Organizations page">
              Open Organizations →
            </Link>
          </div>
        </div>
      </div>

      {/* ══════ ROW 2 ══════ */}
      <div className="admin-two-col">
        {/* Org Health */}
        <div className="admin-block">
          <div className="admin-block__header">
            <div className="admin-block__title">
              Organization Health
              <span className="admin-count-badge red">1 at risk</span>
            </div>
          </div>

          {ORG_HEALTH.map((o, i) => (
            <Link
              key={i}
              to="/organizations"
              className="ov-org"
              data-hint={`Organizations → ${o.name}`}
            >
              <div className="ov-org__info">
                <div className="ov-org__name">{o.name}</div>
                <div className="ov-org__meta">{o.meta}</div>
              </div>
              <span className={`ov-org-signal is-${o.cls}`}>{o.signal}</span>
            </Link>
          ))}

          <div className="admin-block__footer">
            <Link to="/organizations" className="admin-nav-hint" data-hint="→ Admin · Organizations page">
              Open Organizations →
            </Link>
          </div>
        </div>

        {/* Vendor Health */}
        <div className="admin-block ov-vendor-block">
          <div className="admin-block__header">
            <div className="admin-block__title">Vendor Health</div>
          </div>

          <div className="ov-vendor-grid">
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Active</div>
              <div className="ov-vendor-stat__value">18</div>
            </div>
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Limited</div>
              <div className="ov-vendor-stat__value is-warn">3</div>
            </div>
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Suspended</div>
              <div className="ov-vendor-stat__value is-danger">1</div>
            </div>
          </div>

          <div className="ov-vendor-grid ov-vendor-grid--two">
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Compliance Rate</div>
              <div className="ov-vendor-stat__value is-green">89%</div>
            </div>
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Avg Reliability</div>
              <div className="ov-vendor-stat__value is-green">93%</div>
            </div>
          </div>

          <div className="ov-vendor-attention">
            <span>3 critical vendors require immediate attention</span>
            <Link to="/vendors" className="admin-nav-hint" data-hint="→ Admin · Vendors page">
              Open Vendors →
            </Link>
          </div>

          <div className="ov-vendor-list">
            {VENDOR_ATTENTION.map((v, i) => (
              <Link
                key={i}
                to="/vendors"
                className="ov-queue-item ov-queue-item--compact"
                data-hint={`Vendors → ${v.name} profile`}
              >
                <div className={`ov-queue-bar is-${v.tone}`} />
                <div className="ov-queue-body">
                  <div className="ov-queue-title">{v.name}</div>
                  <div className="ov-queue-meta">{v.meta}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="admin-block__footer">
            <Link to="/vendors" className="admin-nav-hint" data-hint="→ Admin · Vendors page">
              Open Vendors →
            </Link>
          </div>
        </div>
      </div>

      {/* ══════ ROW 3: SYSTEM HEALTH ══════ */}
      <div className="admin-block">
        <div className="admin-block__header">
          <div className="admin-block__title">System Health</div>
          <Link to="/system-health" className="admin-nav-hint" data-hint="→ Admin · System Health page">
            Open System Health →
          </Link>
        </div>

        <div className="ov-sys-grid ov-sys-grid--four">
          <div className="ov-sys-row">
            <span className="ov-sys-label">Platform</span>
            <span className="ov-sys-chip is-degraded">Degraded</span>
          </div>
          <div className="ov-sys-row">
            <span className="ov-sys-label">Active Alerts</span>
            <span className="ov-sys-value is-red">2</span>
          </div>
          <div className="ov-sys-row">
            <span className="ov-sys-label">Exceptions</span>
            <span className="ov-sys-value is-yellow">5</span>
          </div>
          <div className="ov-sys-row">
            <span className="ov-sys-label">Integrations</span>
            <span className="ov-sys-value">
              4 / 5 <span className="ov-sys-note">1 degraded</span>
            </span>
          </div>
        </div>

        <div className="ov-sys-grid ov-sys-grid--three">
          <div className="ov-sys-row">
            <span className="ov-sys-label">Booking.com sync</span>
            <span className="ov-sys-chip is-degraded">Degraded · 18m</span>
          </div>
          <div className="ov-sys-row">
            <span className="ov-sys-label">Document extraction queue</span>
            <span className="ov-sys-chip is-degraded">SLA Breached · 18 pending</span>
          </div>
          <div className="ov-sys-row">
            <span className="ov-sys-label">Last platform backup</span>
            <span className="ov-sys-value is-green">2:03 PM · Today</span>
          </div>
        </div>
      </div>

      {/* ══════ ROW 4: ADMIN TEAM + SUBSCRIPTION ══════ */}
      <div className="admin-two-col" style={{ marginTop: 20 }}>
        {/* Admin Team */}
        <div className="admin-block">
          <div className="admin-block__header">
            <div className="admin-block__title">Admin Team</div>
            <Link to="/settings" className="admin-nav-hint" data-hint="→ Settings · Admin Team">
              Open Admin Team →
            </Link>
          </div>

          <div className="ov-vendor-grid ov-vendor-grid--two">
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Administrators</div>
              <div className="ov-vendor-stat__value">7</div>
            </div>
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Online Now</div>
              <div className="ov-vendor-stat__value is-green">4</div>
            </div>
          </div>

          <div className="ov-kv-list">
            <KVRow label="Pending Invitation" value="1" valueTone="yellow" />
            <KVRow label="Temporary Permissions Active" value="2" valueTone="yellow" />
            <KVRow label="Suspended Admins" value="0" valueTone="muted" />
          </div>

          <div className="admin-block__footer">
            <Link to="/settings" className="admin-nav-hint" data-hint="→ Settings · Admin Team">
              Settings → Admin Team →
            </Link>
          </div>
        </div>

        {/* Subscription Health */}
        <div className="admin-block">
          <div className="admin-block__header">
            <div className="admin-block__title">Subscription Health</div>
            <Link to="/organizations" className="admin-nav-hint" data-hint="→ Admin · Organizations page">
              Open Organizations →
            </Link>
          </div>

          <div className="ov-vendor-grid ov-vendor-grid--two">
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Current</div>
              <div className="ov-vendor-stat__value is-green">5</div>
            </div>
            <div className="ov-vendor-stat">
              <div className="ov-vendor-stat__label">Past Due</div>
              <div className="ov-vendor-stat__value is-danger">1</div>
            </div>
          </div>

          <div className="ov-kv-list">
            <KVRow label="Paused" value="0" valueTone="muted" />
            <KVRow label="Promotional" value="2" valueTone="yellow" />
            <div className="ov-kv-row ov-kv-row--warn">
              <span className="ov-kv-label">⚠ Blue Wave Hospitality — Past Due 14d</span>
              <Link to="/billing" className="ov-kv-action">Action →</Link>
            </div>
          </div>

          <div className="admin-block__footer">
            <Link to="/organizations" className="admin-nav-hint" data-hint="→ Admin · Organizations page">
              Open Organizations →
            </Link>
          </div>
        </div>
      </div>

      {/* ══════ ROW 5: ADMIN ALERTS ══════ */}
      <div className="admin-block" style={{ marginTop: 20 }}>
        <div className="admin-block__header">
          <div className="admin-block__title">
            Admin Alerts
            <span className="admin-count-badge red">3 alerts</span>
          </div>
        </div>

        {ADMIN_ALERTS.map((a, i) => (
          <Link
            key={i}
            to="/settings"
            className="ov-queue-item"
            data-hint="Settings · Admin Team"
          >
            <div className={`ov-queue-bar is-${a.tone}`} />
            <div className="ov-queue-body">
              <div className="ov-queue-type">
                <span className={`ov-sev is-${a.severityColor}`}>{a.severity}</span>
                {' · '}
                {a.type}
              </div>
              <div className="ov-queue-title">{a.title}</div>
              <div className="ov-queue-meta">{a.meta}</div>
            </div>
            <span className={`ov-queue-chip is-${a.tone}`}>{a.chip}</span>
          </Link>
        ))}

        <div className="admin-block__footer">
          <Link to="/settings" className="admin-nav-hint" data-hint="→ Settings · Admin Team">
            View Admin Team →
          </Link>
        </div>
      </div>
    </>
  );
}

/* ── Small helper ── */
function KVRow({ label, value, valueTone }: { label: string; value: string; valueTone: 'yellow' | 'muted' }) {
  return (
    <div className="ov-kv-row">
      <span className="ov-kv-label">{label}</span>
      <span className={`ov-kv-value is-${valueTone}`}>{value}</span>
    </div>
  );
}