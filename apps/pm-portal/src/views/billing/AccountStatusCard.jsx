// src/views/billing/AccountStatusCard.jsx
import { STATUS_META } from '../../data/billing';

export default function AccountStatusCard({ status, data }) {
  const meta = STATUS_META[status] || STATUS_META.active;
  return (
    <div className="bs-status-card">
      <div className="bs-status-card__head">
        <div className="bs-status-card__title">Account Status</div>
        <div className={`bs-badge ${meta.badgeCls}`}>{meta.text}</div>
      </div>

      <div className="bs-status-grid">
        <div>
          <div className="bs-field-label">Status</div>
          <div className="bs-field-value" style={{ color: meta.statusColor }}>{meta.statusText}</div>
          <div className="bs-field-sub">{meta.message}</div>
        </div>
        <div>
          <div className="bs-field-label">Next Charge</div>
          <div className="bs-field-value">{data.nextBillingDate}</div>
          <div className="bs-field-sub">${planTotal('professional', data.activeProperties)}.00 • 9 days</div>
        </div>
        <div>
          <div className="bs-field-label">Payment Method</div>
          <div className="bs-field-value">Visa ••4242</div>
          <div className="bs-field-sub">Expires 12/2027</div>
        </div>
      </div>

      <div className="bs-status-grid bs-status-grid--row2">
        <div>
          <div className="bs-field-label">Auto-Renew</div>
          <div className="bs-field-value" style={{ color: 'var(--success)' }}>✓ Enabled</div>
        </div>
        <div>
          <div className="bs-field-label">Grace Period</div>
          <div className="bs-field-value" style={{ color: meta.gracePeriod === 'None' ? 'var(--text-2)' : meta.statusColor }}>
            {meta.gracePeriod}
          </div>
        </div>
        <div>
          <div className="bs-field-label">Properties</div>
          <div className="bs-field-value">{data.activeProperties} active</div>
        </div>
      </div>
    </div>
  );
}

import { planTotal } from '../../data/billing';