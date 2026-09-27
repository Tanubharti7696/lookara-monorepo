// src/views/settings/SecuritySection.jsx
import { useState } from 'react';
import { ACTIVE_SESSIONS } from '../../data/settingsData';

export default function SecuritySection({ onToast }) {
  const [twoFA, setTwoFA] = useState(true);
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS);
  const [pwPolicy, setPwPolicy] = useState({
    minLength: 12,
    requireNumbers: true,
    requireSymbols: true,
    expireDays: 90,
  });

  const revoke = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    onToast?.('Session revoked', 'info');
  };

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Security</h1>
          <p className="settings-section__sub">
            Two-factor auth, password policy, and active session control.
          </p>
        </div>
      </header>

      <div className="security-block">
        <div className="security-block__head">
          <div>
            <div className="security-block__title">Two-Factor Authentication</div>
            <div className="security-block__sub">
              Adds a second step to login. Strongly recommended for all admins.
            </div>
          </div>
          <label className="stg-toggle">
            <input type="checkbox" checked={twoFA} onChange={e => setTwoFA(e.target.checked)} />
            <span className="stg-toggle__slider" />
          </label>
        </div>
        {twoFA && (
          <div className="security-block__body">
            <div className="security-row">
              <span>Method</span>
              <span className="security-value">Authenticator app (TOTP)</span>
            </div>
            <div className="security-row">
              <span>Backup codes</span>
              <span className="security-value">10 codes generated · <button className="security-link">View</button></span>
            </div>
          </div>
        )}
      </div>

      <div className="security-block">
        <div className="security-block__head">
          <div className="security-block__title">Password Policy</div>
        </div>
        <div className="security-block__body">
          <div className="security-row">
            <span>Minimum length</span>
            <span className="security-value">{pwPolicy.minLength} characters</span>
          </div>
          <div className="security-row">
            <span>Require numbers</span>
            <label className="stg-toggle stg-toggle--sm">
              <input type="checkbox" checked={pwPolicy.requireNumbers} onChange={e => setPwPolicy(p => ({ ...p, requireNumbers: e.target.checked }))} />
              <span className="stg-toggle__slider" />
            </label>
          </div>
          <div className="security-row">
            <span>Require symbols</span>
            <label className="stg-toggle stg-toggle--sm">
              <input type="checkbox" checked={pwPolicy.requireSymbols} onChange={e => setPwPolicy(p => ({ ...p, requireSymbols: e.target.checked }))} />
              <span className="stg-toggle__slider" />
            </label>
          </div>
          <div className="security-row">
            <span>Force rotation</span>
            <span className="security-value">Every {pwPolicy.expireDays} days</span>
          </div>
        </div>
      </div>

      <div className="security-block">
        <div className="security-block__head">
          <div>
            <div className="security-block__title">Active Sessions</div>
            <div className="security-block__sub">Devices currently signed into your account.</div>
          </div>
          <button
            className="stg-btn stg-btn--outline stg-btn--sm"
            onClick={() => { setSessions(prev => prev.filter(s => s.current)); onToast?.('All other sessions revoked', 'success'); }}
          >
            Sign out everywhere else
          </button>
        </div>
        <div className="security-block__body">
          {sessions.map(s => (
            <div key={s.id} className="session-row">
              <div className="session-row__main">
                <div className="session-row__device">
                  {s.device}
                  {s.current && <span className="session-row__badge">This device</span>}
                </div>
                <div className="session-row__meta">
                  {s.location} · {s.ip} · {s.lastActive}
                </div>
              </div>
              {!s.current && (
                <button className="stg-btn stg-btn--danger stg-btn--sm" onClick={() => revoke(s.id)}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}