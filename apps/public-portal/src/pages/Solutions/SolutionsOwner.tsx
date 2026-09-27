// apps/public-portal/src/pages/Solutions/SolutionsOwner.tsx
import { Link, useLocation } from 'react-router-dom';
import './SolutionsOwner.css';

const SNAP_ACTIVITY = [
  { tone: 'green', text: 'Cleaning completed — Unit 12B', time: '2h ago' },
  { tone: 'gold',  text: 'Maintenance logged — Unit 8A',  time: 'Yesterday' },
  { tone: 'slate', text: 'Stay started — Unit 3C',        time: '2 days ago' },
];

const TRUST_PILLS = ['Read-only by default', 'No guest PII', 'OTA-safe'];

const PAIN = [
  { num: '01', title: 'Waiting for monthly reports',      body: "You shouldn't have to wait 30 days to know what's happening with your property." },
  { num: '02', title: 'No visibility into operations',    body: "Is the cleaner showing up? Is maintenance being handled? You're left guessing." },
  { num: '03', title: 'Chasing your property manager',    body: "Emails go unanswered. You feel like you're bothering them for basic information." },
  { num: '04', title: 'Unclear performance',              body: 'Occupancy, activity, task completion — none of it is visible until someone tells you.' },
];

const SHIFT_ROWS = [
  'You see activity as it happens',
  'You know when work is completed',
  'You understand performance without asking',
  "You don't rely on monthly reports",
];

const FEED = [
  { tone: 'green', title: 'Stay started',       meta: 'Unit 12B · No guest identity shown', time: '2h ago' },
  { tone: 'gold',  title: 'Cleaning completed', meta: 'Unit 8A · Photos uploaded',          time: '5h ago' },
  { tone: 'slate', title: 'Maintenance logged', meta: 'Unit 3C · Task assigned to vendor',  time: 'Yesterday' },
  { tone: 'green', title: 'Platform feedback received', meta: 'Unit 12B · Signal logged',    time: '2 days ago' },
  { tone: 'gold',  title: 'Stay completed',     meta: 'Unit 8A · Turnover initiated',       time: '3 days ago' },
];

const VISIBILITY = [
  { icon: '📅', name: 'Bookings',                        note: 'Read-only calendar view' },
  { icon: '📋', name: 'Property Activity',               note: 'Operational events as they happen' },
  { icon: '✅', name: 'Maintenance & Task Completion',   note: 'What was done, when, by whom' },
  { icon: '📊', name: 'Performance Signals',             note: 'Occupancy and operational health' },
  { icon: '📄', name: 'Reports',                         note: 'Generated from system activity — no manual compilation' },
];

const PERSONAS = [
  { to: '/solutions/pm',     label: 'Property Managers' },
  { to: '/solutions/vendor', label: 'Vendors' },
  { to: '/solutions/owner',  label: 'Owners' },
];

export default function SolutionsOwner() {
  const { pathname } = useLocation();

  return (
    <div className="sol-own">
      {/* ── HERO ── */}
      <section className="own-hero">
        <div className="own-container">
          <div className="own-hero__inner">
            <div className="own-hero__content">
              <div className="own-eyebrow">For Property Owners</div>
              <h1 className="own-hero__title">
                See what's happening.
                <br />
                <span className="highlight">Without getting involved.</span>
              </h1>
              <p className="own-hero__sub">
                Lookara gives you real-time visibility into your property — operations,
                activity, and performance — without exposing you to risk or complexity.
              </p>
              <div className="own-hero__ctas">
                <Link to="/login" className="own-btn own-btn--primary" data-tip="Access your owner view">
                  Access Your Owner View →
                </Link>
                <a href="#activity" className="own-btn own-btn--secondary" data-tip="See what you can view">
                  See How It Works
                </a>
              </div>
            </div>

            {/* Portfolio Snapshot */}
            <div className="own-snap">
              <div className="own-snap__header">
                <div className="own-snap__title">Portfolio Snapshot</div>
                <div className="own-snap__note">Demo data · No guest PII</div>
              </div>

              <div className="own-snap__kpis">
                <div className="own-snap__kpi">
                  <div className="own-snap__kpi-val">87%</div>
                  <div className="own-snap__kpi-lbl">Occupancy</div>
                </div>
                <div className="own-snap__kpi">
                  <div className="own-snap__kpi-val">4</div>
                  <div className="own-snap__kpi-lbl">Active Stays</div>
                </div>
              </div>

              <div className="own-snap__activity-title">Recent Activity</div>
              <div className="own-snap__activity">
                {SNAP_ACTIVITY.map((a, i) => (
                  <div key={i} className="own-snap__activity-row">
                    <div className={`own-snap__dot own-snap__dot--${a.tone}`} />
                    <div className="own-snap__activity-text">{a.text}</div>
                    <div className="own-snap__activity-time">{a.time}</div>
                  </div>
                ))}
              </div>

              <div className="own-snap__privacy">
                Read-only · OTA-safe · No guest identity exposed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST FILTER ── */}
      <div className="own-trust-filter">
        <div className="own-container">
          <div className="own-trust-filter__inner">
            <div className="own-trust-filter__main">
              <strong>You don't manage operations here.</strong> You see them clearly.
            </div>
            <div className="own-trust-pills">
              {TRUST_PILLS.map(p => (
                <div key={p} className="own-trust-pill">{p}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PAIN ── */}
      <section className="own-pain">
        <div className="own-container">
          <div className="own-pain__header">
            <div className="own-label">The Problem</div>
            <h2 className="own-title">Sound familiar?</h2>
            <p className="own-pain__sub">What owning a property feels like without visibility.</p>
          </div>

          <div className="own-pain__grid">
            {PAIN.map(p => (
              <div key={p.num} className="own-pain__card">
                <div className="own-pain__num">{p.num}</div>
                <div>
                  <h3 className="own-pain__title">{p.title}</h3>
                  <p className="own-pain__body">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHIFT ── */}
      <section className="own-shift">
        <div className="own-container">
          <div className="own-shift__inner">
            <div className="own-shift__left">
              <div className="own-label">What Changes</div>
              <h2 className="own-title">
                You stop asking.
                <br />
                You already know.
              </h2>
              <p className="own-shift__sub">
                Lookara doesn't change who runs the operation. It makes the operation
                visible to you — in real time, without friction.
              </p>
            </div>

            <div className="own-shift__rows">
              {SHIFT_ROWS.map((r, i) => (
                <div key={i} className="own-shift__row">
                  <div className="own-shift__arrow">→</div>
                  <div className="own-shift__text"><strong>{r}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACTIVITY FEED ── */}
      <section className="own-activity" id="activity">
        <div className="own-container">
          <div className="own-activity__inner">
            <div className="own-activity__left">
              <div className="own-label">Live Activity</div>
              <h2 className="own-title">Your property. In real time.</h2>
              <p className="own-activity__sub">
                Every operational event is recorded and visible to you as it happens.
                You see what's going on — without being pulled into it.
              </p>

              <div className="own-activity__privacy">
                <div className="own-activity__privacy-label">Privacy-safe by design</div>
                <p>
                  All activity is shown without guest identity. No PII exposed.
                  Read-only access only. OTA-compliant.
                </p>
              </div>
            </div>

            <div className="own-feed">
              <div className="own-feed__header">
                <div className="own-feed__title">Activity Log</div>
                <div className="own-feed__live">Live</div>
              </div>
              <div className="own-feed__items">
                {FEED.map((f, i) => (
                  <div key={i} className="own-feed__item">
                    <div className={`own-feed__dot own-feed__dot--${f.tone}`} />
                    <div className="own-feed__body">
                      <div className="own-feed__item-title">{f.title}</div>
                      <div className="own-feed__item-meta">{f.meta}</div>
                    </div>
                    <div className="own-feed__time">{f.time}</div>
                  </div>
                ))}
              </div>
              <div className="own-feed__footer">
                Everything recorded. Nothing changes hands without a log.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISIBILITY ── */}
      <section className="own-visibility">
        <div className="own-container">
          <div className="own-visibility__header">
            <div className="own-label">What You Can See</div>
            <h2 className="own-title">Visibility without involvement.</h2>
            <p className="own-visibility__sub">
              These are the views available to property owners. All read-only.
              All derived from operational activity.
            </p>
          </div>

          <div className="own-visibility__rows">
            {VISIBILITY.map(v => (
              <div key={v.name} className="own-visibility__row">
                <div className="own-visibility__icon">{v.icon}</div>
                <div className="own-visibility__name">{v.name}</div>
                <div className="own-visibility__note">{v.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="own-testimonial">
        <div className="own-container">
          <div className="own-testimonial__inner">
            <p className="own-quote">
              I used to wait for monthly reports. Now I see what's happening in real time.
            </p>
            <div className="own-author">
              <div className="own-author__avatar">RK</div>
              <div className="own-author__meta">
                <div className="own-author__name">Rachel Kim</div>
                <div className="own-author__role">Property Owner · 3 units, Miami Beach</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERSONA STRIP ── */}
      <div className="own-persona-strip">
        <div className="own-container">
          <div className="own-persona-strip__inner">
            <span className="own-persona-strip__label">Other solution paths:</span>
            <div className="own-persona-links">
              {PERSONAS.map(p => (
                <Link
                  key={p.to}
                  to={p.to}
                  className={`own-persona-link ${pathname === p.to ? 'current' : ''}`}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <section className="own-cta">
        <div className="own-container">
          <div className="own-cta__inner">
            <h2 className="own-cta__title">
              See your investment <span className="highlight">clearly.</span>
            </h2>
            <p className="own-cta__sub">
              Ask your property manager for owner access.
              <br />
              Or request access and we'll connect you.
            </p>
            <div className="own-cta__btns">
              <Link to="/login" className="own-btn own-btn--primary" data-tip="Access your owner view">
                Access Your Owner View →
              </Link>
              <Link to="/request-access" className="own-btn own-btn--secondary" data-tip="Request access">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}