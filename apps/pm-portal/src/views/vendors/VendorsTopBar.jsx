// src/views/vendors/VendorsTopBar.jsx
export default function VendorsTopBar({ onBell }) {
  return (
    <div className="vendors-topnav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>Lookara</span>
        <span style={{ color: 'var(--slate)', fontSize: 13 }}>›</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Vendors</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="vendors-notif" onClick={onBell}>🔔<span className="vendors-notif__badge">3</span></div>
      </div>
    </div>
  );
}