import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './settings.css';
import { ToastProvider, useToast } from './settings/ui';

import ProfileSettings from './settings/sections/ProfileSettings';
import AccountSettings from './settings/sections/AccountSettings';
import NotificationSettings from './settings/sections/NotificationSettings';
import PreferencesSettings from './settings/sections/PreferencesSettings';
import TeamSettings from './settings/sections/TeamSettings';
import IntegrationsSettings from './settings/sections/IntegrationsSettings';
import SecuritySettings from './settings/sections/SecuritySettings';
import ScheduledReports from './settings/sections/ScheduledReports';
import SLATemplates from './settings/sections/SLATemplates';
import ComplianceTemplates from './settings/sections/ComplianceTemplates';

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'team', label: 'Team' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'security', label: 'Security' },
  { id: 'reports', label: 'Scheduled Reports' },
  { id: 'complianceTemplates', label: 'Compliance Templates' },
  { id: 'slaTemplates', label: 'SLA Templates' },
];

function SettingsContent({ onToast }) {
  const navigate = useNavigate();
  const { section } = useParams();
  const active = section || 'profile';

  const contentRef = useRef(null);
  const showToast = useToast();

  const handleSearch = (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q || !contentRef.current) return;
    const cards = contentRef.current.querySelectorAll('.card');
    for (const card of cards) {
      if (card.textContent.toLowerCase().includes(q)) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition = 'outline-color 0.3s';
        card.style.outline = '3px solid var(--champagne-gold)';
        card.style.outlineOffset = '4px';
        setTimeout(() => { card.style.outline = 'none'; }, 2000);
        return;
      }
    }
    showToast('No results found', 'amber');
  };

  const renderSection = () => {
    switch (active) {
      case 'profile':             return <ProfileSettings />;
      case 'account':
      case 'organization':        return <AccountSettings />;
      case 'notifications':       return <NotificationSettings />;
      case 'preferences':         return <PreferencesSettings />;
      case 'team':                return <TeamSettings />;
      case 'integrations':        return <IntegrationsSettings />;
      case 'security':            return <SecuritySettings />;
      case 'reports':             return <ScheduledReports />;
      case 'slaTemplates':
      case 'sla':                 return <SLATemplates />;
      case 'complianceTemplates':
      case 'compliance':          return <ComplianceTemplates />;
      default:                    return <ProfileSettings />;
    }
  };

  return (
    <div className="page-content" style={{ width: '100%', minHeight: '100%' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', lineHeight: 1.2 }}>Settings</div>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 4 }}>
              Manage your organization configuration, operational templates, and security credentials.
            </div>
          </div>
          <div className="search-container" style={{ width: 340 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%' }}
              placeholder="Search settings…"
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="settings-nav">
            {NAV_ITEMS.map(item => (
              <div
                key={item.id}
                className={`settings-nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => navigate(`/settings/${item.id}`)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="settings-content" ref={contentRef}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

export default function Settings({ onToast }) {
  return (
    <ToastProvider onExternalToast={onToast}>
      <SettingsContent onToast={onToast} />
    </ToastProvider>
  );
}