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

export function OwnerDashboard()  { return <StubView icon="📊" title="Dashboard"  desc="Overview of your properties and recent activity" />; }
export function OwnerProperties() { return <StubView icon="🏠" title="Properties" desc="View and manage your properties" />; }
export function OwnerFinancials() { return <StubView icon="💰" title="Financials" desc="Statements and revenue reporting" />; }
export function OwnerSettings()   { return <StubView icon="⚙️" title="Settings"   desc="Account and notification settings" />; }
