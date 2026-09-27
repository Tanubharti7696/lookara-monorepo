import { useState, useRef } from 'react';
import RequirementCard from './RequirementCard';

const TYPES = ['Inspection', 'License', 'Insurance', 'Certificate', 'HOA'];

export default function RequirementsTab({ reqs, setReqs }) {
  const [expanded, setExpanded] = useState(new Set());
  const nameRef = useRef(null);
  const lastAddedId = useRef(null);
  const nextId = useRef(Math.max(0, ...reqs.map((r) => r.id)) + 1);

  const toggle = (id) => {
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const updateReq = (id, patch) =>
    setReqs((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const deleteReq = (id) => {
    setReqs((prev) => prev.filter((r) => r.id !== id));
    setExpanded((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  const addRequirement = (type) => {
    const id = nextId.current++;
    lastAddedId.current = id;
    setReqs((prev) => [...prev, {
      id, name: '', type, cycle: 'Annual', dueMonth: 1, dueDay: 1,
      inspection: type === 'Inspection', opsblocker: false,
      priority: 'medium', docs: [], notes: '',
    }]);
    setExpanded((prev) => new Set(prev).add(id));
  };

  const addDoc = (id) => {
    setReqs((prev) => prev.map((r) => r.id === id ? { ...r, docs: [...r.docs, ''] } : r));
    setExpanded((prev) => new Set(prev).add(id));
  };

  const updateDoc = (id, idx, val) =>
    setReqs((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const docs = [...r.docs];
      docs[idx] = val;
      return { ...r, docs };
    }));

  const removeDoc = (id, idx) =>
    setReqs((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const docs = [...r.docs];
      docs.splice(idx, 1);
      return { ...r, docs };
    }));

  const collapseAll = () => setExpanded(new Set());

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Requirements</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
            Each requirement becomes a tracked compliance item on the Compliance page
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={collapseAll}>Collapse All</button>
      </div>

      <div className="req-list">
        {reqs.map((r) => (
          <RequirementCard
            key={r.id}
            ref={r.id === lastAddedId.current ? nameRef : undefined}
            req={r}
            expanded={expanded.has(r.id)}
            onToggle={() => toggle(r.id)}
            onDelete={() => deleteReq(r.id)}
            onUpdate={(patch) => updateReq(r.id, patch)}
            onAddDoc={() => addDoc(r.id)}
            onUpdateDoc={(di, v) => updateDoc(r.id, di, v)}
            onRemoveDoc={(di) => removeDoc(r.id, di)}
          />
        ))}
      </div>

      <div className="add-req-bar">
        {TYPES.map((t) => (
          <button key={t} className="add-req-btn" onClick={() => addRequirement(t)}>+ {t}</button>
        ))}
      </div>
    </div>
  );
}
