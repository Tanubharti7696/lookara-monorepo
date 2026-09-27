import { STATE_META, TASKS } from '../data/constants';

export default function StatePanel({ currentState, onLoad }) {
  return (
    <div className="state-card">
      <div className="state-card-title">All States</div>
      {Object.entries(STATE_META).map(([key, sm]) => {
        const matchingTask = TASKS.find(t => t.state === key);
        return (
          <div
            key={key}
            className={`state-item ${matchingTask ? '' : 'no-task'} ${currentState === key ? 'current' : ''}`}
            title={matchingTask ? `Load: ${matchingTask.name}` : 'No task for this state'}
            onClick={matchingTask ? () => onLoad(matchingTask.name) : undefined}
          >
            <span className="state-name">{sm.label}</span>
            <span className="state-dot" style={{background:sm.color,margin:'0 6px'}}></span>
            {matchingTask && <span className="state-arrow">›</span>}
          </div>
        );
      })}
    </div>
  );
}
