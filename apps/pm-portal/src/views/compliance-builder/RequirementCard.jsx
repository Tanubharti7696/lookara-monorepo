// src/views/compliance-builder/RequirementCard.jsx
import { useState, useEffect, useRef } from 'react';
import { MONTHS, TYPE_META, CYCLE_OPTIONS, PRIORITY_OPTIONS } from '../../data/complianceTemplates';

export default function RequirementCard({
  req,
  expanded,
  autoFocus,
  onToggle,
  onUpdate,
  onDelete,
  onAddDoc,
  onUpdateDoc,
  onRemoveDoc,
}) {
  /* ── Local drafts for text inputs ──
     Kept local so React doesn't re-render the whole list on every keystroke.
     Committed to parent onBlur. This is the fix over the HTML's innerHTML
     re-render-everything approach that lost focus/scroll position. */
  const [nameDraft, setNameDraft] = useState(req.name);
  const [dayDraft,  setDayDraft]  = useState(String(req.dueDay));

  // Sync drafts if the parent value changed externally (e.g. undo)
  useEffect(() => { setNameDraft(req.name); }, [req.name]);
  useEffect(() => { setDayDraft(String(req.dueDay)); }, [req.dueDay]);

  const nameRef = useRef(null);
  useEffect(() => {
    if (autoFocus && nameRef.current) {
      // Give the DOM one tick to fully mount before focusing
      const t = setTimeout(() => nameRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const meta = TYPE_META[req.type] || TYPE_META.Inspection;

  return (
    <div className={`ctb-req-card ${expanded ? 'expanded' : ''}`} id={`req-${req.id}`}>
      <div className="ctb-req-head" onClick={onToggle}>
        <span className="ctb-req-drag" title="Drag to reorder">⠿</span>
        <span className={`ctb-req-type ${meta.cls}`}>{req.type}</span>
        <input
          ref={nameRef}
          className="ctb-req-name"
          type="text"
          value={nameDraft}
          placeholder="Requirement name..."
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => {
            if (nameDraft !== req.name) onUpdate({ name: nameDraft });
          }}
        />
        <div className="ctb-req-meta">
          <span className="ctb-req-meta-pill">📅 {MONTHS[req.dueMonth - 1]} {req.dueDay}</span>
          <span className="ctb-req-meta-pill">{req.cycle}</span>
          {req.opsBlocker && <span className="ctb-req-meta-blocker">🔒 Blocker</span>}
          {req.inspection && <span className="ctb-req-meta-insp">🔍 Insp.</span>}
        </div>
        <span className="ctb-req-chevron">▾</span>
        <button
          className="ctb-req-delete"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          type="button"
          aria-label="Delete requirement"
        >✕</button>
      </div>

      {expanded && (
        <div className="ctb-req-body">
          <div className="ctb-req-grid">
            <div>
              <div className="ctb-mini-label">Requirement Type</div>
              <select
                className="ctb-input"
                value={req.type}
                onChange={(e) => onUpdate({ type: e.target.value })}
              >
                {Object.keys(TYPE_META).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="ctb-mini-label">Renewal Cycle</div>
              <select
                className="ctb-input"
                value={req.cycle}
                onChange={(e) => onUpdate({ cycle: e.target.value })}
              >
                {CYCLE_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div className="ctb-mini-label">Due Month</div>
              <select
                className="ctb-input"
                value={req.dueMonth}
                onChange={(e) => onUpdate({ dueMonth: parseInt(e.target.value, 10) })}
              >
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <div className="ctb-mini-label">Due Day</div>
              <input
                className="ctb-input"
                type="number"
                min={1}
                max={31}
                value={dayDraft}
                onChange={(e) => setDayDraft(e.target.value)}
                onBlur={() => {
                  const n = Math.max(1, Math.min(31, parseInt(dayDraft, 10) || 1));
                  setDayDraft(String(n));
                  if (n !== req.dueDay) onUpdate({ dueDay: n });
                }}
              />
            </div>
            <div>
              <div className="ctb-mini-label">Priority</div>
              <select
                className="ctb-input"
                value={req.priority}
                onChange={(e) => onUpdate({ priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="ctb-checkbox-col">
              <label className="ctb-checkbox">
                <input
                  type="checkbox"
                  checked={req.inspection}
                  onChange={(e) => onUpdate({ inspection: e.target.checked })}
                />
                Inspection required
              </label>
              <label className="ctb-checkbox">
                <input
                  type="checkbox"
                  checked={req.opsBlocker}
                  onChange={(e) => onUpdate({ opsBlocker: e.target.checked })}
                />
                Ops blocker if overdue
              </label>
            </div>

            <div className="ctb-req-grid-full">
              <div className="ctb-mini-label">Required Documents</div>
              {req.docs.map((d, i) => (
                <div key={i} className="ctb-doc-item">
                  <span style={{ fontSize: 14 }}>📄</span>
                  <input
                    className="ctb-doc-name"
                    type="text"
                    defaultValue={d}
                    placeholder="Document name"
                    onBlur={(e) => {
                      if (e.target.value !== d) onUpdateDoc(i, e.target.value);
                    }}
                  />
                  <button className="ctb-doc-remove" onClick={() => onRemoveDoc(i)} type="button">✕</button>
                </div>
              ))}
              <button className="ctb-add-doc-btn" onClick={onAddDoc} type="button">
                + Add Document
              </button>
            </div>

            <div className="ctb-req-grid-full">
              <div className="ctb-mini-label">Internal Notes</div>
              <textarea
                className="ctb-input ctb-input--textarea ctb-input--short"
                defaultValue={req.notes}
                placeholder="Notes for your team about this requirement..."
                onBlur={(e) => {
                  if (e.target.value !== req.notes) onUpdate({ notes: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}