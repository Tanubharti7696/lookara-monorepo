// src/pages/ReviewQueue/components/DecisionModals.tsx
import { useEffect, useState } from 'react';

export type ModalState =
  | { type: 'reject'; docType: string; vendor: string; itemId: string }
  | { type: 'warn'; vendor: string }
  | { type: 'suspend'; vendor: string }
  | { type: 'dismiss'; vendor: string }
  | { type: 'resolve'; disputeId: string; party: 'PM' | 'Vendor' }
  | { type: 'quickApprove'; title: string }
  | { type: 'docViewer'; docType: string; vendorName: string; filename: string }
  | null;

type Props = {
  modal: NonNullable<ModalState>;
  onClose: () => void;
  onResolve: (disputeId: string, party: 'PM' | 'Vendor', note: string, instruction: string) => void;
  onRemoveFlag: (vendor: string, action: string, tone: 'green'|'yellow'|'red'|'neutral', note: string, badge?: 'active'|'limited'|'blocked'|'suspended') => void;
  onRemoveCompliance: (id: string, action: 'approve' | 'reject', note: string) => void;
  onOpenDocViewer: (docType: string, vendorName: string, filename: string) => void;
};

export default function DecisionModals({
  modal, onClose, onResolve, onRemoveFlag, onRemoveCompliance, onOpenDocViewer: _onOpenDocViewer,
}: Props) {
  void _onOpenDocViewer;
  const [note, setNote] = useState('');
  const [instruction, setInstruction] = useState('');

  useEffect(() => {
    setNote('');
    setInstruction('');
  }, [modal]);

  if (modal.type === 'quickApprove') {
    onRemoveCompliance('', 'approve', '');
    onClose();
    return null;
  }

  if (modal.type === 'docViewer') {
    return (
      <ModalShell onClose={onClose} wide>
        <div className="rq-modal__head">
          <div>
            <h3 className="rq-modal__title">{modal.docType} — {modal.vendorName}</h3>
            <p className="rq-modal__sub">Original upload · Read-only · Audit logged</p>
          </div>
          <button className="rq-drawer__close" onClick={onClose}>✕</button>
        </div>
        <div className="rq-modal__body" style={{ padding: 0 }}>
          <div className="rq-doc-meta">
            <span>📄 <span style={{ color: 'rgba(255,255,255,0.75)' }}>{modal.filename}</span></span>
            <span>Read-only · Original upload · Immutable</span>
          </div>
          <div className="rq-doc-frame">
            <div className="rq-doc-frame__icon">📄</div>
            <div className="rq-doc-frame__label">{modal.filename}</div>
            <div className="rq-doc-frame__hint">
              In production: original PDF or image renders here<br />
              Read-only · Cannot be edited or downloaded by admin
            </div>
          </div>
        </div>
        <div className="rq-modal__foot" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            Original vendor upload · Audit logged on view
          </span>
          <button className="rq-btn-cancel" onClick={onClose}>Close</button>
        </div>
      </ModalShell>
    );
  }

  /* ── All textarea modals share this wrapper ── */
  const config = {
    reject: {
      title: 'Reject Document',
      sub: `${modal.type === 'reject' ? modal.docType + ' — ' + modal.vendor : ''}`,
      label: 'Reason for rejection',
      placeholder: 'Explain why this document is being rejected. Be specific — vendor will see this to correct the issue.',
      confirmText: 'Confirm Rejection',
      confirmRed: true,
    },
    warn: {
      title: 'Issue Warning',
      sub: modal.type === 'warn' ? modal.vendor : '',
      label: 'Warning note',
      placeholder: "State the warning clearly. This is logged in the vendor's permanent record and visible to all admins.",
      confirmText: 'Issue Warning',
      confirmRed: false,
    },
    suspend: {
      title: 'Suspend Vendor',
      sub: modal.type === 'suspend' ? modal.vendor : '',
      label: 'Reason for suspension',
      placeholder: 'Document the pattern and reason. Vendor is removed from all dispatch pools. This is part of the permanent audit trail.',
      confirmText: 'Suspend Vendor',
      confirmRed: true,
    },
    dismiss: {
      title: 'Dismiss Flag',
      sub: modal.type === 'dismiss' ? modal.vendor : '',
      label: 'Reason for dismissal',
      placeholder: 'Why is this flag being dismissed? Document resolution or extenuating circumstances.',
      confirmText: 'Dismiss Flag',
      confirmRed: false,
    },
    resolve: {
      title: 'Resolve Dispute',
      sub: modal.type === 'resolve' ? `${modal.disputeId} — Supporting ${modal.party} Position` : '',
      label: 'Resolution reasoning',
      placeholder: 'State which evidence was decisive and why. Be specific — this is the permanent audit record.',
      confirmText: 'Confirm Resolution',
      confirmRed: false,
    },
  }[modal.type];

  const confirm = () => {
    if (modal.type === 'reject') {
      onRemoveCompliance(modal.itemId, 'reject', note);
    } else if (modal.type === 'warn') {
      onRemoveFlag(modal.vendor, 'Warning Issued', 'yellow', note, 'active');
    } else if (modal.type === 'suspend') {
      onRemoveFlag(modal.vendor, 'Suspended', 'red', note, 'suspended');
    } else if (modal.type === 'dismiss') {
      onRemoveFlag(modal.vendor, 'Flag Dismissed', 'neutral', note);
    } else if (modal.type === 'resolve') {
      onResolve(modal.disputeId, modal.party, note, instruction);
    }
    onClose();
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="rq-modal__head">
        <div>
          <h3 className="rq-modal__title">{config.title}</h3>
          <p className="rq-modal__sub">{config.sub}</p>
        </div>
      </div>
      <div className="rq-modal__body">
        <label className="rq-form-label">
          {config.label} <span className="req">*</span>
        </label>
        <textarea
          className="rq-textarea"
          placeholder={config.placeholder}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
        />
        <div className={`rq-char ${note.length > 450 ? 'is-error' : note.length > 400 ? 'is-warn' : ''}`}>
          {note.length} / 500
        </div>

        {modal.type === 'resolve' && (
          <>
            <label className="rq-form-label" style={{ marginTop: 16 }}>
              Post-decision instruction <span className="optional">(optional — creates correction task)</span>
            </label>
            <input
              className="rq-input"
              placeholder="e.g. Replace filter with MERV 13 · Return to property · Redo caulking to spec"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value.slice(0, 200))}
            />
            <div className="rq-hint">
              If filled, a Correction Task is automatically created, assigned to the vendor, and visible to the PM.
              Vendor must complete within SLA or face auto-flag.
            </div>
          </>
        )}
      </div>
      <div className="rq-modal__foot">
        <button className="rq-btn-cancel" onClick={onClose}>Cancel</button>
        <button
          className={`rq-btn-confirm ${config.confirmRed ? 'is-red' : ''}`}
          disabled={note.trim().length === 0}
          onClick={confirm}
        >
          {config.confirmText}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="rq-modal-overlay" onClick={onClose}>
      <div className={`rq-modal ${wide ? 'rq-modal--wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}