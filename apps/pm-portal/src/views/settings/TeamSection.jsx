// src/views/settings/TeamSection.jsx
import { useState } from 'react';
import { TEAM_MEMBERS } from '../../data/settingsData';

const ROLE_CLS = {
  Owner:      'role--owner',
  Admin:      'role--admin',
  Manager:    'role--manager',
  Technician: 'role--tech',
  Viewer:     'role--viewer',
};

export default function TeamSection({ onToast }) {
  const [members] = useState(TEAM_MEMBERS);

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Team</h1>
          <p className="settings-section__sub">
            Manage who has access to the workspace and what they can do.
          </p>
        </div>
        <button
          className="stg-btn stg-btn--primary"
          onClick={() => onToast?.('Invite flow will open when integrated', 'info')}
        >
          + Invite Member
        </button>
      </header>

      <div className="team-table">
        <div className="team-table__head">
          <div>Member</div>
          <div>Role</div>
          <div>Last Active</div>
          <div>Status</div>
          <div></div>
        </div>

        {members.map(m => (
          <div key={m.id} className="team-table__row">
            <div className="team-row__member">
              <div className="team-avatar">{m.avatar}</div>
              <div>
                <div className="team-row__name">{m.name}</div>
                <div className="team-row__email">{m.email}</div>
              </div>
            </div>
            <div>
              <span className={`team-role ${ROLE_CLS[m.role] || ''}`}>{m.role}</span>
            </div>
            <div className="team-row__last">{m.lastActive}</div>
            <div>
              <span className={`team-status team-status--${m.status}`}>
                {m.status === 'active' ? '● Active' : '○ Invited'}
              </span>
            </div>
            <div className="team-row__actions">
              <button
                className="stg-btn stg-btn--ghost stg-btn--sm"
                onClick={() => onToast?.(`Edit ${m.name}`, 'info')}
              >
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-hintbar">
        💡 Roles: <strong>Owner</strong> — full control. <strong>Admin</strong> — everything except billing.
        <strong> Manager</strong> — properties, work orders, compliance. <strong>Technician</strong> — assigned WOs only.
        <strong> Viewer</strong> — read-only.
      </div>
    </section>
  );
}