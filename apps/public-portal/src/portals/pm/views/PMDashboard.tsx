// src/portals/pm/views/PMDashboard.tsx
import { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../../../utils/auth';

interface Metrics {
  totalProperties: number;
  activeTasks: number;
  pendingApprovals: number;
  activeIncidents: number;
}

export default function PMDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token && !token.startsWith('demo-')) headers['Authorization'] = `Bearer ${token}`;

    // Fetch tasks and properties in parallel
    Promise.all([
      fetch(`${API_BASE}/api/v1/tasks`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${API_BASE}/api/v1/properties`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([tasksRes, propsRes]) => {
      const taskList = tasksRes.data || tasksRes || [];
      const propList = propsRes.data || propsRes || [];
      setTasks(taskList.slice(0, 5));
      setMetrics({
        totalProperties: propList.length,
        activeTasks: taskList.filter((t: any) => ['accepted','in_progress','dispatched'].includes(t.status)).length,
        pendingApprovals: taskList.filter((t: any) => t.status === 'created').length,
        activeIncidents: taskList.filter((t: any) => t.urgency === 'emergency').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loader-screen" style={{ height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const metricCards = [
    { label: 'Properties',       value: metrics?.totalProperties ?? 0, icon: '🏠', color: 'var(--blue)' },
    { label: 'Active Tasks',      value: metrics?.activeTasks ?? 0,     icon: '✅', color: 'var(--emerald)' },
    { label: 'Pending Creation',  value: metrics?.pendingApprovals ?? 0, icon: '⏳', color: 'var(--amber)' },
    { label: 'Emergency Tasks',   value: metrics?.activeIncidents ?? 0,  icon: '🚨', color: 'var(--red)' },
  ];

  const statusColor: Record<string, string> = {
    accepted: 'badge-emerald', in_progress: 'badge-blue',
    dispatched: 'badge-amber', created: 'badge-muted',
    completed: 'badge-gold', flagged: 'badge-red',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Operations Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your property portfolio</p>
      </div>
      <div style={{ padding: '24px 32px' }}>
        {/* Metric cards */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {metricCards.map(m => (
            <div key={m.label} className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="metric-label">{m.label}</div>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
              </div>
              <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Recent tasks */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Tasks</h2>
            <a href="/pm/tasks" className="btn btn-ghost btn-sm">View All →</a>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No tasks yet</div>
              <div className="empty-state-desc">Tasks will appear here once created</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Property</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t: any) => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.job_code}</div>
                      </td>
                      <td>{t.property_name || '—'}</td>
                      <td>
                        <span className={`badge ${t.urgency === 'emergency' ? 'badge-red' : t.urgency === 'urgent' ? 'badge-amber' : 'badge-muted'}`}>
                          {t.urgency || 'standard'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusColor[t.status] || 'badge-muted'}`}>
                          {t.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        ${parseFloat(t.payout_amount || 0).toFixed(2)}
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
