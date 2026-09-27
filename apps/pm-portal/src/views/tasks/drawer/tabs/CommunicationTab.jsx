// src/views/tasks/drawer/tabs/CommunicationTab.jsx

export default function CommunicationTab({ task }) {
  const tl = task.timeline || [];
  const calls    = tl.filter(e => e.type === 'call');
  const messages = tl.filter(e => e.type === 'message');
  const notes    = tl.filter(e => e.type === 'note');

  const isEmpty = !calls.length && !messages.length && !notes.length;

  return (
    <div>
      {messages.length > 0 && (
        <div className="lk-block">
          <div className="lk-block__title">💬 Messages</div>
          {messages.map((m, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: actorColor(m.actor) }}>{m.actor || 'PM'}</span>
                <span style={{ fontSize: 11, color: 'var(--slate)' }}>{m.ts}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
                {m.label.replace(/^[^:]+:\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      )}

      {calls.length > 0 && (
        <div className="lk-block">
          <div className="lk-block__title">📞 Calls</div>
          {calls.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{c.label}</div>
                <div style={{ fontSize: 11, color: actorColor(c.actor), marginTop: 2 }}>{c.actor || 'PM'}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--slate)', flexShrink: 0, marginLeft: 10 }}>{c.ts}</span>
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="lk-block">
          <div className="lk-block__title">📝 PM Notes</div>
          {notes.map((n, i) => (
            <div key={i} className="lk-notes__item">
              <div className="lk-notes__item-head">
                <span className="lk-notes__author">{n.actor || 'PM'}</span>
                <span className="lk-notes__time">{n.ts}</span>
              </div>
              <div className="lk-notes__text">{n.label.replace(/^PM note:\s*/i, '')}</div>
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="lk-block" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>💬</div>
          <div style={{ fontSize: 13, color: 'var(--slate)' }}>
            No messages or calls recorded for this task yet.
          </div>
        </div>
      )}
    </div>
  );
}

function actorColor(actor) {
  if (actor === 'Vendor') return 'var(--success)';
  if (actor === 'System') return 'var(--blue)';
  if (actor === 'Owner')  return 'var(--purple)';
  return 'var(--gold)';
}