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

export function AdminDashboard()    { return <StubView icon="📊" title="Dashboard"     desc="Platform-wide metrics and activity" />; }
export function AdminUsers()        { return <StubView icon="👥" title="Users"         desc="Manage all users on the platform" />; }
export function AdminOrganizations(){ return <StubView icon="🏢" title="Organizations" desc="Manage tenant organizations" />; }
export function AdminSystem()       { return <StubView icon="🛡️" title="System Health" desc="Monitor queues and active services" />; }
