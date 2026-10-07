// src/views/AlertsView.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import CommandHeader from './alerts/CommandHeader';
import SignalSections from './alerts/SignalSections';
import WhyPanel from './alerts/WhyPanel';
import OwnerStayDrawer from './alerts/OwnerStayDrawer';
import ApprovalInquiryDrawer from './alerts/ApprovalInquiryDrawer';
import { apiFetch } from '../utils/api';
import './AlertsView.css';

export default function AlertsView() {
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [whyKey, setWhyKey]         = useState(null);
  const [ownerStayOpen, setOS]      = useState(false);
  const [approvalOpen, setAI]       = useState(false);
  const [paused, setPaused]         = useState(false);
  const [toast, setToast]           = useState(null);
  const pauseTimerRef               = useRef(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/notifications');
      if (res.ok) {
        const data = await res.json();
        setCards(data.data || []);
      }
    } catch (e) {
      console.error(e);
      setToast({ msg: 'Failed to load notifications', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const toggleUnread = async (id) => {
    try {
      await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
      setCards(list => list.map(c => (c.id === id ? { ...c, unread: false } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const markLowRead = () => {
    setCards(list => list.map(c =>
      c.section === 'info' || c.section === 'attention'
        ? { ...c, unread: false }
        : c
    ));
    showToast('Low-priority notifications marked as read', 'success');
  };

  const pauseAlerts = () => {
    if (paused) {
      clearTimeout(pauseTimerRef.current);
      setPaused(false);
      showToast('Alerts resumed', 'info');
    } else {
      setPaused(true);
      showToast('Alerts paused for 30 minutes', 'warn');
      pauseTimerRef.current = setTimeout(() => {
        setPaused(false);
        showToast('Alerts resumed', 'info');
      }, 30 * 60 * 1000);
    }
  };

  useEffect(() => () => clearTimeout(pauseTimerRef.current), []);

  /* Card actions dispatcher */
  const handleAction = (action, card) => {
    if (!action) return;
    switch (action.type) {
      case 'openTask':
        // In real app: navigate to /tasks and open drawer
        showToast(`Opening task: ${action.task}`, 'info');
        break;
      case 'openOwnerStay':
        setOS(true);
        break;
      case 'quickDeclineOwnerStay':
        if (window.confirm('Decline this owner stay request?')) {
          setOS(true);
          showToast('Opening decline flow…', 'info');
        }
        break;
      case 'openApprovalInquiry':
        setAI(true);
        break;
      case 'withdrawApproval':
        if (window.confirm('Withdraw this approval request?')) {
          setCards(list => list.filter(c => c.id !== 'sig-approval-inquiry'));
          showToast('Approval request withdrawn', 'info');
        }
        break;
      case 'toast':
        showToast(action.msg, 'success');
        break;
      case 'devNote':
        showToast(`🛠 ${action.label} — not yet wired`, 'warn');
        break;
      default:
        showToast('Opening…', 'info');
    }
  };

  const handleSearch = (q) => {
    // search is applied via visibleCards below, but we keep the input controlled
  };

  const visibleCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(c =>
      c.property.toLowerCase().includes(q) ||
      c.event.toLowerCase().includes(q) ||
      (c.nickname && c.nickname.toLowerCase().includes(q)) ||
      c.context.toLowerCase().includes(q)
    );
  }, [cards, search]);

  return (
    <div className="alerts-view">
      <CommandHeader
        cards={cards}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onSearch={handleSearch}
        onMarkLowRead={markLowRead}
        onPauseAlerts={pauseAlerts}
        paused={paused}
        onOpenRules={() => showToast('🛠 Notification Rules — shipping in Step 4f', 'warn')}
      />

      <SignalSections
        cards={visibleCards}
        filter={filter}
        onAction={handleAction}
        onOpenWhy={setWhyKey}
        onToggleUnread={toggleUnread}
      />

      <WhyPanel whyKey={whyKey} onClose={() => setWhyKey(null)} />

      <OwnerStayDrawer
        open={ownerStayOpen}
        onClose={() => setOS(false)}
        onStateChange={(s) => {
          if (s === 'approved') {
            setCards(list => list.map(c =>
              c.id === 'sig-owner-stay'
                ? { ...c, unread: false, riskTimer: '✓ Approved · Apr 14–16', riskLevel: 'ok', badges: [{ text: 'APPROVED', tone: 'success' }] }
                : c
            ));
          } else if (s === 'declined') {
            setCards(list => list.map(c =>
              c.id === 'sig-owner-stay'
                ? { ...c, unread: false, riskTimer: '✕ Declined', riskLevel: 'normal', badges: [{ text: 'DECLINED', tone: 'crimson' }] }
                : c
            ));
          } else if (s === 'awaiting-owner') {
            setCards(list => list.map(c =>
              c.id === 'sig-owner-stay'
                ? { ...c, unread: false, badges: [{ text: 'AWAITING OWNER', tone: 'blue' }] }
                : c
            ));
          }
        }}
        onToast={showToast}
      />

      <ApprovalInquiryDrawer
        open={approvalOpen}
        onClose={() => setAI(false)}
        onStateChange={(s) => {
          if (s === 'pm-responded') {
            setCards(list => list.map(c =>
              c.id === 'sig-approval-inquiry'
                ? { ...c, unread: false, event: 'PM responded — awaiting owner decision · HVAC Service',
                    context: 'Response sent · Owner notified · Lake Nona Villa',
                    badges: [{ text: 'PM RESPONDED', tone: 'success', id: 'approval-inquiry-status-pill' }] }
                : c
            ));
          } else if (s === 'withdrawn') {
            setCards(list => list.filter(c => c.id !== 'sig-approval-inquiry'));
          }
        }}
        onToast={showToast}
      />

      {toast && (
        <div className={`alerts-toast show alerts-toast--${toast.type || 'info'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}