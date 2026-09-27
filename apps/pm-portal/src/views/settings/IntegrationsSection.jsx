// src/views/settings/IntegrationsSection.jsx
import { useState, useMemo } from 'react';
import { INTEGRATIONS } from '../../data/settingsData';

export default function IntegrationsSection({ onToast }) {
  const [apps, setApps] = useState(INTEGRATIONS);

  const grouped = useMemo(() => apps.reduce((acc, a) => {
    (acc[a.category] = acc[a.category] || []).push(a);
    return acc;
  }, {}), [apps]);

  const toggle = (id) => {
    setApps(prev => prev.map(a => a.id === id
      ? { ...a, status: a.status === 'connected' ? 'disconnected' : 'connected' }
      : a
    ));
    const app = apps.find(a => a.id === id);
    onToast?.(
      app.status === 'connected' ? `${app.name} disconnected` : `${app.name} connected`,
      app.status === 'connected' ? 'info' : 'success'
    );
  };

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Integrations</h1>
          <p className="settings-section__sub">
            Connect Lookara to your payment, messaging, accounting, and property tools.
          </p>
        </div>
      </header>

      {Object.entries(grouped).map(([category, list]) => (
        <div key={category} className="integration-group">
          <div className="integration-group__title">{category}</div>
          <div className="integration-grid">
            {list.map(a => (
              <article key={a.id} className={`integration-card ${a.status === 'connected' ? 'is-connected' : ''}`}>
                <div className="integration-card__icon">{a.icon}</div>
                <div className="integration-card__body">
                  <div className="integration-card__name">{a.name}</div>
                  <div className="integration-card__desc">{a.desc}</div>
                </div>
                <div className="integration-card__footer">
                  <span className={`integration-card__status integration-card__status--${a.status}`}>
                    {a.status === 'connected' ? '● Connected' : '○ Not connected'}
                  </span>
                  <button
                    className={`stg-btn stg-btn--sm ${a.status === 'connected' ? 'stg-btn--outline' : 'stg-btn--primary'}`}
                    onClick={() => toggle(a.id)}
                  >
                    {a.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}