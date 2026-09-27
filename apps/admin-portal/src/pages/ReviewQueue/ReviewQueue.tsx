// src/pages/ReviewQueue/ReviewQueue.tsx
import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import ActiveTab from './components/ActiveTab';
import HistoryTab from './components/HistoryTab';
import DecisionModals from './components/DecisionModals';
import type { ModalState } from './components/DecisionModals';
import EvidenceDrawer from './components/EvidenceDrawer';
import FlagDrawer from './components/FlagDrawer';
import {
  INITIAL_DISPUTES, INITIAL_FLAGS, INITIAL_COMPLIANCE, INITIAL_HISTORY,
} from './components/data';
import type { DisputeItem, FlagItem, ComplianceItem, HistoryRow } from './components/data';
import './ReviewQueue.css';

export type DrawerState =
  | { type: 'evidence'; dispute: DisputeItem }
  | { type: 'flag'; drawerKey: 'jake' | 'david' }
  | null;

export default function ReviewQueue() {
  const { toast } = useToast();

  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [flags, setFlags] = useState<FlagItem[]>(INITIAL_FLAGS);
  const [compliance, setCompliance] = useState<ComplianceItem[]>(INITIAL_COMPLIANCE);
  const [history, setHistory] = useState<HistoryRow[]>(INITIAL_HISTORY);

  const [modal, setModal] = useState<ModalState>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  /* ── Derived KPIs ── */
  const pending = disputes.length + flags.length + compliance.length;
  const criticalCount =
    flags.filter((f) => f.priority === 'critical').length +
    compliance.filter((c) => c.priority === 'critical').length;
  const slaBreached =
    flags.filter((f) => f.slaTimer.tone === 'breach').length +
    compliance.filter((c) => c.slaTimer.tone === 'breach').length;
  const withinSla = pending - slaBreached;

  /* ── Resolution handlers ── */
  const pushHistory = (row: HistoryRow) => setHistory((h) => [row, ...h]);

  const nowTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) +
    ' · Apr 13';

  const handleResolve = (disputeId: string, party: 'PM' | 'Vendor', note: string, instruction: string) => {
    const d = disputes.find((x) => x.id === disputeId);
    if (!d) return;
    setDisputes((list) => list.filter((x) => x.id !== disputeId));

    const hasInstruction = instruction.trim().length > 0;
    pushHistory({
      id: 'h' + Date.now(),
      timestamp: nowTime(),
      type: 'dispute',
      item: `${disputeId} · Payment`,
      resolution: party === 'PM' ? 'PM Position Supported' : 'Vendor Position Supported',
      resolutionTone: party === 'PM' ? 'blue' : 'green',
      vendorStatus: '—',
      admin: 'Sarah Chen',
      note: note.length > 60 ? note.substring(0, 60) + '...' : note,
      decisionHex: [
        { label: 'Resolution', value: party === 'PM' ? 'PM Position Supported' : 'Vendor Position Supported', tone: party === 'PM' ? 'blue' : 'green' },
        { label: 'Financial outcome', value: party === 'PM' ? 'Payment adjustment recommended' : 'No payment adjustment' },
        { label: 'Decided by', value: 'Sarah Chen · Admin' },
        { label: 'Correction task', value: hasInstruction ? `Created — ${instruction}` : 'None' },
      ],
      correctionTask: hasInstruction ? instruction : undefined,
    });

    toast(
      `${disputeId} — ${party === 'PM' ? 'PM position supported' : 'Vendor position supported'}.` +
      (hasInstruction ? ' Correction task created and assigned to vendor.' : ''),
      party === 'PM' ? 'blue' : 'ok',
    );
  };

  const removeFlag = (vendorName: string, action: string, tone: 'green'|'yellow'|'red'|'neutral', note: string, vendorBadge?: HistoryRow['vendorBadge']) => {
    setFlags((list) => list.filter((f) => f.vendor !== vendorName));
    pushHistory({
      id: 'h' + Date.now(),
      timestamp: nowTime(),
      type: 'flag',
      item: `${vendorName} · Vendor`,
      resolution: action,
      resolutionTone: tone === 'neutral' ? 'green' : (tone as any),
      vendorStatus: vendorBadge ? vendorBadge.charAt(0).toUpperCase() + vendorBadge.slice(1) : '—',
      vendorBadge,
      admin: 'Sarah Chen',
      note: note.length > 60 ? note.substring(0, 60) + '...' : note,
      decisionHex: [
        { label: 'Decision', value: action, tone: tone === 'neutral' ? undefined : tone },
        { label: 'Decided by', value: 'Sarah Chen · Admin' },
        { label: 'Timestamp', value: 'Apr 13, 2026' },
        { label: 'Vendor status after', value: vendorBadge ? vendorBadge.charAt(0).toUpperCase() + vendorBadge.slice(1) : '—' },
      ],
    });
    const toastTone = tone === 'neutral' ? 'neutral' : tone === 'green' ? 'ok' : (tone as any);
    toast(
      tone === 'neutral' ? 'Flag dismissed. Audit log updated.' :
      tone === 'red' ? `${vendorName} suspended. Removed from all dispatch pools. Logged to audit trail.` :
      tone === 'yellow' ? `${vendorName} — warning issued. Vendor notified. Logged to audit trail.` :
      `${vendorName} — action logged.`,
      toastTone,
    );
  };

  const removeCompliance = (id: string, action: 'approve' | 'reject', note: string) => {
    const c = compliance.find((x) => x.id === id);
    if (!c) return;
    setCompliance((list) => list.filter((x) => x.id !== id));

    if (action === 'approve') {
      pushHistory({
        id: 'h' + Date.now(),
        timestamp: nowTime(),
        type: 'compliance',
        item: c.title,
        resolution: 'Approved',
        resolutionTone: 'green',
        vendorStatus: 'Active',
        vendorBadge: 'active',
        admin: 'Sarah Chen',
        note: note || 'All requirements met. System validation passed.',
        decisionHex: [
          { label: 'Decision', value: 'Approved', tone: 'green' },
          { label: 'Decided by', value: 'Sarah Chen · Admin' },
          { label: 'Timestamp', value: 'Apr 13, 2026' },
          { label: 'Vendor status after', value: 'Active' },
        ],
      });
      toast(`✓ Approved: ${c.title} — Audit log updated.`);
    } else {
      pushHistory({
        id: 'h' + Date.now(),
        timestamp: nowTime(),
        type: 'compliance',
        item: c.title,
        resolution: 'Rejected',
        resolutionTone: 'red',
        vendorStatus: 'Blocked',
        vendorBadge: 'blocked',
        admin: 'Sarah Chen',
        note: note || 'Document rejected. Re-upload requested.',
        decisionHex: [
          { label: 'Decision', value: 'Rejected', tone: 'red' },
          { label: 'Decided by', value: 'Sarah Chen · Admin' },
          { label: 'Timestamp', value: 'Apr 13, 2026' },
          { label: 'Vendor status after', value: 'Blocked' },
        ],
      });
      toast('Document rejected. Vendor notified. Audit log updated.', 'red');
    }
  };

  return (
    <div className="rq-page">
      <div className="rq-header">
        <h2>Decision Queue</h2>
        <p>Pending approvals, flags, and disputes requiring admin action</p>
      </div>

      {/* KPI row */}
      <div className="rq-kpis">
        <div className="rq-kpi">
          <div className="rq-kpi__label">Pending</div>
          <div className="rq-kpi__value">{pending}</div>
        </div>
        <div className="rq-kpi is-red">
          <div className="rq-kpi__label">Critical</div>
          <div className="rq-kpi__value">{criticalCount}</div>
        </div>
        <div className="rq-kpi is-red">
          <div className="rq-kpi__label">SLA Breached</div>
          <div className="rq-kpi__value">{slaBreached}</div>
        </div>
        <div className="rq-kpi is-green">
          <div className="rq-kpi__label">Within SLA</div>
          <div className="rq-kpi__value">{Math.max(0, withinSla)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rq-tabs">
        <button className={`rq-tab ${tab === 'active' ? 'is-active' : ''}`} onClick={() => setTab('active')}>
          Active ({pending})
        </button>
        <button className={`rq-tab ${tab === 'history' ? 'is-active' : ''}`} onClick={() => setTab('history')}>
          History ({history.length})
        </button>
      </div>

      {tab === 'active' && (
        <ActiveTab
          disputes={disputes}
          flags={flags}
          compliance={compliance}
          onOpenModal={setModal}
          onOpenDrawer={setDrawer}
        />
      )}
      {tab === 'history' && <HistoryTab rows={history} />}

      {/* Modals */}
      {modal && (
        <DecisionModals
          modal={modal}
          onClose={() => setModal(null)}
          onResolve={handleResolve}
          onRemoveFlag={removeFlag}
          onRemoveCompliance={removeCompliance}
          onOpenDocViewer={(docType, vendorName, filename) =>
            setModal({ type: 'docViewer', docType, vendorName, filename })
          }
        />
      )}

      {/* Drawers */}
      {drawer?.type === 'evidence' && (
        <EvidenceDrawer
          dispute={drawer.dispute}
          onClose={() => setDrawer(null)}
          onOpenModal={(m) => { setDrawer(null); setModal(m); }}
        />
      )}
      {drawer?.type === 'flag' && (
        <FlagDrawer
          drawerKey={drawer.drawerKey}
          onClose={() => setDrawer(null)}
          onOpenModal={(m) => { setDrawer(null); setModal(m); }}
        />
      )}
    </div>
  );
}