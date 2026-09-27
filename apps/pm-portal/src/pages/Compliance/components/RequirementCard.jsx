import { forwardRef } from 'react';
import { TYPE_COLORS, MONTHS, CYCLES, PRIORITIES } from '../constants';

const RequirementCard = forwardRef(function RequirementCard(
  { req, expanded, onToggle, onDelete, onUpdate, onAddDoc, onUpdateDoc, onRemoveDoc },
  nameRef
) {
  const tc = TYPE_COLORS[req.type] || TYPE_COLORS.Inspection;

  return (
    <div className={`req-card ${expanded ? 'expanded' : ''}`}>
      <div className="req-card-head" onClick={onToggle}>
        <span className="req-drag" title="Drag to reorder">⠿</span>
        <span className={`req-type-badge ${tc.cls}`}>{req.type}</span>
        <input
          ref={nameRef}
          className="req-name-input"
          type="text"
          value={req.name}
          placeholder="Requirement name..."
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <div className="req-meta">
          <span className="req-meta-pill">📅 {MONTHS[req.dueMonth - 1]} {req.dueDay}</span>
          <span className="req-meta-pill">{req.cycle}</span>
          {req.opsblocker && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>🔒 Blocker</span>}
          {req.inspection && <span style={{ fontSize: 11, color: 'var(--info)' }}>🔍 Insp.</span>}
        </div>
        <span className="req-chevron">▾</span>
        <button
          className="req-delete"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete requirement"
        >✕</button>
      </div>

      {expanded && (
        <div className="req-card-body">
          <div className="req-body-grid">
            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Requirement Type</div>
              <select className="f-input" value={req.type} onChange={(e) => onUpdate({ type: e.target.value })}>
                {Object.keys(TYPE_COLORS).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Renewal Cycle</div>
              <select className="f-input" value={req.cycle} onChange={(e) => onUpdate({ cycle: e.target.value })}>
                {CYCLES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Due Month</div>
              <select className="f-input" value={req.dueMonth}
                onChange={(e) => onUpdate({ dueMonth: parseInt(e.target.value, 10) })}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Due Day</div>
              <input className="f-input" type="number" min="1" max="31" value={req.dueDay}
                onChange={(e) => onUpdate({ dueDay: parseInt(e.target.value, 10) || 1 })} />
            </div>
            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Priority</div>
              <select className="f-input" value={req.priority}
                onChange={(e) => onUpdate({ priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="checkbox-col">
              <label className="checkbox-row">
                <input type="checkbox" checked={req.inspection}
                  onChange={(e) => onUpdate({ inspection: e.target.checked })} />
                Inspection required
              </label>
              <label className="checkbox-row danger">
                <input type="checkbox" checked={req.opsblocker}
                  onChange={(e) => onUpdate({ opsblocker: e.target.checked })} />
                Ops blocker if overdue
              </label>
            </div>
            <div className="req-body-full">
              <div className="field-label" style={{ marginBottom: 6 }}>Required Documents</div>
              <div className="doc-checklist">
                {req.docs.map((d, di) => (
                  <div className="doc-item" key={di}>
                    <span style={{ fontSize: 14 }}>📄</span>
                    <input className="doc-item-name" type="text" value={d}
                      placeholder="Document name"
                      onChange={(e) => onUpdateDoc(di, e.target.value)} />
                    <button className="doc-remove" onClick={() => onRemoveDoc(di)}>✕</button>
                  </div>
                ))}
              </div>
              <button className="add-doc-btn" onClick={onAddDoc}>+ Add Document</button>
            </div>
            <div className="req-body-full">
              <div className="field-label" style={{ marginBottom: 6 }}>Internal Notes</div>
              <textarea className="f-input" rows={2}
                placeholder="Notes for your team about this requirement..."
                style={{ minHeight: 50 }}
                value={req.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default RequirementCard;
