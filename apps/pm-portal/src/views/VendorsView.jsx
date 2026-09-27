// src/views/VendorsView.jsx
import { useState } from 'react';
import VendorsTopBar from './vendors/VendorsTopBar';
import VendorsKpiStrip from './vendors/VendorsKpiStrip';
import VendorsTabs from './vendors/VendorsTabs';
import CoveragePane from './vendors/CoveragePane';
import DirectoryPane from './vendors/DirectoryPane';
import InvitePane from './vendors/InvitePane';
import VendorDetailSheet from './vendors/VendorDetailSheet';
import AttachSheet from './vendors/AttachSheet';
import DispatchSheet from './vendors/DispatchSheet';
import MoreSheet from './vendors/MoreSheet';
import DependencyWarning from './vendors/DependencyWarning';
import { VENDOR_ATTACHMENTS, VD, PROPERTIES } from '../data/vendors';
import './VendorsView.css';

export default function VendorsView() {
  const [tab, setTab]                   = useState('coverage');
  const [attachments, setAttachments]   = useState(VENDOR_ATTACHMENTS);
  const [sheet, setSheet]               = useState(null); // 'vendorDetail'|'attach'|'dispatch'|'more'|null
  const [sheetData, setSheetData]       = useState({});
  const [selectedProperty, setProperty] = useState(null);
  const [depWarning, setDepWarning]     = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 2600);
  };

  const openVendor = (vendorId) => {
    setSheetData({ vendorId });
    setSheet('vendorDetail');
  };

  const openAttach = (vendorId, vendorName, vendorTrade) => {
    setSheetData({ vendorId, vendorName, vendorTrade });
    setSheet('attach');
  };

  const openDispatch = (vendorId) => {
    setSheetData({ vendorId });
    setSheet('dispatch');
  };

  const openMore = (vendorId, vendorName) => {
    setSheetData({ vendorId, vendorName });
    setSheet('more');
  };

  const closeSheet = () => { setSheet(null); setSheetData({}); };

  const handleAttachConfirm = ({ vendorId, vendorName, property }) => {
    const existing = attachments[vendorId] || [];
    if (existing.some(r => r.property === property)) {
      showToast(`${vendorName} is already attached to ${property}`, 'info');
      closeSheet();
      return;
    }
    setAttachments(prev => ({
      ...prev,
      [vendorId]: [...(prev[vendorId] || []), {
        property,
        label: `Preferred #${(prev[vendorId]?.length || 0) + 1}`,
      }],
    }));
    showToast(`✓ ${vendorName} attached to ${property}`, 'success');
    closeSheet();
    setTimeout(() => setTab('coverage'), 380);
  };

  const handleDispatchConfirm = (jobId) => {
    showToast(`✓ Vendor dispatched to ${jobId}`, 'success');
    setTimeout(closeSheet, 1500);
  };

  const handleRemoveVendor = (vendorId, propertyName) => {
    setAttachments(prev => ({
      ...prev,
      [vendorId]: (prev[vendorId] || []).filter(r => r.property !== propertyName),
    }));
    showToast('Vendor removed', 'info');
  };

  const handleReplaceVendor = (propertyName) => {
    setProperty(propertyName);
    setTab('directory');
  };

  const handleFlash = (rank) => showToast(`Rank updated to ${rank}`, 'success');

  const handleSheetAction = (action, vendorId) => {
    const v = VD[vendorId];
    switch (action) {
      case 'profile':
        closeSheet();
        setTimeout(() => openVendor(vendorId), 120);
        break;
      case 'attach':
        closeSheet();
        setTimeout(() => openAttach(vendorId, v.name, v.trade), 120);
        break;
      case 'autodispatch':
        showToast('Autodispatch enabled', 'success');
        closeSheet();
        break;
      case 'compliance':
        closeSheet();
        setTimeout(() => openVendor(vendorId), 120);
        break;
      case 'history':
        closeSheet();
        setTimeout(() => openVendor(vendorId), 120);
        break;
      case 'emergency':
        showToast('Emergency eligibility — coming soon', 'info');
        closeSheet();
        break;
      case 'suspend':
        setDepWarning({ vendorId, action: 'suspend' });
        closeSheet();
        break;
      case 'block':
        setDepWarning({ vendorId, action: 'block' });
        closeSheet();
        break;
      default:
        closeSheet();
    }
  };

  return (
    <div className="vendors-view">
      <VendorsTopBar onBell={() => showToast('Notifications — coming soon', 'info')} />
      <VendorsKpiStrip />
      <VendorsTabs active={tab} onChange={setTab} />

      {tab === 'coverage' && (
        <CoveragePane
          attachments={attachments}
          onOpenVendor={openVendor}
          onAttach={(propName) => {
            // Picking a vendor requires going to directory; but CoverageCard "+ Add"
            // is meant to jump to Directory with the property preselected.
            setProperty(propName);
            setTab('directory');
          }}
          onReplace={handleReplaceVendor}
          onRemove={handleRemoveVendor}
          onFlash={handleFlash}
          onToast={showToast}
        />
      )}

      {tab === 'directory' && (
        <DirectoryPane
          selectedProperty={selectedProperty}
          onSelectProperty={setProperty}
          onClearProperty={() => setProperty(null)}
          attachments={attachments}
          onOpenVendor={openVendor}
          onAttach={openAttach}
          onToast={showToast}
        />
      )}

      {tab === 'invite' && <InvitePane onToast={showToast} />}

      {sheet === 'vendorDetail' && (
        <VendorDetailSheet
          vendorId={sheetData.vendorId}
          attachments={attachments}
          onClose={closeSheet}
          onOpenDispatch={openDispatch}
          onOpenAttach={openAttach}
          onToast={showToast}
        />
      )}

      {sheet === 'attach' && (
        <AttachSheet
          vendorId={sheetData.vendorId}
          vendorName={sheetData.vendorName}
          vendorTrade={sheetData.vendorTrade}
          selectedProperty={selectedProperty}
          onClose={closeSheet}
          onConfirm={handleAttachConfirm}
          onToast={showToast}
        />
      )}

      {sheet === 'dispatch' && (
        <DispatchSheet
          vendorId={sheetData.vendorId}
          onClose={closeSheet}
          onConfirm={handleDispatchConfirm}
          onToast={showToast}
        />
      )}

      {sheet === 'more' && (
        <MoreSheet
          vendorId={sheetData.vendorId}
          vendorName={sheetData.vendorName}
          onClose={closeSheet}
          onAction={handleSheetAction}
        />
      )}

      {depWarning && (
        <DependencyWarning
          vendorName={VD[depWarning.vendorId]?.name || 'This vendor'}
          action={depWarning.action}
          onReviewFirst={() => { setDepWarning(null); setTab('coverage'); }}
          onProceed={() => {
            showToast(
              (depWarning.action === 'block' ? 'Vendor blocked' : 'Vendor suspended') + ' — contact admin to reverse',
              'info'
            );
            setDepWarning(null);
          }}
          onCancel={() => setDepWarning(null)}
        />
      )}

      {toast && (
        <div className={`vendors-toast vendors-toast--${toast.type}`} key={toast.id}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}