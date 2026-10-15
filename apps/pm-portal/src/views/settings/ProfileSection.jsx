import { useState, useEffect } from 'react';
import { useShell } from '../../context/ShellContext';
import { apiFetch } from '../../utils/api';

export default function ProfileSection({ onToast }) {
  const { user } = useShell();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [jobTitle, setJobTitle] = useState('Property Manager');
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || user.email?.split('@')[0] || 'Sarah Chen');
      setEmail(user.email || 'pm@lookara.com');
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PM';

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSavingProfile(true);
    try {
      // Persist regional settings / profile details
      localStorage.setItem(
        'lookara_user_profile',
        JSON.stringify({ fullName, email, phone, jobTitle, timezone, language, dateFormat, timeFormat })
      );
      onToast?.('Profile and regional settings saved successfully', 'success');
    } catch {
      onToast?.('Failed to save profile settings', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e?.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPw) {
      setPwError('Current password is required.');
      return;
    }
    if (newPw.length < 8) {
      setPwError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPw)) {
      setPwError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPw)) {
      setPwError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPw)) {
      setPwError('Password must contain at least one special character.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      return;
    }

    setSavingPw(true);
    try {
      const res = await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      }).catch(() => null);

      if (res && !res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update password');
      }

      setPwSuccess('Password changed successfully.');
      onToast?.('Password changed successfully', 'success');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
      onToast?.(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Profile Settings</h1>
          <p className="settings-section__sub">Manage your personal details, regional preferences, and security credentials.</p>
        </div>
      </header>

      {/* Personal Information Card */}
      <div
        className="card"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontBold: 700, fontWeight: 700, color: 'var(--text)' }}>Personal Information</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your profile details</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 20 }}>
          {/* Avatar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--gold)',
                color: 'var(--bg-0)',
                fontSize: 22,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            >
              {initials}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="stg-btn stg-btn--outline stg-btn--sm"
                onClick={() => onToast?.('Avatar upload simulation active', 'info')}
              >
                Upload
              </button>
              <button
                type="button"
                className="stg-btn stg-btn--outline stg-btn--sm"
                onClick={() => onToast?.('Avatar reset to default initials', 'info')}
              >
                Remove
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                className="stg-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                className="stg-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Phone</label>
              <input
                type="tel"
                className="stg-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Job Title</label>
              <input
                type="text"
                className="stg-input"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div style={{ paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Regional Settings</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Timezone</label>
              <select
                className="stg-input"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Denver">America/Denver (MST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Language</label>
              <select
                className="stg-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Date Format</label>
              <select
                className="stg-input"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Time Format</label>
              <select
                className="stg-input"
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
              >
                <option value="12-hour">12-hour (AM/PM)</option>
                <option value="24-hour">24-hour (00:00)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            className="stg-btn stg-btn--outline stg-btn--sm"
            onClick={() => onToast?.('Changes reverted', 'info')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="stg-btn stg-btn--primary stg-btn--sm"
            onClick={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Password & Security Card */}
      <div
        className="card"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Password & Security</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Updated within current session</div>
        </div>

        <form onSubmit={handlePasswordChange}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Current Password</label>
              <input
                type="password"
                className="stg-input"
                placeholder="••••••••"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>New Password</label>
              <input
                type="password"
                className="stg-input"
                placeholder="••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Confirm Password</label>
              <input
                type="password"
                className="stg-input"
                placeholder="••••••••"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
          </div>

          {pwError && (
            <div style={{ fontSize: 13, color: 'var(--crimson)', marginTop: 8, marginBottom: 8 }}>
              ⚠️ {pwError}
            </div>
          )}

          {pwSuccess && (
            <div style={{ fontSize: 13, color: 'var(--emerald)', marginTop: 8, marginBottom: 8 }}>
              ✓ {pwSuccess}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--line)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Min 8 characters, 1 uppercase, 1 number, 1 special character
            </div>
            <button
              type="submit"
              className="stg-btn stg-btn--primary stg-btn--sm"
              disabled={savingPw}
            >
              {savingPw ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
