// src/pages/Organizations/components/OrgTable.tsx
import { useMemo, useState } from 'react';
import { type Org, type OrgStatus, statusLabel } from './data';

type Props = {
  orgs: Org[];
  statusFilter: OrgStatus | 'all';
  issueFilter: 'all' | 'issues' | 'no-issues';
  search: string;
  onSearch: (v: string) => void;
  onStatusFilter: (v: OrgStatus | 'all') => void;
  onIssueFilter: (v: 'all' | 'issues' | 'no-issues') => void;
  onClear: () => void;
  onOpen: (id: string) => void;
};

type KpiKey = 'all' | 'healthy' | 'needs-attention' | 'at-risk' | 'restricted' | 'suspended';

export default function OrgTable({
  orgs, statusFilter, issueFilter, search,
  onSearch, onStatusFilter, onIssueFilter, onClear, onOpen,
}: Props) {
  const [activeKpi, setActiveKpi] = useState<KpiKey>('all');

  const counts = useMemo(() => ({
    total: orgs.length,
    healthy: orgs.filter((o) => o.status === 'healthy').length,
    needsAttention: orgs.filter((o) => o.status === 'needs-attention').length,
    atRisk: orgs.filter((o) => o.status === 'at-risk').length,
    restricted: orgs.filter((o) => o.status === 'restricted').length,
    suspended: orgs.filter((o) => o.status === 'suspended').length,
  }), [orgs]);

  const avgHealth = 84;

  const kpiFilter = (key: KpiKey) => {
    setActiveKpi(key);
    onStatusFilter(key === 'all' ? 'all' : key);
  };

  return (
    <>
      <div className="og-kpi-strip">
        <KpiCard label="Organizations"    value={counts.total}         onClick={() => kpiFilter('all')}             active={activeKpi === 'all'} />
        <KpiCard label="Healthy"           value={counts.healthy}       tone="green"  onClick={() => kpiFilter('healthy')}         active={activeKpi === 'healthy'} />
        <KpiCard label="Needs Attention"   value={counts.needsAttention} tone="yellow" onClick={() => kpiFilter('needs-attention')} active={activeKpi === 'needs-attention'} />
        <KpiCard label="At Risk"           value={counts.atRisk}        tone="red"    onClick={() => kpiFilter('at-risk')}         active={activeKpi === 'at-risk'} />
        <KpiCard label="Restricted"        value={counts.restricted}    tone="muted"  onClick={() => kpiFilter('restricted')}      active={activeKpi === 'restricted'} />
        <KpiCard label="Suspended"         value={counts.suspended}     tone="muted"  onClick={() => kpiFilter('suspended')}       active={activeKpi === 'suspended'} />
        <div className="og-kpi-card" style={{ cursor: 'default' }}>
          <div className="og-kpi-lbl">Avg Health Score</div>
          <div className="og-kpi-val" style={{ fontSize: 20, color: 'var(--yellow)' }}>{avgHealth} / 100</div>
        </div>
      </div>

      <div className="og-controls">
        <div className="og-search-wrap">
          <input
            className="og-search"
            placeholder="Search organizations…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <select className="og-select" value={statusFilter} onChange={(e) => onStatusFilter(e.target.value as OrgStatus | 'all')}>
          <option value="all">All Statuses</option>
          <option value="healthy">Healthy</option>
          <option value="needs-attention">Needs Attention</option>
          <option value="at-risk">At Risk</option>
          <option value="restricted">Restricted</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="og-select" value={issueFilter} onChange={(e) => onIssueFilter(e.target.value as 'all' | 'issues' | 'no-issues')}>
          <option value="all">All</option>
          <option value="issues">Has Active Issues</option>
          <option value="no-issues">No Issues</option>
        </select>
        <button className="og-clear" onClick={onClear}>Clear all</button>
      </div>

      <div className="og-table-wrap">
        <table className="og-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th style={{ textAlign: 'center' }}>Properties</th>
              <th style={{ textAlign: 'center' }}>Vendors</th>
              <th style={{ textAlign: 'center' }}>Owners</th>
              <th style={{ textAlign: 'center' }}>Active Issues</th>
              <th>Compliance (%)</th>
              <th>Primary PM Status</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr><td colSpan={9} className="og-empty">No organizations match filters</td></tr>
            ) : orgs.map((o) => {
              const issueClass = o.activeIssues >= 5 ? 'is-high' : o.activeIssues > 0 ? 'is-low' : 'is-zero';
              const compNum = parseFloat(o.compRate);
              const compColor = compNum >= 95 ? 'var(--green)' : compNum >= 85 ? 'var(--yellow)' : 'var(--red)';
              return (
                <tr key={o.id} onClick={() => onOpen(o.id)}>
                  <td>
                    <div className="og-name">{o.name}</div>
                    <div className="og-sub">{o.location}</div>
                  </td>
                  <td className="og-stat-cell"><div className="og-stat-num">{o.properties}</div></td>
                  <td className="og-stat-cell"><div className="og-stat-num">{o.vendors}</div></td>
                  <td className="og-stat-cell"><div className="og-stat-num">{o.owners}</div></td>
                  <td className="og-stat-cell">
                    <span className={`og-issue ${issueClass}`}>{o.activeIssues}</span>
                  </td>
                  <td><span style={{ fontSize: 13, fontWeight: 600, color: compColor }}>{compNum}</span></td>
                  <td><span className={`og-pm-chip is-${o.pmHealth}`}>{o.pmHealthLabel}</span></td>
                  <td><span className={`og-status is-${o.status}`}><span className="og-status__dot" />{statusLabel(o.status)}</span></td>
                  <td>
                    <button className="og-btn-view" onClick={(e) => { e.stopPropagation(); onOpen(o.id); }}>
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function KpiCard({
  label, value, tone, onClick, active,
}: { label: string; value: number; tone?: 'green'|'yellow'|'red'|'muted'; onClick: () => void; active: boolean }) {
  return (
    <div className={`og-kpi-card ${active ? 'is-active' : ''}`} onClick={onClick}>
      <div className="og-kpi-lbl">{label}</div>
      <div className={`og-kpi-val ${tone ? 'is-' + tone : ''}`}>{value}</div>
    </div>
  );
}