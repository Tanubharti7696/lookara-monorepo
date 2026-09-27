// src/data/tasks.js
import {
  STATE_TO_GROUP,
  ARCHIVE_STATES,
  COUNTER_MATCHERS,
  SEARCH_KEYWORDS,
  SOURCE_LABELS,
  SEVERITY_TO_PRIORITY,
  SEVERITY_TO_STRIPE,
} from './taskMeta';

export { ARCHIVE_STATES, COUNTER_MATCHERS, SEARCH_KEYWORDS };

// Empty default list - real tasks are created by user and persisted in state
const raw = [];

/* Enrich each task with derived fields (group, sourceLabel, priority, etc.) */
export const TASKS = raw.map(t => {
  const sev   = t.severity || 'NORMAL';
  const group = STATE_TO_GROUP[t.state] || 'dispatch';
  const src   = SOURCE_LABELS[t.source] || SOURCE_LABELS.manual_intake;
  const pri   = SEVERITY_TO_PRIORITY[sev] || SEVERITY_TO_PRIORITY.NORMAL;
  const stripe = SEVERITY_TO_STRIPE[sev] || 'normal';
  const archived = ARCHIVE_STATES.has(t.state);

  return {
    ...t,
    severity: sev,
    group,
    sourceLabel: src.label,
    sourceCls: src.cls,
    priorityCls: pri.cls,
    priorityLabel: pri.label,
    stripe,
    archived,
  };
});

export const TASKS_BY_ID = Object.fromEntries(TASKS.map(t => [t.id, t]));
export const getTaskById = (id) => TASKS_BY_ID[id] || null;
export const getTaskByName = (name) => TASKS.find(t => t.name === name) || null;
