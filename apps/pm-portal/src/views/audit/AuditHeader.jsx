// src/views/audit/AuditHeader.jsx
export default function AuditHeader() {
  return (
    <div className="audit-header">
      <div>
        <div className="audit-header__title">Audit History</div>
        <div className="audit-header__sub">Everything that happened — search to find it.</div>
      </div>
      <div className="audit-header__bell">
        🔔
        <div className="audit-header__badge">3</div>
      </div>
    </div>
  );
}