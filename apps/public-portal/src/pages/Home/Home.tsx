// apps/public-portal/src/pages/Home/Home.tsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Home.css';

const AUDIENCE = [
  {
    role: 'Property Managers',
    name: 'Stop running operations manually.\nRun your portfolio like a system.',
    desc: 'Coordinate vendors, track compliance, manage tasks across every property — automatically. Lookara runs the operation so you can run the business.',
    cta: 'Start as Property Manager',
    tip: 'Request access as a Property Manager',
  },
  {
    role: 'Vendors',
    name: 'Stop chasing jobs.\nGet dispatched with structure and accountability.',
    desc: 'Receive task dispatches, confirm availability, track performance — all in one place. No more chasing managers. No more missed jobs.',
    cta: 'Join as Vendor',
    tip: 'Request access as a Vendor',
  },
  {
    role: 'Owners',
    name: 'See everything.\nManage nothing.',
    desc: "See what's happening across your properties without getting pulled into daily operations. Full transparency. Zero micromanagement.",
    cta: "I'm an Owner",
    tip: 'Request access as an Owner',
  },
];

const OUTCOMES = [
  {
    icon: '🛡️',
    title: 'Prevents failures before they happen',
    body: 'No more finding out a deadline passed after it mattered. The system watches every SLA, flags risk in real time, and escalates before a guest complaint becomes a review.',
  },
  {
    icon: '⚡',
    title: 'Coordinates vendors automatically',
    body: 'No more texting vendors. No more "did they show up?" The system assigns, tracks, and enforces execution — and logs every step to audit trail.',
  },
  {
    icon: '📋',
    title: 'Tracks compliance in real time',
    body: 'Permits expire. Inspections lapse. Violations cost money. Lookara monitors every document across your portfolio and creates renewal tasks automatically — before anything slips.',
  },
  {
    icon: '🚨',
    title: 'Handles emergencies instantly',
    body: "A lockout at 2am shouldn't require a phone tree. The system detects, dispatches, tracks resolution, and logs the full incident — automatically. Included in every plan. Not an add-on.",
  },
];

const CHART_BARS = [60, 75, 90, 100, 85, 95, 80];

export default function Home() {
  const snapshotRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const scrollToSnapshot = () => {
    snapshotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Scrolling to live system snapshot');
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            ⚡ Emergency Response Included • Airbnb-Safe by Design
          </div>

          <h1 className="hero-title">
            The <span className="highlight">Operating System</span>
            <br />
            for Short-Term Rentals
          </h1>

          <p className="hero-subtitle">
            Not a dashboard. A real operating system. Purpose-built engines running 24/7
            to coordinate tasks, vendors, compliance, and emergencies. Built for property
            managers who run portfolios, not hobbies.
          </p>

          <p className="hero-economics">
            When operations break, revenue follows.
            <br />
            Lookara prevents the break before it happens.
          </p>

          <div className="hero-ctas">
            <Link to="/request-access" className="btn btn-primary" data-tip="Request early access">
              Request Access <span>→</span>
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              data-tip="Scroll to live demo"
              onClick={scrollToSnapshot}
            >
              See the OS in Action
            </button>
          </div>
        </div>

        <div className="hero-visual" ref={snapshotRef}>
          <div className="device-frame">
            <div className="device-screen">
              <div className="dashboard-mock">
                <div className="dash-header">
                  <div className="dash-logo">LOOKARA</div>
                  <div className="dash-user" />
                </div>

                <div className="dash-kpis">
                  <div className="kpi-card">
                    <div className="kpi-label">Properties</div>
                    <div className="kpi-value gold">24</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Tasks Today</div>
                    <div className="kpi-value">18</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Compliance</div>
                    <div className="kpi-value green">100%</div>
                  </div>
                </div>

                <div className="dash-main">
                  <div className="dash-chart">
                    <div className="chart-title">Task Completion</div>
                    <div className="chart-bars">
                      {CHART_BARS.map((h, i) => (
                        <div
                          key={i}
                          className="chart-bar"
                          style={{ ['--i' as string]: i, height: `${h}%` } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="dash-sidebar">
                    <div className="emergency-card">
                      <div className="emergency-header">
                        <div className="emergency-dot" />
                        <div className="emergency-label">Emergency</div>
                      </div>
                      <div className="emergency-text">Lockout resolved in 18 min</div>
                    </div>
                    <div className="ai-card">
                      <div className="ai-header">
                        <div className="ai-label">System Priority</div>
                      </div>
                      <div className="ai-text">3 high-risk tasks flagged</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER LINE ── */}
      <div className="filter-line">
        <p>
          If you're managing one property casually,{' '}
          <span className="filter-line__strong">this isn't for you.</span>
        </p>
      </div>

      {/* ── AUDIENCE ── */}
      <section className="audience-section">
        <div className="audience-container">
          <div className="section-label">Built for Professionals</div>
          <h2 className="section-title">Who is this for?</h2>
          <p className="section-sub">
            Built for professionals running real operations — not hobbyists managing one listing.
          </p>

          <div className="audience-grid">
            {AUDIENCE.map(a => (
              <div key={a.role} className="audience-card">
                <div className="audience-role">{a.role}</div>
                <div className="audience-name">
                  {a.name.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < a.name.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                <p className="audience-desc">{a.desc}</p>
                <Link to="/request-access" className="audience-cta" data-tip={a.tip}>
                  {a.cta} <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY LOOKARA ── */}
      <section className="why-section">
        <div className="why-container">
          <div className="why-header">
            <div className="section-label">Why Lookara</div>
            <h2 className="section-title">What the system actually does</h2>
            <p className="section-sub">
              No feature lists. Just outcomes that matter when operations are real.
            </p>
          </div>

          <div className="outcomes-grid">
            {OUTCOMES.map(o => (
              <div key={o.title} className="outcome-card">
                <div className="outcome-icon">{o.icon}</div>
                <div className="outcome-text">
                  <h4>{o.title}</h4>
                  <p>{o.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">
            Ready to run a real
            <br />
            <span className="highlight">operating system?</span>
          </h2>
          <p className="cta-sub">
            Request access or explore pricing. No pitch calls required — the system speaks for itself.
          </p>
          <div className="cta-buttons">
            <Link to="/request-access" className="btn btn-primary" data-tip="Request early access">
              Request Access →
            </Link>
            <Link to="/pricing" className="btn btn-secondary" data-tip="View plans and pricing">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}