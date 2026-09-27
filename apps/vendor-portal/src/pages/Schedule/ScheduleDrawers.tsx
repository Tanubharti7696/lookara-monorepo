// apps/vendor-portal/src/pages/Schedule/ScheduleDrawers.tsx
import { useState } from 'react';
import type { CalEvent, WorkDay, Vacation } from './Schedule';
import { AVAILABILITY_RULES, getWeekDate } from './Schedule';
import './ScheduleDrawers.css';

type Toast = (msg: string, tone?: 'info' | 'success' | 'danger' | 'warn') => void;

/* ── Shared shell ── */
function Shell({
  onClose, header, children, footer,
}: {
  onClose: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <aside className="drawer open">
        <div className="drawer-hdr">{header}</div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-foot">{footer}</div>
      </aside>
    </>
  );
}

/* ═══════════════ BLOCK DRAWER ═══════════════ */
export function BlockDrawer({
  dayIdx, hour, events, onClose, onSave,
}: {
  dayIdx: number;
  hour: number;
  events: CalEvent[];
  onClose: () => void;
  onSave: (dayIdx: number, sh: number, sm: number, dur: number, reason: string) => void;
}) {
  const dayName = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][dayIdx] || 'Wed';
  const _dateNum = getWeekDate(0, dayIdx).getDate();
  void _dateNum;
  const [start, setStart] = useState(`${String(hour).padStart(2, '0')}:00`);
  const [end, setEnd] = useState(`${String(Math.min(hour + 1, 20)).padStart(2, '0')}:00`);
  const [reason, setReason] = useState('Personal');
  const [repeat, setRepeat] = useState<'once' | 'weekly' | 'daily'>('once');
  const [conflict, setConflict] = useState<CalEvent | null>(null);

  const handleSave = () => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const dur = (eh * 60 + em) - (sh * 60 + sm);
    if (dur <= 0) return;

    // Detect job conflict
    const blockStart = sh * 60 + sm;
    const blockEnd = blockStart + dur;
    const clash = events.find((e) => {
      if (e.day !== dayIdx) return false;
      if (e.type === 'unavail' || e.type === 'personal') return false;
      const evStart = e.startH * 60 + e.startM;
      const evEnd = evStart + e.dur;
      return blockStart < evEnd && blockEnd > evStart;
    });
    if (clash && !conflict) { setConflict(clash); return; }
    onSave(dayIdx, sh, sm, dur, reason);
  };

  const reasons = ['Personal', 'Vacation', 'Equipment Maintenance', 'Travel Day', 'Medical', 'Other'];
  const repeats = [
    { val: 'once' as const, label: 'This day only' },
    { val: 'weekly' as const, label: `Every ${dayName}` },
    { val: 'daily' as const, label: 'Daily (all days)' },
  ];

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">Block Time</div>
            <div className="dh-sub">Dispatch engine will not send jobs in this window</div>
          </div>
          <button className="dh-close" onClick={onClose}>×</button>
        </>
      }
      footer={
        conflict ? (
          <>
            <button className="btn-prim" onClick={handleSave}>Save Anyway</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn-prim" onClick={handleSave}>Save Block</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        )
      }
    >
      {conflict ? (
        <div className="conflict-block">
          <div className="conflict-title">⚠ Schedule Conflict</div>
          <div className="conflict-body">
            Your block <strong>{start} – {end}</strong> overlaps with:<br />
            <strong style={{ color: 'var(--gold)' }}>{conflict.title}</strong> at {conflict.property}
          </div>
          <div className="conflict-note">
            You can still save this block. The existing job will not be cancelled — you'll need to manage it manually in Jobs &amp; Tasks.
          </div>
          <div className="protect-note">
            ✓ Blocked time protects your reliability score — declined jobs during this window will not count against you.
          </div>
        </div>
      ) : (
        <>
          <div className="field-wrap">
            <label className="field-lbl">Time</label>
            <div className="grid-2">
              <div>
                <div className="sub-lbl">Start</div>
                <input type="time" className="tp-input" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <div className="sub-lbl">End</div>
                <input type="time" className="tp-input" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="field-wrap">
            <label className="field-lbl">Reason</label>
            <div className="reason-grid">
              {reasons.map((r) => (
                <button
                  key={r}
                  className={`reason-btn ${reason === r ? 'sel' : ''}`}
                  onClick={() => setReason(r)}
                >{r}</button>
              ))}
            </div>
          </div>

          <div className="field-wrap">
            <label className="field-lbl">Apply To</label>
            <div className="reason-grid">
              {repeats.map((r) => (
                <button
                  key={r.val}
                  className={`reason-btn ${repeat === r.val ? 'sel' : ''}`}
                  onClick={() => setRepeat(r.val)}
                >{r.label}</button>
              ))}
            </div>
          </div>

          <div className="protect-note">
            ✓ Blocked time does not affect your acceptance rate, timeout rate, or SLA metrics. Your reliability score is protected.
          </div>
        </>
      )}
    </Shell>
  );
}

/* ═══════════════ EVENT DRAWER ═══════════════ */
export function EventDrawer({
  event, onClose, onRemove, showToast,
}: {
  event: CalEvent | null;
  onClose: () => void;
  onRemove: (id: string) => void;
  showToast: Toast;
}) {
  if (!event) return null;

  /* Job / Emergency / Recurring */
  if (event.type === 'job' || event.type === 'emg' || event.type === 'recurring') {
    const startTime = `${event.startH < 12 ? event.startH : event.startH - 12}:${String(event.startM).padStart(2, '0')} ${event.startH < 12 ? 'AM' : 'PM'}`;
    const endH = event.startH + Math.floor((event.startM + event.dur) / 60);
    const endM = (event.startM + event.dur) % 60;
    const endTime = `${endH < 12 ? endH : endH - 12}:${String(endM).padStart(2, '0')} ${endH < 12 ? 'AM' : 'PM'}`;
    const statusLabel: Record<string, string> = {
      accepted: 'Accepted', enroute: 'En Route', onsite: 'On Site',
      inprog: 'In Progress', submitted: 'Submitted',
    };
    const isEmg = event.type === 'emg';

    return (
      <Shell
        onClose={onClose}
        header={
          <div className="jd-hdr-left">
            <div className="dh-title">{event.title}</div>
            <div className="dh-meta">
              <span className={`chip chip-${event.status}`}>{statusLabel[event.status ?? 'accepted']}</span>
              {isEmg && <span className="chip chip-emg">⚡ Emergency</span>}
              {event.property && <span className="dh-sub">{event.property} · {event.city}</span>}
              {event.payout != null && <span className="jd-payout">${event.payout}</span>}
            </div>
            <div className="ev-actions">
              <button className="btn-gold-sm" onClick={() => showToast('Navigation opens Google Maps · Phase 2: live coordinates')}>▶ Navigate</button>
              <button className="btn-emerald-sm" onClick={() => showToast('Go to Jobs & Tasks to start this job')}>▶ Start Job</button>
              <button className="btn-mute-sm" onClick={() => showToast('Contact PM · Task-bound messaging is in Jobs & Tasks')}>📞</button>
            </div>
          </div>
        }
        footer={
          event.status === 'submitted'
            ? <button className="btn-prim is-slate" disabled>Awaiting Verification</button>
            : <>
                <button className="btn-prim" onClick={() => { window.location.href = `/jobs?open=${event.id}`; }}>Open Full Job →</button>
                <button className="btn-sec" onClick={() => showToast('En route logged')}>🚗 Start Route</button>
              </>
        }
      >
        <div className="ev-sec">
          <div className="ev-sec-title">Job Summary</div>
          <div className="kv-row"><span className="kv-lbl">Time Window</span><span className="kv-val">{startTime} – {endTime}</span></div>
          <div className="kv-row"><span className="kv-lbl">Duration</span><span className="kv-val">{event.dur} min</span></div>
          <div className="kv-row"><span className="kv-lbl">Distance</span><span className="kv-val">{event.dist || '—'}</span></div>
          <div className="kv-row"><span className="kv-lbl">PM</span><span className="kv-val">{event.pm || '—'}</span></div>
          {isEmg && event.payBonus && (
            <div className="kv-row"><span className="kv-lbl">Urgency Bonus</span><span className="kv-val crimson">+${event.payBonus}</span></div>
          )}
        </div>
        {event.gateCode && (
          <div className="ev-sec">
            <div className="ev-sec-title">Access Instructions</div>
            <div className="access-blk">
              <div className="ab-item"><div className="ab-lbl">Gate Code</div><div className="ab-val">{event.gateCode}</div></div>
              <div className="ab-item"><div className="ab-lbl">Lock Box</div><div className="ab-val">{event.lockBox}</div></div>
              <div className="ab-item"><div className="ab-lbl">Parking</div><div className="ab-val">{event.parking}</div></div>
              <div className="ab-item"><div className="ab-lbl">Address</div><div className="ab-val xs">{event.address}</div></div>
            </div>
          </div>
        )}
        {event.checklist && event.checklist.length > 0 && (
          <div className="ev-sec">
            <div className="ev-sec-title">Checklist</div>
            {event.checklist.map((c, i) => (
              <div key={i} className="ck-item">
                <div className={`ck-box ${c.done ? 'chk' : ''}`} />
                <span className={`ck-lbl ${c.done ? 'done' : ''}`}>{c.text}</span>
              </div>
            ))}
          </div>
        )}
        {event.timeline && event.timeline.length > 0 && (
          <div className="ev-sec">
            <div className="ev-sec-title">Activity Log</div>
            {event.timeline.map((t, i) => (
              <div key={i} className="tl-item">
                <div><div className={`tl-dot ${t.state}`} />{i < event.timeline!.length - 1 && <div className="tl-line" />}</div>
                <div>
                  <div className="tl-event">{t.event}</div>
                  {t.time && <div className="tl-time">{t.time}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Shell>
    );
  }

  /* Blocked / unavail */
  if (event.type === 'unavail' || event.type === 'personal') {
    const rule = event.ruleId ? AVAILABILITY_RULES.find((r) => r.id === event.ruleId) : null;
    const typeLabel = rule?.type === 'weekly' ? 'Recurring — Weekly' : rule?.type === 'daily' ? 'Recurring — Daily' : 'One-time Block';
    const startTime = `${event.startH < 12 ? event.startH || 12 : event.startH - 12}:${String(event.startM).padStart(2, '0')} ${event.startH < 12 ? 'AM' : 'PM'}`;
    const endH = event.startH + Math.floor((event.startM + event.dur) / 60);
    const endM = (event.startM + event.dur) % 60;
    const endTime = `${endH < 12 ? endH : endH - 12}:${String(endM).padStart(2, '0')} ${endH < 12 ? 'AM' : 'PM'}`;
    const isAllDay = event.dur >= 1440;

    return (
      <Shell
        onClose={onClose}
        header={
          <>
            <div>
              <div className="dh-title">⛔ Blocked — {event.reason || 'Personal'}</div>
              <div className="dh-meta">
                <span className="chip chip-unavail">{typeLabel}</span>
                <span className="dh-sub">{isAllDay ? 'All day' : `${startTime} – ${endTime}`}</span>
              </div>
            </div>
            <button className="dh-close" onClick={onClose}>×</button>
          </>
        }
        footer={
          <>
            <button className="btn-prim btn-crimson" onClick={() => onRemove(event.ruleId ?? event.id)}>Remove Block</button>
            <button className="btn-sec" onClick={onClose}>Close</button>
          </>
        }
      >
        <div className="ev-sec">
          <div className="ev-sec-title">Block Details</div>
          <div className="kv-row"><span className="kv-lbl">Time</span><span className="kv-val">{isAllDay ? 'All day' : `${startTime} – ${endTime}`}</span></div>
          <div className="kv-row"><span className="kv-lbl">Duration</span><span className="kv-val">{isAllDay ? '24h' : `${event.dur} min`}</span></div>
          <div className="kv-row"><span className="kv-lbl">Reason</span><span className="kv-val">{event.reason || 'Personal'}</span></div>
          <div className="kv-row"><span className="kv-lbl">Repeat</span><span className="kv-val">{rule ? (rule.type === 'weekly' ? 'Every ' + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][rule.weekday ?? 0] : rule.type === 'daily' ? 'Every day' : 'One-time') : 'One-time'}</span></div>
        </div>
        <div className="drawer-note is-amber">
          ⚠ Dispatch engine will not assign jobs during this window (unless Emergency On-Call).
        </div>
        <div className="drawer-note is-emerald">
          ✓ Acceptance rate, timeout rate, and SLA metrics are not affected during this window.
        </div>
      </Shell>
    );
  }

  /* Vacation */
  if (event.type === 'vacation') {
    return (
      <Shell
        onClose={onClose}
        header={
          <>
            <div>
              <div className="dh-title">✈ Vacation</div>
              <div className="dh-meta">
                <span className="chip chip-personal">Vacation</span>
                <span className="dh-sub">{event.reason}</span>
              </div>
            </div>
            <button className="dh-close" onClick={onClose}>×</button>
          </>
        }
        footer={<button className="btn-sec full" onClick={onClose}>Close</button>}
      >
        <div className="drawer-note is-blue">
          ℹ PMs can still see your profile with a "Vacation" tag — you won't appear to have disappeared from the network.
        </div>
      </Shell>
    );
  }

  return null;
}

/* ═══════════════ WORKING HOURS DRAWER ═══════════════ */
export function WorkingHoursDrawer({
  hours, onClose, showToast,
}: {
  hours: Record<string, WorkDay>;
  onClose: () => void;
  showToast: Toast;
}) {
  const [local, setLocal] = useState(hours);
  const days = Object.entries(local);

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">Working Hours</div>
            <div className="dh-sub">Baseline dispatch eligibility window</div>
          </div>
          <button className="dh-close" onClick={onClose}>×</button>
        </>
      }
      footer={
        <>
          <button className="btn-prim" onClick={() => { showToast('Working hours saved', 'success'); onClose(); }}>Save Hours</button>
          <button className="btn-sec" onClick={onClose}>Cancel</button>
        </>
      }
    >
      <div className="ev-sec">
        <div className="ev-sec-title">Daily Schedule</div>
        {days.map(([day, cfg]) => (
          <div key={day} className="wh-edit-row">
            <span className="wh-edit-day">{day}</span>
            <div
              className={`toggle ${cfg.enabled ? 'on' : ''}`}
              onClick={() => setLocal((l) => ({ ...l, [day]: { ...l[day], enabled: !l[day].enabled } }))}
            />
            <div className={`wh-time-inputs ${cfg.enabled ? '' : 'disabled'}`}>
              <input type="time" className="tp-input" value={cfg.start ?? '08:00'}
                onChange={(e) => setLocal((l) => ({ ...l, [day]: { ...l[day], start: e.target.value } }))} />
              <span className="wh-dash">–</span>
              <input type="time" className="tp-input" value={cfg.end ?? '17:00'}
                onChange={(e) => setLocal((l) => ({ ...l, [day]: { ...l[day], end: e.target.value } }))} />
            </div>
          </div>
        ))}
      </div>
      <div className="drawer-note is-blue">
        ℹ Dispatch will only offer jobs within these hours. Emergency jobs follow the Emergency On-Call setting independently.
      </div>
    </Shell>
  );
}

/* ═══════════════ VACATION DRAWER ═══════════════ */
export function VacationDrawer({
  existing, onClose, onSave, onCancel,
}: {
  existing: Vacation | null;
  onClose: () => void;
  onSave: (vacId: string | null, start: string, end: string, note: string) => void;
  onCancel: (vacId: string) => void;
}) {
  const [start, setStart] = useState(existing?.startDate ?? '2026-03-18');
  const [end, setEnd] = useState(existing?.endDate ?? '2026-03-25');
  const [note, setNote] = useState(existing?.note ?? '');
  const [err, setErr] = useState('');

  const handleSave = () => {
    if (!start || !end || start >= end) {
      setErr('⚠ Return date must be after start date.');
      setTimeout(() => setErr(''), 3000);
      return;
    }
    onSave(existing?.id ?? null, start, end, note);
  };

  const rules: [string, string][] = [
    ['Removed from automatic dispatch',   'Vendors on vacation are skipped by auto-dispatch'],
    ['Removed from emergency routing',    'Emergency jobs will not be sent to you'],
    ['Hidden from pool auto-selection',   'You remain visible to PMs manually'],
    ['Reliability metrics paused',        'No acceptance, timeout, or SLA penalties'],
  ];

  return (
    <Shell
      onClose={onClose}
      header={
        <>
          <div>
            <div className="dh-title">{existing ? 'Edit Vacation' : '✈ Add Vacation'}</div>
            <div className="dh-sub">All dispatch rules suspended during this period</div>
          </div>
          <button className="dh-close" onClick={onClose}>×</button>
        </>
      }
      footer={
        existing ? (
          <>
            <button className="btn-prim" onClick={handleSave}>Update Vacation</button>
            <button className="btn-sec btn-crimson" onClick={() => onCancel(existing.id)}>Cancel Vacation</button>
          </>
        ) : (
          <>
            <button className="btn-prim" onClick={handleSave}>Save Vacation</button>
            <button className="btn-sec" onClick={onClose}>Cancel</button>
          </>
        )
      }
    >
      {err && <div className="drawer-note is-crimson" style={{ fontSize: 11 }}>{err}</div>}
      <div className="ev-sec">
        <div className="ev-sec-title">Vacation Period</div>
        <div className="grid-2">
          <div>
            <div className="sub-lbl">Start Date</div>
            <input type="date" className="tp-input" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <div className="sub-lbl">Return Date</div>
            <input type="date" className="tp-input" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="ev-sec">
        <div className="ev-sec-title">Note (Optional)</div>
        <input type="text" className="tp-input" placeholder="e.g. Spring break, family trip…"
          value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div className="ev-sec">
        <div className="ev-sec-title">Dispatch Engine Rules Applied</div>
        {rules.map(([label, sub]) => (
          <div key={label} className="vac-rule-row">
            <span className="vac-rule-check">✓</span>
            <div>
              <div className="vac-rule-label">{label}</div>
              <div className="vac-rule-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="drawer-note is-blue">
        ℹ PMs can still see your profile with a <strong>"Vacation until [date]"</strong> tag. You won't appear to have disappeared from the network.
      </div>
    </Shell>
  );
}