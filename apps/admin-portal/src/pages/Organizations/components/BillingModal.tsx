// src/pages/Organizations/components/BillingModal.tsx
import { useState, useMemo, useEffect } from 'react';

export type BillingAction =
  | 'free-month' | 'custom-rate' | 'credit' | 'restore'
  | 'upgrade' | 'downgrade' | 'pause' | 'resume';

type FieldDef = {
  id: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: string[];
};

type BillingConfig = {
  title: string;
  sub: string;
  fields: FieldDef[];
  confirmLabel?: string;
  preview: (fields: Record<string, string>) => string;
  logDesc: (fields: Record<string, string>) => string;
};

export const BILLING_CONFIGS: Record<BillingAction, BillingConfig> = {
  'free-month': {
    title: 'Grant Free Month(s)',
    sub: 'Complimentary billing period — effective on next renewal.',
    fields: [
      { id: 'bMonths', label: 'Number of free months', type: 'select', options: ['1 month','2 months','3 months','6 months','12 months'] },
      { id: 'bEffective', label: 'Effective date', type: 'text', placeholder: 'e.g. Aug 1, 2026' },
      { id: 'bReason', label: 'Reason (audit record)', type: 'text', placeholder: 'e.g. Early adopter program' },
    ],
    preview: (f) => `${f.bMonths} complimentary. Effective ${f.bEffective || '—'}. Reason: ${f.bReason || '—'}.`,
    logDesc: (f) => `🎁 ${f.bMonths} complimentary granted`,
  },
  'custom-rate': {
    title: 'Apply Custom Monthly Rate',
    sub: 'Override the standard plan rate. Requires internal approval.',
    fields: [
      { id: 'bRateType', label: 'Rate type', type: 'select', options: ['Fixed monthly rate','Percentage discount','Lifetime custom pricing'] },
      { id: 'bRateValue', label: 'Value ($ amount or % off)', type: 'text', placeholder: 'e.g. $149/mo or 25%' },
      { id: 'bDuration', label: 'Duration', type: 'select', options: ['Ongoing','1 month','3 months','6 months','12 months','Until cancelled'] },
      { id: 'bReason', label: 'Reason (audit record)', type: 'text', placeholder: 'e.g. Partnership agreement' },
    ],
    preview: (f) => `Custom rate: ${f.bRateValue || '—'} (${f.bRateType || '—'}) for ${f.bDuration || '—'}.`,
    logDesc: (f) => `💲 Custom rate: ${f.bRateValue} · ${f.bDuration}`,
  },
  credit: {
    title: 'Apply Account Credit',
    sub: 'One-time credit applied to next billing cycle.',
    fields: [
      { id: 'bCreditAmt', label: 'Credit amount (USD)', type: 'text', placeholder: 'e.g. $500' },
      { id: 'bReason', label: 'Reason (audit record)', type: 'text', placeholder: 'e.g. Service disruption compensation' },
    ],
    preview: (f) => `Account credit: ${f.bCreditAmt || '—'}. Reason: ${f.bReason || '—'}.`,
    logDesc: (f) => `🏷 Credit applied: ${f.bCreditAmt}`,
  },
  restore: {
    title: 'Restore Default Pricing',
    sub: 'Remove all custom rates, credits and promotions. Return to standard plan pricing.',
    fields: [
      { id: 'bConfirm', label: 'Confirm', type: 'select', options: ['Yes — restore standard pricing'] },
    ],
    preview: () => 'All custom pricing removed. Standard plan rates restored.',
    logDesc: () => '↩ Restored default pricing',
  },
  upgrade: {
    title: 'Upgrade Plan',
    sub: 'Move organization to a higher tier.',
    fields: [
      { id: 'bPlan', label: 'New plan', type: 'select', options: ['Growth — $149/mo','Professional — $299/mo','Enterprise — Custom'] },
      { id: 'bEffective', label: 'Effective date', type: 'text', placeholder: 'e.g. immediately or Sep 1, 2026' },
      { id: 'bReason', label: 'Reason (audit record)', type: 'text', placeholder: 'e.g. Sales negotiation' },
    ],
    preview: (f) => `Plan upgraded to ${f.bPlan || '—'}. Effective: ${f.bEffective || '—'}.`,
    logDesc: (f) => `📈 Upgraded to ${f.bPlan}`,
  },
  downgrade: {
    title: 'Downgrade Plan',
    sub: 'Move organization to a lower tier.',
    fields: [
      { id: 'bPlan', label: 'New plan', type: 'select', options: ['Starter — $0/mo (Trial)','Growth — $149/mo','Professional — $299/mo'] },
      { id: 'bEffective', label: 'Effective date', type: 'text', placeholder: 'e.g. next renewal' },
      { id: 'bReason', label: 'Reason (audit record)', type: 'text', placeholder: 'e.g. Customer request' },
    ],
    preview: (f) => `Plan downgraded to ${f.bPlan || '—'}. Effective: ${f.bEffective || '—'}.`,
    logDesc: (f) => `📉 Downgraded to ${f.bPlan}`,
  },
  pause: {
    title: 'Pause Billing',
    sub: 'Temporarily suspend billing. Access may be limited based on plan.',
    fields: [
      { id: 'bDuration', label: 'Pause duration', type: 'select', options: ['1 month','2 months','3 months','Indefinite (manual resume)'] },
      { id: 'bReason', label: 'Reason (audit record)', type: 'text', placeholder: 'e.g. Organization requested pause' },
    ],
    preview: (f) => `Billing paused for ${f.bDuration || '—'}. Reason: ${f.bReason || '—'}.`,
    logDesc: (f) => `⏸ Billing paused: ${f.bDuration}`,
  },
  resume: {
    title: 'Resume Billing',
    sub: 'Reactivate billing for a paused account. Billing resumes on the next cycle.',
    fields: [
      { id: 'bEffective', label: 'Effective date', type: 'text', placeholder: 'e.g. immediately or Sep 1, 2026' },
      { id: 'bReason', label: 'Reason (audit record)', type: 'text', placeholder: 'e.g. Organization requested resumption' },
    ],
    preview: (f) => `Billing resumed. Effective: ${f.bEffective || '—'}. Reason: ${f.bReason || '—'}.`,
    logDesc: (f) => `▶ Billing resumed. Effective: ${f.bEffective}`,
  },
};

export type BillingConfirmPayload = {
  orgId: string;
  action: BillingAction;
  fields: Record<string, string>;
  logEntry: {
    desc: string;
    reason: string;
    date: string;
    ref: string;
  };
};

type Props = {
  orgId: string;
  action: BillingAction;
  onClose: () => void;
  onConfirm: (payload: BillingConfirmPayload) => void;
};

export default function BillingModal({ orgId, action, onClose, onConfirm }: Props) {
  const cfg = BILLING_CONFIGS[action];
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    cfg.fields.forEach((f) => {
      init[f.id] = f.type === 'select' ? (f.options?.[0] ?? '') : '';
    });
    return init;
  });

  useEffect(() => {
    const init: Record<string, string> = {};
    cfg.fields.forEach((f) => { init[f.id] = f.type === 'select' ? (f.options?.[0] ?? '') : ''; });
    setFields(init);
  }, [action]);

  const preview = useMemo(() => {
    try { return cfg.preview(fields); } catch { return '—'; }
  }, [cfg, fields]);

  const confirm = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const ref = 'BA-' + now.getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000);
    onConfirm({
      orgId,
      action,
      fields,
      logEntry: {
        desc: cfg.logDesc(fields),
        reason: fields.bReason || '—',
        date: `${dateStr} · ${timeStr}`,
        ref,
      },
    });
  };

  return (
    <div className="og-modal-overlay" onClick={onClose}>
      <div className="og-modal" onClick={(e) => e.stopPropagation()}>
        <div className="og-modal__title">{cfg.title}</div>
        <div className="og-modal__sub">{cfg.sub}</div>

        {cfg.fields.map((f) => (
          <div key={f.id} className="og-modal__field">
            <label>{f.label}</label>
            {f.type === 'select' ? (
              <select
                className="og-modal__input"
                value={fields[f.id]}
                onChange={(e) => setFields((s) => ({ ...s, [f.id]: e.target.value }))}
              >
                {f.options?.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                className="og-modal__input"
                type="text"
                placeholder={f.placeholder ?? ''}
                value={fields[f.id]}
                onChange={(e) => setFields((s) => ({ ...s, [f.id]: e.target.value }))}
              />
            )}
          </div>
        ))}

        <div className="og-modal__note">
          This action will be recorded as: <strong>{preview}</strong> — attributed to the current admin.
          The PM will see only the effective change, not the admin's name.
        </div>

        <div className="og-modal__foot">
          <button className="og-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="og-btn-confirm" onClick={confirm}>Apply</button>
        </div>
      </div>
    </div>
  );
}