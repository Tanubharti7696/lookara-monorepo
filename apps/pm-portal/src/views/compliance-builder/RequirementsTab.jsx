// src/views/compliance-builder/RequirementsTab.jsx
import { useEffect, useRef } from 'react';
import RequirementCard from './RequirementCard';

const ADD_TYPES = ['Inspection', 'License', 'Insurance', 'Certificate', 'HOA'];

export default function RequirementsTab({
  requirements,
  expandedIds,
  autoFocusId,
  onToggle,
  onUpdateReq,
  onDeleteReq,
  onAddReq,
  onAddDoc,
  onUpdateDoc,
  onRemoveDoc,
  onCollapseAll,
}) {
  const scrollTargetRef = useRef(null);

  // Scroll newly-added card into view
  useEffect(() => {
    if (autoFocusId && scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [autoFocusId]);

  return (
    <div className="ctb-tab-pane">
      <div className="ctb-tab-pane__head">
        <div>
          <div className="ctb-tab-pane__title">Requirements</div>
          <div className="ctb-tab-pane__sub">
            Each requirement becomes a tracked compliance item on the Compliance page
          </div>
        </div>
        <button className="ctb-btn ctb-btn--outline ctb-btn--sm" onClick={onCollapseAll}>
          Collapse All
        </button>
      </div>

      <div className="ctb-req-list">
        {requirements.length === 0 ? (
          <div className="ctb-empty">
            No requirements yet. Add one below to get started.
          </div>
        ) : (
          requirements.map(req => (
            <div
              key={req.id}
              ref={req.id === autoFocusId ? scrollTargetRef : null}
            >
              <RequirementCard
                req={req}
                expanded={expandedIds.has(req.id)}
                autoFocus={req.id === autoFocusId}
                onToggle={() => onToggle(req.id)}
                onUpdate={(patch) => onUpdateReq(req.id, patch)}
                onDelete={() => onDeleteReq(req.id)}
                onAddDoc={() => onAddDoc(req.id)}
                onUpdateDoc={(idx, val) => onUpdateDoc(req.id, idx, val)}
                onRemoveDoc={(idx) => onRemoveDoc(req.id, idx)}
              />
            </div>
          ))
        )}
      </div>

      <div className="ctb-add-bar">
        {ADD_TYPES.map(t => (
          <button
            key={t}
            className="ctb-add-req-btn"
            onClick={() => onAddReq(t)}
            type="button"
          >
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}