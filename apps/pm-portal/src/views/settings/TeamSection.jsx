// src/views/settings/TeamSection.jsx
import { useState, useEffect } from 'react';
import { useShell } from '../../context/ShellContext';
import { apiFetch } from '../../utils/api';

const ROLE_CLS = {
  Owner:      'role--owner',
  Admin:      'role--admin',
  Manager:    'role--manager',
  Technician: 'role--tech',
  Viewer:     'role--viewer',
};

export default function TeamSection({ onToast }) {
  const { user } = useShell();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', fullName: '', role: 'viewer' });
  const [editingMember, setEditingMember] = useState(null);

  const fetchMembers = () => {
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId) return;
    setLoading(true);
    apiFetch(`/api/v1/organizations/${orgId}/users`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const mapped = data.data.map(m => ({
            id: m.user_id, // Important: use user_id here for update/remove
            name: m.full_name,
            email: m.email,
            role: m.role,
            status: m.membership_status,
            avatar: m.full_name.substring(0, 2).toUpperCase(),
            lastActive: new Date(m.joined_at).toLocaleDateString(),
          }));
          setMembers(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const handleInvite = async (e) => {
    e.preventDefault();
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId) return;
    try {
      const res = await apiFetch(`/api/v1/organizations/${orgId}/users`, {
        method: 'POST',
        body: JSON.stringify(inviteData),
      });
      if (res.ok) {
        onToast?.('Invitation sent', 'success');
        setShowInvite(false);
        setInviteData({ email: '', fullName: '', role: 'viewer' });
        fetchMembers();
      } else {
        const err = await res.json();
        onToast?.(err.message || 'Failed to invite user', 'error');
      }
    } catch (error) {
      onToast?.('Failed to invite user', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId || !editingMember) return;
    try {
      const res = await apiFetch(`/api/v1/organizations/${orgId}/users/${editingMember.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: editingMember.role, status: editingMember.status }),
      });
      if (res.ok) {
        onToast?.('Member updated', 'success');
        setEditingMember(null);
        fetchMembers();
      } else {
        onToast?.('Failed to update member', 'error');
      }
    } catch (error) {
      onToast?.('Failed to update member', 'error');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    const orgId = user?.memberships?.[0]?.organizationId;
    try {
      const res = await apiFetch(`/api/v1/organizations/${orgId}/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        onToast?.('Member removed', 'success');
        setEditingMember(null);
        fetchMembers();
      } else {
        onToast?.('Failed to remove member', 'error');
      }
    } catch (error) {
      onToast?.('Failed to remove member', 'error');
    }
  };

  useEffect(() => {
    const orgId = user?.memberships?.[0]?.organizationId;
    if (!orgId) {
      setLoading(false);
      return;
    }
    fetchMembers();
  }, [user, onToast]);

  return (
    <section className="settings-section">
      <header className="settings-section__head">
        <div>
          <h1 className="settings-section__title">Team</h1>
          <p className="settings-section__sub">
            Manage who has access to the workspace and what they can do.
          </p>
        </div>
        <button
          className="stg-btn stg-btn--primary"
          onClick={() => setShowInvite(true)}
        >
          + Invite Member
        </button>
      </header>

      {showInvite && (
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#f8fafc' }}>Invite New Member</h3>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" required value={inviteData.fullName} onChange={e => setInviteData({ ...inviteData, fullName: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} placeholder="Jane Doe" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" required value={inviteData.email} onChange={e => setInviteData({ ...inviteData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }} placeholder="jane@example.com" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Role</label>
              <select value={inviteData.role} onChange={e => setInviteData({ ...inviteData, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="tech">Technician</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="stg-btn stg-btn--primary">Send Invite</button>
              <button type="button" className="stg-btn stg-btn--ghost" onClick={() => setShowInvite(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingMember && (
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#f8fafc' }}>Edit Member: {editingMember.name}</h3>
          <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Role</label>
              <select value={editingMember.role} onChange={e => setEditingMember({ ...editingMember, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="tech">Technician</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>Status</label>
              <select value={editingMember.status} onChange={e => setEditingMember({ ...editingMember, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px' }}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="stg-btn stg-btn--primary">Save</button>
              <button type="button" className="stg-btn stg-btn--danger" onClick={() => handleRemove(editingMember.id)} style={{ background: '#dc2626', color: 'white' }}>Remove</button>
              <button type="button" className="stg-btn stg-btn--ghost" onClick={() => setEditingMember(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="team-table">
        <div className="team-table__head">
          <div>Member</div>
          <div>Role</div>
          <div>Last Active</div>
          <div>Status</div>
          <div></div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate)' }}>Loading team...</div>
        ) : members.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate)' }}>No members found.</div>
        ) : members.map(m => (
          <div key={m.id} className="team-table__row">
            <div className="team-row__member">
              <div className="team-avatar">{m.avatar}</div>
              <div>
                <div className="team-row__name">{m.name}</div>
                <div className="team-row__email">{m.email}</div>
              </div>
            </div>
            <div>
              <span className={`team-role ${ROLE_CLS[m.role.charAt(0).toUpperCase() + m.role.slice(1)] || ''}`}>{m.role.charAt(0).toUpperCase() + m.role.slice(1)}</span>
            </div>
            <div className="team-row__last">{m.lastActive}</div>
            <div>
              <span className={`team-status team-status--${m.status}`}>
                {m.status === 'active' ? '● Active' : `○ ${m.status}`}
              </span>
            </div>
            <div className="team-row__actions">
              <button
                className="stg-btn stg-btn--ghost stg-btn--sm"
                onClick={() => setEditingMember(m)}
              >
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-hintbar">
        💡 Roles: <strong>Owner</strong> — full control. <strong>Admin</strong> — everything except billing.
        <strong> Manager</strong> — properties, work orders, compliance. <strong>Technician</strong> — assigned WOs only.
        <strong> Viewer</strong> — read-only.
      </div>
    </section>
  );
}