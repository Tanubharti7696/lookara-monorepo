// src/pages/SystemHealth/SystemHealth.tsx
import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './SystemHealth.css';

type Filter = 'all' | 'critical' | 'degraded' | 'sla' | 'integrations';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'critical',     label: 'Critical' },
  { key: 'degraded',     label: 'Degraded' },
  { key: 'sla',          label: 'SLA breached' },
  { key: 'integrations', label: 'Integrations' },
];

const MODULES = [
  { name: 'PM Portal',       sub: null,                          status: 'healthy', uptime: '99.9%', issue: 'No issues' },
  { name: 'Vendor Portal',   sub: null,                          status: 'healthy', uptime: '99.8%', issue: 'No issues' },
  { name: 'Owner Portal',    sub: null,                          status: 'healthy', uptime: '100%',  issue: 'No issues' },
  { name: 'Admin Portal',    sub: null,                          status: 'healthy', uptime: '100%',  issue: 'No issues' },
  { name: 'Review Queue',    sub: '6 pending · Within SLA',      status: 'healthy', uptime: '100%',  issue: 'Within SLA' },
  { name: 'Dispatch Engine', sub: 'Auto-assignment active',      status: 'healthy', uptime: '99.7%', issue: 'No issues' },
  { name: 'Compliance Engine', sub: 'Doc extraction backlogged', status: 'degraded', uptime: '97.2%', issue: '18 docs queued · SLA breach', issueTone: 'yellow' },
  { name: 'Notifications',   sub: 'Email + SMS',                 status: 'healthy', uptime: '99.5%', issue: 'No issues' },
  { name: 'Audit Log',       sub: 'Write-only · Immutable',      status: 'healthy', uptime: '100%',  issue: 'No issues' },
] as const;

const QUEUES = [
  { name: 'Review Queue',         sub: 'Compliance · Flags · Disputes',     count: 6,  oldest: '8h',  sla: 'ok' },
  { name: 'Document Extraction',  sub: 'COI · License · BGC parsing',       count: 18, oldest: '42m', sla: 'breach' },
  { name: 'Notification Queue',   sub: 'Email · SMS · In-app',              count: 3,  oldest: '2m',  sla: 'ok' },
  { name: 'Dispatch Jobs',        sub: 'Auto-assignment pending',           count: 2,  oldest: '5m',  sla: 'ok' },
  { name: 'Statement Generation', sub: 'Monthly · PM-triggered',            count: 7,  oldest: '14m', sla: 'ok' },
  { name: 'OTA Sync Queue',       sub: 'Availability · Reservations',       count: 41, oldest: '18m', sla: 'breach' },
] as const;

const INTEGRATIONS = [
  { icon: '✈',  name: 'Airbnb',               sub: 'OTA Sync · Availability + Reservations', status: 'healthy',  sync: 'Last sync: 2m ago',  issue: '—' },
  { icon: '🏨', name: 'Booking.com',          sub: 'OTA Sync · Availability + Reservations', status: 'degraded', sync: 'Last sync: 18m ago', issue: 'API timeout · Retrying every 90s · 41 updates queued · Impact: Sync delay across 12 properties', stale: true, warn: true },
  { icon: '🏡', name: 'Vrbo',                 sub: 'OTA Sync · Availability + Reservations', status: 'healthy',  sync: 'Last sync: 4m ago',  issue: '—' },
  { icon: '🔍', name: 'Checkr',               sub: 'Background Check Provider',              status: 'healthy',  sync: 'Last ping: 8m ago',  issue: '—' },
  { icon: '✉',  name: 'Email / SMS Delivery', sub: 'Transactional · Notifications',          status: 'healthy',  sync: 'Last delivery: 1m ago', issue: '—' },
  { icon: '📦', name: 'File Storage',         sub: 'Documents · Photos · Uploads',           status: 'healthy',  sync: 'Last write: 3m ago', issue: '—' },
] as const;

const EXCEPTIONS = [
  { sev: '🔴 Critical', sevTone: 'red',    type: 'job',    typeLabel: 'Job Assign',  desc: 'Auto-assignment failed — no eligible vendors', sub: 'Job #4531 · HVAC repair · Palm Grove Retreat',                 time: '14m ago',   retry: 'Failed × 3 · needs action', retryTone: 'failed', to: 'Review Queue · Job exception #4531' },
  { sev: '🔴 Critical', sevTone: 'red',    type: 'doc',    typeLabel: 'Doc Parse',   desc: 'COI extraction failed — unreadable format',    sub: 'Vendor: Tom Halloway · Submitted Apr 13',                     time: '31m ago',   retry: 'Failed × 2 · needs action', retryTone: 'failed', to: 'Review Queue · Tom Halloway compliance' },
  { sev: '🟠 Degraded', sevTone: 'yellow', type: 'doc',    typeLabel: 'Doc Parse',   desc: 'License parsing failed — image quality low',   sub: 'Vendor: Rachel Kim · Submitted Apr 12',                       time: '1h 4m ago', retry: 'Retrying · auto',            retryTone: 'warn',   to: 'Review Queue · Rachel Kim compliance' },
  { sev: '🟡 Minor',    sevTone: 'muted',  type: 'notify', typeLabel: 'Notification',desc: 'Vendor suspension SMS undelivered',            sub: 'Jake Morris · +1 (407) 555-0192',                             time: '2h 11m ago',retry: 'Retrying · auto',            retryTone: 'warn',   to: 'Audit & Activity · Notification event' },
  { sev: '🟡 Minor',    sevTone: 'muted',  type: 'export', typeLabel: 'Export',      desc: 'Statement export failed — timeout',            sub: 'PM: Coastal STR · Apr 2026 statement',                        time: '3h 45m ago',retry: 'Retrying · auto',            retryTone: 'warn',   to: 'Audit & Activity · Export event' },
] as const;

const INCIDENTS = [
  { date: 'Apr 13', desc: 'Booking.com sync failure · 12 properties · Ongoing',                     dur: '18m · Ongoing', status: 'Monitoring', statusCls: 'monitoring' },
  { date: 'Apr 11', desc: 'Document extraction backlog · Processing delay · 23 items queued',      dur: '1h 12m',        status: 'Resolved',   statusCls: 'resolved' },
  { date: 'Apr 9',  desc: 'SMS delivery degraded · Twilio outage · ~40 notifications delayed',    dur: '34m',           status: 'Resolved',   statusCls: 'resolved' },
  { date: 'Apr 7',  desc: 'Dispatch engine slow · Auto-assignment latency +8s · 3 jobs delayed',  dur: '22m',           status: 'Resolved',   statusCls: 'resolved' },
  { date: 'Apr 5',  desc: 'Vrbo sync timeout · Resolved automatically · No guest impact',          dur: '7m',            status: 'Resolved',   statusCls: 'resolved' },
] as const;

export default function SystemHealth() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>('all');

  const showSection = (cat: string): boolean => {
    if (filter === 'all') return true;
    if (filter === 'critical') return cat === 'critical';
    if (filter === 'degraded') return cat === 'critical' || cat === 'degraded';
    if (filter === 'sla') return cat === 'sla' || cat === 'critical';
    if (filter === 'integrations') return cat === 'integrations';
    return true;
  };

  return (
    <div className="sh-page">
      <div className="sh-header">
        <div>
          <h2>System Health</h2>
          <p>Platform operations, integrations, and exception monitoring</p>
        </div>
        <div className="sh-updated">
          <span className="sh-live-dot" />
          Last updated 42s ago · Auto-refreshes every 60s
        </div>
      </div>

      <div className="sh-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`sh-filter-pill ${filter === f.key ? 'is-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ══════ SUMMARY ══════ */}
      <div className="sh-summary-grid">
        <SummaryCard label="Platform Status" value="Degraded" sub="1 integration degraded" tone="yellow" />
        <SummaryCard label="Active Alerts"   value="2"        sub="1 critical · 1 degraded" tone="red" />
        <SummaryCard label="Exceptions"      value="5"        sub="2 need action · 3 retrying" tone="yellow" />
        <SummaryCard label="Integrations"    value={<>4 <span className="sh-summary-of">/ 5</span></>} sub="1 degraded · Booking.com" subTone="yellow" />
      </div>

      {/* ══════ ALERTS ══════ */}
      {showSection('critical') && (
        <Section title="Active Alerts" badge={{ tone: 'red', label: '2 active' }} category="critical">
          <AlertCard
            tone="crit"
            source="Integration · OTA Sync"
            title="Booking.com Sync Failure"
            meta={['🕐 Started 18m ago', '🏠 12 properties affected', '🔄 Last successful sync: 18m ago']}
            impact={<><strong>Impact:</strong> Reservations + availability delayed across 12 properties</>}
            severity="Critical"
            to="Review Queue · Integration alerts"
            onClick={() => toast('Review Queue · Integration alerts')}
          />
          <AlertCard
            tone="warn"
            source="Queue · Document Extraction"
            title="Document Extraction Backlog — SLA Breached"
            meta={['🕐 Breached 22m ago', '📄 18 items pending', '⏳ Oldest item: 42 min']}
            impact={<><strong>Impact:</strong> 3 vendors blocked · Review queue items delayed</>}
            severity="Degraded"
            to="Review Queue · Compliance review"
            onClick={() => toast('Review Queue · Compliance review')}
          />
        </Section>
      )}

      {/* ══════ MODULE + QUEUE ══════ */}
      <div className="sh-two-col">
        {showSection('all') && (
          <Section title="Module Health" badge={{ tone: 'yellow', label: '1 degraded' }} category="all">
            {MODULES.map((m) => (
              <div key={m.name} className="sh-module-row">
                <div>
                  <div className="sh-module-name">{m.name}</div>
                  {m.sub && <div className="sh-module-sub">{m.sub}</div>}
                </div>
                <span className={`sh-status-pill is-${m.status}`}><span className="sh-dot" />{m.status === 'healthy' ? 'Healthy' : 'Degraded'}</span>
                <div className={`sh-uptime is-${m.status === 'healthy' ? 'ok' : 'warn'}`}>{m.uptime}</div>
                <div className={`sh-module-issue${(m as any).issueTone ? ' is-' + (m as any).issueTone : ''}`}>{m.issue}</div>
              </div>
            ))}
          </Section>
        )}

        {showSection('sla') && (
          <Section title="Queue Health" badge={{ tone: 'red', label: '1 SLA breached' }} category="sla">
            {QUEUES.map((q) => {
              const countTone = q.count > 20 ? 'bad' : q.count > 5 ? 'warn' : 'ok';
              return (
                <div key={q.name} className="sh-queue-row">
                  <div>
                    <div className="sh-queue-name">{q.name}</div>
                    <div className="sh-queue-sub">{q.sub}</div>
                  </div>
                  <div className={`sh-queue-count is-${countTone}`}>{q.count}</div>
                  <div className="sh-queue-oldest">Oldest: {q.oldest}</div>
                  <span className={`sh-queue-sla is-${q.sla === 'breach' ? 'breach' : 'ok'}`}>
                    {q.sla === 'breach' ? 'SLA breached' : 'Within SLA'}
                  </span>
                </div>
              );
            })}
          </Section>
        )}
      </div>

      {/* ══════ INTEGRATIONS ══════ */}
      {showSection('integrations') && (
        <Section title="Integration Health" badge={{ tone: 'yellow', label: '1 degraded' }} category="integrations">
          {INTEGRATIONS.map((i) => (
            <div key={i.name} className="sh-integration-row">
              <div className="sh-integration-icon">{i.icon}</div>
              <div className="sh-integration-name">
                {i.name}
                <div className="sh-int-type">{i.sub}</div>
              </div>
              <span className={`sh-status-pill is-${i.status}`}><span className="sh-dot" />{i.status === 'healthy' ? 'Healthy' : 'Degraded'}</span>
              <div className={`sh-integration-sync${(i as any).stale ? ' is-stale' : ''}`}>{i.sync}</div>
              <div className={`sh-integration-issue${(i as any).warn ? ' is-warn' : ''}`}>{i.issue}</div>
            </div>
          ))}
        </Section>
      )}

      {/* ══════ EXCEPTIONS ══════ */}
      {showSection('critical') && (
        <Section
          title="Exceptions & Failures"
          badge={{ tone: 'red', label: '5 active' }}
          meta="2 need action · 3 auto-retrying"
          category="critical"
        >
          <div className="sh-exc-header">
            <span>Type</span>
            <span>Item</span>
            <span>Time</span>
            <span>Retry</span>
            <span></span>
          </div>
          {EXCEPTIONS.map((e, i) => (
            <div key={i} className="sh-exception-row">
              <div>
                <div className={`sh-exc-sev is-${e.sevTone}`}>{e.sev}</div>
                <span className={`sh-exc-type is-${e.type}`}>{e.typeLabel}</span>
              </div>
              <div className="sh-exc-desc">
                {e.desc}
                <div className="sh-exc-sub">{e.sub}</div>
              </div>
              <div className="sh-exc-time">{e.time}</div>
              <div className={`sh-exc-retry is-${e.retryTone}`}>{e.retry}</div>
              <button className="sh-btn-exc" onClick={() => toast(e.to)}>Open →</button>
            </div>
          ))}
        </Section>
      )}

      {/* ══════ INCIDENTS ══════ */}
      {showSection('all') && (
        <Section title="Incident History" badge={{ tone: 'neutral', label: 'Last 7 days' }} category="all">
          <div className="sh-incident-header">
            <span>Date</span>
            <span>Incident</span>
            <span>Duration</span>
            <span>Status</span>
          </div>
          {INCIDENTS.map((inc, i) => (
            <div key={i} className="sh-incident-row">
              <div className="sh-incident-date">{inc.date}</div>
              <div className="sh-incident-desc">{inc.desc}</div>
              <div className="sh-incident-dur">{inc.dur}</div>
              <div className={`sh-incident-status is-${inc.statusCls}`}>{inc.status}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

/* ── Helpers ── */
function Section({
  title, badge, meta, category, children,
}: {
  title: string;
  badge?: { tone: 'red' | 'yellow' | 'green' | 'neutral'; label: string };
  meta?: string;
  category: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sh-section" data-category={category}>
      <div className="sh-section__head">
        <div className="sh-section__title">
          {title}
          {badge && <span className={`sh-section__badge is-${badge.tone}`}>{badge.label}</span>}
        </div>
        {meta && <span className="sh-section__meta">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, sub, tone, subTone }: {
  label: string; value: React.ReactNode; sub: string; tone?: 'red' | 'yellow' | 'green'; subTone?: string;
}) {
  return (
    <div className={`sh-summary-card${tone ? ' is-' + tone : ''}`}>
      <div className="sh-summary-label">{label}</div>
      <div className={`sh-summary-value${tone ? ' is-' + tone : ''}`}>{value}</div>
      <div className={`sh-summary-sub${subTone ? ' is-' + subTone : ''}`}>{sub}</div>
    </div>
  );
}

function AlertCard({
  tone, source, title, meta, impact, severity, onClick,
}: {
  tone: 'crit' | 'warn';
  source: string;
  title: string;
  meta: string[];
  impact: React.ReactNode;
  severity: string;
  to: string;
  onClick: () => void;
}) {
  return (
    <div className={`sh-alert-card is-${tone}`}>
      <div className="sh-alert-bar" />
      <div>
        <div className="sh-alert-source">{source}</div>
        <div className="sh-alert-title">{title}</div>
        <div className="sh-alert-meta">
          {meta.map((m) => <span key={m}>{m}</span>)}
        </div>
        <div className={`sh-alert-impact is-${tone}`}>{impact}</div>
      </div>
      <div className="sh-alert-actions">
        <span className={`sh-severity-chip is-${tone === 'crit' ? 'critical' : 'degraded'}`}>{severity}</span>
        <button className="sh-btn-detail" onClick={onClick}>View details →</button>
      </div>
    </div>
  );
}