import { apiFetch } from '../../../../utils/api';
import { useState, useEffect } from 'react';
import { useTaskActions } from '../useTaskActions';

export default function AssignVendorOverlay({ task, onClose, onUpdate }) {
  const actions = useTaskActions(task, onUpdate);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    // Backend API missing, mocking data for demo purposes
    setVendors([
      { id: 'v1', name: 'Apex Pro Maintenance', tier: 'Gold', trust: 98, distanceMi: 1.2, avgResponseMin: 12, color: 'var(--amber)' },
      { id: 'v2', name: 'Manhattan Plumbing', tier: 'Silver', trust: 94, distanceMi: 3.4, avgResponseMin: 45, color: 'var(--slate)' },
      { id: 'v3', name: 'NYC Cleaners', tier: 'Bronze', trust: 88, distanceMi: 5.1, avgResponseMin: 90, color: 'var(--slate)' },
      { id: 'v4', name: 'Express Handyman', tier: 'Bronze', trust: 91, distanceMi: 2.1, avgResponseMin: 20, color: 'var(--slate)' }
    ]);
    setLoading(false);
  }, []);

  // In production this comes from the property-vendor link table
  const assignedToProperty = new Set(['Apex Pro Maintenance', 'Manhattan Plumbing', 'NYC Cleaners']);

  const assignedVendors = vendors.filter(v => assignedToProperty.has(v.name));
  const nearbyVendors   = vendors.filter(v => !assignedToProperty.has(v.name));

  const handleAssign = async (vendorName) => {
    setAssigning(true);
    try {
      await apiFetch(`/api/v1/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'assigned' })
      });
      onUpdate?.({
        vendor: vendorName,
        status: 'assigned',
        acceptedAt: null,
      });
      actions.addTimeline(`Dispatch offer sent to ${vendorName}`, 'dispatch', 'PM');
      onClose();
    } catch (err) {
      console.error(err);
      setAssigning(false);
    }
  };

  const VendorRow = ({ v, badge }) => (
    <div className="lk-vendor-opt">
      <div className="lk-vendor-opt__info">
        <div className="lk-vendor-opt__name">
          {v.name}
          <span className={`lk-vendor-opt__badge lk-vendor-opt__badge--${badge}`}>
            {badge === 'assigned' ? 'Assigned to property' : 'Nearby'}
          </span>
        </div>
        <div className="lk-vendor-opt__meta">
          <span style={{ color: v.color, fontWeight: 700 }}>{v.tier} · {v.trust}%</span>
          {' · '}📍 {v.distanceMi} mi
          {' · '}⚡ {v.avgResponseMin}m avg
        </div>
      </div>
      <button
        className="lk-btn lk-btn--primary"
        style={{ flex: 'none', padding: '7px 14px', fontSize: 12 }}
        onClick={() => handleAssign(v.name)}
        disabled={assigning}
      >
        {assigning ? '...' : 'Assign'}
      </button>
    </div>
  );

  return (
    <div className="lk-overlay" onClick={onClose}>
      <div className="lk-overlay__panel" onClick={(e) => e.stopPropagation()}>
        <div className="lk-overlay__head">
          <div>
            <div className="lk-overlay__title">Assign Vendor</div>
            <div className="lk-overlay__sub">{task.title || task.name}</div>
          </div>
          <button className="lk-overlay__close" onClick={onClose}>✕</button>
        </div>

        <div className="lk-overlay__body">
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center' }}>Loading vendors...</div>
          ) : (
            <>
              <div className="lk-block">
                <div className="lk-block__title">Assigned to {task.property_name || task.property}</div>
                {assignedVendors.length > 0 ? (
                  assignedVendors.map(v => <VendorRow key={v.id} v={v} badge="assigned" />)
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--slate)', padding: '8px 0' }}>
                    No vendors configured for this property.
                  </div>
                )}
              </div>

              {nearbyVendors.length > 0 && (
                <div className="lk-block">
                  <div className="lk-block__title">Also available nearby</div>
                  {nearbyVendors.map(v => <VendorRow key={v.id} v={v} badge="nearby" />)}
                </div>
              )}
            </>
          )}
          <div className="lk-banner lk-banner--blue" style={{ marginBottom: 0 }}>
            <div className="lk-banner__sub">
              Assigning sends a dispatch offer — vendor must accept before work begins.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}