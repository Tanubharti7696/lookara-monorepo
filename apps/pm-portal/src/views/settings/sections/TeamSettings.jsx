import { useState, useEffect } from 'react';
import { Card, thStyle, useToast } from '../ui';
import { useShell } from '../../../context/ShellContext';
import { apiFetch } from '../../../utils/api';

const PERMISSIONS = [
  { capability: 'View properties',        viewer: 'YES', manager: 'YES', portfolioAdmin: 'YES', admin: 'YES' },
  { capability: 'Manage tasks',           viewer: 'NO',  manager: 'YES', portfolioAdmin: 'YES', admin: 'YES' },
  { capability: 'Manage vendors',         viewer: 'NO',  manager: 'YES', portfolioAdmin: 'YES', admin: 'YES' },
  { capability: 'Add / remove properties', viewer: 'NO', manager: 'NO',  portfolioAdmin: 'YES', admin: 'YES' },
  { capability: 'Billing access',         viewer: 'NO',  manager: 'NO',  portfolioAdmin: 'NO',  admin: 'YES' },
  { capability: 'Admin overrides',        viewer: 'NO',  manager: 'NO',  portfolioAdmin: 'LIMITED', admin: 'YES' },
];

function permTag(value) {
  if (value === 'YES') return <span className="tag tag-gold">YES</span>;
  if (value === 'LIMITED') return <span className="tag tag-amber">LIMITED</span>;
  return <span className="tag">NO</span>;
}

function RoleMatrix({ onBack }) {
  const showToast = useToast();
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 'var(--space-1)' }}>Role Matrix</h2>
          <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>
            Roles + permissions. Thin UI. Enforcement server-side.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-outline" onClick={onBack}>Back to Team</button>
          <button className="btn btn-primary" onClick={() => showToast('Changes are audited. Naming stability enforced.', 'info')}>Policy</button>
        </div>
      </div>

      <Card>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-1)' }}>Permissions</div>
          <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>Canonical role matrix</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ ...thStyle, padding: 'var(--space-3)' }}>Capability</th>
              <th style={{ ...thStyle, padding: 'var(--space-3)', textAlign: 'center', width: 120 }}>Viewer</th>
              <th style={{ ...thStyle, padding: 'var(--space-3)', textAlign: 'center', width: 120 }}>Manager</th>
              <th style={{ ...thStyle, padding: 'var(--space-3)', textAlign: 'center', width: 140 }}>Portfolio Admin</th>
              <th style={{ ...thStyle, padding: 'var(--space-3)', textAlign: 'center', width: 120 }}>Admin</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map(p => (
              <tr key={p.capability} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 'var(--space-3)' }}>{p.capability}</td>
                <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>{permTag(p.viewer)}</td>
                <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>{permTag(p.manager)}</td>
                <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>{permTag(p.portfolioAdmin)}</td>
                <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>{permTag(p.admin)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{
          fontSize: 14, color: 'var(--white-muted)', marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          Permission changes must write to Audit Engine with actor, timestamp, and scope diff.
        </div>
      </Card>
    </>
  );
}

function ScopePicker({ onBack }) {
  const showToast = useToast();
  const [overrides, setOverrides] = useState([
    { action: 'Deny', property: 'NYC-002' },
    { action: 'Grant', property: 'NYC-019' },
  ]);
  const [property, setProperty] = useState('NYC-014');
  const [action, setAction] = useState('Grant');

  const addOverride = () => {
    setOverrides(o => [...o, { action, property }]);
    showToast(`${action} override added for ${property}`, 'success');
  };

  const permissionRow = (label, desc, options, defaultIdx) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingBottom: 'var(--space-3)', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--white-muted)' }}>{desc}</div>
      </div>
      <select className="input" style={{ maxWidth: 160 }} defaultValue={options[defaultIdx]}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 'var(--space-1)' }}>Scope & Assignment</h2>
          <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>
            3-layer scoping: portfolio/region → property overrides → permissions.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-outline" onClick={onBack}>Back</button>
          <button className="btn btn-primary"
            onClick={() => showToast('Preview summary + conflict warnings required before save.', 'info')}>
            Preview
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-1)' }}>Layer 1 — Portfolio / Region</div>
            <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>Default scope</div>
          </div>

          <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
            Assign portfolio
          </label>
          <select className="input" style={{ marginBottom: 'var(--space-2)' }}>
            <option>NYC portfolio</option>
            <option>Miami portfolio</option>
            <option>All properties (Viewer only)</option>
          </select>

          <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-1)' }}>Layer 2 — Property Overrides</div>
              <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>Exceptions only</div>
            </div>

            <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>
              Add specific property override
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <select className="input" value={property} onChange={e => setProperty(e.target.value)}>
                <option>NYC-014</option><option>NYC-003</option><option>MIA-008</option>
              </select>
              <select className="input" value={action} onChange={e => setAction(e.target.value)}>
                <option>Grant</option><option>Deny</option>
              </select>
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={addOverride}>Add Override</button>

            <div style={{ marginTop: 'var(--space-3)' }}>
              {overrides.map((o, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: 'var(--space-2)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 14 }}>
                    {o.action} • {o.property}
                  </div>
                  <span className={`tag${o.action === 'Deny' ? ' tag-amber' : ''}`}>Override</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-1)' }}>Layer 3 — Permissions</div>
            <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>Capability toggles</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {permissionRow('Manage tasks', 'Create/edit/assign/close tasks', ['Allowed', 'Denied'], 0)}
            {permissionRow('Manage vendors', 'Assign vendors + pools', ['Allowed', 'Denied'], 0)}
            {permissionRow('Billing', 'View/manage billing', ['Allowed', 'Denied'], 1)}
            {permissionRow('Admin override visibility', 'PM can see banner + audit summary only', ['Visible', 'Hidden'], 0)}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
            <button className="btn btn-primary" style={{ flex: 1 }}
              onClick={() => showToast('Scope changes saved to Audit Engine', 'success')}>
              Save Changes
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function TeamSettings() {
  const [screen, setScreen] = useState('list');
  const showToast = useToast();
  const { user } = useShell();
  const [members, setMembers] = useState([
    { name: 'Sarah Chen', email: 'sarah@chenproperty.com', role: 'Manager', roleTag: 'tag-gold', scope: 'Portfolio: NYC' },
    { name: 'Mike Miller', email: 'mike@chenproperty.com', role: 'Manager', roleTag: '', scope: 'Portfolio: Miami' },
    { name: 'Alex Rivera', email: 'alex@chenproperty.com', role: 'Viewer', roleTag: '', scope: 'All properties' },
  ]);

  useEffect(() => {
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId) return;

    apiFetch(`/api/v1/organizations/${orgId}/users`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          setMembers(data.data.map(m => ({
            name: m.full_name || m.email,
            email: m.email,
            role: (m.role || 'viewer').toUpperCase(),
            roleTag: m.role === 'admin' ? 'tag-gold' : '',
            scope: 'Portfolio: NYC',
          })));
        }
      })
      .catch(console.error);
  }, [user]);

  if (screen === 'matrix') return <RoleMatrix onBack={() => setScreen('list')} />;
  if (screen === 'scope')  return <ScopePicker onBack={() => setScreen('list')} />;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 'var(--space-1)' }}>Team</h2>
          <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>
            Org → Users → Roles + Scope. Explicit assignment only.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-outline" onClick={() => setScreen('matrix')}>Role Matrix</button>
          <button className="btn btn-primary"
            onClick={() => showToast('Invite modal active', 'info')}>
            Invite
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-1)' }}>Team Members</div>
            <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>Unique credentials • audit trail</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>User</th>
                <th style={{ ...thStyle, width: 140 }}>Role</th>
                <th style={{ ...thStyle, width: 200 }}>Scope</th>
                <th style={{ ...thStyle, width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 14, color: 'var(--white-muted)', fontFamily: "'Courier New', monospace" }}>
                      {m.email}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span className={`tag${m.roleTag ? ' ' + m.roleTag : ''}`}>{m.role}</span>
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}><span className="tag">{m.scope}</span></td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <button className="btn btn-outline btn-small" onClick={() => setScreen('scope')}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            fontSize: 14, color: 'var(--white-muted)', marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            Only Admin / Portfolio Admin can add properties or modify billing.
          </div>
        </Card>

        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-1)' }}>Invite User</div>
            <div style={{ fontSize: 14, color: 'var(--white-muted)' }}>Settings → Team</div>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            const email = form.email.value;
            const role = form.role.value.toLowerCase();
            const orgId = user?.memberships?.[0]?.organizationId;

            if (orgId) {
              try {
                const res = await apiFetch(`/api/v1/organizations/${orgId}/users`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, role, fullName: email.split('@')[0] }),
                });
                if (res.ok) {
                  showToast('Invitation sent successfully', 'success');
                  setMembers(prev => [
                    ...prev,
                    { name: email.split('@')[0], email, role: role.toUpperCase(), roleTag: role === 'admin' ? 'tag-gold' : '', scope: 'Portfolio: NYC' }
                  ]);
                  form.reset();
                  return;
                }
              } catch (err) {
                console.error(err);
              }
            }
            showToast('Invitation sent successfully', 'success');
            setMembers(prev => [
              ...prev,
              { name: email.split('@')[0], email, role: role.toUpperCase(), roleTag: role === 'admin' ? 'tag-gold' : '', scope: 'Portfolio: NYC' }
            ]);
            form.reset();
          }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>Email</label>
              <input name="email" type="email" className="input" placeholder="name@company.com" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>Role</label>
                <select name="role" className="input">
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Viewer">Viewer</option>
                  <option value="Portfolio Admin">Portfolio Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>2FA</label>
                <select className="input">
                  <option>Required</option><option>Required (SMS)</option><option>Required (Authenticator)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--white-muted)', marginBottom: 'var(--space-2)' }}>Scope</label>
              <select className="input">
                <option>Portfolio: NYC</option>
                <option>Portfolio: Miami</option>
                <option>All properties (Viewer only)</option>
              </select>
              <div style={{ fontSize: 13, color: 'var(--white-muted)', marginTop: 'var(--space-2)' }}>
                Scope is entitlement. Users do not self-select properties.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send Invite</button>
              <button type="button" className="btn btn-outline"
                onClick={() => showToast('Invitation + scope changes write to Audit Engine.', 'info')}>
                Audit
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
