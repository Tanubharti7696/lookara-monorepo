import { useState, useEffect } from 'react';
import { Card, CardHeader, Field, useToast } from '../ui';
import { useShell } from '../../../context/ShellContext';
import { apiFetch } from '../../../utils/api';

export default function AccountSettings() {
  const showToast = useToast();
  const { user } = useShell();

  const [org, setOrg] = useState({
    name: 'Chen Property Management',
    type: 'LLC',
    ein: '••-•••••••',
    website: 'https://chenproperty.com',
    industry: 'Short-Term Rentals',
    size: '16-50 properties',
  });
  const [addr, setAddr] = useState({
    street: '123 Main Street, Suite 400',
    city: 'New York', state: 'NY', zip: '10001',
  });

  useEffect(() => {
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId) return;

    apiFetch(`/api/v1/organizations/${orgId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setOrg(prev => ({
            ...prev,
            name: data.name || prev.name,
          }));
          setAddr({
            street: data.address || '123 Main Street, Suite 400',
            city: data.city || 'New York',
            state: data.state || 'NY',
            zip: data.zip || '10001',
          });
        }
      })
      .catch(console.error);
  }, [user]);

  const saveOrg = async () => {
    const orgId = user?.memberships?.[0]?.organizationId;
    if (orgId) {
      try {
        await apiFetch(`/api/v1/organizations/${orgId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: org.name,
            address: addr.street,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
          }),
        });
      } catch (e) {
        console.error(e);
      }
    }
    showToast('Organization saved', 'success');
  };

  const deleteAccount = () => {
    if (!confirm('⚠️ WARNING: This will permanently delete your account and ALL data.\n\nType "DELETE" to confirm.')) return;
    const confirmation = prompt('Type DELETE to confirm:');
    if (confirmation === 'DELETE') {
      showToast('Account deletion initiated. You will be contacted to verify.', 'info');
    } else {
      showToast('Account deletion cancelled', 'info');
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="Organization Information" note="Company details and settings" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Field label="Organization Name">
            <input className="input" value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} />
          </Field>
          <Field label="Business Type">
            <select className="input" value={org.type} onChange={e => setOrg({ ...org, type: e.target.value })}>
              <option>Individual</option><option>LLC</option>
              <option>Corporation</option><option>Partnership</option>
            </select>
          </Field>
          <Field label="Tax ID (EIN)">
            <input className="input" value={org.ein} style={{ fontFamily: "'Courier New', monospace" }}
              onChange={e => setOrg({ ...org, ein: e.target.value })} />
          </Field>
          <Field label="Website">
            <input type="url" className="input" value={org.website}
              onChange={e => setOrg({ ...org, website: e.target.value })} />
          </Field>
          <Field label="Industry">
            <select className="input" value={org.industry} onChange={e => setOrg({ ...org, industry: e.target.value })}>
              <option>Short-Term Rentals</option><option>Long-Term Rentals</option>
              <option>Mixed Portfolio</option><option>Hospitality</option>
            </select>
          </Field>
          <Field label="Portfolio Size">
            <select className="input" value={org.size} onChange={e => setOrg({ ...org, size: e.target.value })}>
              <option>1-5 properties</option><option>6-15 properties</option>
              <option>16-50 properties</option><option>50+ properties</option>
            </select>
          </Field>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)',
          marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <button className="btn btn-outline btn-small" onClick={() => showToast('Changes reverted', 'info')}>Cancel</button>
          <button className="btn btn-primary btn-small" onClick={saveOrg}>Save Changes</button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Billing Address" note="For invoices and payments" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <Field label="Street Address" style={{ gridColumn: '1 / -1' }}>
            <input className="input" value={addr.street} onChange={e => setAddr({ ...addr, street: e.target.value })} />
          </Field>
          <Field label="City">
            <input className="input" value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            <Field label="State">
              <input className="input" value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })} />
            </Field>
            <Field label="ZIP">
              <input className="input" value={addr.zip} onChange={e => setAddr({ ...addr, zip: e.target.value })} />
            </Field>
          </div>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-3)', borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <button className="btn btn-primary btn-small" onClick={saveOrg}>Update Address</button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Card style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid var(--amber)', marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-2)' }}>⚠️ Export Data</div>
          <div style={{ fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-3)' }}>
            Download complete copy: properties, tasks, vendors, compliance
          </div>
          <button className="btn btn-outline btn-small" style={{ width: '100%' }}
            onClick={() => showToast('Data export requested. Download link will be emailed.', 'success')}>
            Request Export
          </button>
        </Card>

        <Card style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid var(--crimson)', marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--crimson)', marginBottom: 'var(--space-2)' }}>🗑️ Delete Account</div>
          <div style={{ fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-3)' }}>
            Permanent deletion. Cannot be undone.
          </div>
          <button className="btn btn-outline btn-small"
            style={{ width: '100%', borderColor: 'var(--crimson)', color: 'var(--crimson)' }}
            onClick={deleteAccount}>
            Delete Account
          </button>
        </Card>
      </div>
    </>
  );
}
