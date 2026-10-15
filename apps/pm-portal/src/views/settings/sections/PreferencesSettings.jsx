import { Card, CardHeader, Field, Toggle, useToast } from '../ui';

export default function PreferencesSettings() {
  const showToast = useToast();

  return (
    <>
      <Card>
        <CardHeader title="Display & Interface" note="Customize your workspace" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Field label="Theme">
            <select className="input">
              <option>Dark Mode</option><option>Light Mode</option><option>Auto (System)</option>
            </select>
          </Field>
          <Field label="Density">
            <select className="input">
              <option>Comfortable</option><option>Compact</option><option>Dense</option>
            </select>
          </Field>
          <Field label="Dashboard Default">
            <select className="input">
              <option>Overview</option><option>Tasks</option><option>Properties</option><option>Calendar</option>
            </select>
          </Field>
          <Field label="Sidebar">
            <select className="input">
              <option>Expanded</option><option>Collapsed</option><option>Auto-hide</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Regional & Formatting" note="Localization preferences" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Field label="Language">
            <select className="input">
              <option>English (US)</option><option>English (UK)</option>
              <option>Spanish</option><option>French</option>
            </select>
          </Field>
          <Field label="Timezone">
            <select className="input">
              <option>Eastern (ET)</option><option>Central (CT)</option>
              <option>Mountain (MT)</option><option>Pacific (PT)</option>
            </select>
          </Field>
          <Field label="Date Format">
            <select className="input">
              <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
            </select>
          </Field>
          <Field label="Time Format">
            <select className="input">
              <option>12-hour (AM/PM)</option><option>24-hour</option>
            </select>
          </Field>
          <Field label="Currency">
            <select className="input">
              <option>USD ($)</option><option>EUR (€)</option>
              <option>GBP (£)</option><option>CAD ($)</option>
            </select>
          </Field>
          <Field label="First Day of Week">
            <select className="input">
              <option>Sunday</option><option>Monday</option>
            </select>
          </Field>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Data & Privacy</div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Analytics</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>Help improve Lookara</div>
            </div>
            <Toggle active onToggle={() => {}} />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Activity Log</div>
              <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>Track your actions</div>
            </div>
            <Toggle active onToggle={() => {}} />
          </div>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <button className="btn btn-outline btn-small" style={{ width: '100%' }}
              onClick={() => showToast('Data export requested', 'success')}>
              Export My Data
            </button>
          </div>
        </Card>

        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Defaults</div>
          <Field label="Task Priority" style={{ marginBottom: 'var(--space-3)' }}>
            <select className="input"><option>Low</option><option>Medium</option><option>High</option></select>
          </Field>
          <Field label="Calendar View" style={{ marginBottom: 'var(--space-3)' }}>
            <select className="input"><option>Day</option><option>Week</option><option>Month</option></select>
          </Field>
          <Field label="Items Per Page">
            <select className="input"><option>25</option><option>50</option><option>100</option></select>
          </Field>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <button className="btn btn-primary" onClick={() => showToast('Preferences saved successfully', 'success')}>
          Save Preferences
        </button>
      </div>
    </>
  );
}
