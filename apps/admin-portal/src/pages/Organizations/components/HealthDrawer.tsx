// src/pages/Organizations/components/HealthDrawer.tsx
type Props = { orgName: string; score: number; onClose: () => void };

const CATEGORIES = [
  { label: 'Compliance',      max: 25, score: 18, items: ['Vendor compliance rate','Expired licenses','Missing documents','Insurance status'] },
  { label: 'Operations',      max: 20, score: 10, items: ['PM response time','SLA performance','Job completion rate','Approval delays'] },
  { label: 'Vendor Network',  max: 20, score: 9,  items: ['Vendor no-show rate','Active flags','Reliability','Coverage gaps'] },
  { label: 'Financial',       max: 15, score: 11, items: ['Payment disputes','Delayed payouts','Outstanding balances'] },
  { label: 'Platform Usage',  max: 10, score: 5,  items: ['Last activity','User adoption','Login frequency'] },
  { label: 'Support & Risk',  max: 10, score: 4,  items: ['Support cases','Escalations','Internal warnings'] },
];

const RISKS = [
  '🔴 Vendor no-show rate above threshold',
  '🔴 Compliance below 80%',
  '🟠 PM response time increasing',
  '🟠 Multiple payment disputes',
];

const ACTIONS = [
  '✓ Renew vendor compliance documents',
  '✓ Reduce approval delays',
  '✓ Improve PM response time',
  '✓ Resolve outstanding payment disputes',
];

const TREND = [84, 81, 76, 69, 57];
const HISTORY = [
  ['Apr 14', '57 — At Risk', 'red'],
  ['Apr 7',  '63 — Needs Attention', 'yellow'],
  ['Mar 31', '71 — Needs Attention', 'yellow'],
  ['Mar 24', '83 — Healthy', 'green'],
] as const;

export default function HealthDrawer({ orgName, score, onClose }: Props) {
  const color = score >= 85 ? 'var(--green)' : score >= 65 ? 'var(--yellow)' : 'var(--red)';
  const label = score >= 85 ? 'Healthy' : score >= 65 ? 'Needs Attention' : 'At Risk';
  const maxTrend = Math.max(...TREND);

  return (
    <>
      <div className="og-health-overlay" onClick={onClose} />
      <aside className="og-health-drawer">
        <header className="og-health__head">
          <div>
            <div className="og-health__eyebrow">Organization Health Score</div>
            <div className="og-health__org">{orgName}</div>
          </div>
          <button className="og-drawer__close" onClick={onClose}>✕</button>
        </header>

        <div className="og-health__score-strip">
          <div>
            <div className="og-health__score" style={{ color }}>{score}</div>
            <div className="og-health__score-of">/ 100</div>
          </div>
          <div>
            <div className="og-health__label" style={{ color }}>{label}</div>
            <div className="og-health__calc">Last calculated: Today · 2:15 PM</div>
          </div>
        </div>

        <div className="og-health__block">
          <div className="og-health__block-lbl">Score Breakdown</div>
          {CATEGORIES.map((c) => {
            const pct = Math.round((c.score / c.max) * 100);
            const cc = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';
            return (
              <div key={c.label} className="og-health__cat">
                <div className="og-health__cat-row">
                  <span className="og-health__cat-lbl">{c.label} ({c.max} pts)</span>
                  <span className="og-health__cat-val" style={{ color: cc }}>{c.score} / {c.max}</span>
                </div>
                <div className="og-health__bar">
                  <div className="og-health__bar-fill" style={{ width: `${pct}%`, background: cc }} />
                </div>
                <div className="og-health__cat-items">{c.items.join(' · ')}</div>
              </div>
            );
          })}
        </div>

        <div className="og-health__block">
          <div className="og-health__block-lbl">Current Risk Drivers</div>
          {RISKS.map((r) => (
            <div key={r} className="og-health__line">{r}</div>
          ))}
        </div>

        <div className="og-health__block">
          <div className="og-health__block-lbl">Recommended Actions</div>
          {ACTIONS.map((a) => (
            <div key={a} className="og-health__line og-health__line--muted">{a}</div>
          ))}
        </div>

        <div className="og-health__block">
          <div className="og-health__block-lbl">Score Trend · Last 90 Days</div>
          <div className="og-health__trend">
            {TREND.map((v, i) => (
              <div
                key={i}
                title={`${v}`}
                className="og-health__trend-bar"
                style={{
                  height: `${(v / maxTrend) * 100}%`,
                  background: v >= 80 ? 'var(--green)' : v >= 65 ? 'var(--yellow)' : 'var(--red)',
                  opacity: i === TREND.length - 1 ? 0.9 : 0.5,
                }}
              />
            ))}
          </div>
          <div className="og-health__trend-delta">↓ -27 points</div>
          <div className="og-health__trend-cause">
            Primary causes: Vendor reliability · Compliance expiration · Payment disputes
          </div>
        </div>

        <div className="og-health__block">
          <div className="og-health__block-lbl">Health History</div>
          {HISTORY.map(([date, txt, tone]) => (
            <div key={date} className="og-health__history-row">
              <span className="og-health__history-date">{date}</span>
              <span className={`og-health__history-val is-${tone}`}>{txt}</span>
            </div>
          ))}
        </div>

        <div className="og-health__foot-note">
          Health Score is calculated automatically from operational performance, compliance, vendor
          reliability, financial activity, and platform usage. The score updates continuously and
          cannot be edited.
        </div>
      </aside>
    </>
  );
}