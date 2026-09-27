// src/views/tasks/drawer/TaskDrawer.jsx
import { useEffect, useState } from 'react';
import OverviewTab from './tabs/OverviewTab';
import ActionTab from './tabs/ActionTab';
import VendorTab from './tabs/VendorTab';
import CommunicationTab from './tabs/CommunicationTab';
import FilesTab from './tabs/FilesTab';
import TimelineTab from './tabs/TimelineTab';
import QuoteReviewOverlay from './overlays/QuoteReviewOverlay';
import VerifyWorkOverlay from './overlays/VerifyWorkOverlay';
import RecordPaymentOverlay from './overlays/RecordPaymentOverlay';
import AssignVendorOverlay from './overlays/AssignVendorOverlay';
import { STATE_META, SOURCE_LABELS } from '../../../data/taskMeta';
import './TaskDrawer.css';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'action',   label: 'Action' },
  { key: 'vendor',   label: 'Vendor' },
  { key: 'comm',     label: 'Communication' },
  { key: 'files',    label: 'Files' },
  { key: 'audit',    label: 'Timeline' },
];

export default function TaskDrawer({ task, onClose, onUpdate }) {
  const [tab, setTab] = useState('overview');
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    setTab('overview');
    setOverlay(null);
  }, [task?.id]);

  useEffect(() => {
    if (!task) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (overlay) setOverlay(null);
        else onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [task, overlay, onClose]);

  if (!task) return null;

  const meta    = STATE_META[task.state] || { label: task.state, color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' };
  const srcMeta = SOURCE_LABELS[task.source] || SOURCE_LABELS.manual_intake;

  const slaClass =
    task.slaStatus === 'OVERDUE' ? 'overdue'
    : task.slaStatus === 'AT RISK' ? 'risk'
    : task.slaStatus === 'ON TRACK' ? 'ok'
    : 'none';

  const slaText = (() => {
    if (!task.slaTarget || task.slaTarget === '—') return 'No SLA on this task';
    if (task.slaStatus === 'OVERDUE') return `OVERDUE · Target was ${task.slaTarget}`;
    return `${task.slaRemaining} remaining · Target ${task.slaTarget} · ${task.slaStatus}`;
  })();

  return (
    <>
      <div className="lk-drawer-backdrop" onClick={onClose} />

      <aside className="lk-drawer" role="dialog" aria-label="Task details">
        <div className="lk-drawer__head">
          <div className="lk-drawer__head-top">
            <div className="lk-drawer__title">{task.name}</div>
            <span className={`lk-drawer__sev lk-drawer__sev--${task.severity.toLowerCase()}`}>
              {task.severity}
            </span>
            <button className="lk-drawer__close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="lk-drawer__meta">
            {[task.property, task.city, task.portfolio, task.taskId].filter(Boolean).join(' · ')}
          </div>

          <div className="lk-drawer__status">
            <span
              className="lk-drawer__state-pill"
              style={{
                background: meta.bg,
                color: meta.color,
                borderColor: `${meta.color}44`,
                borderLeftColor: meta.color,
              }}
            >
              {meta.label.toUpperCase()}
            </span>
            <span className="lk-drawer__source">{srcMeta.label}</span>
          </div>

          <div className={`lk-drawer__sla lk-drawer__sla--${slaClass}`}>
            <span className="lk-drawer__sla-icon">⏱</span>
            <span className="lk-drawer__sla-text">{slaText}</span>
          </div>

          <div className="lk-drawer__tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                className={`lk-drawer__tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lk-drawer__body">
          {tab === 'overview' && <OverviewTab task={task} />}
          {tab === 'action'   && <ActionTab task={task} onUpdate={onUpdate} openOverlay={setOverlay} />}
          {tab === 'vendor'   && <VendorTab task={task} />}
          {tab === 'comm'     && <CommunicationTab task={task} />}
          {tab === 'files'    && <FilesTab task={task} />}
          {tab === 'audit'    && <TimelineTab task={task} />}
        </div>
      </aside>

      {overlay === 'quote'   && <QuoteReviewOverlay   task={task} onClose={() => setOverlay(null)} onUpdate={onUpdate} />}
      {overlay === 'verify'  && <VerifyWorkOverlay    task={task} onClose={() => setOverlay(null)} onUpdate={onUpdate} />}
      {overlay === 'payment' && <RecordPaymentOverlay task={task} onClose={() => setOverlay(null)} onUpdate={onUpdate} />}
      {overlay === 'assign'  && <AssignVendorOverlay  task={task} onClose={() => setOverlay(null)} onUpdate={onUpdate} />}
    </>
  );
}