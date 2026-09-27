import { useState, useCallback, useRef, useEffect } from 'react';
import { TASKS } from './data/constants';
import { useToast } from './hooks/useToast';
import Toast from './components/Toast';
import TaskHarness from './components/TaskHarness';
import StatePanel from './components/StatePanel';
import TaskDrawer from './components/TaskDrawer';
import './styles/drawer.css';

function nowTs() {
  return new Date().toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
}

export default function TaskDrawerApp() {
  const [tasks, setTasks] = useState(() => JSON.parse(JSON.stringify(TASKS)));
  const [currentName, setCurrentName] = useState(TASKS[0].name);
  const [notes, setNotes] = useState({});
  const { toast, show: showToast } = useToast();

  const currentTask = tasks.find(t => t.name === currentName);

  const updateTask = useCallback((name, updater) => {
    setTasks(prev => prev.map(t => t.name === name ? updater(t) : t));
  }, []);

  const handleAddNote = useCallback((text) => {
    if (!currentTask) return;
    const ts = nowTs();
    setNotes(prev => ({ ...prev, [currentTask.name]: [...(prev[currentTask.name] || []), { author:'David Nor', time:ts, text }] }));
    updateTask(currentTask.name, (t) => ({
      ...t,
      timeline: [...(t.timeline || []), { ts, label:`PM note: ${text}`, type:'note', actor:'PM' }],
    }));
  }, [currentTask, updateTask]);

  const handleAction = useCallback((key, label) => {
    if (!currentTask) return;

    /* Special action: escalate to admin */
    if (key === 'escalate-admin') {
      const caseId = 'CASE-' + Math.floor(1000 + Math.random() * 9000);
      const ts = nowTs();
      updateTask(currentTask.name, (t) => ({
        ...t,
        state: 'escalated-to-admin',
        escalatedToAdmin: t.escalatedToAdmin || { caseId, escalatedAt: ts, slaHours: 48, slaRemaining: '48h' },
        timeline: [...(t.timeline || []), { ts, label:`PM escalated to Admin Review · ${caseId} opened`, type:'block', actor:'PM' }],
      }));
      showToast(`Escalated to Admin Review · ${caseId}`);
      return;
    }

    if (!label) return;

    const ts = nowTs();
    const actor = key.startsWith('call') || key.startsWith('message') ? 'PM' : 'PM';
    const typeMap = {
      'call': 'call', 'message': 'message', 'file': 'file',
      'escalate': 'block', 'cancel-task': 'block', 'cancel-dispatch': 'block', 'cancel-rework': 'block',
      'quote-approved': 'complete', 'quote-rejected': 'warn', 'quote-revision': 'warn',
      'verify-approved': 'complete', 'rework-request': 'block',
      'payment-recorded': 'payment',
      'open-dispute': 'dispute',
      'assign-vendor': 'dispatch',
      'go-files': 'info',
      'mark-resolved': 'info',
    };
    const type = typeMap[key] || 'status';

    updateTask(currentTask.name, (t) => ({
      ...t,
      timeline: [...(t.timeline || []), { ts, label, type, actor }],
    }));
    showToast(label);
  }, [currentTask, updateTask, showToast]);

  const handleOwnerClarificationResponse = useCallback((response) => {
    if (!currentTask) return;
    const ts = nowTs();
    updateTask(currentTask.name, (t) => ({
      ...t,
      state: 'pending-owner-approval',
      ownerClarification: {
        ...(t.ownerClarification || {}),
        pmResponse: response, respondedBy: 'PM', respondedAt: ts, status: 'answered',
      },
      timeline: [
        ...(t.timeline || []),
        { ts, label:`PM responded to owner's clarification question: "${response.length > 80 ? response.slice(0,80) + '…' : response}"`, type:'status', actor:'PM' },
        { ts, label:'Status → Pending Owner Approval — awaiting owner decision', type:'status', actor:'System' },
      ],
    }));
    showToast('Response sent — owner notified, awaiting their decision');
  }, [currentTask, updateTask, showToast]);

  return (
    <>
      <TaskHarness currentName={currentName} onLoad={setCurrentName} />
      <div className="drawer-wrap">
        <TaskDrawer
          task={currentTask}
          notes={notes}
          onAddNote={handleAddNote}
          onAction={handleAction}
          onOwnerClarificationResponse={handleOwnerClarificationResponse}
          showToast={showToast}
        />
        <StatePanel currentState={currentTask?.state} onLoad={setCurrentName} />
      </div>
      <Toast toast={toast} />
    </>
  );
}
