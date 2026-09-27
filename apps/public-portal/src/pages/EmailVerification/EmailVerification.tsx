// apps/public-portal/src/pages/EmailVerification/EmailVerification.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './EmailVerification.css';

type Screen =
  | 'waiting' | 'verified' | 'invalid' | 'expired'
  | 'already-verified' | 'not-found' | 'resent';

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const MAIL_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const SEND_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const CONFIG = {
  email: 'david@example.com',
  countdownSeconds: 60,
};

export default function EmailVerification() {
  const { showToast } = useToast();
  const [params] = useSearchParams();

  const [screen, setScreen] = useState<Screen>('waiting');
  const [secondsLeft, setSecondsLeft] = useState(CONFIG.countdownSeconds);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [sending, setSending] = useState(false);
  const timerRef = useRef<number | null>(null);

  /* ── Start countdown ── */
  const startCountdown = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setResendDisabled(true);
    setSecondsLeft(CONFIG.countdownSeconds);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setResendDisabled(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  /* ── Detect state from URL ── */
  useEffect(() => {
    const state = params.get('state');
    const token = params.get('token');

    if (state) {
      const map: Record<string, Screen> = {
        verified: 'verified',
        invalid: 'invalid',
        expired: 'expired',
        'already-verified': 'already-verified',
        'not-found': 'not-found',
      };
      if (map[state]) {
        setScreen(map[state]);
        return;
      }
    }

    if (token) {
      // Preview: pretend any token is valid after a short delay
      const t = setTimeout(() => setScreen('verified'), 800);
      return () => clearTimeout(t);
    }

    // Default: waiting
    setScreen('waiting');
    startCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const resend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setScreen('resent');
    }, 700);
  };

  const requestNewLink = () => {
    showToast('Sending new verification email…');
    setTimeout(() => {
      setScreen('resent');
      startCountdown();
    }, 800);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="ev-page">
      <div className="ev-logo-wrap">
        <div className="ev-logo-mark" />
        <span>Lookara</span>
      </div>
      <div className="ev-logo-sub">Operational OS</div>

      {/* ══════ WAITING ══════ */}
      {screen === 'waiting' && (
        <div className="ev-screen">
          <div className="ev-card ev-card--gold">
            <div className="ev-icon-circle ev-icon-circle--gold">{MAIL_ICON}</div>
            <h1 className="ev-card-title">Verify your email</h1>
            <p className="ev-card-sub">We've sent a verification email to</p>
            <div className="ev-email-label">Email Address</div>
            <div className="ev-email-display">{CONFIG.email}</div>
            <p className="ev-card-sub" style={{ marginBottom: 0 }}>
              We've sent a verification link to your email address. Click the link to activate
              your Lookara account. For your security, the link expires after 24 hours.
            </p>

            <div className="ev-divider" />

            <div className="ev-status-row">
              <div className="ev-spinner" />
              We're waiting for you to verify your email.
            </div>

            <a href="mailto:" className="ev-btn-primary" style={{ textDecoration: 'none' }}>
              {MAIL_ICON}
              Open Email App
            </a>

            <Link to="/request-access" className="ev-btn-text">
              Use another email →
            </Link>

            <div className="ev-divider" />

            <p className="ev-resend-hint">Didn't receive the email?</p>
            <button
              className="ev-btn-secondary"
              disabled={resendDisabled || sending}
              onClick={resend}
            >
              {MAIL_ICON}
              {sending ? 'Sending…' : 'Resend verification email'}
            </button>
            {resendDisabled && secondsLeft > 0 && (
              <div className="ev-countdown">Resend available in {mm}:{ss}</div>
            )}
            <p className="ev-spam-hint">
              Check your spam or junk folder if you don't see the email within a few minutes.
            </p>
          </div>
        </div>
      )}

      {/* ══════ VERIFIED ══════ */}
      {screen === 'verified' && (
        <div className="ev-screen">
          <div className="ev-card ev-card--green">
            <div className="ev-icon-circle ev-icon-circle--green">{CHECK_ICON}</div>
            <h2 className="ev-card-title">Email verified</h2>
            <p className="ev-card-sub">
              Your account has been successfully verified. You may now continue into Lookara.
            </p>
            <Link
              to="/onboarding"
              className="ev-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              Continue {ARROW_RIGHT}
            </Link>
          </div>
        </div>
      )}

      {/* ══════ INVALID ══════ */}
      {screen === 'invalid' && (
        <div className="ev-screen">
          <div className="ev-card ev-card--red">
            <div className="ev-icon-circle ev-icon-circle--red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="ev-card-title">Verification link invalid</h2>
            <p className="ev-card-sub">
              This link is not recognized. It may have been copied incorrectly or is no longer valid.
            </p>
            <button className="ev-btn-primary" onClick={requestNewLink}>
              {MAIL_ICON}
              Resend Email
            </button>
            <a href="mailto:support@lookara.com" className="ev-btn-text">
              Contact support →
            </a>
          </div>
        </div>
      )}

      {/* ══════ EXPIRED ══════ */}
      {screen === 'expired' && (
        <div className="ev-screen">
          <div className="ev-card ev-card--amber">
            <div className="ev-icon-circle ev-icon-circle--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <h2 className="ev-card-title">Verification link expired</h2>
            <p className="ev-card-sub">
              Verification links expire after 24 hours. Request a new one and check your email.
            </p>
            <button className="ev-btn-primary" onClick={requestNewLink}>
              {MAIL_ICON}
              Send new verification email
            </button>
          </div>
        </div>
      )}

      {/* ══════ ALREADY VERIFIED ══════ */}
      {screen === 'already-verified' && (
        <div className="ev-screen">
          <div className="ev-card ev-card--indigo">
            <div className="ev-icon-circle ev-icon-circle--indigo">{CHECK_ICON}</div>
            <h2 className="ev-card-title">Already Verified</h2>
            <p className="ev-card-sub">
              Your email has already been verified. You can sign in to your account.
            </p>
            <Link to="/login" className="ev-btn-primary" style={{ textDecoration: 'none' }}>
              Continue to sign in {ARROW_RIGHT}
            </Link>
          </div>
        </div>
      )}

      {/* ══════ NOT FOUND ══════ */}
      {screen === 'not-found' && (
        <div className="ev-screen">
          <div className="ev-card ev-card--red">
            <div className="ev-icon-circle ev-icon-circle--red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="ev-card-title">Account not found</h2>
            <p className="ev-card-sub">
              This verification request could not be matched to an account. It may have been
              deleted or the link is incorrect.
            </p>
            <Link to="/request-access" className="ev-btn-primary" style={{ textDecoration: 'none' }}>
              Register again {ARROW_RIGHT}
            </Link>
            <a href="mailto:support@lookara.com" className="ev-btn-secondary" style={{ textDecoration: 'none' }}>
              {MAIL_ICON}
              Contact Support
            </a>
          </div>
        </div>
      )}

      {/* ══════ RESENT ══════ */}
      {screen === 'resent' && (
        <div className="ev-screen">
          <div className="ev-card ev-card--gold">
            <div className="ev-icon-circle ev-icon-circle--gold">{SEND_ICON}</div>
            <h2 className="ev-card-title">Email sent</h2>
            <p className="ev-card-sub">A new verification email has been sent to</p>
            <div className="ev-email-display">{CONFIG.email}</div>
            <p className="ev-card-sub" style={{ marginBottom: '1.5rem' }}>
              Check your inbox and click the link to verify your account.
              The link expires after 24 hours.
            </p>
            <button
              className="ev-btn-secondary"
              onClick={() => {
                setScreen('waiting');
                startCountdown();
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Dev: state switcher */}
      <div className="ev-dev">
        <button onClick={() => setScreen('waiting')}>Waiting</button>
        <button onClick={() => setScreen('verified')}>Verified</button>
        <button onClick={() => setScreen('invalid')}>Invalid</button>
        <button onClick={() => setScreen('expired')}>Expired</button>
        <button onClick={() => setScreen('already-verified')}>Already</button>
        <button onClick={() => setScreen('not-found')}>Not Found</button>
        <button onClick={() => setScreen('resent')}>Resent</button>
      </div>
    </div>
  );
}