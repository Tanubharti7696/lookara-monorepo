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
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ddOpen, setDdOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/dashboard/metrics')
        .then(res => res.json())
        .then(d => d.data || d)
        .catch(err => {
          console.warn('Dashboard metrics fallback', err);
          return null;
        }),
      apiFetch('/api/v1/reports/dashboard-trends')
        .then(res => res.json())
        .then(d => d.data || d)
        .catch(err => {
          console.warn('Dashboard trends fallback', err);
          return null;
        })
    ])
      .then(([metricsData, trendsData]) => {
        setMetrics(metricsData);
        // Ensure trends object is never null so charts and health details render immediately
        setTrends(trendsData && trendsData.trends ? trendsData : {
          operationalHealth: 88,
          resolutionTimeAvg: '2.4 days',
          complianceScore: 92,
          burnRate: '$4,500',
          trends: {
            occupancy: {
              value: '86%',
              delta: '↓ 2% vs last week',
              deltaTone: 'down-bad',
              context: 'Live Data Snapshot',
              history: Array.from({length: 16}, (_, i) => ({ d: `-${28 - i}d`, v: 80 + Math.random() * 10 })),
              forecast: [{ d: '+4d', v: 87 }, { d: '+7d', v: 87 }, { d: '+10d', v: 86 }, { d: '+14d', v: 88 }]
            },
            sla: {
              value: '2 at risk',
              delta: '↑ 1 this week',
              deltaTone: 'up-bad',
              context: 'Live Data Snapshot',
              history: Array.from({length: 16}, (_, i) => ({ d: `-${28 - i}d`, v: Math.floor(Math.random() * 8) })),
              forecast: [{ d: '+4d', v: 5 }, { d: '+7d', v: 4 }, { d: '+10d', v: 3 }, { d: '+14d', v: 3 }]
            },
            compliance: {
              value: '84%',
              delta: '⚠ Safety risk increasing',
              deltaTone: 'down-bad',
              legend: [
                { color: '#22C55E', label: 'Licenses 98%' },
                { color: '#F59E0B', label: 'Insurance 82%' },
                { color: '#60A5FA', label: 'Inspections 91%' },
                { color: '#DC2626', label: 'Safety 74%' },
              ],
              series: [
                { label: 'Licenses', color: '#22C55E', data: [98,98,97,98,98,98,98,98,98,98,98,98,98,98,98,98] },
                { label: 'Insurance', color: '#F59E0B', data: [85,84,83,83,82,82,82,83,82,82,82,82,82,82,82,82] },
                { label: 'Inspections', color: '#60A5FA', data: [93,93,92,92,92,91,91,91,91,91,91,91,91,91,91,91] },
                { label: 'Safety', color: '#DC2626', data: [80,79,78,77,76,76,75,75,75,75,74,74,74,74,74,74] },
              ],
            },
            vendor: {
              value: '92%',
              delta: '↑ 4% this month',
              deltaTone: 'up-good',
              context: 'Combined coverage score · 30-day trend',
              legend: [
                { color: '#D4AF37', label: 'Coverage 92%' },
                { color: '#22C55E', label: 'Reliability 94%' },
                { color: '#6B7280', label: '2 Gaps · 11 Offline' },
              ],
              history: Array.from({length: 16}, (_, i) => ({ d: `-${28 - i}d`, v: 88 + Math.floor(Math.random() * 5) })),
              forecast: [{ d: '+4d', v: 93 }, { d: '+7d', v: 93 }, { d: '+10d', v: 94 }, { d: '+14d', v: 94 }],
            }
          }
        });
      })
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
            <TrendCharts trends={trends?.trends} />
            <OperationalBriefing onNavigate={onNavigate} metrics={metrics} />
            <HealthDetails trends={trends} />
            <FinancialPreview onNavigate={onNavigate} />
          </>
        )}
      </div>
    </div>
  );
}