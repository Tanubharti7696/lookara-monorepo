import { useState, useEffect } from 'react';
import { useShell } from '../../context/ShellContext';
import { apiFetch } from '../../utils/api';

export default function OrganizationSection({ onToast }) {
  const { user } = useShell();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId) {
      setLoading(false);
      return;
    }
    
    apiFetch(`/api/v1/organizations/${orgId}`)
      .then(res => res.json())
      .then(data => {
        setOrg(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId || !org) return;

    setSaving(true);
    try {
      const res = await apiFetch(`/api/v1/organizations/${orgId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: org.name,
          slug: org.slug,
          address: org.address,
          city: org.city,
          state: org.state,
          zip: org.zip
        }),
      });
      if (res.ok) {
        onToast?.('Organization details updated', 'success');
      } else {
        const err = await res.json();
        onToast?.(err.message || 'Failed to update organization', 'error');
      }
    } catch (error) {
      onToast?.('Failed to update organization', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate)' }}>Loading organization...</div>;
  }

  if (!org) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate)' }}>Organization not found.</div>;
  }

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Organization Profile</h1>
          <p className="settings-section__sub">
            Manage your company details and public profile.
          </p>
        </div>
      </header>

      <form onSubmit={handleSave} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Organization Name</label>
          <input type="text" required value={org.name || ''} onChange={e => setOrg({ ...org, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Slug (URL alias)</label>
          <input type="text" required value={org.slug || ''} onChange={e => setOrg({ ...org, slug: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Address</label>
          <input type="text" value={org.address || ''} onChange={e => setOrg({ ...org, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>City</label>
            <input type="text" value={org.city || ''} onChange={e => setOrg({ ...org, city: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>State</label>
            <input type="text" value={org.state || ''} onChange={e => setOrg({ ...org, state: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>ZIP Code</label>
            <input type="text" value={org.zip || ''} onChange={e => setOrg({ ...org, zip: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} />
          </div>
        </div>

        <button type="submit" className="stg-btn stg-btn--primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </section>
  );
}
