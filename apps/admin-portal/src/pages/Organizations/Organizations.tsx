// src/pages/Organizations/Organizations.tsx
import { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { INITIAL_ORGS, type Org, type OrgStatus, STATUS_ORDER } from './components/data';
import OrgTable from './components/OrgTable';
import OrgDrawer from './components/OrgDrawer';
import BillingModal, { type BillingAction, type BillingConfirmPayload } from './components/BillingModal';
import HealthDrawer from './components/HealthDrawer';
import './Organizations.css';

export default function Organizations() {
  const { toast } = useToast();

  const [orgs] = useState<Org[]>(INITIAL_ORGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrgStatus | 'all'>('all');
  const [issueFilter, setIssueFilter] = useState<'all' | 'issues' | 'no-issues'>('all');

  const [openOrgId, setOpenOrgId] = useState<string | null>(null);
  const [billingAction, setBillingAction] = useState<BillingAction | null>(null);
  const [healthTarget, setHealthTarget] = useState<{ name: string; score: number } | null>(null);

  const activeOrg = useMemo(() => orgs.find((o) => o.id === openOrgId) ?? null, [orgs, openOrgId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orgs
      .filter((o) => {
        const mq = !q || o.name.toLowerCase().includes(q) || o.location.toLowerCase().includes(q);
        const ms = statusFilter === 'all' || o.status === statusFilter;
        const mi = issueFilter === 'all'
          || (issueFilter === 'issues' && o.activeIssues > 0)
          || (issueFilter === 'no-issues' && o.activeIssues === 0);
        return mq && ms && mi;
      })
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }, [orgs, search, statusFilter, issueFilter]);

  const clearAll = () => {
    setSearch('');
    setStatusFilter('all');
    setIssueFilter('all');
  };

  const onBillingConfirm = (payload: BillingConfirmPayload) => {
    // In production: POST to /admin/orgs/:id/billing + refresh
    toast(`${payload.logEntry.desc} applied. Audit log updated.`);
    setBillingAction(null);
  };

  return (
    <div className="og-page">
      <div className="og-header">
        <h2>Organizations</h2>
        <p>PM-level risk, compliance, and performance</p>
      </div>

      <OrgTable
        orgs={filtered}
        statusFilter={statusFilter}
        issueFilter={issueFilter}
        search={search}
        onSearch={setSearch}
        onStatusFilter={setStatusFilter}
        onIssueFilter={setIssueFilter}
        onClear={clearAll}
        onOpen={(id) => setOpenOrgId(id)}
      />

      {activeOrg && (
        <OrgDrawer
          org={activeOrg}
          onClose={() => setOpenOrgId(null)}
          onAction={(a) => setBillingAction(a)}
          onOpenHealth={(score) => setHealthTarget({ name: activeOrg.name, score })}
          onToast={toast}
          onSaveNote={() => { /* handled in drawer */ }}
          onPinnedInfo={() => ({ pinned: false, pinnedBy: '' })}
        />
      )}

      {activeOrg && billingAction && (
        <BillingModal
          orgId={activeOrg.id}
          action={billingAction}
          onClose={() => setBillingAction(null)}
          onConfirm={onBillingConfirm}
        />
      )}

      {healthTarget && (
        <HealthDrawer
          orgName={healthTarget.name}
          score={healthTarget.score}
          onClose={() => setHealthTarget(null)}
        />
      )}
    </div>
  );
}