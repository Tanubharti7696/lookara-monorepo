// src/views/billing/BillingHistoryCard.jsx
export default function BillingHistoryCard({ onDownloadInvoice, invoices = [] }) {
  return (
    <div className="bs-card">
      <div className="bs-card__topline">
        <div className="bs-card__title">Billing History</div>
        <button className="bs-btn bs-btn--outline bs-btn--sm">View All Invoices</button>
      </div>

      <div className="bs-table-wrap">
        <table className="bs-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th style={{ width: 110 }}>Amount</th>
              <th style={{ textAlign: 'center', width: 80 }}>Status</th>
              <th style={{ textAlign: 'right', width: 140 }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="bs-table__muted">Subscription Charge</td>
                <td className="bs-table__amount">${parseFloat(inv.amount).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className="bs-pill bs-pill--paid">{inv.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="bs-link" onClick={() => onDownloadInvoice(inv)}>
                    📄 Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}