// apps/owner-portal/src/pages/Approvals/Approvals.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwner, type Approval } from '../../context/OwnerContext';
import { useToast } from '../../context/ToastContext';
import ModalShell from '../../components/ModalShell/ModalShell';
import ApprovalFilter, { type FilterKey } from './components/ApprovalFilter';
import ApprovalCard from './components/ApprovalCard';
import DeclineDrawer from './components/DeclineDrawer';
import ApprovalDrawer from './components/ApprovalDrawer';
import './Approvals.css';

type ModalState =
  | { kind: 'question'; approval: Approval; mode: 'initial' | 'follow-up' }
  | null;

export default function Approvals() {
  const navigate = useNavigate();
  const {
    approvals,
    approvalHistory,
    qaMap,
    approveApproval,
    declineApproval,
    askQuestion,
    askFollowUp,
  } = useOwner();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [declineTarget, setDeclineTarget] = useState<Approval | null>(null);
  const [detailTarget, setDetailTarget] = useState<Approval | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  /* Filter */
  const filteredApprovals = useMemo(() => {
    switch (filter) {
      case 'urgent':
        return approvals.filter((a) => a.priority === 'urgent');
      case 'week':
        return approvals.filter((a) => a.deadlineHours <= 24 * 7);
      case 'all':
      default:
        return approvals;
    }
  }, [approvals, filter]);

  const priorityApprovals = filteredApprovals.filter(
    (a) => a.priority === 'urgent' || a.priority === 'normal',
  );
  const lowPriorityApprovals = filteredApprovals.filter((a) => a.priority === 'low');

  const urgentCount = approvals.filter((a) => a.priority === 'urgent').length;
  const totalValue = approvals.reduce((sum, a) => sum + a.amount, 0);

  /* Handlers */
  const handleApprove = (approval: Approval) => {
    approveApproval(approval.id);
    showToast(`${approval.title} approved — PM notified, vendor dispatched`, 'success');
  };

  const handleDeclineConfirm = (note: string) => {
    if (!declineTarget) return;
    const target = declineTarget;
    declineApproval(target.id, note);
    setDeclineTarget(null);
    showToast(`${target.title} declined — PM notified`, 'danger');
  };

  const handleSubmitQuestion = (text: string) => {
    if (!modal) return;
    if (modal.mode === 'initial') {
      askQuestion(modal.approval.id, text);
      showToast('Question sent to PM — card stays active', 'info');
    } else {
      askFollowUp(modal.approval.id, text);
      showToast('Follow-up sent to PM', 'info');
    }
    setModal(null);
  };

  const handleAskClick = (approval: Approval) => {
    const qa = qaMap[approval.id];
    if (qa?.status === 'pm-responded' && !qa.followUpAsked) {
      setModal({ kind: 'question', approval, mode: 'follow-up' });
    } else if (!qa) {
      setModal({ kind: 'question', approval, mode: 'initial' });
    }
  };

  /* Most urgent deadline for banner */
  const topUrgent = useMemo(
    () =>
      approvals
        .filter((a) => a.priority === 'urgent')
        .sort((a, b) => a.deadlineHours - b.deadlineHours)[0],
    [approvals],
  );

  return (
    <div className="page-body">
      {/* Summary */}
      <div className="summary-bar">
        <button
          type="button"
          className="sum-stat"
          onClick={() => showToast(`${approvals.length} approvals pending`, 'info')}
        >
          <div className="sum-stat-lbl">Pending</div>
          <div className="sum-stat-val">{approvals.length}</div>
          <div className="sum-stat-sub">Awaiting your decision</div>
        </button>

        <button
          type="button"
          className="sum-stat urgent"
          onClick={() => showToast(`${urgentCount} urgent — act within 12h`, 'info')}
        >
          <div className="sum-stat-lbl">Urgent</div>
          <div className="sum-stat-val red">{urgentCount}</div>
          <div className="sum-stat-sub">Within 12 hours</div>
        </button>

        <button
          type="button"
          className="sum-stat"
          onClick={() => showToast('Total value of pending approvals', 'info')}
        >
          <div className="sum-stat-lbl">Value at Risk</div>
          <div className="sum-stat-val amber">${totalValue.toLocaleString()}</div>
          <div className="sum-stat-sub">Across pending items</div>
        </button>

        <button
          type="button"
          className="sum-stat"
          onClick={() =>
            showToast(`${approvalHistory.length} approvals resolved this year`, 'info')
          }
        >
          <div className="sum-stat-lbl">Resolved</div>
          <div className="sum-stat-val">{approvalHistory.length}</div>
          <div className="sum-stat-sub">This year</div>
        </button>
      </div>

      {/* Action today banner */}
      {topUrgent && (
        <div className="action-today">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="8" r="7" />
            <path d="M8 4v4l2.5 2.5" />
          </svg>
          Act within {topUrgent.deadlineLabel.replace(' left', '')} — {topUrgent.title} at {topUrgent.propertyName}. {topUrgent.consequence}.
        </div>
      )}

      {/* Priority queue */}
      <section className="priority-section">
        <div className="priority-header">
          <div className="section-label" style={{ marginBottom: 0 }}>Priority Queue</div>
          <ApprovalFilter value={filter} onChange={setFilter} />
        </div>

        {priorityApprovals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            qa={qaMap[approval.id]}
            onApprove={() => handleApprove(approval)}
            onDecline={() => setDeclineTarget(approval)}
            onAskQuestion={() => handleAskClick(approval)}
            onViewDetail={() => setDetailTarget(approval)}
          />
        ))}

        {priorityApprovals.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <div className="empty-title">Nothing waiting for approval</div>
            <div className="empty-sub">All decisions are up to date</div>
          </div>
        )}
      </section>

      {/* Low priority */}
      {lowPriorityApprovals.length > 0 && (
        <section className="secondary-section">
          <div className="section-label">Low Priority</div>
          {lowPriorityApprovals.map((approval) => (
            <button
              key={approval.id}
              type="button"
              className="secondary-card"
              onClick={() => setDetailTarget(approval)}
            >
              <span className="sc-left">
                <span className="sc-title">{approval.title}</span>
                <span className="sc-meta">{approval.propertyName} · {approval.detail}</span>
              </span>
              <span className="sc-right">
                <span className="sc-amount">${approval.amount}</span>
                <span className="sc-status">Review only</span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </span>
            </button>
          ))}
        </section>
      )}

      {/* History */}
      <section className="history-section">
        <div className="section-label">History</div>
        <div className="history-panel">
          {approvalHistory.map((item) => (
            <button
              key={item.id}
              type="button"
              className="history-row"
              onClick={() => navigate(`/approvals/history/${item.id}`)}
            >
              <span className="hr-left">
                <span className={`hr-outcome ho-${item.outcome}`}>
                  {item.outcome === 'approved' ? 'Approved' : item.outcome === 'declined' ? 'Declined' : 'Expired'}
                </span>
                <span className="hr-title">{item.title}</span>
                {item.note && <span className="hr-note">{item.note}</span>}
              </span>
              <span className="hr-right">
                <span className={`hr-amount${item.outcome === 'approved' ? ' hr-amount--approved' : ''}`}>
                  ${item.amount.toLocaleString()}
                </span>
                <span className="hr-date">{item.date}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Drawers */}
      <DeclineDrawer
        target={declineTarget}
        onClose={() => setDeclineTarget(null)}
        onConfirm={handleDeclineConfirm}
      />

      <ApprovalDrawer
        target={detailTarget}
        onClose={() => setDetailTarget(null)}
        onApprove={(a) => {
          setDetailTarget(null);
          handleApprove(a);
        }}
        onDecline={(a) => {
          setDetailTarget(null);
          setDeclineTarget(a);
        }}
      />

      {/* Question modal */}
      {modal && (
        <QuestionModal
          approval={modal.approval}
          mode={modal.mode}
          onSubmit={handleSubmitQuestion}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

/* ── Inline QuestionModal ──────────────────────────────────── */

function QuestionModal({
  approval,
  mode,
  onSubmit,
  onClose,
}: {
  approval: Approval;
  mode: 'initial' | 'follow-up';
  onSubmit: (text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <ModalShell
      open
      onClose={onClose}
      title="Ask PM a Question"
      subtitle={`${approval.title} · ${mode === 'follow-up' ? 'Follow-up (1 allowed)' : 'Ask before deciding'}`}
      footer={
        <>
          <button type="button" className="btn btn-primary" onClick={submit}>Send to PM</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </>
      }
    >
      <label className="field-label" htmlFor="question-input">Your question</label>
      <textarea
        id="question-input"
        className={`textarea${error ? ' is-error' : ''}`}
        placeholder="e.g. Can we get a second quote first?"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(false);
        }}
        style={{ marginBottom: 16, height: 88 }}
      />
      <div className="modal-hint">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="8" cy="8" r="7" />
          <path d="M8 5v4M8 11v.5" />
        </svg>
        Card stays active until PM responds
      </div>
    </ModalShell>
  );
}
