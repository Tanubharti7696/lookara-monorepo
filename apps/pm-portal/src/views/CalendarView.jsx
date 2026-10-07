// src/views/CalendarView.jsx
import { useState, useMemo, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import CalendarTopBar from './calendar/CalendarTopBar';
import OpsStrip from './calendar/OpsStrip';
import WeekView from './calendar/WeekView';
import MonthView from './calendar/MonthView';
import DayView from './calendar/DayView';
import AgendaView from './calendar/AgendaView';
import TurnoverDrawer from './calendar/TurnoverDrawer';
import { WEEK_START } from '../data/calendar';
import './CalendarView.css';

export default function CalendarView() {
  const [view, setView]           = useState('week');
  const [search, setSearch]       = useState('');
  const [dayKey, setDayKey]       = useState('Jan-16');
  const [turnoverKey, setTurnover] = useState(null);
  const [toast, setToast]         = useState(null);
  const [lanes, setLanes]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const startStr = WEEK_START.toISOString().split('T')[0];
    const end = new Date(WEEK_START);
    end.setDate(WEEK_START.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    apiFetch(`/api/v1/calendar/lanes?start=${startStr}&end=${endStr}`)
      .then(res => res.json())
      .then(data => {
        setLanes(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleOpenDay = (key) => {
    setDayKey(key);
    setView('day');
  };

  const handleOpenTask = (taskId, label) => {
    showToast(`Opening task ${taskId}${label ? ' — ' + label : ''}`, 'info');
  };

  const handleAssignCleaner = () => {
    setTurnover(null);
    showToast('Vendor Directory opening…', 'info');
  };

  const dateLabel = useMemo(() => {
    if (view === 'week' || view === 'agenda') {
      const start = new Date(WEEK_START);
      const end = new Date(WEEK_START);
      end.setDate(WEEK_START.getDate() + 6);
      return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
    }
    if (view === 'month') return 'January 2026';
    return 'Fri, Jan 16, 2026';
  }, [view]);

  return (
    <div className="calendar-view">
      <CalendarTopBar
        view={view}
        onViewChange={setView}
        dateLabel={dateLabel}
        onToday={() => showToast('Jumped to today', 'info')}
        onPrev={() => showToast('← previous', 'info')}
        onNext={() => showToast('→ next', 'info')}
        search={search}
        onSearch={setSearch}
        onToast={showToast}
      />

      <OpsStrip />

      <div className="calendar-body">
        {loading && <div style={{ padding: '24px' }}>Loading calendar data...</div>}
        {!loading && view === 'week'   && (
          <WeekView
            lanes={lanes}
            search={search}
            onOpenDay={handleOpenDay}
            onOpenTurnover={setTurnover}
            onOpenTask={handleOpenTask}
            onToast={showToast}
          />
        )}
        {view === 'month'  && <MonthView onOpenDay={handleOpenDay} />}
        {view === 'day'    && <DayView dateKey={dayKey} onToast={showToast} />}
        {view === 'agenda' && <AgendaView search={search} />}
      </div>

      <TurnoverDrawer
        turnoverKey={turnoverKey}
        onClose={() => setTurnover(null)}
        onOpenTask={(taskId) => { setTurnover(null); handleOpenTask(taskId); }}
        onAssignCleaner={handleAssignCleaner}
        onToast={showToast}
      />

      {toast && (
        <div className={`cal-toast cal-toast--${toast.type || 'info'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}