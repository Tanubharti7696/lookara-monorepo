// src/views/compliance/modals/CreateTaskModal.jsx
import { daysUntil } from '../../../data/compliance';

export default function CreateTaskModal({ item, onClose, onConfirm }) {
  if (!item) return null;

  const days = daysUntil(item.due);
  const priority =
    days < 0  ? 'Critical'
    : days <= 7  ? 'High'
    : days <= 30 ? 'Medium'
    : 'Low';

  const priorityColor =
    priority === 'Critical' ? 'var(--danger)'
    : priority === 'High'   ? 'var(--warning)'
    : priority === 'Medium' ? 'var(--info)'
    : 'var(--success)';

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-box" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="modal-title">Schedule Inspection</div>
            <div className="modal-sub">Creates a task pre-filled from this compliance requirement</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 16, padding: '2px 6px' }}>✕</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: 0.6, color: 'var(--muted)', marginBottom: 10,
          }}>
            Create Task — Pre-filled
          </div>

          <Row label="Task Type"     value={<>🔍 Inspection <span className="locked">(locked)</span></>} />
          <Row label="Source"        value={<>Compliance <span className="locked">(locked)</span></>} />
          <Row label="Requirement"   value={item.name} />
          <Row label="Property"      value={<>{item.prop} <span className="locked">(locked)</span></>} />
          <Row label="Compliance ID" value={item.id.toUpperCase()} />
          <Row
            label="Priority"
            value={
              <>
                <span style={{ color: priorityColor, fontWeight: 700 }}>{priority}</span>{' '}
                <span className="locked">— suggested from due date</span>
              </>
            }
          />
        </div>

        <div style={{
          fontSize: 13, color: 'var(--muted)',
          background: 'rgba(212,175,55,0.06)',
          border: '1px solid rgba(212,175,55,0.18)',
          borderRadius: 7, padding: '10px 12px', marginBottom: 14,
        }}>
          PM selects vendor · sets preferred date · adds notes · then creates the task.
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onConfirm(item.id)}>
            → Open Create Task
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '9px 0', borderBottom: '1px solid var(--border)',
      fontSize: 14, gap: 12,
    }}>
      <span style={{ color: 'var(--text-2)', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}