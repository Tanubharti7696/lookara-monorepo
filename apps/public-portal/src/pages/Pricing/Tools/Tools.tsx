// apps/public-portal/src/pages/Tools/Tools.tsx
import { Link } from 'react-router-dom';
import './Tools.css';

type Tool = {
  name: string;
  badge?: string;
  badgeKind?: 'core';
  purpose: string;
  bullets: string[];
};

type Layer = {
  icon: string;
  name: string;
  desc: string;
  tools: Tool[];
};

const LAYERS: Layer[] = [
  {
    icon: '⚙️',
    name: 'Execution Layer',
    desc: 'Where operations run and tasks get done.',
    tools: [
      {
        name: 'Task Board',
        purpose: 'SLA-aware control of every active task.',
        bullets: [
          'Risk states: on track / at risk / overdue',
          'Instant assignment and escalation',
          'Writes to audit trail automatically',
        ],
      },
      {
        name: 'Emergency Mode',
        badge: 'Core · Always Included',
        badgeKind: 'core',
        purpose: 'When something breaks, the system takes over.',
        bullets: [
          'Activate → dispatch → track → resolve',
          'Every second logged. No chaos.',
          'Not an upsell. Never will be.',
        ],
      },
    ],
  },
  {
    icon: '👥',
    name: 'Vendor Layer',
    desc: 'Dispatch, track, and hold vendors accountable.',
    tools: [
      {
        name: 'Vendor Management',
        purpose: 'Build and manage vendor pools with operational accountability.',
        bullets: [
          'Pools by skill and service area',
          'Operational reliability tracking — not reviews',
          'Preferred vendors + fallback logic',
        ],
      },
      {
        name: 'Dispatch System',
        purpose: 'Automatic vendor assignment based on task context.',
        bullets: [
          'No manual coordination required',
          'Response tracking and escalation',
          'Every dispatch logged to audit',
        ],
      },
    ],
  },
  {
    icon: '⚖️',
    name: 'Compliance Layer',
    desc: 'Regulatory risk surfaced before it costs you.',
    tools: [
      {
        name: 'Compliance Dashboard',
        purpose: 'Requirements, documents, and expirations — risk-first visibility.',
        bullets: [
          'Expiring and overdue views with urgency signals',
          'Document uploads with audit visibility',
        ],
      },
      {
        name: 'Inspection & Renewal Scheduler',
        purpose: 'Schedule inspections and renewals before they become emergencies.',
        bullets: [
          'Creates calendar events and prep tasks',
          'Reminder routing through Notification Engine',
        ],
      },
    ],
  },
  {
    icon: '🗓️',
    name: 'Operational Visibility',
    desc: "Portfolio-wide view of what's active, what's at risk.",
    tools: [
      {
        name: 'Portfolio Dashboard',
        purpose: 'Portfolio health at a glance. SLA risk. Tasks. Compliance.',
        bullets: [
          'Fast overview — no heavy BI required',
          'Drill-down into tasks, vendors, compliance, alerts',
        ],
      },
      {
        name: 'Portfolio Calendar',
        purpose: 'Unified view of tasks, inspections, and maintenance across all properties.',
        bullets: [
          'Filter by property and event type',
          'Conflict awareness — no fake optimization claims',
        ],
      },
    ],
  },
  {
    icon: '🔔',
    name: 'System Awareness',
    desc: 'The right alert to the right person at the right time.',
    tools: [
      {
        name: 'Notifications Center',
        purpose: 'Severity-based alerts routed by role — not noise.',
        bullets: [
          'Acknowledge vs. read states',
          'Quiet hours for non-critical alerts',
          'In-app first; email and push optional',
        ],
      },
    ],
  },
  {
    icon: '🧾',
    name: 'Accountability Layer',
    desc: 'Every action recorded. Nothing rewritten.',
    tools: [
      {
        name: 'Audit History',
        purpose: 'Immutable log of every action across the system.',
        bullets: [
          'Who did what, when, and why',
          'Advanced filters: actor, property, event type, severity',
          'Export-ready for compliance and operational review',
        ],
      },
    ],
  },
  {
    icon: '📈',
    name: 'Operational Analytics',
    desc: 'Performance data derived from system activity — no manual reporting.',
    tools: [
      {
        name: 'Reports & Analytics',
        purpose: 'Operational performance across tasks, vendors, compliance, and properties.',
        bullets: [
          'SLA performance, vendor reliability, compliance status',
          'Exports: PDF, CSV, Excel — scheduled delivery',
          'Not accounting. Not pricing optimization.',
        ],
      },
    ],
  },
];

export default function Tools() {
  return (
    <div className="tools-page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Operational Control Surfaces</div>
          <h1>
            Control the operation.
            <br />
            <span className="highlight">Not manage it.</span>
          </h1>
          <p className="hero-sub">
            Each tool connects directly to the same execution engine. Nothing runs in isolation.
          </p>
          <p className="hero-note">
            If you're looking for features, this isn't it. This is execution.
          </p>
          <Link to="/request-access" className="btn-primary" data-tip="Request early access">
            Request Access →
          </Link>
        </div>
      </section>

      {/* ── FRAMING STRIP ── */}
      <div className="framing">
        <div className="container">
          <div className="framing-inner">
            <div className="framing-text">
              You don't use these tools separately.{' '}
              <strong>You use them as one system.</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOOLS BODY ── */}
      <div className="tools-body">
        <div className="container">
          {LAYERS.map((layer, i) => (
            <div key={i} className="layer">
              <div className="layer-label">
                <div className="layer-icon">{layer.icon}</div>
                <div className="layer-name">{layer.name}</div>
                <div className="layer-desc">{layer.desc}</div>
              </div>

              <div className="layer-tools">
                {layer.tools.map((tool, j) => (
                  <div key={j} className="tool-row">
                    <div className="tool-name-col">
                      <div className="tool-name">{tool.name}</div>
                      {tool.badge && (
                        <div className={`tool-badge ${tool.badgeKind === 'core' ? 'core' : ''}`}>
                          {tool.badge}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="tool-purpose">{tool.purpose}</p>
                      <ul className="tool-bullets">
                        {tool.bullets.map((b, k) => <li key={k}>{b}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── UNDER THE HOOD ── */}
      <div className="hood-section">
        <div className="container">
          <div className="hood-inner">
            <div className="hood-label">Powered by:</div>
            <div className="hood-text">
              Task orchestration · Vendor graph · Audit system · Notification routing
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2>
              Run operations like a system.
              <br />
              <span className="highlight">Or keep managing manually.</span>
            </h2>
            <p>Every tool. One engine. No manual coordination.</p>
            <Link to="/request-access" className="btn-primary" data-tip="Request early access">
              Request Access →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}