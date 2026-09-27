// apps/vendor-portal/src/pages/Schedule/Schedule.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useVendor } from '../../context/VendorContext';
import {
  BlockDrawer, EventDrawer, WorkingHoursDrawer, VacationDrawer,
} from './ScheduleDrawers';
import './Schedule.css';

/* ── TYPES ── */
export type EventType = 'job' | 'emg' | 'recurring' | 'unavail' | 'personal' | 'vacation';
export type EventStatus = 'accepted' | 'enroute' | 'onsite' | 'inprog' | 'submitted' | 'blocked';

export interface CalEvent {
  id: string;
  type: EventType;
  day: number; // column index 0–6
  startH: number;
  startM: number;
  dur: number;
  title: string;
  property?: string;
  city?: string;
  dist?: string;
  pm?: string;
  payout?: number;
  status?: EventStatus;
  reason?: string;
  ruleId?: string;
  fromRule?: boolean;
  fromVacation?: boolean;
  vacId?: string;
  checklist?: { done: boolean; text: string }[];
  timeline?: { event: string; time: string; state: 'ok' | 'pending' | 'warn' }[];
  gateCode?: string;
  lockBox?: string;
  parking?: string;
  address?: string;
  payBase?: number;
  payBonus?: number;
}

/* ── WORKING HOURS ── */
export interface WorkDay { enabled: boolean; start: string | null; end: string | null }
export const WORKING_HOURS: Record<string, WorkDay> = {
  Mon: { enabled: true,  start: '08:00', end: '17:00' },
  Tue: { enabled: true,  start: '08:00', end: '17:00' },
  Wed: { enabled: true,  start: '08:00', end: '17:00' },
  Thu: { enabled: true,  start: '08:00', end: '17:00' },
  Fri: { enabled: true,  start: '08:00', end: '17:00' },
  Sat: { enabled: false, start: '09:00', end: '14:00' },
  Sun: { enabled: false, start: null,    end: null    },
};

/* ── AVAILABILITY RULES ── */
export interface AvailRule {
  id: string;
  type: 'once' | 'weekly' | 'daily' | 'date_range';
  day?: number;
  weekday?: number;
  startH: number;
  startM: number;
  dur: number;
  reason: string;
  label?: string;
  createdAt: string;
}
export const AVAILABILITY_RULES: AvailRule[] = [
  { id: 'rule-001', type: 'once',   day: 4,  startH: 14, startM: 0,  dur: 240,  reason: 'Personal', label: 'Personal', createdAt: 'Mar 9' },
  { id: 'rule-002', type: 'weekly', weekday: 6, startH: 0, startM: 0, dur: 1440, reason: 'Day off', label: 'Day Off', createdAt: 'Standing' },
  { id: 'rule-003', type: 'daily',  startH: 12, startM: 0, dur: 60, reason: 'Lunch', label: 'Lunch Break', createdAt: 'Standing' },
];

/* ── VACATION ── */
export interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  note: string;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  resumedEarly: boolean;
}
export const VACATIONS: Vacation[] = [
  { id: 'vac-001', startDate: '2026-03-18', endDate: '2026-03-25', note: 'Spring break', status: 'upcoming', resumedEarly: false },
];

/* ── STATIC DEMO EVENTS ── */
const STATIC_EVENTS: CalEvent[] = [
  { id: 'e-001', type: 'emg', day: 2, startH: 8, startM: 0, dur: 75,
    title: '⚡ Water Leak — Emergency', property: 'Seaside Villa', city: 'Kissimmee, FL', dist: '2.1 mi SW',
    pm: 'Coastal STR', payout: 225, status: 'inprog', payBase: 175, payBonus: 50,
    gateCode: '7821#', lockBox: 'Front door · 3311', parking: 'Driveway',
    address: '441 Marina Way, Kissimmee FL 34747',
    checklist: [
      { done: true, text: 'Assess leak source' },
      { done: true, text: 'Shut off supply' },
      { done: false, text: 'Document damage' },
      { done: false, text: 'Notify PM' },
      { done: false, text: 'Submit report' },
    ],
    timeline: [
      { event: 'Accepted', time: '07:48 AM', state: 'ok' },
      { event: 'En route', time: '07:55 AM', state: 'ok' },
      { event: 'On site', time: '08:07 AM', state: 'ok' },
      { event: 'Work in progress', time: '08:12 AM', state: 'ok' },
    ] },
  { id: 'e-002', type: 'job', day: 2, startH: 10, startM: 0, dur: 60,
    title: 'Pool Filter Replacement', property: 'Sunset Villa', city: 'Orlando, FL', dist: '6.3 mi NE',
    pm: 'SunState Rentals', payout: 85, status: 'accepted',
    gateCode: '4821#', lockBox: 'Side gate · 7731', parking: 'Street',
    address: '1421 Sunset Blvd, Orlando FL 32801',
    checklist: [
      { done: false, text: 'Inspect filter condition' },
      { done: false, text: 'Replace cartridge' },
      { done: false, text: 'Test chemicals' },
      { done: false, text: 'Run system check' },
      { done: false, text: 'Upload photos' },
    ],
    timeline: [
      { event: 'Accepted', time: 'Yesterday', state: 'ok' },
      { event: 'Scheduled 10:00 AM', time: '', state: 'pending' },
    ] },
  { id: 'e-003', type: 'recurring', day: 2, startH: 12, startM: 30, dur: 45,
    title: '🔁 Weekly Pool Cleaning', property: 'Marina Cove', city: 'Orlando, FL', dist: '8.4 mi NE',
    pm: 'SunState Rentals', payout: 75, status: 'accepted',
    gateCode: '2210#', lockBox: 'Pool gate · 9901', parking: 'Lot B',
    address: '88 Marina Blvd, Orlando FL 32801',
    checklist: [
      { done: false, text: 'Skim surface' },
      { done: false, text: 'Brush walls' },
      { done: false, text: 'Test chemicals' },
      { done: false, text: 'Clean basket' },
    ],
    timeline: [{ event: 'Recurring contract', time: 'Active', state: 'ok' }] },
  { id: 'e-004', type: 'job', day: 2, startH: 14, startM: 30, dur: 60,
    title: 'Chemical Balance & Brush', property: 'Park Cove Retreat', city: 'Windermere, FL', dist: '14.2 mi SW',
    pm: 'Premier Stays', payout: 110, status: 'accepted',
    gateCode: '9934#', lockBox: 'Rear gate · 1122', parking: 'Driveway',
    address: '88 Lakeview Dr, Windermere FL 34786',
    checklist: [
      { done: false, text: 'Test pH and chlorine' },
      { done: false, text: 'Balance chemicals' },
      { done: false, text: 'Brush walls and floor' },
      { done: false, text: 'Clean pump basket' },
    ],
    timeline: [{ event: 'Accepted', time: 'Yesterday', state: 'ok' }] },
  { id: 'e-005', type: 'recurring', day: 3, startH: 9, startM: 0, dur: 45,
    title: '🔁 Weekly Pool Cleaning', property: 'Oak Manor', city: 'Lake Nona, FL', dist: '5.2 mi SE',
    pm: 'Coastal STR', payout: 75, status: 'accepted',
    gateCode: '3340#', lockBox: 'Side gate · 8801', parking: 'Street',
    address: '12 Oak Ln, Lake Nona FL 32827',
    checklist: [
      { done: false, text: 'Skim surface' },
      { done: false, text: 'Brush walls' },
      { done: false, text: 'Test chemicals' },
      { done: false, text: 'Clean basket' },
    ],
    timeline: [{ event: 'Recurring contract', time: 'Active', state: 'ok' }] },
  { id: 'e-006', type: 'job', day: 3, startH: 11, startM: 0, dur: 90,
    title: 'Pump Inspection & Repair', property: 'Lakewood Villa', city: 'Lake Nona, FL', dist: '5.9 mi SE',
    pm: 'Coastal STR', payout: 155, status: 'accepted',
    gateCode: '8812#', lockBox: 'Pump shed · 4410', parking: 'Driveway',
    address: '34 Lakewood Dr, Lake Nona FL 32827',
    checklist: [
      { done: false, text: 'Inspect pump housing' },
      { done: false, text: 'Pressure test' },
      { done: false, text: 'Replace seal if needed' },
      { done: false, text: 'Chemical check' },
      { done: false, text: 'Report findings' },
    ],
    timeline: [{ event: 'Accepted', time: 'Mar 9', state: 'ok' }] },
  { id: 'e-007', type: 'unavail', day: 4, startH: 14, startM: 0, dur: 240,
    title: 'Unavailable', status: 'blocked', reason: 'Personal' },
  { id: 'e-008', type: 'job', day: 0, startH: 9, startM: 0, dur: 60,
    title: 'Filter Cleaning', property: 'Sunset Palms', city: 'Orlando, FL', dist: '11.4 mi SE',
    pm: 'SunState Rentals', payout: 85, status: 'submitted',
    gateCode: '2209#', lockBox: 'Pool shed · 4410', parking: 'Street',
    address: '22 Palm Ave, Orlando FL 32801',
    checklist: [
      { done: true, text: 'Skim' },
      { done: true, text: 'Chemicals' },
      { done: true, text: 'Brush' },
      { done: true, text: 'Photos' },
    ],
    timeline: [
      { event: 'Accepted', time: 'Mar 8', state: 'ok' },
      { event: 'Completed', time: '09:55 AM', state: 'ok' },
      { event: 'Submitted', time: '09:57 AM', state: 'ok' },
    ] },
];

/* ── HELPERS ── */
const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am–8pm
const TODAY_DAY_IDX = 2;
const WEEK_BASE = new Date('2026-03-09');

export function getWeekDate(offset: number, dayIdx: number): Date {
  const d = new Date(WEEK_BASE);
  d.setDate(WEEK_BASE.getDate() + offset * 7 + dayIdx);
  return d;
}
export function dateToLabel(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m]} ${d}`;
}

/* ── DERIVED EVENT SOURCES ── */
function buildRuleEvents(): CalEvent[] {
  const out: CalEvent[] = [];
  AVAILABILITY_RULES.forEach((r) => {
    if (r.type === 'once' && r.day !== undefined) {
      out.push({ id: r.id, type: 'unavail', day: r.day, startH: r.startH, startM: r.startM, dur: r.dur,
        title: 'Unavailable', reason: r.label || r.reason, ruleId: r.id, fromRule: true });
    }
    if (r.type === 'weekly' && r.weekday !== undefined) {
      out.push({ id: `rw-${r.id}`, type: 'unavail', day: r.weekday, startH: r.startH, startM: r.startM, dur: r.dur,
        title: 'Unavailable', reason: r.label || r.reason, ruleId: r.id, fromRule: true });
    }
    if (r.type === 'daily') {
      for (let d = 0; d < 7; d++) {
        out.push({ id: `rd-${r.id}-${d}`, type: 'unavail', day: d, startH: r.startH, startM: r.startM, dur: r.dur,
          title: 'Unavailable', reason: r.label || r.reason, ruleId: r.id, fromRule: true });
      }
    }
  });
  return out;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Schedule() {
  const { showToast } = useVendor();

  const [events, setEvents] = useState<CalEvent[]>(STATIC_EVENTS);
  const [view, setView] = useState<'day' | 'week' | 'month'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return 'day';
    }
    return 'week';
  });
  const [weekOffset, setWeekOffset] = useState(0);
  const [filter, setFilter] = useState<'all' | 'job' | 'emg' | 'recurring' | 'blocked'>('all');
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);
  const [drawer, setDrawer] = useState<
    | { kind: 'block'; dayIdx?: number; hour?: number }
    | { kind: 'event'; id: string }
    | { kind: 'hours' }
    | { kind: 'vacation'; vacId?: string }
    | null
  >(null);

  /* Vacation state (local) */
  const [vacations, setVacations] = useState<Vacation[]>(VACATIONS);

  /* Accept jobs toggle */
  const [acceptJobs, setAcceptJobs] = useState(true);

  /* Rule count updates when user adds blocks */
  const ruleCount = AVAILABILITY_RULES.length;

  /* ── Derived event list ── */
  const allEvents = useMemo(() => {
    const ruleEvents = buildRuleEvents();
    const vacEvents: CalEvent[] = [];
    vacations.forEach((v) => {
      if (v.status === 'cancelled' || v.resumedEarly) return;
      const vs = new Date(v.startDate);
      const ve = new Date(v.endDate);
      for (let d = 0; d < 7; d++) {
        const cellDate = getWeekDate(weekOffset, d);
        if (cellDate >= vs && cellDate <= ve) {
          vacEvents.push({
            id: `vcal-${v.id}-${d}`, type: 'vacation', day: d, startH: 7, startM: 0, dur: 780,
            title: '✈ Vacation', reason: v.note || 'Vacation', vacId: v.id, fromVacation: true,
          });
        }
      }
    });
    return [...events, ...ruleEvents, ...vacEvents];
  }, [events, vacations, weekOffset]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return allEvents;
    if (filter === 'blocked') return allEvents.filter((e) => e.type === 'unavail' || e.type === 'personal' || e.type === 'vacation');
    if (filter === 'job')     return allEvents.filter((e) => e.type === 'job' || e.type === 'emg');
    if (filter === 'emg')     return allEvents.filter((e) => e.type === 'emg');
    if (filter === 'recurring') return allEvents.filter((e) => e.type === 'recurring');
    return allEvents;
  }, [allEvents, filter]);

  /* ── Active vacation ── */
  const activeVacation = vacations.find((v) => (v.status === 'active' || v.status === 'upcoming') && !v.resumedEarly) ?? null;

  /* ── Period label ── */
  const periodLabel = useMemo(() => {
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (view === 'week') {
      const s = new Date(WEEK_BASE); s.setDate(WEEK_BASE.getDate() + weekOffset * 7);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      const sStr = `${MONTHS[s.getMonth()]} ${s.getDate()}`;
      const eStr = s.getMonth() === e.getMonth() ? `${e.getDate()}, ${e.getFullYear()}` : `${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
      return `${sStr} – ${eStr}`;
    }
    if (view === 'day') {
      const d = new Date('2026-03-11'); d.setDate(d.getDate() + weekOffset);
      const dowIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      return `${WEEK_DAYS[dowIdx]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    const d = new Date('2026-03-01'); d.setMonth(d.getMonth() + weekOffset);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }, [view, weekOffset]);

  /* ── ESC to close ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── Handlers ── */
  const navPeriod = (dir: number) => setWeekOffset((o) => o + dir);
  const goToday   = () => setWeekOffset(0);

  const handleSaveBlock = (dayIdx: number, sh: number, sm: number, dur: number, reason: string) => {
    const newEvent: CalEvent = {
      id: `blk-${Date.now()}`,
      type: 'unavail',
      day: dayIdx,
      startH: sh,
      startM: sm,
      dur,
      title: 'Unavailable',
      status: 'blocked',
      reason,
    };
    setEvents((e) => [...e, newEvent]);
    setDrawer(null);
    showToast(`Block saved — ${reason} · Dispatch protected`, 'success');
  };

  const handleRemoveBlock = (id: string) => {
    setEvents((e) => e.filter((x) => x.id !== id));
    setDrawer(null);
    showToast('Block removed', 'success');
  };

  const handleSaveVacation = (vacId: string | null, start: string, end: string, note: string) => {
    if (vacId) {
      setVacations((vs) => vs.map((v) => (v.id === vacId ? { ...v, startDate: start, endDate: end, note } : v)));
    } else {
      setVacations((vs) => [
        ...vs,
        { id: `vac-${Date.now()}`, startDate: start, endDate: end, note, status: 'upcoming', resumedEarly: false },
      ]);
    }
    setDrawer(null);
    showToast(`Vacation saved · ${dateToLabel(start)} – ${dateToLabel(end)} · Dispatch suspended`, 'success');
  };

  const handleCancelVacation = (vacId: string) => {
    setVacations((vs) => vs.map((v) => (v.id === vacId ? { ...v, status: 'cancelled', resumedEarly: true } : v)));
    setDrawer(null);
    showToast('Vacation cancelled — you are back online', 'success');
  };

  const handleResumeEarly = () => {
    if (!activeVacation) return;
    setVacations((vs) => vs.map((v) => (v.id === activeVacation.id ? { ...v, status: 'ended', resumedEarly: true } : v)));
    showToast('✓ Resumed early — accepting jobs again', 'success');
  };

  return (
    <>
      <div className="main-area">
        {/* TOP SUMMARY STRIP */}
        <div className="sched-top-strip">
          <div className="strip-date">
            WED — MAR 11, 2026
            <span>Schedule Overview</span>
          </div>
          <div className="strip-kpi">
            <div className="kpi-tile"><div className="kpi-lbl">Today's Jobs</div><div className="kpi-val">4</div></div>
            <div className="kpi-tile"><div className="kpi-lbl">Est. Work</div><div className="kpi-val">5h 15m</div></div>
            <div className="kpi-tile"><div className="kpi-lbl">Route Distance</div><div className="kpi-val">21.4 mi</div></div>
            <div className="kpi-tile"><div className="kpi-lbl">Earnings Today</div><div className="kpi-val gold">$385</div></div>
            <div className="kpi-tile">
              <div className="kpi-lbl">Capacity Remaining</div>
              <div className="kpi-val emerald">2h 45m</div>
              <div className="kpi-sub emerald">Can take ~1–2 more jobs</div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="cal-toolbar">
          <div className="cal-toolbar-row">
            <div className="cal-nav-group">
              <button className="cal-nav-btn" onClick={() => navPeriod(-1)}>‹</button>
              <button className="cal-nav-btn" onClick={() => navPeriod(1)}>›</button>
              <button className="cal-nav-btn cal-nav-btn--wide" onClick={goToday}>Today</button>
            </div>
            <div className="cal-period">{periodLabel}</div>
            <div className="view-tabs">
              {(['day', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  className={`view-tab ${view === v ? 'active' : ''}`}
                  onClick={() => setView(v)}
                >
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="cal-toolbar-row cal-toolbar-row--filters">
            <div className="filter-group">
              {(['all', 'job', 'emg', 'recurring', 'blocked'] as const).map((f) => (
                <button
                  key={f}
                  className={`filter-chip fc-${f} ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'job' ? '📋 Jobs' : f === 'emg' ? '⚡ Emergency' : f === 'recurring' ? '🔁 Recurring' : '⛔ Blocked'}
                </button>
              ))}
            </div>
            <div className="cal-actions-group">
              <button
                className="sched-avail-toggle-btn"
                onClick={() => setSidebarDrawerOpen(true)}
              >
                <span className={`avail-dot-mini ${activeVacation ? 'blue' : acceptJobs ? 'emerald' : 'crimson'}`} />
                Availability & Hours
              </button>
              <button className="add-block-btn" onClick={() => setDrawer({ kind: 'block', dayIdx: TODAY_DAY_IDX, hour: 9 })}>
                + Block Time
              </button>
            </div>
          </div>
        </div>

        {/* STATUS STRIP */}
        <div className="sched-status-strip">
          <div className="jss-item"><span className="jss-dot gold" /><span>Jobs</span><span className="jss-val">4</span></div>
          <div className="jss-item"><span className="jss-dot crimson" /><span>Emergency</span><span className="jss-val crimson">1</span></div>
          <div className="jss-item"><span className="jss-dot blue" /><span>Recurring</span><span className="jss-val">2</span></div>
          <div className="jss-item"><span className="jss-dot slate" /><span>Blocked</span><span className="jss-val">1</span></div>
          {activeVacation && (
            <div className="jss-item">
              <span className="jss-dot blue" />
              <span className="blue-strong">Vacation until {dateToLabel(activeVacation.endDate)}</span>
            </div>
          )}
          <span className="cluster-badge">📍 Lake Nona Cluster · 2 Jobs · 7.4 mi</span>
          <div className="workload-bar">
            <span className="wl-label">60% of day booked</span>
            <div className="wl-track"><div className="wl-fill" style={{ width: '60%' }} /></div>
            <span className="wl-pct">60%</span>
            <span className="wl-sub">5h 15m of 8h available</span>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="cal-body">
          {view === 'week' && (
            <WeekGrid
              weekOffset={weekOffset}
              events={filteredEvents}
              onEventClick={(id) => setDrawer({ kind: 'event', id })}
              onCellClick={(dayIdx, hour) => setDrawer({ kind: 'block', dayIdx, hour })}
            />
          )}
          {view === 'day' && (
            <DayGrid
              weekOffset={weekOffset}
              events={filteredEvents}
              onEventClick={(id) => setDrawer({ kind: 'event', id })}
              onCellClick={(dayIdx, hour) => setDrawer({ kind: 'block', dayIdx, hour })}
            />
          )}
          {view === 'month' && (
            <MonthGrid
              events={filteredEvents}
              onEventClick={(id) => setDrawer({ kind: 'event', id })}
              onDayClick={(dayNum) => {
                const clicked = new Date(`2026-03-${String(dayNum).padStart(2, '0')}`);
                const today = new Date('2026-03-11');
                const diff = Math.round((clicked.getTime() - today.getTime()) / 86400000);
                setWeekOffset(diff);
                setView('day');
              }}
            />
          )}
        </div>
      </div>

      {/* Sidebar — Availability + Vacation */}
      {sidebarDrawerOpen && (
        <div
          className="sched-sidebar-overlay"
          onClick={() => setSidebarDrawerOpen(false)}
        />
      )}
      <div className={`sched-sidebar ${sidebarDrawerOpen ? 'is-open' : ''}`}>
        <div className="sched-sidebar-hdr">
          <span className="sched-sidebar-title">Availability & Hours</span>
          <button
            className="sched-sidebar-close"
            onClick={() => setSidebarDrawerOpen(false)}
            aria-label="Close availability drawer"
          >
            ✕
          </button>
        </div>
        <div className="avail-card">
          <div className="avail-lbl">Availability</div>
          <div className="avail-head">
            <span className={`avail-dot ${activeVacation ? 'blue' : acceptJobs ? 'emerald' : 'crimson'}`} />
            <span className={`avail-val ${activeVacation ? 'blue' : acceptJobs ? 'emerald' : 'crimson'}`}>
              {activeVacation ? `Vacation · ${dateToLabel(activeVacation.startDate)}` : acceptJobs ? 'Online' : 'Paused'}
            </span>
          </div>

          <div className="accept-jobs-card">
            <div className="accept-jobs-head">
              <div className="accept-jobs-left">
                <span className={`accept-dot ${acceptJobs ? 'emerald' : 'crimson'}`} />
                <span className={`accept-jobs-lbl ${acceptJobs ? 'emerald' : 'crimson'}`}>
                  {acceptJobs ? 'Accepting Jobs' : 'Not Accepting Jobs'}
                </span>
              </div>
              <button
                className={`accept-jobs-btn ${acceptJobs ? 'is-pause' : 'is-on'}`}
                onClick={() => setAcceptJobs((v) => !v)}
              >
                {acceptJobs ? 'Pause' : 'Turn On'}
              </button>
            </div>
            <div className={`accept-jobs-consequence ${acceptJobs ? '' : 'is-crimson'}`}>
              {acceptJobs ? 'New offers are being routed to you' : 'No new offers will be routed to you'}
            </div>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-lbl-s">Emergency On-Call</div>
              <div className="toggle-lbl on">Enabled</div>
            </div>
            <div className="toggle on" onClick={() => showToast('Emergency on-call toggle')} />
          </div>
        </div>

        {activeVacation && (
          <div className="vacation-panel">
            <div className="vacation-panel__lbl">On Vacation</div>
            <div className="vacation-panel__title">
              {dateToLabel(activeVacation.startDate)} – {dateToLabel(activeVacation.endDate)}
            </div>
            {activeVacation.note && <div className="vacation-panel__note">{activeVacation.note}</div>}
            <div className="vacation-panel__rules">
              <div className="rule-line is-crimson">● Jobs paused — no new offers</div>
              <div className="rule-line is-crimson">● Emergency dispatch disabled</div>
              <div className="rule-line is-emerald">✓ Acceptance rate protected</div>
            </div>
            <div className="vacation-panel__actions">
              <button className="btn-resume" onClick={handleResumeEarly}>Resume Early</button>
              <button className="btn-edit" onClick={() => setDrawer({ kind: 'vacation', vacId: activeVacation.id })}>Edit</button>
            </div>
          </div>
        )}

        <div className="avail-card">
          <div className="avail-head-row">
            <div className="avail-lbl">Working Hours</div>
            <button className="avail-edit-link" onClick={() => setDrawer({ kind: 'hours' })}>Edit</button>
          </div>
          <div className="wh-rows">
            <div className="wh-row"><span className="wh-day">Mon – Fri</span><span className="wh-time emerald">8:00 – 17:00</span></div>
            <div className="wh-row"><span className="wh-day">Saturday</span><span className="wh-time muted">Off</span></div>
            <div className="wh-row"><span className="wh-day">Sunday</span><span className="wh-time muted">Off</span></div>
          </div>
          <div className="rule-count-row">
            <span className="rule-count-lbl">Blocked rules</span>
            <span className="rule-count-val">{ruleCount} active</span>
          </div>
          <button className="btn-add-vacation" onClick={() => setDrawer({ kind: 'vacation' })}>
            ✈ Add Vacation
          </button>
        </div>
      </div>

      {/* DRAWERS */}
      {drawer?.kind === 'block' && (
        <BlockDrawer
          dayIdx={drawer.dayIdx ?? TODAY_DAY_IDX}
          hour={drawer.hour ?? 9}
          events={events}
          onClose={() => setDrawer(null)}
          onSave={handleSaveBlock}
        />
      )}
      {drawer?.kind === 'event' && (
        <EventDrawer
          event={allEvents.find((e) => e.id === drawer.id) ?? null}
          onClose={() => setDrawer(null)}
          onRemove={handleRemoveBlock}
          showToast={showToast}
        />
      )}
      {drawer?.kind === 'hours' && (
        <WorkingHoursDrawer
          hours={WORKING_HOURS}
          onClose={() => setDrawer(null)}
          showToast={showToast}
        />
      )}
      {drawer?.kind === 'vacation' && (
        <VacationDrawer
          existing={drawer.vacId ? vacations.find((v) => v.id === drawer.vacId) ?? null : null}
          onClose={() => setDrawer(null)}
          onSave={handleSaveVacation}
          onCancel={handleCancelVacation}
        />
      )}
    </>
  );
}

/* ═══════════════ WEEK GRID ═══════════════ */
function WeekGrid({
  weekOffset, events, onEventClick, onCellClick,
}: {
  weekOffset: number;
  events: CalEvent[];
  onEventClick: (id: string) => void;
  onCellClick: (dayIdx: number, hour: number) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const today = new Date('2026-03-11');
  const isTodayCol = (d: number) => getWeekDate(weekOffset, d).toDateString() === today.toDateString();

  const topPx = (h: number, m: number) => (h - 7) * 60 + m;
  const headerH = 44;

  return (
    <div className="week-grid" ref={gridRef}>
      {/* Header */}
      <div className="wh-spacer" />
      {WEEK_DAYS.map((d, i) => {
        const cellDate = getWeekDate(weekOffset, i);
        const isToday  = isTodayCol(i);
        const cluster  = weekOffset === 0 && i === 3;
        const dayJobs  = events.filter((e) => e.day === i && (e.type === 'job' || e.type === 'emg' || e.type === 'recurring'));
        const heatClass = dayJobs.length === 0 ? 'heat-none' : dayJobs.length <= 1 ? 'heat-low' : dayJobs.length <= 3 ? 'heat-med' : 'heat-high';
        return (
          <div key={i} className={`wh-day${isToday ? ' today' : ''}`}>
            <div className="wh-dayname">{d}</div>
            <div className="wh-daynum">{cellDate.getDate()}</div>
            {cluster && <div className="wh-cluster">📍 Lake Nona Cluster</div>}
            <div className={`wh-heat ${heatClass}`} />
          </div>
        );
      })}

      {/* Time rows */}
      {HOURS.map((h) => (
        <div key={h} className="time-slot">
          <div className="time-label">{h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`}</div>
          {WEEK_DAYS.map((_, di) => {
            const isToday = isTodayCol(di);
            const isCluster = weekOffset === 0 && di === 3;
            const slotCovered = isCluster && events.some((e) =>
              e.day === di && (e.type === 'job' || e.type === 'recurring' || e.type === 'emg') &&
              (e.startH * 60 + e.startM) < h * 60 + 60 &&
              (e.startH * 60 + e.startM + e.dur) > h * 60
            );
            return (
              <div
                key={di}
                className={`day-cell${isToday ? ' today-col' : ''}${slotCovered ? ' cluster-col' : ''}`}
                onClick={() => onCellClick(di, h)}
              />
            );
          })}
        </div>
      ))}

      {/* Event blocks (absolutely positioned) */}
      <div className="events-layer">
        {events.map((ev) => (
          <EventBlock
            key={ev.id}
            ev={ev}
            topPx={topPx(ev.startH, ev.startM) + headerH}
            onClick={() => onEventClick(ev.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ DAY GRID ═══════════════ */
function DayGrid({
  weekOffset, events, onEventClick, onCellClick,
}: {
  weekOffset: number;
  events: CalEvent[];
  onEventClick: (id: string) => void;
  onCellClick: (dayIdx: number, hour: number) => void;
}) {
  const topPx = (h: number, m: number) => (h - 7) * 60 + m;
  const headerH = 44;
  const targetDate = useMemo(() => {
    const d = new Date('2026-03-11');
    d.setDate(d.getDate() + weekOffset);
    return d;
  }, [weekOffset]);
  const dowIdx = targetDate.getDay() === 0 ? 6 : targetDate.getDay() - 1;
  const dayEvents = events.filter((e) => e.day === dowIdx);

  return (
    <div className="day-grid">
      <div className="day-hdr-spacer" />
      <div className="day-hdr">
        <div className="wh-dayname">{WEEK_DAYS[dowIdx]}</div>
        <div className="wh-daynum">{targetDate.getDate()}</div>
      </div>
      {HOURS.map((h) => (
        <div key={h} className="time-slot">
          <div className="time-label">{h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`}</div>
          <div className="day-cell today-col" onClick={() => onCellClick(dowIdx, h)} />
        </div>
      ))}

      <div className="events-layer">
        {dayEvents.map((ev) => (
          <EventBlock
            key={ev.id}
            ev={ev}
            topPx={topPx(ev.startH, ev.startM) + headerH}
            dayView
            onClick={() => onEventClick(ev.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ EVENT BLOCK ═══════════════ */
function EventBlock({
  ev, topPx, dayView, onClick,
}: {
  ev: CalEvent;
  topPx: number;
  dayView?: boolean;
  onClick: () => void;
}) {
  const height = Math.max(ev.dur - 4, 18);
  const clusterClass = ev.day === 3 && (ev.type === 'job' || ev.type === 'recurring') ? ' cb-cluster-lnona' : '';
  const statusClass = ev.status ? ` status-${ev.status}` : '';
  const timeStr = `${ev.startH < 12 ? ev.startH : ev.startH - 12}:${String(ev.startM).padStart(2, '0')} ${ev.startH < 12 ? 'AM' : 'PM'}`;

  let blockTitle = ev.title;
  if (ev.type === 'unavail') blockTitle = `⛔ ${ev.reason || 'Personal'} · ${timeStr}`;

  const style: React.CSSProperties = dayView
    ? { top: topPx, height, left: 56, right: 4 }
    : { top: topPx, height,
        left: `calc(52px + ${ev.day} * ((100% - 52px) / 7) + 3px)`,
        width: `calc((100% - 52px) / 7 - 6px)` };

  return (
    <div
      className={`cal-block cb-${ev.type}${clusterClass}${statusClass}`}
      style={style}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {height > 35 ? (
        <>
          <div className="cb-title">{blockTitle}</div>
          {ev.property && <div className="cb-sub">{ev.property}</div>}
          {height > 50 && (
            <>
              <div className="cb-time">{timeStr}</div>
              {ev.status && ev.type !== 'unavail' && ev.type !== 'vacation' && (
                <span className={`cb-status-chip cb-status-${ev.status}`}>
                  {ev.status === 'inprog' ? 'In Progress' : ev.status === 'submitted' ? 'Submitted' : 'Accepted'}
                </span>
              )}
            </>
          )}
        </>
      ) : (
        <div className="cb-title cb-title--sm">{blockTitle}</div>
      )}
    </div>
  );
}

/* ═══════════════ MONTH GRID ═══════════════ */
function MonthGrid({
  events, onEventClick, onDayClick,
}: {
  events: CalEvent[];
  onEventClick: (id: string) => void;
  onDayClick: (dayNum: number) => void;
}) {
  const firstDayOffset = 6; // Mar 1 2026 = Sunday → 6 blanks before (Mon-start grid)

  /* Group events by day-of-month */
  const byDate: Record<number, CalEvent[]> = {};
  events.forEach((e) => {
    const base = new Date(WEEK_BASE);
    base.setDate(WEEK_BASE.getDate() + e.day);
    const key = base.getDate();
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(e);
  });

  return (
    <div className="month-grid">
      {WEEK_DAYS.map((d) => <div key={d} className="mh-cell">{d}</div>)}
      {Array.from({ length: 35 }).map((_, i) => {
        const dayNum = i - firstDayOffset + 1;
        const isOther = dayNum < 1 || dayNum > 31;
        const isToday = dayNum === 11;
        const displayNum = isOther ? (dayNum < 1 ? 28 + dayNum : dayNum - 31) : dayNum;
        const dayEvs = !isOther ? (byDate[dayNum] || []) : [];
        const shown = dayEvs.slice(0, 3);
        const more = dayEvs.length - 3;
        return (
          <div
            key={i}
            className={`m-day${isToday ? ' today-cell' : ''}${isOther ? ' other-month' : ''}`}
            onClick={() => { if (!isOther) onDayClick(dayNum); }}
          >
            <div className="m-daynum">{displayNum}</div>
            {shown.map((e) => (
              <div
                key={e.id}
                className={`m-block ${e.type === 'vacation' ? 'vacation' : (e.type === 'unavail' || e.type === 'personal') ? 'unavail' : e.type}`}
                onClick={(ev) => { ev.stopPropagation(); onEventClick(e.id); }}
              >
                {e.type === 'vacation' ? '✈ Vacation' : (e.type === 'unavail' || e.type === 'personal') ? `⛔ ${e.reason || 'Blocked'}` : e.title}
              </div>
            ))}
            {more > 0 && <div className="m-more">+{more} more</div>}
          </div>
        );
      })}
    </div>
  );
}