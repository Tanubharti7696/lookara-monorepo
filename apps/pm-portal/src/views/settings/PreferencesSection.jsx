// src/views/settings/PreferencesSection.jsx
import { useState } from 'react';

const TZ = ['Asia/Karachi (PKT · UTC+5)', 'America/New_York (EST · UTC−5)', 'America/Los_Angeles (PST · UTC−8)', 'Europe/London (GMT · UTC+0)', 'Asia/Dubai (GST · UTC+4)'];
const DATE_FMT = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'];
const CURRENCY = ['USD ($)', 'PKR (₨)', 'GBP (£)', 'EUR (€)', 'AED (د.إ)'];
const WEEK_START = ['Monday', 'Sunday', 'Saturday'];

export default function PreferencesSection({ onToast }) {
  const [prefs, setPrefs] = useState({
    timezone: TZ[0],
    dateFormat: DATE_FMT[1],
    currency: CURRENCY[0],
    weekStart: WEEK_START[0],
    defaultCycle: 'Annual',
    autoArchive: true,
    compactMode: false,
    dashboardLanding: 'dashboard',
  });

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));
  const save = () => onToast?.('Preferences saved', 'success');

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Preferences</h1>
          <p className="settings-section__sub">
            Locale, formatting, and display preferences for the workspace.
          </p>
        </div>
        <button className="stg-btn stg-btn--primary" onClick={save}>Save Changes</button>
      </header>

      <div className="pref-block">
        <div className="pref-block__title">Regional</div>
        <PrefRow label="Timezone" hint="Used for all timestamps, due dates, and reports">
          <select className="stg-input" value={prefs.timezone} onChange={e => set('timezone', e.target.value)}>
            {TZ.map(t => <option key={t}>{t}</option>)}
          </select>
        </PrefRow>
        <PrefRow label="Date Format" hint="How dates render across the app">
          <select className="stg-input" value={prefs.dateFormat} onChange={e => set('dateFormat', e.target.value)}>
            {DATE_FMT.map(t => <option key={t}>{t}</option>)}
          </select>
        </PrefRow>
        <PrefRow label="Currency" hint="Applied to invoices, expenses, and reports">
          <select className="stg-input" value={prefs.currency} onChange={e => set('currency', e.target.value)}>
            {CURRENCY.map(t => <option key={t}>{t}</option>)}
          </select>
        </PrefRow>
        <PrefRow label="Week Starts On">
          <select className="stg-input" value={prefs.weekStart} onChange={e => set('weekStart', e.target.value)}>
            {WEEK_START.map(t => <option key={t}>{t}</option>)}
          </select>
        </PrefRow>
      </div>

      <div className="pref-block">
        <div className="pref-block__title">Workspace Defaults</div>
        <PrefRow label="Default Compliance Cycle" hint="Pre-selected when creating a new template">
          <select className="stg-input" value={prefs.defaultCycle} onChange={e => set('defaultCycle', e.target.value)}>
            {['Annual', 'Semi-annual', 'Quarterly', 'Monthly'].map(t => <option key={t}>{t}</option>)}
          </select>
        </PrefRow>
        <PrefRow label="Landing Page" hint="Where you land after login">
          <select className="stg-input" value={prefs.dashboardLanding} onChange={e => set('dashboardLanding', e.target.value)}>
            <option value="dashboard">Dashboard</option>
            <option value="properties">Properties</option>
            <option value="work-orders">Work Orders</option>
            <option value="compliance">Compliance</option>
          </select>
        </PrefRow>
        <PrefToggle label="Auto-archive completed work orders" sub="Moves closed WOs older than 90 days to archive" value={prefs.autoArchive} onChange={v => set('autoArchive', v)} />
        <PrefToggle label="Compact mode" sub="Reduces row height in tables and lists" value={prefs.compactMode} onChange={v => set('compactMode', v)} />
      </div>
    </section>
  );
}

function PrefRow({ label, hint, children }) {
  return (
    <div className="pref-row">
      <div className="pref-row__left">
        <div className="pref-row__label">{label}</div>
        {hint && <div className="pref-row__hint">{hint}</div>}
      </div>
      <div className="pref-row__right">{children}</div>
    </div>
  );
}

function PrefToggle({ label, sub, value, onChange }) {
  return (
    <div className="pref-row">
      <div className="pref-row__left">
        <div className="pref-row__label">{label}</div>
        {sub && <div className="pref-row__hint">{sub}</div>}
      </div>
      <label className="stg-toggle">
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
        <span className="stg-toggle__slider" />
      </label>
    </div>
  );
}