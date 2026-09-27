// apps/owner-portal/src/pages/Approvals/components/DeclineDrawer.tsx
import { useEffect, useState } from 'react';
import type { Approval } from '../../../context/OwnerContext';

interface DeclineDrawerProps {
  target: Approval | null;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export default function DeclineDrawer({ target, onClose, onConfirm }: DeclineDrawerProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (target) setNote('');
  }, [target]);

  return (
    <>
      <div className={`overlay${target ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer drawer--bottom${target ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Decline approval"
      >
        <div className="drawer__title">Decline approval?</div>
        <div className="drawer__subtitle">
          {target ? `${target.title} — $${target.amount.toLocaleString()}` : ''}
        </div>
        <div className="drawer__hint">This will notify your PM. Add a note (optional):</div>
        <textarea
          className="textarea"
          placeholder="e.g. Please get a second quote first…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="drawer__actions">
          <button type="button" className="btn btn-danger" onClick={() => onConfirm(note)}>
            Confirm Decline
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
