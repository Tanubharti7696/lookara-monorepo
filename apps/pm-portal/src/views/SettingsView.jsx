// src/views/Settings.jsx
import { useNavigate, useParams } from 'react-router-dom';
import ComplianceTemplatesSection from './settings/ComplianceTemplatesSection';
import NotificationsSection      from './settings/NotificationsSection';
import PreferencesSection        from './settings/PreferencesSection';
import TeamSection               from './settings/TeamSection';
import IntegrationsSection       from './settings/IntegrationsSection';
import SecuritySection           from './settings/SecuritySection';
import ReportsSection            from './settings/ReportsSection';
import SLATemplatesSection       from './settings/SLATemplatesSection';
import './SettingsView.css';

const SECTIONS = [
  { key: 'compliance',    label: 'Compliance Templates', icon: '📋', group: 'Workspace'   },
  { key: 'notifications', label: 'Notifications',        icon: '🔔', group: 'Workspace'   },
  { key: 'preferences',   label: 'Preferences',          icon: '⚙️', group: 'Workspace'   },
  { key: 'team',          label: 'Team',                 icon: '👥', group: 'Workspace'   },
  { key: 'integrations',  label: 'Integrations',         icon: '🔌', group: 'Advanced'    },
  { key: 'security',      label: 'Security',             icon: '🔒', group: 'Advanced'    },
  { key: 'reports',       label: 'Reports',              icon: '📊', group: 'Advanced'    },
  { key: 'sla',           label: 'SLA Templates',        icon: '⏱',  group: 'Advanced'    },
];

export default function Settings({ onToast }) {
  const navigate = useNavigate();
  const { section } = useParams();
  const active = section || 'compliance';

  const groups = SECTIONS.reduce((acc, s) => {
    (acc[s.group] = acc[s.group] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="settings-shell">
      <aside className="settings-nav">
        <div className="settings-nav__head">
          <div className="settings-nav__eyebrow">Workspace</div>
          <div className="settings-nav__title">Settings</div>
        </div>

        <nav className="settings-nav__list">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="settings-nav__group">
              <div className="settings-nav__group-label">{group}</div>
              {items.map(s => (
                <button
                  key={s.key}
                  type="button"
                  className={`settings-nav__item ${active === s.key ? 'active' : ''}`}
                  onClick={() => navigate(`/settings/${s.key}`)}
                >
                  <span className="settings-nav__icon">{s.icon}</span>
                  <span className="settings-nav__label">{s.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="settings-main">
        {active === 'compliance'    && <ComplianceTemplatesSection onToast={onToast} />}
        {active === 'notifications' && <NotificationsSection      onToast={onToast} />}
        {active === 'preferences'   && <PreferencesSection        onToast={onToast} />}
        {active === 'team'          && <TeamSection               onToast={onToast} />}
        {active === 'integrations'  && <IntegrationsSection       onToast={onToast} />}
        {active === 'security'      && <SecuritySection           onToast={onToast} />}
        {active === 'reports'       && <ReportsSection            onToast={onToast} />}
        {active === 'sla'           && <SLATemplatesSection       onToast={onToast} />}
      </main>
    </div>
  );
}