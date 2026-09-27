// apps/public-portal/src/pages/Contact/Contact.tsx
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Contact.css';

type InquiryKey = 'access' | 'partnership-ota' | 'support' | 'enterprise' | 'investor' | 'other';

const INQUIRY_OPTIONS: { value: InquiryKey | ''; label: string }[] = [
  { value: '',               label: 'Select an option' },
  { value: 'access',         label: 'Request Access — Property Manager' },
  { value: 'partnership-ota', label: 'OTA / Platform Partnership' },
  { value: 'support',        label: 'Support — Active User' },
  { value: 'enterprise',     label: 'Enterprise Inquiry' },
  { value: 'investor',       label: 'Investor Inquiry' },
  { value: 'other',          label: 'Other' },
];

const ROUTES: Record<InquiryKey, string> = {
  'access':          'support@lookara.com',
  'partnership-ota': 'integrations@lookara.com',
  'support':         'support@lookara.com',
  'enterprise':      'hello@lookara.com',
  'investor':        'investors@lookara.com',
  'other':           'hello@lookara.com',
};

const CHANNEL_ROWS = [
  { name: 'Partnerships & Integrations', email: 'integrations@lookara.com' },
  { name: 'Security',                    email: 'security@lookara.com' },
  { name: 'General / Enterprise',        email: 'hello@lookara.com' },
  { name: 'Investors',                   email: 'investors@lookara.com' },
];

const RESPONSE_TIMES = [
  { label: 'General inquiries', value: 'Within 1 business day' },
  { label: 'Platform reviews',  value: '1–2 business days' },
];

type FormState = {
  first: string;
  last: string;
  email: string;
  inquiry: InquiryKey | '';
  message: string;
  consent: boolean;
  website: string; // honeypot
};

const EMPTY_FORM: FormState = {
  first: '',
  last: '',
  email: '',
  inquiry: '',
  message: '',
  consent: false,
  website: '',
};

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [invalid, setInvalid] = useState<Set<string>>(new Set());

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (invalid.has(key as string)) {
      setInvalid(prev => {
        const next = new Set(prev);
        next.delete(key as string);
        return next;
      });
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();

    // Honeypot
    if (form.website) {
      showToast('Message sent.');
      return;
    }

    // Validate
    const next = new Set<string>();
    if (!form.first.trim()) next.add('first');
    if (!form.last.trim()) next.add('last');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.add('email');
    if (!form.inquiry) next.add('inquiry');
    if (!form.message.trim()) next.add('message');
    if (!form.consent) next.add('consent');

    if (next.size > 0) {
      setInvalid(next);
      showToast('Please complete the required fields.');
      return;
    }

    const target = ROUTES[form.inquiry as InquiryKey] || 'hello@lookara.com';
    const subject = `Lookara inquiry — ${form.inquiry}`;
    const body = [
      `Name: ${form.first} ${form.last}`,
      `Email: ${form.email}`,
      '',
      'Message:',
      form.message,
    ].join('\n');

    window.location.href =
      `mailto:${target}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('Opening your email client…');
  };

  const cls = (key: keyof FormState) => invalid.has(key as string) ? 'is-invalid' : '';

  return (
    <div className="contact-page">
      {/* ── HERO ── */}
      <section className="ct-hero">
        <div className="ct-container">
          <div className="ct-hero__inner">
            <div className="ct-label">Contact</div>
            <h1 className="ct-hero__title">
              Access, support,
              <br />
              <span className="highlight">or platform review.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── ACCESS & CONTACT ── */}
      <section className="ct-access">
        <div className="ct-container">
          <div className="ct-access__inner">
            {/* Left: Primary actions */}
            <div className="ct-access__left">
              <div className="ct-label">Access & Contact</div>

              <div className="ct-primary">
                <div className="ct-primary__item">
                  <div className="ct-primary__eyebrow">Request Access</div>
                  <p className="ct-primary__sub">
                    Start your access request as a property manager.
                  </p>
                  <Link
                    to="/request-access"
                    className="ct-btn ct-btn--primary"
                    data-tip="Start as a Property Manager"
                  >
                    Request Access →
                  </Link>
                </div>

                <div className="ct-primary__item">
                  <div className="ct-primary__eyebrow">Platform Review</div>
                  <p className="ct-primary__sub">
                    For OTA and platform security teams.
                  </p>
                  <a href="mailto:security@lookara.com" className="ct-link">
                    Request Reviewer Access →
                  </a>
                </div>

                <div className="ct-primary__item ct-primary__item--last">
                  <div className="ct-primary__eyebrow">Support</div>
                  <p className="ct-primary__sub">
                    For active users and operational help.
                  </p>
                  <a href="mailto:support@lookara.com" className="ct-link">
                    support@lookara.com →
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Channels + response times */}
            <div className="ct-access__right">
              <div className="ct-channels">
                {CHANNEL_ROWS.map(row => (
                  <div key={row.name} className="ct-channel-row">
                    <div className="ct-channel-row__name">{row.name}</div>
                    <a href={`mailto:${row.email}`} className="ct-channel-row__email">
                      {row.email} →
                    </a>
                  </div>
                ))}
              </div>

              <div className="ct-response">
                <div className="ct-response__label">Response Times</div>
                {RESPONSE_TIMES.map(r => (
                  <div key={r.label} className="ct-response__row">
                    <div className="ct-response__label-text">{r.label}</div>
                    <div className="ct-response__value">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="ct-form-section">
        <div className="ct-container">
          <div className="ct-form-inner">
            <div className="ct-form-left">
              <div className="ct-label">Send a Message</div>
              <h2 className="ct-form-left__title">Send a message.</h2>
              <p className="ct-form-left__sub">
                We route your inquiry to the right team.
              </p>
            </div>

            <div className="ct-form-card">
              <form className="ct-form" onSubmit={submit} noValidate>
                <input
                  type="text"
                  name="website"
                  className="ct-honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                />

                <div className="ct-form-row">
                  <div className="ct-form-group">
                    <label className="ct-form-label">
                      First Name <span className="ct-req">*</span>
                    </label>
                    <input
                      type="text"
                      className={`ct-input ${cls('first')}`}
                      value={form.first}
                      onChange={(e) => set('first', e.target.value)}
                    />
                  </div>
                  <div className="ct-form-group">
                    <label className="ct-form-label">
                      Last Name <span className="ct-req">*</span>
                    </label>
                    <input
                      type="text"
                      className={`ct-input ${cls('last')}`}
                      value={form.last}
                      onChange={(e) => set('last', e.target.value)}
                    />
                  </div>
                </div>

                <div className="ct-form-group">
                  <label className="ct-form-label">
                    Email <span className="ct-req">*</span>
                  </label>
                  <input
                    type="email"
                    className={`ct-input ${cls('email')}`}
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </div>

                <div className="ct-form-group">
                  <label className="ct-form-label">
                    Inquiry Type <span className="ct-req">*</span>
                  </label>
                  <select
                    className={`ct-select ${cls('inquiry')}`}
                    value={form.inquiry}
                    onChange={(e) => set('inquiry', e.target.value as InquiryKey | '')}
                  >
                    {INQUIRY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} disabled={o.value === ''}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ct-form-group">
                  <label className="ct-form-label">
                    Message <span className="ct-req">*</span>
                  </label>
                  <textarea
                    className={`ct-textarea ${cls('message')}`}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                  />
                </div>

                <label className={`ct-checkbox ${invalid.has('consent') ? 'is-invalid' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => set('consent', e.target.checked)}
                  />
                  <span>
                    I agree to be contacted about my request.{' '}
                    <span className="ct-req">*</span>{' '}
                    View our <Link to="/privacy">Privacy Policy</Link>.
                  </span>
                </label>

                <div className="ct-form-submit">
                  <button type="submit">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}