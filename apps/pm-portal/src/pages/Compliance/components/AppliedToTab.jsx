import { APPLIED_PROPERTIES } from '../constants';

export default function AppliedToTab({ onToast }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Applied To</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
        Properties currently using this template. Changes to published templates propagate to all applied properties.
      </div>

      <div style={{
        background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderLeft: '3px solid var(--warning)',
        borderRadius: 6, padding: '12px 16px',
        marginBottom: 20, fontSize: 13, color: 'var(--text-2)',
      }}>
        ⚠ Editing a published template affects all properties listed below. Consider duplicating before making breaking changes.
      </div>

      {APPLIED_PROPERTIES.map(([prop, , reqs, date], i) => (
        <div key={i} className="applied-card" style={{
          background: 'var(--panel)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '14px 16px', marginBottom: 8,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{prop}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
              {reqs} · Applied {date}
            </div>
          </div>
          <div className="applied-actions" style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm"
              onClick={() => onToast('View compliance items for this property', 'info')}>View</button>
            <button className="btn btn-danger-outline btn-sm"
              onClick={() => onToast('Remove template from property', 'error')}>Remove</button>
          </div>
        </div>
      ))}

      <button className="btn btn-outline btn-block" style={{ marginTop: 8 }}
        onClick={() => onToast('Opens: Apply to more properties', 'info')}>
        + Apply to More Properties
      </button>
    </div>
  );
}
