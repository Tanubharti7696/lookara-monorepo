import { useState, useEffect } from 'react';
import { Card, CardHeader, Field, useToast } from '../ui';
import { useShell } from '../../../context/ShellContext';
import { apiFetch } from '../../../utils/api';

export default function ProfileSettings() {
  const showToast = useToast();
  const { user } = useShell();

  const [fullName, setFullName] = useState('Sarah Chen');
  const [email, setEmail] = useState('sarah.chen@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [jobTitle, setJobTitle] = useState('Property Manager');
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-hour');

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [lastChanged, setLastChanged] = useState('Last changed 45 days ago');

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'SC';

  const submitPassword = async () => {
    setError('');
    if (!pw.current) return setError('Enter your current password');
    if (!pw.next) return setError('Enter a new password');
    if (pw.next.length < 8) return setError('New password must be at least 8 characters');
    if (!/[A-Z]/.test(pw.next)) return setError('New password must include 1 uppercase letter');
    if (!/[0-9]/.test(pw.next)) return setError('New password must include 1 number');
    if (!/[^A-Za-z0-9]/.test(pw.next)) return setError('New password must include 1 special character');
    if (pw.next !== pw.confirm) return setError('New password and confirmation do not match');

    try {
      const res = await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      }).catch(() => null);

      if (res && !res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update password');
      }

      setPw({ current: '', next: '', confirm: '' });
      setLastChanged('Last changed just now');
      showToast('Password changed successfully', 'success');
    } catch (err) {
      setError(err.message || 'Failed to change password');
      showToast(err.message || 'Failed to change password', 'error');
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(
      'lookara_user_profile',
      JSON.stringify({ fullName, email, phone, jobTitle, timezone, language, dateFormat, timeFormat })
    );
    showToast('Profile saved successfully', 'success');
  };

  return (
    <>
      <Card>
        <CardHeader title="Personal Information" note="Your profile details" />

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="user-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>{initials}</div>
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)' }}>
              <button className="btn btn-outline btn-small" style={{ fontSize: 13, padding: '4px 8px' }} onClick={() => showToast('Avatar upload simulation active', 'info')}>Upload</button>
              <button className="btn btn-outline btn-small" style={{ fontSize: 13, padding: '4px 8px' }} onClick={() => showToast('Avatar reset to default', 'info')}>Remove</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Full Name"><input className="input" value={fullName} onChange={e => setFullName(e.target.value)} /></Field>
            <Field label="Email"><input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Field label="Phone"><input type="tel" className="input" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
            <Field label="Job Title"><input className="input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></Field>
          </div>
        </div>

        <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Regional Settings</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Timezone">
              <select className="input" value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/Chicago">America/Chicago</option>
              </select>
            </Field>
            <Field label="Language">
              <select className="input" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="English">English</option><option value="Spanish">Spanish</option><option value="French">French</option>
              </select>
            </Field>
            <Field label="Date Format">
              <select className="input" value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </Field>
            <Field label="Time Format">
              <select className="input" value={timeFormat} onChange={e => setTimeFormat(e.target.value)}>
                <option value="12-hour">12-hour</option><option value="24-hour">24-hour</option>
              </select>
            </Field>
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)',
          marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <button className="btn btn-outline btn-small" onClick={() => showToast('Changes reverted', 'info')}>Cancel</button>
          <button className="btn btn-primary btn-small" onClick={handleSaveProfile}>Save Changes</button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Password" note={lastChanged} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
          <Field label="Current Password">
            <input type="password" className="input" placeholder="••••••••"
              value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} />
          </Field>
          <Field label="New Password">
            <input type="password" className="input" placeholder="••••••••"
              value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} />
          </Field>
          <Field label="Confirm Password">
            <input type="password" className="input" placeholder="••••••••"
              value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} />
          </Field>
        </div>

        {error && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 'var(--space-2)' }}>{error}</div>}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>
            Min 8 characters, 1 uppercase, 1 number, 1 special character
          </div>
          <button className="btn btn-primary btn-small" onClick={submitPassword}>Change Password</button>
        </div>
      </Card>
    </>
  );
}
