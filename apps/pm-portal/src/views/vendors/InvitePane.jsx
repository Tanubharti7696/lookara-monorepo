// src/views/vendors/InvitePane.jsx
import { useState } from 'react';

export default function InvitePane({ onToast }) {
  const [businessName, setBusinessName] = useState('');
  const [trade, setTrade] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [caps, setCaps] = useState({ emergency: false, afterHours: false });
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!businessName.trim()) {
      onToast('Please enter a business name', 'error');
      return;
    }
    setSent(true);
    onToast(`✓ Invite sent to ${businessName} — onboarding link delivered`, 'success');
    setTimeout(() => {
      setSent(false);
      setBusinessName('');
      setTrade('');
      setPhone('');
      setEmail('');
      setRegion('');
      setCaps({ emergency: false, afterHours: false });
    }, 2500);
  };

  return (
    <div className="invite-pane">
      <div className="invite-wrap">
        <div className="invite-note">
          📨 The vendor receives an onboarding link with compliance upload flow — COI, W-9, license, and background check. Their account activates only after Admin verification.
        </div>

        <div className="invite-field">
          <label className="invite-label">Business Name</label>
          <input className="invite-input" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Metro Locksmith Services" />
        </div>

        <div className="invite-field">
          <label className="invite-label">Trade</label>
          <input className="invite-input" value={trade} onChange={e => setTrade(e.target.value)} placeholder="e.g. Locksmith, HVAC, Cleaning" />
        </div>

        <div className="invite-grid-2">
          <div className="invite-field">
            <label className="invite-label">Phone</label>
            <input className="invite-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (718) …" />
          </div>
          <div className="invite-field">
            <label className="invite-label">Email</label>
            <input className="invite-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vendor@…" />
          </div>
        </div>

        <div className="invite-field">
          <label className="invite-label">Region</label>
          <input className="invite-input" value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. Brooklyn Heights, Miami" />
        </div>

        <div className="invite-field">
          <label className="invite-label">Capabilities</label>
          <div className="invite-caps">
            <button
              type="button"
              className={`invite-cap ${caps.emergency ? 'on' : ''}`}
              onClick={() => setCaps(c => ({ ...c, emergency: !c.emergency }))}
            >
              ⚡ Emergency Services
            </button>
            <button
              type="button"
              className={`invite-cap ${caps.afterHours ? 'on' : ''}`}
              onClick={() => setCaps(c => ({ ...c, afterHours: !c.afterHours }))}
            >
              🌙 After-Hours Support
            </button>
          </div>
        </div>

        <button
          className={`invite-send-btn ${sent ? 'sent' : ''}`}
          onClick={handleSend}
        >
          {sent ? '✓ Invite Sent' : 'Send Invite →'}
        </button>
      </div>
    </div>
  );
}