// src/views/billing/BillingModals.jsx
import { useState, useEffect } from 'react';
import { ACCOUNT_DATA, ADDONS, planTotal } from '../../data/billing';

const ModalShell = ({ title, sub, onClose, wide, children, footer }) => (
  <div className="bs-modal-backdrop" onClick={onClose}>
    <div className={`bs-modal ${wide ? 'bs-modal--wide' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="bs-modal__head">
        <div>
          <div className="bs-modal__title">{title}</div>
          {sub && <div className="bs-modal__sub">{sub}</div>}
        </div>
        <button className="bs-modal__close" onClick={onClose}>×</button>
      </div>
      <div className="bs-modal__body">{children}</div>
      {footer && <div className="bs-modal__foot">{footer}</div>}
    </div>
  </div>
);

/* ─── 1. Manage Add-ons ─── */
export function ManageAddOnsModal({ addons, onAddonsChange, onClose, onToast, canAdmin }) {
  const n = ACCOUNT_DATA.activeProperties;
  const base = planTotal(ACCOUNT_DATA.currentPlan, n);
  const addonCost = ADDONS.reduce((sum, a) => a.on !== undefined ? sum + (addons[a.key]?.on ? (a.perProperty * n) + a.perAccount : 0) : sum, 0);
  const total = base + addonCost;

  return (
    <ModalShell
      title="Manage Add-Ons"
      onClose={onClose}
      footer={
        <>
          <button className="bs-btn bs-btn--outline" onClick={onClose}>Cancel</button>
          {canAdmin && <button className="bs-btn bs-btn--primary" onClick={onClose}>Save Changes</button>}
        </>
      }
    >
      <div className="bs-modal__desc">Add or remove tool add-ons to customize your Lookara experience. Changes apply on your next billing cycle.</div>

      {ADDONS.map(a => {
        const on = addons[a.key]?.on;
        const unitPrice = a.perProperty ? `${a.perProperty * n} (${a.perProperty}×${n} props)` : `${a.perAccount}/acct`;
        return (
          <div key={a.key} className="bs-addon-item">
            <div className="bs-addon-item__info">
              <h3>{a.name}</h3>
              <div className="bs-addon-item__desc">{a.desc}</div>
              <div className="bs-addon-item__price">{a.priceLabel} → ${unitPrice}</div>
            </div>
            <button
              type="button"
              className={`bs-toggle ${on ? 'active' : ''}`}
              disabled={!canAdmin}
              onClick={() => canAdmin && onAddonsChange(a.key, !on)}
            >
              <span className="bs-toggle__knob" />
            </button>
          </div>
        );
      })}

      <div className="bs-modal-total">
        <div className="bs-modal-total__row">
          <span>Estimated Monthly Total:</span>
          <span className="bs-modal-total__value">${total}/month</span>
        </div>
        <div className="bs-modal-total__sub">{ACCOUNT_DATA.planName} base (${ACCOUNT_DATA.planRates[ACCOUNT_DATA.currentPlan].base}) + {n} properties × ${ACCOUNT_DATA.planRates[ACCOUNT_DATA.currentPlan].perProperty}</div>
      </div>
    </ModalShell>
  );
}

/* ─── 2. Change Plan ─── */
export function ChangePlanModal({ currentPlan, onConfirm, onClose, onToast, canAdmin }) {
  const [selected, setSelected] = useState(currentPlan);

  const plans = ['starter', 'growth', 'professional'];
  const n = ACCOUNT_DATA.activeProperties;

  const compare = selected !== currentPlan;

  return (
    <ModalShell
      title="Change Plan"
      onClose={onClose}
      wide
    >
      <div className="bs-plan-picker">
        {plans.map(key => {
          const r = ACCOUNT_DATA.planRates[key];
          const total = planTotal(key, n);
          const isCurrent = key === currentPlan;
          const isSelected = key === selected;
          return (
            <div
              key={key}
              className={`bs-plan-option ${isSelected ? 'is-selected' : ''} ${isCurrent ? 'is-current' : ''}`}
              onClick={() => !isCurrent && setSelected(key)}
            >
              {isCurrent && <div className="bs-plan-option__ribbon">CURRENT PLAN</div>}
              <div className="bs-plan-option__name">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div className="bs-plan-option__tagline">{r.tagline}</div>
              <div className="bs-plan-option__range">{r.range}</div>
              <div className="bs-plan-option__price">${r.base}<span className="bs-plan-price__muted">/mo</span></div>
              <div className="bs-plan-option__perprop">+ ${r.perProperty} per property</div>
              <div className="bs-plan-option__engine">{r.engineLevel}</div>
              <ul className="bs-feature-list bs-feature-list--compact">
                {ACCOUNT_DATA.planFeatures[key].map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <div className="bs-plan-option__calc">${total}/month with {n} properties</div>
              {!isCurrent && (
                <button
                  type="button"
                  className="bs-btn bs-btn--outline bs-btn--sm bs-plan-option__cta"
                  onClick={(e) => { e.stopPropagation(); setSelected(key); }}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {compare && (
        <div className="bs-plan-compare">
          <div className="bs-plan-compare__title">💰 Pricing Comparison</div>
          <div className="bs-plan-compare__grid">
            <div className="bs-plan-compare__side bs-plan-compare__side--right">
              <div className="bs-plan-compare__label">Current Plan</div>
              <div className="bs-plan-compare__name">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</div>
              <div className="bs-plan-compare__rate">${planTotal(currentPlan, n)}/month</div>
            </div>
            <div className="bs-plan-compare__arrow">→</div>
            <div className="bs-plan-compare__side">
              <div className="bs-plan-compare__label">New Plan</div>
              <div className="bs-plan-compare__name">{selected.charAt(0).toUpperCase() + selected.slice(1)}</div>
              <div className="bs-plan-compare__rate" style={{ color: 'var(--gold)' }}>${planTotal(selected, n)}/month</div>
            </div>
          </div>
          <div className="bs-plan-compare__diff">
            {(() => {
              const delta = planTotal(currentPlan, n) - planTotal(selected, n);
              if (delta > 0) return <span style={{ color: 'var(--success)' }}>💚 Save ${delta}/month</span>;
              if (delta < 0) return <span style={{ color: 'var(--gold)' }}>📈 Additional ${Math.abs(delta)}/month</span>;
              return <span style={{ color: 'var(--text-2)' }}>Same monthly rate</span>;
            })()}
          </div>
        </div>
      )}

      <div className="bs-modal__foot">
        <button className="bs-btn bs-btn--outline" onClick={onClose}>Cancel</button>
        <button
          className="bs-btn bs-btn--primary"
          disabled={selected === currentPlan || !canAdmin}
          onClick={() => onConfirm(selected)}
        >
          {selected === currentPlan ? 'Current Plan' : 'Confirm Change'}
        </button>
      </div>
    </ModalShell>
  );
}

/* ─── 3. Update Card ─── */
export function UpdateCardModal({ onClose, onSave, onToast }) {
  const [form, setForm] = useState({ number: '', expiry: '', cvv: '', name: '', zip: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleNumber = (v) => {
    const cleaned = v.replace(/\s/g, '');
    set('number', cleaned.match(/.{1,4}/g)?.join(' ') || cleaned);
  };
  const handleExpiry = (v) => {
    const cleaned = v.replace(/\D/g, '');
    set('expiry', cleaned.length >= 2 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) : cleaned);
  };
  const handleCVV = (v) => set('cvv', v.replace(/\D/g, ''));

  const handleSave = () => {
    if (!form.number || !form.expiry || !form.cvv || !form.name || !form.zip) {
      onToast('Please fill in all fields', 'error');
      return;
    }
    const last4 = form.number.replace(/\s/g, '').slice(-4);
    const firstDigit = form.number.trim()[0];
    const cardType = firstDigit === '4' ? 'Visa' : firstDigit === '5' ? 'Mastercard' : firstDigit === '3' ? 'Amex' : 'Card';
    onSave({ last4, cardType, expiry: form.expiry, name: form.name });
    onClose();
  };

  return (
    <ModalShell
      title="Update Payment Method"
      sub="Your new card will become the default payment method"
      onClose={onClose}
      footer={
        <>
          <button className="bs-btn bs-btn--outline" onClick={onClose}>Cancel</button>
          <button className="bs-btn bs-btn--primary" onClick={handleSave}>Save Card</button>
        </>
      }
    >
      <div className="bs-field">
        <label className="bs-field__label">Card Number</label>
        <input className="bs-field__input" placeholder="1234 5678 9012 3456" maxLength={19} value={form.number} onChange={e => handleNumber(e.target.value)} />
      </div>
      <div className="bs-field-row2">
        <div className="bs-field">
          <label className="bs-field__label">Expiry Date</label>
          <input className="bs-field__input" placeholder="MM/YY" maxLength={5} value={form.expiry} onChange={e => handleExpiry(e.target.value)} />
        </div>
        <div className="bs-field">
          <label className="bs-field__label">CVV</label>
          <input className="bs-field__input" placeholder="123" maxLength={4} value={form.cvv} onChange={e => handleCVV(e.target.value)} />
        </div>
      </div>
      <div className="bs-field">
        <label className="bs-field__label">Cardholder Name</label>
        <input className="bs-field__input" placeholder="Sarah Chen" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div className="bs-field">
        <label className="bs-field__label">Billing ZIP Code</label>
        <input className="bs-field__input" placeholder="12345" maxLength={10} value={form.zip} onChange={e => set('zip', e.target.value)} />
      </div>
      <div className="bs-modal__note">🔒 Your payment information is encrypted and secure. We never store your full card number.</div>
    </ModalShell>
  );
}

/* ─── 4. Cancel Subscription ─── */
export function CancelSubscriptionModal({ onClose, onConfirm }) {
  return (
    <ModalShell
      title="Cancel Subscription"
      onClose={onClose}
      footer={
        <>
          <button className="bs-btn bs-btn--outline" onClick={onClose} style={{ flex: 1 }}>Keep Subscription</button>
          <button className="bs-btn bs-btn--danger" onClick={onConfirm} style={{ flex: 1 }}>Cancel Subscription</button>
        </>
      }
    >
      <div className="bs-modal__desc">We're sorry to see you go. Are you sure you want to cancel your subscription?</div>
      <div className="bs-modal__warn">⚠️ Your access will end on Jan 18, 2026. All data will be permanently deleted 30 days after cancellation.</div>
    </ModalShell>
  );
}