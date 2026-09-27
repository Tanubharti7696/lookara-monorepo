// src/views/properties/EditPropertyDrawer.jsx
import { useState } from 'react';
import { PROPERTY_TYPES, PROPERTY_STATUS } from '../../data/properties';

import { apiFetch } from '../../utils/api';

export default function EditPropertyDrawer({ property, onClose, onToast, onUpdate }) {
  const getMedia = (media) => {
    let arr = media || [];
    if (typeof arr === 'string') {
      try { arr = JSON.parse(arr); } catch(e) {}
    }
    return arr.map(m => typeof m === 'string' ? { dataUrl: m } : m);
  };

  const [form, setForm] = useState({ ...property, media: getMedia(property.media) });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    const mediaWithPreviews = await Promise.all(files.map(f => {
      return new Promise((resolve) => {
         const reader = new FileReader();
         reader.onload = (e) => resolve({ name: f.name, dataUrl: e.target.result, file: f });
         reader.readAsDataURL(f);
      });
    }));
    setForm(f => ({ ...f, media: [...f.media, ...mediaWithPreviews] }));
  };

  const save = () => {
    const payload = {
      ...form,
      media: form.media.map(m => m.dataUrl || m)
    };
    
    apiFetch(`/api/v1/properties/${property.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update property');
        return res.json();
      })
      .then(p => {
        onToast?.(`"${form.name}" updated successfully`, 'success');
        if (onUpdate) onUpdate(payload); // Refresh or update local state
        onClose();
      })
      .catch(e => {
        console.error('Failed to save property edit', e);
        onToast?.('Failed to save changes', 'error');
      });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="overlay-drawer" onClick={e => e.stopPropagation()}>
        <header className="overlay-drawer__head">
          <div>
            <div className="overlay-drawer__eyebrow">Edit Property</div>
            <div className="overlay-drawer__title">{property.name}</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </header>

        <div className="overlay-drawer__body">
          <Group title="Identity">
            <Row label="Name"><input className="stg-input" value={form.name} onChange={e => set('name', e.target.value)} /></Row>
            <Row label="Unit"><input className="stg-input" value={form.unit || ''} onChange={e => set('unit', e.target.value)} placeholder="Optional" /></Row>
            <Row label="Type">
              <select className="stg-input" value={form.type || ''} onChange={e => set('type', e.target.value)}>
                {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Row>
            <Row label="Status">
              <select className="stg-input" value={form.status || ''} onChange={e => set('status', e.target.value)}>
                {PROPERTY_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Row>
          </Group>

          <Group title="Address">
            <Row label="Street"><input className="stg-input" value={form.address || ''} onChange={e => set('address', e.target.value)} /></Row>
            <Row label="City"><input className="stg-input" value={form.city || ''} onChange={e => set('city', e.target.value)} /></Row>
            <div className="form-row-2">
              <Row label="State"><input className="stg-input" value={form.state || ''} onChange={e => set('state', e.target.value)} /></Row>
              <Row label="ZIP"><input className="stg-input" value={form.zip || ''} onChange={e => set('zip', e.target.value)} /></Row>
            </div>
          </Group>

          <Group title="Details">
            <div className="form-row-3">
              <Row label="Beds"><input className="stg-input" type="number" value={form.beds || ''} onChange={e => set('beds', parseInt(e.target.value) || 0)} /></Row>
              <Row label="Baths"><input className="stg-input" type="number" value={form.baths || ''} onChange={e => set('baths', parseInt(e.target.value) || 0)} /></Row>
              <Row label="Sq Ft"><input className="stg-input" type="number" value={form.sqft || ''} onChange={e => set('sqft', parseInt(e.target.value) || 0)} /></Row>
            </div>
          </Group>

          <Group title="Ownership">
            <Row label="Owner"><input className="stg-input" value={form.owner || ''} onChange={e => set('owner', e.target.value)} /></Row>
            <Row label="Owner Email"><input className="stg-input" type="email" value={form.ownerEmail || ''} onChange={e => set('ownerEmail', e.target.value)} /></Row>
            <Row label="Manager"><input className="stg-input" value={form.manager || ''} onChange={e => set('manager', e.target.value)} /></Row>
          </Group>

          <Group title="Compliance">
            <Row label="Template">
              <select className="stg-input" value={form.template || ''} onChange={e => set('template', e.target.value)}>
                <option>NYC STR Compliance</option>
                <option>LA County STR</option>
                <option>CA Statewide</option>
                <option>Texas STR</option>
                <option>Chicago STR</option>
                <option>Florida STR</option>
              </select>
            </Row>
          </Group>
          
          <Group title="Media">
            <Row label="Upload Photos">
              <input className="stg-input" type="file" multiple accept="image/*" onChange={handleMediaChange} />
              {form.media.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {form.media.map((file, i) => (
                    <div key={i} style={{ width: '100px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155', position: 'relative', flexShrink: 0 }}>
                      <img src={file.dataUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, media: f.media.filter((_, idx) => idx !== i) })); }}
                        style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '0 0 0 4px', cursor: 'pointer', fontSize: '10px', padding: '2px 4px' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </Row>
          </Group>
        </div>

        <footer className="overlay-drawer__foot" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <button className="stg-btn stg-btn--danger" onClick={() => {
            if (window.confirm('Are you sure you want to delete this property?')) {
              apiFetch(`/api/v1/properties/${property.id}`, { method: 'DELETE' })
                .then(res => {
                  if (!res.ok) throw new Error('Failed to delete property');
                  onToast?.(`"${property.name}" deleted`, 'success');
                  if (onUpdate) onUpdate({ ...property, _deleted: true });
                  onClose();
                })
                .catch(e => {
                  console.error(e);
                  onToast?.('Failed to delete', 'error');
                });
            }
          }}>Delete Property</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="stg-btn stg-btn--outline" onClick={onClose}>Cancel</button>
            <button className="stg-btn stg-btn--primary" onClick={save}>Save Changes</button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div className="form-group">
      <div className="form-group__title">{title}</div>
      {children}
    </div>
  );
}
function Row({ label, children }) {
  return (
    <div className="form-row">
      <label className="form-row__label">{label}</label>
      <div className="form-row__input">{children}</div>
    </div>
  );
}