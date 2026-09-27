// src/views/tasks/drawer/tabs/TimelineTab.jsx

const TL_CATEGORIES = {
  status:        { icon: '🟦', dot: 'status' },
  communication: { icon: '🟨', dot: 'message' },
  notes:         { icon: '🟩', dot: 'note' },
  files:         { icon: '🟪', dot: 'file' },
  financial:     { icon: '🟥', dot: 'payment' },
  system:        { icon: '⬛', dot: 'info' },
};

const TYPE_TO_CATEGORY = {
  create: 'status', dispatch: 'status', accept: 'status',
  progress: 'status', complete: 'status', warn: 'status',
  block: 'status', info: 'system', 'en-route': 'status',
  arrived: 'status', departed: 'status',
  call: 'communication', message: 'communication',
  note: 'notes',
  file: 'files', photo: 'files',
  payment: 'financial', invoice: 'financial', dispute: 'financial',
};

export default function TimelineTab({ task }) {
  const tl = task.timeline || [];

  if (tl.length === 0) {
    return (
      <div className="lk-block" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>📋</div>
        <div style={{ fontSize: 13, color: 'var(--slate)' }}>No events recorded yet.</div>
      </div>
    );
  }

  const counts = tl.reduce((acc, e) => {
    const a = e.actor || 'PM';
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="lk-block">
      <div className="lk-block__title">Task Journey & Audit Log</div>

      <div className="lk-tl__summary">
        <span className="lk-tl__pill" style={{ alignSelf: 'center' }}>Events:</span>
        {Object.entries(counts).map(([actor, count]) => (
          <span key={actor} className="lk-tl__pill">
            {actor} <strong style={{ color: 'var(--text)' }}>{count}</strong>
          </span>
        ))}
        <span className="lk-tl__pill lk-tl__pill--total">{tl.length} total</span>
      </div>

      <div className="lk-tl">
        {tl.map((e, i) => {
          const cat = TL_CATEGORIES[TYPE_TO_CATEGORY[e.type] || 'system'];
          const last = i === tl.length - 1;
          return (
            <div key={i} className="lk-tl__item">
              {!last && <div className="lk-tl__line" />}
              <div className={`lk-tl__dot lk-tl__dot--${e.type}`} />
              <div className="lk-tl__body">
                <div className="lk-tl__label">{cat.icon} {e.label}</div>
                <div className="lk-tl__meta">
                  <span>{e.ts}</span>
                  <span>·</span>
                  <span className={`lk-tl__actor lk-tl__actor--${actorKey(e.actor)}`}>
                    {e.actor || 'PM'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function actorKey(actor) {
  if (actor === 'Vendor') return 'vendor';
  if (actor === 'System') return 'system';
  if (actor === 'Owner')  return 'owner';
  if (actor === 'Admin')  return 'admin';
  return 'pm';
}