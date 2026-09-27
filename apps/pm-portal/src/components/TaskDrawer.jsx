import { useState, useEffect } from 'react';
import { STATE_META, SOURCE_LABELS, SEV_STYLE, getPropertyName } from '../data/constants';
import OverviewTab from './tabs/OverviewTab';
import ActionTab from './tabs/ActionTab';
import VendorTab from './tabs/VendorTab';
import CommTab from './tabs/CommTab';
import FilesTab from './tabs/FilesTab';
import AuditTab from './tabs/AuditTab';
import Overlay from './Overlay';

const TABS = [
  { id:'overview', label:'Overview' },
  { id:'action',   label:'Action' },
  { id:'vendor',   label:'Vendor' },
  { id:'comm',     label:'Communication' },
  { id:'files',    label:'Files' },
  { id:'audit',    label:'Timeline' },
];

export default function TaskDrawer({ task, notes, onAddNote, onAction, onOwnerClarificationResponse, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [overlayMode, setOverlayMode] = useState(null);

  useEffect(() => {
    setActiveTab('overview');
    setOverlayMode(null);
  }, [task?.name]);

  if (!task) {
    return (
      <div className="drawer">
        <div style={{padding:40,textAlign:'center',color:'var(--slate)',fontSize:13}}>Select a task</div>
      </div>
    );
  }

  const sm = STATE_META[task.state] || { label: task.state.toUpperCase(), color:'#9CA3AF', bg:'rgba(107,114,128,.12)' };
  const propertyName = getPropertyName(task.property);

  return (
    <div className="drawer">
      <div className="dr-head">
        <div className="dr-head-top">
          <div className="dr-title">{task.name}</div>
          <span className="dr-sev" style={{}}>{task.severity}</span>
        </div>
        <div className="dr-meta">
          {task.property} · {task.city} · {task.portfolio} · {task.taskId}
          {propertyName && <span style={{color:'var(--slate)',fontStyle:'italic'}}> · Property: {propertyName}</span>}
        </div>
        <div className="dr-status-row">
          <span className="dr-state-pill" style={{background:sm.bg,color:sm.color,border:`1px solid ${sm.color}44`,borderLeft:`3px solid ${sm.color}`,padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700}}>
            {sm.label}
          </span>
          <span className="dr-source-badge" onClick={() => showToast('Opening source: ' + task.source)} title="Click to view source record">
            {SOURCE_LABELS[task.source] || '✍ Manual'}
          </span>
        </div>

        <div className={`dr-sla-bar ${task.slaTarget && task.slaTarget !== '—' ? (task.slaStatus === 'OVERDUE' ? 'overdue' : task.slaStatus === 'AT RISK' ? 'risk' : 'ok') : 'none'}`}>
          <span className="dr-sla-left">⏱ SLA</span>
          <span className="dr-sla-right">
            {task.slaTarget && task.slaTarget !== '—'
              ? `${task.slaRemaining} remaining · Target ${task.slaTarget} · ${task.slaStatus}`
              : 'No SLA on this task'}
          </span>
        </div>

        <div className="dr-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`dr-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="dr-body">
        {activeTab === 'overview' && <OverviewTab task={task} onRelatedClick={showToast} />}
        {activeTab === 'action' && (
          <ActionTab
            task={task}
            notes={notes}
            onAddNote={onAddNote}
            onAction={onAction}
            onOpenOverlay={(mode) => setOverlayMode(mode)}
            onFocusNote={() => document.getElementById('pm-note-input')?.focus()}
            onOwnerClarificationResponse={onOwnerClarificationResponse}
          />
        )}
        {activeTab === 'vendor' && <VendorTab task={task} onAction={onAction} onOpenOverlay={(m) => setOverlayMode(m)} />}
        {activeTab === 'comm'   && <CommTab task={task} notes={notes} />}
        {activeTab === 'files'  && <FilesTab task={task} onAction={onAction} />}
        {activeTab === 'audit'  && <AuditTab task={task} />}
      </div>

      {overlayMode && (
        <Overlay
          mode={overlayMode}
          task={task}
          onClose={() => setOverlayMode(null)}
          onAction={(key, label) => {
            if (key === 'view-dispute' || key === 'view-payment' || key === 'view-vendor') {
              showToast(label || 'Opening…');
              return;
            }
            if (key === 'escalate-admin') {
              onAction('escalate-admin');
              return;
            }
            onAction(key, label);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
