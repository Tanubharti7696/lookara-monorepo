// apps/vendor-portal/src/pages/Compliance/W9Form.tsx
import { useEffect, useMemo, useState } from 'react';
import { useVendor } from '../../context/VendorContext';
import './W9Form.css';

/* ── TYPES ── */
type Classification = 'individual' | 'llc' | 'c-corp' | 's-corp' | 'partnership' | 'other';
type TinType = 'ssn' | 'ein';
type SubmitState = 'idle' | 'submitting' | 'submitted';

interface W9State {
  legalName: string;
  businessName: string;
  classification: Classification | null;
  classificationOther: string;
  address: string;
  cityState: string;

  tinType: TinType;
  ssn: string;
  ein: string;

  certTIN: boolean;
  certBackup: boolean;
  certUsPerson: boolean;
  certFatca: boolean;

  signature: string;
  signedDate: string;
}

const INITIAL: W9State = {
  legalName: '',
  businessName: '',
  classification: null,
  classificationOther: '',
  address: '',
  cityState: '',
  tinType: 'ssn',
  ssn: '',
  ein: '',
  certTIN: false,
  certBackup: false,
  certUsPerson: false,
  certFatca: false,
  signature: '',
  signedDate: '',
};

const DRAFT_KEY = 'lookara.vendor.w9.draft';

const CLASSIFICATIONS: { value: Classification; label: string }[] = [
  { value: 'individual',  label: 'Individual / Sole proprietor' },
  { value: 'llc',         label: 'LLC' },
  { value: 'c-corp',      label: 'C Corporation' },
  { value: 's-corp',      label: 'S Corporation' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other',       label: 'Other' },
];

/* ── FORMATTERS ── */
function formatSSN(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

function formatEIN(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 9);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}-${d.slice(2)}`;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function W9Form() {
  const { showToast, vendorName } = useVendor();
  const [form, setForm] = useState<W9State>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof W9State, string>>>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  /* Load any draft on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as W9State;
        setForm({ ...INITIAL, ...parsed });
        setSavedAt('draft restored');
      }
    } catch { /* noop */ }
  }, []);

  /* Auto-save draft every change (debounced by React's own batching) */
  useEffect(() => {
    if (submitState === 'submitted') return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch { /* noop */ }
  }, [form, submitState]);

  const set = <K extends keyof W9State>(key: K, value: W9State[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /* ── VALIDATION ── */
  const isTINValid = form.tinType === 'ssn'
    ? form.ssn.replace(/\D/g, '').length === 9
    : form.ein.replace(/\D/g, '').length === 9;

  const allCertChecked =
    form.certTIN && form.certBackup && form.certUsPerson && form.certFatca;

  const validate = (): boolean => {
    const e: Partial<Record<keyof W9State, string>> = {};
    if (!form.legalName.trim()) e.legalName = 'Required';
    if (!form.classification)   e.classification = 'Select a classification';
    if (form.classification === 'other' && !form.classificationOther.trim()) {
      e.classificationOther = 'Describe your classification';
    }
    if (!form.address.trim())   e.address = 'Required';
    if (!form.cityState.trim()) e.cityState = 'Required';
    if (!isTINValid)            e[form.tinType] = form.tinType === 'ssn'
      ? 'SSN must be 9 digits' : 'EIN must be 9 digits';
    if (!allCertChecked)        e.certTIN = 'All four certifications must be confirmed';
    if (!form.signature.trim()) e.signature = 'Type your full legal name';
    if (!form.signedDate)       e.signedDate = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      showToast('Please fix the highlighted fields', 'danger');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitState('submitting');
    /* Simulated network call — real API goes here */
    setTimeout(() => {
      setSubmitState('submitted');
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
      showToast('W-9 submitted to compliance@lookara.com', 'success');
    }, 900);
  };

  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch { /* noop */ }
    setSavedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    showToast('Draft saved — you can resume later', 'info');
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
    setSubmitState('idle');
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
  };

  /* Progress: rough count of required sections filled */
  const progress = useMemo(() => {
    const steps = [
      !!form.legalName.trim(),
      !!form.classification,
      !!form.address.trim() && !!form.cityState.trim(),
      isTINValid,
      allCertChecked,
      !!form.signature.trim() && !!form.signedDate,
    ];
    return Math.round((steps.filter(Boolean).length / steps.length) * 100);
  }, [form, isTINValid, allCertChecked]);

  /* ═════ SUCCESS STATE ═════ */
  if (submitState === 'submitted') {
    return (
      <>
        <div className="topbar">
          <div className="w9-tb-title">Form W-9</div>
          <div className="tb-dot" />
        </div>
        <div className="page w9-page">
          <div className="w9-success">
            <div className="w9-success__ring">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="4" />
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--emerald)" strokeWidth="4"
                        strokeDasharray="188" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 36 36)" />
              </svg>
              <div className="w9-success__check">✓</div>
            </div>
            <h2 className="w9-success__title">W-9 Submitted</h2>
            <p className="w9-success__text">
              Your form has been sent to <strong>compliance@lookara.com</strong>. Lookara&apos;s
              Vendor Compliance team will review and confirm within 1–2 business days.
            </p>
            <div className="w9-success__meta">
              <div className="w9-meta-cell">
                <div className="w9-meta-lbl">Submitted</div>
                <div className="w9-meta-val">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div className="w9-meta-cell">
                <div className="w9-meta-lbl">Status</div>
                <div className="w9-meta-val" style={{ color: 'var(--amber)' }}>Pending review</div>
              </div>
              <div className="w9-meta-cell">
                <div className="w9-meta-lbl">Vendor</div>
                <div className="w9-meta-val">{vendorName}</div>
              </div>
            </div>
            <div className="w9-success__actions">
              <button className="w9-btn-primary" onClick={() => { window.location.href = '/compliance'; }}>
                Back to Compliance
              </button>
              <button className="w9-btn-ghost" onClick={handleReset}>
                Submit another
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ═════ FORM ═════ */
  return (
    <>
      <div className="topbar">
        <div className="w9-tb-title">Form W-9</div>
        <div className="tb-time">Compliance</div>
        <div className="tb-dot" />
      </div>

      <div className="page w9-page">
        {/* ── HEADER ── */}
        <header className="w9-header">
          <div className="w9-header__left">
            <div className="w9-eyebrow">IRS Tax Document</div>
            <h1 className="w9-title">Form W-9</h1>
            <p className="w9-subtitle">
              Request for Taxpayer Identification Number and Certification
            </p>
          </div>
          <div className="w9-header__right">
            <div className="w9-omb">
              <div className="w9-omb__lbl">OMB No.</div>
              <div className="w9-omb__val">1545-0003</div>
            </div>
            <div className="w9-progress">
              <div className="w9-progress__head">
                <span>Completion</span>
                <span className="w9-progress__val">{progress}%</span>
              </div>
              <div className="w9-progress__track">
                <div className="w9-progress__fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </header>

        {/* ── INFO BANNER ── */}
        <div className="w9-info">
          <div className="w9-info__icon">📋</div>
          <div className="w9-info__body">
            <div className="w9-info__title">Why we collect this</div>
            <div className="w9-info__text">
              Lookara Inc. is required to collect this form from independent contractors paid
              $600 or more in a calendar year. Give the completed form to the requester —
              <strong> do not send it to the IRS.</strong>
            </div>
          </div>
        </div>

        {savedAt && (
          <div className="w9-draft-note">
            <span className="w9-draft-dot" />
            Draft auto-saved · {savedAt}
          </div>
        )}

        {/* ═══════ PART I ═══════ */}
        <section className="w9-section">
          <div className="w9-section__head">
            <div className="w9-section__num">I</div>
            <div>
              <div className="w9-section__title">Taxpayer Identification Number (TIN)</div>
              <div className="w9-section__sub">Your legal name and federal tax details</div>
            </div>
          </div>

          <div className="w9-grid-1">
            <Field
              label="1. Name"
              hint="As shown on your income tax return"
              value={form.legalName}
              onChange={(v) => set('legalName', v)}
              error={errors.legalName}
              placeholder="e.g. Marcus Reed"
            />
            <Field
              label="2. Business name / disregarded entity name"
              hint="Only if different from above"
              optional
              value={form.businessName}
              onChange={(v) => set('businessName', v)}
              placeholder="e.g. Reed Pool Services LLC"
            />
          </div>

          {/* Classification */}
          <div className="w9-field">
            <label className="w9-label">
              3. Federal tax classification
              <span className="w9-req">*</span>
            </label>
            <div className="w9-class-grid">
              {CLASSIFICATIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`w9-class-chip ${form.classification === c.value ? 'sel' : ''}`}
                  onClick={() => set('classification', c.value)}
                >
                  <span className="w9-class-dot" />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
            {errors.classification && <div className="w9-error">{errors.classification}</div>}
            {form.classification === 'other' && (
              <input
                className={`w9-input ${errors.classificationOther ? 'has-error' : ''}`}
                placeholder="Describe your classification"
                value={form.classificationOther}
                onChange={(e) => set('classificationOther', e.target.value)}
                style={{ marginTop: 10 }}
              />
            )}
          </div>

          <div className="w9-grid-1">
            <Field
              label="4. Address"
              hint="Number, street, and apt. or suite no."
              value={form.address}
              onChange={(v) => set('address', v)}
              error={errors.address}
              placeholder="1421 Sunset Blvd, Apt 3B"
            />
            <Field
              label="5. City, State, and ZIP code"
              value={form.cityState}
              onChange={(v) => set('cityState', v)}
              error={errors.cityState}
              placeholder="Orlando, FL 32801"
            />
          </div>

          {/* TIN inputs */}
          <div className="w9-field">
            <label className="w9-label">
              Taxpayer Identification Number
              <span className="w9-req">*</span>
            </label>
            <div className="w9-tin-toggle">
              <button
                type="button"
                className={`w9-tin-tab ${form.tinType === 'ssn' ? 'active' : ''}`}
                onClick={() => set('tinType', 'ssn')}
              >
                Social Security Number (SSN)
              </button>
              <button
                type="button"
                className={`w9-tin-tab ${form.tinType === 'ein' ? 'active' : ''}`}
                onClick={() => set('tinType', 'ein')}
              >
                Employer Identification Number (EIN)
              </button>
            </div>

            {form.tinType === 'ssn' ? (
              <div className="w9-tin-input-wrap">
                <input
                  className={`w9-input w9-input--mono ${errors.ssn ? 'has-error' : ''}`}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000-00-0000"
                  value={form.ssn}
                  onChange={(e) => set('ssn', formatSSN(e.target.value))}
                  maxLength={11}
                />
                <span className="w9-tin-hint">9 digits · formatted automatically</span>
              </div>
            ) : (
              <div className="w9-tin-input-wrap">
                <input
                  className={`w9-input w9-input--mono ${errors.ein ? 'has-error' : ''}`}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="00-0000000"
                  value={form.ein}
                  onChange={(e) => set('ein', formatEIN(e.target.value))}
                  maxLength={10}
                />
                <span className="w9-tin-hint">9 digits · formatted automatically</span>
              </div>
            )}
            {form.tinType === 'ssn' && errors.ssn && <div className="w9-error">{errors.ssn}</div>}
            {form.tinType === 'ein' && errors.ein && <div className="w9-error">{errors.ein}</div>}
          </div>
        </section>

        {/* ═══════ PART II ═══════ */}
        <section className="w9-section">
          <div className="w9-section__head">
            <div className="w9-section__num">II</div>
            <div>
              <div className="w9-section__title">Certification</div>
              <div className="w9-section__sub">Under penalties of perjury, I certify that:</div>
            </div>
          </div>

          <div className="w9-cert-list">
            <CertRow
              n="1"
              text="The number shown on this form is my correct taxpayer identification number."
              checked={form.certTIN}
              onChange={(v) => set('certTIN', v)}
            />
            <CertRow
              n="2"
              text="I am not subject to backup withholding."
              checked={form.certBackup}
              onChange={(v) => set('certBackup', v)}
            />
            <CertRow
              n="3"
              text="I am a U.S. citizen or other U.S. person."
              checked={form.certUsPerson}
              onChange={(v) => set('certUsPerson', v)}
            />
            <CertRow
              n="4"
              text="The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct."
              checked={form.certFatca}
              onChange={(v) => set('certFatca', v)}
            />
          </div>

          {errors.certTIN && <div className="w9-error" style={{ marginTop: 10 }}>{errors.certTIN}</div>}

          <div className="w9-grid-1" style={{ marginTop: 16 }}>
            <Field
              label="Signature of U.S. person"
              hint="Type your full legal name — acts as your electronic signature"
              value={form.signature}
              onChange={(v) => set('signature', v)}
              error={errors.signature}
              placeholder="Marcus Reed"
            />
            <div className="w9-field">
              <label className="w9-label">
                Date
                <span className="w9-req">*</span>
              </label>
              <input
                type="date"
                className={`w9-input w9-input--mono ${errors.signedDate ? 'has-error' : ''}`}
                value={form.signedDate || todayISO()}
                onChange={(e) => set('signedDate', e.target.value)}
              />
              {errors.signedDate && <div className="w9-error">{errors.signedDate}</div>}
            </div>
          </div>
        </section>

        {/* ═══════ FOOTER NOTE ═══════ */}
        <div className="w9-footer-note">
          <div className="w9-footer-note__lbl">Return to</div>
          <div className="w9-footer-note__body">
            <strong>compliance@lookara.com</strong><br />
            Lookara Inc. · Vendor Compliance Department<br />
            <span className="w9-footer-note__muted">
              Submitted forms are stored securely and used for tax reporting only.
            </span>
          </div>
        </div>
      </div>

      {/* ── STICKY ACTION BAR ── */}
      <div className="w9-actionbar">
        <button className="w9-btn-ghost" onClick={saveDraft} disabled={submitState === 'submitting'}>
          Save draft
        </button>
        <button
          className="w9-btn-primary"
          onClick={handleSubmit}
          disabled={submitState === 'submitting'}
        >
          {submitState === 'submitting' ? 'Submitting…' : 'Submit W-9'}
        </button>
      </div>
    </>
  );
}

/* ═══════════ Sub-components ═══════════ */

function Field({
  label, hint, value, onChange, error, placeholder, optional,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div className="w9-field">
      <label className="w9-label">
        {label}
        {!optional && <span className="w9-req">*</span>}
        {optional && <span className="w9-opt">optional</span>}
      </label>
      {hint && <div className="w9-hint">{hint}</div>}
      <input
        className={`w9-input ${error ? 'has-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="w9-error">{error}</div>}
    </div>
  );
}

function CertRow({
  n, text, checked, onChange,
}: {
  n: string;
  text: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`w9-cert ${checked ? 'checked' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`w9-cert__box ${checked ? 'on' : ''}`}>
        {checked && (
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M2 9l4 4 8-8" />
          </svg>
        )}
      </span>
      <span className="w9-cert__num">{n}</span>
      <span className="w9-cert__text">{text}</span>
    </button>
  );
}