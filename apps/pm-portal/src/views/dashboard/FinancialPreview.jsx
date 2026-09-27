// src/views/dashboard/FinancialPreview.jsx
import { useState } from 'react';
import { dashboardData } from '../../data/dashboardData';

export default function FinancialPreview({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const f = dashboardData.financial;

  return (
    <section className="financial">
      <button className="financial__toggle" onClick={() => setOpen(v => !v)}>
        <div className="financial__left">
          <span>💰</span>
          <span className="financial__title">Financial Preview</span>
          <span className="financial__sub">MTD · All Portfolios</span>
        </div>
        <span className={`financial__chev ${open ? 'open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="financial__body">
          <div className="financial__metric">
            <div className="financial__label">MTD Revenue</div>
            <div className="financial__value">{f.mtd}</div>
            <div className="financial__delta">{f.delta}</div>
          </div>
          <div className="financial__divider" />
          <div className="financial__metric">
            <div className="financial__label">Projected Month-End</div>
            <div className="financial__value">{f.projected}</div>
          </div>
          <button
            className="btn-fin-report"
            onClick={() => onNavigate?.('reports')}
          >
            Open Financial Report →
          </button>
        </div>
      )}
    </section>
  );
}