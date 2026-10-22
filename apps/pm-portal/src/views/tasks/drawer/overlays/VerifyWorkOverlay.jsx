// src/views/tasks/drawer/overlays/VerifyWorkOverlay.jsx
import { useState } from 'react';
import { apiFetch } from '../../../../utils/api';

export default function VerifyWorkOverlay({ task, onClose, onUpdate }) {
  const [decision, setDecision] = useState('approve'); // 'approve' | 'rework'
  const [reworkReason, setReworkReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (decision === 'rework' && !reworkReason.trim()) {
      setError('Please provide a reason for requesting rework.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/v1/tasks/${task.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          reworkReason: decision === 'rework' ? reworkReason : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Verification submission failed');
      }

      const result = await res.json();
      if (decision === 'approve') {
        onUpdate?.({ state: 'closed', status: 'closed', verified: true });
      } else {
        onUpdate?.({ 
          state: 'in_progress', 
          status: 'in_progress', 
          reworkCount: result.task?.rework_count || 1,
          reworkReason: reworkReason 
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lk-overlay" onClick={onClose}>
      <div className="lk-overlay__panel" onClick={(e) => e.stopPropagation()}>
        <div className="lk-overlay__head">
          <div>
            <div className="lk-overlay__title">PM Verification & Sign-off</div>
            <div className="lk-overlay__sub">{task.name} ({task.property})</div>
          </div>
          <button className="lk-overlay__close" onClick={onClose}>✕</button>
        </div>

        <div className="lk-overlay__body">
          <div className="lk-banner lk-banner--blue" style={{ marginBottom: 14 }}>
            <div className="lk-banner__title">🛡 Quality Assurance Control</div>
            <div className="lk-banner__sub">
              Verify work evidence before releasing payment or closing out the task. If quality is deficient, the task is returned to In Progress on the same Task with an incremented rework cycle counter for the assigned vendor.
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--crimson)', background: '#fee2e2', padding: 8, borderRadius: 4, marginBottom: 12, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="lk-field">
            <label className="lk-field__label">Verification Decision</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className={`lk-method-btn ${decision === 'approve' ? 'active' : ''}`}
                onClick={() => setDecision('approve')}
                style={{
                  padding: '12px',
                  borderRadius: 6,
                  border: decision === 'approve' ? '2px solid #10b981' : '1px solid var(--line)',
                  background: decision === 'approve' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-0)',
                  color: decision === 'approve' ? '#10b981' : 'var(--text)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✓ Approve &amp; Close Work
              </button>
              <button
                type="button"
                className={`lk-method-btn ${decision === 'rework' ? 'active' : ''}`}
                onClick={() => setDecision('rework')}
                style={{
                  padding: '12px',
                  borderRadius: 6,
                  border: decision === 'rework' ? '2px solid #ef4444' : '1px solid var(--line)',
                  background: decision === 'rework' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-0)',
                  color: decision === 'rework' ? '#ef4444' : 'var(--text)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ⚠ Reject &amp; Trigger Rework
              </button>
            </div>
          </div>

          {decision === 'rework' && (
            <div className="lk-field" style={{ marginTop: 14 }}>
              <label className="lk-field__label">
                Rework Reason / Deficiencies <span style={{ color: 'var(--crimson)' }}>*</span>
              </label>
              <textarea
                className="lk-field__input"
                rows={4}
                value={reworkReason}
                onChange={(e) => setReworkReason(e.target.value)}
                placeholder="Explain what was left incomplete or needs correction (e.g., missed leak test on secondary valve, debris left in yard)..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          )}
        </div>

        <div className="lk-overlay__foot">
          <button className="lk-btn lk-btn--secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button
            className="lk-btn lk-btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              background: decision === 'rework' ? '#ef4444' : '#10b981',
              borderColor: decision === 'rework' ? '#ef4444' : '#10b981',
            }}
          >
            {isSubmitting ? 'Submitting...' : decision === 'approve' ? 'Confirm Approval' : 'Trigger Rework Task'}
          </button>
        </div>
      </div>
    </div>
  );
}