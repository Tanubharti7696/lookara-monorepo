// src/pages/Vendors/Vendors.tsx
import { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { INITIAL_VENDORS, type Vendor, type AdminTimelineEntry } from './components/data';
import VendorTable from './components/VendorTable';
import VendorDrawer from './components/VendorDrawer';
import VendorModals, { type ModalKind } from './components/VendorModals';
import './Vendors.css';

export default function Vendors() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusSection, setFocusSection] = useState<string | undefined>(undefined);
  const [modal, setModal] = useState<ModalKind>(null);

  const activeVendor = useMemo(() => vendors.find((v) => v.id === openId) ?? null, [vendors, openId]);

  const stats = useMemo(() => ({
    total: vendors.length,
    active: vendors.filter((v) => v.status === 'active').length,
    limited: vendors.filter((v) => v.status === 'limited').length,
    blocked: vendors.filter((v) => v.status === 'blocked').length,
    suspended: vendors.filter((v) => v.status === 'suspended').length,
  }), [vendors]);

  const open = (id: string, focus?: string) => {
    setOpenId(id);
    setFocusSection(focus);
  };
  const close = () => {
    setOpenId(null);
    setFocusSection(undefined);
  };

  const pushTimeline = (id: string, entry: AdminTimelineEntry) => {
    setVendors((list) => list.map((v) =>
      v.id === id ? { ...v, adminTimeline: [entry, ...v.adminTimeline] } : v,
    ));
  };

  const nowStr = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleAction = (type: string, payload?: any) => {
    if (!activeVendor) return;

    if (type === 'toast') {
      toast(payload.message, payload.tone ?? 'ok');
      return;
    }
    if (type === 'suspend') setModal({ type: 'suspend', vendor: activeVendor });
    if (type === 'reinstate') setModal({ type: 'reinstate', vendor: activeVendor });
    if (type === 'transfer') setModal({ type: 'transfer', vendor: activeVendor });
    if (type === 'grace') setModal({ type: 'grace', vendor: activeVendor });
    if (type === 'editTrades') setModal({ type: 'editTrades', vendor: activeVendor });
  };

  const confirmSuspend = (note: string) => {
    if (!activeVendor) return;
    const id = activeVendor.id;
    setVendors((list) => list.map((v) =>
      v.id === id
        ? { ...v, status: 'suspended', isSuspended: true, statusReason: v.statusReason || 'Suspended by admin', statusReasonLevel: 'danger' }
        : v,
    ));
    pushTimeline(id, {
      event: 'Vendor suspended — ' + note.substring(0, 80),
      by: 'Sarah Chen · Admin',
      time: nowStr(),
      dot: 'red',
    });
    close();
    toast(`${activeVendor.name} suspended. Removed from all dispatch pools. Audit log updated.`, 'red');
  };

  const confirmReinstate = (note: string) => {
    if (!activeVendor) return;
    const id = activeVendor.id;
    setVendors((list) => list.map((v) =>
      v.id === id
        ? { ...v, status: 'active', isSuspended: false, statusReason: null, statusReasonLevel: null }
        : v,
    ));
    pushTimeline(id, {
      event: 'Vendor reinstated — ' + note.substring(0, 80),
      by: 'Sarah Chen · Admin',
      time: nowStr(),
      dot: 'green',
    });
    close();
    toast(`${activeVendor.name} reinstated. Vendors notified. Audit log updated.`, 'ok');
  };

  const confirmTransfer = () => {
    if (!activeVendor) return;
    pushTimeline(activeVendor.id, {
      event: 'Active jobs transferred · PMs notified',
      by: 'Sarah Chen · Admin · Transfer on suspension',
      time: nowStr(),
      dot: 'yellow',
    });
    setModal(null);
    toast('Active jobs transferred. Affected PMs notified.', 'yellow');
  };

  const confirmGrace = (days: number, reason: string) => {
    if (!activeVendor) return;
    pushTimeline(activeVendor.id, {
      event: `Compliance grace period extended +${days} days`,
      by: `Sarah Chen · Admin · Reason: ${reason}`,
      time: nowStr(),
      dot: 'gold',
    });
    toast(`Grace period extended +${days} days. Audit log updated.`, 'yellow');
  };

  const confirmTrades = (trades: string[], reason: string) => {
    if (!activeVendor) return;
    const id = activeVendor.id;
    setVendors((list) => list.map((v) =>
      v.id === id
        ? {
            ...v,
            trades,
            primaryTrade: trades[0],
            additionalTrades: trades.slice(1),
            trade: trades.join(' · '),
            eligibleCategories: trades.length * 3 + Math.floor(Math.random() * 4),
          }
        : v,
    ));
    pushTimeline(id, {
      event: 'Trade certifications updated: ' + trades.join(', '),
      by: `Sarah Chen · Admin · Reason: ${reason}`,
      time: nowStr(),
      dot: 'blue',
    });
    toast(`Trades updated — ${trades.length} trade(s) assigned. Audit logged.`, 'neutral');
  };

  const saveNotes = (vendorId: string, notes: string) => {
    setVendors((list) => list.map((v) => v.id === vendorId ? { ...v, adminNotes: notes } : v));
  };

  return (
    <div className="vd-page">
      <div className="vd-header">
        <div>
          <h2>Vendors</h2>
          <p>System-wide vendor compliance, status, and performance</p>
        </div>
      </div>

      <div className="vd-summary">
        <span className="vd-summary__main">{stats.total} vendors</span>
        <span className="vd-summary__sep">|</span>
        <span className="vd-summary__item">{stats.active} active</span>
        <span className="vd-summary__sep">·</span>
        <span className="vd-summary__item is-warn">{stats.limited} limited</span>
        <span className="vd-summary__sep">·</span>
        <span className="vd-summary__item is-danger">{stats.blocked} blocked</span>
        <span className="vd-summary__sep">·</span>
        <span className="vd-summary__item is-danger">{stats.suspended} suspended</span>
      </div>

      <VendorTable vendors={vendors} onOpen={open} />

      {activeVendor && (
        <VendorDrawer
          vendor={activeVendor}
          focusSection={focusSection}
          onClose={close}
          onAction={handleAction}
          onSaveNotes={saveNotes}
        />
      )}

      {modal && (
        <VendorModals
          modal={modal}
          onClose={() => setModal(null)}
          onConfirmSuspend={confirmSuspend}
          onConfirmReinstate={confirmReinstate}
          onConfirmTransfer={confirmTransfer}
          onConfirmGrace={confirmGrace}
          onConfirmTrades={confirmTrades}
        />
      )}
    </div>
  );
}