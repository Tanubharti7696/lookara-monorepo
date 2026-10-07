// src/views/ComplianceTemplateBuilder.jsx
import { useState, useMemo, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import LeftPanel from './compliance-builder/LeftPanel';
import Topbar from './compliance-builder/Topbar';
import TabsBar from './compliance-builder/TabsBar';
import RequirementsTab from './compliance-builder/RequirementsTab';
import DataModelTab from './compliance-builder/DataModelTab';
import AppliedToTab from './compliance-builder/AppliedToTab';
import ChangeLogTab from './compliance-builder/ChangeLogTab';
import PreviewPanel from './compliance-builder/PreviewPanel';
import { INITIAL_TEMPLATE } from '../data/complianceTemplates';
import './ComplianceTemplateBuilder.css';

export default function ComplianceTemplateBuilder({ onNavigateBack, onToast }) {
  const [template, setTemplate]   = useState(INITIAL_TEMPLATE);
  const [activeTab, setActiveTab] = useState('requirements');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [autoFocusId, setAutoFocusId] = useState(null);
  const [nextId, setNextId] = useState(
    INITIAL_TEMPLATE.requirements.reduce((m, r) => Math.max(m, r.id), 0) + 1
  );

  /* Auto-clear autoFocusId after the tab has handled it */
  const clearAutoFocus = useCallback(() => setAutoFocusId(null), []);

  /* ────────── Template field updates ────────── */
  const handleTemplateChange = (patch) => {
    setTemplate(t => ({ ...t, ...patch }));
  };

  /* ────────── Requirement mutations ────────── */
  const updateReq = (id, patch) => {
    setTemplate(t => ({
      ...t,
      requirements: t.requirements.map(r => (r.id === id ? { ...r, ...patch } : r)),
    }));
  };

  const deleteReq = (id) => {
    setTemplate(t => ({
      ...t,
      requirements: t.requirements.filter(r => r.id !== id),
    }));
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleReq = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const collapseAll = () => setExpandedIds(new Set());

  const addReq = (type) => {
    const newId = nextId;
    setNextId(n => n + 1);
    setTemplate(t => ({
      ...t,
      requirements: [
        ...t.requirements,
        {
          id: newId,
          name: '',
          type,
          cycle: 'Annual',
          dueMonth: 1,
          dueDay: 1,
          inspection: type === 'Inspection',
          opsBlocker: false,
          priority: 'medium',
          docs: [],
          notes: '',
        },
      ],
    }));
    setExpandedIds(prev => new Set([...prev, newId]));
    setAutoFocusId(newId);
    // Clear after a moment so the animation/effect doesn't refire
    setTimeout(clearAutoFocus, 400);
  };

  const addDoc = (reqId) => {
    setTemplate(t => ({
      ...t,
      requirements: t.requirements.map(r =>
        r.id === reqId ? { ...r, docs: [...r.docs, ''] } : r
      ),
    }));
    // Focus the newly-added doc input on next paint
    setAutoFocusId(reqId);
  };

  const updateDoc = (reqId, idx, val) => {
    setTemplate(t => ({
      ...t,
      requirements: t.requirements.map(r => {
        if (r.id !== reqId) return r;
        const docs = [...r.docs];
        docs[idx] = val;
        return { ...r, docs };
      }),
    }));
  };

  const removeDoc = (reqId, idx) => {
    setTemplate(t => ({
      ...t,
      requirements: t.requirements.map(r => {
        if (r.id !== reqId) return r;
        return { ...r, docs: r.docs.filter((_, i) => i !== idx) };
      }),
    }));
  };

  /* ────────── Actions ────────── */
  const publish = () => {
    const patch = { status: 'active' };
    saveToApi({ ...template, ...patch }).then((saved) => {
      setTemplate(t => ({
        ...t,
        ...saved,
        changeLog: [
          {
            icon: '📋',
            title: 'Template published',
            user: 'You',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            detail: `Status changed: ${t.status} → active`,
          },
          ...t.changeLog,
        ],
      }));
      onToast?.('Template published — now available to apply to properties', 'success');
    });
  };

  const saveDraft = () => {
    saveToApi(template).then((saved) => {
      setTemplate(t => ({ ...t, ...saved }));
      onToast?.('Draft saved', 'info');
    });
  };

  const saveToApi = (data) => {
    return apiFetch('/api/v1/compliance/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json());
  };

  const duplicate = () => {
    setTemplate(t => ({
      ...t,
      id: `${t.id}-copy`,
      name: `${t.name} (Copy)`,
      status: 'draft',
      changeLog: [
        {
          icon: '⎘',
          title: 'Template duplicated',
          user: 'You',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          detail: `Duplicated from ${t.name}`,
        },
        ...t.changeLog,
      ],
    }));
    onToast?.('Template duplicated', 'success');
  };

  const deleteTemplate = () => {
    if (!window.confirm('Delete this template? This cannot be undone.')) return;
    onToast?.('Template deleted', 'error');
    setTimeout(() => onNavigateBack?.(), 700);
  };

  const preview = () => {
    onToast?.('Preview on Compliance page — will open when integrated', 'info');
  };

  const appliedView = (property) => {
    onToast?.(`View compliance items for ${property}`, 'info');
  };

  const appliedRemove = (property) => {
    if (!window.confirm(`Remove template from ${property}?`)) return;
    setTemplate(t => ({
      ...t,
      appliedTo: t.appliedTo.filter(a => a.property !== property),
    }));
    onToast?.(`Removed from ${property}`, 'info');
  };

  const applyMore = () => {
    onToast?.('Apply to more properties — will open picker when integrated', 'info');
  };

  /* ────────── Render ────────── */
  return (
    <div className="ctb-shell">
      <LeftPanel
        template={template}
        onChange={handleTemplateChange}
        onPublish={publish}
        onSaveDraft={saveDraft}
        onDelete={deleteTemplate}
      />

      <div className="ctb-main">
        <Topbar
          templateName={template.name}
          onPreview={preview}
          onDuplicate={duplicate}
        />

        <TabsBar
          active={activeTab}
          onChange={setActiveTab}
          reqCount={template.requirements.length}
        />

        <div className="ctb-content">
          {activeTab === 'requirements' && (
            <RequirementsTab
              requirements={template.requirements}
              expandedIds={expandedIds}
              autoFocusId={autoFocusId}
              onToggle={toggleReq}
              onUpdateReq={updateReq}
              onDeleteReq={deleteReq}
              onAddReq={addReq}
              onAddDoc={addDoc}
              onUpdateDoc={updateDoc}
              onRemoveDoc={removeDoc}
              onCollapseAll={collapseAll}
            />
          )}
          {activeTab === 'datamodel' && <DataModelTab />}
          {activeTab === 'applied'   && (
            <AppliedToTab
              template={template}
              onView={appliedView}
              onRemove={appliedRemove}
              onApplyMore={applyMore}
            />
          )}
          {activeTab === 'history'   && <ChangeLogTab entries={template.changeLog} />}
        </div>
      </div>

      <PreviewPanel templateName={template.name} requirements={template.requirements} />
    </div>
  );
}