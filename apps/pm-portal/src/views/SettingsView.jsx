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
      <div className="page-header" style={{ marginBottom: 24, paddingTop: 12 }}>
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 auto', minWidth: 260 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>Settings</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Manage your organization configuration, operational templates, and security credentials.
            </div>
          </div>
          <div className="search-container" style={{ width: 340, position: 'relative', display: 'flex', alignItems: 'center', marginLeft: 'auto', flexShrink: 0 }}>
            <span className="search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              className="search-input"
              style={{
                width: '100%',
                height: 40,
                padding: '0 16px 0 38px',
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
              placeholder="Search settings..."
              id="globalSearchSettings"
              onChange={(e) => {
                const q = e.target.value.toLowerCase().trim();

                if (!containerRef.current) return;

                const navItems = containerRef.current.querySelectorAll('.settings-nav-item');
                const categories = containerRef.current.querySelectorAll('.settings-category');

                if (!q) {
                  // Restore currently active category
                  const activeNavItem = containerRef.current.querySelector('.settings-nav-item.active');
                  const activeNavText = activeNavItem ? activeNavItem.textContent.trim().toLowerCase() : 'profile';
                  categories.forEach(cat => {
                    const isCurrent = cat.id.toLowerCase().startsWith(activeNavText);
                    cat.classList.toggle('hidden', !isCurrent);
                    cat.querySelectorAll('.card, tr, .pref-row, .ct-card').forEach(el => {
                      el.style.display = '';
                    });
                  });
                  return;
                }

                // Show categories and cards that match the query
                let firstMatchCategory = null;
                categories.forEach(cat => {
                  const cards = cat.querySelectorAll('.card, .ct-card');
                  let hasMatchInCat = false;

                  cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    const match = text.includes(q);
                    card.style.display = match ? '' : 'none';
                    if (match) hasMatchInCat = true;
                  });

                  // If category has match or its header matches, make it visible
                  if (hasMatchInCat) {
                    cat.classList.remove('hidden');
                    if (!firstMatchCategory) firstMatchCategory = cat;
                  } else {
                    cat.classList.add('hidden');
                  }
                });

                // Highlight corresponding nav item if found
                if (firstMatchCategory) {
                  const catId = firstMatchCategory.id.replace('Settings', '').replace('Screen', '');
                  navItems.forEach(item => {
                    const match = item.textContent.trim().toLowerCase() === catId.toLowerCase();
                    item.classList.toggle('active', match);
                  });
                }
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
