export default function CommTab({ task, notes }) {
  const tl = task.timeline || [];
  const taskNotes = notes[task.name] || [];
  const savedNote = task.note ? [{ author:'PM', time:'On creation', text:task.note }] : [];
  const allNotes = [...savedNote, ...taskNotes];

  const calls = tl.filter(e => e.type === 'call');
  const messages = tl.filter(e => e.type === 'message');
  const tlNotes = tl.filter(e => e.type === 'note');

  const hasAny = messages.length || calls.length || tlNotes.length;

  return (
    <>
      {messages.length > 0 && (
        <div className="dr-block">
          <div className="dr-block-title">💬 Messages</div>
          {messages.map((m, i) => {
            const actorColor = m.actor === 'Vendor' ? 'var(--success)' : m.actor === 'System' ? 'var(--blue)' : 'var(--gold)';
            return (
              <div key={i} style={{padding:'8px 0',borderBottom:'1px solid var(--line)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700,color:actorColor}}>{m.actor}</span>
                  <span style={{fontSize:12,color:'var(--slate)'}}>{m.ts}</span>
                </div>
                <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.6}}>{m.label.replace(/^[^:]+:\s*/, '')}</div>
              </div>
            );
          })}
        </div>
      )}

      {calls.length > 0 && (
        <div className="dr-block">
          <div className="dr-block-title">📞 Calls</div>
          {calls.map((c, i) => {
            const actorColor = c.actor === 'Vendor' ? 'var(--success)' : 'var(--gold)';
            return (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'6px 0',borderBottom:'1px solid var(--line)'}}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{c.label}</div>
                  <div style={{fontSize:12,color:actorColor,marginTop:2}}>{c.actor}</div>
                </div>
                <span style={{fontSize:12,color:'var(--slate)',flexShrink:0,marginLeft:10}}>{c.ts}</span>
              </div>
            );
          })}
        </div>
      )}

      {tlNotes.length > 0 && (
        <div className="dr-block">
          <div className="dr-block-title">📋 System Notes</div>
          {tlNotes.map((n, i) => (
            <div key={i} style={{padding:'6px 0',borderBottom:'1px solid var(--line)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                <span style={{fontSize:12,fontWeight:600,color:'var(--gold)'}}>{n.actor}</span>
                <span style={{fontSize:12,color:'var(--slate)'}}>{n.ts}</span>
              </div>
              <div style={{fontSize:12,color:'var(--muted)'}}>{n.label.replace(/^PM added note:\s*/i, '')}</div>
            </div>
          ))}
        </div>
      )}

      {!hasAny && (
        <div className="action-empty" style={{background:'rgba(107,114,128,.05)',borderColor:'rgba(107,114,128,.15)'}}>
          <div style={{fontSize:20,marginBottom:8}}>💬</div>
          <div style={{fontSize:13,color:'var(--slate)'}}>No messages or calls recorded for this task yet.</div>
        </div>
      )}

      <div className="dr-block">
        <div className="dr-block-title">📝 PM Notes</div>
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

      <div style={{padding:'10px 12px',background:'rgba(96,165,250,.05)',border:'1px solid rgba(96,165,250,.15)',borderRadius:8,fontSize:12,color:'var(--muted)',lineHeight:1.6}}>
        Filtered view — every message, call, and note here also appears in the Timeline.
      </div>
    </>
  );
}
