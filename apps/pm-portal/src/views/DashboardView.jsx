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
import { PORTFOLIOS } from '../data/dashboardData';
import './DashboardView.css';

export default function DashboardView() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(PORTFOLIOS[1]); // NYC default
  const [ddOpen, setDdOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);

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

  const matches = search
    ? PORTFOLIOS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.cities.toLowerCase().includes(search.toLowerCase()))
    : PORTFOLIOS;

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
                {portfolio.name} · {portfolio.props} properties
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
        <CriticalBanner onNavigate={onNavigate} />
        <HealthScoreBar />
        <OperationalSnapshot onNavigate={onNavigate} />
        <TrendCharts />
        <OperationalBriefing onNavigate={onNavigate} />
        <HealthDetails />
        <FinancialPreview onNavigate={onNavigate} />
      </div>
    </div>
  );
}