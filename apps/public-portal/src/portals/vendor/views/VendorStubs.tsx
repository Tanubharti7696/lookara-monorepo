import type { ReactNode } from 'react';

function StubView({ icon, title, desc, children }: { icon: string; title: string; desc: string; children?: ReactNode }) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{desc}</p>
      </div>
      <div style={{ padding: '24px 32px' }}>
        {children || (
          <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <div className="empty-state-title">{title}</div>
            <div className="empty-state-desc">This section is being connected to live data</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function VendorDashboard()  { return <StubView icon="📊" title="Dashboard"  desc="Overview of your current and upcoming jobs" />; }
export function VendorJobs()       { return <StubView icon="🔧" title="Jobs"       desc="Manage active and completed jobs" />; }
export function VendorCompliance() { return <StubView icon="📋" title="Compliance" desc="Upload and manage compliance documents" />; }
export function VendorSettings()   { return <StubView icon="⚙️" title="Settings"   desc="Company profile and preferences" />; }
