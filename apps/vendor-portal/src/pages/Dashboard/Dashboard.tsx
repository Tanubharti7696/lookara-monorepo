// apps/vendor-portal/src/pages/Dashboard/Dashboard.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { useVendor } from '../../context/VendorContext';
import {
  AssessmentDrawer, QuoteDrawer, EmergencyDrawer,
  FlagDrawer, CommDrawer, RouteJobDrawer,
} from './Drawers';
import './Dashboard.css';

/* ── TYPES ── */
type RouteStatus = 'inprog' | 'next' | 'sched';
interface RouteJob {
  id: string; title: string; property: string; city: string; dist: string;
  time: string; payout: number; status: RouteStatus;
  pm: string; jobType: string; address?: string;
  step?: number; totalSteps?: number;
}
interface EmergencyOffer {
  jobId: string; title: string; property: string; dist: string;
  payout: number; competitors: number; pm: string; issue: string;
  total: number; secondsLeft: number;
}
interface MissedOffer {
  title: string; property: string; payout: string;
  expiredAt: string; type: 'emg' | 'std' | 'assess';
}
interface FlagItem {
  jobId: string; reason: string; date: string; impact: string;
}

/* ── DATA ── */
const TODAY_JOBS: RouteJob[] = [
  {
    id: 'a-001', title: 'Pool Filter Replacement + Chemical Balance',
    property: 'Sunset Villa', city: 'Orlando, FL', dist: '6.3 mi NE',
    time: '08:30 AM', payout: 85, status: 'inprog',
    pm: 'SunState Rentals', jobType: 'Repair',
    address: '1421 Sunset Blvd, Orlando FL 32801',
    step: 3, totalSteps: 5,
  },
  { id: 'a-002', title: 'Filter Cleaning & Algae Treatment', property: 'Park Cove', city: 'Windermere, FL', dist: '14.2 mi', time: '01:00 PM', payout: 110, status: 'next', pm: 'Coastal STR Management', jobType: 'Maintenance' },
  { id: 'i-002', title: 'Pump Inspection & Pressure Test',   property: 'Palm Ridge', city: 'Kissimmee, FL', dist: '8.1 mi',  time: '03:30 PM', payout: 120, status: 'sched', pm: 'Coastal STR Management', jobType: 'Inspection' },
  { id: 'i-003', title: 'Weekly Chemical Balance & Brush',   property: 'Sunset Palms', city: 'Orlando, FL', dist: '11.4 mi', time: '05:00 PM', payout: 85,  status: 'sched', pm: 'SunState Rentals', jobType: 'Maintenance' },
];

const EARNINGS_7D       = [210, 340, 85, 420, 310, 295, 385];
const EARNINGS_FORECAST = [310, 350, 280];

const CIRCUMFERENCE = 2 * Math.PI * 20;

/* ── Helpers ── */
function buildSpark() {
  const allVals = [...EARNINGS_7D, ...EARNINGS_FORECAST];
  const W = 600, H = 52, pad = 8;
  const totalPoints = allVals.length;
  const maxV = Math.max(...allVals) * 1.15;
  const minV = 0;
  const x = (i: number) => pad + (i / (totalPoints - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - minV) / (maxV - minV)) * (H - pad * 2);
  const actualCount = EARNINGS_7D.length;
  const actualPath = EARNINGS_7D
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');
  const areaPath = `${actualPath} L${x(actualCount - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  const forecastPath = [EARNINGS_7D[actualCount - 1], ...EARNINGS_FORECAST]
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(actualCount - 1 + i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');
  return { actualPath, areaPath, forecastPath, x, y, totalPoints, actualCount };
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { showToast } = useVendor();

  /* emergency offer */
  const [emergency, setEmergency] = useState<EmergencyOffer | null>({
    jobId: 'i-001',
    title: 'Water Leak — Emergency Response',
    property: 'Seaside Villa',
    dist: '2.1 mi SW',
    payout: 225,
    competitors: 4,
    pm: 'Coastal STR',
    issue: 'Guest reported active water leak under kitchen sink — water pooling on floor. Needs immediate attention before it spreads to adjacent rooms.',
    total: 102,
    secondsLeft: 52,
  });

  /* missed offers queue */
  const [missed, setMissed] = useState<MissedOffer[]>([]);
  const dismissedRef = useRef<MissedOffer[]>([]);

  /* vendor flags */
  const [flags] = useState<FlagItem[]>([
    { jobId: '4521', reason: 'No-show', date: 'Apr 13', impact: '−0.8 reliability' },
  ]);

  /* drawer state */
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState({ title: '', property: '', dist: '', fee: 0 });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteData, setQuoteData] = useState({ title: '', property: '', dist: '', due: '', comp: '' });
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagData, setFlagData] = useState<FlagItem | null>(null);
  const [commOpen, setCommOpen] = useState(false);
  const [commPM, setCommPM] = useState('');
  const [routeJobOpen, setRouteJobOpen] = useState(false);
  const [routeJobId, setRouteJobId] = useState<string | null>(null);

  /* route collapse */
  const [routeExpanded, setRouteExpanded] = useState(false);

  /* clock */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  /* emergency countdown */
  useEffect(() => {
    if (!emergency) return;
    const id = window.setInterval(() => {
      setEmergency((prev) => {
        if (!prev) return null;
        if (prev.secondsLeft <= 0) {
          setMissed((m) => [
            ...m,
            {
              title: prev.title,
              property: prev.property,
              payout: `$${prev.payout}`,
              expiredAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              type: 'emg',
            },
          ]);
          return null;
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [emergency?.jobId]);

  const handleEmergencyAccept = () => {
    showToast('Emergency job accepted — navigate to Seaside Villa', 'success');
    setEmergency(null);
  };
  const handleEmergencyDecline = () => {
    showToast('Emergency declined — you can reconsider from the card');
  };

  const dismissMissed = (idx: number) => {
    setMissed((m) => {
      const next = [...m];
      dismissedRef.current.push(next[idx]);
      next.splice(idx, 1);
      return next;
    });
    showToast('Dismissed · Logged to audit history');
  };

  const openRouteJob = (id: string) => {
    setRouteJobId(id);
    setRouteJobOpen(true);
  };

  const openComm = (pm: string) => { setCommPM(pm); setCommOpen(true); };

  const navigateToJob = (id: string) => {
    const job = TODAY_JOBS.find((j) => j.id === id);
    if (!job?.address) { showToast('Navigation · address not yet available'); return; }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.address)}`, '_blank');
  };

  const spark = useMemo(() => buildSpark(), []);

  const greeting = (
    <>
      On track for <span style={{ color: 'var(--gold)', fontWeight: 700 }}>$3,100</span> this month
    </>
  );

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="tb-greeting">{greeting}</div>
        <div className="tb-time">
          {((now.getHours() % 12) || 12)}:{now.getMinutes().toString().padStart(2, '0')} {now.getHours() >= 12 ? 'PM' : 'AM'}
        </div>
        <div className="tb-dot" />
        <button className="btn-icon" onClick={() => showToast('Opening Alerts…')} title="Alerts">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1a5 5 0 015 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" /></svg>
          <span className="notif-dot" />
        </button>
      </div>

      <div className="page">
        {/* ── ACTION FEED ── */}
        <div className="sec-label">Needs Your Attention</div>
        <div className="action-feed">
          {emergency && (
            <EmergencyCard
              offer={emergency}
              onAccept={handleEmergencyAccept}
              onView={() => setEmergencyOpen(true)}
              onDecline={handleEmergencyDecline}
            />
          )}

          {missed.map((m, idx) => (
            <div key={idx} className="action-item warn">
              <div className="action-icon" style={{ color: 'var(--crimson)' }}>🚫</div>
              <div className="action-body">
                <div className="action-title" style={{ color: 'var(--crimson)' }}>Expired — {m.title}</div>
                <div className="action-sub">{m.property} · {m.payout} missed · {m.expiredAt}</div>
              </div>
              <div className="action-right" style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 80 }}>
                <button className="action-cta warn" onClick={() => showToast(`Reviewing: ${m.title} · ${m.payout} missed`)}>Review</button>
                <button style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }} onClick={() => dismissMissed(idx)}>Dismiss</button>
              </div>
            </div>
          ))}

          {/* Standard dispatch */}
          <StandardDispatchCard onAccept={() => showToast('Accepting standard job…')} onContact={() => openComm('Coastal STR')} />

          {/* Assessment dispatch */}
          <AssessmentDispatchCard onView={() => {
            setAssessmentData({ title: 'Equipment Assessment — Pump System', property: 'Azure Bay', dist: '7.8 mi', fee: 95 });
            setAssessmentOpen(true);
          }} />

          {/* Quote dispatch */}
          <QuoteDispatchCard onQuote={() => {
            setQuoteData({ title: 'Pool Resurfacing — Full Quote', property: 'Sunset Palms', dist: '11.4 mi', due: '16h left · 24h window', comp: '$75 Assessment Fee' });
            setQuoteOpen(true);
          }} />

          {/* Compliance warning */}
          <div className="action-item warn">
            <div className="action-icon">⚠</div>
            <div className="action-body">
              <div className="action-title">Certificate of Insurance expiring in 21 days</div>
              <div className="action-sub">Emergency jobs will pause · Upload to stay active</div>
            </div>
            <div className="action-right">
              <button className="action-cta warn" onClick={() => showToast('Upload flow — coming in Compliance page')}>Upload Now</button>
            </div>
          </div>

          {/* Flags */}
          {flags.map((f) => (
            <div key={f.jobId} className="action-item warn flag" onClick={() => { setFlagData(f); setFlagOpen(true); }}>
              <div className="action-icon" style={{ color: 'var(--crimson)' }}>🚩</div>
              <div className="action-body">
                <div className="action-title" style={{ color: 'var(--crimson)' }}>Flagged — Job #{f.jobId} · {f.reason} · {f.date}</div>
                <div className="action-sub">{f.impact} · Tap to review</div>
              </div>
            </div>
          ))}

          {!emergency && missed.length === 0 && (
            <div className="action-empty">
              <span style={{ color: 'var(--emerald)', fontSize: 14 }}>✓</span>
              All clear — no urgent actions right now
            </div>
          )}
        </div>

        {/* ── MISSED BANNER ── */}
        {missed.length > 0 && (
          <div className="missed-banner">
            <span style={{ fontSize: 14 }}>🚫</span>
            <div style={{ flex: 1 }}>
              <div className="missed-banner-text">
                {missed.length === 1
                  ? <>1 job expired — <strong style={{ color: 'var(--crimson)' }}>{missed[0].payout} missed</strong></>
                  : <>{missed.length} offers expired</>}
              </div>
              <div className="missed-banner-sub">Tap to review · Affects your acceptance rate</div>
            </div>
          </div>
        )}

        {/* ── TODAY ROUTE ── */}
        <div className="sec-label">Today's Route</div>
        <div>
          <div className="route-header">
            <div className="route-stat-box"><div className="route-stat-val">4</div><div className="route-stat-lbl">Jobs</div></div>
            <div className="route-stat-box"><div className="route-stat-val">21.4 mi</div><div className="route-stat-lbl">Distance</div></div>
            <div className="route-stat-box"><div className="route-stat-val">5h 15m</div><div className="route-stat-lbl">Est. Time</div></div>
            <div className="route-stat-box"><div className="route-stat-val" style={{ color: 'var(--gold)' }}>$470</div><div className="route-stat-lbl">Est. Earnings</div></div>
          </div>
          <div className="route-jobs">
            {TODAY_JOBS.slice(0, 2).map((job, idx) => (
              <RouteJobRow
                key={job.id}
                job={job}
                idx={idx}
                onClick={() => openRouteJob(job.id)}
                onNavigate={() => navigateToJob(job.id)}
              />
            ))}
            {TODAY_JOBS.length > 2 && (
              <>
                <div className="route-collapsed" onClick={() => setRouteExpanded((v) => !v)}>
                  <span>{routeExpanded ? 'Tap to collapse' : `${TODAY_JOBS.length - 2} more jobs · tap to expand`}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-m)' }}>{routeExpanded ? '▲' : '▼'}</span>
                </div>
                {routeExpanded && TODAY_JOBS.slice(2).map((job, i) => (
                  <RouteJobRow
                    key={job.id}
                    job={job}
                    idx={i + 2}
                    onClick={() => openRouteJob(job.id)}
                    onNavigate={() => navigateToJob(job.id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── EARNINGS PULSE ── */}
        <div className="sec-label">Earnings Pulse</div>
        <div className="earnings-card" onClick={() => showToast('Opening Earnings…')}>
          <div className="earnings-top">
            <div className="earnings-today">
              <div className="earnings-today-val">$385</div>
              <div className="earnings-today-lbl">Today so far</div>
            </div>
            <div className="earnings-week">
              <div className="earnings-week-val">$1,240</div>
              <div className="earnings-week-lbl">This week</div>
              <div className="earnings-trend-tag">▲ 12%</div>
            </div>
          </div>
          <div className="spark-area">
            <div className="spark-label">Last 7 days + 3-day forecast</div>
            <div className="spark-wrap">
              <svg className="spark-svg" viewBox="0 0 600 52" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#D4AF37" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={spark.areaPath} fill="url(#areaGrad)" />
                <path d={spark.actualPath} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d={spark.forecastPath} fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round" />
                {EARNINGS_7D.map((v, i) => {
                  const isLast = i === spark.actualCount - 1;
                  return (
                    <circle
                      key={i}
                      cx={spark.x(i).toFixed(1)}
                      cy={spark.y(v).toFixed(1)}
                      r={isLast ? 3 : 2}
                      fill={isLast ? 'var(--gold)' : 'var(--bg-main)'}
                      stroke="var(--gold)"
                      strokeWidth="1.5"
                    />
                  );
                })}
                <text
                  x={spark.x(spark.actualCount - 1).toFixed(1)}
                  y={(spark.y(EARNINGS_7D[spark.actualCount - 1]) - 6).toFixed(1)}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="7"
                  fill="var(--gold)"
                  fontWeight="700"
                >TODAY</text>
                <text
                  x={(spark.x(spark.totalPoints - 1) - 2).toFixed(1)}
                  y={(spark.y(EARNINGS_FORECAST[EARNINGS_FORECAST.length - 1]) - 5).toFixed(1)}
                  textAnchor="end"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="7"
                  fill="rgba(212,175,55,0.5)"
                >FORECAST</text>
              </svg>
            </div>
          </div>
          <div className="earnings-forecast">
            <div className="forecast-dot" />
            <span>On track for <strong style={{ color: 'var(--gold)' }}>$3,100</strong> this month &nbsp;·&nbsp; <span style={{ color: 'var(--emerald)', fontFamily: 'var(--font-m)', fontSize: 11 }}>+$180 vs last week same day</span></span>
          </div>
        </div>

        {/* ── RELIABILITY SCORE ── */}
        <div className="score-card">
          <div className="score-ring-wrap">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--gold)" strokeWidth="5"
                strokeDasharray="163" strokeDashoffset="11"
                strokeLinecap="round" transform="rotate(-90 32 32)" />
            </svg>
            <div className="score-ring-val">
              <div className="score-num">92</div>
              <div className="score-tier-mini">Perf.</div>
            </div>
          </div>
          <div className="score-body">
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '.5px' }}>92 — Elite Vendor</div>
            <div style={{ fontSize: 12, color: 'var(--emerald)', fontFamily: 'var(--font-m)', marginTop: 3 }}>↑ +1.4 this week</div>
          </div>
        </div>
      </div>

      {/* ── DRAWERS ── */}
      <AssessmentDrawer
        open={assessmentOpen}
        data={assessmentData}
        onClose={() => setAssessmentOpen(false)}
        onContactPM={() => openComm('Coastal STR')}
        showToast={showToast}
      />
      <QuoteDrawer
        open={quoteOpen}
        data={quoteData}
        onClose={() => setQuoteOpen(false)}
        onContactPM={() => openComm('Coastal STR')}
        showToast={showToast}
      />
      <EmergencyDrawer
        open={emergencyOpen}
        offer={emergency}
        onClose={() => setEmergencyOpen(false)}
        onAccept={handleEmergencyAccept}
        onDecline={handleEmergencyDecline}
        onContactPM={() => openComm(emergency?.pm ?? 'Coastal STR')}
        showToast={showToast}
      />
      <FlagDrawer
        open={flagOpen}
        data={flagData}
        onClose={() => setFlagOpen(false)}
        onContactPM={() => openComm('Coastal STR')}
        showToast={showToast}
      />
      <CommDrawer
        open={commOpen}
        pmName={commPM}
        onClose={() => setCommOpen(false)}
        showToast={showToast}
      />
      <RouteJobDrawer
        open={routeJobOpen}
        job={TODAY_JOBS.find((j) => j.id === routeJobId) ?? null}
        onClose={() => setRouteJobOpen(false)}
        onNavigate={(id) => navigateToJob(id)}
        onContactPM={(pm) => openComm(pm)}
        showToast={showToast}
      />
    </>
  );
}

/* ═══════════ Sub-components ═══════════ */

function EmergencyCard({
  offer, onAccept, onView, onDecline,
}: { offer: EmergencyOffer; onAccept: () => void; onView: () => void; onDecline: () => void }) {
  const pct = offer.secondsLeft / offer.total;
  const offset = CIRCUMFERENCE * (1 - pct);
  const color = pct <= 0.15 ? 'var(--amber)' : 'var(--crimson)';
  const mins = Math.floor(offer.secondsLeft / 60).toString().padStart(2, '0');
  const secs = (offer.secondsLeft % 60).toString().padStart(2, '0');
  const pulse = pct <= 0.15 ? 'emg-pulse .6s ease-in-out infinite' : 'none';

  return (
    <div className="action-item emg" onClick={onView}>
      <div className="emg-ring-wrap">
        <svg width="54" height="54" viewBox="0 0 54 54">
          <circle cx="27" cy="27" r="20" fill="none" stroke="rgba(220,38,38,0.12)" strokeWidth="4" />
          <circle
            cx="27" cy="27" r="20" fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE.toFixed(2)}
            strokeDashoffset={offset.toFixed(2)}
            style={{ transition: 'stroke-dashoffset .9s linear, stroke .5s', animation: pulse }}
          />
        </svg>
        <div className="emg-ring-center">
          <div className="emg-ring-time">{mins}:{secs}</div>
          <div className="emg-ring-label">left</div>
        </div>
      </div>
      <div className="action-body">
        <div className="action-title">{offer.title}</div>
        <div className="action-sub">{offer.property} · {offer.dist} · ${offer.payout} · {offer.competitors} vendors notified</div>
      </div>
      <div className="action-right" style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 80 }}>
        <button className="action-cta emg" onClick={(e) => { e.stopPropagation(); onAccept(); }}>Accept</button>
        <button className="action-cta-outline" onClick={(e) => { e.stopPropagation(); onView(); }}>View</button>
        <button className="action-link" onClick={(e) => { e.stopPropagation(); onDecline(); }}>Decline</button>
      </div>
    </div>
  );
}

function StandardDispatchCard({ onAccept, onContact }: { onAccept: () => void; onContact: () => void }) {
  return (
    <div className="action-item std">
      <div className="action-body">
        <div className="action-title">Weekly Chemical Balance</div>
        <div className="action-sub">Palm Grove · 4.2 mi · $95</div>
        <div className="window-bar">
          <div className="window-bar-top">
            <span>Standard window</span><span>90m left</span>
          </div>
          <div className="window-bar-track">
            <div className="window-bar-fill gold" style={{ width: '75%' }} />
          </div>
        </div>
      </div>
      <div className="action-right">
        <button className="action-cta gold" onClick={onAccept}>Accept</button>
        <button className="action-link" onClick={onContact}>Contact PM</button>
      </div>
    </div>
  );
}

function AssessmentDispatchCard({ onView }: { onView: () => void }) {
  const hoursLeft = 2;
  return (
    <div className="action-item std">
      <div className="action-body">
        <div className="action-title">Equipment Assessment — Pump System</div>
        <div className="action-sub">Azure Bay · 7.8 mi · Inspection required</div>
        <div className="window-bar">
          <div className="window-bar-top">
            <span>Assessment window (4h)</span><span>{hoursLeft}h left</span>
          </div>
          <div className="seg-track">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`seg ${n <= hoursLeft ? 'filled' : ''}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="action-right">
        <button className="action-cta gold" onClick={onView}>View</button>
      </div>
    </div>
  );
}

function QuoteDispatchCard({ onQuote }: { onQuote: () => void }) {
  const hoursLeft = 16;
  return (
    <div className="action-item std">
      <div className="action-body">
        <div className="action-title">Pool Resurfacing — Full Quote</div>
        <div className="action-sub">Sunset Palms · 11.4 mi · Quote before work begins</div>
        <div className="window-bar">
          <div className="window-bar-top">
            <span>Quote window (24h)</span><span>{hoursLeft}h remaining</span>
          </div>
          <div className="ticks">
            {Array.from({ length: 24 }).map((_, i) => {
              const active = i < hoursLeft;
              return (
                <div
                  key={i}
                  className={`tick ${active ? 'active' : ''}`}
                  style={{ height: i % 6 === 0 ? 14 : 10 }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="action-right">
        <button className="action-cta gold" onClick={onQuote}>Quote</button>
      </div>
    </div>
  );
}

function RouteJobRow({
  job, idx, onClick, onNavigate,
}: { job: RouteJob; idx: number; onClick: () => void; onNavigate: () => void }) {
  const isCur = job.status === 'inprog';
  const isNext = job.status === 'next';
  const seqClass = isCur ? 'cur' : isNext ? 'nxt' : 'rest';
  const seqLabel = isCur ? '●' : (idx + 1).toString();
  const jobClass = isCur ? 'active-job' : isNext ? 'next-job' : '';
  return (
    <div className={`route-job ${jobClass}`} onClick={onClick}>
      <div className={`rj-seq ${seqClass}`}>{seqLabel}</div>
      <div className="rj-body">
        <div className="rj-title">{job.title}</div>
        <div className="rj-meta">{job.property} · {job.city} · {job.dist}</div>
      </div>
      <div className="rj-right">
        <div className="rj-pay">${job.payout}</div>
        {isCur && <div className="rj-status inprog">In Progress</div>}
        {isNext && (
          <button className="btn-navigate" onClick={(e) => { e.stopPropagation(); onNavigate(); }}>▶ Navigate</button>
        )}
        {!isCur && !isNext && <div className="rj-time">{job.time}</div>}
      </div>
    </div>
  );
}