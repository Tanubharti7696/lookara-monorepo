// apps/owner-portal/src/pages/Financials/components/StatementsTable.tsx
import { useState } from 'react';
import { useToast } from '../../../context/ToastContext';

interface StatementsTableProps {
  onOpen: (key: string) => void;
}

type StmtView = 'monthly' | 'yearly';

interface StmtRow {
  key: string;
  period: string;
  sub: string;
  net: string;
  revenue: string;
  status: 'final' | 'processing';
}

const MONTHLY_ROWS: StmtRow[] = [
  { key: 'apr26', period: 'April 2026',    sub: 'In progress · closes Apr 30', net: '~$2,120', revenue: '~$5,840', status: 'processing' },
  { key: 'mar26', period: 'March 2026',    sub: 'All Properties · Final',      net: '$2,870',  revenue: '$5,210',  status: 'final' },
  { key: 'feb26', period: 'February 2026', sub: 'All Properties · Final',      net: '$2,540',  revenue: '$4,780',  status: 'final' },
  { key: 'jan26', period: 'January 2026',  sub: 'All Properties · Final',      net: '$1,980',  revenue: '$3,920',  status: 'final' },
];

const YEARLY_ROWS: StmtRow[] = [
  { key: '2026', period: '2026 YTD',     sub: 'Jan – Apr · In progress',      net: '~$9,510',  revenue: '~$19,750', status: 'processing' },
  { key: '2025', period: '2025 Annual',  sub: 'All Properties · Final',       net: '$28,640',  revenue: '$52,300',  status: 'final' },
];

export default function StatementsTable({ onOpen }: StatementsTableProps) {
  const { showToast } = useToast();
  const [view, setView] = useState<StmtView>('monthly');
  const rows = view === 'monthly' ? MONTHLY_ROWS : YEARLY_ROWS;

  return (
    <section>
      <div className="section-label">Statements</div>
      <div className="panel">
        <div className="panel-hdr">
          <div className="panel-title">Financial Reports</div>
          <div className="stmt-tabs">
            <button
              type="button"
              className={`stmt-tab${view === 'monthly' ? ' active' : ''}`}
              onClick={() => setView('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`stmt-tab${view === 'yearly' ? ' active' : ''}`}
              onClick={() => setView('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="panel-body stmt-panel-body">
          <div className="stmt-hdr">
            <div className="stmt-hdr-cell">Period</div>
            <div className="stmt-hdr-cell">Net Payout</div>
            <div className="stmt-hdr-cell">Revenue</div>
            <div className="stmt-hdr-cell">Status</div>
            <div className="stmt-hdr-cell stmt-hdr-cell--right">Actions</div>
          </div>

          {rows.map((row) => {
            const isFinal = row.status === 'final';
            return (
              <div
                key={row.key}
                className="stmt-row"
                onClick={() => onOpen(row.key)}
              >
                <div>
                  <div className="stmt-period">{row.period}</div>
                  <div className="stmt-period-sub">{row.sub}</div>
                </div>
                <div
                  className="stmt-amount"
                  style={!isFinal ? { color: 'var(--text-muted)' } : undefined}
                >
                  {row.net}
                </div>
                <div style={{ fontSize: 12, color: isFinal ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {row.revenue}
                </div>
                <div>
                  <span className={`stmt-status ${isFinal ? 'ss-final' : 'ss-processing'}`}>
                    {isFinal ? 'Final' : 'In Progress'}
                  </span>
                </div>
                <div className="stmt-actions" onClick={(e) => e.stopPropagation()}>
                  {isFinal ? (
                    <>
                      <button type="button" className="stmt-btn" onClick={() => onOpen(row.key)}>
                        View
                      </button>
                      <button
                        type="button"
                        className="stmt-btn primary"
                        onClick={() => showToast(`Downloading ${row.period} PDF…`, 'success')}
                      >
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 1v9M5 7l3 3 3-3M2 12v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
                        </svg>
                        PDF
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="stmt-btn"
                      onClick={() => showToast(`${row.period} not yet final`, 'info')}
                    >
                      Preview
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
