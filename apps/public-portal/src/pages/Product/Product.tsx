// apps/public-portal/src/pages/Product/Product.tsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Product.css';

const DOES = [
  'Runs operations execution',
  'Coordinates vendors',
  'Tracks compliance',
  'Handles emergencies',
  'Logs everything',
];

const DOES_NOT = [
  'No guest messaging',
  'No booking marketplace',
  'No pricing optimization',
  'No AI fluff',
];

const FLOW_STEPS = [
  {
    title: 'Tasks are created — manual or system-triggered',
    body: 'A guest checks out. A compliance deadline approaches. An emergency is flagged. The system creates the task automatically or accepts manual input — and starts the clock immediately.',
  },
  {
    title: 'Vendors are assigned from your pool',
    body: 'No texting. No phone calls. The system matches the task to the right vendor based on skills, service area, and availability — and dispatches instantly.',
  },
  {
    title: 'SLAs are tracked in real time',
    body: "Every task has a deadline. The system watches it. You don't have to. If a vendor is late, the system knows before you do.",
  },
  {
    title: 'Risks are flagged before failure',
    body: 'SLA at risk? Compliance expiring? Vendor unresponsive? The system escalates automatically — before a missed deadline becomes an incident.',
  },
  {
    title: 'Every action is logged and auditable',
    body: 'Every assignment, escalation, and resolution is recorded — immutably — with actor, timestamp, and state change. You always know what happened and who did it.',
  },
];

const SCENARIOS = [
  {
    num: 'Scenario 01',
    title: 'Turnover without chaos',
    body: 'Guest checks out at 11am. System creates turnover task immediately, dispatches cleaning vendor from preferred pool, tracks arrival and completion against SLA. If the vendor is late, escalation fires automatically. Every step logged.',
  },
  {
    num: 'Scenario 02',
    title: 'Compliance expiry — prevented',
    body: 'Fire inspection expires in 14 days. System flags it, creates a renewal task, routes reminders to the property manager, and schedules the inspection into the portfolio calendar. Nothing slips.',
  },
  {
    num: 'Scenario 03',
    title: 'Emergency at 2am',
    body: 'Guest reports a lockout. Emergency mode activates instantly — dispatches emergency vendor, tracks ETA, logs every minute of the incident. PM gets a full resolution summary in the morning. No phone tree. No chaos.',
  },
  {
    num: 'Scenario 04',
    title: 'Portfolio reporting — operational',
    body: 'End of month. Reports show task completion rates, SLA compliance, vendor performance, and compliance status across all properties. No manual data collection. No spreadsheets. Exportable in one click.',
  },
];

const RAILS = [
  'Task Orchestration',
  'Vendor Graph',
  'Audit System',
  'Notification Routing',
];

export default function Product() {
  const inActionRef = useRef<HTMLElement>(null);
  const { showToast } = useToast();

  const scrollToInAction = () => {
    inActionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Scrolling to In Action');
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="pro-hero">
        <div className="container">
          <div className="pro-hero__inner">
            <div>
              <div className="pro-eyebrow">Phase 1 Operations OS · No Vaporware</div>

              <h1 className="pro-hero__title">
                The <span className="highlight">Operating System</span>
                <br />
                Behind Real STR Operations
              </h1>

              <p className="pro-hero__shift">
                Lookara doesn't help you manage.
                <br />
                <span>It runs the operation.</span>
              </p>

              <p className="pro-hero__sub">
                When operations break, revenue follows.
                <br />
                Lookara prevents the break before it happens.
              </p>

              <div className="pro-hero__ctas">
                <Link to="/request-access" className="btn btn-primary" data-tip="Request early access">
                  Request Access →
                </Link>
                <button
                  type="button"
                  className="pro-hero__ghost"
                  onClick={scrollToInAction}
                  data-tip="Jump to real scenarios"
                >
                  See It in Action →
                </button>
              </div>
            </div>

            <div className="pro-panel">
              <div className="pro-panel__section">
                <div className="pro-panel__title">What Lookara does</div>
                <ul className="pro-panel__list">
                  {DOES.map(d => <li key={d}>{d}</li>)}
                </ul>
              </div>

              <div className="pro-panel__section">
                <div className="pro-panel__title">What Lookara does NOT do (Phase 1)</div>
                <ul className="pro-panel__list pro-panel__list--no">
                  {DOES_NOT.map(d => <li key={d}>{d}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM → SHIFT ── */}
      <section className="pro-shift">
        <div className="container">
          <div className="pro-shift__inner">
            <div className="section-label">The Shift</div>
            <div className="pro-shift__compare">
              <div className="pro-shift__side pro-shift__side--before">
                <div className="pro-shift__label">Most STR software</div>
                <div className="pro-shift__text">Shows you what's happening.</div>
              </div>
              <div className="pro-shift__arrow">→</div>
              <div className="pro-shift__side pro-shift__side--after">
                <div className="pro-shift__label">Lookara</div>
                <div className="pro-shift__text">Makes sure it gets done.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER LINE ── */}
      <div className="filter-line">
        <p>
          If you're managing casually,{' '}
          <span className="filter-line__strong">this isn't for you.</span>
        </p>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="pro-how">
        <div className="container">
          <div className="pro-how__header">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">One execution loop. Nothing falls through.</h2>
            <p className="section-sub">If a step fails, the system compensates automatically.</p>
          </div>

          <div className="pro-flow">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="pro-flow__step">
                <div className="pro-flow__num">{i + 1}</div>
                <div className="pro-flow__content">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IN ACTION ── */}
      <section className="pro-action" id="in-action" ref={inActionRef}>
        <div className="container">
          <div className="pro-action__header">
            <div className="section-label">In Action</div>
            <h2 className="section-title">Real scenarios. Real execution.</h2>
            <p className="pro-action__sub">
              No demos. No screenshots. This is what the system actually does when operations are live.
            </p>
          </div>

          <div className="pro-demos">
            {SCENARIOS.map(s => (
              <div key={s.num} className="pro-demo">
                <div className="pro-demo__num">{s.num}</div>
                <h3 className="pro-demo__title">{s.title}</h3>
                <p className="pro-demo__body">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="pro-action__cta">
            <Link to="/request-access" className="btn btn-primary" data-tip="Request early access">
              Request Access →
            </Link>
            <Link to="/tools" className="btn btn-secondary" data-tip="View all operational tools">
              See All Tools
            </Link>
            <span className="pro-action__note">
              No guest portal. No OTA marketplace. Operations only.
            </span>
          </div>
        </div>
      </section>

      {/* ── OS RAILS ── */}
      <section className="pro-rails">
        <div className="container">
          <div className="pro-rails__inner">
            <div className="pro-rails__left">
              <div className="section-label">Under the Hood</div>
              <h2 className="pro-rails__title">Powered by core operational engines</h2>
              <p className="pro-rails__body">
                The UI is the surface. These engines are what make execution reliable, consistent,
                and auditable across your entire portfolio.
              </p>
            </div>

            <div className="pro-rails__grid">
              {RAILS.map(r => (
                <div key={r} className="pro-rail-chip">{r}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="pro-cta">
        <div className="container">
          <div className="pro-cta__inner">
            <div className="section-label">Get Started</div>
            <h2 className="pro-cta__title">
              Run your operations like a system.
              <br />
              <span className="highlight">Or keep managing manually.</span>
            </h2>
            <p className="pro-cta__sub">Request access or explore the full tool set.</p>
            <div className="pro-cta__btns">
              <Link to="/request-access" className="btn btn-primary" data-tip="Request early access">
                Request Access →
              </Link>
              <Link to="/tools" className="btn btn-secondary" data-tip="View all operational tools">
                Explore Tools
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}