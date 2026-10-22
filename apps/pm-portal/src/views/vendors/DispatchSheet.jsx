// src/views/vendors/DispatchSheet.jsx
import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

export default function DispatchSheet({ VD, vendorId, onClose, onConfirm, onToast }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);

  const v = VD[vendorId] || {};

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiFetch('/api/v1/tasks?status=unassigned')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const taskList = data.data || [];
        setJobs(taskList);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [vendorId]);

  const handleConfirm = async () => {
    if (!selectedJob) {
      onToast('Select a task first', 'error');
      return;
    }
    setIsDispatching(true);
    try {
      const res = await apiFetch('/api/v1/dispatch/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: selectedJob, vendorId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Dispatch assignment failed');
      }
      onConfirm(selectedJob);
    } catch (e) {
      onToast(e.message || 'Failed to dispatch vendor', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <>
      <div className="vs-backdrop open" onClick={onClose} />
      <div className="vs-sheet open vs-sheet--narrow" onClick={e => e.stopPropagation()}>
        <div className="vs-handle" />
        <button className="vs-close" onClick={onClose}>×</button>

        <div className="vs-simple-header">
          <div className="vs-simple-title">Send to Job</div>
          <div className="vs-simple-sub">{v.name}</div>
          <div className="vs-tag-row">
            <span className="vs-tag">📍 Coverage Area</span>
            <span className="vs-tag">🔧 {v.trade || 'General'}</span>
          </div>
        </div>

        <div className="vs-body">
          <div className="vs-info-box">
            Showing: <strong style={{ color: 'var(--gold)' }}>{v.trade || 'Eligible'} tasks</strong> · vendor coverage area · unassigned only
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--slate)' }}>Loading unassigned tasks...</div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--slate)', fontSize: 13 }}>
              No unassigned tasks currently waiting for dispatch.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {jobs.map(j => (
                <div
                  key={j.id}
                  className={`vs-job-row ${selectedJob === j.id ? 'selected' : ''}`}
                  onClick={() => setSelectedJob(j.id)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: selectedJob === j.id ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedJob === j.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13, color: '#fff' }}>{j.job_code || j.title}</strong>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: j.severity === 'critical' ? 'var(--crimson)' : 'var(--gold)' }}>
                      {j.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--white-muted)' }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>
                    {j.property_name || 'Property'} · {j.trade_code}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="vs-footer">
          <button className="vs-dispatch-btn" onClick={handleConfirm} disabled={isDispatching || loading || jobs.length === 0}>
            {isDispatching ? 'Dispatching...' : 'Dispatch Vendor'}
          </button>
        </div>
      </div>
    </>
  );
}

function JobRow({ job, selected, onSelect }) {
  return (
    <div className={`vs-job-row ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div style={{ flex: 1 }}>
        <div className="vs-job-id">{job.id}</div>
        <div className="vs-job-title">{job.title}</div>
        <div className="vs-job-prop">{job.prop}</div>
      </div>
      <div className={`vs-job-time vs-job-time--${job.timeTone}`}>
        {job.time}
        <div style={{ fontSize: 11 }}>{job.timeSub}</div>
      </div>
    </div>
  );
}