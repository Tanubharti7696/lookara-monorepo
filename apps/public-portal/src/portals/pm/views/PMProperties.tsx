// src/portals/pm/views/PMProperties.tsx
import { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../../../utils/auth';

export default function PMProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token && !token.startsWith('demo-')) headers['Authorization'] = `Bearer ${token}`;
    fetch(`${API_BASE}/api/v1/properties`, { headers })
      .then(r => r.json()).then(res => setProperties(res.data || res || []))
      .catch(() => setProperties([])).finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    active: 'badge-emerald', inactive: 'badge-muted', maintenance: 'badge-amber',
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Properties</h1>
            <p className="page-subtitle">{properties.length} properties in your portfolio</p>
          </div>
          <button className="btn btn-primary">+ Add Property</button>
        </div>
      </div>
      <div style={{ padding: '24px 32px' }}>
        <input
          className="form-input"
          style={{ maxWidth: 360, marginBottom: 20 }}
          placeholder="Search properties..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading ? (
          <div className="loader-screen" style={{ height: 300 }}><div className="spinner" /></div>
        ) : (
          <div className="grid-3">
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">🏠</div>
                <div className="empty-state-title">No properties found</div>
              </div>
            ) : filtered.map((p: any) => (
              <div key={p.id} className="card" style={{ cursor: 'pointer' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>🏠</span>
                  <span className={`badge ${statusColor[p.status] || 'badge-muted'}`}>{p.status || 'active'}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{p.address || '—'}</div>
                <div className="flex gap-4" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>🛏 {p.bedrooms || '—'} bed</span>
                  <span>🚿 {p.bathrooms || '—'} bath</span>
                  <span>📐 {p.square_feet ? `${p.square_feet} sqft` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
