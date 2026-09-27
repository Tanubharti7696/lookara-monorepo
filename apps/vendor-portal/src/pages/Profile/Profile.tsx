// apps/vendor-portal/src/pages/Profile/Profile.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendor } from '../../context/VendorContext';
import {
  IdentityDrawer, ServicesDrawer, CoverageDrawer,
  CredentialDrawer, PMDrawer,
} from './ProfileDrawers';
import './Profile.css';

/* ── TYPES ── */
export interface Skill { name: string; tier: 'primary' | 'secondary' }
export interface Trade { trade: string; skills: Skill[]; custom: string[] }
export interface PMRel {
  id: string;
  name: string;
  jobs: number;
  status: 'preferred' | 'neutral' | 'limited' | 'stopped';
}
export interface TrustDoc {
  id: string;
  icon: string;
  label: string;
  status: 'verified' | 'expiring' | 'under_review';
  expires: string;
  daysLeft: number;
  impact: string | null;
  pendingUpload: boolean;
}

/* ── TRADE CATALOG ── */
export const TRADE_CATALOG: Record<string, string[]> = {
  'Pool & Water Systems': ['Pool Cleaning','Pool Repair','Pump Systems','Water Leak Detection','Chemical Balancing','Inspections','Spa & Hot Tub Service','Filter Replacement','Heater Systems','Green Pool Recovery','Pressure Testing'],
  'Plumbing': ['Leak Repair','Drain Cleaning','Pipe Installation','Water Heater Service','Fixture Replacement','Backflow Prevention','Sewer Line Service'],
  'HVAC': ['AC Repair','AC Maintenance','Duct Cleaning','Thermostat Installation','Refrigerant Recharge','Coil Cleaning','Air Handler Service'],
  'Electrical': ['Outlet & Switch Repair','Panel Inspection','Circuit Breaker Service','Lighting Installation','GFCI Installation','Ceiling Fan Install'],
  'Cleaning': ['Standard Cleaning','Deep Cleaning','Move-In/Out Cleaning','Post-Construction','Laundry Service','Carpet Cleaning'],
  'Landscaping': ['Lawn Mowing','Hedge Trimming','Irrigation Repair','Tree Service','Mulching','Gutter Cleaning'],
  'Handyman / General Repair': ['General Repairs','Furniture Assembly','Drywall Repair','Caulking & Sealing','Minor Carpentry','Punch List Completion'],
  'Carpentry': ['Cabinet Repair','Trim & Molding','Door Repair','Custom Woodwork','Framing Repair'],
  'Painting': ['Interior Painting','Exterior Painting','Touch-Up & Patch','Cabinet Refinishing','Drywall Patch & Paint'],
  'Flooring': ['Tile Installation','Tile Repair','Laminate & Vinyl Flooring','Hardwood Refinishing','Grout & Caulk Repair'],
  'Roofing': ['Roof Inspection','Leak Repair','Shingle Replacement','Flashing Repair','Gutter Integration'],
  'Locksmith & Access': ['Lock Replacement','Rekeying','Key Duplication','Smart Lock Installation','Access Code Programming','Emergency Lockout Service'],
  'Appliance Repair': ['Refrigerator Repair','Washer & Dryer Repair','Dishwasher Repair','Oven & Range Repair','Appliance Installation'],
  'Pest Control': ['General Pest Treatment','Termite Treatment','Rodent Control','Bed Bug Treatment','Preventive Spraying'],
  'Technology & Smart Home': ['Wi-Fi & Network Setup','Router Installation','Smart Lock Programming','Smart Thermostat Setup','Camera & Doorbell Installation','Streaming Device Setup'],
  'Fire & Life Safety': ['Smoke Detector Service','Fire Extinguisher Inspection','Sprinkler System Service','Fire Alarm Testing','Emergency Lighting Check'],
  'Security Systems': ['Alarm System Install','Camera System Install','Sensor Programming','System Monitoring Setup','Access Control Integration'],
  'Pressure Washing': ['Driveway & Walkway Washing','Siding Washing','Deck & Patio Washing','Roof Soft Washing','Pool Deck Washing'],
  'Waste Removal': ['Junk Removal','Bulk Item Pickup','Construction Debris Removal','Furniture Disposal','Yard Waste Removal'],
};

/* ── PM TRUST SIGNALS ── */
export const PM_TRUST: Record<string, { trust: number; avgPayDays: number; onTimePct: number }> = {
  'Coastal STR':      { trust: 91, avgPayDays: 1.8, onTimePct: 92 },
  'SunState Rentals': { trust: 78, avgPayDays: 3.1, onTimePct: 64 },
  'Premier Stays':    { trust: 84, avgPayDays: 2.4, onTimePct: 81 },
  'BlueWave Mgmt':    { trust: 71, avgPayDays: 4.2, onTimePct: 58 },
};

export const PM_STATUS_CONFIG: Record<PMRel['status'], { label: string; desc: string; dot: string; cls: string }> = {
  preferred: { label: 'Preferred',          desc: 'Priority dispatch — accept all jobs from this PM',   dot: 'var(--emerald)', cls: 'pm-preferred' },
  neutral:   { label: 'Neutral',            desc: 'Standard dispatch — receive jobs normally',          dot: 'var(--slate)',   cls: 'pm-neutral' },
  limited:   { label: 'Limited',            desc: 'Reduced jobs — only accept if no other options',     dot: 'var(--amber)',   cls: 'pm-limited' },
  stopped:   { label: 'Not Receiving Jobs', desc: 'Block — no jobs from this PM until changed',         dot: 'var(--crimson)', cls: 'pm-stopped' },
};

/* ── INITIAL STATE ── */
const INITIAL_TRADES: Trade[] = [
  { trade: 'Pool & Water Systems', custom: [], skills: [
    { name: 'Pool Cleaning',        tier: 'primary' },
    { name: 'Pool Repair',          tier: 'primary' },
    { name: 'Pump Systems',         tier: 'primary' },
    { name: 'Water Leak Detection', tier: 'primary' },
    { name: 'Chemical Balancing',   tier: 'primary' },
    { name: 'Inspections',          tier: 'secondary' },
    { name: 'Spa & Hot Tub Service',tier: 'secondary' },
    { name: 'Filter Replacement',   tier: 'secondary' },
  ]},
  { trade: 'Plumbing', custom: [], skills: [
    { name: 'Leak Repair',          tier: 'primary' },
    { name: 'Water Heater Service', tier: 'primary' },
    { name: 'Drain Cleaning',       tier: 'primary' },
    { name: 'Pipe Installation',    tier: 'secondary' },
    { name: 'Fixture Replacement',  tier: 'secondary' },
  ]},
];

const INITIAL_TRUST: TrustDoc[] = [
  { id: 't-biz', icon: '🏢', label: 'Business License', status: 'verified', expires: 'Jan 15, 2027', daysLeft: 675, impact: null,                                             pendingUpload: false },
  { id: 't-coi', icon: '🛡', label: 'Insurance (COI)',  status: 'expiring', expires: 'Apr 1, 2026',  daysLeft: 21,  impact: 'Emergency dispatch disabled after expiration',    pendingUpload: false },
  { id: 't-bg',  icon: '🔍', label: 'Background Check', status: 'verified', expires: 'Nov 5, 2026',  daysLeft: 604, impact: null,                                             pendingUpload: false },
];

const INITIAL_PMS: PMRel[] = [
  { id: 'pm-001', name: 'Coastal STR',      jobs: 47, status: 'preferred' },
  { id: 'pm-002', name: 'SunState Rentals', jobs: 28, status: 'neutral'   },
  { id: 'pm-003', name: 'Premier Stays',    jobs: 12, status: 'limited'   },
  { id: 'pm-004', name: 'BlueWave Mgmt',    jobs: 3,  status: 'stopped'   },
];

export interface ProfileData {
  name: string;
  category: string;
  location: string;
  radius: number;
  avatarUrl: string | null;
}
const INITIAL_PROFILE: ProfileData = {
  name: 'Marcus Reed',
  category: 'Pool & Water Systems',
  location: 'Orlando, FL',
  radius: 30,
  avatarUrl: null,
};

export interface CoverageData {
  zones: string[];
  radius: number;
  hours: Record<string, string>;
  emergencyOnCall: boolean;
  maxJobsPerDay: number | 'Any';
}
const INITIAL_COVERAGE: CoverageData = {
  zones: ['Orlando','Kissimmee','Lake Nona','Windermere'],
  radius: 30,
  hours: { 'Mon–Fri':'8:00 – 17:00', 'Sat':'9:00 – 14:00', 'Sun':'Off' },
  emergencyOnCall: true,
  maxJobsPerDay: 6,
};

/* ═══════════════════════════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();
  const { showToast } = useVendor();

  const [profile, setProfile]   = useState(INITIAL_PROFILE);
  const [trades, setTrades]     = useState(INITIAL_TRADES);
  const [coverage, setCoverage] = useState(INITIAL_COVERAGE);
  const [trust]                 = useState(INITIAL_TRUST);
  const [pms, setPMs]           = useState(INITIAL_PMS);
  const [drawer, setDrawer]     = useState<
    | { kind: 'identity' }
    | { kind: 'services' }
    | { kind: 'coverage' }
    | { kind: 'credential'; id: string }
    | { kind: 'pm'; id: string }
    | null
  >(null);

  /* ── Profile status line ── */
  const primaryCount = trades.reduce((n, t) => n + t.skills.filter((s) => s.tier === 'primary').length, 0);
  const expiring = trust.filter((t) => t.status === 'expiring');

  const statusLine = (() => {
    if (primaryCount < 2) return { tone: 'warn', text: '⚠ Missing primary services — may limit job visibility' };
    if (expiring.length > 0) return { tone: 'warn', text: `⚠ ${expiring[0].label.replace(' (COI)', '')} expiring — renew to stay fully eligible` };
    return { tone: 'ok', text: '✓ Profile complete — fully eligible for all jobs' };
  })();

  const handleOpenCredential = (id: string) => {
    setDrawer({ kind: 'credential', id });
  };

  const handleOpenPM = (id: string) => {
    setDrawer({ kind: 'pm', id });
  };

  return (
    <>
      <div className="topbar">
        <span className="page-title">Profile</span>
        <div className="topbar-right">
          <button className="btn-icon" onClick={() => showToast('Opening Alerts…')} title="Alerts">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1a5 5 0 015 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" />
            </svg>
            <span className="notif-dot" />
          </button>
        </div>
      </div>

      <div className="profile-page">
        {/* 1. Identity header */}
        <div className="profile-header">
          <div className="ph-top">
            <div className="ph-avatar">
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="" />
                : 'MR'}
            </div>
            <div className="ph-identity">
              <div className="ph-name">{profile.name}</div>
              <div className="ph-tier"><span className="ph-tier-dot" />★ Elite Vendor</div>
              <div className="ph-category">{profile.category}</div>
              <div className="ph-location">📍 {profile.location} &nbsp;·&nbsp; {profile.radius} mi radius</div>
            </div>
            <button className="ph-edit" onClick={() => setDrawer({ kind: 'identity' })}>Edit →</button>
          </div>

          <div className="ph-status-row">
            <div className="ph-status-col">
              <div className="ph-status-lbl">Status</div>
              <div className={`ph-status-line ${statusLine.tone}`}>{statusLine.text}</div>
              <div className="ph-status-sub">Last job: Today</div>
            </div>
            <div className="ph-status-col ph-status-col--right">
              <div className="ph-status-lbl">Performance</div>
              <div className="ph-perf-row">
                <span className="ph-perf-val">94.2</span>
                <span className="ph-perf-tag">ELITE</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Services */}
        <section className="section-card">
          <div className="sc-header">
            <div className="sc-title">Services</div>
            <button className="sc-edit" onClick={() => setDrawer({ kind: 'services' })}>Edit →</button>
          </div>
          <div className="sc-body">
            <div className="svc-grid">
              {trades.map((t, idx) => {
                const primaries = t.skills.filter((s) => s.tier === 'primary');
                const secondaries = t.skills.filter((s) => s.tier === 'secondary');
                return (
                  <div key={t.trade} className="svc-block">
                    {idx > 0 && <div className="svc-divider" />}
                    <div className="svc-trade-lbl">{t.trade}</div>
                    {primaries.length > 0 && (
                      <>
                        <div className="svc-tier-lbl">Primary</div>
                        <div className="svc-chip-row">
                          {primaries.slice(0, 3).map((s) => (
                            <div key={s.name} className="svc-chip primary">{s.name}</div>
                          ))}
                          {primaries.length > 3 && (
                            <button className="svc-chip secondary" onClick={() => setDrawer({ kind: 'services' })}>
                              +{primaries.length - 3} more
                            </button>
                          )}
                        </div>
                      </>
                    )}
                    {secondaries.length > 0 && (
                      <>
                        <div className="svc-tier-lbl svc-tier-lbl--mt">Secondary</div>
                        <div className="svc-chip-row">
                          {secondaries.slice(0, 3).map((s) => (
                            <div key={s.name} className="svc-chip secondary">{s.name}</div>
                          ))}
                          {secondaries.length > 3 && (
                            <button className="svc-chip secondary" onClick={() => setDrawer({ kind: 'services' })}>
                              +{secondaries.length - 3} more
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Coverage */}
        <section className="section-card">
          <div className="sc-header">
            <div className="sc-title">Coverage &amp; Availability</div>
            <button className="sc-edit" onClick={() => setDrawer({ kind: 'coverage' })}>Edit →</button>
          </div>
          <div className="coverage-grid">
            <div className="cov-block">
              <div className="cov-lbl">Coverage</div>
              <div className="cov-primary">{coverage.zones.slice(0, 2).join(' / ')}</div>
              {coverage.zones.length > 2 && (
                <div className="cov-also">Also serves: {coverage.zones.slice(2).join(', ')}</div>
              )}
              <div className="cov-lbl cov-lbl--mt">Max Radius</div>
              <div className="cov-radius">{coverage.radius} <span>mi</span></div>
            </div>
            <div className="cov-block">
              <div className="cov-lbl">Working Hours</div>
              <div className="avail-rows">
                {Object.entries(coverage.hours).map(([d, v]) => (
                  <div key={d} className="avail-row">
                    <span className="avail-day">{d}</span>
                    <span className={`avail-hours ${v === 'Off' ? 'is-off' : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="cov-lbl cov-lbl--mt">Emergency On-Call</div>
              <div className={`avail-toggle ${coverage.emergencyOnCall ? '' : 'is-off'}`}>
                {coverage.emergencyOnCall ? <><span className="avail-toggle-dot" />Enabled</> : 'Disabled'}
              </div>
              <div className="cov-lbl cov-lbl--mt">Typical Availability</div>
              <div className="avail-signal">Usually within 2–4 hrs</div>
            </div>
          </div>
        </section>

        {/* 4. Business & Trust */}
        <section className="section-card">
          <div className="sc-header">
            <div className="sc-title">Business &amp; Credentials</div>
            <span className="sc-note">Managed in Compliance →</span>
          </div>
          <div className="sc-body">
            {trust.map((t) => {
              const badge =
                t.pendingUpload ? (
                  <div className="trust-badge-col">
                    <span className="trust-badge tbadge-ok">Active</span>
                    <span className="trust-badge-note">+ Under Review</span>
                  </div>
                ) : t.status === 'verified' ? (
                  <span className="trust-badge tbadge-ok">Verified</span>
                ) : t.status === 'expiring' ? (
                  <div className="trust-badge-col">
                    <span className="trust-badge tbadge-warn">
                      Expires {t.expires}{t.daysLeft <= 60 ? ` (${t.daysLeft} days)` : ''}
                    </span>
                    <span className="trust-badge-note is-amber">Renew soon</span>
                  </div>
                ) : (
                  <span className="trust-badge tbadge-slate">{t.status}</span>
                );

              return (
                <button key={t.id} className="trust-row" onClick={() => handleOpenCredential(t.id)}>
                  <span className="trust-label"><span className="trust-icon">{t.icon}</span>{t.label}</span>
                  <span className="trust-right">{badge}<span className="trust-caret">›</span></span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. PM Relationships */}
        <section className="section-card">
          <div className="sc-header">
            <div className="sc-title">PM Relationships</div>
            <span className="sc-note">Controls job routing</span>
          </div>
          <div>
            {pms.map((pm) => {
              const cfg = PM_STATUS_CONFIG[pm.status];
              const t = PM_TRUST[pm.name];
              const trustColor = !t ? 'var(--text-muted)' : t.trust >= 85 ? 'var(--text-muted)' : t.trust >= 70 ? 'var(--amber)' : 'var(--crimson)';
              const payColor   = !t ? 'var(--text-muted)' : t.avgPayDays <= 2 ? 'var(--text-muted)' : t.avgPayDays <= 3.5 ? 'var(--amber)' : 'var(--crimson)';
              const onTimeColor= !t ? 'var(--text-muted)' : t.onTimePct >= 85 ? 'var(--text-muted)' : t.onTimePct >= 70 ? 'var(--amber)' : 'var(--crimson)';

              return (
                <button key={pm.id} className="pm-row" onClick={() => handleOpenPM(pm.id)}>
                  <div className="pm-row-main">
                    <div className="pm-row-top">
                      <span className="pm-name">{pm.name}</span>
                      <span className={`pm-status ${cfg.cls}`}>
                        {cfg.label} <span className="pm-status-dot" style={{ background: cfg.dot }} />
                      </span>
                    </div>
                    {t && (
                      <div className="pm-trust-line">
                        {pm.jobs} jobs · <span style={{ color: trustColor }}>Trust {t.trust}</span> · <span style={{ color: payColor }}>{t.avgPayDays}d avg</span> · <span style={{ color: onTimeColor }}>{t.onTimePct}% on-time</span>
                      </div>
                    )}
                  </div>
                  <span className="pm-caret">›</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* DRAWERS */}
      {drawer?.kind === 'identity' && (
        <IdentityDrawer
          profile={profile}
          trades={trades}
          onSave={(p) => { setProfile(p); setDrawer(null); showToast('Identity updated', 'success'); }}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer?.kind === 'services' && (
        <ServicesDrawer
          trades={trades}
          onSave={(t) => { setTrades(t); setDrawer(null); showToast('Services updated', 'success'); }}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer?.kind === 'coverage' && (
        <CoverageDrawer
          coverage={coverage}
          onSave={(c) => { setCoverage(c); setDrawer(null); showToast('Coverage updated', 'success'); }}
          onClose={() => setDrawer(null)}
        />
      )}
      {drawer?.kind === 'credential' && (
        <CredentialDrawer
          doc={trust.find((t) => t.id === drawer.id) ?? null}
          onClose={() => setDrawer(null)}
          onGoCompliance={() => { setDrawer(null); navigate('/compliance'); }}
        />
      )}
      {drawer?.kind === 'pm' && (
        <PMDrawer
          pm={pms.find((p) => p.id === drawer.id) ?? null}
          onUpdate={(id, status) => {
            setPMs((list) => list.map((p) => (p.id === id ? { ...p, status } : p)));
            showToast(`Set to ${PM_STATUS_CONFIG[status].label}`, 'success');
          }}
          onClose={() => setDrawer(null)}
        />
      )}
    </>
  );
}