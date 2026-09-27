// src/views/settings/ComplianceTemplatesSection.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CT_TEMPLATES } from '../../data/settingsData';

const STATUS_CLS = {
  active:   'ct-status--active',
  draft:    'ct-status--draft',
  archived: 'ct-status--archived',
};

export default function ComplianceTemplatesSection({ onToast }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(CT_TEMPLATES);
  const [query, setQuery] = useState('');

  const filtered = templates.filter(t =>
    (t.name + ' ' + t.jurisdiction).toLowerCase().includes(query.toLowerCase())
  );

  const handleApply = (t) => {
    onToast?.(`Apply "${t.name}" — property picker will open when integrated`, 'info');
  };

  const handleDuplicate = (id) => {
    const src = templates.find(t => t.id === id);
    if (!src) return;
    const copy = {
      ...src,
      id: `${src.id}-copy-${Date.now()}`,
      name: `${src.name} (Copy)`,
      status: 'draft',
      applied: 0,
      updated: 'Just now',
    };
    setTemplates(prev => [copy, ...prev]);
    onToast?.('Template duplicated', 'success');
  };

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Compliance Templates</h1>
          <p className="settings-section__sub">
            Reusable requirement sets by jurisdiction. Apply a template to any property
            to auto-generate its compliance checklist.
          </p>
        </div>
        <button
          className="stg-btn stg-btn--primary"
          onClick={() => navigate('/settings/compliance-templates/new')}
        >
          + New Template
        </button>
      </header>

      <div className="settings-toolbar">
        <input
          className="stg-input"
          type="search"
          placeholder="Search templates by name or jurisdiction…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="settings-toolbar__meta">
          {filtered.length} of {templates.length} template{templates.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="ct-grid">
        {filtered.map(t => (
          <article key={t.id} className="ct-card">
            <div className="ct-card__head">
              <span className={`ct-status ${STATUS_CLS[t.status]}`}>
                {t.status}
              </span>
              <span className="ct-card__cycle">{t.cycle}</span>
            </div>

            <h3 className="ct-card__name">{t.name}</h3>
            <div className="ct-card__jurisdiction">📍 {t.jurisdiction}</div>

            <div className="ct-card__stats">
              <div>
                <div className="ct-card__stat-num">{t.reqs}</div>
                <div className="ct-card__stat-lbl">Requirements</div>
              </div>
              <div>
                <div className="ct-card__stat-num">{t.applied}</div>
                <div className="ct-card__stat-lbl">Applied</div>
              </div>
            </div>

            <div className="ct-card__updated">Updated {t.updated}</div>

            <div className="ct-card__actions">
              <button
                className="stg-btn stg-btn--outline stg-btn--sm"
                onClick={() => navigate(`/settings/compliance-templates/${t.id}`)}
              >
                ✎ Edit
              </button>
              <button
                className="stg-btn stg-btn--outline stg-btn--sm"
                onClick={() => handleDuplicate(t.id)}
              >
                ⎘
              </button>
              <button
                className="stg-btn stg-btn--primary stg-btn--sm"
                onClick={() => handleApply(t)}
              >
                Apply
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="ct-empty">
            No templates match "{query}". Try a different search or create a new one.
          </div>
        )}
      </div>
    </section>
  );
}