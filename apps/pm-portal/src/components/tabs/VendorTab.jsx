import { VENDOR_SCORES } from '../../data/constants';

function row(label, val, color) {
  const cls = color ? `dr-row-val ${color}` : 'dr-row-val';
  return <div className="dr-row"><span className="dr-row-label">{label}</span><span className={cls}>{val}</span></div>;
}
function scorebar(label, pct, color, invert) {
  const barColor = invert ? (pct > 10 ? 'var(--crimson)' : 'var(--success)') : color;
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--muted)',marginBottom:4}}>
        <span>{label}</span><span style={{color:barColor,fontWeight:600}}>{pct}%</span>
      </div>
      <div style={{height:4,background:'var(--line)',borderRadius:2}}>
        <div style={{height:4,width:`${Math.min(pct,100)}%`,background:barColor,borderRadius:2}}></div>
      </div>
    </div>
  );
}

export default function VendorTab({ task, onAction, onOpenOverlay }) {
  if (task.vendor) {
    const vs = VENDOR_SCORES[task.vendor];
    const last10 = (vs?.lastTen || []).map(r => r ? '✓' : '✗').join(' ');

    return (
      <>
        <div className="dr-block">
          <div className="dr-block-title">Assigned Vendor</div>
          <div style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:4}}>{task.vendor}</div>
          {task.acceptedAt && <div style={{fontSize:12,color:'var(--muted)',marginBottom:12}}>Accepted: {task.acceptedAt}</div>}
          <div style={{display:'flex',gap:8}}>
            <button className="btn-secondary" style={{fontSize:12,padding:7,flex:1}} onClick={() => onAction('call', `PM called ${task.vendor}`)}>📞 Call</button>
            <button className="btn-secondary" style={{fontSize:12,padding:7,flex:1}} onClick={() => onAction('message', `PM texted ${task.vendor}`)}>💬 Message</button>
            <button className="btn-secondary" style={{fontSize:12,padding:7,flex:1}} onClick={() => onAction('view-vendor', 'Opening vendor profile…')}>View Profile</button>
          </div>
        </div>

        {vs ? (
          <div className="dr-block">
            <div className="dr-block-title">Performance Snapshot</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
              <div><div style={{fontSize:22,fontWeight:800,color:vs.color}}>{vs.slaReliability}%</div><div style={{fontSize:12,color:'var(--slate)'}}>Reliability</div></div>
              <div><div style={{fontSize:22,fontWeight:800,color:'var(--text)'}}>{vs.acceptanceRate}%</div><div style={{fontSize:12,color:'var(--slate)'}}>Acceptance Rate</div></div>
              <div><div style={{fontSize:22,fontWeight:800,color:'var(--text)'}}>{vs.avgResponseMin}m</div><div style={{fontSize:12,color:'var(--slate)'}}>Avg Response</div></div>
            </div>
            {row('Last 10 Jobs', last10)}
            {row('Open Disputes', String(vs.paymentDisputes ?? 0), vs.paymentDisputes > 0 ? 'amber' : 'green')}
            {row('Performance Score', `${vs.trust}%`, 'gold')}
            <div style={{marginTop:10}}>
              {scorebar('SLA Reliability', vs.slaReliability, 'var(--success)')}
              {scorebar('Acceptance Rate', vs.acceptanceRate, 'var(--success)')}
              {scorebar('Rework Rate', vs.reworkRate, 'var(--success)', true)}
            </div>
          </div>
        ) : (
          <div className="dr-block">
            <div className="dr-block-title">Performance Snapshot</div>
            <div style={{fontSize:12,color:'var(--slate)'}}>No performance history on file for this vendor yet.</div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="dr-block">
      <div className="dr-block-title">Vendor Assignment</div>
      <div style={{padding:20,textAlign:'center',border:'1px dashed var(--line)',borderRadius:6,marginBottom:12}}>
        <div style={{fontSize:12,color:'var(--slate)'}}>⚠ No vendor assigned</div>
        <div style={{fontSize:12,color:'var(--slate)',marginTop:4}}>Eligible: {task.dispatch?.eligible || 0} vendors in pool</div>
      </div>
      <button className="btn-primary" onClick={() => onOpenOverlay('assign')}>Assign Vendor</button>
    </div>
  );
}
