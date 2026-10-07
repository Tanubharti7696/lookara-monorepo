import { apiFetch } from '../utils/api';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditPropertyDrawer from './properties/EditPropertyDrawer';
import './PropertyDetail.css';

const TABS = [
  { key: 'overview',   label: 'Overview'    },
  { key: 'compliance', label: 'Compliance'  },
  { key: 'wos',        label: 'Work Orders' },
  { key: 'financials', label: 'Financials'  },
  { key: 'documents',  label: 'Documents'   },
];

export default function PropertyDetail({ onToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    apiFetch(`/api/v1/properties`)
      .then(r => r.json())
      .then(res => {
        const raw = res.data?.find(x => x.id === id);
        if (raw) {
          let mediaArr = raw.media || [];
          if (typeof mediaArr === 'string') {
            try { mediaArr = JSON.parse(mediaArr); } catch(e) {}
          }
          
          let amenitiesArr = raw.amenities || [];
          if (typeof amenitiesArr === 'string') {
            try { amenitiesArr = JSON.parse(amenitiesArr); } catch(e) {}
          }

          setProperty({
            id: raw.id,
            name: raw.name,
            unit: raw.code || '',
            address: raw.address_line_1 || raw.name,
            city: raw.city || 'New York',
            state: raw.state || 'NY',
            zip: raw.postal_code || '',
            beds: raw.beds || 0,
            baths: parseFloat(raw.baths) || 0,
            sqft: raw.sqft || 0,
            type: raw.property_type || 'STR',
            status: raw.status || 'active',
            owner: raw.owner_name || '',
            ownerEmail: raw.owner_email || '',
            manager: raw.manager_name || raw.organization_name || '',
            template: raw.compliance_template || 'None',
            media: mediaArr,
            amenities: amenitiesArr,
            emoji: '🏢',
            complianceStatus: 'compliant'
          });
        } else {
          setProperty(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '4rem' }}>Loading property details...</div>;

  // No properties exist yet — show a helpful empty state
  if (!property) {
    return (
      <div className="pd-shell">
        <button className="pd-back" onClick={() => navigate('/properties')}>← Properties</button>
        <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: '3rem' }}>🏠</div>
          <h2>Property not found</h2>
          <p>The requested property could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-shell">
      <header className="pd-head">
        <button className="pd-back" onClick={() => navigate('/properties')}>← Properties</button>
        <div className="pd-head__row">
          <div className="pd-head__left">
            <div className="pd-head__thumb" style={{ 
              background: Array.isArray(property.media) && property.media.length > 0 
                ? `url(${property.media[0]?.dataUrl || property.media[0]}) center/cover` 
                : (property.image || '#334155') 
            }}>
              {!Array.isArray(property.media) || property.media.length === 0 ? (property.emoji || '🏠') : ''}
            </div>
            <div>
              <h1 className="pd-head__title">{property.name || 'Unnamed Property'}{property.unit ? ` · ${property.unit}` : ''}</h1>
              <div className="pd-head__sub">{property.address || '—'}, {property.city || '—'}, {property.state || '—'} {property.zip || ''}</div>
              <div className="pd-head__chips">
                <span className={`pd-chip pd-chip--${property.status || 'active'}`}>{property.status || 'active'}</span>
                <span className="pd-chip">{property.type || '—'}</span>
                <span className={`pd-chip pd-chip--${property.complianceStatus || 'compliant'}`}>
                  {property.complianceStatus || 'compliant'}
                </span>
              </div>
            </div>
          </div>
          <div className="pd-head__actions">
            <button className="stg-btn stg-btn--danger" style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }} onClick={() => {
              if (window.confirm('Delete this property forever?')) {
                apiFetch(`/api/v1/properties/${property.id}`, { method: 'DELETE' })
                  .then(res => {
                    if (!res.ok) throw new Error('Delete failed');
                    onToast?.('Property deleted', 'success');
                    navigate('/properties');
                  })
                  .catch(err => {
                    console.error(err);
                    onToast?.('Failed to delete property', 'error');
                  });
              }
            }}>Delete</button>
            <button className="stg-btn stg-btn--outline" onClick={() => setEditOpen(true)}>✎ Edit</button>
            <button className="stg-btn stg-btn--outline" onClick={() => onToast?.('New WO form opens in 4g', 'info')}>+ Work Order</button>
            <button className="stg-btn stg-btn--primary" onClick={() => onToast?.('Compliance view opens in 4d', 'info')}>View Compliance</button>
          </div>
        </div>
      </header>

      <div className="pd-tabs">
        {TABS.map(t => (
          <button key={t.key} type="button" className={`pd-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="pd-content">
        {tab === 'overview'   && <OverviewTab   property={property} />}
        {tab === 'compliance' && <ComplianceTab property={property} onToast={onToast} />}
        {tab === 'wos'        && <WorkOrdersTab property={property} onToast={onToast} />}
        {tab === 'financials' && <FinancialsTab property={property} />}
        {tab === 'documents'  && <DocumentsTab  property={property} onToast={onToast} />}
      </div>

      {editOpen && (
        <EditPropertyDrawer 
          property={property} 
          onClose={() => setEditOpen(false)} 
          onToast={onToast} 
          onUpdate={(p) => {
            if (p._deleted) navigate('/properties');
            else setProperty(p);
          }}
        />
      )}
    </div>
  );
}

/* ─────────── Overview ─────────── */
function OverviewTab({ property: p }) {
  return (
    <div className="pd-grid">
      <div className="pd-card pd-card--wide">
        <div className="pd-card__title">Property Details</div>
        <div className="pd-kv">
          <KV k="Unit"       v={p.unit || '—'} />
          <KV k="Type"       v={p.type || '—'} />
          <KV k="Bedrooms"   v={p.beds > 0 ? p.beds : '—'} />
          <KV k="Bathrooms"  v={p.baths || '—'} />
          <KV k="Square Feet" v={p.sqft ? Number(p.sqft).toLocaleString() : '—'} />
          <KV k="Status"     v={p.status || '—'} />
          <KV k="Template"   v={p.template || '—'} />
          <KV k="Amenities"  v={Array.isArray(p.amenities) && p.amenities.length > 0 ? p.amenities.join(', ') : '—'} />
        </div>
      </div>

      {Array.isArray(p.media) && p.media.length > 0 && (
        <div className="pd-card pd-card--wide" style={{ gridColumn: '1 / -1' }}>
          <div className="pd-card__title">Photos</div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', whiteSpace: 'nowrap' }}>
            {p.media.map((m, i) => (
              <img key={i} src={m.dataUrl || m} alt="Property" style={{ height: '240px', minWidth: '320px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #334155' }} />
            ))}
          </div>
        </div>
      )}

      <div className="pd-card">
        <div className="pd-card__title">Ownership & Management</div>
        <div className="pd-kv">
          <KV k="Owner"   v={p.owner} />
          <KV k="Email"   v={p.ownerEmail} />
          <KV k="Manager" v={p.manager} />
        </div>
      </div>

      <div className="pd-card">
        <div className="pd-card__title">Performance</div>
        <div className="pd-kv">
          <KV k="Occupancy"    v={p.occupancy != null ? `${p.occupancy}%` : '—'} />
          <KV k="Revenue MTD"  v={p.revenueMtd != null ? `$${Number(p.revenueMtd).toLocaleString()}` : '—'} />
          <KV k="Revenue YTD"  v={p.revenueYtd != null ? `$${Number(p.revenueYtd).toLocaleString()}` : '—'} />
          <KV k="Open WOs"     v={p.openWOs ?? '0'} />
          <KV k="Next due"     v={p.nextDue || '—'} />
        </div>
      </div>

      <div className="pd-card pd-card--wide">
        <div className="pd-card__title">Compliance Health</div>
        <div className="pd-bar-wrap">
          <div className="pd-bar">
            <div className={`pd-bar__fill pd-bar__fill--${p.complianceStatus}`} style={{ width: `${p.compliance}%` }} />
          </div>
          <div className="pd-bar__pct">{p.compliance}%</div>
        </div>
        <div className="pd-bar__caption">
          {p.complianceStatus === 'compliant' ? 'All requirements current.' :
           p.complianceStatus === 'attention' ? 'Some requirements need action within 30 days.' :
           'Overdue requirements — operations at risk.'}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Compliance ─────────── */
function ComplianceTab({ property: p, onToast }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    apiFetch(`/api/v1/compliance?propertyId=${p.id}`)
      .then(r => r.json())
      .then(res => {
        if (res.data) setItems(res.data);
      })
      .catch(console.error);
  }, [p.id]);

  return (
    <div className="pd-card pd-card--wide">
      <div className="pd-card__title-row">
        <div className="pd-card__title">Compliance Items</div>
        <div className="pd-card__sub">Applied from {p.template}</div>
      </div>
      <div className="pd-compliance-list">
        {items.map((it, i) => (
          <div key={i} className="pd-comp-row">
            <div className="pd-comp-row__name">{it.name}</div>
            <span className="pd-comp-row__type">{it.type}</span>
            <div className="pd-comp-row__due">📅 {it.due}</div>
            <span className={`pd-comp-row__status pd-comp-row__status--${it.status}`}>{it.status}</span>
            <button className="stg-btn stg-btn--outline stg-btn--sm" onClick={() => onToast?.(`Open ${it.name}`, 'info')}>Open</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Work Orders ─────────── */
function WorkOrdersTab({ property: p, onToast }) {
  const [wos, setWos] = useState([]);

  useEffect(() => {
    apiFetch(`/api/v1/tasks?propertyId=${p.id}`)
      .then(r => r.json())
      .then(res => {
        if (res.data) setWos(res.data);
      })
      .catch(console.error);
  }, [p.id]);
  return (
    <div className="pd-card pd-card--wide">
      <div className="pd-card__title-row">
        <div className="pd-card__title">Work Orders</div>
        <div className="pd-card__sub">{p.openWOs} open</div>
      </div>
      <div className="pd-wo-list">
        {wos.map(w => (
          <div key={w.id} className="pd-wo-row" onClick={() => onToast?.(`Open ${w.id}`, 'info')}>
            <span className="pd-wo-row__id">{w.id}</span>
            <span className="pd-wo-row__title">{w.title}</span>
            <span className={`pd-wo-row__pri pd-wo-row__pri--${w.priority}`}>{w.priority}</span>
            <span className={`pd-wo-row__status pd-wo-row__status--${w.status}`}>{w.status.replace('_', ' ')}</span>
            <span className="pd-wo-row__due">{w.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Financials ─────────── */
function FinancialsTab({ property: p }) {
  return (
    <div className="pd-grid">
      <div className="pd-card">
        <div className="pd-card__title">Revenue MTD</div>
        <div className="pd-metric">{p.revenueMtd != null ? `$${Number(p.revenueMtd).toLocaleString()}` : '—'}</div>
      </div>
      <div className="pd-card">
        <div className="pd-card__title">Revenue YTD</div>
        <div className="pd-metric">{p.revenueYtd != null ? `$${Number(p.revenueYtd).toLocaleString()}` : '—'}</div>
      </div>
      <div className="pd-card">
        <div className="pd-card__title">Occupancy</div>
        <div className="pd-metric">{p.occupancy}%</div>
      </div>
      <div className="pd-card pd-card--wide">
        <div className="pd-card__title">Recent Transactions</div>
        <div className="pd-txn-list">
          {[
            { date: 'Mar 3, 2026',  desc: 'Booking payout — 4 nights', amt: '+$680' },
            { date: 'Mar 1, 2026',  desc: 'Management fee',            amt: '−$68' },
            { date: 'Feb 28, 2026', desc: 'Cleaning service',           amt: '−$120' },
            { date: 'Feb 24, 2026', desc: 'Booking payout — 7 nights',  amt: '+$1,190' },
          ].map((t, i) => (
            <div key={i} className="pd-txn-row">
              <span className="pd-txn-row__date">{t.date}</span>
              <span className="pd-txn-row__desc">{t.desc}</span>
              <span className={`pd-txn-row__amt ${t.amt.startsWith('+') ? 'is-pos' : 'is-neg'}`}>{t.amt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Documents ─────────── */
function DocumentsTab({ property: p, onToast }) {
  const docs = [
    { name: 'Lease Agreement 2026.pdf',        size: '420 KB', uploaded: 'Jan 12, 2026', by: p.owner },
    { name: 'Fire Inspection Cert.pdf',        size: '180 KB', uploaded: 'Nov 4, 2025',  by: p.manager },
    { name: 'Insurance COI.pdf',               size: '290 KB', uploaded: 'Oct 22, 2025', by: p.owner },
    { name: 'Floor Plan.pdf',                  size: '1.2 MB', uploaded: 'Sep 8, 2025',  by: p.manager },
    { name: 'Photo Walkthrough.pdf',           size: '3.4 MB', uploaded: 'Sep 8, 2025',  by: p.manager },
  ];
  return (
    <div className="pd-card pd-card--wide">
      <div className="pd-card__title-row">
        <div className="pd-card__title">Documents</div>
        <button className="stg-btn stg-btn--primary stg-btn--sm" onClick={() => onToast?.('Upload picker opens', 'info')}>+ Upload</button>
      </div>
      <div className="pd-doc-list">
        {docs.map((d, i) => (
          <div key={i} className="pd-doc-row">
            <span className="pd-doc-row__icon">📄</span>
            <div className="pd-doc-row__main">
              <div className="pd-doc-row__name">{d.name}</div>
              <div className="pd-doc-row__meta">{d.size} · Uploaded {d.uploaded} by {d.by}</div>
            </div>
            <button className="stg-btn stg-btn--ghost stg-btn--sm" onClick={() => onToast?.(`Download ${d.name}`, 'info')}>⬇</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="pd-kv__row">
      <span className="pd-kv__k">{k}</span>
      <span className="pd-kv__v">{v}</span>
    </div>
  );
}