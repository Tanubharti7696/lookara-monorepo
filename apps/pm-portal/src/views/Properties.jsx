// src/views/Properties.jsx
import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { PROPERTIES as INITIAL_PROPERTIES } from '../data/properties';
import PropertyCard      from './properties/PropertyCard';
import PropertyRow       from './properties/PropertyRow';
import PropertyMap       from './properties/PropertyMap';
import PropertyFilters   from './properties/PropertyFilters';
import AddPropertyModal  from './properties/AddPropertyModal';
import BulkImportWizard  from './properties/BulkImportWizard';
import NotificationRulesDrawer from './properties/NotificationRulesDrawer';
import './Properties.css';
import './properties/PropertyOverlays.css';

const VIEWS = [
  { key: 'grid', label: 'Grid', icon: '▦' },
  { key: 'list', label: 'List', icon: '☰' },
  { key: 'map',  label: 'Map',  icon: '🗺' },
];

export default function Properties({ onToast }) {
  const navigate = useNavigate();
  const [propertiesList, setPropertiesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    apiFetch('/api/v1/properties')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const mapped = data.data.map(p => {
            let mediaArr = p.media || [];
            if (typeof mediaArr === 'string') {
              try { mediaArr = JSON.parse(mediaArr); } catch(e) {}
            }
            return {
              id: p.id,
              name: p.name,
              unit: p.code || '',
              address: p.address_line_1 || p.name,
              city: p.city || 'New York',
              state: p.state || 'NY',
              zip: p.postal_code || '10001',
              units: 1,
              beds: p.beds || 0,
              baths: parseFloat(p.baths) || 0,
              sqft: p.sqft || 0,
              occupancy: 100,
              revenueMtd: 0,
              revenueYtd: 0,
              compliance: 100,
              complianceStatus: 'compliant',
              type: p.property_type || 'STR',
              status: p.status || 'active',
              owner: p.owner_name || 'Primary Owner',
              ownerEmail: p.owner_email || 'owner@lookara.com',
              manager: p.manager_name || p.organization_name || 'PM Staff',
              template: p.compliance_template || 'None',
              emoji: '🏢',
              openWOs: parseInt(p.active_jobs_count || '0', 10),
              nextDue: 'On Track',
              image: Array.isArray(mediaArr) && mediaArr.length > 0 
                       ? `url(${mediaArr[0]?.dataUrl || mediaArr[0]}) center/cover` 
                       : 'linear-gradient(135deg,#1E293B,#0F172A)',
            };
          });
          setPropertiesList(mapped);
        }
      })
      .catch(err => console.error('Failed to load properties:', err))
      .finally(() => setIsLoading(false));
  }, []);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: 'all', status: 'all', compliance: 'all', city: 'all' });

  const [addOpen, setAddOpen]       = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [rulesOpen, setRulesOpen]   = useState(false);

  const handleAddProperty = (newProp) => {
    const payload = {
      name: newProp.name,
      unit: newProp.unit || '',
      addressLine1: newProp.address || newProp.name,
      city: newProp.city || 'New York',
      state: newProp.state || 'NY',
      postalCode: newProp.zip || '10001',
      beds: newProp.beds || 0,
      baths: newProp.baths || 0,
      sqft: newProp.sqft || 0,
      type: newProp.type || 'STR',
      owner: newProp.owner || '',
      ownerEmail: newProp.ownerEmail || '',
      manager: newProp.manager || '',
      template: newProp.template || '',
      amenities: newProp.amenities || [],
      media: (newProp.media || []).map(m => m.dataUrl || m)
    };
    
    apiFetch('/api/v1/properties', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then(p => {
        if (!p || !p.data || !p.data.id) return;
        
        let mediaArr = newProp.media || [];
        if (typeof mediaArr === 'string') {
          try { mediaArr = JSON.parse(mediaArr); } catch(e) {}
        }
        const created = {
          id: p.data.id,
          name: p.data.name,
          unit: newProp.unit || '',
          address: p.data.address_line_1 || p.data.name,
          city: p.data.city || 'New York',
          state: p.data.state || 'NY',
          zip: p.data.postal_code || '10001',
          units: parseInt(newProp.unit, 10) || 1,
          beds: parseInt(newProp.beds, 10) || 2,
          baths: parseInt(newProp.baths, 10) || 1,
          sqft: parseInt(newProp.sqft, 10) || 1100,
          occupancy: 100,
          revenueMtd: 0,
          revenueYtd: 0,
          compliance: 100,
          complianceStatus: 'compliant',
          type: newProp.type || 'STR',
          status: 'active',
          owner: newProp.owner || 'Primary Owner',
          ownerEmail: newProp.ownerEmail || 'owner@lookara.com',
          manager: newProp.manager || 'PM Staff',
          template: newProp.template || 'NYC STR Compliance',
          emoji: '🏢',
          openWOs: 0,
          nextDue: 'On Track',
          image: Array.isArray(mediaArr) && mediaArr.length > 0 
                   ? `url(${mediaArr[0]?.dataUrl || mediaArr[0]}) center/cover` 
                   : 'linear-gradient(135deg,#1E293B,#0F172A)',
        };
        setPropertiesList(prev => [created, ...prev]);
        setSearch('');
        setFilters({ type: 'all', status: 'all', compliance: 'all', city: 'all' });
        setAddOpen(false);
        onToast?.(`"${newProp.name}" added successfully`, 'success');
      })
      .catch(err => {
        console.error('Failed to create property:', err);
        onToast?.('Failed to save property to backend', 'error');
      });
  };

  const filtered = useMemo(() => propertiesList.filter(p => {
    if (search && !(`${p.name} ${p.address} ${p.city}`.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filters.type !== 'all' && p.type !== filters.type) return false;
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.city !== 'all' && p.city !== filters.city) return false;
    if (filters.compliance !== 'all') {
      if (filters.compliance === 'compliant' && p.complianceStatus !== 'compliant') return false;
      if (filters.compliance === 'attention' && p.complianceStatus !== 'attention') return false;
      if (filters.compliance === 'overdue'   && p.complianceStatus !== 'overdue')   return false;
    }
    return true;
  }), [propertiesList, search, filters]);

  const stats = useMemo(() => ({
    total:      propertiesList.length,
    active:     propertiesList.filter(p => p.status === 'active').length,
    overdue:    propertiesList.filter(p => p.complianceStatus === 'overdue').length,
    occupancy:  propertiesList.length ? Math.round(propertiesList.reduce((s, p) => s + p.occupancy, 0) / propertiesList.length) : 0,
    revenueMtd: propertiesList.reduce((s, p) => s + p.revenueMtd, 0),
  }), [propertiesList]);

  const openDetail = (id) => navigate(`/properties/${id}`);

  return (
    <div className="props-shell">
      <header className="props-head">
        <div>
          <h1 className="props-head__title">Properties</h1>
          <p className="props-head__sub">
            {stats.total} properties · {stats.active} active · {stats.overdue} need attention
          </p>
        </div>
        <div className="props-head__actions">
          <button className="stg-btn stg-btn--outline" onClick={() => setRulesOpen(true)}>
            🔔 Notification Rules
          </button>
          <button className="stg-btn stg-btn--outline" onClick={() => setImportOpen(true)}>
            ⬆ Bulk Import
          </button>
          <button className="stg-btn stg-btn--primary" onClick={() => setAddOpen(true)}>
            + Add Property
          </button>
        </div>
      </header>

      <div className="props-stats">
        <Stat label="Total"          value={stats.total} />
        <Stat label="Active"         value={stats.active} accent="success" />
        <Stat label="Overdue"        value={stats.overdue} accent={stats.overdue > 0 ? 'crimson' : undefined} />
        <Stat label="Avg Occupancy"  value={`${stats.occupancy}%`} />
        <Stat label="Revenue MTD"    value={`$${(stats.revenueMtd / 1000).toFixed(1)}k`} accent="gold" />
      </div>

      <div className="props-toolbar">
        <div className="props-toolbar__search">
          <span className="props-toolbar__search-icon">🔍</span>
          <input
            type="search"
            className="props-search"
            placeholder="Search by name, address, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <PropertyFilters filters={filters} onChange={setFilters} />

        <div className="props-view-toggle">
          {VIEWS.map(v => (
            <button
              key={v.key}
              type="button"
              className={`props-view-btn ${view === v.key ? 'active' : ''}`}
              onClick={() => setView(v.key)}
              title={v.label}
            >
              <span>{v.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="props-content">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Loading properties...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div className="props-empty">
            <div className="props-empty__icon">🔎</div>
            <div className="props-empty__title">No properties match your filters</div>
            <div className="props-empty__sub">Try clearing filters or adjusting your search.</div>
          </div>
        ) : view === 'grid' && (
          <div className="props-grid">
            {filtered.map(p => <PropertyCard key={p.id} property={p} onClick={() => openDetail(p.id)} />)}
          </div>
        )}

        {!isLoading && view === 'list' && (
          <div className="props-list">
            <div className="props-list__head">
              <div>Property</div>
              <div>Type</div>
              <div>Status</div>
              <div>Compliance</div>
              <div>Occupancy</div>
              <div>Revenue MTD</div>
              <div>Open WOs</div>
            </div>
            {filtered.map(p => (
              <PropertyRow key={p.id} property={p} onClick={() => openDetail(p.id)} />
            ))}
          </div>
        )}

        {!isLoading && view === 'map' && (
          <PropertyMap properties={filtered} onSelect={openDetail} />
        )}
      </div>

      {addOpen    && <AddPropertyModal        onClose={() => setAddOpen(false)}    onToast={onToast} onAdd={handleAddProperty} />}
      {importOpen && <BulkImportWizard        onClose={() => setImportOpen(false)}  onToast={onToast} />}
      {rulesOpen  && <NotificationRulesDrawer onClose={() => setRulesOpen(false)}   onToast={onToast} />}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={`props-stat ${accent ? `props-stat--${accent}` : ''}`}>
      <div className="props-stat__value">{value}</div>
      <div className="props-stat__label">{label}</div>
    </div>
  );
}