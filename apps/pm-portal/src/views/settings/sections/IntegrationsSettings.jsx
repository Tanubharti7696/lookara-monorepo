import { useState } from 'react';
import { Card, CardHeader, Field, thStyle, useToast } from '../ui';

const ACTIVE = [
  { name: 'Airbnb',          desc: 'Listings, reservations, messages', status: 'Active',  connected: '2 days ago',  sync: 'Every 5 min' },
  { name: 'QuickBooks',      desc: 'Accounting, expenses, invoices',   status: 'Active',  connected: '5 hours ago', sync: 'Daily at 2am' },
  { name: 'Stripe',          desc: 'Payments, subscriptions',          status: 'Active',  connected: '1 hour ago',  sync: 'Real-time' },
  { name: 'Google Calendar', desc: 'Events, scheduling',               status: 'Warning', connected: '7 days ago',  sync: 'Hourly' },
];

const AVAILABLE = [
  { id: 'vrbo',    name: 'Vrbo',        desc: 'Sync listings and reservations' },
  { id: 'booking', name: 'Booking.com', desc: 'Channel management' },
  { id: 'zapier',  name: 'Zapier',      desc: 'Automate workflows' },
  { id: 'slack',   name: 'Slack',       desc: 'Team notifications' },
  { id: 'xero',    name: 'Xero',        desc: 'Accounting integration' },
  { id: 'twilio',  name: 'Twilio',      desc: 'SMS messaging' },
];

function copyToClipboard(text, label, showToast) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(label + ' copied to clipboard', 'success'),
      () => fallbackCopy(text, label, showToast)
    );
  } else {
    fallbackCopy(text, label, showToast);
  }
}

function fallbackCopy(text, label, showToast) {
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    showToast(label + ' copied to clipboard', 'success');
  } catch {
    showToast('Could not copy — please copy manually', 'error');
  }
  document.body.removeChild(temp);
}

export default function IntegrationsSettings() {
  const showToast = useToast();
  const [apiKey] = useState('lka_live_51HqZ9xK2mN8pQrT4vW7yA3bC6dE9fG');
  const webhook = 'https://api.lookara.com/webhooks/org_a8f3k2m9';

  return (
    <>
      <Card>
        <CardHeader title="Active Integrations" note="Connected services and APIs" />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Service</th>
              <th style={{ ...thStyle, width: 120 }}>Status</th>
              <th style={{ ...thStyle, width: 150 }}>Connected</th>
              <th style={{ ...thStyle, width: 140 }}>Sync</th>
              <th style={{ ...thStyle, width: 100, textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {ACTIVE.map(i => (
              <tr key={i.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 'var(--space-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>{i.desc}</div>
                </td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <span className={`tag ${i.status === 'Active' ? 'tag-gold' : 'tag-amber'}`}>{i.status}</span>
                </td>
                <td style={{ padding: 'var(--space-2)', fontSize: 14, color: 'var(--white-muted)' }}>{i.connected}</td>
                <td style={{ padding: 'var(--space-2)', fontSize: 14, color: 'var(--white-muted)' }}>{i.sync}</td>
                <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>
                  <button className="btn btn-outline btn-small"
                    onClick={() => showToast(`Managing ${i.name} integration`, 'info')}>
                    {i.status === 'Warning' ? 'Reconnect' : 'Manage'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Available Integrations</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          {AVAILABLE.map(a => (
            <Card key={a.id} style={{ padding: 'var(--space-3)', marginBottom: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-1)' }}>{a.name}</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 'var(--space-3)' }}>{a.desc}</div>
              <button className="btn btn-outline btn-small" style={{ width: '100%' }}
                onClick={() => showToast(`Connecting to ${a.name}...`, 'info')}>
                Connect
              </button>
            </Card>
          ))}
        </div>
      </div>

      <Card style={{ marginTop: 'var(--space-4)' }}>
        <CardHeader title="API Access" note="Developer credentials" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Field label="API Key">
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                className="input"
                readOnly
                value="lka_live_••••••••••••••••"
                style={{ flex: 1, fontFamily: "'Courier New', monospace", fontSize: 14 }}
              />
              <button className="btn btn-outline btn-small"
                onClick={() => copyToClipboard(apiKey, 'API key', showToast)}>
                Copy
              </button>
            </div>
          </Field>

          <Field label="Webhook URL">
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                className="input"
                readOnly
                value={webhook}
                style={{ flex: 1, fontFamily: "'Courier New', monospace", fontSize: 14 }}
              />
              <button className="btn btn-outline btn-small"
                onClick={() => copyToClipboard(webhook, 'Webhook URL', showToast)}>
                Copy
              </button>
            </div>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
          <button className="btn btn-outline btn-small"
            onClick={() => {
              if (confirm('Regenerating your API key will invalidate the current key. Continue?')) {
                showToast('API key regenerated successfully', 'success');
              }
            }}>
            Regenerate Key
          </button>
          <button className="btn btn-outline btn-small"
            onClick={() => showToast('View API documentation at docs.lookara.com', 'info')}>
            View Docs
          </button>
        </div>
      </Card>
    </>
  );
}
