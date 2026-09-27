import { TL_CATEGORIES, TYPE_TO_CATEGORY } from '../../data/constants';

export default function AuditTab({ task }) {
  const tl = task.timeline || [];
  const counts = tl.reduce((acc, e) => { const a = e.actor || 'System'; acc[a] = (acc[a] || 0) + 1; return acc; }, {});

  const categoryOf = (e) => e.category || TYPE_TO_CATEGORY[e.type] || 'system';

  return (
    <>
      {tl.length > 0 && (
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14,paddingBottom:12,borderBottom:'1px solid var(--line)'}}>
          <span style={{fontSize:12,color:'var(--slate)',alignSelf:'center'}}>Events:</span>
          {Object.entries(counts).map(([a, c]) => (
            <span key={a} style={{fontSize:12,padding:'2px 8px',borderRadius:99,background:'rgba(255,255,255,.05)',color:'var(--muted)'}}>
              {a} <strong style={{color:'var(--text)'}}>{c}</strong>
            </span>
          ))}
          <span style={{fontSize:12,padding:'2px 8px',borderRadius:99,background:'rgba(212,175,55,.08)',border:'1px solid rgba(212,175,55,.2)',color:'var(--gold)'}}>{tl.length} total</span>
        </div>
      )}
      {tl.length ? tl.map((e, i) => {
        const cat = TL_CATEGORIES[categoryOf(e)] || TL_CATEGORIES.system;
        const last = i === tl.length - 1;
        const actorColor = e.actor === 'System' ? 'var(--blue)' : e.actor === 'Vendor' ? 'var(--success)' : 'var(--gold)';
        return (
          <div key={i} className="tl-item">
            {!last && <div className="tl-line-vert" style={{background:cat.line}}></div>}
            <div className="tl-dot" style={{background:cat.dot,flexShrink:0}} title={cat.label}></div>
            <div style={{flex:1,minWidth:0}}>
              <div className="tl-event">{cat.icon} {e.label}</div>
              <div className="tl-ts">{e.ts} &nbsp;·&nbsp; <span style={{fontSize:12,fontWeight:600,color:actorColor}}>{e.actor || 'System'}</span></div>
            </div>
          </div>
        );
      }) : (
        <div style={{fontSize:13,color:'var(--slate)'}}>No events recorded yet.</div>
      )}
    </>
  );
}
