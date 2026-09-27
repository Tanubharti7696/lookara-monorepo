// src/views/properties/AddPropertyModal.jsx
import { useState } from 'react';
import { PROPERTY_TYPES } from '../../data/properties';

export default function AddPropertyModal({ onClose, onToast, onAdd }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', unit: '', type: 'STR',
    address: '', city: '', state: '', zip: '',
    beds: 2, baths: 1, sqft: '',
    owner: '', ownerEmail: '', manager: '', template: 'NYC STR Compliance',
    amenities: [], media: []
  });

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }));
  };

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
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canProceed = step === 1
    ? form.name.trim() && form.type
    : form.address.trim() && form.city.trim();

  const submit = () => {
    onAdd?.(form);
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-modal" onClick={e => e.stopPropagation()}>
        <header className="overlay-modal__head">
          <div>
            <div className="overlay-modal__eyebrow">Add Property · Step {step} of 2</div>
            <div className="overlay-modal__title">{step === 1 ? 'Basics' : 'Details & Compliance'}</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </header>

        <div className="overlay-steps">
          <div className={`overlay-step ${step === 1 ? 'active' : 'done'}`}>1 · Basics</div>
          <div className={`overlay-step ${step === 2 ? 'active' : ''}`}>2 · Details</div>
        </div>

        <div className="overlay-modal__body">
          {step === 1 && (
            <div className="form-group">
              <div className="form-row">
                <label className="form-row__label">Property Name *</label>
                <div className="form-row__input">
                  <input className="stg-input" autoFocus value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. 345 Henry St" />
                </div>
              </div>
              <div className="form-row">
                <label className="form-row__label">Unit</label>
                <div className="form-row__input">
                  <input className="stg-input" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Apt 4B (optional)" />
                </div>
              </div>
              <div className="form-row">
                <label className="form-row__label">Type *</label>
                <div className="form-row__input">
                  <div className="form-type-grid">
                    {PROPERTY_TYPES.map(t => (
                      <button key={t} type="button"
                        className={`form-type-btn ${form.type === t ? 'active' : ''}`}
                        onClick={() => set('type', t)}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <div className="form-group__title">Address</div>
                <div className="form-row">
                  <label className="form-row__label">Street *</label>
                  <div className="form-row__input"><input className="stg-input" autoFocus value={form.address} onChange={e => set('address', e.target.value)} placeholder="345 Henry Street" /></div>
                </div>
                <div className="form-row">
                  <label className="form-row__label">City *</label>
                  <div className="form-row__input"><input className="stg-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="New York" /></div>
                </div>
                <div className="form-row-2">
                  <div className="form-row">
                    <label className="form-row__label">State</label>
                    <div className="form-row__input"><input className="stg-input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="NY" /></div>
                  </div>
                  <div className="form-row">
                    <label className="form-row__label">ZIP</label>
                    <div className="form-row__input"><input className="stg-input" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="10002" /></div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__title">Details</div>
                <div className="form-row-3">
                  <div className="form-row"><label className="form-row__label">Beds</label><div className="form-row__input"><input className="stg-input" type="number" value={form.beds} onChange={e => set('beds', parseInt(e.target.value) || 0)} /></div></div>
                  <div className="form-row"><label className="form-row__label">Baths</label><div className="form-row__input"><input className="stg-input" type="number" value={form.baths} onChange={e => set('baths', parseInt(e.target.value) || 0)} /></div></div>
                  <div className="form-row"><label className="form-row__label">Sq Ft</label><div className="form-row__input"><input className="stg-input" type="number" value={form.sqft} onChange={e => set('sqft', e.target.value)} placeholder="850" /></div></div>
                </div>
                <div className="form-row" style={{ marginTop: '16px' }}>
                  <label className="form-row__label">Amenities</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    {['Pool', 'Garage', 'Air Conditioning', 'R.O Water', 'Washing Machine', 'Gym', 'Balcony', 'Fireplace'].map(a => (
                      <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ cursor: 'pointer' }} />
                        <span>{a}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__title">Ownership</div>
                <div className="form-row"><label className="form-row__label">Owner</label><div className="form-row__input"><input className="stg-input" value={form.owner} onChange={e => set('owner', e.target.value)} /></div></div>
                <div className="form-row"><label className="form-row__label">Owner Email</label><div className="form-row__input"><input className="stg-input" type="email" value={form.ownerEmail} onChange={e => set('ownerEmail', e.target.value)} /></div></div>
                <div className="form-row"><label className="form-row__label">Manager</label><div className="form-row__input"><input className="stg-input" value={form.manager} onChange={e => set('manager', e.target.value)} /></div></div>
              </div>

              <div className="form-group">
                <div className="form-group__title">Compliance Template</div>
                <div className="form-row">
                  <label className="form-row__label">Apply Template</label>
                  <div className="form-row__input">
                    <select className="stg-input" value={form.template} onChange={e => set('template', e.target.value)}>
                      <option>NYC STR Compliance</option>
                      <option>LA County STR</option>
                      <option>CA Statewide</option>
                      <option>Texas STR</option>
                      <option>Chicago STR</option>
                      <option>Florida STR</option>
                      <option value="">None (add later)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__title">Media</div>
                <div className="form-row">
                  <label className="form-row__label">Upload Photos</label>
                  <div className="form-row__input">
                    <input className="stg-input" type="file" multiple accept="image/*" onChange={handleMediaChange} />
                    {form.media.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {form.media.map((file, i) => (
                          <div key={i} style={{ width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #334155', position: 'relative' }}>
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
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <footer className="overlay-modal__foot">
          {step === 2 && <button className="stg-btn stg-btn--outline" onClick={() => setStep(1)}>← Back</button>}
          <div style={{ flex: 1 }} />
          <button className="stg-btn stg-btn--outline" onClick={onClose}>Cancel</button>
          {step === 1
            ? <button className="stg-btn stg-btn--primary" disabled={!canProceed} onClick={() => setStep(2)}>Next →</button>
            : <button className="stg-btn stg-btn--primary" disabled={!canProceed} onClick={submit}>+ Add Property</button>
          }
        </footer>
      </div>
    </div>
  );
}