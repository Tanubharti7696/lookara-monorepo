// src/views/properties/NotificationRulesDrawer.jsx
import { useState } from 'react';
import {
  ADAPTIVE_SUGGESTIONS,
  CHANNELS,
  EVENTS,
  DEFAULT_RULES,
  DEFAULT_THRESHOLDS,
} from '../../data/notificationRules';

export default function NotificationRulesDrawer({ onClose, onToast }) {
  const [mode, setMode] = useState('smart');
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [dismissed, setDismissed] = useState(new Set());

  const toggle = (eventKey, channel) => {
    setRules(r => ({
      ...r,
      [eventKey]: { ...r[eventKey], [channel]: !r[eventKey][channel] },
    }));
  };

  const setThresh = (k, v) => setThresholds(t => ({ ...t, [k]: v }));

  const acceptSuggestion = (s) => {
    if (s.id === 's1') setRules(r => ({ ...r, 'wo-created': { ...r['wo-created'], sms: true } }));
    if (s.id === 's2') setThresh('quietStart', '22:00');
    if (s.id === 's3') setRules(r => ({ ...r, 'compliance-overdue': { ...r['compliance-overdue'], slack: true } }));
    if (s.id === 's4') onToast?.('Digest frequency → bi-weekly', 'info');
    setDismissed(prev => new Set([...prev, s.id]));
    onToast?.(`Applied: ${s.action}`, 'success');
  };

  const dismiss = (id) => setDismissed(prev => new Set([...prev, id]));

  const save = () => {
    onToast?.(`Notification rules saved in ${mode === 'smart' ? 'Smart' : 'Custom'} mode`, 'success');
    onClose();
  };

  const visibleSuggestions = ADAPTIVE_SUGGESTIONS.filter(s => !dismissed.has(s.id));

  return (
    <div className="overlay" onClick={onClose}>
      <aside className="overlay-drawer overlay-drawer--wide" onClick={e => e.stopPropagation()}>
        <header className="overlay-drawer__head">
          <div>
            <div className="overlay-drawer__eyebrow">Workspace</div>
            <div className="overlay-drawer__title">Notification Rules</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </header>

        <div className="overlay-drawer__body">

          {/* ── Adaptive Suggestions ── */}
          {visibleSuggestions.length > 0 && (
            <div className="nr-suggestions">
              <div className="nr-suggestions__head">
                <div className="nr-suggestions__title">✨ Adaptive Suggestions</div>
                <div className="nr-suggestions__sub">
                  Based on your last 30 days of activity
                </div>
              </div>
              {visibleSuggestions.map(s => (
                <div key={s.id} className="nr-suggestion">
                  <div className="nr-suggestion__body">
                    <div className="nr-suggestion__title">{s.title}</div>
                    <div className="nr-suggestion__detail">{s.detail}</div>
                    <div className="nr-suggestion__impact">{s.impact}</div>
                  </div>
                  <div className="nr-suggestion__actions">
                    <button className="stg-btn stg-btn--primary stg-btn--sm" onClick={() => acceptSuggestion(s)}>
                      {s.action}
                    </button>
                    <button className="stg-btn stg-btn--ghost stg-btn--sm" onClick={() => dismiss(s.id)}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Mode Switch ── */}
          <div className="nr-block">
            <div className="nr-block__title">Mode</div>
            <div className="nr-mode-grid">
              <button
                type="button"
                className={`nr-mode ${mode === 'smart' ? 'active' : ''}`}
                onClick={() => setMode('smart')}
              >
                <div className="nr-mode__icon">✨</div>
                <div className="nr-mode__label">Smart (Recommended)</div>
                <div className="nr-mode__desc">Rules auto-tune based on engagement</div>
              </button>
              <button
                type="button"
                className={`nr-mode ${mode === 'custom' ? 'active' : ''}`}
                onClick={() => setMode('custom')}
              >
                <div className="nr-mode__icon">⚙️</div>
                <div className="nr-mode__label">Custom</div>
                <div className="nr-mode__desc">Full manual control</div>
              </button>
            </div>
          </div>

          {/* ── Thresholds ── */}
          <div className={`nr-block ${mode === 'smart' ? 'is-disabled' : ''}`}>
            <div className="nr-block__title">Thresholds</div>
            {mode === 'smart' && (
              <div className="nr-block__lock">
                🔒 Smart mode manages these automatically. Switch to Custom to edit.
              </div>
            )}
            <div className="nr-thresh-grid">
              <Thresh
                label="Remind me N days before due"
                value={thresholds.daysBeforeDue}
                onChange={v => setThresh('daysBeforeDue', v)}
                disabled={mode === 'smart'}
                suffix="days"
                min={1} max={90}
              />
              <Thresh
                label="SLA warning before breach"
                value={thresholds.slaWarningMinutes}
                onChange={v => setThresh('slaWarningMinutes', v)}
                disabled={mode === 'smart'}
                suffix="min"
                min={5} max={1440}
              />
              <Thresh
                label="Escalate if unacknowledged"
                value={thresholds.escalationDelayMin}
                onChange={v => setThresh('escalationDelayMin', v)}
                disabled={mode === 'smart'}
                suffix="min"
                min={15} max={1440}
              />
            </div>
            <div className="nr-thresh-row">
              <label className="nr-thresh-lbl">Quiet hours</label>
              <div className="nr-thresh-times">
                <input type="time" className="stg-input" disabled={mode === 'smart'}
                  value={thresholds.quietStart} onChange={e => setThresh('quietStart', e.target.value)} />
                <span>→</span>
                <input type="time" className="stg-input" disabled={mode === 'smart'}
                  value={thresholds.quietEnd} onChange={e => setThresh('quietEnd', e.target.value)} />
              </div>
            </div>
            <div className="nr-thresh-row">
              <label className="nr-thresh-lbl">Weekly digest day</label>
              <select className="stg-input" disabled={mode === 'smart'}
                value={thresholds.digestDay} onChange={e => setThresh('digestDay', e.target.value)}>
                {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* ── Per-event matrix ── */}
          <div className="nr-block">
            <div className="nr-block__title">Channels per Event</div>
            <div className="nr-table">
              <div className="nr-table__head">
                <div>Event</div>
                {CHANNELS.map(c => (
                  <div key={c.key} className="nr-table__ch">{c.icon} {c.label}</div>
                ))}
              </div>
              {EVENTS.map(e => (
                <div key={e.key} className="nr-table__row">
                  <div className="nr-table__event">
                    <div className="nr-table__event-label">{e.label}</div>
                    <div className={`nr-table__pri nr-table__pri--${e.priority}`}>{e.priority}</div>
                  </div>
                  {CHANNELS.map(c => (
                    <div key={c.key} className="nr-table__cell">
                      <label className="stg-checkbox">
                        <input
                          type="checkbox"
                          checked={!!rules[e.key]?.[c.key]}
                          onChange={() => toggle(e.key, c.key)}
                        />
                        <span className="stg-checkbox__box" />
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="overlay-drawer__foot">
          <button className="stg-btn stg-btn--outline" onClick={onClose}>Cancel</button>
          <button className="stg-btn stg-btn--primary" onClick={save}>Save Rules</button>
        </footer>
      </aside>
    </div>
  );
}

function Thresh({ label, value, onChange, suffix, disabled, min, max }) {
  return (
    <div className="nr-thresh">
      <div className="nr-thresh-lbl">{label}</div>
      <div className="nr-thresh-input">
        <input
          type="number"
          className="stg-input"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
        />
        <span className="nr-thresh-suffix">{suffix}</span>
      </div>
    </div>
  );
}