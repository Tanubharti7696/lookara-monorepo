// src/views/tasks/drawer/tabs/FilesTab.jsx

export default function FilesTab({ task }) {
  const pw = task.proofOfWork;
  const photoCount = (pw?.beforePhotos || 0) + (pw?.afterPhotos || 0);

  return (
    <div>
      {/* Evidence */}
      <div className="lk-block">
        <div className="lk-block__title">📷 Evidence — Photos, Reports</div>
        {photoCount > 0 ? (
          <FileChip
            icon="📷"
            label={`${photoCount} photo${photoCount === 1 ? '' : 's'} submitted as proof of work — view on Action tab`}
          />
        ) : (
          <div style={{ fontSize: 12, color: 'var(--slate)', padding: '8px 0' }}>
            No evidence files yet.
          </div>
        )}
        {task.relatedRecords?.some(r => r.icon === '🚨') && (
          <FileChip icon="📄" label="incident_report.pdf" />
        )}
        <div className="lk-photo-thumb" style={{ borderStyle: 'dashed', marginTop: 8 }}>
          <div style={{ fontSize: 18, color: 'var(--slate)' }}>＋</div>
          <div style={{ fontSize: 10, color: 'var(--slate)' }}>Add</div>
        </div>
      </div>

      {/* Financial */}
      <div className="lk-block">
        <div className="lk-block__title">🧾 Financial — Invoices, Quotes</div>
        {task.quote && (
          <FileChip icon="📄" label={`quote_${(task.vendor || 'vendor').replace(/\s+/g, '_').toLowerCase()}.pdf`} meta={task.quote.amount} />
        )}
        {task.paymentDispute && (
          <>
            <FileChip icon="🧾" label="vendor_invoice.pdf" meta={task.paymentDispute.invoiced} />
            <FileChip icon="📄" label="pm_approved_amount.pdf" meta={task.paymentDispute.approved} />
          </>
        )}
        {task.escalatedToAdmin?.pmSubmission?.attachments?.map((a, i) => (
          <FileChip key={`pm-${i}`} icon="📎" label={a} />
        ))}
        {task.escalatedToAdmin?.vendorSubmission?.attachments?.map((a, i) => (
          <FileChip key={`v-${i}`} icon="📎" label={a} />
        ))}
        {!task.quote && !task.paymentDispute && !task.escalatedToAdmin && (
          <div style={{ fontSize: 12, color: 'var(--slate)', padding: '8px 0' }}>
            No financial documents for this task.
          </div>
        )}
      </div>

      {/* Compliance */}
      <div className="lk-block">
        <div className="lk-block__title">📋 Compliance</div>
        {task.linked_object_type === 'compliance_item' ? (
          <FileChip icon="📋" label={`compliance_${task.linked_object_id}.pdf`} />
        ) : (
          <div style={{ fontSize: 12, color: 'var(--slate)', padding: '8px 0' }}>
            No compliance documents for this task.
          </div>
        )}
      </div>

      <div style={{
        border: '1px dashed var(--line)', borderRadius: 8,
        padding: 20, textAlign: 'center',
        cursor: 'pointer',
      }}>
        <div style={{ fontSize: 13, color: 'var(--slate)' }}>📎 Click to attach files</div>
      </div>
    </div>
  );
}

function FileChip({ icon, label, meta }) {
  return (
    <div className="lk-file-chip">
      <span className="lk-file-chip__icon">{icon}</span>
      <span className="lk-file-chip__label">{label}</span>
      {meta && <span className="lk-file-chip__meta">{meta}</span>}
    </div>
  );
}