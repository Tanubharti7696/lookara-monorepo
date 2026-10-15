import { useState } from 'react';
import { Card, CardHeader, Toggle, thStyle, useToast } from '../ui';

const EVENTS = [
  { id: 'emergency',   icon: '🚨', name: 'Emergencies',          desc: 'Critical property alerts',           locked: true },
  { id: 'tasks',       icon: '✓',  name: 'Task Updates',         desc: 'Status changes, completions',        defaults: [true, true, false, false] },
  { id: 'compliance',  icon: '⚖️', name: 'Compliance Deadlines', desc: 'Licenses, permits, inspections',     defaults: [true, true, true, false] },
  { id: 'vendor',      icon: '👥', name: 'Vendor Actions',       desc: 'Assignments, arrivals, completions', defaults: [true, false, false, false] },
  { id: 'billing',     icon: '💳', name: 'Billing & Payments',   desc: 'Invoices, failed payments',          defaults: [true, true, false, false] },
  { id: 'reports',     icon: '📊', name: 'Reports',              desc: 'Scheduled reports ready',            defaults: [true, true, false, false] },
  { id: 'system',      icon: '🔔', name: 'System Updates',       desc: 'New features, maintenance',          defaults: [true, false, false, false] },
];

const CHANNELS = ['inApp', 'email', 'push', 'sms'];

export default function NotificationSettings() {
  const showToast = useToast();
  const [matrix, setMatrix] = useState(() => {
    const m = {};
    EVENTS.forEach(ev => {
      m[ev.id] = ev.locked
        ? { inApp: true, email: true, push: true, sms: true }
        : CHANNELS.reduce((acc, c, i) => ({ ...acc, [c]: ev.defaults[i] }), {});
    });
    return m;
  });

  const toggle = (eventId, channel) => {
    setMatrix(m => ({ ...m, [eventId]: { ...m[eventId], [channel]: !m[eventId][channel] } }));
  };

  return (
    <>
      <Card>
        <CardHeader title="Notification Matrix" note="Configure channels and event preferences" />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Event Type</th>
              {['In-App', 'Email', 'Push', 'SMS'].map(c => (
                <th key={c} style={{ ...thStyle, textAlign: 'center', width: 100 }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map(ev => (
              <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 'var(--space-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.icon} {ev.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>{ev.desc}</div>
                </td>
                {CHANNELS.map(ch => (
                  <td key={ch} style={{ padding: 'var(--space-2)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Toggle
                        active={matrix[ev.id][ch]}
                        locked={ev.locked}
                        onToggle={() => toggle(ev.id, ch)}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>
            🚨 Emergencies are always enabled across all channels
          </div>
          <button className="btn btn-primary btn-small"
            onClick={() => showToast('Notification preferences saved', 'success')}>
            Save Preferences
          </button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Card style={{ padding: 'var(--space-4)', marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>Quiet Hours</div>
          <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 'var(--space-3)' }}>
            Suppress non-critical notifications
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            <select className="input" style={{ fontSize: 14, padding: '6px 10px' }}>
              <option>10:00 PM</option><option>11:00 PM</option><option>12:00 AM</option>
            </select>
            <select className="input" style={{ fontSize: 14, padding: '6px 10px' }}>
              <option>6:00 AM</option><option>7:00 AM</option><option>8:00 AM</option>
            </select>
          </div>
        </Card>

        <Card style={{ padding: 'var(--space-4)', marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>Digest Mode</div>
          <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 'var(--space-3)' }}>
            Group non-urgent notifications
          </div>
          <select className="input" style={{ fontSize: 14, padding: '6px 10px' }}>
            <option>Disabled</option>
            <option>Daily at 9:00 AM</option>
            <option>Daily at 6:00 PM</option>
            <option>Weekly on Monday</option>
          </select>
        </Card>
      </div>
    </>
  );
}
