import { SOURCE_LABELS } from '../../data/constants';
import JourneyList from '../JourneyList';

function block(title, children) {
  return <div className="dr-block"><div className="dr-block-title">{title}</div>{children}</div>;
}
function row(label, val, color) {
  const cls = color ? `dr-row-val ${color}` : 'dr-row-val';
  return <div className="dr-row"><span className="dr-row-label">{label}</span><span className={cls}>{val}</span></div>;
}
function sevColor(s) { return s === 'CRITICAL' ? 'red' : s === 'HIGH' ? 'amber' : s === 'MEDIUM' ? 'blue' : 'muted'; }

export default function OverviewTab({ task, onRelatedClick }) {
  return (
    <>
      {block('Task Details', <>
        {row('Task Type', task.taskType || '—', 'blue')}
        {row('Category', task.category)}
        {row('Priority', task.severity, sevColor(task.severity))}
        {row('Source', SOURCE_LABELS[task.source] || '✍ Manual')}
        {row('Due Date', task.due, task.slaStatus === 'OVERDUE' ? 'red' : task.slaStatus === 'AT RISK' ? 'amber' : '')}
        {row('Current Owner', task.vendor || 'Unassigned', task.vendor ? '' : 'muted')}
        {row('Created By', task.createdBy)}
        {row('Created', task.created)}
      </>)}

      {task.recurring && block('Recurring Pattern', <>
        {row('Frequency', task.recurring.frequency)}
        {row('Last Completed', task.recurring.lastCompleted, 'green')}
        {row('Next Occurrence', task.recurring.nextOccurrence)}
        {row('Completion History', task.recurring.completionHistory, 'green')}
      </>)}

      {task.compliance && block('Compliance Requirement', <>
        {row('Type', task.compliance.type)}
        {row('Due Date', task.compliance.dueDate, 'amber')}
        {row('Regulatory Body', task.compliance.regulatoryBody)}
        {row('Documents Required', task.compliance.docsRequired)}
      </>)}

      {block('Property Status', <>
        {row('Occupancy', task.occupancy)}
        {row('Last Inspection', task.lastInspection)}
        {row('Open Incidents', task.openIncidents > 0
          ? <span><span style={{color:'var(--amber)'}}>{task.openIncidents} Active</span> <a onClick={(e) => { e.preventDefault(); onRelatedClick('Viewing linked incident…'); }} href="#" style={{color:'var(--gold)',fontWeight:600,textDecoration:'none',marginLeft:6}}>View Incident →</a></span>
          : <span style={{color:'var(--muted)'}}>0</span>)}
      </>)}

      {task.relatedRecords && task.relatedRecords.length > 0 && block('Related Records',
        task.relatedRecords.map((r, i) => (
          <div key={i} onClick={() => onRelatedClick('Opening ' + r.label)}
            style={{
              display:'flex', alignItems:'center', gap:8, padding:'6px 0', cursor:'pointer',
              borderBottom: i < task.relatedRecords.length - 1 ? '1px solid var(--line)' : 'none',
              fontSize:12, color:'var(--muted)', transition:'color 150ms',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--gold)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--muted)'}
          >
            <span style={{fontSize:13}}>{r.icon}</span>
            <span style={{flex:1}}>{r.label}</span>
            <span style={{color:'var(--line)'}}>›</span>
          </div>
        ))
      )}

      {block('Current Journey', <JourneyList task={task} />)}
    </>
  );
}
