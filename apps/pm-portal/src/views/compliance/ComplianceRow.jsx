// src/views/compliance/ComplianceRow.jsx
import { isOverdue, isDueSoon } from '../../data/compliance';

export function ComplianceRow({ item, kind, onOpen }) {
  const overdue = isOverdue(item);
  const dueSoon = isDueSoon(item);

  const rowClass =
    kind === 'scheduled' ? 'is-scheduled'
    : kind === 'review'  ? 'is-review'
    : overdue            ? 'is-overdue'
    : dueSoon            ? 'is-duesoon'
    : '';

  return (
    <div className={`item-row ${rowClass}`} onClick={() => onOpen(item.id)}>
      <div className="item-main">
        <div className="item-name">{item.name}</div>
        <div className="item-prop">{item.prop}</div>
        <div className="item-meta">
          {kind === 'action'     && <DuePill item={item} />}
          {kind === 'action'     && <DocSummary item={item} />}
          {kind === 'action'     && <InspSummary item={item} />}
          {kind === 'scheduled'  && <span className="meta-pill info">📅 {item.inspStatus}</span>}
          {kind === 'scheduled'  && <span className="meta-pill">Due {item.due}</span>}
          {kind === 'review'     && <span className="meta-pill ok">Submitted for Review</span>}
          {kind === 'review'     && <span className="meta-pill">Due {item.due}</span>}
        </div>
      </div>

      {kind === 'action' && (
        <div className="item-right">
          {overdue && <span className="badge badge-overdue">OVERDUE</span>}
          {!overdue && dueSoon && <span className="badge badge-duesoon">DUE SOON</span>}
          {!overdue && !dueSoon && item.risk === 'HIGH'   && <span className="badge badge-high">HIGH RISK</span>}
          {!overdue && !dueSoon && item.risk === 'MEDIUM' && <span className="badge badge-medium">MEDIUM</span>}
        </div>
      )}
    </div>
  );
}

function DuePill({ item }) {
  const overdue = isOverdue(item);
  const dueSoon = isDueSoon(item);
  const cls = overdue ? 'danger' : dueSoon ? 'warn' : '';
  return <span className={`meta-pill ${cls}`}>📅 Due {item.due}</span>;
}

function DocSummary({ item }) {
  const total = item.docs.length;
  const uploaded = item.docs.filter(d => d.ok).length;
  const missing = total - uploaded;
  if (missing === 0) return <span className="meta-pill ok">✓ Docs Complete</span>;
  return <span className="meta-pill danger">📎 {missing}/{total} Docs Missing</span>;
}

function InspSummary({ item }) {
  if (!item.insp) return null;
  const s = item.inspStatus;
  if (s === 'N/A' || s === 'Not Scheduled')  return <span className="meta-pill danger">⚠ Inspection Not Scheduled</span>;
  if (s === 'Awaiting Scheduling')            return <span className="meta-pill warn">📅 Awaiting Scheduling</span>;
  if (s.startsWith('Scheduled'))              return <span className="meta-pill info">📅 {s}</span>;
  if (s.startsWith('Completed'))              return <span className="meta-pill ok">✓ {s}</span>;
  return null;
}

/* ─────────── Compliant mini-card (grid item) ─────────── */
export function CompliantMini({ item, onOpen }) {
  return (
    <div className="compliant-mini" onClick={() => onOpen(item.id)}>
      <div className="compliant-check">✅</div>
      <div>
        <div className="compliant-mini-name">{item.name}</div>
        <div className="compliant-mini-prop">{item.prop}</div>
        <div className="compliant-mini-due">Expires {item.due}</div>
      </div>
    </div>
  );
}