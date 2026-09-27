import { JOURNEY_PATHS, TERMINAL_LABELS } from '../data/constants';

export default function JourneyList({ task }) {
  const path = JOURNEY_PATHS[task.journeyType] || JOURNEY_PATHS.repair;
  const currentIdx = path.findIndex(s => s.state === task.state);

  const createdStep = (
    <div className="journey-step done">
      <div className="journey-dot"></div>
      <div className="journey-label">✓ Created</div>
    </div>
  );

  if (currentIdx === -1 && TERMINAL_LABELS[task.state]) {
    const blockIdx = task.journeyBlockIndex ?? 0;
    const rows = [];
    for (let i = 0; i <= blockIdx; i++) {
      rows.push(<div className="journey-step done" key={`d${i}`}><div className="journey-dot"></div><div className="journey-label">✓ {path[i].label}</div></div>);
    }
    rows.push(
      <div className="journey-step terminal" key="terminal">
        <div className="journey-dot"></div>
        <div className="journey-label">🔴 {TERMINAL_LABELS[task.state]}</div>
        <span className="journey-current-tag">Current</span>
      </div>
    );
    for (let i = blockIdx + 1; i < path.length; i++) {
      rows.push(<div className="journey-step upcoming" key={`u${i}`}><div className="journey-dot"></div><div className="journey-label">○ {path[i].label}</div></div>);
    }
    return <div className="journey-list">{createdStep}{rows}</div>;
  }

  return (
    <div className="journey-list">
      {createdStep}
      {path.map((step, i) => {
        const isSkipped = task.skippedSteps?.includes(step.state);
        const cls = isSkipped ? 'skipped' : i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'upcoming';
        const icon = isSkipped ? '— ' : i < currentIdx ? '✓ ' : i === currentIdx ? '🟡 ' : '○ ';
        const tag = i === currentIdx ? <span className="journey-current-tag">Current</span> : null;
        const note = isSkipped ? <span style={{color:'var(--slate)',fontStyle:'italic'}}> (not required)</span> : null;
        return (
          <div key={step.state} className={`journey-step ${cls}`}>
            <div className="journey-dot"></div>
            <div className="journey-label">{icon}{step.label}{note}</div>
            {tag}
          </div>
        );
      })}
    </div>
  );
}
