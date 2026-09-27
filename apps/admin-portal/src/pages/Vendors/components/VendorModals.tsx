// src/pages/Vendors/components/VendorModals.tsx
import { useEffect, useState } from 'react';
import { type Vendor, ALL_TRADES } from './data';

export type ModalKind =
  | { type: 'suspend'; vendor: Vendor }
  | { type: 'reinstate'; vendor: Vendor }
  | { type: 'transfer'; vendor: Vendor }
  | { type: 'grace'; vendor: Vendor }
  | { type: 'editTrades'; vendor: Vendor }
  | null;

type Props = {
  modal: NonNullable<ModalKind>;
  onClose: () => void;
  onConfirmSuspend: (note: string) => void;
  onConfirmReinstate: (note: string) => void;
  onConfirmTransfer: () => void;
  onConfirmGrace: (days: number, reason: string) => void;
  onConfirmTrades: (trades: string[], reason: string) => void;
};

export default function VendorModals({
  modal, onClose, onConfirmSuspend, onConfirmReinstate, onConfirmTransfer, onConfirmGrace, onConfirmTrades,
}: Props) {
  const [note, setNote] = useState('');

  useEffect(() => { setNote(''); }, [modal]);

  if (modal.type === 'transfer') {
    const active = modal.vendor.recentJobs.filter((j) => j.outcome !== 'completed');
    return (
      <Shell onClose={onClose}>
        <div className="vd-modal__head">
          <h3 className="vd-modal__title">Transfer Active Jobs</h3>
          <p className="vd-modal__sub">
            The following active jobs will be reassigned. Affected PMs will be notified automatically.
          </p>
        </div>
        <div className="vd-modal__body">
          {active.length === 0 ? (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', padding: '12px 0' }}>
              No active jobs found for this vendor.
            </div>
          ) : active.map((j, i) => (
            <div key={i} className="vd-transfer-row">
              <div>
                <div className="vd-transfer-title">
                  {j.title} <span className="vd-transfer-title__id">{j.id}</span>
                </div>
                <div className="vd-transfer-meta">{j.property} · {j.date}</div>
              </div>
              <span className="vd-transfer-status">Needs reassignment</span>
            </div>
          ))}
          <div className="vd-transfer-note">
            Admin action logged · PMs notified · Vendor notified of reassignment
          </div>
        </div>
        <div className="vd-modal__foot">
          <button className="vd-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="vd-btn-confirm" onClick={onConfirmTransfer}>Transfer All Jobs →</button>
        </div>
      </Shell>
    );
  }

  if (modal.type === 'grace') {
    return <GraceModal onClose={onClose} onConfirm={onConfirmGrace} vendorName={modal.vendor.name} />;
  }

  if (modal.type === 'editTrades') {
    return <EditTradesModal vendor={modal.vendor} onClose={onClose} onConfirm={onConfirmTrades} />;
  }

  /* Textarea-driven modals: suspend, reinstate */
  const config = modal.type === 'suspend' ? {
    title: 'Suspend Vendor',
    sub: modal.vendor.name,
    label: 'Reason for suspension',
    placeholder: 'Document the pattern and reason. Vendor is removed from all dispatch pools. Permanent audit record.',
    confirmText: 'Suspend Vendor',
    confirmRed: true,
  } : {
    title: 'Reinstate Vendor',
    sub: modal.vendor.name,
    label: 'Reason for reinstatement',
    placeholder: 'Document why the vendor is being reinstated. Confirm all compliance issues are resolved.',
    confirmText: 'Reinstate Vendor',
    confirmRed: false,
  };

  const confirm = () => {
    if (modal.type === 'suspend') onConfirmSuspend(note);
    else if (modal.type === 'reinstate') onConfirmReinstate(note);
    onClose();
  };

  return (
    <Shell onClose={onClose}>
      <div className="vd-modal__head">
        <h3 className="vd-modal__title">{config.title}</h3>
        <p className="vd-modal__sub">{config.sub}</p>
      </div>
      <div className="vd-modal__body">
        <label className="vd-form-lbl">
          {config.label} <span className="req">*</span>
        </label>
        <textarea
          className="vd-textarea"
          placeholder={config.placeholder}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
        />
        <div className={`vd-char ${note.length > 450 ? 'is-error' : note.length > 400 ? 'is-warn' : ''}`}>
          {note.length} / 500
        </div>
      </div>
      <div className="vd-modal__foot">
        <button className="vd-btn-cancel" onClick={onClose}>Cancel</button>
        <button
          className={`vd-btn-confirm ${config.confirmRed ? 'is-red' : ''}`}
          disabled={note.trim().length === 0}
          onClick={confirm}
        >
          {config.confirmText}
        </button>
      </div>
    </Shell>
  );
}

function GraceModal({
  onClose, onConfirm, vendorName,
}: { onClose: () => void; onConfirm: (days: number, reason: string) => void; vendorName: string }) {
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState('');
  return (
    <Shell onClose={onClose}>
      <div className="vd-modal__head">
        <h3 className="vd-modal__title">Extend Compliance Grace Period</h3>
        <p className="vd-modal__sub">
          Grant additional time for {vendorName} to resolve compliance issues.
        </p>
      </div>
      <div className="vd-modal__body">
        <label className="vd-form-lbl" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)' }}>
          Extension period
        </label>
        <select className="vd-input" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value="7">+7 days</option>
          <option value="14">+14 days</option>
          <option value="21">+21 days</option>
          <option value="30">+30 days</option>
        </select>
        <label className="vd-form-lbl" style={{ marginTop: 14, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)' }}>
          Reason (audit record)
        </label>
        <input
          className="vd-input"
          type="text"
          placeholder="e.g. Vendor submitted renewal — awaiting processing"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="vd-modal__foot">
        <button className="vd-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="vd-btn-confirm" onClick={() => { onConfirm(days, reason || 'No reason specified'); onClose(); }}>
          Grant Extension
        </button>
      </div>
    </Shell>
  );
}

function EditTradesModal({
  vendor, onClose, onConfirm,
}: { vendor: Vendor; onClose: () => void; onConfirm: (trades: string[], reason: string) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(vendor.trades));
  const [reason, setReason] = useState('');

  const toggle = (t: string) => setSelected((s) => {
    const next = new Set(s);
    next.has(t) ? next.delete(t) : next.add(t);
    return next;
  });

  const submit = () => {
    if (selected.size === 0) return;
    onConfirm(Array.from(selected), reason || 'No reason specified');
    onClose();
  };

  return (
    <Shell onClose={onClose} maxWidth={600}>
      <div className="vd-modal__head">
        <h3 className="vd-modal__title">Edit Vendor Trades</h3>
        <p className="vd-modal__sub">
          Editing trades for {vendor.name}. Changes are logged to audit trail.
        </p>
      </div>
      <div className="vd-modal__body">
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
          Certified Trades ({ALL_TRADES.length} available)
        </div>
        <div className="vd-trade-check__list">
          {ALL_TRADES.map((t) => (
            <label key={t} className="vd-trade-check">
              <input
                type="checkbox"
                checked={selected.has(t)}
                onChange={() => toggle(t)}
              />
              {t}
            </label>
          ))}
        </div>
        <label className="vd-form-lbl" style={{ marginTop: 14, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)' }}>
          Reason for change (audit record)
        </label>
        <input
          className="vd-input"
          placeholder="e.g. Vendor submitted Roofing certification — verified Mar 2026"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="vd-modal__foot">
        <button className="vd-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="vd-btn-confirm" disabled={selected.size === 0} onClick={submit}>
          Save Trade Changes
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children, onClose, maxWidth }: { children: React.ReactNode; onClose: () => void; maxWidth?: number }) {
  return (
    <div className="vd-modal-overlay" onClick={onClose}>
      <div
        className="vd-modal"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}