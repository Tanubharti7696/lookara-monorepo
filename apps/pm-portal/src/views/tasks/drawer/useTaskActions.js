// src/views/tasks/drawer/useTaskActions.js
import { useCallback } from 'react';
import { STATE_TO_GROUP } from '../../../data/taskMeta';

export function useTaskActions(task, onUpdate) {
  const now = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const addTimeline = useCallback((label, type = 'status', actor = 'PM') => {
    if (!task) return;
    const entry = { ts: now(), label, type, actor };
    onUpdate?.({ timeline: [...(task.timeline || []), entry] });
  }, [task, onUpdate]);

  const addNote = useCallback((text) => {
    if (!task || !text?.trim()) return;
    addTimeline(`PM note: ${text}`, 'note', 'PM');
  }, [task, addTimeline]);

  const logCall = useCallback((vendorName) => {
    addTimeline(`PM called ${vendorName || task?.vendor || 'Vendor'}`, 'call', 'PM');
  }, [addTimeline, task]);

  const logText = useCallback((vendorName) => {
    addTimeline(`PM texted ${vendorName || task?.vendor || 'Vendor'}`, 'message', 'PM');
  }, [addTimeline, task]);

  const setState = useCallback((newState, opts = {}) => {
    if (!task) return;
    const patch = {
      state: newState,
      group: STATE_TO_GROUP[newState] || task.group,
    };
    if (opts.vendor !== undefined)      patch.vendor = opts.vendor;
    if (opts.vendorFlagged !== undefined) patch.paymentOverdue = { ...(task.paymentOverdue || {}), vendorFlagged: opts.vendorFlagged };
    if (opts.extra)                     Object.assign(patch, opts.extra);
    onUpdate?.(patch);
    addTimeline(`Status → ${newState.replace(/-/g, ' ')}`, 'status', 'System');
  }, [task, onUpdate, addTimeline]);

  const transition = useCallback((key, label, type = 'status') => {
    addTimeline(label, type, 'PM');
    return { addTimeline, addNote, logCall, logText, setState };
  }, [addTimeline, addNote, logCall, logText, setState]);

  return { addTimeline, addNote, logCall, logText, setState, transition };
}