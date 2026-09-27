// apps/public-portal/src/pages/Solutions/SolutionsVendor.tsx
import { Link, useLocation } from 'react-router-dom';
import './SolutionsVendor.css';

const WHY = [
  { num: '01', title: 'Clear scope',       body: 'Every job is defined before you accept. No surprises on arrival.' },
  { num: '02', title: 'Accountability',    body: 'Arrival, progress, and completion are tracked automatically. Always.' },
  { num: '03', title: 'No chasing',        body: "Jobs come with full context. No back-and-forth to understand what's needed." },
  { num: '04', title: 'Consistent work',   body: 'From active property managers running real portfolios — not random listings.' },
];

const HOW_STEPS = [
  { title: 'Create your profile',  body: 'Define services, coverage, availability.' },
  { title: 'Get approved',         body: 'Documents verified before activation.' },
  { title: 'Receive dispatches',   body: 'Jobs assigned based on fit.' },
  { title: 'Execute',              body: 'Follow task, confirm status, complete work.' },
  { title: 'Logged',               body: 'Every step recorded for accountability.' },
];

const TOOLS = [
  { name: 'Job Dispatch',                 desc: 'Structured job assignments with scope and timing.' },
  { name: 'Status Tracking',              desc: 'Confirm arrival and completion.' },
  { name: 'Photo Documentation',          desc: 'Upload proof of work.' },
  { name: 'Task Checklists',              desc: 'Follow required steps.' },
  { name: 'Task-Based Communication',     desc: 'Contact PM only within active jobs. All messages logged.' },
  { name: 'Work Tracking',                desc: 'View completed work and pending approvals.' },
];

const COMP_POINTS = [
  'Clear accountability — completed work is logged before payment is expected',
  'No disputes about work completed — the system records it',
  'Full visibility — PM and vendor see the same record',
];

const PERSONAS = [
  { to: '/solutions/pm',     label: 'Property Managers' },
  { to: '/solutions/vendor', label: 'Vendors' },
  { to: '/solutions/owner',  label: 'Owners' },
];

export default function SolutionsVendor() {
  const { pathname } = useLocation();

  return (
    <div className="sol-ven">
      {/* ── HERO ── */}
      <section className="sol-hero">
        <div className="sol-container">
          <div className="sol-hero__inner">
            <div className="sol-hero__content">
              <div className="sol-eyebrow">For Vendors</div>
              <h1 className="sol-hero__title">
                Work inside a system.
                <br />
                <span className="highlight">Or stay in chaos.</span>
              </h1>
              <p className="sol-hero__sub">
                Lookara dispatches, tracks, and logs every job — so expectations are clear
                and performance is measurable.
              </p>
              <div className="sol-hero__ctas">
                <Link to="/request-access" className="sol-btn sol-btn--primary" data-tip="Join as a Vendor">
                  Join as a Vendor →
                </Link>
                <a href="#how" className="sol-btn sol-btn--secondary" data-tip="See how it works">
                  Learn More
                </a>
              </div>
            </div>

            {/* Snapshot */}
            <div className="sol-snap">
              <div className="sol-snap__header">
                <div className="sol-snap__title">Live Operations Snapshot</div>
                <div className="sol-snap__status">Active</div>
              </div>

              <div className="sol-snap__blocks">
                <div className="sol-snap__block">
                  <div className="sol-snap__block-label">Active Jobs Today</div>
                  <div className="sol-snap__row">
                    <span className="sol-snap__row-key">Assigned</span>
                    <span className="sol-snap__row-val">3</span>
                  </div>
                  <div className="sol-snap__row">
                    <span className="sol-snap__row-key">In Progress</span>
                    <span className="sol-snap__row-val gold">1</span>
                  </div>
                  <div className="sol-snap__row">
                    <span className="sol-snap__row-key">Scheduled</span>
                    <span className="sol-snap__row-val">1</span>
                  </div>
                </div>

                <div className="sol-snap__block">
                  <div className="sol-snap__block-label">Response Required</div>
                  <div className="sol-snap__block-val">2 new job offers</div>
                  <div className="sol-snap__block-sub">Awaiting confirmation</div>
                </div>

                <div className="sol-snap__block">
                  <div className="sol-snap__block-label">Status</div>
                  <div className="sol-snap__row">
                    <span className="sol-snap__row-key">SLA</span>
                    <span className="sol-snap__row-val green">On time</span>
                  </div>
                  <div className="sol-snap__row">
                    <span className="sol-snap__row-key">Escalations</span>
                    <span className="sol-snap__row-val green">None</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER STRIP ── */}
      <div className="sol-filter">
        <div className="sol-container">
          <p className="sol-filter__text">
            This is not for everyone.{' '}
            <span className="sol-filter__strong">
              If you're unreliable, inconsistent, or hard to reach — you won't last in this system.
            </span>
          </p>
        </div>
      </div>

      {/* ── WHY ── */}
      <section className="sol-why">
        <div className="sol-container">
          <div className="sol-why__header">
            <div className="sol-label">Structured Vendors</div>
            <h2 className="sol-title">Why structured vendors choose Lookara.</h2>
            <p className="sol-why__sub">Not for everyone. For operators who execute reliably.</p>
          </div>

          <div className="sol-why__grid">
            {WHY.map(w => (
              <div key={w.num} className="sol-why__card">
                <div className="sol-why__num">{w.num}</div>
                <div>
                  <h3 className="sol-why__title">{w.title}</h3>
                  <p className="sol-why__body">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW ── */}
      <section className="sol-how" id="how">
        <div className="sol-container">
          <div className="sol-how__inner">
            <div className="sol-how__left">
              <div className="sol-label">How It Works</div>
              <h2 className="sol-title">Structured from day one.</h2>
              <p className="sol-how__sub">
                No unstructured chats. No surprise scope changes. Every step is defined
                before you start.
              </p>
            </div>

            <div className="sol-flow">
              {HOW_STEPS.map((s, i) => (
                <div key={i} className="sol-flow__step">
                  <div className="sol-flow__num">{i + 1}</div>
                  <div className="sol-flow__content">
                    <h4>{s.title}</h4>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section className="sol-tools">
        <div className="sol-container">
          <div className="sol-tools__header">
            <div className="sol-label">What You Use</div>
            <h2 className="sol-title">Vendor tools.</h2>
            <p className="sol-tools__sub">
              Everything needed to execute structured work — nothing extra.
            </p>
          </div>

          <div className="sol-tools__rows">
            {TOOLS.map(t => (
              <div key={t.name} className="sol-tool-row">
                <div className="sol-tool-row__name">{t.name}</div>
                <div className="sol-tool-row__desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPENSATION ── */}
      <section className="sol-comp">
        <div className="sol-container">
          <div className="sol-comp__inner">
            <div className="sol-comp__left">
              <div className="sol-label">Payments</div>
              <h2 className="sol-title">
                Transparent.
                <br />
                No surprises.
              </h2>
              <p className="sol-comp__sub">
                Lookara does not process payments in Phase 1. Property managers pay vendors
                directly. The platform tracks job completion and approvals.
              </p>
              <div className="sol-comp__points">
                {COMP_POINTS.map(p => (
                  <div key={p} className="sol-comp__point">
                    <div className="sol-comp__bullet" />
                    <p>{p}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sol-comp__right">
              <div className="sol-comp__right-label">What this means for you</div>
              <h3>You know what you're getting paid before you accept.</h3>
              <p>
                Every job offer includes scope and agreed compensation. No renegotiating
                after completion.
              </p>
              <div className="sol-comp__divider" />
              <h3>Your work record is always on file.</h3>
              <p>
                Completion logs, photo documentation, and timestamps — all stored. If there's
                ever a question about a job, the record answers it.
              </p>
              <div className="sol-comp__divider" />
              <h3>Payment status is visible in your dashboard.</h3>
              <p>
                You can see where every completed job stands in the approval and payment
                process — without chasing anyone for an update.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="sol-testimonial">
        <div className="sol-container">
          <div className="sol-testimonial__inner">
            <p className="sol-quote">
              Every job now comes with clear scope and expectations. I just execute.
            </p>
            <div className="sol-author">
              <div className="sol-author__avatar sol-author__avatar--green">TC</div>
              <div className="sol-author__meta">
                <div className="sol-author__name">Tony Castillo</div>
                <div className="sol-author__role">Owner, Castillo Maintenance Services</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERSONA STRIP ── */}
      <div className="sol-persona-strip">
        <div className="sol-container">
          <div className="sol-persona-strip__inner">
            <span className="sol-persona-strip__label">Other solution paths:</span>
            <div className="sol-persona-links">
              {PERSONAS.map(p => (
                <Link
                  key={p.to}
                  to={p.to}
                  className={`sol-persona-link ${pathname === p.to ? 'current' : ''}`}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <section className="sol-cta">
        <div className="sol-container">
          <div className="sol-cta__inner">
            <h2 className="sol-cta__title">
              Work inside a system.
              <br />
              <span className="highlight">Or don't.</span>
            </h2>
            <p className="sol-cta__sub">
              Structured jobs. Clear scope. Logged performance.
            </p>
            <div className="sol-cta__btns">
              <Link to="/request-access" className="sol-btn sol-btn--primary" data-tip="Join as a Vendor">
                Join as a Vendor →
              </Link>
              <Link to="/product" className="sol-btn sol-btn--secondary" data-tip="Learn how the system works">
                How the System Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}