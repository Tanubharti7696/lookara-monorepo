import { TYPE_COLORS, MONTHS } from '../constants';

export default function PreviewPanel({ reqs, templateName, isOpen, onClose }) {
  const grouped = {};
  reqs.forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });

  return (
    <aside className={`preview-panel ${isOpen ? 'open' : ''}`}>
      <div className="preview-head">
        <div>
          <div className="preview-title">Live Preview</div>
          <div className="preview-sub">How this renders on the Compliance page</div>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="preview-body">
        {!reqs.length ? (
          <div className="preview-empty">Add requirements to see a preview</div>
        ) : (
          <>
            <div className="preview-count">
              {reqs.length} requirement{reqs.length !== 1 ? 's' : ''} · {templateName || 'This Template'}
            </div>
            {Object.entries(grouped).map(([type, items]) => {
              const tc = TYPE_COLORS[type] || TYPE_COLORS.Inspection;
              return (
                <div key={type}>
                  <div className="preview-section-title">{tc.label}</div>
                  {items.map((r) => {
                    const docCount = r.docs.filter(Boolean).length;
                    return (
                      <div key={r.id} className="preview-item" style={{ '--preview-accent': tc.accent }}>
                        <div className="preview-item-name">
                          {r.name || <em style={{ color: 'var(--muted)' }}>Unnamed requirement</em>}
                        </div>
                        <div className="preview-item-meta">
                          <span>📅 Due {MONTHS[r.dueMonth - 1]} {r.dueDay}</span>
                          <span>{r.cycle}</span>
                          {docCount > 0 && <span>📎 {docCount} doc{docCount !== 1 ? 's' : ''}</span>}
                          {r.inspection && <span style={{ color: 'var(--info)' }}>🔍 Insp.</span>}
                          {r.opsblocker && <span style={{ color: 'var(--danger)' }}>🔒 Blocker</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
}
