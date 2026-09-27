// src/views/compliance/ComplianceDrawer.jsx
import { useEffect, useState } from 'react';
import {
  isOverdue, isDueSoon, daysUntil,
  STATUS_LABELS, STATUS_COLORS, TIMELINES,
} from '../../data/compliance';

const TABS = [
  { key: 'overview',   label: 'Overview' },
  { key: 'documents',  label: 'Documents' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'timeline',   label: 'Timeline' },
];

export default function ComplianceDrawer({ item, onClose, onUpdate, onOpenCreateTask, onToast }) {
  const [tab, setTab] = useState('overview');
  const [accOpen, setAccOpen] = useState(false);

  useEffect(() => {
    setTab('overview');
    setAccOpen(false);
  }, [item?.id]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const overdue = isOverdue(item);
  const dueSoon = isDueSoon(item);
  const statusLabel = STATUS_LABELS[item.status] || item.status;
  const statusColor = STATUS_COLORS[item.status] || 'var(--text-2)';

  const missingDocs = item.docs.filter(d => !d.ok);
  const needInspectionSchedule =
    item.insp && !item.inspStatus.startsWith('Scheduled') && !item.inspStatus.startsWith('Completed');

  /* Timeline items */
  const tl = TIMELINES[item.id] || [
    { e: '📋', t: 'Requirement created from compliance template',   d: 'Oct 5, 2025' },
    { e: '✅', t: `Status set to ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`, d: 'Feb 28, 2026' },
  ];

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} />
      <aside className="drawer open" role="dialog">
        <div className="drawer-head">
          <div className="drawer-head-top">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="drawer-title">{item.name}</div>
              <div className="drawer-sub">{item.prop}</div>
            </div>
            <button
              className="btn btn-ghost"
              onClick={onClose}
              style={{ fontSize: 16, padding: '4px 8px', flexShrink: 0 }}
            >✕</button>
          </div>

          <div className="drawer-status-row">
            <span style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5,
              color: statusColor,
              background: 'rgba(255,255,255,0.05)',
              padding: '3px 9px', borderRadius: 4,
              border: `1px solid ${statusColor}44`,
            }}>
              {statusLabel}
            </span>
            {overdue && <span className="badge badge-overdue">OVERDUE</span>}
            {!overdue && dueSoon && <span className="badge badge-duesoon">DUE SOON</span>}
            {item.blocker && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: 'var(--danger)',
                background: 'rgba(220,38,38,0.1)',
                padding: '3px 9px', borderRadius: 4,
                border: '1px solid rgba(220,38,38,0.3)',
              }}>
                🔒 Hard Blocker
              </span>
            )}
          </div>

          <div className="drawer-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                className={`dtab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="drawer-body">
          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="dpane active">
              {item.id === 'c01' && (
                <div className="risk-callout">
                  <div className="risk-callout-title">⚠ Related Risk</div>
                  Metro HVAC COI expires in 12 days<br />
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onToast?.('Routing to Vendor Compliance', 'info'); }}
                    style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                  >
                    → View Vendor Compliance ↗
                  </a>
                </div>
              )}

              <div className="dpane-section">
                <div className="dpane-section-title">Recommended Actions</div>
                <div className="drawer-actions">
                  {missingDocs.length > 0 && (
                    <button
                      className="drawer-action-btn"
                      onClick={() => setTab('documents')}
                    >
                      <span className="drawer-action-icon">📎</span>
                      <div>
                        <div>Upload Document</div>
                        <div className="drawer-action-sub">
                          {missingDocs.length} document{missingDocs.length !== 1 ? 's' : ''} missing
                        </div>
                      </div>
                    </button>
                  )}
                  {needInspectionSchedule && (
                    <button
                      className="drawer-action-btn"
                      onClick={() => onOpenCreateTask?.(item)}
                    >
                      <span className="drawer-action-icon">📅</span>
                      <div>
                        <div>Schedule Inspection</div>
                        <div className="drawer-action-sub">Opens Create Task · pre-filled</div>
                      </div>
                    </button>
                  )}
                  {item.status === 'review' && (
                    <button
                      className="drawer-action-btn"
                      onClick={() => {
                        onUpdate?.(item.id, { status: 'compliant' });
                        onToast?.('Requirement marked compliant', 'success');
                        onClose?.();
                      }}
                    >
                      <span className="drawer-action-icon">✓</span>
                      <div>
                        <div>Mark Complete</div>
                        <div className="drawer-action-sub">All documents uploaded</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="dpane-section">
                <div className="dpane-section-title">Details</div>
                <Field label="Status"   value={<span style={{ color: statusColor }}>{statusLabel}</span>} />
                <Field label="Property" value={item.prop} />
                <Field label="Owner"    value={item.owner} />
                <Field
                  label="Due Date"
                  value={
                    <span style={{
                      color: overdue ? 'var(--danger)' : dueSoon ? 'var(--warning)' : 'var(--text)',
                      fontWeight: 700,
                    }}>
                      {item.due}
                    </span>
                  }
                />
              </div>

              <div className="dpane-section" style={{ marginTop: 16 }}>
                <button
                  className={`accordion-trigger ${accOpen ? 'open' : ''}`}
                  onClick={() => setAccOpen(v => !v)}
                >
                  <span>Additional Information</span>
                  <span className="acc-arrow">▾</span>
                </button>
                {accOpen && (
                  <div className="accordion-body open">
                    <Field label="Jurisdiction"    value={item.jurisdiction} />
                    <Field label="Renewal Cycle"   value={item.cycle} />
                    <Field label="Source Template" value={item.template} />
                    <Field label="Vendor"          value={item.vendor} />
                    <Field
                      label="Hard Blocker"
                      value={item.blocker ? 'Yes — ops blocked if violated' : 'No'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {tab === 'documents' && (
            <div className="dpane active">
              <div className="dpane-section">
                <div className="dpane-section-title">Required Documents</div>
                {item.docs.map((d, i) => (
                  <div className="doc-row" key={i}>
                    <div className="doc-icon">{d.ok ? '📄' : '❌'}</div>
                    <div className="doc-info">
                      <div className="doc-name">{d.name}</div>
                      <div className="doc-meta">
                        {d.ok ? '✓ Uploaded' : 'Missing — not uploaded'}
                      </div>
                    </div>
                    <div className="doc-actions">
                      {d.ok ? (
                        <>
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => onToast?.('Opens document viewer', 'info')}
                          >View</button>
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => onToast?.('Opens replace document upload', 'info')}
                          >Replace</button>
                        </>
                      ) : (
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => onToast?.('Opens document upload flow', 'info')}
                        >↑ Upload</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INSPECTION ── */}
          {tab === 'inspection' && (
            <div className="dpane active">
              {item.insp ? (
                <div className="dpane-section">
                  <div className="dpane-section-title">Inspection Status</div>
                  <Field label="Status"    value={item.inspStatus} />
                  <Field
                    label="Inspector"
                    value={item.vendor !== '—'
                      ? item.vendor
                      : <span style={{ color: 'var(--warning)' }}>Not assigned</span>}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    {needInspectionSchedule ? (
                      <button className="btn btn-primary" onClick={() => onOpenCreateTask?.(item)}>
                        📅 Schedule Inspection
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-outline"
                          onClick={() => onToast?.('Opens reschedule flow', 'info')}
                        >Reschedule</button>
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            onUpdate?.(item.id, { inspStatus: 'Completed just now' });
                            onToast?.('Inspection marked complete', 'success');
                          }}
                        >✓ Mark Completed</button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                  No inspection required for this requirement.
                </div>
              )}
            </div>
          )}

          {/* ── TIMELINE ── */}
          {tab === 'timeline' && (
            <div className="dpane active">
              <div className="dpane-section">
                <div className="dpane-section-title">Compliance Timeline</div>
                <div className="timeline">
                  {tl.map((h, i) => (
                    <div className="tl-item" key={i}>
                      <div className="tl-dot">{h.e}</div>
                      <div>
                        <div className="tl-text">{h.t}</div>
                        <div className="tl-date">{h.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Field({ label, value }) {
  return (
    <div className="dfield">
      <span className="dfield-label">{label}</span>
      <span className="dfield-val">{value}</span>
    </div>
  );
}