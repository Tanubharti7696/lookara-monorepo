// src/views/settings/NotificationsSection.jsx
import { useState } from 'react';
import { NOTIFICATION_EVENTS } from '../../data/settingsData';

const CHANNELS = ['email', 'sms', 'push'];

export default function NotificationsSection({ onToast }) {
  const [matrix, setMatrix] = useState(() =>
    Object.fromEntries(NOTIFICATION_EVENTS.map(e => [e.key, { ...e.default }]))
  );

  const toggle = (eventKey, channel) => {
    setMatrix(prev => ({
      ...prev,
      [eventKey]: { ...prev[eventKey], [channel]: !prev[eventKey][channel] },
    }));
  };

  const save = () => onToast?.('Notification preferences saved', 'success');

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Notifications</h1>
          <p className="settings-section__sub">
            Choose which events alert you, and how. Applies to the currently logged-in user.
          </p>
        </div>
        <button className="stg-btn stg-btn--primary" onClick={save}>Save Changes</button>
      </header>

      <div className="notif-table">
        <div className="notif-table__head">
          <div className="notif-table__col-label">Event</div>
          {CHANNELS.map(c => (
            <div key={c} className="notif-table__col-channel">
              {c === 'email' ? '✉️ Email' : c === 'sms' ? '📱 SMS' : '🔔 Push'}
            </div>
          ))}
        </div>

        {NOTIFICATION_EVENTS.map(e => (
          <div key={e.key} className="notif-table__row">
            <div className="notif-table__event">
              <div className="notif-table__event-label">{e.label}</div>
              <div className="notif-table__event-sub">{e.sub}</div>
            </div>
            {CHANNELS.map(c => (
              <div key={c} className="notif-table__cell">
                <label className="stg-checkbox">
                  <input
                    type="checkbox"
                    checked={matrix[e.key][c]}
                    onChange={() => toggle(e.key, c)}
                  />
                  <span className="stg-checkbox__box" />
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="settings-hintbar">
        💡 Emails are batched hourly unless marked "instant". SMS only fires for events
        with a 15-minute SLA window. Push requires the mobile app.
      </div>
    </section>
  );
}