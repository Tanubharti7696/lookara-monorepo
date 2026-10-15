import { useState, useEffect } from 'react';
import { useShell } from '../../context/ShellContext';
import { apiFetch } from '../../utils/api';

export default function AccountSection({ onToast }) {
  const { user } = useShell();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Extended form fields from prototype
  const [businessType, setBusinessType] = useState('LLC');
  const [taxId, setTaxId] = useState('••-•••••••');
  const [website, setWebsite] = useState('https://chenproperty.com');
  const [industry, setIndustry] = useState('Short-Term Rentals');
  const [portfolioSize, setPortfolioSize] = useState('16-50 properties');

  useEffect(() => {
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId) {
      setLoading(false);
      return;
    }

    apiFetch(`/api/v1/organizations/${orgId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrg(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e?.preventDefault();
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId || !org) return;

    setSaving(true);
    try {
      const res = await apiFetch(`/api/v1/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: org.name,
          slug: org.slug,
          address: org.address,
          city: org.city,
          state: org.state,
          zip: org.zip,
        }),
      });

      if (res.ok) {
        onToast?.('Organization & billing details updated', 'success');
      } else {
        const err = await res.json().catch(() => ({}));
        onToast?.(err.message || 'Failed to update organization', 'error');
      }
    } catch {
      onToast?.('Failed to update organization', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    onToast?.('Data export requested. Download link will be emailed to ' + (user?.email || 'your email'), 'success');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you absolutely sure you want to request account deletion? This action is permanent.')) {
      onToast?.('Account deletion request queued for security review', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading account information...</div>;
  }

  const currentOrg = org || {
    name: 'Chen Property Management',
    slug: 'chen-pm',
    address: '123 Main Street, Suite 400',
    city: 'New York',
    state: 'NY',
    zip: '10001',
  };

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Account & Organization</h1>
          <p className="settings-section__sub">Company details, legal entity information, billing address, and data management.</p>
        </div>
      </header>

      {/* Organization Information Card */}
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
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Organization Information</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Company details and settings</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Organization Name</label>
            <input
              type="text"
              className="stg-input"
              value={currentOrg.name || ''}
              onChange={(e) => setOrg({ ...currentOrg, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Business Type</label>
            <select
              className="stg-input"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              <option value="Individual">Individual</option>
              <option value="LLC">LLC</option>
              <option value="Corporation">Corporation</option>
              <option value="Partnership">Partnership</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Tax ID (EIN)</label>
            <input
              type="text"
              className="stg-input"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Website</label>
            <input
              type="url"
              className="stg-input"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Industry</label>
            <select
              className="stg-input"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="Short-Term Rentals">Short-Term Rentals</option>
              <option value="Long-Term Rentals">Long-Term Rentals</option>
              <option value="Mixed Portfolio">Mixed Portfolio</option>
              <option value="Hospitality">Hospitality</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Portfolio Size</label>
            <select
              className="stg-input"
              value={portfolioSize}
              onChange={(e) => setPortfolioSize(e.target.value)}
            >
              <option value="1-5 properties">1-5 properties</option>
              <option value="6-15 properties">6-15 properties</option>
              <option value="16-50 properties">16-50 properties</option>
              <option value="50+ properties">50+ properties</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            className="stg-btn stg-btn--outline stg-btn--sm"
            onClick={() => onToast?.('Changes cancelled', 'info')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="stg-btn stg-btn--primary stg-btn--sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Billing Details Card */}
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
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Billing Address</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>For invoices, remittances, and receipts</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>Street Address</label>
            <input
              type="text"
              className="stg-input"
              value={currentOrg.address || ''}
              onChange={(e) => setOrg({ ...currentOrg, address: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>City</label>
            <input
              type="text"
              className="stg-input"
              value={currentOrg.city || ''}
              onChange={(e) => setOrg({ ...currentOrg, city: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>State</label>
              <input
                type="text"
                className="stg-input"
                value={currentOrg.state || ''}
                onChange={(e) => setOrg({ ...currentOrg, state: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>ZIP</label>
              <input
                type="text"
                className="stg-input"
                value={currentOrg.zip || ''}
                onChange={(e) => setOrg({ ...currentOrg, zip: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            className="stg-btn stg-btn--primary stg-btn--sm"
            onClick={handleSave}
            disabled={saving}
          >
            Update Address
          </button>
        </div>
      </div>

      {/* Data Management Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div
          className="card"
          style={{
            background: 'rgba(245,158,11,0.05)',
            border: '1px solid var(--amber)',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            ⚠️ Export Data
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
            Download a complete export package: properties, tasks, canonical timelines, vendors, and compliance audits.
          </div>
          <button
            type="button"
            className="stg-btn stg-btn--outline stg-btn--sm"
            style={{ width: '100%' }}
            onClick={handleExportData}
          >
            Request Export
          </button>
        </div>

        <div
          className="card"
          style={{
            background: 'rgba(220,38,38,0.05)',
            border: '1px solid var(--crimson)',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--crimson)', marginBottom: 8 }}>
            🗑️ Delete Account
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
            Permanently close organization account and revoke all PM workspace access. This action cannot be undone.
          </div>
          <button
            type="button"
            className="stg-btn stg-btn--danger stg-btn--sm"
            style={{ width: '100%' }}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </section>
  );
}
