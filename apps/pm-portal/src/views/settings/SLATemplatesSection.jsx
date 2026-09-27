// src/views/settings/SLATemplatesSection.jsx
import { SLA_TEMPLATES } from '../../data/settingsData';

export default function SLATemplatesSection({ onToast }) {
  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">SLA Templates</h1>
          <p className="settings-section__sub">
            Response and resolution targets per ticket priority. Used to flag breaches
            on the Work Orders board.
          </p>
        </div>
        <button
          className="stg-btn stg-btn--primary"
          onClick={() => onToast?.('New SLA form will open when integrated', 'info')}
        >
          + New SLA
        </button>
      </header>

      <div className="sla-grid">
        {SLA_TEMPLATES.map(s => (
          <article key={s.id} className={`sla-card sla-card--${s.color}`}>
            <div className="sla-card__head">
              <div className="sla-card__name">{s.name}</div>
              <div className="sla-card__tickets">{s.tickets} open</div>
            </div>
            <div className="sla-card__rows">
              <div className="sla-card__row">
                <span className="sla-card__lbl">Response</span>
                <span className="sla-card__val">{s.response}</span>
              </div>
              <div className="sla-card__row">
                <span className="sla-card__lbl">Resolution</span>
                <span className="sla-card__val">{s.resolution}</span>
              </div>
              <div className="sla-card__row">
                <span className="sla-card__lbl">Escalation</span>
                <span className="sla-card__val">{s.escalation}</span>
              </div>
            </div>
            <div className="sla-card__actions">
              <button
                className="stg-btn stg-btn--outline stg-btn--sm"
                onClick={() => onToast?.(`Edit "${s.name}" SLA`, 'info')}
              >
                Edit
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}