// src/views/VendorsView.jsx
import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
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
import { PROPERTIES } from '../data/vendors';
import './VendorsView.css';

export default function VendorsView() {
  const [tab, setTab]                   = useState('coverage');
  const [attachments, setAttachments]   = useState({});
  const [sheet, setSheet]               = useState(null);
  const [sheetData, setSheetData]       = useState({});
  const [selectedProperty, setProperty] = useState(null);
  const [depWarning, setDepWarning]     = useState(null);
  const [toast, setToast]               = useState(null);
  const [VD, setVD]                     = useState({});
  const [loading, setLoading]           = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vendorsRes, coverageRes] = await Promise.all([
        apiFetch('/api/v1/vendors').then(r => r.json()),
        apiFetch('/api/v1/vendors/coverage').then(r => r.json())
      ]);
      
      if (vendorsRes?.data) {
        const liveVD = {};
        vendorsRes.data.forEach(v => {
          liveVD[v.id] = {
            name: v.name,
            sub: `${v.trade_count > 0 ? 'Multi-trade' : 'Specialty'} · ${v.tier}`,
            conf: v.org_status === 'active' || v.org_status === 'preferred' ? 'HIGH CONFIDENCE' : 'MODERATE',
            confCls: v.org_status === 'active' || v.org_status === 'preferred' ? 'high' : 'mod',
            confSub: v.org_status === 'preferred' ? 'Preferred Vendor' : (v.org_status === 'neutral' ? 'Active' : 'Pending Verification'),
            avatarBg: 'rgba(59,130,246,.12)',
            avatarColor: '#60a5fa',
            avail: (v.org_status === 'preferred' || v.org_status === 'neutral') ? '● Available Now' : '● Offline',
            availColor: (v.org_status === 'preferred' || v.org_status === 'neutral') ? 'var(--success)' : 'var(--slate)',
            ah: 'No',
            emg: 'Not eligible',
            emgColor: 'var(--slate)',
            jobs: `${v.task_count} in progress`,
            rel: v.rating > 0 ? (v.rating * 20).toString() : '85',
            relColor: 'var(--success)',
            sla: '95%',
            resp: '30m',
            coverage: 'All Properties',
            phone: v.contact_phone || '—',
            email: v.contact_email || '—',
            region: 'Local',
            trade: 'General',
            team: '1 technicians',
            since: '2023',
            trust: v.rating > 0 ? (v.rating * 20) : 85,
            slaReliability: 95,
            acceptanceRate: 90,
            reworkRate: 2,
            avgResponseMin: 30,
            paymentDisputes: 0,
            lastTen: [1,1,1,1,1,1,1,1,1,1],
          };
        });
        setVD(liveVD);
      }
      
      if (coverageRes?.data) {
        setAttachments(coverageRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleAttachConfirm = async ({ vendorId, vendorName, property }) => {
    // Determine property ID based on the property name from mock list
    // In real use, the AttachSheet should return propertyId directly.
    const propMeta = PROPERTIES.find(p => p.name === property);
    if (!propMeta) {
      showToast('Property not found', 'error');
      return;
    }

    try {
      const res = await apiFetch(`/api/v1/vendors/${vendorId}/coverage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: propMeta.id })
      });
      
      if (!res.ok) throw new Error('Failed to attach');
      
      showToast(`✓ ${vendorName} attached to ${property}`, 'success');
      closeSheet();
      loadData(); // reload coverage
      setTimeout(() => setTab('coverage'), 380);
    } catch (e) {
      showToast(e.message || 'Failed to attach', 'error');
    }
  };

  const handleDispatchConfirm = (jobId) => {
    showToast(`✓ Vendor dispatched to ${jobId}`, 'success');
    setTimeout(closeSheet, 1500);
  };

  const handleRemoveVendor = async (vendorId, propertyName) => {
    const propMeta = PROPERTIES.find(p => p.name === propertyName);
    if (!propMeta) return;

    try {
      const res = await apiFetch(`/api/v1/vendors/${vendorId}/coverage/${propMeta.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove coverage');
      
      showToast('Vendor removed from property', 'info');
      loadData();
    } catch (e) {
      showToast('Failed to remove', 'error');
    }
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
      case 'compliance':
      case 'history':
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
      case 'emergency':
        showToast('Emergency eligibility — coming soon', 'info');
        closeSheet();
        break;
      case 'suspend':
      case 'block':
        setDepWarning({ vendorId, action });
        closeSheet();
        break;
      default:
        closeSheet();
    }
  };

  const handleUpdateStatus = async (vendorId, status) => {
    try {
      const res = await apiFetch(`/api/v1/vendors/${vendorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      showToast(`Vendor status updated to ${status}`, 'success');
      loadData();
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="vendors-view">
      <VendorsTopBar onBell={() => showToast('Notifications — coming soon', 'info')} />
      <VendorsKpiStrip />
      <VendorsTabs active={tab} onChange={setTab} />

      {tab === 'coverage' && (
        <CoveragePane
          VD={VD}
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
          VD={VD}
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
          VD={VD}
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
          VD={VD}
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
          VD={VD}
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
            const newStatus = depWarning.action === 'block' ? 'not_receiving' : 'limited';
            handleUpdateStatus(depWarning.vendorId, newStatus);
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