// src/views/tasks/drawer/tabs/StatePanel.jsx

export default function StatePanel({ task, onUpdate, openOverlay, actions }) {
  const { state } = task;

  /* ── 1. BLOCKED / ESCALATED / UNASSIGNED / VENDOR-DECLINED ── */
  if (['blocked', 'escalated', 'unassigned', 'vendor-declined'].includes(state)) {
    const critical = state === 'escalated';
    const titles = {
      escalated:       '🚨 Task Escalated — PM Action Required',
      blocked:         '⚠ Task Blocked — Cannot Dispatch',
      unassigned:      '⚠ No Vendor Assigned',
      'vendor-declined': '⚠ Vendor Declined — Reassignment Needed',
    };
    const subs = {
      escalated:        'No vendor responded within the response window. SLA clock running.',
      blocked:          `Auto-dispatch is blocked. ${task.dispatch?.reason || 'Check vendor pool.'} Manual assignment required.`,
      unassigned:       'No vendor in the pool matches this task. Expand search radius or add a new vendor.',
      'vendor-declined':'The dispatched vendor declined. Reassign manually or expand the pool.',
    };

    return (
      <div>
        <div className={`lk-banner lk-banner--${critical ? 'critical' : 'amber'}`}>
          <div className="lk-banner__title">{titles[state]}</div>
          <div className="lk-banner__sub">{subs[state]}</div>
        </div>

        {task.blockingReason && (
          <div className="lk-block" style={{ borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)' }}>
            <div className="lk-block__title" style={{ color: 'var(--amber)' }}>Blocking Reason</div>
            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
              {task.blockingReason}
            </p>
          </div>
        )}

        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => openOverlay('assign')}>
            Assign Vendor
          </button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.addTimeline('Schedule Visit requested — pending vendor confirmation', 'status', 'PM')}>
            Schedule Visit
          </button>
          {state !== 'escalated' && (
            <button className="lk-btn lk-btn--secondary" onClick={() => actions.setState('escalated')}>
              Escalate
            </button>
          )}
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('cancelled')}>
            Cancel Task
          </button>
        </div>
      </div>
    );
  }

  /* ── 2. DISPATCHING ── */
  if (state === 'dispatching') {
    return (
      <div>
        <div className="lk-banner lk-banner--blue">
          <div className="lk-banner__title">📡 Dispatch Running</div>
          <div className="lk-banner__sub">
            Vendor search in progress. {task.dispatch?.eligible || 0} eligible vendors notified. Waiting for acceptance.
          </div>
        </div>
        <div className="lk-btn-row">
          <button
            className="lk-btn lk-btn--danger"
            onClick={() => actions.setState('unassigned')}
          >
            Cancel Dispatch
          </button>
        </div>
      </div>
    );
  }

  /* ── 3. DISPATCHED / ACCEPTED / EN-ROUTE / ON-SITE / IN-PROGRESS / APPROVED ── */
  if (['dispatched', 'accepted', 'en-route', 'on-site', 'in-progress', 'approved'].includes(state)) {
    const titles = {
      dispatched: '✓ Vendor Assigned',
      accepted:   '✓ Vendor Accepted',
      'en-route': '🚗 En Route',
      'on-site':  '📍 On Site',
      'in-progress':'🟢 Work In Progress',
      approved:   '✓ Quote Approved',
    };
    const subs = {
      dispatched: 'Vendor dispatched — awaiting acceptance.',
      accepted:   'Vendor accepted — scheduled.',
      'en-route': 'Vendor en route to property.',
      'on-site':  'Vendor on site — not yet started.',
      'in-progress':'Vendor on site — work in progress.',
      approved:   'Quote approved — vendor confirmed.',
    };
    const bannerType = state === 'in-progress' ? 'success' : 'blue';

    return (
      <div>
        <div className={`lk-banner lk-banner--${bannerType}`}>
          <div className="lk-banner__title">{titles[state]}</div>
          <div className="lk-banner__sub">{subs[state]}</div>
        </div>

        {task.vendor && (
          <div className="lk-block">
            <div className="lk-block__title">Assigned Vendor</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              {task.vendor}
            </div>
            {task.acceptedAt && (
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Accepted: {task.acceptedAt}</div>
            )}
          </div>
        )}

        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logCall()}>
            📞 Call Vendor
          </button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logText()}>
            💬 Text Vendor
          </button>
        </div>

        {/* Simulate decline (prototype only) */}
        {state === 'dispatched' && (
          <div style={{ textAlign: 'center', paddingTop: 10, marginTop: 10, borderTop: '1px dashed var(--line)' }}>
            <button
              onClick={() => actions.setState('vendor-declined')}
              style={{ fontSize: 10, color: 'var(--slate)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              (prototype only — simulate vendor declining →)
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── 4. ASSESSMENT DISPATCHED ── */
  if (state === 'assessment-dispatched') {
    return (
      <div>
        <div className="lk-banner lk-banner--blue">
          <div className="lk-banner__title">🔍 Assessment Dispatched</div>
          <div className="lk-banner__sub">
            Vendor offered this assessment and has not yet accepted. SLA clock running.
          </div>
        </div>
        <div className="lk-block">
          <div className="lk-block__title">Assessment Workflow</div>
          <div className="lk-row"><span className="lk-row__label">Stage</span><span className="lk-row__value lk-row__value--blue">Awaiting Vendor Acceptance</span></div>
          <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{task.vendor || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Next Step</span><span className="lk-row__value lk-row__value--muted">Vendor accepts → travels → submits findings</span></div>
        </div>
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logCall()}>📞 Call Vendor</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logText()}>💬 Text Vendor</button>
        </div>
      </div>
    );
  }

  /* ── 5. ASSESSMENT ACCEPTED ── */
  if (state === 'assessment-accepted') {
    return (
      <div>
        <div className="lk-banner lk-banner--blue">
          <div className="lk-banner__title">🔍 Assessment In Progress</div>
          <div className="lk-banner__sub">
            Vendor on site diagnosing. Findings + quote will be submitted once complete.
          </div>
        </div>
        <div className="lk-block">
          <div className="lk-block__title">Assessment Workflow</div>
          <div className="lk-row"><span className="lk-row__label">Stage</span><span className="lk-row__value lk-row__value--blue">Vendor On Site — Diagnosing</span></div>
          <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{task.vendor || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Accepted</span><span className="lk-row__value lk-row__value--green">{task.acceptedAt || '—'}</span></div>
        </div>
      </div>
    );
  }

  /* ── 6. QUOTE PENDING ── */
  if (state === 'quote-pending') {
    return (
      <div>
        <div className="lk-banner lk-banner--gold">
          <div className="lk-banner__title">📋 Quote Submitted — Review Required</div>
          <div className="lk-banner__sub">
            Vendor has submitted a quote. Review scope and amount before approving dispatch.
          </div>
        </div>
        {task.quote && (
          <div className="lk-block">
            <div className="lk-block__title">Quote Summary</div>
            <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{task.quote.vendor}</span></div>
            <div className="lk-row"><span className="lk-row__label">Amount</span><span className="lk-row__value lk-row__value--gold">{task.quote.amount}</span></div>
            <div className="lk-row"><span className="lk-row__label">Submitted</span><span className="lk-row__value lk-row__value--muted">{task.quote.submitted}</span></div>
          </div>
        )}
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => openOverlay('quote')}>📄 Review & Approve</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.addTimeline('PM requested quote revision from vendor', 'warn', 'PM')}>Request Revision</button>
          <button className="lk-btn lk-btn--ghost" onClick={() => actions.setState('pending-owner-approval')}>Send to Owner</button>
        </div>
      </div>
    );
  }

  /* ── 7. QUOTE REJECTED ── */
  if (state === 'quote-rejected') {
    return (
      <div>
        <div className="lk-banner lk-banner--critical">
          <div className="lk-banner__title">✗ Quote Rejected</div>
          <div className="lk-banner__sub">
            {task.quote?.rejectedReason || 'This quote was rejected. Decide how to proceed.'}
          </div>
        </div>
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => actions.setState('quote-pending')}>
            Request Revised Quote
          </button>
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('cancelled')}>Cancel Task</button>
        </div>
      </div>
    );
  }

  /* ── 8. VERIFICATION PENDING / COMPLETED ── */
  if (['verification-pending', 'completed'].includes(state)) {
    const pw = task.proofOfWork;
    return (
      <div>
        <div className="lk-banner lk-banner--gold">
          <div className="lk-banner__title">✓ Work Submitted — Verify Completion</div>
          <div className="lk-banner__sub">
            Vendor marked this task complete and submitted proof of work. Review before recording payment.
          </div>
        </div>

        {pw && (
          <div className="lk-block">
            <div className="lk-block__title">Proof of Work</div>
            <div className="lk-photo-grid">
              {Array.from({ length: pw.beforePhotos || 0 }).map((_, i) => (
                <div key={`b${i}`} className="lk-photo-thumb">
                  <div className="lk-photo-thumb__icon">📷</div>
                  <div className="lk-photo-thumb__label">Before {i + 1}</div>
                </div>
              ))}
              {Array.from({ length: pw.afterPhotos || 0 }).map((_, i) => (
                <div key={`a${i}`} className="lk-photo-thumb">
                  <div className="lk-photo-thumb__icon">📷</div>
                  <div className="lk-photo-thumb__label">After {i + 1}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 10, background: 'var(--bg-0)', borderRadius: 6, fontSize: 12, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.55 }}>
              {pw.notes}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: 'var(--bg-0)', borderRadius: 6 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 2 }}>Invoice</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold)' }}>{pw.invoiceAmount}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 2 }}>Quoted</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{pw.quotedAmount}</div>
              </div>
              <span style={{
                padding: '3px 8px',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 4,
                fontSize: 11, fontWeight: 700, color: 'var(--success)',
              }}>
                {pw.variance}
              </span>
            </div>
          </div>
        )}

        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => openOverlay('verify')}>✓ Verify & Approve</button>
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('rework-required')}>Request Rework</button>
        </div>
      </div>
    );
  }

  /* ── 9. AWAITING PAYMENT ── */
  if (state === 'awaiting-payment') {
    const po = task.paymentOverdue;
    return (
      <div>
        {po?.vendorFlagged ? (
          <>
            <div className="lk-banner lk-banner--critical">
              <div className="lk-banner__title">⚠ Payment Overdue — Vendor Flagged</div>
              <div className="lk-banner__sub">
                {po.delayDays} days overdue · {task.vendor} flagged at {po.flaggedAt} · {po.reminders}/{po.maxReminders} reminders sent
              </div>
            </div>
            <div className="lk-block">
              <div className="lk-block__title">Payment Details</div>
              <div className="lk-row"><span className="lk-row__label">Recorded Amount</span><span className="lk-row__value lk-row__value--gold">{po.amount}</span></div>
              <div className="lk-row"><span className="lk-row__label">Days Overdue</span><span className="lk-row__value lk-row__value--red">{po.delayDays} days</span></div>
              <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{task.vendor}</span></div>
            </div>
          </>
        ) : (
          <div className="lk-banner lk-banner--gold">
            <div className="lk-banner__title">💳 Awaiting Payment Recording</div>
            <div className="lk-banner__sub">Work verified. Record the payment to close this task.</div>
          </div>
        )}

        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => openOverlay('payment')}>Record Payment</button>
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('payment-disputed')}>Open Dispute</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.addTimeline('PM requested payment clarification from vendor', 'warn', 'PM')}>
            Request Clarification
          </button>
        </div>
      </div>
    );
  }

  /* ── 10. PAYMENT DISPUTED ── */
  if (state === 'payment-disputed') {
    const pd = task.paymentDispute;
    const diff = pd
      ? (parseFloat(pd.invoiced.replace(/[$,]/g, '')) - parseFloat(pd.approved.replace(/[$,]/g, ''))).toFixed(2)
      : '0.00';

    return (
      <div>
        <div className="lk-banner lk-banner--critical">
          <div className="lk-banner__title">🚨 Payment Disputed</div>
          <div className="lk-banner__sub">{pd?.reason}</div>
        </div>

        {pd && (
          <div className="lk-block">
            <div className="lk-block__title">Dispute Details</div>
            <div className="lk-row"><span className="lk-row__label">Vendor Invoiced</span><span className="lk-row__value lk-row__value--gold">{pd.invoiced}</span></div>
            <div className="lk-row"><span className="lk-row__label">PM Approved</span><span className="lk-row__value lk-row__value--amber">{pd.approved}</span></div>
            <div className="lk-row"><span className="lk-row__label">Difference</span><span className="lk-row__value lk-row__value--red">${diff}</span></div>
            <div className="lk-row"><span className="lk-row__label">Flagged At</span><span className="lk-row__value lk-row__value--muted">{pd.flaggedAt}</span></div>
          </div>
        )}

        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => actions.setState('escalated-to-admin')}>Escalate to Admin</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.addTimeline('PM submitted dispute position + attachments', 'file', 'PM')}>
            Submit Position
          </button>
        </div>
      </div>
    );
  }

  /* ── 11. ESCALATED TO ADMIN ── */
  if (state === 'escalated-to-admin') {
    const esc = task.escalatedToAdmin || {};
    const pd  = task.paymentDispute;
    const diff = pd
      ? (parseFloat(pd.invoiced.replace(/[$,]/g, '')) - parseFloat(pd.approved.replace(/[$,]/g, ''))).toFixed(2)
      : '0.00';

    return (
      <div>
        <div className="lk-banner lk-banner--blue">
          <div className="lk-banner__title">🔒 Escalated to Admin Review</div>
          <div className="lk-banner__sub">
            Structured case file. PM and vendor can no longer modify it — Admin owns resolution.
          </div>
        </div>

        <div className="lk-block" style={{ borderColor: 'rgba(96,165,250,0.25)', background: 'rgba(96,165,250,0.05)' }}>
          <div className="lk-block__title" style={{ color: 'var(--blue)' }}>Case File</div>
          <div className="lk-row"><span className="lk-row__label">Case ID</span><span className="lk-row__value lk-row__value--blue">{esc.caseId || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Escalated At</span><span className="lk-row__value lk-row__value--muted">{esc.escalatedAt || '—'}</span></div>
          {pd && (
            <>
              <div className="lk-row"><span className="lk-row__label">Invoiced</span><span className="lk-row__value lk-row__value--gold">{pd.invoiced}</span></div>
              <div className="lk-row"><span className="lk-row__label">Approved</span><span className="lk-row__value lk-row__value--amber">{pd.approved}</span></div>
              <div className="lk-row"><span className="lk-row__label">Difference</span><span className="lk-row__value lk-row__value--red">${diff}</span></div>
            </>
          )}
        </div>

        {esc.pmSubmission && (
          <div className="lk-block">
            <div className="lk-block__title">PM Submission</div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55, margin: '0 0 8px' }}>
              {esc.pmSubmission.summary}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {esc.pmSubmission.attachments?.map((a, i) => (
                <span key={i} className="lk-tl__pill">📎 {a}</span>
              ))}
            </div>
          </div>
        )}

        {esc.vendorSubmission && (
          <div className="lk-block">
            <div className="lk-block__title">Vendor Submission</div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55, margin: '0 0 8px' }}>
              {esc.vendorSubmission.summary}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {esc.vendorSubmission.attachments?.map((a, i) => (
                <span key={i} className="lk-tl__pill">📎 {a}</span>
              ))}
            </div>
          </div>
        )}

        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.addTimeline('Opened case file (read-only)', 'info', 'PM')}>
            View Dispute File
          </button>
        </div>
      </div>
    );
  }

  /* ── 12. PENDING OWNER APPROVAL ── */
  if (state === 'pending-owner-approval') {
    const poa = task.pendingOwnerApproval || {};
    const q   = task.quote || {};
    return (
      <div>
        <div className="lk-banner lk-banner--gold">
          <div className="lk-banner__title">⏳ Awaiting Owner Authorization</div>
          <div className="lk-banner__sub">
            Quote has been sent to the owner for approval. Dispatch is on hold until they respond.
          </div>
        </div>
        <div className="lk-block">
          <div className="lk-block__title">Quote Sent to Owner</div>
          <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{q.vendor || task.vendor}</span></div>
          <div className="lk-row"><span className="lk-row__label">Quote Amount</span><span className="lk-row__value lk-row__value--gold">{q.amount || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Owner</span><span className="lk-row__value lk-row__value--muted">{poa.ownerName || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Response SLA</span><span className="lk-row__value lk-row__value--amber">{poa.slaDue || '48h window'}</span></div>
        </div>
        <div className="lk-btn-row">
          <button
            className="lk-btn lk-btn--secondary"
            onClick={() => actions.addTimeline('Authorization request resent to owner', 'status', 'PM')}
          >
            Resend Notification
          </button>
        </div>
      </div>
    );
  }

  /* ── 13. OWNER CLARIFICATION REQUESTED ── */
  if (state === 'owner-clarification') {
    const oc = task.ownerClarification || {};
    const q  = task.quote || {};
    return (
      <div>
        <div className="lk-banner lk-banner--gold">
          <div className="lk-banner__title">💬 Owner Requested Clarification</div>
          <div className="lk-banner__sub">
            Authorization on hold until you respond. Only owner-gated approval is paused — other work may continue.
          </div>
        </div>

        <div className="lk-block" style={{ borderColor: 'rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.05)' }}>
          <div className="lk-block__title" style={{ color: 'var(--blue)' }}>Owner's Question</div>
          <div className="lk-row"><span className="lk-row__label">Asked by</span><span className="lk-row__value lk-row__value--muted">{oc.requestedBy || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Asked at</span><span className="lk-row__value lk-row__value--muted">{oc.requestedAt || '—'}</span></div>
          <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, borderLeft: '3px solid #60A5FA' }}>
            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{oc.question || '—'}</div>
          </div>
        </div>

        <div className="lk-block">
          <div className="lk-block__title">Quote Under Review</div>
          <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{q.vendor || task.vendor}</span></div>
          <div className="lk-row"><span className="lk-row__label">Amount</span><span className="lk-row__value lk-row__value--gold">{q.amount || '—'}</span></div>
        </div>

        <div className="lk-notes__input-wrap">
          <div className="lk-block__title">Your Response</div>
          <textarea
            className="lk-notes__textarea"
            placeholder="Answer the owner's question…"
            onChange={(e) => (window.__ownerResponse = e.target.value)}
          />
        </div>

        <div className="lk-btn-row">
          <button
            className="lk-btn lk-btn--primary"
            onClick={() => {
              const text = window.__ownerResponse?.trim();
              if (!text) return;
              actions.addTimeline(`PM responded to owner: "${text.substring(0, 80)}${text.length > 80 ? '…' : ''}"`, 'message', 'PM');
              actions.setState('pending-owner-approval');
              window.__ownerResponse = '';
            }}
          >
            Send Response
          </button>
        </div>
      </div>
    );
  }

  /* ── 14. OWNER REJECTED ── */
  if (state === 'owner-rejected') {
    const rej = task.ownerRejection || {};
    return (
      <div>
        <div className="lk-banner lk-banner--critical">
          <div className="lk-banner__title">✗ Owner Rejected Authorization</div>
          <div className="lk-banner__sub">
            The owner declined to authorize this work. PM must decide how to proceed.
          </div>
        </div>

        {rej.reason && (
          <div className="lk-block">
            <div className="lk-block__title">Owner Decision</div>
            <div className="lk-row"><span className="lk-row__label">Rejected by</span><span className="lk-row__value lk-row__value--muted">{rej.ownerName || '—'}</span></div>
            <div className="lk-row"><span className="lk-row__label">Reason</span><span className="lk-row__value lk-row__value--red">{rej.reason}</span></div>
            {rej.ownerNote && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 5, borderLeft: '3px solid var(--crimson)' }}>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 3, fontWeight: 700 }}>Owner Note</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{rej.ownerNote}</div>
              </div>
            )}
          </div>
        )}

        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.setState('quote-pending')}>Revise Scope</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.setState('quote-pending')}>Request New Quote</button>
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('cancelled')}>Cancel Task</button>
          <button className="lk-btn lk-btn--ghost" onClick={() => actions.setState('dismissed')}>Mark Dismissed</button>
        </div>
      </div>
    );
  }

  /* ── 15. REWORK REQUIRED ── */
  if (state === 'rework-required') {
    return (
      <div>
        <div className="lk-banner lk-banner--critical">
          <div className="lk-banner__title">⚠ Rework Required</div>
          <div className="lk-banner__sub">
            PM rejected vendor completion. Vendor must return to address flagged issues.
          </div>
        </div>
        {task.blockingReason && (
          <div className="lk-block" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.05)' }}>
            <div className="lk-block__title" style={{ color: 'var(--crimson)' }}>Blocking Reason</div>
            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{task.blockingReason}</p>
          </div>
        )}
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logCall()}>📞 Call Vendor</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logText()}>💬 Text Vendor</button>
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('cancelled')}>Cancel Rework</button>
        </div>
      </div>
    );
  }

  /* ── 16. RESUME REQUESTED ── */
  if (state === 'resume-requested') {
    return (
      <div>
        <div className="lk-banner lk-banner--blue">
          <div className="lk-banner__title">🔓 Vendor Requested Authorization to Resume</div>
          <div className="lk-banner__sub">
            {task.vendor} is paused and asking to continue. Review and choose how to proceed.
          </div>
        </div>
        {task.pauseReason && (
          <div className="lk-block">
            <div className="lk-block__title">Vendor's Stated Reason</div>
            <div className="lk-row"><span className="lk-row__label">Issue</span><span className="lk-row__value lk-row__value--blue">{task.issueType || '—'}</span></div>
            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, margin: '8px 0 0' }}>
              {task.issueDetails || task.pauseReason}
            </p>
          </div>
        )}
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => actions.setState('in-progress')}>✅ Authorize & Resume</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.addTimeline('PM reviewed and decided to keep task paused', 'warn', 'PM')}>
            Keep Paused
          </button>
          <button className="lk-btn lk-btn--secondary" onClick={() => openOverlay('assign')}>Reassign Vendor</button>
        </div>
      </div>
    );
  }

  /* ── 17. PAYMENT SENT ── */
  if (state === 'payment-sent') {
    return (
      <div>
        <div className="lk-banner lk-banner--success">
          <div className="lk-banner__title">✓ Payment Sent</div>
          <div className="lk-banner__sub">Payment recorded. Awaiting vendor confirmation of receipt.</div>
        </div>
        <div className="lk-block">
          <div className="lk-block__title">Payment Record</div>
          <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{task.vendor}</span></div>
          <div className="lk-row"><span className="lk-row__label">Amount</span><span className="lk-row__value lk-row__value--gold">${task.paymentAmount || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Status</span><span className="lk-row__value lk-row__value--amber">Awaiting vendor confirmation</span></div>
        </div>
        <div className="lk-btn-row">
          <button
            className="lk-btn lk-btn--secondary"
            onClick={() => actions.setState('payment-confirmed')}
            title="Prototype: simulate vendor confirming receipt"
          >
            Mark Vendor Confirmed
          </button>
        </div>
      </div>
    );
  }

  /* ── 18. PAYMENT CONFIRMED ── */
  if (state === 'payment-confirmed') {
    return (
      <div>
        <div className="lk-banner lk-banner--success">
          <div className="lk-banner__title">✓ Payment Confirmed by Vendor</div>
          <div className="lk-banner__sub">Vendor confirmed receipt. Task fully closed.</div>
        </div>
        <div className="lk-block">
          <div className="lk-block__title">Payment Record</div>
          <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{task.vendor}</span></div>
          <div className="lk-row"><span className="lk-row__label">Status</span><span className="lk-row__value lk-row__value--green">Payment Confirmed</span></div>
        </div>
      </div>
    );
  }

    /* ── COMPLIANCE: COMPLIANT ── */
  if (state === 'compliant') {
    return (
      <div>
        <div className="lk-banner lk-banner--success">
          <div className="lk-banner__title">✓ Compliant — Inspection Passed</div>
          <div className="lk-banner__sub">
            All requirements met. Certificate filed with {task.jurisdiction || 'the authority'}.
          </div>
        </div>
        {task.vendor && (
          <div className="lk-block">
            <div className="lk-block__title">Inspector</div>
            <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value">{task.vendor}</span></div>
            <div className="lk-row"><span className="lk-row__label">Regulation</span><span className="lk-row__value lk-row__value--muted">{task.regulation || '—'}</span></div>
            <div className="lk-row"><span className="lk-row__label">Filed</span><span className="lk-row__value lk-row__value--green">Certificate on file</span></div>
          </div>
        )}
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.addTimeline('Certificate download requested', 'file', 'PM')}>
            📄 View Certificate
          </button>
          <button className="lk-btn lk-btn--ghost" onClick={() => actions.setState('closed')}>
            Close Item
          </button>
        </div>
      </div>
    );
  }

  /* ── COMPLIANCE: NON-COMPLIANT ── */
  if (state === 'non-compliant') {
    return (
      <div>
        <div className="lk-banner lk-banner--critical">
          <div className="lk-banner__title">🚫 Non-Compliant — Corrective Action Required</div>
          <div className="lk-banner__sub">
            {task.blockingReason || 'This item failed inspection. Corrective action must be scheduled before re-test.'}
          </div>
        </div>
        <div className="lk-block">
          <div className="lk-block__title">Compliance Context</div>
          <div className="lk-row"><span className="lk-row__label">Jurisdiction</span><span className="lk-row__value lk-row__value--blue">{task.jurisdiction || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Regulation</span><span className="lk-row__value lk-row__value--muted">{task.regulation || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Due</span><span className="lk-row__value lk-row__value--red">{task.due}</span></div>
        </div>
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => openOverlay('assign')}>📌 Schedule Corrective Action</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logCall()}>📞 Call Vendor</button>
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('escalated')}>🚨 Escalate to Admin</button>
          <button className="lk-btn lk-btn--ghost" onClick={() => actions.setState('waived')}>Waive</button>
        </div>
      </div>
    );
  }

  /* ── COMPLIANCE: OVERDUE ── */
  if (state === 'overdue') {
    return (
      <div>
        <div className="lk-banner lk-banner--critical">
          <div className="lk-banner__title">⏱ Overdue — Target Date Passed</div>
          <div className="lk-banner__sub">
            {Math.abs(task.daysUntilDue || 0)} days past due · {task.jurisdiction || 'Authority'} filing at risk
          </div>
        </div>
        <div className="lk-block">
          <div className="lk-block__title">Deadline Details</div>
          <div className="lk-row"><span className="lk-row__label">Original Due</span><span className="lk-row__value lk-row__value--red">{task.due}</span></div>
          <div className="lk-row"><span className="lk-row__label">Jurisdiction</span><span className="lk-row__value lk-row__value--blue">{task.jurisdiction || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Regulation</span><span className="lk-row__value lk-row__value--muted">{task.regulation || '—'}</span></div>
          <div className="lk-row"><span className="lk-row__label">Vendor</span><span className="lk-row__value lk-row__value--muted">{task.vendor || 'Unassigned'}</span></div>
        </div>
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => openOverlay('assign')}>📌 Dispatch Now</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.logCall()}>📞 Call Vendor</button>
          <button className="lk-btn lk-btn--danger" onClick={() => actions.setState('escalated')}>🚨 Escalate</button>
          <button className="lk-btn lk-btn--ghost" onClick={() => actions.setState('waived')}>Waive</button>
        </div>
      </div>
    );
  }

  /* ── COMPLIANCE: WAIVED ── */
  if (state === 'waived') {
    return (
      <div>
        <div className="lk-banner lk-banner--slate">
          <div className="lk-banner__title">⛔ Item Waived</div>
          <div className="lk-banner__sub">
            {task.blockingReason || 'This item was explicitly waived — no longer tracked against SLA.'}
          </div>
        </div>
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--secondary" onClick={() => actions.setState('pending')}>Re-open Item</button>
        </div>
      </div>
    );
  }

  /* ── 19. CLOSED / CANCELLED / DISMISSED ── */
  if (['closed', 'cancelled', 'dismissed'].includes(state)) {
    return (
      <div>
        <div className="lk-banner lk-banner--slate">
          <div className="lk-banner__title">📦 Task {state}</div>
          <div className="lk-banner__sub">No actions available. This task is archived.</div>
        </div>
        {task.blockingReason && (
          <div className="lk-block">
            <div className="lk-block__title">Reason</div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              {task.blockingReason}
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── 20. PENDING ── */
  if (state === 'pending') {
    return (
      <div>
        <div className="lk-banner lk-banner--amber">
          <div className="lk-banner__title">📋 Action Required</div>
          <div className="lk-banner__sub">This task requires PM attention before the due date.</div>
        </div>
        <div className="lk-btn-row">
          <button className="lk-btn lk-btn--primary" onClick={() => actions.setState('accepted')}>Accept Task</button>
          <button className="lk-btn lk-btn--secondary" onClick={() => openOverlay('assign')}>Assign Vendor</button>
        </div>
      </div>
    );
  }

  /* ── FALLBACK ── */
  return (
    <div className="lk-block">
      <div className="lk-block__title">No Specific Actions</div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
        No action panel defined for state: <strong>{state}</strong>
      </p>
    </div>
  );
}