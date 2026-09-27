// src/views/vendors/VendorsTabs.jsx
const TABS = [
  { key: 'coverage',  label: 'My Coverage' },
  { key: 'directory', label: 'Directory' },
  { key: 'invite',    label: 'Invite Vendor' },
];

export default function VendorsTabs({ active, onChange }) {
  return (
    <div className="vendors-tabs-bar">
      {TABS.map(t => (
        <button
          key={t.key}
          type="button"
          className={`vendors-tab-btn ${active === t.key ? 'active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}