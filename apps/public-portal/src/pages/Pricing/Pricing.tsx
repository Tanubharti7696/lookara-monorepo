// apps/public-portal/src/pages/Pricing/Pricing.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Pricing.css';

type Billing = 'monthly' | 'annual';

type Plan = {
  key: string;
  name: string;
  range: string;
  monthly?: number;
  annual?: number;
  perProp?: number;
  custom?: boolean;
  desc: string;
  ctaLabel: string;
  featured: boolean;
};

const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    range: '1–3 properties',
    monthly: 39,
    annual: 31,
    perProp: 6,
    desc: 'For small portfolios starting to structure operations.',
    ctaLabel: 'Request Access',
    featured: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    range: '4–20 properties',
    monthly: 99,
    annual: 79,
    perProp: 4,
    desc: 'For active operators managing multiple properties.',
    ctaLabel: 'Request Access',
    featured: true,
  },
  {
    key: 'professional',
    name: 'Professional',
    range: '21–99 properties',
    monthly: 299,
    annual: 239,
    perProp: 3,
    desc: 'For scaled operations requiring consistency and control.',
    ctaLabel: 'Request Access',
    featured: false,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    range: '100+ properties',
    custom: true,
    desc: 'For large portfolios and multi-team operations.',
    ctaLabel: 'Talk to Us',
    featured: false,
  },
];

const INCLUDED = [
  'Task orchestration',
  'Vendor dispatch',
  'Compliance tracking',
  'Emergency workflow',
  'Audit trail',
  'Notifications',
  'Operational reporting',
];

const DIFFS = [
  { plan: 'Starter',      desc: 'For small portfolios starting structure.' },
  { plan: 'Growth',       desc: 'For active operators.' },
  { plan: 'Professional', desc: 'For scaled operations.' },
  { plan: 'Enterprise',   desc: 'For large, multi-team deployments.' },
];

const FAQS = [
  { q: 'Do vendors cost extra?',                  a: 'No.' },
  { q: 'Is owner access included?',                a: 'Yes — read-only visibility.' },
  { q: 'Is there a minimum number of properties?', a: 'No, but designed for active operators.' },
  { q: 'Can I upgrade anytime?',                   a: 'Yes. Pricing adjusts automatically.' },
  { q: 'Is there a trial?',                        a: 'Yes. Full access with demo data.' },
];

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { showToast } = useToast();

  const switchBilling = (next: Billing) => {
    if (next === billing) return;
    setBilling(next);
    showToast(next === 'annual' ? 'Annual pricing — 20% off' : 'Monthly pricing');
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="pricing-page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="section-label">Pricing</div>
            <h1>
              Simple. Predictable.
              <br />
              <span className="highlight">Built for real operations.</span>
            </h1>
            <p className="hero-sub">
              You pay for the system. Not for seats, not for noise, not for add-ons you don't use.
            </p>
          </div>
        </div>
      </section>

      {/* ── CORE STATEMENT ── */}
      <div className="core-statement">
        <div className="container">
          <div className="core-statement-inner">
            <div className="core-label">Core Plan = Operations OS</div>
            <div className="core-text">Emergency response is included.</div>
            <div className="core-sub">We do not monetize safety.</div>
          </div>
        </div>
      </div>

      {/* ── TIERS ── */}
      <section className="tiers-section">
        <div className="container">
          <div className="tiers-header">
            <h2 className="tiers-title">Choose your tier</h2>
            <div className="billing-toggle">
              <button
                type="button"
                className={`billing-btn ${billing === 'monthly' ? 'active' : ''}`}
                onClick={() => switchBilling('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`billing-btn ${billing === 'annual' ? 'active' : ''}`}
                onClick={() => switchBilling('annual')}
              >
                Annual <span className="save-badge">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="plans-grid-wrap">
            <div className="plans-grid">
              {PLANS.map(plan => (
                <PlanCard key={plan.key} plan={plan} billing={billing} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="included-section">
        <div className="container">
          <div className="included-inner">
            <div className="included-left">
              <div className="section-label">What You Get</div>
              <h2>Every plan runs the full Operations OS.</h2>
              <p>
                No feature-gating. The system works the same way at every tier — what differs
                is scale support, not capability.
              </p>
              <div className="emergency-note">
                <div className="emergency-note-label">Always Included · Never an Add-on</div>
                <p>
                  Emergency response workflow is part of the core system. We don't charge extra for safety.
                </p>
              </div>
            </div>

            <div className="included-list">
              {INCLUDED.map(item => (
                <div key={item} className="included-row">
                  <div className="included-check">✓</div>
                  <div className="included-text">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SCALING LOGIC ── */}
      <section className="scaling-section">
        <div className="container">
          <div className="scaling-inner">
            <div className="scaling-left">
              <div className="section-label">How Pricing Scales</div>
              <h2>
                You scale operations.
                <br />
                Not complexity.
              </h2>
              <p>
                Cost per property decreases as you grow. The system stays consistent across tiers.
              </p>
            </div>
            <div className="scaling-points">
              <div className="scaling-point">
                <div className="scaling-dot" />
                <div className="scaling-text">
                  <strong>Cost per property decreases</strong> as you grow
                </div>
              </div>
              <div className="scaling-point">
                <div className="scaling-dot" />
                <div className="scaling-text">
                  <strong>System stays consistent</strong> across tiers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLAN DIFFERENCES ── */}
      <section className="differences-section">
        <div className="container">
          <div className="differences-header">
            <div className="section-label">Plan Differences</div>
            <h2>What changes between tiers.</h2>
            <p>The OS is the same. Scale support is what differs.</p>
          </div>
          <div className="differences-rows">
            {DIFFS.map(d => (
              <div key={d.plan} className="diff-row">
                <div className="diff-plan">{d.plan}</div>
                <div className="diff-desc">{d.desc}</div>
              </div>
            ))}
          </div>
          <p className="differences-note">
            The system stays the same. Support and scale evolve.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="container">
          <div className="faq-header">
            <h2>Common questions</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFaq(i)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">{item.q}</span>
                    <svg
                      className="faq-chevron"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-content">{item.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TRIAL ── */}
      <section className="trial-section">
        <div className="container">
          <div className="trial-inner">
            <div className="section-label">Start with full access</div>
            <h2>Explore the system using a safe demo dataset.</h2>
            <p>No credit card required.</p>
            <Link to="/request-access" className="btn btn-primary" data-tip="Start as a Property Manager">
              Start as Property Manager →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2>
              Run operations <span className="highlight">like a system.</span>
            </h2>
            <p>Start as Property Manager →</p>
            <div className="cta-btns">
              <Link to="/request-access" className="btn btn-primary" data-tip="Start as a Property Manager">
                Start as Property Manager →
              </Link>
              <Link to="/request-access" className="btn btn-secondary" data-tip="Request early access">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Plan card ── */
function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const price = billing === 'monthly' ? plan.monthly : plan.annual;

  return (
    <div className={`plan-card ${plan.featured ? 'featured' : ''}`}>
      {plan.featured && <div className="plan-badge">Most Popular</div>}

      <div className="plan-name">{plan.name}</div>
      <div className="plan-range">{plan.range}</div>

      <div className="plan-price-block">
        {plan.custom ? (
          <>
            <div className="plan-custom-price">Custom pricing</div>
            <div className="plan-custom-sub">Tailored to your portfolio</div>
          </>
        ) : (
          <>
            <div className="plan-price">
              <span className="price-currency">$</span>
              <span className="price-amount">{price}</span>
              <span className="price-period">/month</span>
            </div>
            <div className="plan-per-prop">
              + <span>${plan.perProp}</span> per property
            </div>
          </>
        )}
      </div>

      <p className="plan-desc">{plan.desc}</p>

      <Link
        to="/request-access"
        className={`plan-cta ${plan.featured ? 'plan-cta-primary' : 'plan-cta-secondary'}`}
        data-tip="Request early access"
      >
        {plan.ctaLabel}
      </Link>
    </div>
  );
}