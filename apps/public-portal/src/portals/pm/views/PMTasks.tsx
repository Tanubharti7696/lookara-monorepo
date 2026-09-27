// src/portals/pm/views/PMTasks.tsx
import { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../../../utils/auth';

export default function PMTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token && !token.startsWith('demo-')) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_BASE}/api/v1/tasks`, { headers })
      .then(r => r.json())
      .then(res => setTasks(res.data || res || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const statusColor: Record<string, string> = {
    accepted: 'badge-emerald', in_progress: 'badge-blue',
    dispatched: 'badge-amber', created: 'badge-muted',
    completed: 'badge-gold', flagged: 'badge-red', disputed: 'badge-red',
  };

  const urgencyColor: Record<string, string> = {
    emergency: 'badge-red', urgent: 'badge-amber', standard: 'badge-muted',
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">All jobs across your portfolio</p>
          </div>
          <button className="btn btn-primary">+ New Task</button>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Filters */}
        <div className="flex gap-2" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
          {['all','created','dispatched','accepted','in_progress','completed','flagged'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All Tasks' : s.replace('_',' ')}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loader-screen" style={{ height: 300 }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">No tasks found</div>
              <div className="empty-state-desc">Try a different filter or create a new task</div>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Task</th><th>Property</th><th>Trade</th>
                    <th>Urgency</th><th>Status</th><th>Payout</th><th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t: any) => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.job_code}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{t.property_name || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.trade || '—'}</td>
                      <td><span className={`badge ${urgencyColor[t.urgency] || 'badge-muted'}`}>{t.urgency || 'standard'}</span></td>
                      <td><span className={`badge ${statusColor[t.status] || 'badge-muted'}`}>{t.status?.replace('_',' ')}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>${parseFloat(t.payout_amount || 0).toFixed(2)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
