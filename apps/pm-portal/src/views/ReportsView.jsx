// src/views/ReportsView.jsx
import { useState, useCallback } from 'react';
import SmartSearch from './reports/SmartSearch';
import InsightsSection from './reports/InsightsSection';
import RisksSection from './reports/RisksSection';
import IntelligenceFeed from './reports/IntelligenceFeed';
import GeneratePanel from './reports/GeneratePanel';
import GenerateModal from './reports/GenerateModal';
import IntelligenceDrawer from './reports/IntelligenceDrawer';
import { generateReport } from './reports/reportExport';
import './ReportsView.css';

export default function ReportsView() {
  const [drawerId, setDrawerId]       = useState(null);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 2400);
  };

  const handleFilterChange = useCallback((q) => setFilterQuery(q), []);

  const handleGenerate = (opts) => {
    generateReport({ ...opts, onToast: showToast });
  };

  return (
    <div className="reports-view">
      <div className="reports-header">
        <div>
          <div className="reports-header__title">Reports</div>
          <div className="reports-header__sub">Operational intelligence for your portfolio.</div>
        </div>
      </div>

      <div className="reports-action-bar">
        <SmartSearch onOpenDrawer={setDrawerId} onFilterChange={handleFilterChange} />
        <button className="reports-create-btn" onClick={() => setGenModalOpen(true)}>
          + Generate Report ▾
        </button>
      </div>

      <div className="reports-body">
        <InsightsSection    filterQuery={filterQuery} />
        <RisksSection       onOpenDrawer={setDrawerId} filterQuery={filterQuery} />
        <IntelligenceFeed   onOpenDrawer={setDrawerId} filterQuery={filterQuery} />
        <GeneratePanel      onGenerate={handleGenerate} />
      </div>

      <IntelligenceDrawer drawerId={drawerId} onClose={() => setDrawerId(null)} />

      <GenerateModal
        open={genModalOpen}
        onClose={() => setGenModalOpen(false)}
        onGenerate={handleGenerate}
      />

      {toast && (
        <div className={`reports-toast reports-toast--${toast.type}`} key={toast.id}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}