import { useState, useEffect, useRef, useCallback } from 'react';
import LeftPanel from './components/LeftPanel';
import Topbar from './components/Topbar';
import TabBar from './components/TabBar';
import RequirementsTab from './components/RequirementsTab';
import DataModelTab from './components/DataModelTab';
import AppliedToTab from './components/AppliedToTab';
import ChangeLogTab from './components/ChangeLogTab';
import PreviewPanel from './components/PreviewPanel';
import Toast from './components/Toast';
import { INITIAL_REQS } from './constants';
import './Compliance.css'; // Updated to use the correct CSS filename

export default function App() {
  const [template, setTemplate] = useState({
    name: 'NYC STR Compliance',
    jurisdiction: 'New York City',
    propType: 'Short-Term Rental (STR)',
    cycle: 'Annual',
    description: 'Short-term rental requirements for New York City properties. Required for all STR listings operating under Local Law 18.',
    status: 'draft',
  });

  const [behaviour, setBehaviour] = useState({
    autoRemind: true,
    blockOps: true,
    requireInspection: false,
    notifyOwner: true,
  });

  const [reqs, setReqs] = useState(INITIAL_REQS);
  const [activeTab, setActiveTab] = useState('requirements');
  const [leftOpen, setLeftOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [toast, setToast] = useState<any>(null);
  const toastTimer = useRef<any>(null);

  const showToast = useCallback((message: any, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const handlePublish = () => {
    setTemplate((t) => ({ ...t, status: 'active' }));
    showToast('Template published — now available to apply to properties', 'success');
  };
  const handleSaveDraft = () => showToast('Draft saved', 'info');
  const handleDelete = () => showToast('Template deleted', 'error');
  const handlePreview = () => showToast('Preview on Compliance page', 'info');
  const handleDuplicate = () => showToast('Duplicate template', 'info');

  return (
    <div className="shell">
      <div className={`backdrop ${leftOpen || previewOpen ? 'show' : ''}`}
        onClick={() => { setLeftOpen(false); setPreviewOpen(false); }} />

      <LeftPanel
        isOpen={leftOpen}
        onClose={() => setLeftOpen(false)}
        template={template}
        setTemplate={setTemplate}
        behaviour={behaviour}
        setBehaviour={setBehaviour}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onDelete={handleDelete}
      />

      <div className="main">
        <Topbar
          name={template.name}
          onPreview={handlePreview}
          onDuplicate={handleDuplicate}
          onToggleLeft={() => setLeftOpen(true)}
          onTogglePreview={() => setPreviewOpen(true)}
        />
        <TabBar active={activeTab} onChange={setActiveTab} reqCount={reqs.length} />
        <div className="main-content">
          {activeTab === 'requirements' && <RequirementsTab reqs={reqs} setReqs={setReqs} />}
          {activeTab === 'datamodel' && <DataModelTab />}
          {activeTab === 'applied' && <AppliedToTab onToast={showToast} />}
          {activeTab === 'history' && <ChangeLogTab />}
        </div>
      </div>

      <PreviewPanel
        reqs={reqs}
        templateName={template.name}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <Toast toast={toast} />
    </div>
  );
}
