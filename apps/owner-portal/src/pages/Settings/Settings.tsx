import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useOwner } from '../../context/OwnerContext';
import { useToast } from '../../context/ToastContext';
import PayoutSettings from './components/PayoutSettings';
import SecuritySettings from './components/SecuritySettings';
import PasswordDrawer from './components/PasswordDrawer';
import './Settings.css';

export type SettingsSectionId =
  | 'profile'
  | 'notifications'
  | 'payout'
  | 'preferences'
  | 'security';

const SECTIONS: { id: SettingsSectionId; label: string; icon: ReactNode }[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="3" /><path d="M2 14a6 6 0 0112 0" /></svg>,
  },
  {
    id: 'notifications',
    label: 'Alerts & Updates',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1a5 5 0 00-5 5v3l-1.5 2h13L13 9V6a5 5 0 00-5-5zM6.5 14a1.5 1.5 0 003 0" /></svg>,
  },
  {
    id: 'payout',
    label: 'Payout Overview',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="7" /><path d="M8 1v14M1 8h14" /></svg>,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 4h14M1 8h14M1 12h14" /></svg>,
  },
  {
    id: 'security',
    label: 'Security',
    icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l6 3v4c0 3.5-2.5 6-6 7C5.5 14 3 11.5 3 8V4l5-3z" /></svg>,
  },
];

export default function Settings() {
  const { owner } = useOwner();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('profile');
  const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false);

  const sectionRefs = useRef<Partial<Record<SettingsSectionId, HTMLDivElement | null>>>({});

  /* ── Scroll spy ───────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      let current: SettingsSectionId = 'profile';
      SECTIONS.forEach(({ id }) => {
        const el = sectionRefs.current[id];
        if (el && el.getBoundingClientRect().top < 140) current = id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const registerSection = useCallback(
    (id: SettingsSectionId) => (el: HTMLDivElement | null) => {
      sectionRefs.current[id] = el;
    },
    [],
  );

  const scrollToSection = (id: SettingsSectionId) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="settings-page">
      {/* LEFT NAV */}
      <nav className="settings-nav">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`snav-item${activeSection === section.id ? ' active' : ''}`}
            onClick={() => scrollToSection(section.id)}
          >
            <span className="snav-icon">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <div className="settings-content">
        <AccountStatusBanner />

        {/* Profile */}
        <div
          className="settings-section"
          id="profile"
          ref={registerSection('profile')}
        >
          <ProfileSection ownerName={owner.name} />
        </div>

        <div className="section-divider" />

        {/* Notifications */}
        <div
          className="settings-section"
          id="notifications"
          ref={registerSection('notifications')}
        >
          <NotificationsSection />
        </div>

        <div className="section-divider" />

        {/* Payout */}
        <div
          className="settings-section"
          id="payout"
          ref={registerSection('payout')}
        >
          <PayoutSettings />
        </div>

        <div className="section-divider" />

        {/* Preferences */}
        <div
          className="settings-section"
          id="preferences"
          ref={registerSection('preferences')}
        >
          <PreferencesSection />
        </div>

        <div className="section-divider" />

        {/* Security */}
        <div
          className="settings-section"
          id="security"
          ref={registerSection('security')}
        >
          <SecuritySettings onChangePassword={() => setPasswordDrawerOpen(true)} />
        </div>

        <div style={{ height: 24 }} />
      </div>

      <PasswordDrawer
        open={passwordDrawerOpen}
        onClose={() => setPasswordDrawerOpen(false)}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Sub-components (kept in-file — they're small and only used here)
   ──────────────────────────────────────────────────────────── */

function AccountStatusBanner() {
  return (
    <div className="account-status-banner">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M2 9l4 4 8-8" />
      </svg>
      Account secure · no issues detected
      <span className="account-status-note">2FA on · account secure</span>
    </div>
  );
}

/* ── Profile ──────────────────────────────────────────────── */

function ProfileSection({ ownerName }: { ownerName: string }) {
  const { showToast } = useToast();
  const initials = ownerName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="section-hdr">
        <div className="section-title">Profile</div>
        <div className="section-sub">Your personal information</div>
      </div>

      <div className="panel">
        <div className="avatar-row">
          <div className="profile-avatar">{initials}</div>
          <div className="avatar-info">
            <div className="avatar-name">{ownerName}</div>
            <div className="avatar-role">Account owner</div>
          </div>
          <button
            type="button"
            className="edit-btn"
            onClick={() => showToast('Photo upload — Phase 2', 'info')}
          >
            Change photo
          </button>
        </div>

        <FieldRow
          label="Full Name"
          value={ownerName}
          onClick={() => showToast('Tap to edit name', 'info')}
        />
        <FieldRow
          label="Email Address"
          sub="Used for notifications and login"
          value="marcus@example.com"
          onClick={() => showToast('Tap to edit email', 'info')}
        />
        <FieldRow
          label="Phone Number"
          sub="Used for SMS notifications"
          value="+1 (407) 555-0192"
          onClick={() => showToast('Tap to edit phone', 'info')}
        />
      </div>
    </>
  );
}

function FieldRow({
  label,
  sub,
  value,
  masked,
  onClick,
}: {
  label: string;
  sub?: string;
  value: string;
  masked?: boolean;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      className={`field-row${onClick ? ' field-row--clickable' : ''}`}
      onClick={onClick}
    >
      <div>
        <div className="field-label">{label}</div>
        {sub && <div className="field-sub">{sub}</div>}
      </div>
      <div className="field-right">
        <div className={`field-value${masked ? ' masked' : ''}`}>{value}</div>
        {onClick && (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.8">
            <path d="M11 2l3 3-9 9H2v-3L11 2z" />
          </svg>
        )}
      </div>
    </Wrapper>
  );
}

/* ── Notifications ───────────────────────────────────────── */

interface ToggleDef {
  key: string;
  label: string;
  sub: string;
  defaultOn: boolean;
}

const FINANCIAL_TOGGLES: ToggleDef[] = [
  { key: 'payout-processed', label: 'Payout processed', sub: 'When payout is sent', defaultOn: true },
  { key: 'statement-ready',  label: 'Statement ready',  sub: 'When a new monthly statement is available', defaultOn: true },
];

const APPROVAL_TOGGLES: ToggleDef[] = [
  { key: 'approval-new',      label: 'New approval required', sub: 'When PM submits something for review', defaultOn: true },
  { key: 'approval-reminder', label: 'Approval reminder',     sub: 'If an urgent approval is still pending', defaultOn: true },
];

const INCIDENT_TOGGLES: ToggleDef[] = [
  { key: 'incident-new',      label: 'New incident reported', sub: 'When an issue is reported at a property', defaultOn: true },
  { key: 'incident-resolved', label: 'Incident resolved',     sub: 'When an active issue is closed', defaultOn: false },
];

const GENERAL_TOGGLES: ToggleDef[] = [
  { key: 'weekly-summary', label: 'Weekly summary', sub: 'Brief digest every Monday', defaultOn: true },
];

const ALL_TOGGLES = [
  ...FINANCIAL_TOGGLES,
  ...APPROVAL_TOGGLES,
  ...INCIDENT_TOGGLES,
  ...GENERAL_TOGGLES,
];

function NotificationsSection() {
  const { showToast } = useToast();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_TOGGLES.map((t) => [t.key, t.defaultOn])),
  );

  const [channels, setChannels] = useState({
    push: true,
    email: true,
    sms: false,
  });

  const setToggle = (key: string) => (value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
    showToast('Notification preference saved', 'success');
  };

  const toggleChannel = (channel: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
    showToast('Delivery preference saved', 'success');
  };

  return (
    <>
      <div className="section-hdr">
        <div className="section-title">Alerts &amp; Updates</div>
        <div className="section-sub">
          Choose how you receive updates <span className="section-sub-muted">(all activity appears in Updates)</span>
        </div>
      </div>

      <div className="panel panel--gap">
        <ToggleGroup label="Financial" toggles={FINANCIAL_TOGGLES} state={toggles} onChange={setToggle} />
        <ToggleGroup label="Approvals" toggles={APPROVAL_TOGGLES} state={toggles} onChange={setToggle} />
        <ToggleGroup label="Incidents" toggles={INCIDENT_TOGGLES} state={toggles} onChange={setToggle} />
        <ToggleGroup label="General" toggles={GENERAL_TOGGLES} state={toggles} onChange={setToggle} />
      </div>

      <div className="panel">
        <div className="toggle-group-label">Delivery Channels</div>
        <DeliveryRow
          label="Push notifications"
          sub="In-app and browser"
          on={channels.push}
          onToggle={() => toggleChannel('push')}
        />
        <DeliveryRow
          label="Email"
          sub="Sent to marcus@example.com"
          on={channels.email}
          onToggle={() => toggleChannel('email')}
        />
        <DeliveryRow
          label="SMS"
          sub="Sent to +1 (407) 555-0192"
          on={channels.sms}
          onToggle={() => toggleChannel('sms')}
        />
      </div>
    </>
  );
}

function ToggleGroup({
  label,
  toggles,
  state,
  onChange,
}: {
  label: string;
  toggles: ToggleDef[];
  state: Record<string, boolean>;
  onChange: (key: string) => (value: boolean) => void;
}) {
  return (
    <>
      <div className="toggle-group-label">{label}</div>
      {toggles.map((t) => (
        <div key={t.key} className="toggle-row">
          <div className="toggle-left">
            <div className="toggle-label">{t.label}</div>
            <div className="toggle-sub">{t.sub}</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={state[t.key] ?? false}
              onChange={(e) => onChange(t.key)(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      ))}
    </>
  );
}

function DeliveryRow({
  label,
  sub,
  on,
  onToggle,
}: {
  label: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="delivery-row">
      <div>
        <div className="toggle-label">{label}</div>
        <div className="toggle-sub">{sub}</div>
      </div>
      <div className="delivery-chips">
        <button
          type="button"
          className={`d-chip${on ? ' on' : ''}`}
          onClick={onToggle}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
}

/* ── Preferences ─────────────────────────────────────────── */

function PreferencesSection() {
  const { showToast } = useToast();

  return (
    <>
      <div className="section-hdr">
        <div className="section-title">Preferences</div>
        <div className="section-sub">Customize your experience</div>
      </div>

      <div className="panel">
        <SelectRow
          label="Default Property View"
          sub="Which property to show on load"
          options={['All Properties', 'Seaside Villa', 'Lake Nona Villa', 'Palm Grove Retreat', 'Last used']}
          onChange={() => showToast('Default view saved', 'success')}
        />
        <SelectRow
          label="Time Zone"
          sub="Used for dates and scheduling"
          options={['Eastern Time (ET)', 'Central Time (CT)', 'Mountain Time (MT)', 'Pacific Time (PT)']}
          onChange={() => showToast('Time zone saved', 'success')}
        />
        <SelectRow
          label="Currency Display"
          sub="For financial figures"
          options={['USD ($)', 'EUR (€)', 'GBP (£)']}
          onChange={() => showToast('Currency saved', 'success')}
        />
      </div>
    </>
  );
}

function SelectRow({
  label,
  sub,
  options,
  onChange,
}: {
  label: string;
  sub: string;
  options: string[];
  onChange: () => void;
}) {
  const [value, setValue] = useState(options[0]);
  return (
    <div className="field-row">
      <div>
        <div className="field-label">{label}</div>
        <div className="field-sub">{sub}</div>
      </div>
      <select
        className="settings-select"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange();
        }}
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
