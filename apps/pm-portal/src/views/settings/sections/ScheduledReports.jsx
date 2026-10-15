import { Card, Toggle, thStyle, useToast } from '../ui';

const SCHEDULES = [
  { id: 'pl',         name: 'P&L Summary',             desc: 'Revenue, expenses, net income',  freq: 'Weekly Mon',  recipients: '3 recipients', next: 'Mon, 9:00 AM',    on: true },
  { id: 'occupancy',  name: 'Occupancy Report',        desc: 'Bookings, vacancy rates, ADR',   freq: 'Daily',       recipients: '5 recipients', next: 'Tomorrow, 8:00 AM', on: true },
  { id: 'tasks',      name: 'Task Completion Summary', desc: 'Completed, pending, overdue',    freq: 'Weekly Fri',  recipients: '2 recipients', next: 'Fri, 5:00 PM',    on: true },
  { id: 'compliance', name: 'Compliance Dashboard',    desc: 'Licenses, permits, deadlines',   freq: 'Monthly 1st', recipients: '4 recipients', next: 'Feb 1, 9:00 AM',  on: false },
];

const TEMPLATES = [
  { id: 'financial',   title: '💰 Financial Performance', desc: 'Revenue, expenses, margins',  formats: 'PDF, Excel, CSV', cta: 'Schedule' },
  { id: 'property',    title: '🏠 Property Performance',  desc: 'Occupancy, ADR, RevPAR',      formats: 'PDF, Excel',      cta: 'Schedule' },
  { id: 'vendor',      title: '👥 Vendor Performance',    desc: 'Response time, completion rate', formats: 'PDF, Excel',   cta: 'Schedule' },
  { id: 'guest',       title: '📊 Guest Analytics',       desc: 'Reviews, ratings, demographics', formats: 'PDF, Excel',   cta: 'Schedule' },
  { id: 'maintenance', title: '🔧 Maintenance Log',       desc: 'Work orders, costs, frequency', formats: 'PDF, Excel, CSV', cta: 'Schedule' },
  { id: 'custom',      title: '⚙️ Custom Report',         desc: 'Build your own report',       formats: 'All',             cta: 'Build Custom' },
];

export default function ScheduledReports() {
  const showToast = useToast();

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Active Schedules</div>
          <button className="btn btn-primary btn-small" onClick={() => showToast('Opening schedule creator...', 'info')}>
            Create Schedule
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={thStyle}>Report</th>
              <th style={{ ...thStyle, width: 120 }}>Frequency</th>
              <th style={{ ...thStyle, width: 150 }}>Recipients</th>
              <th style={{ ...thStyle, width: 120 }}>Next Run</th>
              <th style={{ ...thStyle, width: 80, textAlign: 'center' }}></th>
              <th style={{ ...thStyle, width: 100, textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULES.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 'var(--space-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>{s.desc}</div>
                </td>
                <td style={{ padding: 'var(--space-2)', fontSize: 14 }}>{s.freq}</td>
                <td style={{ padding: 'var(--space-2)', fontSize: 14, color: 'var(--white-muted)' }}>{s.recipients}</td>
                <td style={{ padding: 'var(--space-2)', fontSize: 14, color: 'var(--white-muted)' }}>{s.next}</td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Toggle active={s.on} onToggle={() => {}} />
                  </div>
                </td>
                <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>
                  <button className="btn btn-outline btn-small"
                    onClick={() => showToast(`Editing ${s.id} report schedule`, 'info')}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Available Report Templates</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          {TEMPLATES.map(t => (
            <Card key={t.id} style={{ padding: 'var(--space-3)', marginBottom: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-1)' }}>{t.title}</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>{t.desc}</div>
              <div style={{ fontSize: 12, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
                Formats: {t.formats}
              </div>
              <button className="btn btn-outline btn-small" style={{ width: '100%' }}
                onClick={() => showToast(`Setting up ${t.id} report schedule...`, 'info')}>
                {t.cta}
              </button>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Default Settings</div>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>Default Format</label>
            <select className="input"><option>PDF</option><option>Excel</option><option>CSV</option></select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>Time Zone</label>
            <select className="input">
              <option>Eastern (ET)</option><option>Central (CT)</option>
              <option>Mountain (MT)</option><option>Pacific (PT)</option>
            </select>
          </div>
        </Card>

        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Delivery Options</div>
          {[
            { name: 'Email Delivery', desc: 'Send reports via email', on: true },
            { name: 'In-App Archive', desc: 'Save to Reports section', on: true },
            { name: 'Slack Integration', desc: 'Post to channel', on: false },
          ].map((o, i, arr) => (
            <div key={o.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-2) 0',
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{o.name}</div>
                <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>{o.desc}</div>
              </div>
              <Toggle active={o.on} onToggle={() => {}} />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
