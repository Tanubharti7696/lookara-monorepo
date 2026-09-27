// apps/owner-portal/src/pages/Settings/components/SecuritySettings.tsx
import { useState } from 'react';
import { useToast } from '../../../context/ToastContext';

interface SecuritySettingsProps {
  onChangePassword: () => void;
}

export default function SecuritySettings({ onChangePassword }: SecuritySettingsProps) {
  const { showToast } = useToast();
  const [twoFA, setTwoFA] = useState(true);

  const toggle2FA = () => {
    const next = !twoFA;
    setTwoFA(next);
    showToast(
      next ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
      next ? 'success' : 'info',
    );
  };

  return (
    <>
      <div className="section-hdr">
        <div className="section-title">Security</div>
        <div className="section-sub">Protect your account</div>
      </div>

      <div className="panel">
        <div className="action-row">
          <div>
            <div className="action-label">Password</div>
            <div className="action-sub">Last changed 3 months ago</div>
          </div>
          <button type="button" className="action-btn ghost" onClick={onChangePassword}>
            Change password
          </button>
        </div>

        <div className="action-row">
          <div>
            <div className="action-label">Two-Factor Authentication</div>
            <div className="action-sub">Recommended for account security</div>
          </div>
          <div className="action-row-right">
            <span className={`tfa-badge ${twoFA ? 'tfa-on' : 'tfa-off'}`}>
              {twoFA ? 'On' : 'Off'}
            </span>
            <button type="button" className="action-btn ghost" onClick={toggle2FA}>
              Manage
            </button>
          </div>
        </div>

        <div className="action-row">
          <div>
            <div className="action-label">Active Sessions</div>
            <div className="action-sub">2 devices currently signed in</div>
          </div>
          <button
            type="button"
            className="action-btn ghost"
            onClick={() => showToast('Active session management — Phase 2', 'info')}
          >
            View devices
          </button>
        </div>

        <div className="action-row danger">
          <div>
            <div className="action-label">Sign Out of All Devices</div>
            <div className="action-sub">Logs you out everywhere immediately</div>
          </div>
          <button
            type="button"
            className="action-btn danger"
            onClick={() => showToast('Signed out of all devices', 'danger')}
          >
            Sign out of all devices
          </button>
        </div>
      </div>
    </>
  );
}
