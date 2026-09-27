import { CHANGE_LOG } from '../constants';

export default function ChangeLogTab() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Change Log</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
        Full audit trail of every change to this template.
      </div>

      {CHANGE_LOG.map(([icon, title, user, date, detail], i) => (
        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 18, position: 'relative' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--gold-dim)',
            border: '1px solid rgba(212,175,55,0.25)',
            flexShrink: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 12,
          }}>{icon}</div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 1 }}>{detail}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{user} · {date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
