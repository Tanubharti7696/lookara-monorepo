import { VENDOR_SCORES, PROPERTY_VENDORS } from '../data/constants';

function row(label, val, color) {
  const cls = color ? `dr-row-val ${color}` : 'dr-row-val';
  return <div className="dr-row"><span className="dr-row-label">{label}</span><span className={cls}>{val}</span></div>;
}

export default function Overlay({ mode, task, onClose, onAction, showToast }) {
  if (!mode || !task) return null;

  const header = {
    quote: { title: 'Quote Review', sub: task.name },
    assign: { title: 'Assign Vendor', sub: task.name },
    verify: { title: 'Verify Work', sub: task.name },
    payment: { title: 'Record Payment Sent', sub: task.name },
  }[mode];

  return (
    <div className="dr-overlay">
      <div className="dr-overlay-head">
        <div>
          <div className="dr-overlay-title">{header.title}</div>
          <div className="dr-overlay-sub">{header.sub}</div>
        </div>
        <button className="dr-overlay-back" onClick={onClose} title="Back">←</button>
      </div>
      <div className="dr-overlay-body">
        {mode === 'quote' && <QuoteReview task={task} onClose={onClose} onAction={onAction} />}
        {mode === 'assign' && <AssignVendor task={task} onClose={onClose} onAction={onAction} showToast={showToast} />}
        {mode === 'verify' && <VerifyWork task={task} onClose={onClose} onAction={onAction} />}
        {mode === 'payment' && <RecordPayment task={task} onClose={onClose} onAction={onAction} showToast={showToast} />}
      </div>
    </div>
  );
}

function QuoteReview({ task, onClose, onAction }) {
  const q = task.quote || {};
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontSize:12, color:'var(--muted)' }}>From: <strong style={{color:'var(--text)'}}>{q.vendor}</strong></div>
        <div style={{ fontSize:12, color:'var(--slate)' }}>Submitted: {q.submitted}</div>
      </div>
      <div className="dr-block">
        <div className="dr-block-title">Quote Breakdown</div>
        <div className="quote-breakdown-row"><span style={{color:'var(--muted)'}}>Labor</span><span style={{color:'var(--text)',fontWeight:600}}>{q.labor}</span></div>
        <div className="quote-breakdown-row"><span style={{color:'var(--muted)'}}>Materials</span><span style={{color:'var(--text)',fontWeight:600}}>{q.materials}</span></div>
        <div className="quote-breakdown-row"><span style={{color:'var(--muted)'}}>Est. Hours</span><span style={{color:'var(--text)',fontWeight:600}}>{q.laborHrs}</span></div>
        <div className="quote-breakdown-total"><span>Total</span><span className="amt">{q.amount}</span></div>
      </div>
      <div className="dr-block">
        <div className="dr-block-title">Scope of Work</div>
        <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6, margin:0 }}>{q.scope}</p>
      </div>
      <div className="btn-row">
        <button className="btn-primary" onClick={() => onAction('quote-approved', `PM approved quote — task dispatched to ${task.vendor || 'vendor'}`)}>✓ Approve Quote</button>
        <button className="btn-danger" onClick={() => { onAction('quote-rejected', 'Quote rejected — vendor notified'); onClose(); }}>Reject</button>
      </div>
      <div className="btn-row">
        <button className="btn-secondary" onClick={() => { onAction('quote-revision', 'PM requested quote revision from vendor'); onClose(); }}>Request Revision</button>
        <button className="btn-secondary" onClick={() => { onAction('send-to-owner', 'Quote sent to owner for approval'); onClose(); }}>Send to Owner</button>
      </div>
    </>
  );
}

function AssignVendor({ task, onClose, onAction, showToast }) {
  const allVendors = Object.entries(VENDOR_SCORES || {});
  const assignedNames = new Set(PROPERTY_VENDORS[task.property] || []);
  const preAssigned = allVendors.filter(([n]) => assignedNames.has(n)).sort((a,b) => b[1].trust - a[1].trust).slice(0, 3);
  const nearby = allVendors.filter(([n]) => !assignedNames.has(n)).sort((a,b) => a[1].distanceMi - b[1].distanceMi || b[1].trust - a[1].trust).slice(0, 3);

  const vendorRow = ([name, v], badge) => (
    <div key={name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--line)' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{name}</span>
          {badge}
        </div>
        <div style={{ fontSize:12, color:'var(--muted)' }}>
          <span style={{ color:v.color, fontWeight:700 }}>{v.label} · {v.trust}%</span> &nbsp;📍 {v.distanceMi}mi &nbsp;⚡ {v.avgResponseMin}m avg
        </div>
      </div>
      <button className="btn-primary" style={{ flex:'none', padding:'6px 14px', fontSize:12, marginLeft:12 }}
        onClick={() => { onAction('assign-vendor', `Dispatch offer sent to ${name}`); onClose(); }}>Assign</button>
    </div>
  );

  const assignedBadge = <span style={{ fontSize:12, fontWeight:700, padding:'1px 6px', borderRadius:4, background:'rgba(212,175,55,.1)', border:'1px solid rgba(212,175,55,.25)', color:'var(--gold)' }}>Assigned to property</span>;
  const nearbyBadge = <span style={{ fontSize:12, fontWeight:700, padding:'1px 6px', borderRadius:4, background:'rgba(107,114,128,.1)', border:'1px solid rgba(107,114,128,.2)', color:'var(--slate)' }}>Nearby</span>;

  return (
    <>
      <div className="dr-block">
        <div className="dr-block-title">Assigned to {task.property || 'this property'}</div>
        {preAssigned.length
          ? preAssigned.map(e => vendorRow(e, assignedBadge))
          : <div style={{ fontSize:12, color:'var(--slate)', padding:'8px 0' }}>No vendors configured for this property.</div>}
      </div>
      {nearby.length > 0 && (
        <div className="dr-block">
          <div className="dr-block-title">Also available nearby</div>
          {nearby.map(e => vendorRow(e, nearbyBadge))}
        </div>
      )}
      <div style={{ padding:'10px 12px', background:'rgba(96,165,250,.05)', border:'1px solid rgba(96,165,250,.15)', borderRadius:8, fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
        Assigning sends a dispatch offer — vendor must accept before work begins.
      </div>
    </>
  );
}

function VerifyWork({ task, onClose, onAction }) {
  const pw = task.proofOfWork || {};
  return (
    <>
      <div className="dr-block">
        <div className="dr-block-title">Vendor</div>
        {row('Vendor', task.vendor)}
        {row('Completed', task.acceptedAt ? 'On time' : '—', 'green')}
      </div>
      <div className="dr-block">
        <div className="dr-block-title">Proof of Work</div>
        <div className="photo-grid" style={{ marginBottom:10 }}>
          {Array(pw.beforePhotos || 2).fill(0).map((_, i) => (
            <div key={`b${i}`} className="photo-thumb"><div style={{fontSize:18}}>📷</div><div style={{fontSize:12,color:'var(--muted)'}}>Before {i+1}</div></div>
          ))}
          {Array(pw.afterPhotos || 2).fill(0).map((_, i) => (
            <div key={`a${i}`} className="photo-thumb"><div style={{fontSize:18}}>📷</div><div style={{fontSize:12,color:'var(--muted)'}}>After {i+1}</div></div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6, margin:'0 0 10px' }}>{pw.notes || 'No notes submitted.'}</p>
        {row('Invoice', pw.invoiceAmount || '—', 'gold')}
        {row('Quoted', pw.quotedAmount || '—', 'muted')}
        {row('Variance', pw.variance || 'NO VARIANCE', pw.variance === 'NO VARIANCE' ? 'green' : 'amber')}
      </div>
      <div className="btn-row">
        <button className="btn-primary" onClick={() => { onAction('verify-approved', 'Work verified and approved by PM — moving to Awaiting Payment'); onClose(); }}>✓ Verify & Approve</button>
        <button className="btn-danger" onClick={() => { onAction('rework-request', 'PM requested rework — vendor notified'); onClose(); }}>Request Rework</button>
      </div>
    </>
  );
}

function RecordPayment({ task, onClose, onAction, showToast }) {
  const amount = (task.paymentAmount || '0.00').toString().replace(/[$,]/g, '');
  return (
    <>
      <div style={{ marginBottom:14, padding:'10px 12px', background:'rgba(96,165,250,.05)', border:'1px solid rgba(96,165,250,.18)', borderLeft:'3px solid var(--blue)', borderRadius:6 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'.4px', marginBottom:4 }}>ℹ Payment Note</div>
        <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>Payment is completed <strong style={{ color:'var(--text)' }}>outside of Lookara</strong>. This action records that payment has already been sent to {task.vendor}. Lookara does not process or guarantee payment delivery.</div>
      </div>
      <div className="dr-block">
        <div className="dr-block-title">Amount</div>
        {row('Vendor', task.vendor)}
        {row('Amount to Record', '$' + amount, 'gold')}
      </div>
      <div className="dr-block">
        <div className="dr-block-title">Payment Method</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['Check','ACH','Zelle','Wire','Cash','Other'].map(m => (
            <button key={m} className="btn-secondary" style={{ flex:'none', padding:'6px 12px', fontSize:12 }} onClick={() => showToast('Method: ' + m)}>{m}</button>
          ))}
        </div>
      </div>
      <div className="btn-row">
        <button className="btn-primary" onClick={() => { onAction('payment-recorded', `Payment of $${amount} recorded — sent to ${task.vendor}`); onClose(); }}>Record Payment Sent</button>
      </div>
    </>
  );
}
