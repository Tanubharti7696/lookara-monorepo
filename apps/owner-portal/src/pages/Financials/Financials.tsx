// apps/owner-portal/src/pages/Financials/Financials.tsx
import { useMemo, useState } from 'react';
import { useOwner } from '../../context/OwnerContext';
import { useToast } from '../../context/ToastContext';
import StatementModal from '../../components/StatementModal/StatementModal';
import SummaryCards from './components/SummaryCards';
import StatementsTable from './components/StatementsTable';
import TransactionLedger, { type TxFilter } from './components/TransactionLedger';
import './Financials.css';

export default function Financials() {
  const {
    financial,
    transactions,
    payoutsUpcoming,
    payoutsCompleted,
    pmFinancial,
  } = useOwner();
  const { showToast } = useToast();

  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [statementKey, setStatementKey] = useState<string | null>(null);

  /* Driver cards — computed from static values for now */
  const drivers = useMemo(() => [
    {
      tone: 'success' as const,
      label: '↑ Revenue',
      title: 'Lake Nona up 18%',
      text: '7/7 days occupied — strongest week this month.',
    },
    {
      tone: 'warning' as const,
      label: '↑ Costs',
      title: 'Cleaning up 12%',
      text: '3 extra cleans at Seaside + $120 maintenance.',
    },
    {
      tone: 'success' as const,
      label: '→ Payout',
      title: 'Stable — no delays',
      text: 'Apr 15 payout processing on time. Next cycle Apr 30 scheduled across all properties.',
    },
  ], []);

  /* Breakdown values */
  const breakdown = useMemo(() => ({
    revenue: 5840,
    expenses: 2720,
    net: 3120,
    revenueByProp: [
      { name: 'Seaside Villa', value: 1580 },
      { name: 'Lake Nona Villa', value: 1240 },
      { name: 'Palm Grove Retreat', value: 300 },
    ],
    expenseRows: [
      { label: 'Cleaning', value: 1300, pct: 48, tone: 'info', strong: true },
      { label: 'Maintenance', value: 790, pct: 29, tone: 'warning', strong: false },
      { label: 'PM Fees', value: 630, pct: 23, tone: 'muted', strong: false },
    ],
  }), []);

  const scrollToTx = (filter: TxFilter) => {
    setTxFilter(filter);
    document.querySelector('.tx-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-body">
      {/* Confidence line */}
      <div className="confidence-line">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M2 9l4 4 8-8" />
        </svg>
        All payouts on track — no issues detected this month
      </div>

      <SummaryCards
        financial={financial}
        onCardClick={scrollToTx}
      />

      {/* Drivers */}
      <section className="panel drivers-panel">
        <div className="panel-hdr">
          <div className="panel-title">What Moved This Month</div>
          <button type="button" className="panel-link" onClick={() => scrollToTx('all')}>
            See all transactions →
          </button>
        </div>
        <div className="panel-body drivers-grid">
          {drivers.map((d) => (
            <div key={d.label} className={`driver-card driver-card--${d.tone}`}>
              <div className="driver-label">{d.label}</div>
              <div className="driver-title">{d.title}</div>
              <div className="driver-text">{d.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Breakdown */}
      <section>
        <div className="section-label">Breakdown</div>
        <div className="breakdown-grid">
          {/* Revenue */}
          <div className="bk-card">
            <div className="bk-hdr">
              <div className="bk-title">Revenue</div>
              <div className="bk-val green">${breakdown.revenue.toLocaleString()}</div>
              <div className="bk-delta">▲ +18% vs March</div>
            </div>
            <div className="bk-rows">
              <button type="button" className="bk-row" onClick={() => scrollToTx('revenue')}>
                <span className="bk-row-left">
                  <span className="dot dot-gold" />
                  Bookings
                </span>
                <span className="bk-bar-wrap">
                  <span className="bk-bar" style={{ width: '100%', background: 'var(--gold)', opacity: 0.5 }} />
                </span>
                <span className="bk-row-val">
                  ${breakdown.revenue.toLocaleString()}{' '}
                  <span className="bk-row-pct">100%</span>
                </span>
              </button>
            </div>
            <div className="bk-footnote">
              <span className="bk-footnote-strong" style={{ color: 'var(--info)' }}>Lake Nona drives 42%</span> of total revenue
            </div>
          </div>

          {/* Expenses */}
          <div className="bk-card">
            <div className="bk-hdr">
              <div className="bk-title">Operating Costs</div>
              <div className="bk-val red">−${breakdown.expenses.toLocaleString()}</div>
              <div className="bk-delta">▲ +4% vs March</div>
            </div>
            <div className="bk-rows">
              {breakdown.expenseRows.map((row) => (
                <button
                  key={row.label}
                  type="button"
                  className="bk-row"
                  onClick={() => scrollToTx('expenses')}
                  style={row.strong ? { background: 'rgba(59,130,246,0.04)' } : undefined}
                >
                  <span
                    className="bk-row-left"
                    style={
                      row.strong
                        ? { fontWeight: 600, color: 'var(--text-primary)' }
                        : { color: 'var(--text-muted)' }
                    }
                  >
                    <span
                      className="dot"
                      style={{
                        background:
                          row.tone === 'info' ? 'var(--info)' :
                          row.tone === 'warning' ? 'var(--warning)' :
                          'var(--text-muted)',
                        opacity: row.strong ? 1 : 0.5,
                      }}
                    />
                    {row.label}
                  </span>
                  <span className="bk-bar-wrap">
                    <span
                      className="bk-bar"
                      style={{
                        width: `${row.pct}%`,
                        background:
                          row.tone === 'info' ? 'var(--info)' :
                          row.tone === 'warning' ? 'var(--warning)' :
                          'var(--text-muted)',
                        opacity: row.strong ? 0.6 : 0.3,
                      }}
                    />
                  </span>
                  <span
                    className="bk-row-val"
                    style={row.strong ? undefined : { color: 'var(--text-muted)' }}
                  >
                    ${row.value.toLocaleString()}{' '}
                    <span
                      className="bk-row-pct"
                      style={row.strong ? { color: 'var(--info)' } : undefined}
                    >
                      {row.pct}%{row.strong ? ' ↑' : ''}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="bk-footnote">
              <span className="bk-footnote-strong" style={{ color: 'var(--info)' }}>Cleaning is your highest cost</span> at 48%
            </div>
          </div>

          {/* Net Payout */}
          <div className="bk-card">
            <div className="bk-hdr">
              <div className="bk-title">Net Payout</div>
              <div className="bk-val gold">${breakdown.net.toLocaleString()}</div>
              <div className="bk-delta">▲ +12% vs March</div>
            </div>
            <div className="bk-rows">
              {breakdown.revenueByProp.map((p, i) => {
                const pct = Math.round((p.value / breakdown.net) * 100);
                const opacities = [0.6, 0.45, 0.3];
                return (
                  <button
                    key={p.name}
                    type="button"
                    className="bk-row"
                    onClick={() => scrollToTx('payouts')}
                  >
                    <span className="bk-row-left">
                      <span className="dot dot-gold" />
                      {p.name}
                    </span>
                    <span className="bk-bar-wrap">
                      <span
                        className="bk-bar"
                        style={{
                          width: `${pct}%`,
                          background: 'var(--gold)',
                          opacity: opacities[i] ?? 0.3,
                        }}
                      />
                    </span>
                    <span className="bk-row-val">
                      ${p.value.toLocaleString()}{' '}
                      <span className="bk-row-pct">{pct}%</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="bk-footnote">
              <span className="bk-footnote-strong" style={{ color: 'var(--gold)' }}>Seaside drives 51%</span> of your income · primary source this month
            </div>
          </div>
        </div>
      </section>

      {/* Payouts */}
      <section>
        <div className="section-label">Payouts</div>
        <div className="payouts-grid">
          <div className="panel">
            <div className="panel-hdr">
              <div className="panel-title">Upcoming</div>
              <button type="button" className="panel-link" onClick={() => scrollToTx('payouts')}>
                View all →
              </button>
            </div>
            <div className="panel-body payouts-body">
              <div className="payout-reassure">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 9l4 4 8-8" />
                </svg>
                Next cycle fully scheduled — no gaps
              </div>
              {payoutsUpcoming.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`payout-item payout-item--${p.status}`}
                  onClick={() => showToast(`Payout detail: ${p.status}`, 'info')}
                >
                  <div className="pi-left">
                    <div className="pi-date">{p.date}</div>
                    <div className="pi-prop">{p.propertyName}</div>
                  </div>
                  <div className="pi-right">
                    <div className="pi-amount">${p.amount.toLocaleString()}</div>
                    <div className={`pi-status ps-${p.status}`}>
                      {p.status === 'processing' ? 'In Progress' :
                       p.status === 'paid' ? 'Paid' :
                       p.status === 'delayed' ? 'Delayed' : 'Upcoming'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-hdr">
              <div className="panel-title">Completed</div>
              <button type="button" className="panel-link" onClick={() => scrollToTx('payouts')}>
                View all →
              </button>
            </div>
            <div className="panel-body payouts-body">
              {payoutsCompleted.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`payout-item payout-item--${p.status}`}
                  onClick={() =>
                    showToast(
                      p.delayNote ? `This payout was ${p.delayNote.toLowerCase()} — PM notified` : `Payout settled · $${p.amount}`,
                      p.delayNote ? 'info' : 'success',
                    )
                  }
                >
                  <div className="pi-left">
                    <div className="pi-date">{p.date}</div>
                    <div className="pi-prop">{p.propertyName}</div>
                  </div>
                  <div className="pi-right">
                    <div className="pi-amount">${p.amount.toLocaleString()}</div>
                    {p.delayNote ? (
                      <div className="pi-status pi-status--delayed">
                        <span className="pi-delay-dot" />
                        {p.delayNote}
                      </div>
                    ) : (
                      <div className="pi-status ps-paid">Paid</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PM Financial Performance */}
      <section className="pm-section">
        <div className="section-label">PM Financial Performance · Jordan Clarke</div>
        <div className="pm-fin-grid">
          <div className="panel">
            <div className="pm-fin-group-label">Speed</div>
            <div className="pm-fin-two-col">
              <button
                type="button"
                className="pm-fin-card pm-fin-card--left"
                onClick={() => showToast('Jordan Clarke · avg payout 2.1 days', 'info')}
              >
                <div className="pm-fin-icon">⚡</div>
                <div className="pm-fin-val">{pmFinancial.avgPayoutTime}</div>
                <div className="pm-fin-lbl">Avg Payout Time</div>
                <div className="pm-fin-sub">Faster than 82% of PMs</div>
              </button>
              <button
                type="button"
                className="pm-fin-card"
                onClick={() => showToast('92 of 100 payouts delivered on time', 'info')}
              >
                <div className="pm-fin-icon">✓</div>
                <div className="pm-fin-val">{pmFinancial.onTimeRate}</div>
                <div className="pm-fin-lbl">On-Time Rate</div>
                <div className="pm-fin-sub">Top 15% on platform</div>
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="pm-fin-group-label">Volume</div>
            <button
              type="button"
              className="pm-fin-card"
              onClick={() => showToast(`${pmFinancial.totalManaged} total managed this year`, 'info')}
            >
              <div className="pm-fin-icon">$</div>
              <div className="pm-fin-val">{pmFinancial.totalManaged}</div>
              <div className="pm-fin-lbl">Total Managed</div>
              <div className="pm-fin-sub">YTD across all properties</div>
            </button>
          </div>

          <div className="panel">
            <div className="pm-fin-group-label">Risk</div>
            <button
              type="button"
              className="pm-fin-card"
              onClick={() => showToast('0 financial disputes raised', 'success')}
            >
              <div className="pm-fin-icon">🛡</div>
              <div className="pm-fin-val" style={{ color: 'var(--success)' }}>
                {pmFinancial.disputes}
              </div>
              <div className="pm-fin-lbl">Disputes</div>
              <div className="pm-fin-sub">No disputes raised</div>
            </button>
          </div>
        </div>
      </section>

      {/* Transactions */}
      <TransactionLedger
        transactions={transactions}
        filter={txFilter}
        onFilterChange={setTxFilter}
      />

      {/* Statements */}
      <StatementsTable onOpen={setStatementKey} />

      <StatementModal
        statementKey={statementKey}
        onClose={() => setStatementKey(null)}
      />
    </div>
  );
}
