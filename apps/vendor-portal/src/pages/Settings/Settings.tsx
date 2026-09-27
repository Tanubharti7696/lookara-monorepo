// apps/vendor-portal/src/pages/Settings/Settings.tsx
import { useState } from 'react';
import { useVendor } from '../../context/VendorContext';
import { SettingsDrawer, type DrawerKey } from './SettingsDrawers';
import './Settings.css';

interface SettingsState {
  online: boolean;
  jobs: boolean;
  emg: boolean;
  travel: number;
  minjob: number;
  schedule: string;
  quietStart: string;
  quietEnd: string;
  phone: string;
  email: string;
}

const INITIAL: SettingsState = {
  online: true,
  jobs: true,
  emg: true,
  travel: 30,
  minjob: 75,
  schedule: 'Weekly — Fridays',
  quietStart: '22:00',
  quietEnd: '07:00',
  phone: '+1 (407) 555-0182',
  email: 'm.reed@orlandopoolservices.com',
};

/* ═══════════════════════════════════════════════════════════ */
export default function Settings() {
  const { showToast } = useVendor();
  const [S, setS] = useState<SettingsState>(INITIAL);
  const [pausedAll, setPausedAll] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'n-emg': true,
    'n-new-job': true,
    'n-remind': true,
    'n-compliance': true,
    'n-payout': true,
    'd-push': true,
    'd-sms': true,
    'd-email': false,
    'p-autowithdraw': true,
    'sec-2fa': true,
  });
  const [drawer, setDrawer] = useState<DrawerKey | null>(null);

  const setStatus = (key: 'online' | 'jobs' | 'emg') => {
    setS((prev) => ({ ...prev, [key]: !prev[key] }));
    const names = { online: 'Online', jobs: 'Accepting Jobs', emg: 'Emergency Dispatch' };
    showToast(`${names[key]} ${S[key] ? 'disabled' : 'enabled'}`, S[key] ? 'warn' : 'success');
  };

  const togglePauseAll = () => {
    const next = !pausedAll;
    setPausedAll(next);
    setS((prev) => ({ ...prev, online: !next, jobs: !next, emg: !next }));
    showToast(next ? 'All activity paused' : 'Activity resumed', next ? 'warn' : 'success');
  };

  const togGuard = (id: string) => {
    const willOff = toggles[id];
    if (willOff && id === 'n-emg') {
      showToast('Turning off Emergency Alerts may reduce your response rate and job volume', 'warn');
    }
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!willOff || id !== 'n-emg') {
      showToast(`${id.replace(/[-_]/g, ' ')} ${willOff ? 'disabled' : 'enabled'}`, 'info');
    }
  };

  const Toggle = ({ id, gold }: { id: string; gold?: boolean }) => (
    <div className="toggle-wrap">
      <span className={`tg-state ${toggles[id] ? 'on' : 'off'}`}>{toggles[id] ? 'ON' : 'OFF'}</span>
      <button
        className={`toggle ${toggles[id] ? 'on' : ''} ${gold ? 'gold-toggle' : ''}`}
        onClick={() => togGuard(id)}
      />
    </div>
  );

  return (
    <>
      <div className="topbar">
        <span className="page-title">Settings</span>
        <div className="topbar-right">
          <button className="btn-icon" onClick={() => showToast('Opening Alerts…')}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1a5 5 0 015 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" />
            </svg>
            <span className="notif-dot" />
          </button>
        </div>
      </div>

      <div className="settings-page">
        {/* Status */}
        <section className="section-card">
          <div className="sc-hdr"><div className="sc-title">Status</div></div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Online</div>
              <div className="sr-sub">Visible to dispatch system</div>
            </div>
            <div className="toggle-wrap">
              <span className={`tg-state ${S.online ? 'on' : 'off'}`}>{S.online ? 'ON' : 'OFF'}</span>
              <button className={`toggle ${S.online ? 'on' : ''} gold-toggle`} onClick={() => setStatus('online')} />
            </div>
          </div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Accepting Jobs</div>
              <div className="sr-sub">Receiving new job offers</div>
            </div>
            <div className="toggle-wrap">
              <span className={`tg-state ${S.jobs ? 'on' : 'off'}`}>{S.jobs ? 'ON' : 'OFF'}</span>
              <button className={`toggle ${S.jobs ? 'on' : ''}`} onClick={() => setStatus('jobs')} />
            </div>
          </div>
          <div className="setting-row" style={{ borderBottom: 'none' }}>
            <div className="sr-body">
              <div className="sr-label">Emergency Dispatch</div>
              <div className="sr-sub">Available for emergency routing</div>
            </div>
            <div className="toggle-wrap">
              <span className={`tg-state ${S.emg ? 'on' : 'off'}`}>{S.emg ? 'ON' : 'OFF'}</span>
              <button className={`toggle ${S.emg ? 'on' : ''}`} onClick={() => setStatus('emg')} />
            </div>
          </div>
        </section>

        {/* Pause all */}
        <div className={`pause-all-card ${pausedAll ? 'is-paused' : ''}`}>
          <div>
            <div className="pause-title">Pause All Activity</div>
            <div className="pause-sub">Stops job offers and notifications immediately</div>
          </div>
          <button className={`pause-all-btn ${pausedAll ? 'is-resume' : ''}`} onClick={togglePauseAll}>
            {pausedAll ? 'Resume All' : 'Pause All'}
          </button>
        </div>

        {/* Notifications */}
        <section className="section-card">
          <div className="sc-hdr"><div className="sc-title">Notifications</div></div>

          <div className="group-lbl is-crimson">Critical</div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Emergency Alerts</div>
              <div className="sr-sub">Immediate notification for emergency dispatch</div>
            </div>
            <Toggle id="n-emg" />
          </div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">New Job Alerts</div>
              <div className="sr-sub">Notified when a new job is offered</div>
            </div>
            <Toggle id="n-new-job" />
          </div>

          <div className="group-lbl">Operational</div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Job Reminders</div>
              <div className="sr-sub">Reminders before scheduled jobs</div>
            </div>
            <Toggle id="n-remind" />
          </div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Compliance Alerts</div>
              <div className="sr-sub">Documents expiring or requiring action</div>
            </div>
            <Toggle id="n-compliance" />
          </div>

          <div className="group-lbl">Financial</div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Payout Notifications</div>
              <div className="sr-sub">When payments are processed or verified</div>
            </div>
            <Toggle id="n-payout" />
          </div>

          <div className="sc-hdr sc-hdr--inner"><div className="sc-title">Delivery</div></div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Push Notifications</div>
              <div className="sr-sub">In-app and mobile push</div>
            </div>
            <Toggle id="d-push" />
          </div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">SMS Alerts</div>
              <div className="sr-sub">Emergency + critical only · {S.phone}</div>
            </div>
            <Toggle id="d-sms" />
          </div>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Email</div>
              <div className="sr-sub">{S.email}</div>
            </div>
            <Toggle id="d-email" />
          </div>
          <button className="value-row" onClick={() => setDrawer('quiet-hours')}>
            <div className="vr-label">Quiet Hours</div>
            <div className="vr-right">
              <div className="vr-val">{S.quietStart} – {S.quietEnd}</div>
              <div className="vr-note">Emergency alerts override quiet hours</div>
            </div>
            <div className="vr-caret">›</div>
          </button>
        </section>

        {/* Job preferences */}
        <section className="section-card">
          <div className="sc-hdr"><div className="sc-title">Job Preferences</div></div>
          <button className="value-row" onClick={() => setDrawer('minjob')}>
            <div className="vr-label">Minimum Job Value</div>
            <div className="vr-right">
              <div className="vr-val">${S.minjob}</div>
              <div className="vr-note">May reduce job volume</div>
            </div>
            <div className="vr-caret">›</div>
          </button>
        </section>

        {/* Payments */}
        <section className="section-card">
          <div className="sc-hdr"><div className="sc-title">Payments</div></div>
          <button className="value-row" onClick={() => setDrawer('payout-method')}>
            <div className="vr-label">Payout Method</div>
            <div className="vr-val">ACH ••••4821</div>
            <div className="vr-caret">›</div>
          </button>
          <button className="value-row" onClick={() => setDrawer('payout-schedule')}>
            <div className="vr-label">Payout Schedule</div>
            <div className="vr-val">{S.schedule}</div>
            <div className="vr-caret">›</div>
          </button>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Auto-Withdraw</div>
              <div className="sr-sub">Automatically transfer verified payouts · Transfers every payout cycle</div>
            </div>
            <Toggle id="p-autowithdraw" />
          </div>
          <div className="coming-soon-row">
            <div className="sr-body">
              <div className="sr-label" style={{ color: 'var(--text-muted)' }}>Instant Payout</div>
              <div className="sr-sub">Same-day transfer · Fees may apply</div>
            </div>
            <span className="cs-badge">Coming Soon</span>
          </div>
        </section>

        {/* Account & security */}
        <section className="section-card">
          <div className="sc-hdr"><div className="sc-title">Account &amp; Security</div></div>
          <button className="value-row" onClick={() => setDrawer('phone')}>
            <div className="vr-label">Phone Number</div>
            <div className="vr-val">{S.phone}</div>
            <div className="vr-caret">›</div>
          </button>
          <button className="value-row" onClick={() => setDrawer('email')}>
            <div className="vr-label">Email Address</div>
            <div className="vr-val">{S.email.slice(0, 18)}…</div>
            <div className="vr-caret">›</div>
          </button>
          <button className="value-row" onClick={() => setDrawer('password')}>
            <div className="vr-label">Password</div>
            <div className="vr-val">Change →</div>
            <div className="vr-caret">›</div>
          </button>
          <div className="setting-row">
            <div className="sr-body">
              <div className="sr-label">Two-Factor Authentication</div>
              <div className="sr-sub">SMS code required on login</div>
            </div>
            <Toggle id="sec-2fa" />
          </div>
          <button className="danger-row" onClick={() => setDrawer('logout-all')}>
            <span className="danger-label">Log Out of All Devices</span>
            <span className="vr-caret">›</span>
          </button>
          <button className="danger-row" onClick={() => setDrawer('delete-account')}>
            <span className="danger-label">Delete Account</span>
            <span className="vr-caret">›</span>
          </button>
        </section>
      </div>

      {/* DRAWERS */}
      {drawer && (
        <SettingsDrawer
          kind={drawer}
          state={S}
          onStateChange={(patch) => setS((prev) => ({ ...prev, ...patch }))}
          onClose={() => setDrawer(null)}
          showToast={showToast}
        />
      )}
    </>
  );
}