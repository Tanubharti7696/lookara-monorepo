function fileChip(icon, label) {
  return (
    <div className="photo-thumb" style={{height:48,flexDirection:'row',gap:8,justifyContent:'flex-start',padding:'0 10px',cursor:'pointer'}}>
      <span style={{fontSize:16}}>{icon}</span>
      <span style={{fontSize:12,color:'var(--muted)'}}>{label}</span>
    </div>
  );
}

export default function FilesTab({ task, onAction }) {
  const pw = task.proofOfWork;
  let evidenceItems = '';
  const evidence = [];

  if (pw) {
    for (let i = 1; i <= (pw.beforePhotos || 0); i++) evidence.push(<div key={`b${i}`} className="photo-thumb"><div style={{fontSize:20}}>📷</div><div style={{fontSize:12,color:'var(--muted)'}}>Before {i}</div></div>);
    for (let i = 1; i <= (pw.afterPhotos || 0); i++) evidence.push(<div key={`a${i}`} className="photo-thumb"><div style={{fontSize:20}}>📷</div><div style={{fontSize:12,color:'var(--muted)'}}>After {i}</div></div>);
  }
  if (task.relatedRecords?.some(r => r.icon === '🚨')) evidence.push(<div key="ir">{fileChip('📄', 'incident_report.pdf')}</div>);
  evidence.push(<div key="add" className="photo-thumb" style={{borderStyle:'dashed'}}><div style={{fontSize:18,color:'var(--slate)'}}>＋</div><div style={{fontSize:12,color:'var(--slate)'}}>Add</div></div>);

  const financial = [];
  if (task.quote) financial.push(fileChip('📄', `quote_${(task.vendor || 'vendor').replace(/\s+/g, '_').toLowerCase()}.pdf`));
  if (task.paymentDispute) {
    financial.push(fileChip('🧾', 'vendor_invoice.pdf'));
    financial.push(fileChip('📄', 'pm_approved_amount.pdf'));
  }
  if (task.escalatedToAdmin) {
    (task.escalatedToAdmin.pmSubmission?.attachments || []).forEach(a => financial.push(fileChip('📎', a)));
    (task.escalatedToAdmin.vendorSubmission?.attachments || []).forEach(a => financial.push(fileChip('📎', a)));
  }
  if (pw?.invoiceAmount) financial.push(fileChip('🧾', 'vendor_invoice.pdf'));

  const compliance = [];
  if (task.compliance) compliance.push(fileChip('📋', `${(task.compliance.type || 'requirement').replace(/\s+/g, '_').toLowerCase()}.pdf`));
  if (task.taskType === 'Inspection' || task.category === 'Inspection') compliance.push(fileChip('📋', 'inspection_report.pdf'));

  return (
    <>
      <div className="dr-block">
        <div className="dr-block-title">📷 Evidence — Photos, Videos, Reports</div>
        <div className="photo-grid">{evidence}</div>
      </div>

      <div className="dr-block">
        <div className="dr-block-title">🧾 Financial — Invoices, Quotes, Receipts</div>
        {financial.length ? (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>{financial.map((f, i) => <div key={i}>{f}</div>)}</div>
        ) : (
          <div style={{fontSize:12,color:'var(--slate)',padding:'8px 0'}}>No financial documents for this task.</div>
        )}
      </div>

      <div className="dr-block">
        <div className="dr-block-title">📋 Compliance — Certificates, COI, Inspection Reports</div>
        {compliance.length ? (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {compliance.map((c, i) => <div key={i}>{c}</div>)}
            {task.compliance?.docsRequired && <div style={{fontSize:12,color:'var(--muted)',padding:'4px 0 0'}}>{task.compliance.docsRequired}</div>}
          </div>
        ) : (
          <div style={{fontSize:12,color:'var(--slate)',padding:'8px 0'}}>No compliance documents for this task.</div>
        )}
      </div>

      <div style={{border:'1px dashed var(--line)',borderRadius:8,padding:20,textAlign:'center',cursor:'pointer',transition:'border-color 150ms'}}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line)'}
        onClick={() => onAction('upload', 'Opening file upload…')}
      >
        <div style={{fontSize:13,color:'var(--slate)'}}>📎 Click to attach files</div>
      </div>
    </>
  );
}
