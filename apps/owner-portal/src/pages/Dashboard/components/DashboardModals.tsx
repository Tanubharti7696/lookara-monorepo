// apps/owner-portal/src/pages/Dashboard/components/DashboardModals.tsx
import { useEffect, useState } from 'react';
import { useOwner, type Approval } from '../../../context/OwnerContext';
import { useToast } from '../../../context/ToastContext';
import ModalShell from '../../../components/ModalShell/ModalShell';

export type DashboardModal = 'invite-pm' | 'request-access' | null;

interface DashboardModalsProps {
  modal: DashboardModal;
  onCloseModal: () => void;
  declineTarget: Approval | null;
  onCloseDecline: () => void;
  detailTarget: Approval | null;
  onCloseDetail: () => void;
}

export default function DashboardModals({
  modal,
  onCloseModal,
  declineTarget,
  onCloseDecline,
  detailTarget,
  onCloseDetail,
}: DashboardModalsProps) {
  const { approveApproval, declineApproval } = useOwner();
  const { showToast } = useToast();

  const [inviteEmail, setInviteEmail] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [declineNote, setDeclineNote] = useState('');

  // Reset the decline note whenever a new target opens.
  useEffect(() => {
    if (declineTarget) setDeclineNote('');
  }, [declineTarget]);

  const handleConfirmDecline = () => {
    if (!declineTarget) return;
    declineApproval(declineTarget.id, declineNote);
    showToast(`${declineTarget.title} declined — PM notified`, 'danger');
    onCloseDecline();
  };

  const handleDetailApprove = () => {
    if (!detailTarget) return;
    approveApproval(detailTarget.id);
    showToast(`${detailTarget.title} approved — PM notified`, 'success');
    onCloseDetail();
  };

  const handleDetailDecline = () => {
    if (!detailTarget) return;
    const target = detailTarget;
    onCloseDetail();
    showToast(`${target.title} — use Decline on the card`, 'info');
  };

  return (
    <>
      {/* ── Invite PM ─────────────────────────────────────── */}
      <ModalShell
        open={modal === 'invite-pm'}
        onClose={onCloseModal}
        title="Invite Property Manager"
        subtitle="Your PM will set up the property and connect it to your portfolio."
        footer={
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const email = inviteEmail.trim();
                if (!email) return;
                onCloseModal();
                setInviteEmail('');
                showToast(`Invite sent to ${email}`, 'success');
              }}
            >
              Send Invite
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCloseModal}>
              Cancel
            </button>
          </>
        }
      >
        <label className="field-label" htmlFor="invite-email">
          PM Email Address
        </label>
        <input
          id="invite-email"
          className="input"
          type="email"
          placeholder="manager@example.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <label className="field-label" htmlFor="invite-property">
          Property (optional — let PM add it)
        </label>
        <input
          id="invite-property"
          className="input"
          type="text"
          placeholder="e.g. Seaside Villa, Clearwater Beach"
          style={{ marginBottom: 20 }}
        />

        <div
          className="note-box"
          style={{
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.15)',
            marginBottom: 20,
          }}
        >
          Your PM will receive an invite link. Once they accept and set up the
          property, it will appear in your portal automatically.
        </div>
      </ModalShell>

      {/* ── Request Access ────────────────────────────────── */}
      <ModalShell
        open={modal === 'request-access'}
        onClose={onCloseModal}
        title="Request Access"
        subtitle="Already have a PM managing this property on Lookara? Request to be linked."
        footer={
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const email = accessEmail.trim();
                if (!email) return;
                onCloseModal();
                setAccessEmail('');
                showToast('Access request sent — awaiting PM confirmation', 'success');
              }}
            >
              Send Request
            </button>
            <button type="button" className="btn btn-ghost" onClick={onCloseModal}>
              Cancel
            </button>
          </>
        }
      >
        <label className="field-label" htmlFor="access-email">
          PM Email Address
        </label>
        <input
          id="access-email"
          className="input"
          type="email"
          placeholder="Your PM's Lookara email"
          value={accessEmail}
          onChange={(e) => setAccessEmail(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <label className="field-label" htmlFor="access-property">
          Property Name or Address
        </label>
        <input
          id="access-property"
          className="input"
          type="text"
          placeholder="e.g. Lake Nona Villa, Orlando FL"
          style={{ marginBottom: 20 }}
        />

        <div
          className="note-box"
          style={{
            background: 'rgba(59,130,246,0.05)',
            border: '1px solid rgba(59,130,246,0.15)',
            marginBottom: 20,
          }}
        >
          Your PM will receive a confirmation request. Once approved, the
          property will appear in your portal.
        </div>
      </ModalShell>

      {/* ── Decline drawer ────────────────────────────────── */}
      <div
        className={`overlay${declineTarget ? ' is-open' : ''}`}
        onClick={onCloseDecline}
        aria-hidden="true"
      />
      <div
        className={`drawer drawer--bottom${declineTarget ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Decline approval"
      >
        <div className="drawer__title">Decline approval?</div>
        <div className="drawer__subtitle">
          {declineTarget
            ? `${declineTarget.title} — $${declineTarget.amount}`
            : ''}
        </div>

        <div className="drawer__hint">
          This will notify your PM. Add a note (optional):
        </div>

        <textarea
          className="textarea"
          placeholder="e.g. Please get a second quote first…"
          value={declineNote}
          onChange={(e) => setDeclineNote(e.target.value)}
        />

        <div className="drawer__actions">
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDecline}
          >
            Confirm Decline
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCloseDecline}>
            Cancel
          </button>
        </div>
      </div>

      {/* ── Approval detail drawer ────────────────────────── */}
      <div
        className={`overlay${detailTarget ? ' is-open' : ''}`}
        onClick={onCloseDetail}
        aria-hidden="true"
      />
      <div
        className={`drawer drawer--right${detailTarget ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Approval detail"
      >
        <div className="drawer__header">
          <div className="drawer__header-title">
            {detailTarget?.title ?? 'Approval Detail'}
          </div>
          <button
            type="button"
            className="drawer__close"
            onClick={onCloseDetail}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="detail-block">
          <div className="detail-block__label">PM Recommendation</div>
          <div className="detail-block__text">
            {detailTarget?.recommendation ?? ''}
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-stat">
            <div className="detail-stat__label">Amount</div>
            <div className="detail-stat__value gold">
              ${detailTarget?.amount ?? 0}
            </div>
          </div>
          <div className="detail-stat">
            <div className="detail-stat__label">Deadline</div>
            <div className="detail-stat__value warning">
              {detailTarget?.deadline ?? '—'}
            </div>
          </div>
        </div>

        <div className="detail-label">Evidence / Quote</div>
        <div className="detail-evidence">{detailTarget?.evidence ?? ''}</div>

        <div className="detail-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDetailApprove}
          >
            Approve
          </button>
          <button
            type="button"
            className="btn btn-danger-ghost"
            onClick={handleDetailDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </>
  );
}
