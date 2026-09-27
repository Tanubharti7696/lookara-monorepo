// src/views/calendar/AgendaView.jsx
import { AGENDA_EVENTS, WEEK_START } from '../../data/calendar';

export default function AgendaView({ search }) {
  const term = search.trim().toLowerCase();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const visible = AGENDA_EVENTS.filter(ev => {
    if (!term) return true;
    return ev.property.toLowerCase().includes(term) ||
           ev.title.toLowerCase().includes(term);
  });

  return (
    <div className="agenda-view">
      <div className="agenda-list">
        {visible.length === 0 ? (
          <div className="agenda-empty">No events match your search.</div>
        ) : visible.map((ev, i) => {
          const d = new Date(WEEK_START);
          d.setDate(WEEK_START.getDate() + ev.dow);
          const dateStr = `${days[ev.dow]}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          return (
            <div key={i} className="agenda-item">
              <div className="agenda-time">{dateStr} • {ev.time}</div>
              <div className={`agenda-title event ${ev.type}`}>{ev.title}</div>
              <div className="agenda-property">{ev.property}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}