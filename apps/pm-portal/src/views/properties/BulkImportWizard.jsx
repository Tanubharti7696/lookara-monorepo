// src/views/properties/BulkImportWizard.jsx
import { useState, useRef } from 'react';

const STEPS = ['Upload', 'Map Columns', 'Preview', 'Import'];

const SAMPLE_CSV_HEADERS = ['Property Name','Unit','Address','City','State','ZIP','Type','Beds','Baths','Owner','Owner Email'];
const SAMPLE_ROWS = [
  ['980 Madison Ave','Apt 12','980 Madison Avenue','New York','NY','10021','STR','2','2','Sarah Kim','sarah@lookara.com'],
  ['41 Sea View Rd','','41 Sea View Road','Miami','FL','33139','STR','3','3','Marcus Webb','marcus@lookara.com'],
  ['12 Elm Street','Unit 4','12 Elm Street','Austin','TX','78701','LTR','2','1','David Reyes','david@lookara.com'],
];

const TARGET_FIELDS = [
  { key: 'name',       label: 'Property Name', required: true  },
  { key: 'unit',       label: 'Unit',          required: false },
  { key: 'address',    label: 'Address',       required: true  },
  { key: 'city',       label: 'City',          required: true  },
  { key: 'state',      label: 'State',         required: false },
  { key: 'zip',        label: 'ZIP',           required: false },
  { key: 'type',       label: 'Type',          required: true  },
  { key: 'beds',       label: 'Beds',          required: false },
  { key: 'baths',      label: 'Baths',         required: false },
  { key: 'owner',      label: 'Owner',         required: false },
  { key: 'ownerEmail', label: 'Owner Email',   required: false },
];

export default function BulkImportWizard({ onClose, onToast }) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [mapping, setMapping] = useState(() =>
    Object.fromEntries(TARGET_FIELDS.map(f => [f.key, SAMPLE_CSV_HEADERS.find(h => h.toLowerCase().replace(/\s/g,'') === f.label.toLowerCase().replace(/\s/g,'')) || '']))
  );
  const [importing, setImporting] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setStep(1);
  };

  const simulateDrop = () => {
    setFileName('properties-march-2026.csv');
    setStep(1);
  };

  const runImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      onToast?.(`${SAMPLE_ROWS.length} properties imported`, 'success');
      onClose();
    }, 1200);
  };

  const mappedCount = Object.values(mapping).filter(Boolean).length;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-modal overlay-modal--wide" onClick={e => e.stopPropagation()}>
        <header className="overlay-modal__head">
          <div>
            <div className="overlay-modal__eyebrow">Bulk Import · Step {step + 1} of {STEPS.length}</div>
            <div className="overlay-modal__title">{STEPS[step]}</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </header>

        <div className="overlay-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`overlay-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              {i + 1} · {s}
            </div>
          ))}
        </div>

        <div className="overlay-modal__body overlay-modal__body--tall">
          {step === 0 && (
            <div className="import-dropzone" onClick={() => inputRef.current?.click()}>
              <input ref={inputRef} type="file" accept=".csv,.xlsx" hidden onChange={handleFile} />
              <div className="import-dropzone__icon">⬆</div>
              <div className="import-dropzone__title">Drop a CSV or Excel file here</div>
              <div className="import-dropzone__sub">or click to browse · max 5,000 rows</div>
              <button className="stg-btn stg-btn--outline stg-btn--sm import-dropzone__sample" onClick={(e) => { e.stopPropagation(); simulateDrop(); }}>
                Use sample file
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="import-file-info">📄 <strong>{fileName}</strong> · {SAMPLE_ROWS.length} rows detected</div>
              <div className="import-map-grid">
                {TARGET_FIELDS.map(f => (
                  <div key={f.key} className="import-map-row">
                    <div className="import-map-row__target">
                      {f.label}
                      {f.required && <span className="import-required">*</span>}
                    </div>
                    <select
                      className="stg-input"
                      value={mapping[f.key]}
                      onChange={e => setMapping(m => ({ ...m, [f.key]: e.target.value }))}
                    >
                      <option value="">— Skip —</option>
                      {SAMPLE_CSV_HEADERS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="import-file-info">
                {SAMPLE_ROWS.length} rows · {mappedCount} columns mapped
              </div>
              <div className="import-preview">
                <table className="import-preview__table">
                  <thead>
                    <tr>
                      {TARGET_FIELDS.filter(f => mapping[f.key]).map(f => (
                        <th key={f.key}>{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_ROWS.map((r, i) => (
                      <tr key={i}>
                        {TARGET_FIELDS.filter(f => mapping[f.key]).map(f => {
                          const srcIdx = SAMPLE_CSV_HEADERS.indexOf(mapping[f.key]);
                          return <td key={f.key}>{r[srcIdx] || <span className="import-muted">—</span>}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="import-warn">
                ⚠ {Math.max(0, mappedCount - 3)} optional columns mapped. Review required columns before importing.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="import-final">
              {importing ? (
                <>
                  <div className="import-spinner" />
                  <div className="import-final__title">Importing {SAMPLE_ROWS.length} properties…</div>
                  <div className="import-final__sub">This may take a few seconds.</div>
                </>
              ) : (
                <>
                  <div className="import-final__icon">✓</div>
                  <div className="import-final__title">Ready to import</div>
                  <div className="import-final__sub">
                    {SAMPLE_ROWS.length} properties will be created with compliance templates applied per the column mapping.
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <footer className="overlay-modal__foot">
          {step > 0 && !importing && <button className="stg-btn stg-btn--outline" onClick={() => setStep(step - 1)}>← Back</button>}
          <div style={{ flex: 1 }} />
          <button className="stg-btn stg-btn--outline" onClick={onClose} disabled={importing}>Cancel</button>
          {step === 1 && <button className="stg-btn stg-btn--primary" onClick={() => setStep(2)}>Next →</button>}
          {step === 2 && <button className="stg-btn stg-btn--primary" onClick={() => setStep(3)}>Next →</button>}
          {step === 3 && (
            <button className="stg-btn stg-btn--primary" onClick={runImport} disabled={importing}>
              {importing ? 'Importing…' : `Import ${SAMPLE_ROWS.length} Properties`}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}