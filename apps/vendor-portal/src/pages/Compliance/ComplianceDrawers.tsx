// apps/vendor-portal/src/pages/Compliance/ComplianceDrawers.tsx
import { useEffect, useState } from 'react';
import type { Doc } from './Compliance';
import './ComplianceDrawers.css';

type Toast = (msg: string, tone?: 'info' | 'success' | 'danger' | 'warn' | 'emg') => void;

interface CommonProps {
  doc: Doc;
  onClose: () => void;
  onUpdate: (updated: Doc) => void;
  showToast: Toast;
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SHELL
═══════════════════════════════════════════════════════════════ */
function DrawerShell({
  onClose, header, children, footer,
}: {
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <div className="drawer open">
        <div className="drawer-hdr">{header}</div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-foot">{footer}</div>
      </div>
    </>
  );
}

function DrawerHeaderBlock({
  title, subtitle, subtitleColor, onClose,
}: { title: string; subtitle: string; subtitleColor: string; onClose: () => void }) {
  return (
    <>
      <div>
        <div className="dh-title">{title}</div>
        <div className="dh-sub" style={{ color: subtitleColor }}>{subtitle}</div>
      </div>
      <button className="dh-close" onClick={onClose}>✕</button>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   W-9 DRAWER — money-unlock flow
═══════════════════════════════════════════════════════════════ */
export function W9Drawer({ doc, onClose, onUpdate, showToast }: CommonProps) {
  const [hasUpload, setHasUpload] = useState(false);

  useEffect(() => { setHasUpload(false); }, [doc.id]);

  const handleDownload = () => {
    /* Public asset — place the W-9 .docx at public/W9-Lookara.docx */
    const a = document.createElement('a');
    a.href = '/W9-Lookara.docx';
    a.download = 'W9-Lookara.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('W-9 form downloaded · Complete and upload below', 'success');
  };

  const handleSimUpload = () => setHasUpload(true);

  const handleSubmit = () => {
    if (!hasUpload) { showToast('Please attach your completed W-9 first', 'danger'); return; }
    const updated: Doc = {
      ...doc,
      status: 'pending_admin_review',
      issued: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    onUpdate(updated);
    onClose();
    showToast('W-9 submitted — payouts over $600 unlocked pending review', 'success');
  };

  return (
    <DrawerShell
      onClose={onClose}
      header={
        <DrawerHeaderBlock
          title="📄 W-9 Tax Form"
          subtitle="Required for payouts over $600"
          subtitleColor="var(--gold)"
          onClose={onClose}
        />
      }
      footer={
        <div className="w9-footer">
          <button
            className={`btn-prim w9-cta ${hasUpload ? 'ready' : ''}`}
            onClick={handleSubmit}
          >
            Submit to unlock payouts →
          </button>
          <button className="w9-cancel" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      {/* Impact block */}
      <div className="w9-impact">
        <div className="w9-impact__title">💰 Payouts over $600 will be held until submitted</div>
        <div className="w9-impact__sub">👁 Lower visibility in vendor pool</div>
      </div>

      {/* 3-step block */}
      <div className="ds-block">
        <div className="ds-block-title">Complete in 3 steps</div>

        <div className="ds-row ds-row--step">
          <div className="w9-step-num">1</div>
          <div className="w9-step-body">
            <div className="w9-step-title">Download W-9</div>
            <div className="w9-step-sub">Pre-filled — just review &amp; sign</div>
          </div>
          <button className="w9-step-download" onClick={handleDownload}>Download</button>
        </div>

        <div className="ds-row ds-row--step">
          <div className="w9-step-num">2</div>
          <div className="w9-step-body">
            <div className="w9-step-title">Fill &amp; sign</div>
            <div className="w9-step-sub">Fill all fields · sign at bottom</div>
          </div>
        </div>

        <div className="ds-row ds-row--step" style={{ borderBottom: 'none' }}>
          <div className={`w9-step-num ${hasUpload ? 'done' : ''}`}>{hasUpload ? '✓' : '3'}</div>
          <div className="w9-step-body">
            <div className="w9-step-title">Upload here</div>
            <div className="w9-step-sub">PDF, JPG, PNG · Max 10MB</div>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <button
        className={`upload-zone ${hasUpload ? 'done' : ''}`}
        onClick={handleSimUpload}
      >
        {hasUpload ? (
          <>
            <div className="upload-zone__icon">✅</div>
            <div className="upload-zone__title done">W-9 attached</div>
            <div className="upload-zone__hint">Click to replace</div>
          </>
        ) : (
          <>
            <div className="upload-zone__icon">📎</div>
            <div className="upload-zone__title">Attach completed W-9</div>
            <div className="upload-zone__hint">Secure upload · accepted instantly · one-time only</div>
          </>
        )}
      </button>
    </DrawerShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COI DRAWER — 5-stage extraction flow
═══════════════════════════════════════════════════════════════ */
type COIStage = 'upload' | 'extracting' | 'confirm' | 'editing' | 'submitted';

interface COIData {
  issuer: string;
  issued: string;
  expires: string;
  reference: string;
  coverage: string;
  confidence: number;
}

export function COIDrawer({ doc, onClose, onUpdate, showToast }: CommonProps) {
  const [stage, setStage] = useState<COIStage>('upload');
  const [extracted, setExtracted] = useState<COIData | null>(null);
  const [edited, setEdited] = useState<COIData | null>(null);

  useEffect(() => {
    setStage('upload');
    setExtracted(null);
    setEdited(null);
  }, [doc.id]);

  /* Auto-advance extracting → confirm after short delay */
  useEffect(() => {
    if (stage !== 'extracting') return;
    const t = window.setTimeout(() => {
      setExtracted({
        issuer: 'Progressive Commercial',
        issued: 'Apr 1, 2025',
        expires: 'Apr 1, 2027',
        reference: 'COI-PROG-2025-99341',
        coverage: 'General liability $1M · Auto included',
        confidence: 94,
      });
      setStage('confirm');
    }, 1800);
    return () => window.clearTimeout(t);
  }, [stage]);

  const handleUpload = () => {
    setStage('extracting');
  };

  const handleConfirm = () => {
    setEdited(extracted);
    submit(extracted!);
  };

  const handleEdit = () => setStage('editing');

  const handleSaveEdits = (values: COIData) => {
    setEdited(values);
    submit(values);
  };

  const submit = (values: COIData) => {
    const updated: Doc = {
      ...doc,
      status: 'pending_admin_review',
      issuer: values.issuer,
      issued: values.issued,
      expires: values.expires,
      daysLeft: 365,
      fileRef: values.reference,
      notes: values.coverage,
      rejectionReason: null,
      rejectedAt: null,
    };
    onUpdate(updated);
    setStage('submitted');
    showToast('COI submitted — pending admin review', 'success');
  };

  const subLine = doc.status === 'expiring'
    ? `Expires ${doc.expires} · ${doc.daysLeft} days left`
    : doc.status === 'failed'
    ? `Failed review · re-upload required`
    : `Valid · Expires ${doc.expires}`;
  const subColor = doc.status === 'expiring' ? 'var(--amber)'
    : doc.status === 'failed' ? 'var(--crimson)' : 'var(--emerald)';

  return (
    <DrawerShell
      onClose={onClose}
      header={
        <DrawerHeaderBlock
          title="🛡 Renew Certificate of Insurance"
          subtitle={subLine}
          subtitleColor={subColor}
          onClose={onClose}
        />
      }
      footer={
        stage === 'upload'     ? <button className="btn-sec" onClick={onClose}>Cancel</button> :
        stage === 'extracting' ? null :
        stage === 'confirm'    ? (
          <>
            <button className="btn-prim" style={{ flex: 2 }} onClick={handleConfirm}>✓ Confirm — looks correct</button>
            <button className="btn-sec" onClick={handleEdit}>✎ Edit</button>
          </>
        ) :
        stage === 'editing'    ? (
          <EditFooter
            extracted={extracted!}
            onSave={handleSaveEdits}
            onBack={() => setStage('confirm')}
          />
        ) :
        /* submitted */ (
          <button className="btn-sec" style={{ flex: 2 }} onClick={onClose}>Done</button>
        )
      }
    >
      {stage === 'upload' && <COIUploadStage doc={doc} onUpload={handleUpload} />}
      {stage === 'extracting' && <COIExtractingStage />}
      {stage === 'confirm' && extracted && <COIConfirmStage data={extracted} />}
      {stage === 'editing' && extracted && <COIEditingStage data={extracted} />}
      {stage === 'submitted' && edited && <COISubmittedStage data={edited} />}
    </DrawerShell>
  );
}

function COIUploadStage({ doc, onUpload }: { doc: Doc; onUpload: () => void }) {
  return (
    <>
      {doc.status === 'expiring' && doc.impact && (
        <div className="coi-impact amber">
          <div className="coi-impact__title">🚫 {doc.impact}</div>
          <div className="coi-impact__sub">(affects income immediately)</div>
        </div>
      )}
      {doc.status === 'failed' && doc.rejectionReason && (
        <div className="coi-impact crimson">
          <div className="coi-impact__title">⛔ Failed admin review</div>
          <div className="coi-impact__sub">{doc.rejectionReason}</div>
        </div>
      )}

      <div className="coi-stage-lbl">Step 1 of 3 — Upload</div>
      <button className="upload-zone" onClick={onUpload}>
        <div className="upload-zone__icon">📎</div>
        <div className="upload-zone__title">Upload renewed COI</div>
        <div className="upload-zone__hint">PDF, JPG, PNG · Max 10MB</div>
        <div className="upload-zone__hint">Usually provided by your insurer</div>
      </button>
    </>
  );
}

function COIExtractingStage() {
  return (
    <div className="coi-extracting">
      <div className="coi-spinner">⚙</div>
      <div className="coi-extracting__title">Reading document…</div>
      <div className="coi-extracting__sub">Detecting key details automatically</div>
    </div>
  );
}

function COIConfirmStage({ data }: { data: COIData }) {
  return (
    <>
      <div className="coi-stage-lbl">Step 2 of 3 — Review detected details</div>
      <div className="ds-block">
        <div className="coi-confirm-hdr">
          <div className="coi-confirm-hdr__lbl">Document Details — Auto-detected</div>
          <div className="coi-confirm-hdr__conf">✦ {data.confidence}% confidence</div>
        </div>
        <div className="ds-row"><span className="ds-lbl">Issuer</span><span className="ds-val">{data.issuer}</span></div>
        <div className="ds-row"><span className="ds-lbl">Issue Date</span><span className="ds-val">{data.issued}</span></div>
        <div className="ds-row"><span className="ds-lbl">Expiry</span><span className="ds-val" style={{ color: 'var(--emerald)', fontWeight: 700 }}>{data.expires}</span></div>
        <div className="ds-row"><span className="ds-lbl">Reference</span><span className="ds-val">{data.reference}</span></div>
        <div className="ds-row" style={{ borderBottom: 'none' }}><span className="ds-lbl">Coverage</span><span className="ds-val">{data.coverage}</span></div>
      </div>
      <div className="coi-hint">Confirm if correct, or edit any field before submitting</div>
    </>
  );
}

function COIEditingStage({ data }: { data: COIData }) {
  const [values, setValues] = useState<COIData>(data);
  return (
    <>
      <div className="coi-stage-lbl">Step 2 of 3 — Edit details</div>
      <div className="coi-edit-fields">
        <div><div className="field-label">Issuer</div>
          <input className="field-input" value={values.issuer}
            onChange={(e) => setValues({ ...values, issuer: e.target.value })} /></div>
        <div><div className="field-label">Issue Date</div>
          <input className="field-input" value={values.issued}
            onChange={(e) => setValues({ ...values, issued: e.target.value })} /></div>
        <div><div className="field-label">Expiry Date</div>
          <input className="field-input" value={values.expires}
            onChange={(e) => setValues({ ...values, expires: e.target.value })} /></div>
        <div><div className="field-label">Reference / Policy #</div>
          <input className="field-input" value={values.reference}
            onChange={(e) => setValues({ ...values, reference: e.target.value })} /></div>
        <div><div className="field-label">Coverage</div>
          <input className="field-input" value={values.coverage}
            onChange={(e) => setValues({ ...values, coverage: e.target.value })} /></div>
      </div>
      {/* Keep latest values on the parent for footer submit */}
      <input type="hidden" id="__coi_edit__"
             value={JSON.stringify(values)} />
    </>
  );
}

const _coiEditBuffer: { current: COIData | null } = { current: null };
void _coiEditBuffer;

function EditFooter({
  extracted, onSave, onBack,
}: {
  extracted: COIData;
  onSave: (v: COIData) => void;
  onBack: () => void;
}) {
  const handleSave = () => {
    const el = document.getElementById('__coi_edit__') as HTMLInputElement | null;
    if (el) {
      try {
        const parsed = JSON.parse(el.value) as COIData;
        onSave(parsed);
        return;
      } catch { /* fall through */ }
    }
    onSave(extracted);
  };
  return (
    <>
      <button className="btn-prim" style={{ flex: 2 }} onClick={handleSave}>Save &amp; Continue →</button>
      <button className="btn-sec" onClick={onBack}>Back</button>
    </>
  );
}

function COISubmittedStage({ data }: { data: COIData }) {
  return (
    <>
      <div className="coi-submitted">
        <div className="coi-submitted__icon">✓</div>
        <div className="coi-submitted__title">Submitted — pending admin approval</div>
        <div className="coi-submitted__sub">
          Current coverage stays active during review · Avg review time: ~24 hours
        </div>
      </div>
      <div className="ds-block">
        <div className="ds-block-title">Submitted Details</div>
        <div className="ds-row"><span className="ds-lbl">Issuer</span><span className="ds-val">{data.issuer}</span></div>
        <div className="ds-row"><span className="ds-lbl">Expiry</span><span className="ds-val">{data.expires}</span></div>
        <div className="ds-row" style={{ borderBottom: 'none' }}><span className="ds-lbl">Reference</span><span className="ds-val">{data.reference}</span></div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GENERIC DOC DRAWER — for anything that isn't COI or W-9
═══════════════════════════════════════════════════════════════ */
export function GenericDocDrawer({ doc, onClose, onUpdate, showToast }: CommonProps) {
  const [hasUpload, setHasUpload] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    setHasUpload(false);
    setDetailsOpen(false);
  }, [doc.id]);

  const isAction = doc.status === 'failed' || doc.status === 'expiring' || doc.status === 'missing';

  const subLine =
    doc.status === 'failed'  ? `Failed review · re-upload required` :
    doc.status === 'expiring' ? `Expires ${doc.expires} · ${doc.daysLeft} days left` :
    doc.status === 'missing' ? 'Not yet uploaded — required' :
    `Valid · Expires ${doc.expires}`;
  const subColor =
    doc.status === 'failed' ? 'var(--crimson)' :
    doc.status === 'expiring' ? 'var(--amber)' :
    doc.status === 'missing' ? 'var(--slate)' : 'var(--emerald)';

  const handleSubmit = () => {
    if (!hasUpload) { showToast('Please attach a file first', 'danger'); return; }
    const updated: Doc = {
      ...doc,
      status: 'pending_admin_review',
      issued: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    onUpdate(updated);
    onClose();
    showToast(`${doc.name.replace(' (COI)', '').replace(' (CPO)', '')} submitted — pending admin review`, 'success');
  };

  return (
    <DrawerShell
      onClose={onClose}
      header={
        <DrawerHeaderBlock
          title={`${doc.icon} ${doc.name.replace(' (COI)', '').replace(' (CPO)', '')}`}
          subtitle={subLine}
          subtitleColor={subColor}
          onClose={onClose}
        />
      }
      footer={
        doc.status === 'valid'
          ? <button className="btn-sec" style={{ flex: 2 }} onClick={onClose}>Close</button>
          : (
            <div className="generic-footer">
              <button className="btn-prim" onClick={handleSubmit}>Submit renewal →</button>
              <button className="w9-cancel" onClick={onClose}>Cancel</button>
            </div>
          )
      }
    >
      {/* Impact */}
      {doc.status === 'failed' && (
        <div className="coi-impact crimson">
          <div className="coi-impact__title">⛔ Dispatch blocked — no new jobs until renewed</div>
          {doc.impact && <div className="coi-impact__sub">{doc.impact}</div>}
        </div>
      )}
      {doc.status === 'expiring' && (
        <div className="coi-impact amber">
          <div className="coi-impact__title">🚫 {doc.impact ?? 'Dispatch eligibility affected after expiry'}</div>
          <div className="coi-impact__sub">(affects income immediately)</div>
        </div>
      )}
      {doc.status === 'valid' && (
        <div className="coi-impact emerald">
          <div className="coi-impact__title" style={{ fontSize: 11, fontWeight: 500 }}>
            ✓ Valid · No action required · Fully dispatch-eligible
          </div>
          {doc.expires && <div className="coi-impact__sub">Expires {doc.expires} — we'll remind you before it expires</div>}
        </div>
      )}

      {/* Upload */}
      {isAction && (
        <>
          <button
            className={`upload-zone ${hasUpload ? 'done' : ''}`}
            onClick={() => setHasUpload(true)}
          >
            {hasUpload ? (
              <>
                <div className="upload-zone__icon">✓</div>
                <div className="upload-zone__title done">File attached</div>
                <div className="upload-zone__hint">Click to replace</div>
              </>
            ) : (
              <>
                <div className="upload-zone__icon">📎</div>
                <div className="upload-zone__title">
                  {doc.status === 'missing' ? `Upload ${doc.name}` : `Upload renewed ${doc.name.replace(' (COI)', '').replace(' (CPO)', '')}`}
                </div>
                <div className="upload-zone__hint">Secure upload · accepted instantly</div>
                <div className="upload-zone__hint">PDF, JPG, PNG · Max 10MB</div>
              </>
            )}
          </button>
          <div>
            <div className="field-label">Effective date</div>
            <input className="field-input" type="date" />
          </div>
        </>
      )}

      {/* Details toggle */}
      <div>
        <button className="doc-details-toggle" onClick={() => setDetailsOpen((o) => !o)}>
          <span>View document details</span>
          <span className="doc-details-toggle__chev">{detailsOpen ? '‹' : '›'}</span>
        </button>
        {detailsOpen && (
          <div className="ds-block" style={{ borderRadius: '0 0 var(--r-sm) var(--r-sm)' }}>
            {doc.issuer  && <div className="ds-row"><span className="ds-lbl">Issuer</span><span className="ds-val">{doc.issuer}</span></div>}
            {doc.issued  && <div className="ds-row"><span className="ds-lbl">Issue date</span><span className="ds-val">{doc.issued}</span></div>}
            {doc.fileRef && <div className="ds-row"><span className="ds-lbl">Reference</span><span className="ds-val">{doc.fileRef}</span></div>}
            {doc.notes   && <div className="ds-row" style={{ borderBottom: 'none' }}><span className="ds-lbl">Notes</span><span className="ds-val" style={{ fontFamily: 'var(--font-b)', fontWeight: 500 }}>{doc.notes}</span></div>}
          </div>
        )}
      </div>
    </DrawerShell>
  );
}