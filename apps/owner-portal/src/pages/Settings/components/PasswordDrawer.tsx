// apps/owner-portal/src/pages/Settings/components/PasswordDrawer.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '../../../context/ToastContext';

interface PasswordDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'form' | 'verify';

const CODE_TTL_SECONDS = 600;

export default function PasswordDrawer({ open, onClose }: PasswordDrawerProps) {
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('form');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL_SECONDS);

  const countdownRef = useRef<number | undefined>(undefined);

  /* ── Reset on open ──────────────────────────────────────── */
  useEffect(() => {
    if (open) {
      setStep('form');
      setCurrent('');
      setNext('');
      setConfirm('');
      setErrors({});
      setCode('');
      setCodeError('');
      setSecondsLeft(CODE_TTL_SECONDS);
    } else {
      window.clearInterval(countdownRef.current);
    }
  }, [open]);

  /* ── Countdown timer (step 2) ───────────────────────────── */
  useEffect(() => {
    if (step !== 'verify' || !open) return;
    countdownRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdownRef.current);
  }, [step, open]);

  const strength = useMemo(() => computeStrength(next), [next]);
  const passwordsMatch = next.length > 0 && next === confirm;

  const handleSubmitForm = () => {
    const nextErrors: typeof errors = {};
    if (!current.trim()) nextErrors.current = 'Enter your current password';
    if (next.length < 8) nextErrors.next = 'Minimum 8 characters required';
    if (!confirm) nextErrors.confirm = 'Please confirm your new password';
    else if (next !== confirm) nextErrors.confirm = 'Passwords do not match';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStep('verify');
    setSecondsLeft(CODE_TTL_SECONDS);
  };

  const handleVerify = () => {
    if (code.length < 6) {
      setCodeError('Enter the 6-digit code from your email');
      return;
    }
    window.clearInterval(countdownRef.current);
    onClose();
    showToast('Password updated — you are still logged in on all devices', 'success');
  };

  const handleResend = () => {
    setSecondsLeft(CODE_TTL_SECONDS);
    setCodeError('');
    showToast('New code sent to your email', 'info');
  };

  return (
    <>
      <div className={`overlay${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside
        className={`pw-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Change password"
      >
        <div className="pw-hdr">
          <div>
            <div className="pw-title">Change Password</div>
            <div className="pw-subtitle">Last changed 3 months ago</div>
          </div>
          <button type="button" className="pw-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === 'form' ? (
          <>
            <div className="pw-body">
              <div className="pw-requirements">
                Password must be at least <strong>8 characters</strong> and include a{' '}
                <strong>number</strong> and <strong>special character</strong>.
              </div>

              <PasswordField
                label="Current Password"
                placeholder="Enter current password"
                value={current}
                onChange={(v) => {
                  setCurrent(v);
                  if (errors.current) setErrors((e) => ({ ...e, current: undefined }));
                }}
                error={errors.current}
                autoComplete="current-password"
              />

              <PasswordField
                label="New Password"
                placeholder="Enter new password"
                value={next}
                onChange={(v) => {
                  setNext(v);
                  if (errors.next) setErrors((e) => ({ ...e, next: undefined }));
                }}
                error={errors.next}
                autoComplete="new-password"
                strength={next ? strength : null}
              />

              <PasswordField
                label="Confirm New Password"
                placeholder="Repeat new password"
                value={confirm}
                onChange={(v) => {
                  setConfirm(v);
                  if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
                }}
                error={errors.confirm}
                autoComplete="new-password"
                matchOk={passwordsMatch}
              />
            </div>

            <div className="pw-footer">
              <button type="button" className="pw-btn-primary" onClick={handleSubmitForm}>
                Update Password
              </button>
              <button type="button" className="pw-btn-ghost" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="pw-body">
              <div className="pw-verify-header">
                <div className="pw-verify-icon">
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                    <path d="M1 4l7 5 7-5M1 4v8a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H2a1 1 0 00-1 1z" />
                  </svg>
                </div>
                <div className="pw-verify-title">Check your email</div>
                <div className="pw-verify-body">
                  We sent a 6-digit confirmation code to
                  <br />
                  <span className="pw-verify-email">marcus@example.com</span>
                </div>
              </div>

              <div className="pw-code-field">
                <label className="pw-label">Confirmation Code</label>
                <input
                  className={`pw-code-input${codeError ? ' error' : ''}`}
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCode(val);
                    if (codeError) setCodeError('');
                    if (val.length === 6) {
                      window.setTimeout(() => {
                        onClose();
                        showToast('Password updated — you are still logged in on all devices', 'success');
                      }, 200);
                    }
                  }}
                  autoFocus
                />
                <div className="pw-code-error">{codeError}</div>
              </div>

              <div className="pw-verify-hint">
                Code expires in{' '}
                <span className={secondsLeft === 0 ? 'pw-expired' : ''}>
                  {formatSeconds(secondsLeft)}
                </span>
                <br />
                Didn&apos;t get it?{' '}
                <button type="button" className="pw-resend" onClick={handleResend}>
                  Resend code
                </button>
              </div>
            </div>

            <div className="pw-footer">
              <button type="button" className="pw-btn-primary" onClick={handleVerify}>
                Confirm Change
              </button>
              <button type="button" className="pw-btn-ghost" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ── Password field with show/hide toggle ─────────────────── */

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  strength,
  matchOk,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  strength?: ReturnType<typeof computeStrength> | null;
  matchOk?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="pw-field-wrap">
      <label className="pw-label">{label}</label>
      <div className="pw-input-wrap">
        <input
          className={`pw-input${error ? ' error' : matchOk ? ' ok' : ''}`}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={`pw-toggle-vis${visible ? ' is-active' : ''}`}
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
            <circle cx="8" cy="8" r="2.5" />
          </svg>
        </button>
      </div>

      {strength && (
        <div className="pw-strength-wrap">
          <div className="pw-strength-bar">
            <div
              className="pw-strength-fill"
              style={{ width: strength.width, background: strength.color }}
            />
          </div>
          <span className="pw-strength-label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      )}

      {matchOk && (
        <div className="pw-match-ok">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 9l4 4 8-8" />
          </svg>
          Passwords match
        </div>
      )}

      <div className="pw-field-error">{error ?? ''}</div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

function computeStrength(val: string) {
  if (!val) return null;
  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^a-zA-Z0-9]/.test(val)) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;

  const levels = [
    { width: '20%', color: 'var(--danger)',  label: 'Weak' },
    { width: '40%', color: 'var(--danger)',  label: 'Weak' },
    { width: '60%', color: 'var(--warning)', label: 'Fair' },
    { width: '80%', color: 'var(--warning)', label: 'Good' },
    { width: '100%', color: 'var(--success)', label: 'Strong' },
  ];
  return levels[Math.min(score, 4)];
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
