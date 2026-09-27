// apps/owner-portal/src/pages/Financials/components/TransactionLedger.tsx
import { useMemo } from 'react';
import { useToast } from '../../../context/ToastContext';
import type { TransactionItem } from '../../../context/OwnerContext';

export type TxFilter = 'all' | 'revenue' | 'expenses' | 'payouts';

interface TransactionLedgerProps {
  transactions: TransactionItem[];
  filter: TxFilter;
  onFilterChange: (filter: TxFilter) => void;
}

const FILTER_LABELS: Record<TxFilter, string> = {
  all: 'All',
  revenue: 'Revenue',
  expenses: 'Expenses',
  payouts: 'Payouts',
};

const TYPE_CLASS: Record<string, string> = {
  Booking: 'tt-booking',
  Cleaning: 'tt-cleaning',
  Repair: 'tt-repair',
  Maintenance: 'tt-repair',
  Payout: 'tt-payout',
  'PM Fee': 'tt-mgmt',
};

const GROUP_ORDER: TransactionItem['group'][] = ['Today', 'This week', 'Earlier'];

export default function TransactionLedger({
  transactions,
  filter,
  onFilterChange,
}: TransactionLedgerProps) {
  const { showToast } = useToast();

  const grouped = useMemo(() => {
    const visible = filter === 'all' ? transactions : transactions.filter((t) => t.category === filter);
    return GROUP_ORDER
      .map((group) => ({
        group,
        items: visible.filter((t) => t.group === group),
      }))
      .filter((g) => g.items.length > 0);
  }, [transactions, filter]);

  return (
    <section className="tx-section">
      <div className="section-label">Transactions</div>
      <div className="panel">
        <div className="panel-body">
          <div className="tx-controls">
            <div className="tx-filters">
              {(Object.keys(FILTER_LABELS) as TxFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`tx-filter${filter === f ? ' active' : ''}`}
                  onClick={() => onFilterChange(f)}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => showToast('Exporting transactions…', 'info')}
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 1v9M5 7l3 3 3-3M2 12v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
              </svg>
              Export
            </button>
          </div>

          <div className="tx-hdr-row">
            <div className="tx-hdr-cell">Date</div>
            <div className="tx-hdr-cell">Property</div>
            <div className="tx-hdr-cell">Type</div>
            <div className="tx-hdr-cell tx-hdr-cell--right">Amount</div>
            <div className="tx-hdr-cell tx-hdr-cell--right">Status</div>
          </div>

          <div className="tx-table">
            {grouped.map(({ group, items }) => (
              <div key={group}>
                <div className="tx-group-label">{group}</div>
                {items.map((t) => {
                  const positive = t.amount > 0;
                  const prefix = positive ? '+' : '';
                  const amountLabel = `${prefix}$${Math.abs(t.amount).toLocaleString()}`;
                  const handleClick = () =>
                    t.status === 'settled'
                      ? showToast(`${t.type} · ${t.propertyName} · ${amountLabel}`, 'info')
                      : showToast('Navigating to Approvals…', 'info');

                  return (
                    <button
                      key={t.id}
                      type="button"
                      className="tx-row"
                      onClick={handleClick}
                    >
                      <div className="tx-date">{t.date}</div>
                      <div className="tx-prop">{t.propertyName}</div>
                      <div className="tx-type">
                        <span className="tx-type-icon">{t.icon}</span>
                        <span className={TYPE_CLASS[t.type] ?? 'tt-mgmt'}>{t.type}</span>
                      </div>
                      <div className={`tx-amount ${positive ? 'ta-pos' : 'ta-neg'}`}>
                        {amountLabel}
                      </div>
                      <div className="tx-status">
                        {t.status === 'settled' ? (
                          <span className="tx-badge tb-settled">Settled</span>
                        ) : (
                          <span
                            className="tx-badge tb-pending"
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast('Navigating to Approvals…', 'info');
                            }}
                          >
                            Awaiting PM approval
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
