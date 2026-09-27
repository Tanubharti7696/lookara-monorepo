// apps/vendor-portal/src/pages/Profile/ProfileDrawers.tsx
import { useRef, useState } from 'react';
import {
  TRADE_CATALOG, PM_STATUS_CONFIG, PM_TRUST,
  type Trade, type CoverageData, type ProfileData, type TrustDoc, type PMRel,
} from './Profile';
import './ProfileDrawers.css';

/* ── Shared shell ── */
function Shell({ onClose, header, children, footer }: {
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <aside className="drawer open">
        <div className="drawer-hdr">{header}</div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-foot">{footer}</div>
      </aside>
    </>
  );
}

/* ═══════════════ IDENTITY DRAWER ═══════════════ */
export function IdentityDrawer({
  profile, trades, onSave, onClose,
}: {
  profile: ProfileData;
  trades: Trade[];
  onSave: (p: ProfileData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [category, setCategory] = useState(profile.category);
  const [location, setLocation] = useState(profile.location);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [hint, setHint] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setHint('File too large — max 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
      setHint('Image ready — will show on job cards and PM view');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">Edit Identity</div>
            <div className="dh-sub">Name · Category · Location</div>
          </div>
          <button className="dh-close" onClick={onClose}>✕</button>
        </>
      }
      footer={
        <>
          <button className="btn-prim" onClick={() => onSave({ name, category, location, radius: profile.radius, avatarUrl })}>Save</button>
          <button className="btn-sec" onClick={onClose}>Cancel</button>
        </>
      }
    >
      <div className="fld">
        <div className="f-label">Profile Image</div>
        <div className="avatar-row">
          <div className="avatar-preview">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : 'MR'}
          </div>
          <div className="avatar-actions">
            <button className="btn-upload" onClick={() => fileRef.current?.click()}>
              {avatarUrl ? 'Replace' : 'Upload'}
            </button>
            {avatarUrl && <button className="btn-remove" onClick={() => { setAvatarUrl(null); setHint(''); }}>Remove</button>}
            <div className="avatar-note">Photo or logo · 1:1 · Max 5MB</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {hint && <div className="avatar-hint">{hint}</div>}
      </div>

      <div className="fld">
        <div className="f-label">Full Name</div>
        <input className="f-input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="fld">
        <div className="f-label">Primary Trade</div>
        <div className="f-sub">How you appear to PMs · Affects your profile card and dispatch identity</div>
        <div className="trade-opts">
          {trades.map((t) => {
            const sel = category === t.trade;
            return (
              <button
                key={t.trade}
                className={`trade-opt ${sel ? 'sel' : ''}`}
                onClick={() => setCategory(t.trade)}
              >
                <span className="trade-opt-dot" />
                <span className="trade-opt-lbl">{t.trade}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fld">
        <div className="f-label">City</div>
        <input className="f-input" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
    </Shell>
  );
}

/* ═══════════════ SERVICES DRAWER ═══════════════ */
export function ServicesDrawer({
  trades, onSave, onClose,
}: {
  trades: Trade[];
  onSave: (t: Trade[]) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<Trade[]>(() => JSON.parse(JSON.stringify(trades)));
  const [activeIdx, setActiveIdx] = useState(0);
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState('');

  const MAX_PRIMARY = 5;
  const MAX_CUSTOM  = 2;

  const active = local[activeIdx];

  const updateActive = (updater: (t: Trade) => Trade) => {
    setLocal((list) => list.map((t, i) => (i === activeIdx ? updater(t) : t)));
  };

  const addSkill = (name: string) => {
    if (!active) return;
    if (active.skills.some((s) => s.name === name)) return;
    const primaryCount = active.skills.filter((s) => s.tier === 'primary').length;
    updateActive((t) => ({ ...t, skills: [...t.skills, { name, tier: primaryCount < MAX_PRIMARY ? 'primary' : 'secondary' }] }));
  };

  const toggleTier = (name: string) => {
    if (!active) return;
    const s = active.skills.find((x) => x.name === name);
    if (!s) return;
    if (s.tier === 'secondary' && active.skills.filter((x) => x.tier === 'primary').length >= MAX_PRIMARY) return;
    updateActive((t) => ({
      ...t,
      skills: t.skills.map((x) => x.name === name ? { ...x, tier: x.tier === 'primary' ? 'secondary' : 'primary' } : x),
    }));
  };

  const removeSkill = (name: string) => {
    updateActive((t) => ({ ...t, skills: t.skills.filter((x) => x.name !== name) }));
  };

  const addCustom = () => {
    if (!active) return;
    const val = custom.trim();
    if (!val) return;
    if (active.custom.length >= MAX_CUSTOM) return;
    if (active.custom.includes(val)) return;
    updateActive((t) => ({ ...t, custom: [...t.custom, val] }));
    setCustom('');
  };

  const removeCustom = (name: string) => {
    updateActive((t) => ({ ...t, custom: t.custom.filter((c) => c !== name) }));
  };

  const removeTrade = (idx: number) => {
    if (local.length <= 1) return;
    const next = local.filter((_, i) => i !== idx);
    setLocal(next);
    setActiveIdx(Math.min(activeIdx, next.length - 1));
  };

  const addTrade = (name: string) => {
    setLocal((list) => [...list, { trade: name, skills: [], custom: [] }]);
    setActiveIdx(local.length);
  };

  if (!active) return null;

  const primaries = active.skills.filter((s) => s.tier === 'primary');
  const secondaries = active.skills.filter((s) => s.tier === 'secondary');
  const selectedNames = active.skills.map((s) => s.name);
  const available = (TRADE_CATALOG[active.trade] || []).filter((n) => !selectedNames.includes(n));
  const addable = Object.keys(TRADE_CATALOG).filter((n) => !local.some((t) => t.trade === n));

  const searchResults = (() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const out: { trade: string; skill: string }[] = [];
    Object.keys(TRADE_CATALOG).forEach((trade) => {
      TRADE_CATALOG[trade].forEach((skill) => {
        if (skill.toLowerCase().includes(q) || trade.toLowerCase().includes(q)) {
          out.push({ trade, skill });
        }
      });
    });
    return out.slice(0, 6);
  })();

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">Edit Services</div>
            <div className="dh-sub">Primary skills get priority in job routing</div>
          </div>
          <button className="dh-close" onClick={onClose}>✕</button>
        </>
      }
      footer={
        <>
          <button className="btn-prim" onClick={() => onSave(local)}>Save</button>
          <button className="btn-sec" onClick={onClose}>Cancel</button>
        </>
      }
    >
      <div className="fld">
        <input
          className="f-input"
          placeholder="Search skills — e.g. pool repair, AC, water heater…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            <div className="sr-label">Suggested matches</div>
            {searchResults.map((r, i) => {
              const already = local.some((t) => t.trade === r.trade && t.skills.some((s) => s.name === r.skill));
              return (
                <div key={i} className="sr-row">
                  <div>
                    <div className="sr-title">{r.skill}</div>
                    <div className="sr-sub">{r.trade}</div>
                  </div>
                  {already
                    ? <span className="sr-added">✓ Added</span>
                    : <button className="sr-add" onClick={() => {
                        const idx = local.findIndex((t) => t.trade === r.trade);
                        if (idx === -1) {
                          setLocal((list) => [...list, { trade: r.trade, skills: [{ name: r.skill, tier: 'primary' }], custom: [] }]);
                        } else {
                          setActiveIdx(idx);
                          setTimeout(() => addSkill(r.skill), 0);
                        }
                      }}>+ Add</button>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fld">
        <div className="f-label">Your Trades</div>
        <div className="trade-tabs">
          {local.map((t, i) => (
            <div key={t.trade} className={`trade-tab ${i === activeIdx ? 'active' : ''}`}>
              <button className="trade-tab-name" onClick={() => setActiveIdx(i)}>{t.trade}</button>
              <button className="trade-tab-remove" onClick={() => removeTrade(i)}>✕</button>
            </div>
          ))}
        </div>
        {addable.length > 0 && (
          <select
            className="f-select"
            value=""
            onChange={(e) => { if (e.target.value) addTrade(e.target.value); }}
          >
            <option value="">+ Add trade…</option>
            {addable.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>

      {primaries.length > 0 && (
        <div className="fld">
          <div className="f-label">Primary — {primaries.length}/{MAX_PRIMARY}</div>
          {primaries.length >= MAX_PRIMARY && <div className="f-warn">Max {MAX_PRIMARY} primary — switch one to secondary to add more</div>}
          <div className="skill-rows">
            {primaries.map((s) => (
              <div key={s.name} className="skill-row primary">
                <span className="skill-row-name">{s.name}</span>
                <div className="skill-row-actions">
                  <button className="skill-btn" onClick={() => toggleTier(s.name)}>Secondary</button>
                  <button className="skill-remove" onClick={() => removeSkill(s.name)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {secondaries.length > 0 && (
        <div className="fld">
          <div className="f-label">Secondary</div>
          <div className="skill-rows">
            {secondaries.map((s) => (
              <div key={s.name} className="skill-row">
                <span className="skill-row-name">{s.name}</span>
                <div className="skill-row-actions">
                  <button className="skill-btn" onClick={() => toggleTier(s.name)}>Primary</button>
                  <button className="skill-remove" onClick={() => removeSkill(s.name)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div className="fld">
          <div className="f-label">Available Skills — tap to add</div>
          <div className="skill-chip-row">
            {available.map((n) => (
              <button key={n} className="skill-chip" onClick={() => addSkill(n)}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {active.custom.length < MAX_CUSTOM && (
        <div className="fld">
          <div className="f-label">Custom Skill <span className="f-sub">(max {MAX_CUSTOM} per trade)</span></div>
          <div className="custom-row">
            <input
              className="f-input"
              placeholder="e.g. Salt system service"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
            <button className="btn-custom-add" onClick={addCustom}>Add</button>
          </div>
          {active.custom.length > 0 && (
            <div className="custom-chips">
              {active.custom.map((c) => (
                <span key={c} className="custom-chip">
                  {c} · unverified
                  <button onClick={() => removeCustom(c)}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="drawer-note is-blue">
        Primary skills (max {MAX_PRIMARY}) get priority in job routing. Secondary improves matching.
      </div>
    </Shell>
  );
}

/* ═══════════════ COVERAGE DRAWER ═══════════════ */
const ZONE_OPTIONS = ['Orlando','Kissimmee','Lake Nona','Windermere','Winter Park','Altamonte Springs','Sanford','Ocoee','Clermont','St. Cloud'];

const ZONE_NEARBY: Record<string, string[]> = {
  'Orlando':   ['Kissimmee','Lake Nona','Winter Park','Windermere'],
  'Kissimmee': ['Orlando','St. Cloud','Clermont','Lake Nona'],
  'Lake Nona': ['Orlando','Kissimmee','St. Cloud'],
  'Windermere':['Orlando','Ocoee','Winter Park','Clermont'],
  'Winter Park':['Orlando','Altamonte Springs','Sanford'],
  'Altamonte Springs':['Orlando','Sanford','Winter Park'],
  'Sanford':   ['Altamonte Springs','Orlando','Ocoee'],
  'Ocoee':     ['Orlando','Windermere','Clermont'],
  'Clermont':  ['Ocoee','Windermere','Kissimmee'],
  'St. Cloud': ['Kissimmee','Lake Nona','Orlando'],
};

export function CoverageDrawer({
  coverage, onSave, onClose,
}: {
  coverage: CoverageData;
  onSave: (c: CoverageData) => void;
  onClose: () => void;
}) {
  const [zones, setZones] = useState(coverage.zones);
  const [radius, setRadius] = useState(coverage.radius);
  const [hours, setHours] = useState(coverage.hours);
  const [onCall, setOnCall] = useState(coverage.emergencyOnCall);
  const [maxJobs, setMaxJobs] = useState(coverage.maxJobsPerDay);
  const [zoneInput, setZoneInput] = useState('');

  const addZone = (z: string) => {
    if (!z || zones.includes(z)) return;
    setZones((list) => [...list, z]);
  };
  const removeZone = (z: string) => setZones((list) => list.filter((x) => x !== z));

  const nearby = Array.from(new Set(
    zones.flatMap((z) => ZONE_NEARBY[z] || []).filter((n) => !zones.includes(n))
  ));
  const others = ZONE_OPTIONS.filter((z) => !zones.includes(z) && !nearby.includes(z));

  const setHour = (k: string, v: string) => setHours((h) => ({ ...h, [k]: v }));

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">Edit Coverage</div>
            <div className="dh-sub">Zones · Radius · Hours · Capacity</div>
          </div>
          <button className="dh-close" onClick={onClose}>✕</button>
        </>
      }
      footer={
        <>
          <button className="btn-prim" onClick={() => onSave({ zones, radius, hours, emergencyOnCall: onCall, maxJobsPerDay: maxJobs })}>Save</button>
          <button className="btn-sec" onClick={onClose}>Cancel</button>
        </>
      }
    >
      <div className="fld">
        <div className="f-label">Primary Zones</div>
        <div className="zone-chips">
          {zones.length === 0 && <span className="zone-empty">No zones selected — type a city below</span>}
          {zones.map((z) => (
            <span key={z} className="zone-chip">
              {z}
              <button onClick={() => removeZone(z)}>✕</button>
            </span>
          ))}
        </div>
        <div className="zone-input-row">
          <input
            className="f-input"
            placeholder="Type a city (e.g. Orlando)…"
            value={zoneInput}
            onChange={(e) => setZoneInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { addZone(zoneInput); setZoneInput(''); } }}
          />
          <button className="btn-zone-add" onClick={() => { addZone(zoneInput); setZoneInput(''); }}>Add</button>
        </div>
        {zoneInput.length > 0 && (
          <div className="zone-suggest">
            {ZONE_OPTIONS.filter((z) => z.toLowerCase().startsWith(zoneInput.toLowerCase()) && !zones.includes(z)).map((z) => (
              <button key={z} className="zone-suggest-item" onClick={() => { addZone(z); setZoneInput(''); }}>{z}</button>
            ))}
          </div>
        )}
        {nearby.length > 0 && (
          <div className="zone-nearby">
            <div className="zone-nearby-lbl">Add nearby areas?</div>
            <div className="zone-chips">
              {nearby.map((z) => (
                <button key={z} className="zone-suggest-chip" onClick={() => addZone(z)}>+ {z}</button>
              ))}
            </div>
          </div>
        )}
        {others.length > 0 && (
          <div className="zone-others">
            <div className="zone-others-lbl">Other zones</div>
            <div className="zone-chips">
              {others.map((z) => (
                <button key={z} className="zone-other-chip" onClick={() => addZone(z)}>+ {z}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fld">
        <div className="f-label">Max Radius — beyond selected zones</div>
        <div className="radius-row">
          <input
            className="f-input radius-input"
            type="number"
            min={5}
            max={150}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value) || 30)}
          />
          <span className="radius-unit">miles</span>
        </div>
      </div>

      <div className="fld">
        <div className="f-label">Working Hours</div>
        <div className="hours-rows">
          {Object.entries(hours).map(([d, v]) => (
            <div key={d} className="hours-row">
              <span className="hours-day">{d}</span>
              <input className="f-input hours-input" value={v} onChange={(e) => setHour(d, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="fld toggle-field">
        <div>
          <div className="f-label" style={{ marginBottom: 0 }}>Emergency On-Call</div>
          <div className="f-sub">Receive emergency dispatch outside working hours</div>
        </div>
        <div className={`toggle ${onCall ? 'on' : ''}`} onClick={() => setOnCall((v) => !v)} />
      </div>

      <div className="fld">
        <div className="f-label">Max Jobs Per Day <span className="f-sub">(optional · helps routing)</span></div>
        <div className="mjpd-row">
          {[4, 6, 8, 'Any' as const].map((v) => {
            const sel = String(maxJobs) === String(v);
            return (
              <button key={String(v)} className={`mjpd-opt ${sel ? 'sel' : ''}`} onClick={() => setMaxJobs(v)}>{v}</button>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

/* ═══════════════ CREDENTIAL DRAWER ═══════════════ */
export function CredentialDrawer({
  doc, onClose, onGoCompliance,
}: {
  doc: TrustDoc | null;
  onClose: () => void;
  onGoCompliance: () => void;
}) {
  if (!doc) return null;
  const statusColor = doc.status === 'verified' ? 'var(--emerald)' : doc.status === 'expiring' ? 'var(--amber)' : 'var(--slate)';
  const statusLabel = doc.status === 'verified' ? 'Verified' : doc.status === 'expiring' ? 'Expiring' : doc.status;
  const daysStr = doc.daysLeft && doc.daysLeft <= 60 ? ` (${doc.daysLeft} days)` : '';

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">{doc.icon} {doc.label}</div>
            <div className="dh-sub" style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</div>
          </div>
          <button className="dh-close" onClick={onClose}>✕</button>
        </>
      }
      footer={
        <>
          <button className="btn-prim" onClick={onGoCompliance}>
            {doc.status === 'expiring' ? 'Renew in Compliance →' : 'View in Compliance →'}
          </button>
          <button className="btn-sec" onClick={onClose}>Close</button>
        </>
      }
    >
      <div className="ds-block">
        <div className="ds-row"><span className="ds-lbl">Status</span><span className="ds-val" style={{ color: statusColor }}>{statusLabel}</span></div>
        {doc.expires && (
          <div className="ds-row">
            <span className="ds-lbl">Expiry</span>
            <span className="ds-val" style={{ color: doc.status === 'expiring' ? 'var(--amber)' : 'var(--text-primary)' }}>
              Expires {doc.expires}{daysStr}
            </span>
          </div>
        )}
        {doc.pendingUpload && (
          <div className="ds-row"><span className="ds-lbl">Renewal</span><span className="ds-val is-blue">Under review</span></div>
        )}
      </div>
      {doc.status === 'expiring' && doc.impact && (
        <div className="drawer-note is-amber">🚫 {doc.impact}</div>
      )}
      <div className="drawer-note is-muted">
        Document uploads and renewals are managed in the <strong>Compliance</strong> page.
      </div>
    </Shell>
  );
}

/* ═══════════════ PM DRAWER ═══════════════ */
export function PMDrawer({
  pm, onUpdate, onClose,
}: {
  pm: PMRel | null;
  onUpdate: (id: string, status: PMRel['status']) => void;
  onClose: () => void;
}) {
  if (!pm) return null;
  const t = PM_TRUST[pm.name];

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">{pm.name}</div>
            <div className="dh-sub">{pm.jobs} jobs completed · Relationship status</div>
          </div>
          <button className="dh-close" onClick={onClose}>✕</button>
        </>
      }
      footer={<button className="btn-sec full" onClick={onClose}>Done</button>}
    >
      {t && (
        <div className="ds-block">
          <div className="ds-block-title">PM Signals</div>
          <div className="ds-row"><span className="ds-lbl">Trust score</span><span className="ds-val">{t.trust}</span></div>
          <div className="ds-row"><span className="ds-lbl">Avg pay time</span><span className="ds-val">{t.avgPayDays}d</span></div>
          <div className="ds-row"><span className="ds-lbl">On-time rate</span><span className="ds-val">{t.onTimePct}%</span></div>
        </div>
      )}

      <div className="fld">
        <div className="f-label">Job Routing Status</div>
        <div className="pm-opts">
          {(Object.keys(PM_STATUS_CONFIG) as PMRel['status'][]).map((key) => {
            const cfg = PM_STATUS_CONFIG[key];
            const sel = pm.status === key;
            return (
              <button key={key} className={`pm-opt ${sel ? 'sel' : ''}`} onClick={() => onUpdate(pm.id, key)}>
                <span className="pm-opt-dot" style={{ background: cfg.dot }} />
                <div>
                  <div className="pm-opt-label">{cfg.label}</div>
                  <div className="pm-opt-desc">{cfg.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="drawer-note is-muted">
        This setting controls how the dispatch engine routes jobs from this PM.
        Changes take effect on the next dispatch cycle.
      </div>
    </Shell>
  );
}