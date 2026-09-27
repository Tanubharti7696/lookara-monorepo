// src/pages/Organizations/components/OrgDrawer.tsx
import { useState } from 'react';
import { type Org, statusLabel, type PerfLevel, type BillingCredit } from './data';
import { type BillingAction } from './BillingModal';

type SectionKey =
  | 'summary' | 'billing' | 'health' | 'risks' | 'team'
  | 'support' | 'vendors' | 'fin' | 'activity' | 'notes';

type Props = {
  org: Org;
  onClose: () => void;
  onAction: (action: BillingAction) => void;
  onOpenHealth: (score: number) => void;
  onToast: (msg: string) => void;
  onSaveNote: (orgId: string, note: string, pinned: boolean) => void;
  onPinnedInfo: (orgId: string) => { pinned: boolean; pinnedBy: string };
};

const STORAGE_NOTE = (id: string) => `adminNotes_${id}`;
const STORAGE_PIN = (id: string) => `adminNotesPinned_${id}`;

export default function OrgDrawer({
  org: o, onClose, onAction, onOpenHealth, onToast, onSaveNote, onPinnedInfo: _onPinnedInfo,
}: Props) {
  void _onPinnedInfo;
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    summary: false, billing: false, health: false, risks: false, team: false,
    support: false, vendors: false, fin: false, activity: false, notes: false,
  });
  const [note, setNote] = useState<string>(() => readLocal(STORAGE_NOTE(o.id)));
  const [pinned, setPinned] = useState<boolean>(() => readLocal(STORAGE_PIN(o.id)) === 'true');
  const [savedAt, setSavedAt] = useState('');
  const [billingCreditLog, setBillingCreditLog] = useState<BillingCredit[]>(o.billing.credits);

  const toggle = (k: SectionKey) => setCollapsed((c) => ({ ...c, [k]: !c[k] }));

  const health = computeHealthScore(o.performance);
  const statusColor: Record<string, string> = {
    healthy: 'var(--green)', 'needs-attention': 'var(--yellow)', 'at-risk': 'var(--red)',
    restricted: 'var(--red)', suspended: 'var(--red)',
  };

  const saveNote = () => {
    onSaveNote(o.id, note, pinned);
    writeLocal(STORAGE_NOTE(o.id), note);
    writeLocal(STORAGE_PIN(o.id), pinned ? 'true' : 'false');
    const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setSavedAt(`${pinned ? '📌 Pinned · ' : ''}Saved at ${t}`);
    onToast(`${pinned ? 'Note pinned — ' : 'Note saved — '}${t}`);
  };

  const _pushBillingLog = (entry: BillingCredit) => setBillingCreditLog((l) => [entry, ...l]);
  void _pushBillingLog;

  return (
    <>
      <div className="og-overlay" onClick={onClose} />
      <aside className="og-drawer">
        <header className="og-drawer__head">
          <div>
            <div className="og-drawer__name">{o.name}</div>
            <div className="og-drawer__meta">
              {o.location}  ·  {o.properties} properties  ·  {o.vendors} vendors  ·  {o.owners} owners
            </div>
          </div>
          <button className="og-drawer__close" onClick={onClose}>✕</button>
        </header>

        <div className="og-drawer__body">
          {/* 1. Summary */}
          <Section title="Organization Summary" isOpen={!collapsed.summary} onToggle={() => toggle('summary')}>
            <div className="og-status-line">
              Organization Status: <strong style={{ color: statusColor[o.status] }}>{statusLabel(o.status)}</strong>
              &nbsp;·&nbsp; Primary PM Status: <strong>{o.pmHealthLabel}</strong>
            </div>
            <SummaryKV label="Properties"   value={String(o.properties)} />
            <SummaryKV label="Vendors"      value={String(o.vendors)} />
            <SummaryKV label="Owners"       value={String(o.owners)} />
            <SummaryKV label="Team Members" value={String(o.users.length)} />
            <SummaryKV label="Last Active"  value={o.users[0]?.lastActive ?? '—'} />
          </Section>

          {/* 2. Subscription & Billing */}
          <Section
            title={<>Subscription &amp; Billing <span className="og-admin-only">Admin only</span></>}
            isOpen={!collapsed.billing}
            onToggle={() => toggle('billing')}
          >
            <BillingGrid org={o} />
            <BillingActions onAction={onAction} />
            <BillingLog entries={billingCreditLog} />
          </Section>

          {/* 3. Organization Health */}
          <Section title="Organization Health" isOpen={!collapsed.health} onToggle={() => toggle('health')}>
            <HealthRows org={o} />
            <HealthScoreBlock score={health.pct} label={health.label} color={health.color} onClick={() => onOpenHealth(health.pct)} />
          </Section>

          {/* 4. Operational Risks */}
          <Section
            title={<>Operational Risks <span className="og-hint-inline">Click any item to navigate</span></>}
            isOpen={!collapsed.risks}
            onToggle={() => toggle('risks')}
          >
            <div className="og-risk-block">
              <RiskCard label="Active Incidents"        count={o.overview.activeIncidents}                                       hint="→ Review Queue"          color={o.overview.activeIncidents > 0 ? 'red' : 'ok'} />
              <RiskCard label="Missing Compliance Docs" count={o.compliance.find((c) => c.label.includes('expired'))?.value ?? '0'} hint="→ Vendors · Compliance" color="red" />
              <RiskCard label="Flagged Vendors"         count={o.compliance.find((c) => c.label.includes('flags'))?.value ?? '0'}  hint="→ Vendors · Flagged"    color="yellow" />
              <RiskCard label="Payment Disputes"        count={o.compliance.find((c) => c.label.includes('Open disputes'))?.value ?? '0'} hint="→ Review Queue · Disputes" color="yellow" />
              <RiskCard label="Pending Approvals"       count={o.overview.pendingApprovals}                                       hint="→ Review Queue"          color={o.overview.pendingApprovals > 5 ? 'red' : 'yellow'} />
              <RiskCard label="Delayed Payouts"         count={o.financial.find((f) => f.label.includes('Delayed'))?.value ?? '0'} hint="→ Financial"             color="yellow" />
            </div>
          </Section>

          {/* 5. Team Members */}
          <Section
            title={<>Team Members <span className="og-hint-inline">{o.users.length} accounts</span></>}
            isOpen={!collapsed.team}
            onToggle={() => toggle('team')}
          >
            {o.users.map((u) => (
              <TeamRow key={u.email} user={u} onToast={onToast} />
            ))}
          </Section>

          {/* 6. Support Cases */}
          <Section
            title={<>Recent Support Cases <span className="og-hint-inline">3 cases</span></>}
            isOpen={!collapsed.support}
            onToggle={() => toggle('support')}
          >
            <SupportCase title="Billing Question" date="Apr 10, 2026" status="Resolved" tone="green" />
            <SupportCase title="API Access Request" date="Apr 12, 2026" status="Open" tone="yellow" />
            <SupportCase title="Vendor Payment Complaint" date="Mar 28, 2026" status="Closed" tone="muted" />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button className="og-link" onClick={() => onToast(`Opening all support cases for ${o.name}`)}>
                View All →
              </button>
            </div>
          </Section>

          {/* 7. Vendor Network */}
          <Section
            title={<>Vendor Network <span className="og-hint-inline">{o.vendors} vendors</span></>}
            isOpen={!collapsed.vendors}
            onToggle={() => toggle('vendors')}
          >
            {vendorNetContent(o)}
          </Section>

          {/* 8. Financial Health */}
          <Section
            title={<>Financial Health <span className="og-hint-inline">Reported · Read-only</span></>}
            isOpen={!collapsed.fin}
            onToggle={() => toggle('fin')}
          >
            {o.financial.map((f) => (
              <div key={f.label} className="og-fin-row">
                <span className="og-fin-lbl">{f.label}</span>
                <span className="og-fin-val">{f.value}</span>
              </div>
            ))}
            <div className="og-fin-note">
              Lookara records reported payouts for audit purposes only. Lookara does not process, hold, or control payments.
            </div>
          </Section>

          {/* 9. Recent Activity */}
          <Section title="Recent Organization Activity" isOpen={!collapsed.activity} onToggle={() => toggle('activity')}>
            <ActivityRow text="Compliance failure detected — 2 expired vendor docs" time="4h ago" tone="red" />
            <ActivityRow text="Vendor suspended — Jake Morris · Plumbing"          time="2h ago" tone="red" />
            <ActivityRow text="PM invited new staff member"                         time="Yesterday" tone="blue" />
            <ActivityRow text="Admin limited PM access — Brett Walsh"               time="Yesterday" tone="yellow" />
            <ActivityRow text="Organization plan upgraded"                          time="Mar 11" tone="green" />
          </Section>

          {/* 10. Internal Notes */}
          <Section
            title={<>Internal Admin Notes <span className="og-admin-only">Admin only</span></>}
            isOpen={!collapsed.notes}
            onToggle={() => toggle('notes')}
            noBorder
          >
            <div className="og-notes-hint">Only visible to platform admins. Not shared with PM, Vendor, or Owner.</div>
            <textarea
              className="og-notes-area"
              placeholder={'e.g. "Organization warned twice about delayed vendor payments."\n"CEO contacted Mar 11."\n"Awaiting legal review."'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="og-notes-foot">
              <div className="og-notes-left">
                <button className="og-notes-save" onClick={saveNote}>Save Internal Note</button>
                <label className="og-pin-label">
                  <input
                    type="checkbox"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="og-pin-check"
                  />
                  Pin Note
                </label>
                {pinned && <span className="og-pinned-by">Pinned by Sarah Chen · Apr 12</span>}
              </div>
              <div className="og-notes-ts">{savedAt}</div>
            </div>
          </Section>
        </div>

        <footer className="og-drawer__foot">
          <button className="og-btn-primary" onClick={() => onToast('Contacting PM Admin…')}>Contact PM Admin</button>
          <button className="og-btn-secondary" onClick={() => onToast('Opening org-wide email…')}>Email Organization</button>
          <button className="og-btn-neutral" onClick={() => onToast('Opening full audit log…')}>View Audit →</button>
          <button className="og-btn-neutral" onClick={() => onToast('Exporting organization data…')}>Export</button>
          <button className="og-btn-neutral" onClick={() => onToast('Setting access limit…')}>Limit Access</button>
          <button className="og-btn-danger" onClick={() => onToast('Suspension requires confirmation. Coming in full build.')}>
            Suspend Organization
          </button>
          <span className="og-drawer__note">Admin actions only · All actions logged</span>
        </footer>
      </aside>
    </>
  );
}

/* ── Helpers ── */
function Section({
  title, isOpen, onToggle, children, noBorder,
}: { title: React.ReactNode; isOpen: boolean; onToggle: () => void; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className={`og-section ${noBorder ? 'og-section--noborder' : ''}`}>
      <div className="og-section__head" onClick={onToggle}>
        <span className="og-section__title">{title}</span>
        <span className={`og-section__toggle ${isOpen ? 'is-open' : ''}`}>▶</span>
      </div>
      {isOpen && <div className="og-section__body">{children}</div>}
    </div>
  );
}

function SummaryKV({ label, value }: { label: string; value: string }) {
  return (
    <div className="og-perf-row">
      <span className="og-perf-name" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{value}</span>
    </div>
  );
}

function PerfLevel_Class(level: PerfLevel) {
  return level === 'good' ? 'is-good' : level === 'ok' ? 'is-ok' : level === 'warn' ? 'is-warn' : 'is-bad';
}

function HealthRows({ org }: { org: Org }) {
  const ops = org.performance.filter((p) => !p.name.includes('No-show') && !p.name.includes('Flagged') && !p.name.includes('Compliance'));
  const ven = org.performance.filter((p) => p.name.includes('No-show') || p.name.includes('Flagged') || p.name.includes('Compliance'));
  const renderRow = (p: (typeof org.performance)[0]) => (
    <div key={p.name} className="og-perf-row">
      <span className="og-perf-name">{p.name}</span>
      <div className="og-perf-right">
        <span className="og-perf-signal">{p.signal}</span>
        <span className={`og-perf-val ${PerfLevel_Class(p.level)}`}>{p.value}</span>
      </div>
    </div>
  );
  const label = (t: string) => <div key={t} className="og-group-label">{t}</div>;
  return (
    <>
      {ops.length > 0 && label('Operations Performance')}
      {ops.map(renderRow)}
      {ven.length > 0 && label('Vendor Network')}
      {ven.map(renderRow)}
    </>
  );
}

function computeHealthScore(perf: Org['performance']) {
  const scoreMap: Record<PerfLevel, number> = { bad: 0, warn: 8, ok: 12, good: 17 };
  const raw = perf.reduce((sum, p) => sum + (scoreMap[p.level] ?? 10), 0);
  const max = perf.length * 17;
  const pct = max > 0 ? Math.round((raw / max) * 100) : 0;
  const label = pct >= 85 ? 'Healthy' : pct >= 65 ? 'Needs attention' : pct >= 45 ? 'At risk' : 'Critical';
  const color = pct >= 85 ? 'var(--green)' : pct >= 65 ? 'var(--yellow)' : 'var(--red)';
  return { pct, label, color };
}

function HealthScoreBlock({ score, label, color, onClick }: { score: number; label: string; color: string; onClick: () => void }) {
  return (
    <div className="og-health-score-block">
      <span className="og-health-score-block__lbl">Health Score</span>
      <div className="og-health-score-block__right">
        <span className="og-health-score-block__num" style={{ color }}>{score}</span>
        <span className="og-health-score-block__of">/ 100</span>
        <span className="og-health-score-block__lbl2" style={{ color }}>{label}</span>
      </div>
      <button className="og-health-score-block__link" onClick={onClick}>View Breakdown →</button>
    </div>
  );
}

function RiskCard({ label, count, hint, color }: { label: string; count: number | string; hint: string; color: string }) {
  const isEmpty = count === '0' || count === 0;
  return (
    <div className="og-risk-card">
      <div>
        <div className={`og-risk-count is-${isEmpty ? 'ok' : color}`}>{count}</div>
        <div className="og-risk-label">{label}</div>
        <div className="og-risk-hint">{hint}</div>
      </div>
    </div>
  );
}

function TeamRow({ user, onToast }: { user: Org['users'][0]; onToast: (m: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user.name;
  return (
    <div className="og-team-row">
      <div className="og-team-head">
        <span className="og-team-name">{name}</span>
        <span className={`og-user-role is-${user.role}`}>{user.role === 'admin' ? 'PM Admin' : 'PM Staff'}</span>
      </div>
      <div className="og-team-meta">
        <span>Status: <strong style={{ color: 'var(--green)' }}>Active</strong></span>
        <span>Permissions: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{user.role === 'admin' ? 'Full' : 'Standard'}</strong></span>
        <span>Last login: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{user.lastActive}</strong></span>
      </div>
      <div className="og-team-meta og-team-meta--email">
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email}</span>
      </div>
      <div className="og-team-actions">
        <div style={{ position: 'relative' }}>
          <button className="og-user-action" onClick={() => setMenuOpen((v) => !v)}>Actions ▾</button>
          {menuOpen && (
            <div className="og-user-menu" onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => { onToast(`Viewing profile for ${name}`); setMenuOpen(false); }}>View Profile</button>
              <button onClick={() => { onToast(`Activity log for ${name}`); setMenuOpen(false); }}>View Activity</button>
              <button onClick={() => { onToast(`Audit log: ${name}`); setMenuOpen(false); }}>Audit</button>
              <button onClick={() => { onToast(`Sessions terminated: ${name}`); setMenuOpen(false); }}>Terminate Sessions</button>
              <button onClick={() => { onToast(`2FA reset: ${name}`); setMenuOpen(false); }}>Reset 2FA</button>
              <button onClick={() => { onToast(`Access limited: ${name}`); setMenuOpen(false); }}>Limit Access</button>
              <button className="is-danger" onClick={() => { onToast(`Suspended: ${name}`); setMenuOpen(false); }}>Suspend</button>
              <button className="is-danger" onClick={() => { onToast(`Disabled: ${name}`); setMenuOpen(false); }}>Disable</button>
              <button onClick={() => { onToast(`Contacting: ${name}`); setMenuOpen(false); }}>Contact</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SupportCase({ title, date, status, tone }: { title: string; date: string; status: string; tone: 'green'|'yellow'|'muted' }) {
  return (
    <div className="og-support-row">
      <div>
        <div className="og-support-title">{title}</div>
        <div className="og-support-date">{date}</div>
      </div>
      <span className={`og-support-status is-${tone}`}>{status}</span>
    </div>
  );
}

function ActivityRow({ text, time, tone }: { text: string; time: string; tone: 'red'|'yellow'|'green'|'blue' }) {
  return (
    <div className="og-activity-row">
      <div className={`og-activity-dot is-${tone}`} />
      <div className="og-activity-text">{text}</div>
      <div className="og-activity-time">{time}</div>
    </div>
  );
}

function BillingGrid({ org }: { org: Org }) {
  const b = org.billing;
  const statusTone = b.status === 'Current' || b.status === 'Promotional'
    ? 'is-green' : b.status === 'Trial' || b.status === 'Paused' ? 'is-yellow' : 'is-red';
  const planColor = b.plan === 'Enterprise' ? 'var(--primary-gold)'
    : b.plan === 'Professional' ? 'var(--blue)' : 'rgba(255,255,255,0.6)';
  return (
    <div className="og-billing-grid">
      <BillingStat label="Plan"             value={b.plan}             color={planColor} />
      <BillingStat label="Billing Status"   value={b.status}           className={statusTone} />
      <BillingStat label="Monthly Rate"     value={b.rate} />
      <BillingStat label="Next Renewal"     value={b.renewal} />
      <BillingStat label="Last Invoice"     value={b.lastBilling}      muted />
      <BillingStat label="Account Manager"  value={b.accountManager}   muted />
      <BillingStat label="Custom Pricing"   value={b.customRate ?? 'None'} muted />
      <BillingStat label="Customer Since"   value={b.customerSince ?? '—'} muted />
    </div>
  );
}

function BillingStat({ label, value, color, muted, className }: { label: string; value: string; color?: string; muted?: boolean; className?: string }) {
  return (
    <div className="og-billing-stat">
      <div className="og-billing-stat__lbl">{label}</div>
      <div className={`og-billing-stat__val ${className ?? ''}`} style={{ color: color ?? (muted ? 'rgba(255,255,255,0.6)' : undefined) }}>
        {value}
      </div>
    </div>
  );
}

const BILLING_ACTIONS: { key: BillingAction; icon: string; title: string; sub: string; danger?: boolean }[] = [
  { key: 'free-month',  icon: '🎁', title: 'Grant Free Month(s)',     sub: 'Complimentary billing period' },
  { key: 'custom-rate', icon: '💲', title: 'Apply Custom Rate',       sub: 'Fixed or percentage discount' },
  { key: 'credit',      icon: '🏷', title: 'Apply Credit',            sub: 'One-time account credit' },
  { key: 'upgrade',     icon: '📈', title: 'Upgrade Plan',            sub: 'Move to higher tier' },
  { key: 'downgrade',   icon: '📉', title: 'Downgrade Plan',          sub: 'Move to lower tier' },
  { key: 'pause',       icon: '⏸', title: 'Pause Billing',           sub: 'Temporary suspension' },
  { key: 'resume',      icon: '▶', title: 'Resume Billing',          sub: 'Reactivate paused account' },
  { key: 'restore',     icon: '↩', title: 'Restore Default Pricing', sub: 'Remove all custom rates & credits' },
];

function BillingActions({ onAction }: { onAction: (a: BillingAction) => void }) {
  return (
    <div className="og-billing-actions">
      {BILLING_ACTIONS.map((a) => (
        <button key={a.key} className="og-billing-btn" onClick={() => onAction(a.key)}>
          <span className="og-billing-btn__icon">{a.icon}</span>
          <span className="og-billing-btn__text">
            <span className="og-billing-btn__title">{a.title}</span>
            <span className="og-billing-btn__sub">{a.sub}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function BillingLog({ entries }: { entries: BillingCredit[] }) {
  return (
    <div className="og-billing-log">
      <div className="og-billing-log__lbl">
        Billing Adjustment Log{' '}
        <span style={{ fontWeight: 400, textTransform: 'none', color: 'rgba(255,255,255,0.2)' }}>
          Admin-only · Audit-recorded
        </span>
      </div>
      {entries.length === 0 ? (
        <div className="og-billing-log__empty">No billing adjustments recorded.</div>
      ) : entries.map((cr, i) => (
        <div key={i} className="og-billing-log__row">
          <div style={{ flex: 1 }}>
            <div className="og-billing-log__desc">{cr.desc}</div>
            <div className="og-billing-log__by">
              <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{cr.adminName ?? cr.by}</strong>
              {' '}&nbsp;·&nbsp; Platform Admin
            </div>
            <div className="og-billing-log__by" style={{ marginTop: 2 }}>
              Reason: {cr.reason} &nbsp;·&nbsp; Ref:{' '}
              <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{cr.ref ?? '—'}</span>
            </div>
          </div>
          <div className="og-billing-log__date">{cr.date}</div>
        </div>
      ))}
    </div>
  );
}

function vendorNetContent(o: Org) {
  const compNum = parseFloat(o.compRate);
  const compColor = compNum >= 95 ? 'var(--green)' : compNum >= 85 ? 'var(--yellow)' : 'var(--red)';
  const metric = (label: string, val: React.ReactNode) => (
    <div key={label} className="og-perf-row">
      <span className="og-perf-name" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
    </div>
  );
  return (
    <>
      <div className="og-group-label">Compliance</div>
      {metric('Compliance Rate', <span style={{ fontWeight: 700, color: compColor }}>{o.compRate}</span>)}
      {metric('Vendors with expired docs', o.compliance.find((c) => c.label.includes('expired'))?.value ?? '—')}
      {metric('Vendors expiring (21d)',    o.compliance.find((c) => c.label.includes('expiring'))?.value ?? '—')}
      <div className="og-group-label">Financial</div>
      {metric('Reported payouts',  o.financial.find((f) => f.label.includes('Reported') || f.label.includes('Payout'))?.value ?? '—')}
      {metric('Delayed payouts',   o.financial.find((f) => f.label.includes('Delayed'))?.value ?? '—')}
      {metric('Avg payout time',   o.financial.find((f) => f.label.includes('Average') || f.label.includes('avg'))?.value ?? '—')}
      {metric('Disputed amounts',  o.compliance.find((c) => c.label.includes('disputes'))?.value ?? '—')}
      <div className="og-group-label">Operations</div>
      {metric('Vendor complaints',     o.compliance.find((c) => c.label.includes('Open disputes'))?.value ?? '—')}
      {metric('Owner approval delays', o.overview.pendingApprovals)}
      {metric('Avg approval time',     o.performance.find((p) => p.name.includes('Approval'))?.value ?? '—')}
      {metric('Vendor no-show rate',   o.performance.find((p) => p.name.includes('No-show'))?.value ?? '—')}
    </>
  );
}

function readLocal(k: string) { try { return localStorage.getItem(k) ?? ''; } catch { return ''; } }
function writeLocal(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* noop */ } }