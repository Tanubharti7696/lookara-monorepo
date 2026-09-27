// src/views/compliance-builder/PreviewPanel.jsx
import { MONTHS, TYPE_META } from '../../data/complianceTemplates';

export default function PreviewPanel({ templateName, requirements }) {
  if (requirements.length === 0) {
    return (
      <aside className="ctb-preview">
        <div className="ctb-preview__head">
          <div className="ctb-preview__title">Live Preview</div>
          <div className="ctb-preview__sub">How this renders on the Compliance page</div>
        </div>
        <div className="ctb-preview__body">
          <div className="ctb-preview-empty">Add requirements to see a preview</div>
        </div>
      </aside>
    );
  }

  // Group by type — same as HTML
  const grouped = requirements.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <aside className="ctb-preview">
      <div className="ctb-preview__head">
        <div className="ctb-preview__title">Live Preview</div>
        <div className="ctb-preview__sub">How this renders on the Compliance page</div>
      </div>
      <div className="ctb-preview__body">
        <div className="ctb-preview-count">
          {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} ·{' '}
          {templateName || 'This Template'}
        </div>

        {Object.entries(grouped).map(([type, items]) => {
          const meta = TYPE_META[type] || TYPE_META.Inspection;
          return (
            <div key={type}>
              <div className="ctb-preview-group-title">{meta.label}</div>
              {items.map(r => {
                const docCount = r.docs.filter(Boolean).length;
                return (
                  <div
                    key={r.id}
                    className="ctb-preview-item"
                    style={{ borderLeftColor: meta.accent }}
                  >
                    <div className="ctb-preview-item-name">
                      {r.name || <em style={{ color: 'var(--text-2)' }}>Unnamed requirement</em>}
                    </div>
                    <div className="ctb-preview-item-meta">
                      <span>📅 Due {MONTHS[r.dueMonth - 1]} {r.dueDay}</span>
                      <span>{r.cycle}</span>
                      {docCount > 0 && (
                        <span>📎 {docCount} doc{docCount !== 1 ? 's' : ''}</span>
                      )}
                      {r.inspection && <span style={{ color: '#3B82F6' }}>🔍 Insp.</span>}
                      {r.opsBlocker && <span style={{ color: 'var(--crimson)' }}>🔒 Blocker</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}