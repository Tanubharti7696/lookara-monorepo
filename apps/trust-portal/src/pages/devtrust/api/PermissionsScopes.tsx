// src/pages/devtrust/api/PermissionsScopes.tsx
import { InfoBox } from '../../../components/devtrust/Primitives';

const ROLES = [
  ['Property Manager', 'Assigned properties only', 'Full operational control (tasks, vendors, compliance, emergency mode)'],
  ['Vendor', 'Assigned tasks only', 'View assigned tasks, check-in/out, upload proofs—no cross-property access, no owner/OTA data access, no access codes without explicit assignment'],
  ['Owner', 'Owned properties only (Phase 2)', 'Read-only performance metrics—no guest data, no operational controls'],
  ['Admin', 'System-wide', 'System-level access with audit trail for all privileged actions'],
];

export default function PermissionsScopes() {
  return (
    <>
      <h1 className="dt-title">Permissions &amp; Scopes</h1>
      <p className="dt-subtitle">
        Role-based access control with property-scoped permissions.
      </p>

      <h2 className="dt-section-title">Access Control Model</h2>
      <div className="dt-card">
        <p className="dt-text">
          Lookara enforces <strong>Role-Based Access Control (RBAC)</strong> with property-level
          scoping. Users can only access data and perform actions appropriate to their role and
          assigned properties.
        </p>
      </div>

      <h2 className="dt-section-title">Roles</h2>
      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr><th>Role</th><th>Scope</th><th>Capabilities</th></tr>
          </thead>
          <tbody>
            {ROLES.map(([role, scope, caps]) => (
              <tr key={role}>
                <td><strong>{role}</strong></td>
                <td>{scope}</td>
                <td>{caps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="dt-section-title">Scope Boundaries</h2>
      <div className="dt-two-col">
        <div className="dt-col-card is-positive">
          <h4>✓ Property Manager Can:</h4>
          <ul>
            <li>View/edit assigned properties</li>
            <li>Create tasks for assigned properties</li>
            <li>Dispatch vendors</li>
            <li>Activate emergency mode</li>
            <li>View audit logs for their properties</li>
          </ul>
        </div>
        <div className="dt-col-card is-negative">
          <h4>✗ Property Manager Cannot:</h4>
          <ul>
            <li>View other companies' properties</li>
            <li>Access guest contact information</li>
            <li>Modify booking details</li>
            <li>See other vendors' SLA scores</li>
            <li>Edit system-wide settings</li>
          </ul>
        </div>
      </div>

      <InfoBox title="🔐 Least Privilege Principle">
        Access is scoped by <strong>role + property</strong>. A vendor working on Property A
        cannot see tasks for Property B. Property Manager at Company X cannot see Company Y's data.
      </InfoBox>
    </>
  );
}