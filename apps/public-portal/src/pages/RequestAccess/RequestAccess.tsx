// apps/public-portal/src/pages/RequestAccess/RequestAccess.tsx
import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './RequestAccess.css';

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ARROW_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CHECK_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const SUCCESS_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
);

const INTENT_OPTIONS = ['1–3 properties', '4–20 properties', '20+ properties'];
const PORTFOLIO_OPTIONS = ['1–3', '4–20', '21–99', '100+'];
const PORTFOLIO_TYPES = ['STR only', 'Mixed (STR + LTR)'];
const OPS_METHODS = ['Manual', 'Tools', 'Hybrid'];
const CHALLENGES = [
  'Vendor coordination',
  'Missed tasks / SLAs',
  'Emergency handling',
  'Compliance tracking',
  'Visibility across properties',
];

const INTENT_TO_PORTFOLIO: Record<string, string> = {
  '1–3 properties': '1–3',
  '4–20 properties': '4–20',
  '20+ properties': '21–99',
};

type FormData = {
  intentSize: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  portfolioSize: string;
  markets: string[];
  propertyType: string;
  opsMethod: string;
  challenges: string[];
};

const EMPTY: FormData = {
  intentSize: '',
  name: '', email: '', company: '', phone: '',
  portfolioSize: '',
  markets: [],
  propertyType: 'STR only',
  opsMethod: '',
  challenges: [],
};

export default function RequestAccess() {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<{ name?: boolean; email?: boolean; markets?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const [tagDraft, setTagDraft] = useState('');

  /* Scroll to top on step change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  /* ── Tag helpers ── */
  const addTag = (val: string) => {
    const v = val.trim();
    if (!v || data.markets.includes(v)) return;
    setData((d) => ({ ...d, markets: [...d.markets, v] }));
  };
  const removeTag = (idx: number) => {
    setData((d) => ({ ...d, markets: d.markets.filter((_, i) => i !== idx) }));
  };
  const commitTagDraft = () => {
    if (tagDraft.trim()) {
      addTag(tagDraft);
      setTagDraft('');
    }
  };
  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTagDraft();
    } else if (e.key === 'Backspace' && !tagDraft && data.markets.length > 0) {
      removeTag(data.markets.length - 1);
    }
  };

  /* ── Validation ── */
  const validateStep = (n: number): boolean => {
    if (n === 1) {
      if (!data.intentSize) { showToast('Please select your portfolio size.'); return false; }
      return true;
    }
    if (n === 2) {
      const next: { name?: boolean; email?: boolean } = {};
      if (!data.name.trim()) next.name = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) next.email = true;
      if (Object.keys(next).length) {
        setErrors(next);
        return false;
      }
      setErrors({});
      return true;
    }
    if (n === 3) {
      // Commit any pending tag first
      const pending = tagDraft.trim();
      const markets = pending && !data.markets.includes(pending)
        ? [...data.markets, pending]
        : data.markets;
      if (pending) {
        setData((d) => ({ ...d, markets }));
        setTagDraft('');
      }
      if (markets.length === 0) {
        setErrors({ markets: true });
        return false;
      }
      setErrors({});
      return true;
    }
    if (n === 4) {
      if (!data.opsMethod) { showToast('Please select your current setup.'); return false; }
      if (data.challenges.length === 0) { showToast('Please select at least one challenge.'); return false; }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;

    if (step === 1 && !data.portfolioSize) {
      // Pre-fill portfolio size from intent
      const mapped = INTENT_TO_PORTFOLIO[data.intentSize] || '1–3';
      setData((d) => ({ ...d, portfolioSize: mapped }));
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 800);
  };

  const toggleChallenge = (val: string) => {
    setData((d) => {
      const has = d.challenges.includes(val);
      if (has) return { ...d, challenges: d.challenges.filter((c) => c !== val) };
      if (d.challenges.length >= 2) {
        showToast('Pick up to 2 challenges.');
        return d;
      }
      return { ...d, challenges: [...d.challenges, val] };
    });
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="ra-page">
        <div className="page-wrap">
          <div className="success-screen active">
            <div className="success-icon-wrap">{SUCCESS_SVG}</div>
            <h2 className="success-title">Request received</h2>
            <p className="success-sub">
              We review every request to maintain system quality.
              <br />
              You'll hear from us within 1 business day.
            </p>

            <div className="success-card">
              <div className="success-card-label">What happens next</div>
              <div className="success-steps">
                <div className="success-step">
                  <div className="success-step-num">1</div>
                  <div className="success-step-text">We review your request</div>
                </div>
                <div className="success-step">
                  <div className="success-step-num">2</div>
                  <div className="success-step-text">If approved, you'll receive access instructions by email</div>
                </div>
                <div className="success-step">
                  <div className="success-step-num">3</div>
                  <div className="success-step-text">We may follow up with a brief question before activating</div>
                </div>
              </div>
            </div>

            <p className="success-check">Check your email for confirmation.</p>

            <Link to="/" className="success-back">
              {ARROW_LEFT}
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ra-page">
      <div className="page-wrap">
        {/* ── TOP BAR ── */}
        <div className="top-bar">
          <Link to="/" className="top-logo">
            <div className="logo-mark" />
            <span>Lookara</span>
          </Link>
          <button
            type="button"
            className={`back-btn ${step === 1 ? 'hidden' : ''}`}
            onClick={goPrev}
          >
            {ARROW_LEFT}
            Back
          </button>
        </div>

        {/* ── PROGRESS ── */}
        <div className="progress-wrap">
          <div className="progress-meta">
            <span className="progress-count">Step {step} of 5</span>
          </div>
          <div className="progress-dots">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`pdot ${i <= step ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        {/* ══════════ STEP 1 ══════════ */}
        {step === 1 && (
          <div className="card">
            <h1 className="step-title">Request Access</h1>
            <p className="step-sub">For Property Managers. Built for operators managing real portfolios.</p>
            <div className="filter-note">Not designed for casual hosting.</div>

            <div className="form-section-label">I manage</div>
            <div className="radio-group">
              {INTENT_OPTIONS.map(opt => (
                <label
                  key={opt}
                  className={`radio-option ${data.intentSize === opt ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="intent-size"
                    value={opt}
                    checked={data.intentSize === opt}
                    onChange={() => setData((d) => ({ ...d, intentSize: opt }))}
                  />
                  <div className="radio-dot" />
                  <span className="radio-label">{opt}</span>
                </label>
              ))}
            </div>

            <button type="button" className="btn-primary" onClick={goNext}>
              Continue {ARROW_RIGHT}
            </button>
          </div>
        )}

        {/* ══════════ STEP 2 ══════════ */}
        {step === 2 && (
          <div className="card">
            <h2 className="step-title">About you</h2>
            <p className="step-sub">Basic details to process your request.</p>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={data.name}
                  onChange={(e) => {
                    setData((d) => ({ ...d, name: e.target.value }));
                    if (errors.name) setErrors((x) => ({ ...x, name: false }));
                  }}
                />
                {errors.name && <span className="field-error">Full Name is required</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Work Email <span className="req">*</span></label>
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={data.email}
                  onChange={(e) => {
                    setData((d) => ({ ...d, email: e.target.value }));
                    if (errors.email) setErrors((x) => ({ ...x, email: false }));
                  }}
                />
                {errors.email && <span className="field-error">Enter a valid work email</span>}
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Company Name <span className="opt">(optional)</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={data.company}
                  onChange={(e) => setData((d) => ({ ...d, company: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone <span className="opt">(optional)</span></label>
                <input
                  type="tel"
                  className="form-input"
                  value={data.phone}
                  onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                />
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={goNext}>
              Continue {ARROW_RIGHT}
            </button>
          </div>
        )}

        {/* ══════════ STEP 3 ══════════ */}
        {step === 3 && (
          <div className="card">
            <h2 className="step-title">Your portfolio</h2>
            <p className="step-sub">High-level only. No detailed data required.</p>

            <div className="form-section-label">Active properties</div>
            <div className="prefill-display">
              {data.portfolioSize ? `${data.portfolioSize} properties` : '—'}
            </div>
            <div className="radio-group" style={{ marginTop: '0.625rem' }}>
              {PORTFOLIO_OPTIONS.map(opt => (
                <label
                  key={opt}
                  className={`radio-option ${data.portfolioSize === opt ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="portfolio-size"
                    value={opt}
                    checked={data.portfolioSize === opt}
                    onChange={() => setData((d) => ({ ...d, portfolioSize: opt }))}
                  />
                  <div className="radio-dot" />
                  <span className="radio-label">
                    {opt === '1–3' ? '1–3 properties' :
                     opt === '4–20' ? '4–20 properties' :
                     opt === '21–99' ? '21–99 properties' :
                     '100+ properties'}
                  </span>
                </label>
              ))}
            </div>

            <div className="form-section-label" style={{ marginTop: '1.75rem' }}>
              Primary markets <span className="req">*</span>
            </div>
            <div
              className={`tag-input-wrap ${errors.markets ? 'error' : ''}`}
              onClick={() => tagInputRef.current?.focus()}
            >
              {data.markets.map((t, i) => (
                <span key={t} className="tag">
                  {t}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                  >×</button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                className="tag-input"
                placeholder={data.markets.length ? '' : 'Add city, e.g. Orlando FL'}
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={onTagKey}
                onBlur={commitTagDraft}
                autoComplete="off"
              />
            </div>
            {errors.markets && <span className="field-error">Add at least one market</span>}

            <div className="form-section-label">Property type</div>
            <div className="radio-group">
              {PORTFOLIO_TYPES.map(opt => (
                <label
                  key={opt}
                  className={`radio-option ${data.propertyType === opt ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="portfolio-type"
                    value={opt}
                    checked={data.propertyType === opt}
                    onChange={() => setData((d) => ({ ...d, propertyType: opt }))}
                  />
                  <div className="radio-dot" />
                  <span className="radio-label">{opt}</span>
                </label>
              ))}
            </div>

            <button type="button" className="btn-primary" onClick={goNext}>
              Continue {ARROW_RIGHT}
            </button>
          </div>
        )}

        {/* ══════════ STEP 4 ══════════ */}
        {step === 4 && (
          <div className="card">
            <h2 className="step-title">How you operate</h2>
            <p className="step-sub">Helps us prioritize your onboarding.</p>

            <div className="form-section-label">Current setup</div>
            <div className="radio-group">
              {OPS_METHODS.map(opt => (
                <label
                  key={opt}
                  className={`radio-option ${data.opsMethod === opt ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="ops-method"
                    value={opt}
                    checked={data.opsMethod === opt}
                    onChange={() => setData((d) => ({ ...d, opsMethod: opt }))}
                  />
                  <div className="radio-dot" />
                  <span className="radio-label">{opt}</span>
                </label>
              ))}
            </div>

            <div className="form-section-label" style={{ marginTop: '1.75rem' }}>
              Biggest challenges{' '}
              <span className="sublabel">— select up to 2</span>
            </div>
            <div className="checkbox-group">
              {CHALLENGES.map(opt => {
                const selected = data.challenges.includes(opt);
                return (
                  <label
                    key={opt}
                    className={`checkbox-option ${selected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleChallenge(opt)}
                    />
                    <div className="checkbox-box">{CHECK_SVG}</div>
                    <span className="checkbox-label">{opt}</span>
                  </label>
                );
              })}
            </div>

            <button type="button" className="btn-primary" onClick={goNext}>
              Continue {ARROW_RIGHT}
            </button>
          </div>
        )}

        {/* ══════════ STEP 5 ══════════ */}
        {step === 5 && (
          <form className="card" onSubmit={submit} noValidate>
            <h2 className="step-title">Review your request</h2>
            <p className="step-sub">
              Check everything before submitting. Your request will be reviewed within 1 business day.
            </p>

            <div className="review-group">
              <div className="review-group-header">
                <div className="review-group-label">Identity</div>
                <button type="button" className="review-edit" onClick={() => setStep(2)}>Edit →</button>
              </div>
              <div className="review-rows">
                <ReviewRow k="Name" v={data.name || '—'} />
                <ReviewRow k="Email" v={data.email || '—'} />
                <ReviewRow k="Company" v={data.company || '—'} />
              </div>
            </div>

            <div className="review-group">
              <div className="review-group-header">
                <div className="review-group-label">Portfolio</div>
                <button type="button" className="review-edit" onClick={() => setStep(3)}>Edit →</button>
              </div>
              <div className="review-rows">
                <ReviewRow k="Size" v={`${data.portfolioSize} properties`} />
                <ReviewRow k="Markets" v={data.markets.length ? data.markets.join(', ') : '—'} />
                <ReviewRow k="Type" v={data.propertyType} />
              </div>
            </div>

            <div className="review-group">
              <div className="review-group-header">
                <div className="review-group-label">Operations</div>
                <button type="button" className="review-edit" onClick={() => setStep(4)}>Edit →</button>
              </div>
              <div className="review-rows">
                <ReviewRow k="Current setup" v={data.opsMethod || '—'} />
                <ReviewRow k="Challenges" v={data.challenges.length ? data.challenges.join(', ') : '—'} />
              </div>
            </div>

            <p className="submit-note">
              By submitting, you agree to be contacted about your request.
            </p>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : (<>Submit Request {ARROW_RIGHT}</>)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="review-row">
      <div className="review-key">{k}</div>
      <div className="review-val">{v}</div>
    </div>
  );
}