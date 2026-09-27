// src/pages/Settings/components/RulesSections.tsx
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { ROLE_LABELS, ROLE_ORDER, ROLE_SCOPE, ROLE_DESCS } from './data';

/* ═══════════ Compliance Rules ═══════════ */
export function ComplianceRulesSection() {
  const { toast } = useToast();
  const [coi, setCoi] = useState(true);
  const [warnDays, setWarnDays] = useState(21);
  const [editing, setEditing] = useState(false);
  const [block, setBlock] = useState(true);

  return (
    <Section title="Compliance Rules" subtitle="Document and expiry requirements applied to all active vendors.">
      <Block title="Compliance Rules" meta="3 rules">
        <Row label="COI required" sub="Required for all active vendors">
          <Toggle on={coi} onChange={(v) => { setCoi(v); toast(`coi required set to ${v ? 'ON' : 'OFF'} · Sarah Chen · Audit logged.`); }} />
        </Row>
        <Row label="Expiry warning threshold" sub="Warn admin before document expires">
          {editing ? (
            <>
              <input type="number" className="st-number-input" value={warnDays}
                onChange={(e) => setWarnDays(parseInt(e.target.value) || 0)} />
              <span className="st-unit">days</span>
              <button className="st-save-btn" onClick={() => { setEditing(false); toast(`expiry warning updated to ${warnDays}days · Sarah Chen · Audit logged.`); }}>Save</button>
            </>
          ) : (
            <>
              <span className="st-value-num">{warnDays}</span><span className="st-unit">days</span>
              <button className="st-edit-btn" onClick={() => setEditing(true)}>Edit</button>
            </>
          )}
        </Row>
        <Row label="Block on expiry" sub="Blocks vendor on document expiry">
          <Toggle on={block} onChange={(v) => { setBlock(v); toast(`block on expiry set to ${v ? 'ON' : 'OFF'} · Sarah Chen · Audit logged.`); }} />
        </Row>
      </Block>
    </Section>
  );
}

/* ═══════════ SLA Rules ═══════════ */
export function SLARulesSection() {
  const { toast } = useToast();
  const [dispute, setDispute] = useState(48);
  const [flag, setFlag] = useState(24);
  const [editing, setEditing] = useState<string | null>(null);

  const row = (id: string, label: string, sub: string, value: number, setValue: (n: number) => void, unit = 'h') => (
    <Row label={label} sub={sub}>
      {editing === id ? (
        <>
          <input type="number" className="st-number-input" value={value} onChange={(e) => setValue(parseInt(e.target.value) || 0)} />
          <span className="st-unit">{unit}</span>
          <button className="st-save-btn" onClick={() => { setEditing(null); toast(`${label.toLowerCase()} updated to ${value}${unit} · Sarah Chen · Audit logged.`); }}>Save</button>
        </>
      ) : (
        <>
          <span className="st-value-num">{value}</span><span className="st-unit">{unit}</span>
          <button className="st-edit-btn" onClick={() => setEditing(id)}>Edit</button>
        </>
      )}
    </Row>
  );

  return (
    <Section title="SLA Rules" subtitle="Time windows for disputes, flag reviews, and compliance approvals.">
      <Block title="SLA Rules" meta="3 rules">
        {row('dispute', 'Dispute SLA', 'Response window per party', dispute, setDispute)}
        {row('flag', 'Flag review SLA', 'Admin review window per flag', flag, setFlag)}
        <Row label="Compliance review SLA" sub="Admin review window per document">
          <span className="st-value-num">24</span><span className="st-unit">h</span>
        </Row>
      </Block>
    </Section>
  );
}

/* ═══════════ Dispatch Rules ═══════════ */
export function DispatchRulesSection() {
  const { toast } = useToast();
  const [p1, setP1] = useState(90);
  const [p2, setP2] = useState(150);
  const [override, setOverride] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <Section title="Dispatch Rules" subtitle="Auto-assignment windows and emergency override controls.">
      <Block title="Dispatch Rules" meta="Auto-assignment timing">
        <Row label="Phase 1 assignment window" sub="Before moving to next eligible vendor">
          {editing === 'p1' ? (
            <>
              <input type="number" className="st-number-input" value={p1} onChange={(e) => setP1(parseInt(e.target.value) || 0)} />
              <span className="st-unit">s</span>
              <button className="st-save-btn" onClick={() => { setEditing(null); toast(`phase1-window updated to ${p1}s · Sarah Chen · Audit logged.`); }}>Save</button>
            </>
          ) : (<>
            <span className="st-value-num">{p1}</span><span className="st-unit">s</span>
            <button className="st-edit-btn" onClick={() => setEditing('p1')}>Edit</button>
          </>)}
        </Row>
        <Row label="Phase 2 assignment window" sub="Secondary vendor pool window">
          {editing === 'p2' ? (
            <>
              <input type="number" className="st-number-input" value={p2} onChange={(e) => setP2(parseInt(e.target.value) || 0)} />
              <span className="st-unit">s</span>
              <button className="st-save-btn" onClick={() => { setEditing(null); toast(`phase2-window updated to ${p2}s · Sarah Chen · Audit logged.`); }}>Save</button>
            </>
          ) : (<>
            <span className="st-value-num">{p2}</span><span className="st-unit">s</span>
            <button className="st-edit-btn" onClick={() => setEditing('p2')}>Edit</button>
          </>)}
        </Row>
        <Row label="Emergency override" sub="Manual PM override during failure">
          <Toggle on={override} onChange={(v) => { setOverride(v); toast(`emergency-override set to ${v ? 'ON' : 'OFF'} · Sarah Chen · Audit logged.`); }} />
        </Row>
      </Block>
    </Section>
  );
}

/* ═══════════ Platform Controls ═══════════ */
export function PlatformControlsSection() {
  const { toast } = useToast();
  const [escalation, setEscalation] = useState(true);
  const [limit, setLimit] = useState(true);
  const [retry, setRetry] = useState(true);

  return (
    <Section title="Platform Controls" subtitle="Automation rules for escalation, vendor limits, and job retries.">
      <Block title="Platform Controls" meta="3 controls">
        <Row label="Auto-escalation" sub="Escalates to admin at threshold">
          <Toggle on={escalation} onChange={(v) => { setEscalation(v); toast(`auto-escalation set to ${v ? 'ON' : 'OFF'} · Sarah Chen · Audit logged.`); }} />
        </Row>
        <Row label="Auto-limit vendors" sub="Set to Limited after 2 flags (30d)">
          <Toggle on={limit} onChange={(v) => { setLimit(v); toast(`auto-limit-vendors set to ${v ? 'ON' : 'OFF'} · Sarah Chen · Audit logged.`); }} />
        </Row>
        <Row label="Retry logic" sub="Auto-retries failed jobs up to 3×">
          <Toggle on={retry} onChange={(v) => { setRetry(v); toast(`retry-logic set to ${v ? 'ON' : 'OFF'} · Sarah Chen · Audit logged.`); }} />
        </Row>
      </Block>
      <div className="st-phase2">
        <strong>Phase 2 (planned):</strong> API Console · IP Allowlisting · Device Fingerprinting · Advanced Security Policies
      </div>
    </Section>
  );
}

/* ═══════════ Integrations ═══════════ */
const INTEGRATIONS = [
  { id: 'airbnb',     name: 'Airbnb',               sub: 'OTA Sync · Availability + Reservations' },
  { id: 'bookingcom', name: 'Booking.com',          sub: 'OTA Sync · Availability + Reservations', status: 'degraded' as const },
  { id: 'vrbo',       name: 'Vrbo',                 sub: 'OTA Sync · Availability + Reservations' },
  { id: 'checkr',     name: 'Checkr',               sub: 'Background check provider' },
  { id: 'email-sms',  name: 'Email / SMS Delivery', sub: 'Transactional notifications' },
];

export function IntegrationsSection() {
  const { toast } = useToast();
  const [states, setStates] = useState<Record<string, 'connected' | 'degraded' | 'disconnected'>>({
    airbnb: 'connected', bookingcom: 'degraded', vrbo: 'connected', checkr: 'connected', 'email-sms': 'connected',
  });

  const disconnect = (id: string, name: string) => {
    if (!window.confirm(`Disconnect ${name}? Sync will stop immediately. Credentials will be removed. Audit-logged.`)) return;
    setStates((s) => ({ ...s, [id]: 'disconnected' }));
    toast(`${name} disconnected · Sarah Chen · Audit logged.`);
  };
  const reconnect = (id: string, name: string) => {
    setStates((s) => ({ ...s, [id]: 'connected' }));
    toast(`${name} — Reconnecting… Enter API credentials in the Configure panel. Full sync resumes after verification.`);
  };

  return (
    <Section title="Integrations" subtitle="Connected OTA platforms and service providers. All changes are audit-logged.">
      <Block title="Integrations" meta="5 integrations · 1 degraded">
        {INTEGRATIONS.map((i) => {
          const state = states[i.id];
          const chipClass = state === 'connected' ? 'chip-connected' : state === 'degraded' ? 'chip-degraded' : 'chip-off';
          const chipLabel = state === 'connected' ? 'Connected' : state === 'degraded' ? 'Degraded' : 'Disconnected';
          return (
            <Row key={i.id} label={i.name} sub={i.sub}>
              <div className="st-integration-actions">
                <span className={chipClass}>{chipLabel}</span>
                {state === 'connected' && (
                  <>
                    <button className="st-btn-integration" onClick={() => toast(`${i.name} — Configure: API key, webhook URL, sync interval.`)}>Configure</button>
                    <button className="st-btn-integration is-danger" onClick={() => disconnect(i.id, i.name)}>Disconnect</button>
                  </>
                )}
                {state === 'degraded' && (
                  <>
                    <button className="st-btn-integration is-warn" onClick={() => reconnect(i.id, i.name)}>Reconnect</button>
                    <button className="st-btn-integration" onClick={() => toast(`${i.name} — Configure: API key, webhook URL, sync interval.`)}>Configure</button>
                    <button className="st-btn-integration is-danger" onClick={() => disconnect(i.id, i.name)}>Disconnect</button>
                  </>
                )}
                {state === 'disconnected' && (
                  <button className="st-btn-integration is-warn" onClick={() => reconnect(i.id, i.name)}>Reconnect</button>
                )}
              </div>
            </Row>
          );
        })}
      </Block>
    </Section>
  );
}

/* ═══════════ Role Templates ═══════════ */
export function RoleTemplatesSection() {
  return (
    <Section
      title="Role Permissions Matrix"
      subtitle="Platform role templates — system-defined default permissions for each administrator role. Individual permission overrides are managed from Admin Team."
    >
      <Block title="Role Permissions Matrix" meta="Super Admin only — read-only reference">
        <div className="st-role-grid">
          {ROLE_ORDER.map((r) => (
            <div key={r} className={`st-role-card is-${r}`}>
              <div className="st-role-card__title">{ROLE_LABELS[r]}</div>
              <div className="st-role-card__desc">{ROLE_DESCS[r]}</div>
              <div className="st-role-card__scope">Scope: {ROLE_SCOPE[r]}</div>
            </div>
          ))}
        </div>
      </Block>
    </Section>
  );
}

/* ═══════════ Shared primitives ═══════════ */
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="st-section">
      <div className="st-section__title">{title}</div>
      <div className="st-section__sub">{subtitle}</div>
      {children}
    </div>
  );
}

function Block({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <div className="st-block">
      <div className="st-block__head">
        <span className="st-block__title">{title}</span>
        {meta && <span className="st-block__meta">{meta}</span>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="st-setting-row">
      <div className="st-setting-label">
        {label}
        {sub && <small>{sub}</small>}
      </div>
      <div className="st-setting-value">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="st-toggle-wrap">
      <button
        type="button"
        className={`st-toggle ${on ? 'is-on' : ''}`}
        onClick={() => onChange(!on)}
        aria-pressed={on}
      >
        <span className="st-toggle__thumb" />
      </button>
      <span className={`st-toggle-label ${on ? 'is-on' : ''}`}>{on ? 'ON' : 'OFF'}</span>
    </div>
  );
}