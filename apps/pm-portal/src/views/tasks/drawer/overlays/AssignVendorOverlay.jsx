import { apiFetch } from '../../../../utils/api';
import { useState, useEffect } from 'react';
import { useTaskActions } from '../useTaskActions';

export default function AssignVendorOverlay({ task, onClose, onUpdate }) {
  const actions = useTaskActions(task, onUpdate);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    apiFetch(`/api/v1/dispatch/candidates/${task.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch candidate vendors');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setCandidates(data.candidates || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [task.id]);

  const handleAssign = async (vendor) => {
    setAssigning(true);
    setError(null);
    try {
      const res = await apiFetch('/api/v1/dispatch/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: task.id,
          vendorId: vendor.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Dispatch assignment failed');
      }

      const updatedJob = await res.json();

      onUpdate?.({
        vendor: vendor.display_name || vendor.business_name,
        status: updatedJob.status || 'assigned',
        acceptedAt: null,
      });
      actions.addTimeline(`Dispatch assignment completed: ${vendor.display_name}`, 'dispatch', 'PM');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to assign vendor');
      setAssigning(false);
    }
  };

  const VendorRow = ({ v }) => (
    <div className="lk-vendor-opt">
      <div className="lk-vendor-opt__info">
        <div className="lk-vendor-opt__name">
          {v.display_name || v.business_name}
          <span className={`lk-vendor-opt__badge ${v.relationship_status === 'preferred' ? 'lk-vendor-opt__badge--assigned' : 'lk-vendor-opt__badge--nearby'}`}>
            {v.relationship_status === 'preferred' ? 'Preferred Vendor' : 'Eligible'}
          </span>
        </div>
        <div className="lk-vendor-opt__meta">
          <span style={{ color: 'var(--amber)', fontWeight: 700 }}>Trade: {v.primary_trade}</span>
          {' · '}Status: {v.lifecycle_status}
          {v.emergency_enabled && ' · ⚡ 24/7 Emergency'}
        </div>
      </div>
      <button
        className="lk-btn lk-btn--primary"
        style={{ flex: 'none', padding: '7px 14px', fontSize: 12 }}
        onClick={() => handleAssign(v)}
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
          {error && (
            <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--slate)' }}>Evaluating vendor eligibility...</div>
          ) : (
            <div className="lk-block">
              <div className="lk-block__title">
                Eligible Candidates ({candidates.length})
              </div>
              {candidates.length > 0 ? (
                candidates.map(v => <VendorRow key={v.id} v={v} />)
              ) : (
                <div style={{ fontSize: 13, color: 'var(--slate)', padding: '12px 0' }}>
                  No eligible vendors found matching trade, property coverage, and compliance requirements.
                </div>
              )}
            </div>
          )}
          <div className="lk-banner lk-banner--blue" style={{ marginBottom: 0 }}>
            <div className="lk-banner__sub">
              Deterministic dispatch applies identical eligibility validation across manual and automated dispatch.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}