import { useState } from 'react';

function block(title, children, style) {
  return <div className="dr-block" style={style}><div className="dr-block-title">{title}</div>{children}</div>;
}
function row(label, val, color) {
  const cls = color ? `dr-row-val ${color}` : 'dr-row-val';
  return <div className="dr-row"><span className="dr-row-label">{label}</span><span className={cls}>{val}</span></div>;
}
function banner(type, title, sub) {
  const colors = { critical:'var(--crimson)', amber:'var(--amber)', gold:'var(--gold)', success:'var(--success)', blue:'var(--blue)' };
  const c = colors[type] || colors.amber;
  return (
    <div className={`act-banner ${type}`}>
      <div style={{fontSize:13,fontWeight:700,color:c,marginBottom:4}}>{title}</div>
      <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{sub}</div>
    </div>
  );
}
function btnRow(buttons) {
  return <div className="btn-row">{buttons.map((b, i) => (
    <button key={i} className={b.style === 'primary' ? 'btn-primary' : b.style === 'danger' ? 'btn-danger' : 'btn-secondary'} onClick={b.fn}>{b.label}</button>
  ))}</div>;
}

export default function ActionTab({ task, notes, onAddNote, onAction, onOpenOverlay, onFocusNote, onOwnerClarificationResponse }) {
  const [noteDraft, setNoteDraft] = useState('');
  const [clarificationDraft, setClarificationDraft] = useState('');

  let html = null;

  if (task.description) {
    html = <>{html}{block("What's Happening", <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6,margin:0}}>{task.description}</p>)}</>;
  }

  if (task.isTurnoverCleaning) {
    html = <>{html}{block('Turnover Window', <>
      {row('Checkout', task.checkoutTime || '—')}
      {row('Check-in', task.checkinTime || '—')}
      {row('Cleaning Window', task.cleaningWindow || '—', 'blue')}
    </>)}</>;
  }

  if (task.dispatch) {
    const dc = (task.dispatch.auto === 'Blocked' || task.dispatch.auto === 'Failed') ? 'red' : 'green';
    html = <>{html}{block('Dispatch', <>
      {row('Eligible Vendors', String(task.dispatch.eligible))}
      {row('Auto-Dispatch', task.dispatch.auto, dc)}
      {row('Note', task.dispatch.reason, 'muted')}
    </>)}</>;
  }

  let panel = null;

  if (['blocked','escalated','unassigned'].includes(task.state)) {
    const color = task.state === 'escalated' ? 'critical' : 'amber';
    const title = task.state === 'escalated' ? '🚨 Task Escalated — PM Action Required'
                : task.state === 'blocked' ? '⚠ Task Blocked — Cannot Dispatch'
                : '⚠ No Vendor Assigned';
    const sub = task.state === 'escalated'
      ? 'No vendor responded after 45 minutes. SLA clock running. Assign a vendor manually or expand the search pool.'
      : task.state === 'blocked'
      ? `Auto-dispatch is blocked. ${task.dispatch?.reason || 'Check vendor pool.'} Manual assignment required.`
      : 'No vendor in the pool matches this task. Expand search radius or add a new vendor.';

    const buttons = [
      { label:'Assign Vendor', style:'primary', fn: () => onOpenOverlay('assign') },
      { label:'Schedule Visit', style:'secondary', fn: () => onAction('schedule-visit', 'Schedule Visit requested') },
    ];
    if (task.state !== 'escalated') buttons.push({ label:'Escalate', style:'secondary', fn: () => onAction('escalate', 'Task manually escalated by PM') });
    buttons.push({ label:'Add Note', style:'secondary', fn: onFocusNote });
    buttons.push({ label:'Cancel Task', style:'danger', fn: () => onAction('cancel-task', 'Task cancelled by PM') });

    panel = <>
      {banner(color, title, sub)}
      {task.blockingReason && block('Blocking Reason', <p style={{fontSize:12,color:'var(--text)',lineHeight:1.6,margin:0}}>{task.blockingReason}</p>, {borderColor:'rgba(245,158,11,.25)',background:'rgba(245,158,11,.05)'})}
      {btnRow(buttons)}
    </>;
  }
  else if (task.state === 'dispatching') {
    panel = <>
      {banner('blue', '📡 Dispatch Running', `Vendor search in progress. ${task.dispatch?.eligible || 0} eligible vendors notified. Waiting for acceptance.`)}
      {btnRow([{ label:'Cancel Dispatch', style:'danger', fn: () => onAction('cancel-dispatch', 'Dispatch cancelled — task returned to Unassigned') }])}
    </>;
  }
  else if (['dispatched','accepted','in-progress','approved'].includes(task.state)) {
    const stateLabel = task.state === 'dispatched' ? 'Vendor dispatched — awaiting acceptance'
                    : task.state === 'accepted' ? 'Vendor accepted — scheduled'
                    : task.state === 'approved' ? 'Quote approved — vendor confirmed'
                    : 'Vendor on site — work in progress';
    const bannerType = task.state === 'in-progress' ? 'success' : 'blue';
    panel = <>
      {banner(bannerType, task.state === 'in-progress' ? '🟢 Work In Progress' : '✓ Vendor Assigned', stateLabel)}
      {task.vendor && block('Assigned Vendor', <>
        <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:4}}>{task.vendor}</div>
        {task.acceptedAt && <div style={{fontSize:13,color:'var(--muted)'}}>Accepted: {task.acceptedAt}</div>}
      </>)}
      {btnRow([
        { label:'📞 Call Vendor', style:'secondary', fn: () => onAction('call', `PM called ${task.vendor || 'vendor'}`) },
        { label:'💬 Text Vendor', style:'secondary', fn: () => onAction('message', `PM texted ${task.vendor || 'vendor'}`) },
        { label:'Add Note', style:'secondary', fn: onFocusNote },
      ])}
    </>;
  }
  else if (task.state === 'assessment-dispatched') {
    panel = <>
      {banner('blue', '🔍 Assessment In Progress', 'Vendor en route to assess. Findings, photos, and recommended scope will be submitted after on-site visit.')}
      {block('Assessment Workflow', <>
        {row('Stage', 'Vendor Dispatched', 'blue')}
        {row('Vendor', task.vendor || '—')}
        {row('Accepted', task.acceptedAt || '—', 'green')}
        {row('Next Step', 'Vendor submits findings → Quote created', 'muted')}
        <div style={{marginTop:10,padding:'8px 10px',background:'var(--bg-0)',borderRadius:6,fontSize:12,color:'var(--slate)'}}>
          Flow: Assessment → Findings Submitted → Quote Pending → PM Approves → Repair Task Created
        </div>
      </>)}
      {btnRow([
        { label:'📞 Call Vendor', style:'secondary', fn: () => onAction('call', `PM called ${task.vendor || 'vendor'}`) },
        { label:'💬 Text Vendor', style:'secondary', fn: () => onAction('message', `PM texted ${task.vendor || 'vendor'}`) },
      ])}
    </>;
  }
  else if (task.state === 'quote-pending') {
    panel = <>
      {banner('gold', '📋 Quote Submitted — Review Required', 'Vendor has submitted a quote. Review scope and amount before approving dispatch.')}
      {task.quote && block('Quote Summary', <>
        {row('Vendor', task.quote.vendor)}
        {row('Amount', task.quote.amount, 'gold')}
        {row('Submitted', task.quote.submitted, 'muted')}
      </>)}
      {btnRow([
        { label:'📄 Review & Approve Quote', style:'primary', fn: () => onOpenOverlay('quote') },
        { label:'Request Revision', style:'secondary', fn: () => onAction('quote-revision', 'PM requested quote revision from vendor') },
        { label:'Send to Owner', style:'secondary', fn: () => onAction('send-to-owner', 'Quote sent to owner for approval') },
      ])}
    </>;
  }
  else if (['verification-pending','completed'].includes(task.state)) {
    const pw = task.proofOfWork;
    panel = <>
      {banner('gold', '✓ Work Submitted — Verify Completion', 'Vendor marked this task complete and submitted proof of work. Review before recording payment.')}
      {pw && block('Proof of Work', <>
        <div className="photo-grid" style={{marginBottom:10}}>
          {Array(pw.beforePhotos).fill(0).map((_, i) => <div key={`b${i}`} className="photo-thumb"><div style={{fontSize:18}}>📷</div><div style={{fontSize:12,color:'var(--muted)'}}>Before {i+1}</div></div>)}
          {Array(pw.afterPhotos).fill(0).map((_, i) => <div key={`a${i}`} className="photo-thumb"><div style={{fontSize:18}}>📷</div><div style={{fontSize:12,color:'var(--muted)'}}>After {i+1}</div></div>)}
        </div>
        <div style={{padding:8,background:'var(--bg-0)',borderRadius:6,fontSize:12,color:'var(--muted)',marginBottom:10}}>{pw.notes}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,background:'var(--bg-0)',borderRadius:6}}>
          <div><div style={{fontSize:12,color:'var(--slate)',marginBottom:2}}>Invoice</div><div style={{fontSize:14,fontWeight:700,color:'var(--gold)'}}>{pw.invoiceAmount}</div></div>
          <div><div style={{fontSize:12,color:'var(--slate)',marginBottom:2}}>Quoted</div><div style={{fontSize:12,color:'var(--muted)'}}>{pw.quotedAmount}</div></div>
          <span style={{padding:'3px 8px',background:'rgba(34,197,94,.12)',border:'1px solid rgba(34,197,94,.25)',borderRadius:4,fontSize:12,fontWeight:700,color:'var(--success)'}}>{pw.variance}</span>
        </div>
      </>)}
      {btnRow([
        { label:'✓ Verify & Approve', style:'primary', fn: () => onOpenOverlay('verify') },
        { label:'Request Rework', style:'danger', fn: () => onOpenOverlay('verify') },
      ])}
    </>;
  }
  else if (task.state === 'awaiting-payment') {
    const po = task.paymentOverdue;
    panel = <>
      {po && po.vendorFlagged ? (
        <>
          <div className="act-banner critical">
            <div style={{fontSize:13,fontWeight:700,color:'var(--crimson)',marginBottom:4}}>⚠ Payment Overdue — Vendor Flagged</div>
            <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{po.delayDays} days overdue · {task.vendor} flagged at {po.flaggedAt} · {po.reminders}/{po.maxReminders} reminders sent</div>
          </div>
          {block('Payment Details', <>
            {row('Recorded Amount', po.amount, 'gold')}
            {row('Days Overdue', `${po.delayDays} days`, 'red')}
            {row('Vendor', task.vendor || '—')}
            {row('Reminders Sent', `${po.reminders} / ${po.maxReminders}`, 'muted')}
          </>)}
        </>
      ) : banner('gold', '💳 Awaiting Payment Recording', 'Work verified. Record the payment to close this task.')}
      {btnRow([
        { label:'Record Payment', style:'primary', fn: () => onOpenOverlay('payment') },
        { label:'Open Dispute', style:'danger', fn: () => onAction('open-dispute', 'PM opened payment dispute') },
        { label:'Request Clarification', style:'secondary', fn: () => onAction('clarification', 'PM requested payment clarification from vendor') },
      ])}
    </>;
  }
  else if (task.state === 'payment-disputed') {
    const pd = task.paymentDispute;
    const diff = pd ? (parseFloat(pd.invoiced.replace(/[$,]/g,'')) - parseFloat(pd.approved.replace(/[$,]/g,''))).toFixed(2) : '0.00';
    panel = <>
      {banner('critical', '🚨 Payment Disputed', pd ? pd.reason : 'Vendor has disputed the recorded payment amount.')}
      {pd && block('Dispute Details', <>
        {row('Vendor Invoiced', pd.invoiced, 'gold')}
        {row('PM Approved', pd.approved, 'amber')}
        {row('Difference', `$${diff}`, 'red')}
        {row('Flagged At', pd.flaggedAt, 'muted')}
        {row('Resolution Window', pd.delayDays === 0 ? 'Within 48h PM window' : `${pd.delayDays} days elapsed`, pd.delayDays >= 2 ? 'red' : 'amber')}
      </>)}
      <div style={{padding:'10px 12px',background:'rgba(96,165,250,.05)',border:'1px solid rgba(96,165,250,.15)',borderRadius:8,fontSize:12,color:'var(--muted)',lineHeight:1.6,marginBottom:14}}>
        Both parties have 48h to submit a position with evidence. If unresolved when the window closes, this dispute becomes a structured case file under Admin review.
      </div>
      {btnRow([
        { label:'Submit Position', style:'primary', fn: () => onAction('file', 'PM submitted dispute position + attachments') },
        { label:'Add Evidence', style:'secondary', fn: () => onAction('file', 'PM uploaded evidence to dispute file') },
        { label:'Escalate to Admin', style:'danger', fn: () => onAction('escalate-admin', null) },
        { label:'View Dispute File', style:'secondary', fn: () => onAction('view-dispute', null) },
      ])}
    </>;
  }
  else if (task.state === 'escalated-to-admin') {
    const esc = task.escalatedToAdmin || {};
    const pd = task.paymentDispute;
    const diff = pd ? (parseFloat(pd.invoiced.replace(/[$,]/g,'')) - parseFloat(pd.approved.replace(/[$,]/g,''))).toFixed(2) : '0.00';
    panel = <>
      {banner('blue', '🔒 Escalated to Admin Review', 'This dispute is now a structured case file. PM and vendor can no longer modify it — Admin owns resolution.')}
      {pd && block('Dispute Summary', <>
        {row('Vendor Invoiced', pd.invoiced, 'gold')}
        {row('PM Approved', pd.approved, 'amber')}
        {row('Difference', `$${diff}`, 'red')}
      </>)}
      {block('Case File', <>
        {row('Case ID', esc.caseId || '—', 'blue')}
        {row('Escalated At', esc.escalatedAt || '—', 'muted')}
        {row('Admin SLA', esc.slaRemaining ? `${esc.slaRemaining} remaining of ${esc.slaHours}h` : '—', 'amber')}
      </>, {borderColor:'rgba(96,165,250,.25)',background:'rgba(96,165,250,.05)'})}
      {esc.pmSubmission && block('PM Submission', <>
        <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:'0 0 8px'}}>{esc.pmSubmission.summary}</p>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {(esc.pmSubmission.attachments || []).map(a => <span key={a} style={{fontSize:12,padding:'3px 8px',borderRadius:4,background:'rgba(255,255,255,.05)',border:'1px solid var(--line)',color:'var(--muted)'}}>📎 {a}</span>)}
        </div>
      </>)}
      {esc.vendorSubmission && block('Vendor Submission', <>
        <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:'0 0 8px'}}>{esc.vendorSubmission.summary}</p>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {(esc.vendorSubmission.attachments || []).map(a => <span key={a} style={{fontSize:12,padding:'3px 8px',borderRadius:4,background:'rgba(255,255,255,.05)',border:'1px solid var(--line)',color:'var(--muted)'}}>📎 {a}</span>)}
        </div>
      </>)}
      <div style={{padding:'10px 12px',background:'rgba(107,114,128,.06)',border:'1px solid var(--line)',borderRadius:8,fontSize:12,color:'var(--slate)',lineHeight:1.6,marginBottom:10}}>
        Resolution based on available evidence · Lookara facilitates resolution based on provided information · Final responsibility remains between parties.
      </div>
      {btnRow([{ label:'View Dispute File', style:'secondary', fn: () => onAction('view-dispute', 'Opening full case file (read-only)…') }])}
    </>;
  }
  else if (task.state === 'rework-required') {
    panel = <>
      {banner('critical', '⚠ Rework Required', 'PM rejected vendor completion. Vendor must return to address flagged issues.')}
      {task.blockingReason && block('Blocking Reason', <p style={{fontSize:12,color:'var(--text)',lineHeight:1.6,margin:0}}>{task.blockingReason}</p>, {borderColor:'rgba(220,38,38,.25)',background:'rgba(220,38,38,.05)'})}
      {btnRow([
        { label:'📞 Call Vendor', style:'secondary', fn: () => onAction('call', `PM called ${task.vendor || 'vendor'}`) },
        { label:'💬 Text Vendor', style:'secondary', fn: () => onAction('message', `PM texted ${task.vendor || 'vendor'}`) },
        { label:'Cancel Rework', style:'danger', fn: () => onAction('cancel-rework', 'Rework cancelled') },
      ])}
    </>;
  }
  else if (task.state === 'pending-owner-approval') {
    const poa = task.pendingOwnerApproval || {};
    const q = task.quote || {};
    panel = <>
      {banner('gold', '⏳ Awaiting Owner Authorization', 'Quote has been sent to the owner for approval. Dispatch is on hold until they respond.')}
      {block('Quote Sent to Owner', <>
        {row('Vendor', q.vendor || task.vendor || '—')}
        {row('Quote Amount', q.amount || '—', 'gold')}
        {row('Sent At', poa.sentAt || '—', 'muted')}
        {row('Owner', poa.ownerName || '—', 'muted')}
        {row('Response SLA', poa.slaDue ? 'Due by ' + poa.slaDue : '48h window', 'amber')}
      </>)}
      {block('Owner Notified Via', (
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
          {['📱 Push Notification','✉️ Email','🔔 In-Portal Action'].map(t => (
            <span key={t} style={{fontSize:12,padding:'3px 10px',borderRadius:99,background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.2)',color:'var(--amber)'}}>{t}</span>
          ))}
        </div>
      ))}
      {btnRow([
        { label:'Resend Notification', style:'secondary', fn: () => onAction('resend-owner-notify', 'Authorization request resent to owner') },
        { label:'Add Note', style:'secondary', fn: onFocusNote },
      ])}
      <div style={{padding:'10px 12px',background:'rgba(107,114,128,.06)',border:'1px solid var(--line)',borderRadius:8,fontSize:12,color:'var(--slate)',lineHeight:1.6}}>
        PM cannot proceed until the owner responds. If the SLA window expires without a response, the system will alert the PM to follow up or decide next steps.
      </div>
    </>;
  }
  else if (task.state === 'owner-clarification') {
    const oc = task.ownerClarification || {};
    const q = task.quote || {};
    panel = <>
      {banner('gold', '💬 Owner Requested Clarification', 'Authorization is on hold until you respond. Non-dependent work on this task may continue — only owner-gated approval is paused.')}
      {block("Owner's Question", <>
        {row('Asked by', oc.requestedBy || '—', 'muted')}
        {row('Asked at', oc.requestedAt || '—', 'muted')}
        <div style={{marginTop:8,padding:'10px 12px',background:'rgba(255,255,255,.03)',borderRadius:6,borderLeft:'3px solid #60A5FA'}}>
          <div style={{fontSize:12,color:'var(--text)',lineHeight:1.6}}>{oc.question || '—'}</div>
        </div>
      </>, {borderColor:'rgba(96,165,250,.3)',background:'rgba(96,165,250,.05)'})}
      {block('Quote Under Review', <>
        {row('Vendor', q.vendor || task.vendor || '—')}
        {row('Quote Amount', q.amount || '—', 'gold')}
      </>)}
      {block('Your Response', (
        <textarea
          value={clarificationDraft}
          onChange={(e) => setClarificationDraft(e.target.value)}
          rows={3}
          placeholder="Answer the owner's question…"
          style={{width:'100%',padding:'9px 10px',background:'var(--bg-1)',border:'1px solid var(--line)',borderRadius:6,color:'var(--text)',fontSize:12,outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:'inherit'}}
        />
      ))}
      <div className="btn-row">
        <button className="btn-primary" onClick={() => {
          if (!clarificationDraft.trim()) return;
          onOwnerClarificationResponse(clarificationDraft.trim());
          setClarificationDraft('');
        }}>Send Response</button>
      </div>
      <div style={{padding:'10px 12px',background:'rgba(107,114,128,.06)',border:'1px solid var(--line)',borderRadius:8,fontSize:12,color:'var(--slate)',lineHeight:1.6}}>
        Owner authorization stays on hold until you respond. Once you submit, this task returns to Pending Owner Approval and the owner is notified.
      </div>
    </>;
  }
  else if (task.state === 'owner-rejected') {
    const rej = task.ownerRejection || {};
    panel = <>
      {banner('critical', '✗ Owner Rejected Authorization', 'The owner has declined to authorize this work. PM must decide how to proceed.')}
      {(rej.reason || rej.ownerNote) && block('Owner Decision', <>
        {row('Rejected By', rej.ownerName || '—', 'muted')}
        {row('Rejected At', rej.rejectedAt || '—', 'muted')}
        {rej.reason && row('Reason', rej.reason, 'red')}
        {rej.ownerNote && (
          <div style={{marginTop:8,padding:'8px 10px',background:'rgba(255,255,255,.03)',borderRadius:5,borderLeft:'3px solid var(--crimson)'}}>
            <div style={{fontSize:12,color:'var(--slate)',marginBottom:3,fontWeight:600}}>Owner Note</div>
            <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>{rej.ownerNote}</div>
          </div>
        )}
      </>, {borderColor:'rgba(220,38,38,.25)',background:'rgba(220,38,38,.05)'})}
      {block('PM Next Step', (
        <>
          <div style={{fontSize:12,color:'var(--slate)',marginBottom:10}}>Choose how to proceed. Each action is logged to the timeline.</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              { key:'revise-scope', title:'Revise Scope', sub:'Adjust scope and request a revised quote from vendor', msg:'PM revising scope following owner rejection' },
              { key:'new-quote', title:'Request New Quote', sub:'Keep scope, ask vendor to resubmit at a lower amount', msg:'PM requesting new quote following owner rejection' },
              { key:'cancel-task', title:'Cancel Task', sub:'Work will not proceed — task marked cancelled', msg:'Task cancelled following owner rejection' },
              { key:'dismissed', title:'Mark Dismissed', sub:'Not urgent — archive and revisit later', msg:'Task dismissed following owner rejection' },
              { key:'escalate-offline', title:'Escalate & Discuss Offline', sub:'Contact owner directly before deciding next step', msg:'PM escalating for offline discussion with owner' },
            ].map(opt => (
              <button key={opt.key} className="btn-secondary" style={{textAlign:'left',padding:'10px 12px',flex:'none',width:'100%'}}
                onClick={() => onAction(opt.key, opt.msg)}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{opt.title}</div>
                <div style={{fontSize:12,color:'var(--slate)',marginTop:2,fontWeight:400}}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </>
      ))}
    </>;
  }
  else if (task.state === 'payment-sent') {
    panel = <>
      {banner('success', '✓ Payment Sent', 'Payment has been recorded. Task is closing.')}
      {block('Payment Record', <>
        {row('Vendor', task.vendor || '—')}
        {row('Status', 'Payment Sent', 'green')}
        {row('Recorded By', 'PM', 'muted')}
      </>)}
      {btnRow([{ label:'View Payment Record', style:'secondary', fn: () => onAction('view-payment', 'Opening payment record…') }])}
    </>;
  }
  else if (['closed','cancelled','dismissed'].includes(task.state)) {
    panel = <>
      <div className="action-empty" style={{background:'rgba(107,114,128,.05)',borderColor:'rgba(107,114,128,.15)'}}>
        <div style={{fontSize:20,marginBottom:8}}>📦</div>
        <div style={{fontSize:13,color:'var(--slate)'}}>This task is {task.state}. No actions available.</div>
      </div>
      {task.blockingReason && block(task.state === 'cancelled' ? 'Cancellation Reason' : 'Reason',
        <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:0}}>{task.blockingReason}</p>
      )}
    </>;
  }
  else if (task.state === 'pending') {
    panel = <>
      {banner('amber', '📋 Action Required', 'This compliance task requires PM attention before the due date.')}
      {task.compliance && block('Compliance Details', <>
        {row('Type', task.compliance.type)}
        {row('Due', task.compliance.dueDate, 'amber')}
        {row('Requirement', task.compliance.requirement, 'muted')}
        {row('Documents', task.compliance.docsRequired)}
      </>)}
      {btnRow([
        { label:'Upload Document', style:'primary', fn: () => onAction('go-files', null) },
        { label:'Mark Resolved', style:'secondary', fn: () => onAction('mark-resolved', 'Marked resolved') },
      ])}
    </>;
  }

  if (!panel) panel = <div className="action-empty">No specific action panel for state: {task.state}</div>;

  const taskNotes = notes[task.name] || [];
  const savedNote = task.note ? [{ author:'PM', time:'On creation', text:task.note }] : [];
  const allNotes = [...savedNote, ...taskNotes];

  return (
    <>
      {html}
      {panel}
      <div className="note-input-wrap" style={{marginTop:14}}>
        <textarea
          className="note-textarea"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Add a PM note… (visible to PM team only)"
          id="pm-note-input"
        />
        <div className="note-footer">
          <button className="btn-primary" style={{flex:'none',padding:'7px 16px',fontSize:12}} onClick={() => {
            if (!noteDraft.trim()) return;
            onAddNote(noteDraft.trim());
            setNoteDraft('');
          }}>Add Note</button>
        </div>
      </div>
      <div className="dr-block">
        <div className="dr-block-title">PM Notes</div>
        {allNotes.length ? allNotes.map((n, i) => (
          <div key={i} className="note-item">
            <div className="note-item-header">
              <span className="note-author">{n.author}</span>
              <span className="note-time">{n.time}</span>
            </div>
            <div className="note-text">{n.text}</div>
          </div>
        )) : <div style={{fontSize:12,color:'var(--slate)'}}>No notes yet.</div>}
      </div>
    </>
  );
}
