import React, { useEffect, useRef } from 'react';
import { useShell } from '../context/ShellContext';
// import { useAuth } from '../auth';
import { SETTINGS_HTML } from './settingsHtmlData';
import { initSettingsBridge } from './settingsBridge';
import './settings.css';


export default function SettingsView({ onToast }) {
  const containerRef = useRef(null);
  const { user } = useShell();
  const organization = user?.memberships?.[0] ? { id: user.memberships[0].organizationId, name: user.memberships[0].organizationName } : null;

  const handleToast = (msg, type) => {
    if (onToast) onToast(msg, type);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize prototype bridge with runtime functions & real DB handlers
    initSettingsBridge(containerRef.current, {
      showToast: handleToast,
      currentUser: user,
      currentOrg: organization,
    });

    // Populate user profile info and regional settings from auth
    if (window.hydrateSettingsFromUser) {
      window.hydrateSettingsFromUser(user);
    }
  }, [user, organization]);

  return (
    <div className="page-content" style={{ width: '100%', minHeight: '100%', padding: '0 24px 40px' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--white)', lineHeight: 1.2 }}>Settings</div>
            <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 4 }}>
              Manage your organization configuration, operational templates, and security credentials.
            </div>
          </div>
          <div className="search-container" style={{ width: 340, position: 'relative' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%' }}
              placeholder="Search settings…"
              id="globalSearchSettings"
              onChange={(e) => {
                const q = e.target.value.toLowerCase().trim();
                if (!containerRef.current) return;
                const cards = containerRef.current.querySelectorAll('.settings-card, .table-container, .grid');
                cards.forEach(card => {
                  if (!q) {
                    card.style.display = '';
                    return;
                  }
                  card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* 100% exact DOM rendered from prototype HTML */}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: SETTINGS_HTML }}
      />
    </div>
  );
}
