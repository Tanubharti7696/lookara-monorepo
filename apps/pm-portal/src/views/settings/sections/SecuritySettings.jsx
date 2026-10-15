import { useState } from 'react';
import { Card, CardHeader, Toggle, thStyle, useToast } from '../ui';

const SESSIONS = [
  { id: 'mac',     device: '💻 Chrome on MacOS',   ip: '192.168.1.105', location: 'New York, NY', last: 'Current', current: true },
  { id: 'iphone',  device: '📱 Safari on iPhone',  ip: '10.0.0.23',     location: 'New York, NY', last: '2 hours ago' },
  { id: 'windows', device: '💻 Firefox on Windows', ip: '73.45.123.89', location: 'Miami, FL',    last: '3 days ago' },
];

const EVENTS = [
  { text: '✓ Login successful from Chrome on MacOS',      when: '2 hours ago',  warn: false },
  { text: '✓ 2FA verified via authenticator app',          when: '2 hours ago',  warn: false },
  { text: '✓ Password changed successfully',               when: '45 days ago',  warn: false },
  { text: '⚠️ Failed login attempt from unknown IP',       when: '3 days ago',   warn: true },
];

export default function SecuritySettings() {
  const showToast = useToast();
  const [sessions, setSessions] = useState(SESSIONS);
  const [prefs, setPrefs] = useState({ loginNotify: true, suspicious: true });

  const revoke = (id) => {
    const s = sessions.find(x => x.id === id);
    if (confirm(`Revoke session on ${s.device}?`)) {
      setSessions(prev => prev.filter(x => x.id !== id));
      showToast(`Session revoked on ${s.device}`, 'success');
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="Authentication" note="Password and multi-factor settings" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>Password</div>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
              Last changed 45 days ago
            </div>
            <button className="btn btn-outline btn-small"
              onClick={() => showToast('Go to Profile → Password to change it', 'info')}>
              Change Password
            </button>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>Two-Factor Authentication</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span className="tag tag-gold">Enabled</span>
              <span style={{ fontSize: 13, color: 'var(--white-muted)' }}>Authenticator app</span>
            </div>
            <button className="btn btn-outline btn-small"
              onClick={() => showToast('Opening 2FA management...', 'info')}>
              Manage 2FA
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Active Sessions" note="Devices and locations" />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Device</th>
              <th style={{ ...thStyle, width: 180 }}>Location</th>
              <th style={{ ...thStyle, width: 150 }}>Last Active</th>
              <th style={{ ...thStyle, width: 100, textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 'var(--space-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.device}</div>
                  <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>{s.ip}</div>
                </td>
                <td style={{ padding: 'var(--space-2)', fontSize: 14, color: 'var(--white-muted)' }}>{s.location}</td>
                <td style={{ padding: 'var(--space-2)' }}>
                  {s.current
                    ? <span className="tag tag-gold">Current</span>
                    : <span style={{ fontSize: 14, color: 'var(--white-muted)' }}>{s.last}</span>}
                </td>
                <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>
                  {s.current
                    ? <span style={{ fontSize: 13, color: 'var(--white-muted)' }}>This device</span>
                    : <button className="btn btn-outline btn-small" onClick={() => revoke(s.id)}>Revoke</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 'var(--space-3)' }}>
          <button className="btn btn-outline btn-small"
            onClick={() => {
              if (confirm('This will log you out on all other devices. Continue?')) {
                setSessions(s => s.filter(x => x.current));
                showToast('All other sessions revoked', 'success');
              }
            }}>
            Revoke All Other Sessions
          </button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Security Preferences</div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Session Timeout</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>Auto-logout after inactivity</div>
            </div>
            <select className="input" style={{ maxWidth: 120, fontSize: 14, padding: '6px 10px' }}>
              <option>15 min</option><option>30 min</option><option>1 hour</option><option>Never</option>
            </select>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Login Notifications</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>Email on new device login</div>
            </div>
            <Toggle active={prefs.loginNotify}
              onToggle={() => setPrefs(p => ({ ...p, loginNotify: !p.loginNotify }))} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Suspicious Activity Alerts</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>Failed login attempts</div>
            </div>
            <Toggle active={prefs.suspicious}
              onToggle={() => setPrefs(p => ({ ...p, suspicious: !p.suspicious }))} />
          </div>
        </Card>

        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Access Control</div>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
              IP Whitelist
            </label>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
              Restrict access to specific IPs
            </div>
            <button className="btn btn-outline btn-small" style={{ width: '100%' }}
              onClick={() => showToast('Opening IP whitelist manager...', 'info')}>
              Manage IP Whitelist
            </button>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
              API Rate Limits
            </label>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
              Current: 1000 req/hour
            </div>
            <button className="btn btn-outline btn-small" style={{ width: '100%' }}
              onClick={() => showToast('Contact support to adjust rate limits', 'info')}>
              Request Increase
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent Security Events"
          right={
            <button className="btn btn-outline btn-small"
              onClick={() => showToast('Navigate to Audit History for full log', 'info')}>
              View Full Log
            </button>
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {EVENTS.map((e, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2)',
              background: e.warn ? 'rgba(245,158,11,0.1)' : 'var(--border-soft)',
              border: e.warn ? '1px solid var(--amber)' : 'none',
              borderRadius: 6,
            }}>
              <div style={{ fontSize: 14 }}>{e.text}</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>{e.when}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
