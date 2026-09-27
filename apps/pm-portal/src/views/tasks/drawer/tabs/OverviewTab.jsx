// src/views/tasks/drawer/tabs/OverviewTab.jsx
import { SOURCE_LABELS } from '../../../../data/taskMeta';

const JOURNEY_PATHS = {
  repair: [
    { state: 'unassigned',             label: 'Unassigned' },
    { state: 'dispatching',            label: 'Dispatching' },
    { state: 'dispatched',             label: 'Dispatched' },
    { state: 'accepted',               label: 'Accepted' },
    { state: 'en-route',               label: 'En Route' },
    { state: 'on-site',                label: 'On Site' },
    { state: 'in-progress',            label: 'In Progress' },
    { state: 'quote-pending',          label: 'Quote Pending' },
    { state: 'pending-owner-approval', label: 'Owner Approval' },
    { state: 'approved',               label: 'Approved' },
    { state: 'verification-pending',   label: 'Verification' },
    { state: 'awaiting-payment',       label: 'Awaiting Payment' },
    { state: 'payment-sent',           label: 'Payment Sent' },
    { state: 'closed',                 label: 'Closed' },
  ],
  compliance: [
    { state: 'pending',              label: 'Pending' },
    { state: 'dispatched',           label: 'Dispatched' },
    { state: 'accepted',             label: 'Accepted' },
    { state: 'in-progress',          label: 'In Progress' },
    { state: 'verification-pending', label: 'Verification' },
    { state: 'compliant',            label: 'Compliant' },
    { state: 'closed',               label: 'Closed' },
  ],
  recurring: [
    { state: 'pending',              label: 'Pending' },
    { state: 'dispatched',           label: 'Dispatched' },
    { state: 'accepted',             label: 'Accepted' },
    { state: 'en-route',             label: 'En Route' },
    { state: 'on-site',              label: 'On Site' },
    { state: 'in-progress',          label: 'In Progress' },
    { state: 'verification-pending', label: 'Verification' },
    { state: 'completed',            label: 'Completed' },
    { state: 'closed',               label: 'Closed' },
  ],
  payment: [
    { state: 'awaiting-payment',   label: 'Awaiting Payment' },
    { state: 'payment-disputed',   label: 'Disputed' },
    { state: 'escalated-to-admin', label: 'Escalated to Admin' },
    { state: 'payment-sent',       label: 'Payment Sent' },
    { state: 'payment-confirmed',  label: 'Vendor Confirmed' },
    { state: 'closed',             label: 'Closed' },
  ],
  assessment: [
    { state: 'assessment-dispatched', label: 'Assessment' },
    { state: 'assessment-accepted',   label: 'On Site' },
    { state: 'quote-pending',         label: 'Quote Pending' },
    { state: 'approved',              label: 'Approved' },
    { state: 'in-progress',           label: 'In Progress' },
    { state: 'verification-pending',  label: 'Verification' },
    { state: 'closed',                label: 'Closed' },
  ],
  terminal: [
    { state: '_start',    label: 'Created' },
    { state: '_terminal', label: 'Ended' },
  ],
};

const TERMINAL_LABELS = {
  blocked:              'Blocked',
  escalated:            'Escalated',
  cancelled:            'Cancelled',
  dismissed:            'Dismissed',
  'rework-required':    'Rework Required',
  'owner-clarification':'Owner Clarification Requested',
  'owner-rejected':     'Owner Rejected',
  'vendor-declined':    'Vendor Declined',
  compliant:            'Compliant',
  'non-compliant':      'Non-Compliant',
  overdue:              'Overdue',
  waived:               'Waived',
};

const SEV_COLOR = { CRITICAL: 'red', HIGH: 'amber', MEDIUM: 'blue', NORMAL: '', LOW: 'muted' };

export default function OverviewTab({ task }) {
  const srcMeta = SOURCE_LABELS[task.source] || SOURCE_LABELS.manual_intake;

  return (
    <div>
      {/* Task Details */}
      <div className="lk-block">
        <div className="lk-block__title">Task Details</div>
        <Row label="Trade"        value={task.trade || task.taskTypeLabel || '—'} tone="blue" />
        <Row label="Workflow"     value={task.taskTypeLabel || task.taskType || '—'} />
        <Row label="Priority"     value={task.severity} tone={SEV_COLOR[task.severity]} />
        <Row label="Source"       value={srcMeta.label} />
        <Row label="Due Date"     value={task.due} tone={task.dueOverdue ? 'red' : task.dueSoon ? 'amber' : ''} />
        <Row label="Current Owner" value={task.vendor || 'Unassigned'} tone={task.vendor ? '' : 'muted'} />
        <Row label="Created By"   value={task.created_by || 'PM'} />
        <Row label="Created"      value={task.created || '—'} />
      </div>

      {/* Recurring block */}
      {task.recurring && (
        <div className="lk-block">
          <div className="lk-block__title">Recurring Pattern</div>
          <Row label="Frequency"         value={task.recurring.frequency} />
          <Row label="Last Completed"    value={task.recurring.lastCompleted} tone="green" />
          <Row label="Next Occurrence"   value={task.recurring.nextOccurrence} />
          <Row label="Completion History" value={task.recurring.completionHistory} tone="green" />
        </div>
      )}

      {/* Turnover window */}
      {task.isTurnoverCleaning && (
        <div className="lk-block">
          <div className="lk-block__title">Turnover Window</div>
          <Row label="Checkout"        value={task.checkoutTime || '—'} />
          <Row label="Check-in"        value={task.checkinTime  || '—'} />
          <Row label="Cleaning Window" value={task.cleaningWindow || '—'} tone="blue" />
        </div>
      )}

      {/* Property status */}
      <div className="lk-block">
        <div className="lk-block__title">Property Status</div>
        <Row label="Occupancy"       value={task.occupancy || 'Unknown'} />
        <Row label="Last Inspection" value={task.lastInspection || '—'} />
        <Row label="Open Incidents"  value={task.openIncidents > 0 ? `${task.openIncidents} Active` : '0'} tone={task.openIncidents > 0 ? 'amber' : ''} />
      </div>

      {/* Related records */}
      {task.relatedRecords?.length > 0 && (
        <div className="lk-block">
          <div className="lk-block__title">Related Records</div>
          {task.relatedRecords.map((r, i) => (
            <div key={i} className="lk-related">
              <span className="lk-related__icon">{r.icon}</span>
              <span className="lk-related__label">{r.label}</span>
              <span className="lk-related__chev">›</span>
            </div>
          ))}
        </div>
      )}

      {/* Journey */}
      <div className="lk-block">
        <div className="lk-block__title">Current Journey</div>
        <Journey task={task} />
      </div>
    </div>
  );
}

function Row({ label, value, tone = '' }) {
  return (
    <div className="lk-row">
      <span className="lk-row__label">{label}</span>
      <span className={`lk-row__value${tone ? ` lk-row__value--${tone}` : ''}`}>{value}</span>
    </div>
  );
}

function getJourneyType(task) {
  const t = task.journeyType;
  if (t) return t;
  if (task.taskType === 'Assessment') return 'assessment';
  if (task.taskType === 'Payment') return 'payment';
  if (task.taskType === 'Recurring' || task.taskType === 'Turnover') return 'recurring';
  if (task.taskType === 'Inspection' || task.taskType === 'Compliance') return 'compliance';
  return 'repair';
}

function Journey({ task }) {
  const type = getJourneyType(task);
  const path = JOURNEY_PATHS[type] || JOURNEY_PATHS.repair;
  const currentIdx = path.findIndex(s => s.state === task.state);

  const created = (
    <div className="lk-journey__step lk-journey__step--done" key="__created">
      <div className="lk-journey__dot" />
      <div className="lk-journey__label">✓ Created</div>
    </div>
  );

  // Terminal / off-path state
  if (currentIdx === -1 && TERMINAL_LABELS[task.state]) {
    const blockIdx = task.journeyBlockIndex ?? 0;
    const rows = [];

    for (let i = 0; i <= blockIdx; i++) {
      rows.push(
        <div key={`done-${i}`} className="lk-journey__step lk-journey__step--done">
          <div className="lk-journey__dot" />
          <div className="lk-journey__label">✓ {path[i].label}</div>
        </div>
      );
    }
    rows.push(
      <div key="terminal" className="lk-journey__step lk-journey__step--terminal">
        <div className="lk-journey__dot" />
        <div className="lk-journey__label">🔴 {TERMINAL_LABELS[task.state]}</div>
        <span className="lk-journey__tag">Current</span>
      </div>
    );
    for (let i = blockIdx + 1; i < path.length; i++) {
      rows.push(
        <div key={`up-${i}`} className="lk-journey__step">
          <div className="lk-journey__dot" />
          <div className="lk-journey__label">○ {path[i].label}</div>
        </div>
      );
    }
    return <div className="lk-journey">{created}{rows}</div>;
  }

  return (
    <div className="lk-journey">
      {created}
      {path.map((step, i) => {
        const skipped = task.skippedSteps?.includes(step.state);
        const cls = skipped ? 'skipped' : i < currentIdx ? 'done' : i === currentIdx ? 'current' : '';
        const icon = skipped ? '— ' : i < currentIdx ? '✓ ' : i === currentIdx ? '🟡 ' : '○ ';
        return (
          <div
            key={step.state}
            className={`lk-journey__step${cls ? ` lk-journey__step--${cls}` : ''}`}
          >
            <div className="lk-journey__dot" />
            <div className="lk-journey__label">
              {icon}{step.label}
              {skipped && <span style={{ color: 'var(--slate)', fontStyle: 'italic' }}> (not required)</span>}
            </div>
            {i === currentIdx && <span className="lk-journey__tag">Current</span>}
          </div>
        );
      })}
    </div>
  );
}