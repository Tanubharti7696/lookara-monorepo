// src/views/DashboardView.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CriticalBanner from './dashboard/CriticalBanner';
import HealthScoreBar from './dashboard/HealthScoreBar';
import OperationalSnapshot from './dashboard/OperationalSnapshot';
import TrendCharts from './dashboard/TrendCharts';
import OperationalBriefing from './dashboard/OperationalBriefing';
import HealthDetails from './dashboard/HealthDetails';
import FinancialPreview from './dashboard/FinancialPreview';
import { apiFetch } from '../utils/api';
import './DashboardView.css';

export default function DashboardView() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ddOpen, setDdOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    apiFetch('/api/v1/dashboard/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Handle Esc key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDdOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Matches would be for portfolio switcher if we keep it
  const matches = [];

  const onNavigate = (target) => {
    // Simple routing map — extend as views get built
    const map = {
      emergency: '/tasks', // or /emergency once built
      tasks: '/tasks',
      compliance: '/compliance',
      vendors: '/vendors',
      calendar: '/calendar',
      reports: '/reports',
      audit: '/audit',
    };
    const route = map[target] || '/dashboard';
    navigate(route);
  };

  return (
    <div className="dashboard-view">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-header__left">
          <h1 className="dashboard-header__title">Dashboard</h1>

          <div className="portfolio-picker" ref={wrapRef}>
            <button
              className={`portfolio-picker__input ${ddOpen ? 'open' : ''}`}
              onClick={() => setDdOpen(v => !v)}
              aria-haspopup="listbox"
              aria-expanded={ddOpen}
            >
              <span className="portfolio-picker__text">
                Live PM Portfolio
              </span>
              <span className={`portfolio-picker__chev ${ddOpen ? 'open' : ''}`}>▼</span>
            </button>

            {ddOpen && (
              <div className="portfolio-picker__dropdown" role="listbox">
                <input
                  className="portfolio-picker__search"
                  placeholder="Search portfolios…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                {matches.length === 0 ? (
                  <div className="portfolio-picker__empty">No portfolios found</div>
                ) : (
                  matches.map(p => (
                    <button
                      key={p.id}
                      className={`portfolio-picker__option ${portfolio.id === p.id ? 'active' : ''}`}
                      onClick={() => {
                        setPortfolio(p);
                        setSearch('');
                        setDdOpen(false);
                      }}
                    >
                      <div className="portfolio-picker__option-name">{p.name}</div>
                      <div className="portfolio-picker__option-meta">
                        {p.props} properties · {p.cities}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-header__right">
          <span className="dashboard-header__updated">Last updated 2m ago</span>
          <button
            className="btn-incident"
            onClick={() => onNavigate('emergency')}
          >
            🚨 Report Incident
          </button>
        </div>
      </div>

      {/* Page Body */}
      <div className="dashboard-body">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
             <div className="spinner" style={{ margin: '0 auto 1rem', width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
             Loading live metrics...
          </div>
        ) : (
          <>
            <CriticalBanner onNavigate={onNavigate} metrics={metrics} />
            <HealthScoreBar metrics={metrics} />
            <OperationalSnapshot onNavigate={onNavigate} metrics={metrics} />
            <TrendCharts />
            <OperationalBriefing onNavigate={onNavigate} metrics={metrics} />
            <HealthDetails />
            <FinancialPreview onNavigate={onNavigate} />
          </>
        )}
      </div>
    </div>
  );
}