// Generic placeholder view factory for PM portal stub views
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

export function PMVendors()    { return <StubView icon="👷" title="Vendors"    desc="Manage your vendor network and compliance" />; }
export function PMCompliance() { return <StubView icon="📋" title="Compliance" desc="Track documents, expiry dates and flags" />; }
export function PMReports()    { return <StubView icon="📈" title="Reports"    desc="Financial and operational reporting" />; }
export function PMSettings()   { return <StubView icon="⚙️" title="Settings"  desc="Organization settings and preferences" />; }
