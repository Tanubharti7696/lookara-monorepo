// src/views/vendors/DispatchSheet.jsx
import { useState, useEffect } from 'react';

const JOBS = [
  { id: 'TSK-2901', title: 'Turnover Clean',   prop: 'Apt 4B · Brooklyn Heights · Unassigned', section: 'at-risk',   time: '43m',      timeSub: 'remaining', timeTone: 'urgent' },
  { id: 'TSK-2888', title: 'Standard Clean',   prop: 'Loft 2A · DUMBO · Unassigned',           section: 'upcoming',  time: '3h 45m',   timeSub: 'remaining', timeTone: 'soon'   },
  { id: 'TSK-2915', title: 'Deep Clean',       prop: 'Suite 7C · Park Slope · Unassigned',     section: 'upcoming',  time: 'Tomorrow', timeSub: '9:00 AM',   timeTone: 'ok'     },
];

export default function DispatchSheet({ VD, vendorId, onClose, onConfirm, onToast }) {
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const v = VD[vendorId] || {};

  const handleConfirm = () => {
    if (!selectedJob) {
      onToast('Select a job first', 'error');
      return;
    }
    onConfirm(selectedJob);
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
            <span className="vs-tag">📍 Brooklyn Heights · DUMBO</span>
            <span className="vs-tag">🔧 {v.trade}</span>
          </div>
        </div>

        <div className="vs-body">
          <div className="vs-info-box">
            Showing: <strong style={{ color: 'var(--gold)' }}>{v.trade} jobs</strong> · vendor coverage area · unassigned only
          </div>

          <div className="vs-job-section vs-job-section--critical">⚠ SLA At Risk</div>
          {JOBS.filter(j => j.section === 'at-risk').map(j => (
            <JobRow key={j.id} job={j} selected={selectedJob === j.id} onSelect={() => setSelectedJob(j.id)} />
          ))}

          <div className="vs-job-section" style={{ marginTop: 12 }}>Upcoming Jobs</div>
          {JOBS.filter(j => j.section === 'upcoming').map(j => (
            <JobRow key={j.id} job={j} selected={selectedJob === j.id} onSelect={() => setSelectedJob(j.id)} />
          ))}

          <div className="vs-hidden-note">🚫 4 jobs hidden — outside vendor coverage area (Miami · Orlando)</div>
        </div>

        <div className="vs-footer">
          <button className="vs-dispatch-btn" onClick={handleConfirm}>
            Dispatch Vendor
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