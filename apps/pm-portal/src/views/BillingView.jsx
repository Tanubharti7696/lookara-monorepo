import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import AccountStatusCard from './billing/AccountStatusCard';
import CurrentPlanCard from './billing/CurrentPlanCard';
import UsageCard from './billing/UsageCard';
import BillingHistoryCard from './billing/BillingHistoryCard';
import PaymentMethodCard from './billing/PaymentMethodCard';
import { ManageAddOnsModal, ChangePlanModal, UpdateCardModal, CancelSubscriptionModal } from './billing/BillingModals';
import { ACCOUNT_DATA, ADDONS, STATUS_META, STATUS_OPTIONS } from '../data/billing';
import './BillingView.css';

export default function BillingView({ canAdmin = true, onToast }) {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]       = useState('active');
  const [modal, setModal]         = useState(null);
  const [addons, setAddons]       = useState(() => {
    const init = {};
    ADDONS.forEach(a => { init[a.key] = { on: a.defaultOn }; });
    return init;
  });
  const [search, setSearch]       = useState('');

  const meta = STATUS_META[status];

  const fetchBilling = () => {
    setLoading(true);
    apiFetch('/api/v1/billing')
      .then(res => res.json())
      .then(data => {
        setBillingData(data);
        if (data?.subscription?.status) {
          setStatus(data.subscription.status);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const toggleAddon = (key, val) => setAddons(a => ({ ...a, [key]: { on: val } }));

  const downloadInvoice = (inv) => {
    const text = `
LOOKARA PROPERTY MANAGEMENT
Invoice ${inv.id}

Bill To: Sarah Chen / sarah.chen@example.com
Invoice Date: ${inv.date}
Payment Status: ${inv.status}

${inv.description}    $${inv.amount.toFixed(2)}

TOTAL                 $${inv.amount.toFixed(2)}
Payment Method: Visa ending in 4242
    `.trim();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Lookara-Invoice-${inv.id}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast(`Invoice ${inv.id} downloaded`, 'success');
  };

  return (
    <div className="billing-view">
      <div className="billing-header">
        <div className="billing-search">
          <span className="billing-search__icon">🔍</span>
          <input
            type="text"
            placeholder="Search billing, settings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="billing-header__right">
          <div className="bs-status-pill">
            <span className="bs-status-pill__dot" />
            <span>Active</span>
          </div>
          <select
            className="billing-status-sim"
            value={status}
            onChange={e => setStatus(e.target.value)}
            title="Simulate different account statuses"
          >
            {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="billing-body">
        <AccountStatusCard status={status} data={ACCOUNT_DATA} />

        {meta.banner && (
          <RestrictionBanner
            meta={meta.banner}
            onAction={(kind, msg) => {
              if (kind === 'updateCard') setModal('updateCard');
              else if (kind === 'changePlan') setModal('changePlan');
              else if (kind === 'scrollToHistory') document.querySelector('.bs-card:has(.bs-table)')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              else if (kind === 'toast') onToast(msg, 'info');
            }}
          />
        )}

        <CurrentPlanCard
          data={ACCOUNT_DATA}
          addons={addons}
          canAdmin={canAdmin}
          onChangePlan={() => setModal('changePlan')}
          onManageAddOns={() => setModal('manageAddOns')}
          onCancel={() => setModal('cancelSub')}
          onToast={onToast}
        />

        <UsageCard data={ACCOUNT_DATA} />
        <BillingHistoryCard onDownloadInvoice={downloadInvoice} invoices={billingData?.invoices || []} />
        <PaymentMethodCard
          canAdmin={canAdmin}
          paymentMethod={billingData?.paymentMethods?.[0]}
          onUpdateCard={() => setModal('updateCard')}
        />
      </div>

      {modal === 'manageAddOns' && (
        <ManageAddOnsModal
          addons={addons}
          onAddonsChange={toggleAddon}
          canAdmin={canAdmin}
          onClose={() => setModal(null)}
          onToast={onToast}
        />
      )}
      {modal === 'changePlan' && (
        <ChangePlanModal
          currentPlan={ACCOUNT_DATA.currentPlan}
          canAdmin={canAdmin}
          onConfirm={(newPlan) => {
            onToast(`Plan changed to ${newPlan}. Effective next billing cycle.`, 'success');
            setModal(null);
          }}
          onClose={() => setModal(null)}
          onToast={onToast}
        />
      )}
      {modal === 'updateCard' && (
        <UpdateCardModal
          onClose={() => setModal(null)}
          onSave={(card) => {
            apiFetch('/api/v1/billing/payment-methods', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'card',
                lastFour: card.last4,
                brand: card.cardType,
                isDefault: true
              })
            }).then(() => {
              onToast(`Payment method updated to ${card.cardType} ending in ${card.last4}`, 'success');
              fetchBilling();
              setModal(null);
            });
          }}
          onToast={onToast}
        />
      )}
      {modal === 'cancelSub' && (
        <CancelSubscriptionModal
          onClose={() => setModal(null)}
          onConfirm={() => { onToast('Subscription cancelled. Access ends Jan 18, 2026.', 'error'); setModal(null); }}
        />
      )}
    </div>
  );
}

function RestrictionBanner({ meta, onAction }) {
  return (
    <div className={`bs-banner bs-banner--${meta.tone}`}>
      <div className="bs-banner__icon">{meta.icon}</div>
      <div className="bs-banner__content">
        <div className="bs-banner__title">{meta.title}</div>
        <div className="bs-banner__msg">{meta.message}</div>
      </div>
      <div className="bs-banner__actions">
        {meta.actions.map((a, i) => (
          <button key={i} className="bs-btn bs-btn--primary bs-btn--sm" onClick={() => onAction(a.kind, a.toastMsg)}>
            {a.text}
          </button>
        ))}
      </div>
    </div>
  );
}