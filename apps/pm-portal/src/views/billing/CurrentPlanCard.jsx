// src/views/billing/CurrentPlanCard.jsx
import { useState } from 'react';
import { ACCOUNT_DATA, ADDONS, planTotal } from '../../data/billing';

export default function CurrentPlanCard({ data, addons, onChangePlan, onManageAddOns, onCancel, canAdmin, onToast }) {
  const [autoRenew, setAutoRenew] = useState(true);
  const plan = ACCOUNT_DATA.planRates[data.currentPlan];
  const total = planTotal(data.currentPlan, data.activeProperties);

  const activeAddonNames = ADDONS.filter(a => addons[a.key]?.on).map(a => a.name);
  const features = ACCOUNT_DATA.planFeatures[data.currentPlan];

  return (
    <div className="bs-card">
      <div className="bs-card__topline">
        <div className="bs-card__title">Current Plan</div>
        <div className="bs-card__meta">{data.planName} • {data.activeProperties} active properties</div>
      </div>

      <div className="bs-plan-grid">
        <div>
          <div className="bs-plan-tagline">{plan.tagline}</div>
          <div className="bs-plan-price">
            ${plan.base}
            <span className="bs-plan-price__muted">/month</span>{' '}
            <span className="bs-plan-price__muted">+ ${plan.perProperty}/property</span>
          </div>
          <div className="bs-plan-range">{plan.range} range</div>
          <div className="bs-plan-note">Property count auto-updates when you add/remove properties</div>

          <div className="bs-plan-meta-grid">
            <div className="bs-plan-meta-grid__label">Next Billing:</div>
            <div className="bs-plan-meta-grid__value">{data.nextBillingDate}</div>
            <div className="bs-plan-meta-grid__label">Payment:</div>
            <div className="bs-plan-meta-grid__value">Visa ••4242</div>
            <div className="bs-plan-meta-grid__label">Active Properties:</div>
            <div className="bs-plan-meta-grid__value">{data.activeProperties} properties</div>
            <div className="bs-plan-meta-grid__label">Total:</div>
            <div className="bs-plan-meta-grid__value">${total}/month</div>
          </div>

          <div className="bs-autorenew-row">
            <button
              type="button"
              className={`bs-toggle ${autoRenew ? 'active' : ''}`}
              onClick={() => { setAutoRenew(v => !v); onToast(autoRenew ? 'Auto-renew disabled' : 'Auto-renew enabled', 'success'); }}
            >
              <span className="bs-toggle__knob" />
            </button>
            <span>Auto-renew {autoRenew ? 'enabled' : 'disabled'}</span>
          </div>
        </div>

        <div>
          <div className="bs-section-label">Active Add-Ons</div>
          <div className="bs-addons-summary">{activeAddonNames.join(' · ') || 'None'}</div>

          <div className="bs-section-label">Plan Features</div>
          <div className="bs-plan-note">{plan.engineLevel}</div>
          <ul className="bs-feature-list">
            {features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      </div>

      <div className="bs-card__actions">
        {canAdmin && (
          <button className="bs-btn bs-btn--primary bs-btn--sm" onClick={onChangePlan}>Change Plan</button>
        )}
        <button className="bs-btn bs-btn--outline bs-btn--sm" onClick={onManageAddOns}>Manage Add-Ons</button>
        {canAdmin && (
          <button className="bs-btn bs-btn--danger bs-btn--sm bs-card__actions-right" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}