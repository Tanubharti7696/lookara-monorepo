// apps/public-portal/src/pages/Solutions/SolutionsPM.tsx
import { Link, useLocation } from 'react-router-dom';
import './SolutionsPM.css';

const TOWER_STATS = [
  { value: '47',  label: 'Properties',   tone: 'gold' },
  { value: '94%', label: 'SLA Score',    tone: 'green' },
  { value: '12',  label: 'Active Tasks', tone: 'white' },
];

const TOWER_ALERTS = [
  { tone: 'urgent',  title: 'Guest lockout — Unit 12B',        meta: 'Vendor dispatched · ETA 14 min', tag: 'Live' },
  { tone: 'warning', title: 'Turnover SLA at risk — Unit 8A',  meta: 'Cleaner running 22 min behind',  tag: 'Escalating' },
  { tone: 'ok',      title: 'HVAC inspection complete — Unit 3C', meta: 'Logged · Invoice pending',    tag: 'Done' },
];

const PAIN = [
  { num: '01', title: 'Constant phone interruptions', body: "Guests, vendors, owners — everyone needs something right now. You can't build a business when you're always on call." },
  { num: '02', title: 'Unreliable vendors',           body: "You don't know if the cleaner showed up until a guest complains. Chasing vendors for updates eats hours every week." },
  { num: '03', title: 'Emergency scrambles',          body: "A lockout at 11pm. A broken AC in August. You're the single point of failure. Your phone is always on." },
  { num: '04', title: 'Compliance anxiety',           body: 'License renewals, inspections, safety certifications — one missed deadline can shut you down. Something always feels like it\'s slipping.' },
];

const HOW_STEPS = [
  { title: 'Tasks created — manual or triggered',     body: 'Guest checkout. Compliance deadline. Incident. Task starts immediately.' },
  { title: 'Vendors dispatched from your pool',        body: 'Right vendor. Right task. No texting. No phone calls.' },
  { title: 'SLAs tracked in real time',                body: "The system watches every deadline. You don't have to." },
  { title: 'Risks escalated before failure',           body: 'Late vendor? Expiring document? Escalation fires automatically.' },
  { title: 'Everything logged',                        body: 'Every action. Every actor. Every timestamp. Immutable.' },
];

const SCENARIOS = [
  { num: 'Scenario 01', title: 'Turnover without chaos', body: 'Guest checks out at 11am. System creates turnover task, dispatches cleaning vendor from your preferred pool, tracks arrival against SLA. If the vendor is late, escalation fires automatically. You get a notification — not a crisis.' },
  { num: 'Scenario 02', title: 'Emergency at 2am',       body: 'Guest reports a lockout. Emergency mode activates instantly — dispatches vendor, tracks ETA, logs every minute of the incident. You get a full resolution summary in the morning. No phone tree. No 2am panic.' },
];

const OUTCOMES = [
  { lead: 'Vendors show up',           rest: '— or the system escalates' },
  { lead: 'Deadlines don\'t get missed', rest: '' },
  { lead: 'Emergencies don\'t wake you up', rest: '' },
  { lead: 'Compliance doesn\'t slip',   rest: '' },
  { lead: 'Every action is tracked',    rest: '— always' },
];

const PERSONAS = [
  { to: '/solutions/pm',     label: 'Property Managers' },
  { to: '/solutions/vendor', label: 'Vendors' },
  { to: '/solutions/owner',  label: 'Owners' },
];

export default function SolutionsPM() {
  const { pathname } = useLocation();

  return (
    <div className="sol-pm">
      {/* ── HERO ── */}
      <section className="sol-hero">
        <div className="sol-container">
          <div className="sol-hero__inner">
            <div className="sol-hero__content">
              <div className="sol-eyebrow">For Property Managers</div>
              <h1 className="sol-hero__title">
                Run your portfolio
                <br />
                like a <span className="highlight">system.</span>
                <br />
                Not like a constant emergency.
              </h1>
              <p className="sol-hero__sub">
                Lookara handles tasks, vendors, compliance, and incidents — automatically.
                <br />
                You stop firefighting. You start operating.
              </p>
              <div className="sol-hero__ctas">
                <Link to="/request-access" className="sol-btn sol-btn--primary" data-tip="Start as a Property Manager">
                  Start as Property Manager →
                </Link>
                <Link to="/request-access" className="sol-btn sol-btn--secondary" data-tip="Request early access">
                  Request Access
                </Link>
              </div>
            </div>

            {/* Control Tower */}
            <div className="sol-tower">
              <div className="sol-tower__header">
                <div className="sol-tower__title">Live Operations Snapshot</div>
                <div className="sol-tower__live">Operational overview</div>
              </div>

              <div className="sol-tower__stats">
                {TOWER_STATS.map(s => (
                  <div key={s.label} className="sol-tower__stat">
                    <div className={`sol-tower__stat-val ${s.tone}`}>{s.value}</div>
                    <div className="sol-tower__stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="sol-tower__alerts">
                {TOWER_ALERTS.map((a, i) => (
                  <div key={i} className={`sol-alert sol-alert--${a.tone}`}>
                    <div className="sol-alert__dot" />
                    <div className="sol-alert__body">
                      <div className="sol-alert__title">{a.title}</div>
                      <div className="sol-alert__meta">{a.meta}</div>
                    </div>
                    <div className="sol-alert__tag">{a.tag}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN ── */}
      <section className="sol-pain">
        <div className="sol-container">
          <div className="sol-pain__header">
            <div className="sol-label">The Problem</div>
            <h2 className="sol-title">Sound familiar?</h2>
            <p className="sol-pain__sub">This is what unstructured operations look like at scale.</p>
          </div>

          <div className="sol-pain__grid">
            {PAIN.map(p => (
              <div key={p.num} className="sol-pain__card">
                <div className="sol-pain__icon">{p.num}</div>
                <div>
                  <h3 className="sol-pain__title">{p.title}</h3>
                  <p className="sol-pain__body">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHIFT ── */}
      <section className="sol-shift">
        <div className="sol-container">
          <div className="sol-shift__inner">
            <div className="sol-label">The Shift</div>
            <div className="sol-shift__compare">
              <div className="sol-shift__side sol-shift__side--before">
                <div className="sol-shift__lbl">Most tools</div>
                <div className="sol-shift__txt">Show you what's happening.</div>
              </div>
              <div className="sol-shift__arrow">→</div>
              <div className="sol-shift__side sol-shift__side--after">
                <div className="sol-shift__lbl">Lookara</div>
                <div className="sol-shift__txt">Makes sure it gets done.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="sol-how">
        <div className="sol-container">
          <div className="sol-how__inner">
            <div className="sol-how__left">
              <div className="sol-label">How It Works</div>
              <h2 className="sol-title">
                One execution loop.
                <br />
                Nothing falls through.
              </h2>
              <p className="sol-how__sub">
                If a step fails, the system compensates automatically.
                You get notified — not buried.
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

      {/* ── IN ACTION ── */}
      <section className="sol-action">
        <div className="sol-container">
          <div className="sol-action__header">
            <div className="sol-label">In Action</div>
            <h2 className="sol-title">What this looks like in real operations.</h2>
            <p className="sol-action__sub">This is daily reality.</p>
          </div>

          <div className="sol-scenarios">
            {SCENARIOS.map(s => (
              <div key={s.num} className="sol-scenario">
                <div className="sol-scenario__num">{s.num}</div>
                <h3 className="sol-scenario__title">{s.title}</h3>
                <p className="sol-scenario__body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUTCOMES ── */}
      <section className="sol-outcomes">
        <div className="sol-container">
          <div className="sol-outcomes__inner">
            <div className="sol-outcomes__left">
              <div className="sol-label">Outcomes</div>
              <h2 className="sol-title">What changes when the system runs the operation.</h2>
              <p className="sol-outcomes__sub">
                Not promises. This is what structured operations produce.
              </p>
            </div>

            <div className="sol-outcomes__list">
              {OUTCOMES.map((o, i) => (
                <div key={i} className="sol-outcome">
                  <span className="sol-outcome__text">
                    <strong>{o.lead}</strong>{o.rest ? ` ${o.rest}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="sol-testimonial">
        <div className="sol-container">
          <div className="sol-testimonial__inner">
            <div className="sol-stars">★★★★★</div>
            <p className="sol-quote">
              Before Lookara, I was working 70-hour weeks managing 23 properties.
              Now I manage 47 with half the stress.
            </p>
            <div className="sol-author">
              <div className="sol-author__avatar">MR</div>
              <div className="sol-author__meta">
                <div className="sol-author__name">Marcus Robinson</div>
                <div className="sol-author__role">Owner, Urban Stays Property Management</div>
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
              Keep managing manually.
              <br />
              Or run operations <span className="highlight">like a system.</span>
            </h2>
            <p className="sol-cta__sub">
              No pitch calls. No demos required. Request access and see it for yourself.
            </p>
            <div className="sol-cta__btns">
              <Link to="/request-access" className="sol-btn sol-btn--primary" data-tip="Start as a Property Manager">
                Start as Property Manager →
              </Link>
              <Link to="/pricing" className="sol-btn sol-btn--secondary" data-tip="View plans and pricing">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}