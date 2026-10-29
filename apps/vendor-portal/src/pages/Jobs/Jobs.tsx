import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useVendor } from '../../context/VendorContext';
import {
    type IncomingJob, type ActiveJob, type CompletedJob, type HistoryJob,
    type MissedOffer, type JobTab, type MsgThread,
    getJobTypeBadge, badgeClass, getReminderState, reminderCooldownRemaining,
    REMINDER_MAX, INITIAL_MSG_THREADS,
} from './types';
import {
    JobDrawer, DeclineModal, PauseModal, CallModal,
} from './JobsDrawers';
import './Jobs.css';

/* ═══════════════════════════════════════════════════════════ */
export default function Jobs() {
    const { showToast } = useVendor();
    const [tab, setTab] = useState<JobTab>('incoming');
    const [incoming, setIncoming] = useState<IncomingJob[]>([]);
    const [active, setActive] = useState<ActiveJob[]>([]);
    const [completed, setCompleted] = useState<CompletedJob[]>([]);
    const [history, setHistory] = useState<HistoryJob[]>([]);
    const [missed, setMissed] = useState<MissedOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [msgThreads, setMsgThreads] = useState<Record<string, MsgThread[]>>(INITIAL_MSG_THREADS);
    const [search, setSearch] = useState('');
    const [sortLabel, setSortLabel] = useState('Soonest First');
    const [sortOpen, setSortOpen] = useState(false);
    const [complianceDismissed, setComplianceDismissed] = useState(false);
    const [drawerJobId, setDrawerJobId] = useState<string | null>(null);
    const [declineTarget, setDeclineTarget] = useState<string | null>(null);
    const [pauseTarget, setPauseTarget] = useState<string | null>(null);
    const [callTarget, setCallTarget] = useState<string | null>(null);

    /* ── Fetch Live Jobs from Backend ── */
    useEffect(() => {
        setLoading(true);
        setFetchError(null);
        apiFetch('/api/v1/vendors/portal/jobs')
            .then((r) => {
                if (!r.ok) throw new Error(`Server returned HTTP ${r.status}`);
                return r.json();
            })
            .then((body) => {
                const list = body.data || body;
                if (Array.isArray(list)) {
                    const incList: IncomingJob[] = [];
                    const actList: ActiveJob[] = [];
                    const compList: CompletedJob[] = [];
                    const histList: HistoryJob[] = [];

                    list.forEach((j: any) => {
                        const baseJob = {
                            id: j.id,
                            taskId: j.job_code || `TSK-${j.id.slice(-4)}`,
                            workflowClass: j.workflow_class || 'Standard Repair',
                            trade: j.trade_code || 'General',
                            title: j.title,
                            property: j.property_name || 'Property',
                            address: `${j.address_line_1 || ''}, ${j.city || ''} ${j.state || ''}`,
                            city: j.city || 'FL',
                            dist: 'Local',
                            pm: j.organization_name || 'Property Manager',
                            jobType: j.service_type || 'Repair',
                            payout: j.payout_amount ? Number(j.payout_amount) : 150,
                            issue: j.description || j.title,
                            scope: j.description || 'Standard inspection and maintenance',
                            time: j.scheduled_start ? new Date(j.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP',
                            dur: `${j.estimated_duration_minutes || 60} min`,
                            access: true,
                        };

                        if (j.status === 'assigned' || j.status === 'dispatching') {
                            incList.push({
                                ...baseJob,
                                type: j.severity === 'critical' ? 'emg' : 'new',
                                priority: j.severity ? j.severity.toUpperCase() : 'NORMAL',
                                deadline: '15 min response window',
                                deadlineClass: j.severity === 'critical' ? 'urgent' : 'warn',
                            });
                        } else if (j.status === 'accepted' || j.status === 'in_progress' || j.status === 'en_route' || j.status === 'on_site') {
                            actList.push({
                                ...baseJob,
                                status: j.status === 'accepted' ? 'accepted' : j.status === 'en_route' ? 'enroute' : j.status === 'on_site' ? 'onsite' : 'in-progress',
                                priority: j.severity ? j.severity.toUpperCase() : 'NORMAL',
                                step: j.status === 'in_progress' ? 2 : 1,
                                totalSteps: 4,
                                onTime: 'On track',
                                onTimeClass: 'ok',
                                checklist: [
                                    { done: true, text: 'Arrive at property & inspect' },
                                    { done: j.status === 'in_progress', text: 'Perform required service' },
                                    { done: false, text: 'Take photo evidence & upload' },
                                    { done: false, text: 'Submit completion report' },
                                ],
                                timeline: [
                                    { event: 'Job accepted', time: 'Today', state: 'ok' },
                                    ...(j.status === 'in_progress' ? [{ event: 'Work in progress', time: 'Now', state: 'ok' as const }] : []),
                                ],
                                beforePhotos: [],
                                afterPhotos: [],
                                materialsUsed: [],
                            });
                        } else if (j.status === 'verification_pending') {
                            compList.push({
                                id: j.id,
                                taskId: j.job_code || `TSK-${j.id.slice(-4)}`,
                                workflowClass: j.workflow_class || 'Standard Repair',
                                trade: j.trade_code || 'General',
                                date: 'Today',
                                title: j.title,
                                property: j.property_name || 'Property',
                                city: j.city || 'FL',
                                pm: j.organization_name || 'Property Manager',
                                address: `${j.address_line_1 || ''}, ${j.city || ''} ${j.state || ''}`,
                                payout: j.payout_amount ? `$${j.payout_amount}` : '$150',
                                payStatus: 'awaiting-payment',
                                payMethod: 'Direct Deposit',
                                payRef: 'PENDING',
                                payDate: 'Upon Verification',
                                payRecordedAt: null,
                                reminderCount: 0,
                                lastReminderAt: null,
                                reminderSentAt: null,
                                completedAt: 'Today',
                                verifiedAt: '',
                                waitingDays: 0,
                                overdue: false,
                                disputeAt: null,
                                disputeReason: null,
                            });
                        } else if (j.status === 'closed' || j.status === 'completed') {
                            histList.push({
                                id: j.id,
                                taskId: j.job_code || `TSK-${j.id.slice(-4)}`,
                                workflowClass: j.workflow_class || 'Standard Repair',
                                trade: j.trade_code || 'General',
                                date: new Date(j.created_at || Date.now()).toLocaleDateString(),
                                title: j.title,
                                property: j.property_name || 'Property',
                                pm: j.organization_name || 'Property Manager',
                                status: 'completed',
                                payout: j.payout_amount ? `$${j.payout_amount}` : '$150',
                                payStatus: 'paid',
                                payMethod: 'Direct Deposit',
                                payRef: 'TRF-OK',
                                payDate: 'Today',
                                incident: null,
                            });
                        }
                    });

                    setIncoming(incList);
                    setActive(actList);
                    setCompleted(compList);
                    setHistory(histList);
                }
            })
            .catch((err) => {
                console.warn('Could not load vendor jobs', err);
                setFetchError(err.message || 'Failed to load jobs from server');
            })
            .finally(() => setLoading(false));
    }, []);

    /* ── Find any job by id ── */
    const allJobs = useMemo(
        () => [...incoming, ...active, ...completed, ...history],
        [incoming, active, completed, history]
    );
    const drawerJob = drawerJobId ? allJobs.find((j) => j.id === drawerJobId) ?? null : null;

    /* ── Filtering ── */
    const filterJobs = <T extends { title?: string; property?: string; city?: string; pm?: string; status?: string; jobType?: string; type?: string; payout?: unknown; payStatus?: string; workflowClass?: string; trade?: string }>(list: T[]): T[] => {
        if (!search.trim()) return list;
        const q = search.toLowerCase().trim();
        return list.filter((j) => {
            const fields = [j.title, j.property, j.city, j.pm, j.status, j.jobType, j.type, j.payStatus, j.workflowClass, j.trade, String(j.payout ?? '')].filter(Boolean);
            return fields.some((f) => String(f).toLowerCase().includes(q));
        });
    };

    /* ── Accept/decline incoming ── */
    const acceptJob = async (id: string) => {
        const j = incoming.find((x) => x.id === id);
        if (!j) return;

        try {
            // Persist to backend first and only update UI upon backend confirmation
            if (!id.startsWith('i-')) {
                const res = await apiFetch(`/api/v1/vendors/portal/jobs/${id}/respond`, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'accept' }),
                });
                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(errBody.errors?.[0]?.message || 'Failed to accept job on server');
                }
            }

            setIncoming((list) => list.filter((x) => x.id !== id));
            setActive((list) => [{
                id: j.id,
                taskId: j.taskId,
                workflowClass: j.workflowClass,
                trade: j.trade,
                status: j.type === 'emg' ? 'enroute' : 'accepted',
                priority: j.priority,
                title: j.title,
                issue: j.issue,
                scope: j.scope,
                property: j.property,
                city: j.city,
                dist: j.dist,
                pm: j.pm,
                jobType: j.jobType,
                type: j.type === 'emg' ? 'emg' : undefined,
                time: j.time,
                dur: j.dur,
                payout: j.payout,
                step: 0,
                totalSteps: 4,
                onTime: j.type === 'emg' ? 'ETA 30 min' : 'On time',
                onTimeClass: 'ok',
                address: j.address,
                gateCode: j.gateCode,
                lockBox: j.lockBox,
                parking: j.parking,
                checklist: [
                    { done: false, text: 'Assess leak source and severity' },
                    { done: false, text: 'Document with photos before repair' },
                    { done: false, text: 'Perform repair & complete work' },
                    { done: false, text: 'Submit completion report' },
                ],
                timeline: [{ event: 'Job accepted', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), state: 'ok' }],
                beforePhotos: [], afterPhotos: [], materialsUsed: [],
            }, ...list]);
            showToast(j.type === 'emg' ? 'Emergency accepted — en route' : `${j.title} accepted`, 'success');
            setTab('active');
        } catch (e: any) {
            console.error('Failed to notify backend of acceptance:', e);
            showToast(e.message || 'Failed to accept job. Please try again.', 'danger');
        }
    };

    const confirmDecline = async () => {
        if (!declineTarget) return;
        const id = declineTarget;

        try {
            if (!id.startsWith('i-')) {
                const res = await apiFetch(`/api/v1/vendors/portal/jobs/${id}/respond`, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'decline', declineReason: 'Vendor schedule full' }),
                });
                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(errBody.errors?.[0]?.message || 'Failed to decline job on server');
                }
            }

            setIncoming((list) => list.filter((x) => x.id !== id));
            setDeclineTarget(null);
            showToast('Job declined · logged to dispatch', 'info');
        } catch (e: any) {
            console.error('Failed to notify backend of decline:', e);
            showToast(e.message || 'Failed to decline job on server.', 'danger');
        }
    };

    const confirmPause = (reason: string, notes: string) => {
        if (!pauseTarget) return;
        setActive((list) => list.map((j) => j.id === pauseTarget ? {
            ...j,
            status: 'resume-requested',
            pauseIssueType: reason,
            pauseReason: notes || `${reason} — requesting authorization to resume.`,
            pauseRequestedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timeline: [...j.timeline, { event: `Issue found — ${reason}`, time: 'Just now', state: 'warn' as const }],
        } : j));
        setPauseTarget(null);
        showToast('Pause requested · PM notified', 'info');
    };

    /* ── Compliance signal ── */
    const compliance = { name: 'Certificate of Insurance (COI)', status: 'expiring', daysLeft: 21 };

    return (
        <>
            <div className="topbar">
                <span className="page-title">Jobs &amp; Tasks</span>
                <div className="topbar-right">
                    <button className="btn-icon" onClick={() => showToast('Opening Alerts…')}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1a5 5 0 015 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 015-5zM6.5 13a1.5 1.5 0 003 0" /></svg>
                        <span className="notif-dot" />
                    </button>
                </div>
            </div>

            <div className="jobs-page">
                {/* TOP CONTROLS */}
                <div className="jobs-controls">
                    <div className="jobs-tabs">
                        <TabBtn active={tab === 'incoming'} onClick={() => setTab('incoming')} label="Incoming"
                            count={incoming.length} tone={incoming.length > 0 ? 'red' : 'default'} />
                        <TabBtn active={tab === 'active'} onClick={() => setTab('active')} label="Active" count={active.length} />
                        <TabBtn active={tab === 'completed'} onClick={() => setTab('completed')} label="Completed" count={completed.length} />
                        <TabBtn active={tab === 'history'} onClick={() => setTab('history')} label="History" count={history.length} />
                        <div className="jobs-today">
                            Today <span className="jobs-today-val">$385</span>
                        </div>
                    </div>

                    <div className="jobs-toolbar">
                        <div className="j-search">
                            <svg className="j-search-ic" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6.5" cy="6.5" r="4" /><path d="M11 11l3 3" /></svg>
                            <input
                                type="text"
                                placeholder="Search by property, city, job type, PM…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="j-sort-wrap">
                            <button className={`j-sort-trigger ${sortOpen ? 'open' : ''}`} onClick={() => setSortOpen((o) => !o)}>
                                {sortLabel}
                                <svg className="j-sort-arrow" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6l4 4 4-4" /></svg>
                            </button>
                            {sortOpen && (
                                <div className="j-sort-menu">
                                    {['Soonest First', 'Highest Payout', 'Nearest', 'Highest Priority', 'Newest Offered'].map((o) => (
                                        <div key={o} className={`j-sort-opt ${sortLabel === o ? 'selected' : ''}`} onClick={() => { setSortLabel(o); setSortOpen(false); }}>{o}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {!complianceDismissed && (
                        <div className="compliance-bar expiring">
                            <span className="cb-icon">⚠</span>
                            <div className="cb-msg expiring"><strong>{compliance.name.replace('Certificate of Insurance', 'COI')} expires in {compliance.daysLeft} days</strong> — emergency jobs will pause</div>
                            <button className="cb-link expiring" onClick={() => showToast('Opening Compliance…', 'info')}>Renew →</button>
                            <button className="cb-dismiss" onClick={() => setComplianceDismissed(true)}>✕</button>
                        </div>
                    )}

                    <StatusStrip tab={tab} incoming={incoming} active={active} completed={completed} history={history} />
                </div>

                {/* Missed banner */}
                {missed.length > 0 && (
                    <div className="missed-offer-banner-wrap">
                        <div className="missed-offer-banner">
                            <span className="mob-icon">🚫</span>
                            <div>
                                <div className="mob-text">
                                    {missed.length} offer{missed.length > 1 ? 's' : ''} expired · <strong style={{ color: 'var(--crimson)' }}>${missed.reduce((s, m) => s + m.payout, 0)} missed</strong>
                                </div>
                                <div className="mob-sub">Affects your acceptance rate</div>
                            </div>
                            <button className="mob-dismiss" onClick={() => setMissed([])}>✕</button>
                        </div>
                    </div>
                )}

                {/* LIST */}
                <div className="jobs-body">
                    {loading && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
                            <div>Loading real-time vendor jobs…</div>
                        </div>
                    )}
                    {!loading && fetchError && (
                        <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', margin: '1rem' }}>
                            <div style={{ fontSize: '1.25rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>Unable to load jobs</div>
                            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{fetchError}</div>
                        </div>
                    )}
                    {!loading && !fetchError && (
                        <>
                            {tab === 'incoming' && (
                                incoming.length === 0 ? (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                                        <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '1rem' }}>No incoming jobs</div>
                                        <div style={{ fontSize: '0.85rem' }}>New dispatched assignments will appear here live.</div>
                                    </div>
                                ) : (
                                    <IncomingList jobs={filterJobs(incoming)} onOpen={setDrawerJobId} onAccept={acceptJob} onDecline={setDeclineTarget} />
                                )
                            )}
                            {tab === 'active' && (
                                active.length === 0 ? (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                                        <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '1rem' }}>No active jobs in progress</div>
                                        <div style={{ fontSize: '0.85rem' }}>Accepted jobs and ongoing work orders appear here.</div>
                                    </div>
                                ) : (
                                    <ActiveList jobs={filterJobs(active)} onOpen={setDrawerJobId} />
                                )
                            )}
                            {tab === 'completed' && (
                                completed.length === 0 ? (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                                        <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '1rem' }}>No jobs awaiting verification</div>
                                        <div style={{ fontSize: '0.85rem' }}>Completed jobs undergoing PM sign-off will appear here.</div>
                                    </div>
                                ) : (
                                    <CompletedList jobs={filterJobs(completed)} onOpen={setDrawerJobId} onRemind={(id) => {
                                        setCompleted((list) => list.map((j) => j.id === id ? { ...j, reminderCount: j.reminderCount + 1, lastReminderAt: new Date().toISOString() } : j));
                                        showToast('Reminder sent to PM', 'success');
                                    }} onConfirm={(id) => {
                                        const j = completed.find((x) => x.id === id);
                                        if (!j) return;
                                        setCompleted((list) => list.filter((x) => x.id !== id));
                                        setHistory((list) => [{ id: j.id, taskId: j.taskId, workflowClass: j.workflowClass, trade: j.trade, date: j.date, title: j.title, property: j.property, pm: j.pm, status: 'completed', payout: j.payout, payStatus: 'paid', payMethod: j.payMethod, payRef: j.payRef, payDate: j.payDate, incident: null, confirmedAt: 'Just now' }, ...list]);
                                        showToast('Payment confirmed · Job closed', 'success');
                                    }} onDispute={(id) => {
                                        setCompleted((list) => list.map((j) => j.id === id ? { ...j, payStatus: 'payment-disputed', disputeAt: 'Just now', disputeReason: 'Payment not received in my account' } : j));
                                        showToast('Payment disputed · PM notified', 'warn');
                                    }} />
                                )
                            )}
                            {tab === 'history' && (
                                history.length === 0 ? (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                                        <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '1rem' }}>No closed job history</div>
                                        <div style={{ fontSize: '0.85rem' }}>Past verified and paid tasks will be archived here.</div>
                                    </div>
                                ) : (
                                    <HistoryList jobs={filterJobs(history)} onOpen={setDrawerJobId} />
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* DRAWER */}
            {drawerJob && (
                <JobDrawer
                    job={drawerJob}
                    onClose={() => setDrawerJobId(null)}
                    showToast={showToast}
                    msgThreads={msgThreads}
                    setMsgThreads={setMsgThreads}
                    onAccept={acceptJob}
                    onDecline={setDeclineTarget}
                    onPause={setPauseTarget}
                    onCall={setCallTarget}
                />
            )}

            {/* MODALS */}
            {declineTarget && <DeclineModal onClose={() => setDeclineTarget(null)} onConfirm={confirmDecline} />}
            {pauseTarget && <PauseModal onClose={() => setPauseTarget(null)} onConfirm={confirmPause} />}
            {callTarget && (
                <CallModal
                    jobId={callTarget}
                    job={allJobs.find((j) => j.id === callTarget) ?? null}
                    onClose={() => setCallTarget(null)}
                />
            )}
        </>
    );
}

/* ═══════════════ SMALL PARTS ═══════════════ */
function TabBtn({ active, onClick, label, count, tone }: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'red' | 'default' }) {
    return (
        <button className={`j-tab ${active ? 'active' : ''}`} onClick={onClick}>
            {label} <span className={`j-tab-cnt ${tone === 'red' ? 'red' : ''}`}>{count}</span>
        </button>
    );
}

function StatusStrip({ tab, incoming, active, completed, history }: {
    tab: JobTab;
    incoming: IncomingJob[];
    active: ActiveJob[];
    completed: CompletedJob[];
    history: HistoryJob[];
}) {
    if (tab === 'incoming') {
        return (
            <div className="jobs-status-strip">
                <StripItem color="crimson" label="Emergency" val={incoming.filter((j) => j.type === 'emg').length} />
                <StripItem color="amber" label="Expiring" val={incoming.filter((j) => j.type === 'expiring').length} />
                <StripItem color="blue" label="New Offers" val={incoming.filter((j) => j.type === 'new').length} />
            </div>
        );
    }
    if (tab === 'active') {
        const stateCount = (s: string) => active.filter((j) => j.status === s).length;
        return (
            <div className="jobs-status-strip">
                <StripItem color="blue" label="In Progress" val={stateCount('in-progress')} />
                <StripItem color="gold" label="On Site" val={stateCount('onsite')} />
                <StripItem color="blue" label="En Route" val={stateCount('enroute')} />
                <StripItem color="emerald" label="Accepted" val={stateCount('accepted')} />
                <StripItem color="amber" label="Rework" val={stateCount('rework-required')} />
            </div>
        );
    }
    if (tab === 'completed') {
        const awaiting = completed.filter((j) => j.payStatus === 'awaiting-payment').length;
        const recorded = completed.filter((j) => j.payStatus === 'payment-sent').length;
        const disputed = completed.filter((j) => j.payStatus === 'payment-disputed').length;
        return (
            <div className="jobs-status-strip">
                {disputed > 0 && <StripItem color="crimson" label="Disputed" val={disputed} />}
                <StripItem color="amber" label="Awaiting PM" val={awaiting} />
                {recorded > 0 && <StripItem color="blue" label="Confirm" val={recorded} />}
                <div className="jss-tail">PM pays outside Lookara · Lookara records only</div>
            </div>
        );
    }
    return (
        <div className="jobs-status-strip">
            <StripItem color="emerald" label="Verified" val={history.filter((j) => j.status === 'completed').length} />
            <StripItem color="crimson" label="Rework" val={history.filter((j) => j.status === 'rework-required').length} />
            <StripItem color="muted" label="Cancelled" val={history.filter((j) => j.status === 'cancelled').length} />
        </div>
    );
}

function StripItem({ color, label, val }: { color: string; label: string; val: number }) {
    const bg = { crimson: 'var(--crimson)', amber: 'var(--amber)', blue: 'var(--blue)', emerald: 'var(--emerald)', gold: 'var(--gold)', muted: 'var(--text-muted)' }[color] || 'var(--text-muted)';
    const isColored = color === 'crimson' || color === 'amber';
    return (
        <div className="jss-item">
            <div className="jss-dot" style={{ background: bg }} />
            <span>{label}</span>
            <span className="jss-val" style={isColored ? { color: bg } : undefined}>{val}</span>
        </div>
    );
}

/* ═══════════════ LIST WRAPPERS ═══════════════ */
function IncomingList({ jobs, onOpen, onAccept, onDecline }: {
    jobs: IncomingJob[]; onOpen: (id: string) => void; onAccept: (id: string) => void; onDecline: (id: string) => void;
}) {
    const emg = jobs.filter((j) => j.type === 'emg');
    const compet = jobs.filter((j) => j.type === 'new' && j.priorityLevel === 'HIGH');
    const openPool = jobs.filter((j) => j.type === 'expiring');
    const structured = jobs.filter((j) => j.type !== 'emg' && j.type !== 'expiring' && !(j.type === 'new' && j.priorityLevel === 'HIGH'));

    if (!jobs.length) return <EmptyState title="No incoming jobs" sub="New offers will appear here" />;

    return (
        <>
            {emg.length > 0 && <SectionLabel color="var(--crimson)">⚡ Emergency — Respond Now</SectionLabel>}
            {emg.map((j) => <IncomingCard key={j.id} job={j} onOpen={onOpen} onAccept={onAccept} onDecline={onDecline} />)}

            {compet.length > 0 && <SectionLabel color="var(--amber)">🔴 Your Priority Window</SectionLabel>}
            {compet.map((j) => <IncomingCard key={j.id} job={j} onOpen={onOpen} onAccept={onAccept} onDecline={onDecline} />)}

            {openPool.length > 0 && <SectionLabel color="var(--text-secondary)">🟡 Still Available</SectionLabel>}
            {openPool.map((j) => <IncomingCard key={j.id} job={j} onOpen={onOpen} onAccept={onAccept} onDecline={onDecline} />)}

            {structured.length > 0 && <SectionLabel color="var(--blue)">🔵 Assigned to You</SectionLabel>}
            {structured.map((j) => <IncomingCard key={j.id} job={j} onOpen={onOpen} onAccept={onAccept} onDecline={onDecline} />)}
        </>
    );
}

function ActiveList({ jobs, onOpen }: { jobs: ActiveJob[]; onOpen: (id: string) => void }) {
    const sections: { label: string; color: string; statuses: ActiveJob['status'][] }[] = [
        { label: 'Execution', color: 'var(--text-secondary)', statuses: ['in-progress', 'onsite', 'enroute', 'accepted'] },
        { label: 'Rework Required', color: 'var(--crimson)', statuses: ['rework-required'] },
        { label: 'Quoting', color: '#A78BFA', statuses: ['assessment-accepted', 'quote-pending', 'quote-rejected'] },
        { label: 'Ready to Start', color: 'var(--emerald)', statuses: ['approved'] },
        { label: 'Blocked', color: 'var(--crimson)', statuses: ['blocked', 'clarify'] },
        { label: 'Awaiting Verification', color: 'var(--text-muted)', statuses: ['submitted'] },
        { label: 'Paused — Awaiting PM', color: 'var(--blue)', statuses: ['resume-requested'] },
    ];
    if (!jobs.length) return <EmptyState title="No active jobs" sub="Accepted jobs will appear here" />;
    const seen = new Set<string>();
    return (
        <>
            {sections.map((sec) => {
                const group = jobs.filter((j) => sec.statuses.includes(j.status));
                if (!group.length) return null;
                group.forEach((g) => seen.add(g.id));
                return (
                    <div key={sec.label}>
                        <SectionLabel color={sec.color}>{sec.label}</SectionLabel>
                        {group.map((j) => <ActiveCard key={j.id} job={j} onOpen={onOpen} />)}
                    </div>
                );
            })}
            {jobs.filter((j) => !seen.has(j.id)).map((j) => <ActiveCard key={j.id} job={j} onOpen={onOpen} />)}
        </>
    );
}

function CompletedList({ jobs, onOpen, onRemind, onConfirm, onDispute }: {
    jobs: CompletedJob[]; onOpen: (id: string) => void;
    onRemind: (id: string) => void; onConfirm: (id: string) => void; onDispute: (id: string) => void;
}) {
    if (!jobs.length) return <EmptyState title="No jobs awaiting payment" sub="Completed jobs will appear here" />;
    const disputed = jobs.filter((j) => j.payStatus === 'payment-disputed');
    const awaiting = jobs.filter((j) => j.payStatus === 'awaiting-payment');
    const recorded = jobs.filter((j) => j.payStatus === 'payment-sent');

    return (
        <>
            <div className="completed-disclaimer">Payments handled outside Lookara · This system records only</div>
            {disputed.length > 0 && <SectionLabel color="var(--crimson)">Payment Issues ({disputed.length})</SectionLabel>}
            {disputed.map((j) => <CompletedCard key={j.id} job={j} onOpen={onOpen} onRemind={onRemind} onConfirm={onConfirm} onDispute={onDispute} />)}
            {awaiting.length > 0 && <SectionLabel color="var(--amber)">Awaiting PM Payment ({awaiting.length})</SectionLabel>}
            {awaiting.map((j) => <CompletedCard key={j.id} job={j} onOpen={onOpen} onRemind={onRemind} onConfirm={onConfirm} onDispute={onDispute} />)}
            {recorded.length > 0 && <SectionLabel color="var(--blue)">Payment Recorded ({recorded.length})</SectionLabel>}
            {recorded.map((j) => <CompletedCard key={j.id} job={j} onOpen={onOpen} onRemind={onRemind} onConfirm={onConfirm} onDispute={onDispute} />)}
        </>
    );
}

function HistoryList({ jobs, onOpen }: { jobs: HistoryJob[]; onOpen: (id: string) => void }) {
    if (!jobs.length) return <EmptyState title="No history" sub="Completed and cancelled jobs will appear here" />;
    return <>{jobs.map((j) => <HistoryRow key={j.id} job={j} onOpen={onOpen} />)}</>;
}

/* ═══════════════ CARD COMPONENTS ═══════════════ */
function IncomingCard({ job, onOpen, onAccept, onDecline }: {
    job: IncomingJob; onOpen: (id: string) => void; onAccept: (id: string) => void; onDecline: (id: string) => void;
}) {
    const isEmg = job.type === 'emg';
    const isEstimate = job.type === 'estimate' || job.isEstimate;
    const isAssessment = job.type === 'assessment' || job.isAssessment;
    const isCompetitive = !isEmg && job.type === 'new' && job.deadline && job.priorityLevel === 'HIGH';
    const priClass = job.priority === 'CRITICAL' ? 'pri-emg' : job.priority === 'HIGH' ? 'pri-high' : 'pri-norm';
    const tierClass = isEstimate || isAssessment ? 'tier-effort' : '';
    const badgeLabel = getJobTypeBadge(job);
    const badge = <span className={`jt-badge ${badgeClass(badgeLabel)}`}>{badgeLabel}</span>;

    const payoutDisplay = (isAssessment || isEstimate) ? <span className="payout-tbd">TBD</span> : `$${job.payout ?? 0}`;

    return (
        <button className={`jc ${priClass} ${isEmg ? 'emg-card' : ''} ${tierClass}`} onClick={() => onOpen(job.id)}>
            {isEmg && (
                <div className="emg-card-band">
                    <span className="emg-card-label">⚡ Emergency Dispatch</span>
                    <span className="emg-card-badge">Critical</span>
                </div>
            )}
            {isAssessment && (
                <div className="jc-soft-band is-purple">
                    <span className="jc-soft-band-lbl">🔍 Assessment Required</span>
                    <span className="jc-soft-band-note">Inspection first — no payout until approved</span>
                </div>
            )}
            {isEstimate && !isAssessment && (
                <div className="jc-soft-band is-gold">
                    <span className="jc-soft-band-lbl">📋 Quote Required</span>
                    <span className="jc-soft-band-note">Quote first — no payout until PM approves</span>
                </div>
            )}

            <div className="jc-row1">
                <span className="jc-title">{job.title}</span>
                {badge}
                <span className="jc-payout">{payoutDisplay}</span>
            </div>

            <div className="jc-row2">
                <span className="jc-prop">{job.property}</span>
                <span className="jc-sep">·</span>
                <span className="jc-dist">{job.city}</span>
                <span className="jc-sep">·</span>
                <span className="jc-dist">{job.dist}</span>
                <span className="jc-sep">·</span>
                <span className="pm-source"><span className="pm-source-ic">🏢</span>{job.pm}</span>
                {job.access && <><span className="jc-sep">·</span><span className="jc-access">🔑 Access Ready</span></>}
            </div>

            <div className="jc-row3">
                <span className="jc-time">{job.time}</span>
                <span className="jc-sep">·</span>
                <span className="jc-dur">{job.dur}</span>
            </div>

            {isCompetitive && (
                <div className="jc-competitive-strip" onClick={(e) => e.stopPropagation()}>
                    <div className="jc-competitive-row">
                        <div>
                            <div className="jc-comp-lbl">Your window</div>
                            <span className="jc-comp-timer">02:00</span>
                        </div>
                        <div className="jc-comp-right">
                            <div className="jc-comp-sub">You have first priority</div>
                            <div className="jc-comp-sub">Others notified after window</div>
                        </div>
                    </div>
                    <div className="jc-comp-bar-wrap"><div className="jc-comp-bar-fill" style={{ width: '100%' }} /></div>
                </div>
            )}

            {isEmg && (
                <div className="jc-emg-strip" onClick={(e) => e.stopPropagation()}>
                    <div className="jc-emg-strip-top">
                        <div>
                            <div className="jc-emg-lbl">Your window</div>
                            <span className="jc-emg-timer">01:42</span>
                        </div>
                        <div className="jc-emg-actions">
                            <button className="btn-accept-sm" onClick={(e) => { e.stopPropagation(); onAccept(job.id); }}>⚡ Accept</button>
                            <button className="btn-decline-sm" onClick={(e) => { e.stopPropagation(); onDecline(job.id); }}>Decline</button>
                        </div>
                    </div>
                    <div className="jc-emg-bar-wrap"><div className="jc-emg-bar-fill" style={{ width: '85%' }} /></div>
                </div>
            )}

            {!isEmg && !isEstimate && !isAssessment && (
                <div className="jc-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-ja-accept" onClick={() => onAccept(job.id)}>✓ Accept</button>
                    <button className="btn-ja-decline" onClick={() => onDecline(job.id)}>Decline</button>
                    <button className="btn-ja-detail" onClick={() => onOpen(job.id)}>Details →</button>
                </div>
            )}
            {isEstimate && !isAssessment && (
                <div className="jc-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-ja-accept gold" onClick={() => onOpen(job.id)}>📋 View &amp; Quote</button>
                    <button className="btn-ja-decline" onClick={() => onDecline(job.id)}>Decline</button>
                </div>
            )}
            {isAssessment && (
                <div className="jc-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-ja-accept purple" onClick={() => onAccept(job.id)}>✓ Accept</button>
                    <button className="btn-ja-decline" onClick={() => onDecline(job.id)}>Decline</button>
                    <button className="btn-ja-detail" onClick={() => onOpen(job.id)}>Details →</button>
                </div>
            )}
        </button>
    );
}

function ActiveCard({ job, onOpen }: { job: ActiveJob; onOpen: (id: string) => void }) {
    const isAssessmentJob = job.isAssessment || job.jobType === 'Assessment';
    const priClass = job.priority === 'CRITICAL' ? 'pri-emg' : job.priority === 'HIGH' ? 'pri-high' : 'pri-norm';
    const chipClass = `chip-${job.status}`;
    const badgeLabel = getJobTypeBadge(job);
    const pct = job.totalSteps ? Math.round((job.step / job.totalSteps) * 100) : 0;
    const barColor = job.onTimeClass === 'late' ? 'var(--crimson)' : job.onTimeClass === 'risk' ? 'var(--amber)' : 'var(--emerald)';
    const statusLabels: Record<string, string> = {
        'in-progress': 'In Progress', accepted: 'Accepted', enroute: 'En Route', onsite: 'On Site',
        submitted: 'Completion Submitted', blocked: '⚠ Blocked Access',
        'rework-required': '⚠ Rework Required', 'resume-requested': '🔓 Awaiting PM',
        'quote-pending': 'Quote Submitted', 'quote-rejected': '⚠ Quote Rejected', approved: '✓ Approved',
        'assessment-accepted': 'Assessment Required', clarify: 'Awaiting Clarification',
    };
    const payoutDisplay = isAssessmentJob ? (job.quoteAmount ? `$${job.quoteAmount}` : <span className="payout-tbd">TBD</span>) : `$${job.payout ?? 0}`;

    return (
        <button className={`jc ${priClass}`} onClick={() => onOpen(job.id)}>
            {job.status === 'rework-required' && <div className="jc-soft-band is-crimson"><span className="jc-soft-band-lbl">⚠ Rework Required</span><span className="jc-soft-band-note">{job.reworkReason || 'PM requested corrections'}</span></div>}
            {job.status === 'resume-requested' && <div className="jc-soft-band is-blue"><span className="jc-soft-band-lbl">🔓 Awaiting PM Authorization</span><span className="jc-soft-band-note">{job.pauseIssueType || 'Paused'}</span></div>}
            {isAssessmentJob && job.status === 'quote-pending' && <div className="jc-soft-band is-purple"><span className="jc-soft-band-lbl">Quote Submitted · ${job.quoteAmount}</span><span className="jc-soft-band-note">Awaiting PM</span></div>}
            {isAssessmentJob && job.status === 'approved' && <div className="jc-soft-band is-emerald"><span className="jc-soft-band-lbl">✓ Quote Approved · ${job.quoteAmount}</span><span className="jc-soft-band-note">Start Work</span></div>}
            {isAssessmentJob && job.status === 'quote-rejected' && <div className="jc-soft-band is-amber"><span className="jc-soft-band-lbl">⚠ Quote Rejected</span><span className="jc-soft-band-note">{job.quoteRejectedReason}</span></div>}

            <div className="jc-row1">
                <span className="jc-title">{job.title}</span>
                <span className={`jt-badge ${badgeClass(badgeLabel)}`}>{badgeLabel}</span>
                <span className={`chip ${chipClass}`}>{statusLabels[job.status] ?? job.status}</span>
                <span className="jc-payout">{payoutDisplay}</span>
            </div>

            <div className="jc-row2">
                <span className="jc-prop">{job.property}</span>
                <span className="jc-sep">·</span>
                <span className="jc-dist">{job.city}</span>
                <span className="jc-sep">·</span>
                <span className="jc-dist">{job.dist}</span>
                {job.pm && <><span className="jc-sep">·</span><span className="pm-source"><span className="pm-source-ic">🏢</span>{job.pm}</span></>}
            </div>

            <div className="jc-row3">
                {job.scheduledTime ? <span className="jc-time">{job.scheduledTime}</span> : <><span className="jc-time">{job.time}</span><span className="jc-sep">·</span><span className="jc-dur">{job.dur}</span></>}
                {job.status === 'accepted' && job.startsInMin != null && <><span className="jc-sep">·</span><span className="jc-ontime ok">Starts in {job.startsInMin} min</span></>}
                {job.onTime && (job.status === 'enroute' || job.status === 'onsite' || job.status === 'in-progress') && <><span className="jc-sep">·</span><span className={`jc-ontime ${job.onTimeClass}`}>{job.onTime}</span></>}
            </div>

            {(job.status === 'in-progress' || job.status === 'onsite') && job.totalSteps > 0 && (
                <div className="jc-progress-row">
                    <div className="jc-progress-bar"><div className="jc-progress-fill" style={{ width: `${pct}%`, background: barColor }} /></div>
                    <div className="jc-step">Step {job.step} / {job.totalSteps}</div>
                </div>
            )}

            {job.status === 'submitted' && (
                <div className="jc-progress-row">
                    <div className="jc-progress-bar"><div className="jc-progress-fill" style={{ width: '100%', background: 'var(--text-muted)' }} /></div>
                    <div className="jc-step" style={{ color: 'var(--text-muted)' }}>Awaiting PM Verification</div>
                </div>
            )}

            <div className="jc-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn-ja-detail" onClick={() => onOpen(job.id)}>Open Job →</button>
            </div>
        </button>
    );
}

function CompletedCard({ job, onOpen, onRemind, onConfirm, onDispute }: {
    job: CompletedJob;
    onOpen: (id: string) => void;
    onRemind: (id: string) => void;
    onConfirm: (id: string) => void;
    onDispute: (id: string) => void;
}) {
    const ps = job.payStatus;
    const border = ps === 'payment-disputed' ? 'var(--crimson)' : ps === 'payment-sent' ? 'var(--blue)' : 'var(--amber)';
    const rState = getReminderState(job);

    const band = ps === 'awaiting-payment' ? (
        <div className="pay-status-band"><span className="pay-band-label">Awaiting PM Payment</span><span className="pay-band-date">Completed {job.date} · {job.completedAt}</span></div>
    ) : ps === 'payment-sent' ? (
        <div className="pay-status-band logged"><span className="pay-band-label logged">Payment Recorded by PM</span><span className="pay-band-date">{job.payMethod} · {job.payRecordedAt}</span></div>
    ) : (
        <div className="pay-status-band disputed"><span className="pay-band-label disputed">⚠ Payment Disputed</span><span className="pay-band-date">Reported {job.disputeAt}</span></div>
    );

    const actions = ps === 'awaiting-payment' ? (
        <>
            {rState === 'can_send' ? (
                <button className="btn-reminder" onClick={(e) => { e.stopPropagation(); onRemind(job.id); }}>Remind PM{job.reminderCount > 0 ? ` (${job.reminderCount}/${REMINDER_MAX})` : ''}</button>
            ) : rState === 'cooldown' ? (
                <button className="btn-reminder sent" disabled>Remind PM · {reminderCooldownRemaining(job)}</button>
            ) : (
                <button className="btn-reminder sent" disabled>⚠ Escalated to PM</button>
            )}
            <button className="btn-ja-detail" onClick={(e) => { e.stopPropagation(); onOpen(job.id); }}>Details ›</button>
        </>
    ) : ps === 'payment-sent' ? (
        <>
            <button className="btn-ja-accept emerald" onClick={(e) => { e.stopPropagation(); onConfirm(job.id); }}>Confirm Received</button>
            <button className="btn-ja-decline" onClick={(e) => { e.stopPropagation(); onDispute(job.id); }}>Report Not Received</button>
        </>
    ) : (
        <>
            <button className="btn-ja-accept emerald" onClick={(e) => { e.stopPropagation(); onConfirm(job.id); }}>Mark as Received</button>
            <button className="btn-ja-detail" onClick={(e) => { e.stopPropagation(); onOpen(job.id); }}>View Details</button>
        </>
    );

    return (
        <button className="jc pri-low completed-card" style={{ borderLeftColor: border }} onClick={() => onOpen(job.id)}>
            {band}
            <div className="jc-row1">
                <span className="jc-title">{job.title}</span>
                <span className="jc-payout gold">{job.payout}</span>
            </div>
            <div className="jc-row2">
                <span className="jc-prop">{job.property}</span>
                <span className="jc-sep">·</span>
                <span className="jc-dist">{job.city}</span>
                <span className="jc-sep">·</span>
                <span className="pm-source"><span className="pm-source-ic">🏢</span>{job.pm}</span>
            </div>
            <div className="jc-row3">
                {job.overdue ? (
                    <span className="jc-deadline urgent">⚠ {job.waitingDays} days overdue</span>
                ) : (
                    <span className="jc-dur">Waiting: {job.waitingDays} days</span>
                )}
            </div>
            <div className="jc-actions" onClick={(e) => e.stopPropagation()}>{actions}</div>
        </button>
    );
}

function HistoryRow({ job, onOpen }: { job: HistoryJob; onOpen: (id: string) => void }) {
    const chipMap: Record<string, string> = {
        completed: 'chip-verified', cancelled: 'chip-cancelled',
        'rework-required': 'chip-rework', missed: 'chip-missed',
    };
    return (
        <button className="jc pri-low" onClick={() => onOpen(job.id)}>
            <div className="jc-row1">
                <span className="jc-time" style={{ flexShrink: 0, color: 'var(--text-muted)' }}>{job.date}</span>
                <span className="jc-title" style={{ fontSize: 12 }}>{job.title}</span>
                <span className={`chip ${chipMap[job.status] ?? ''}`}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                <span className="jc-payout" style={{ fontSize: 13 }}>{job.payout}</span>
            </div>
            <div className="jc-row2">
                <span className="jc-prop">{job.property}</span>
                <span className="jc-sep">·</span>
                <span className="jc-pm">{job.pm}</span>
                <span className="jc-sep">·</span>
                <span className={job.payStatus === 'paid' ? 'payout-paid' : 'payout-pending'}>
                    {job.payStatus === 'paid' ? '✓ Paid' : job.payStatus === 'pending' ? '⏳ Pending' : '—'}
                </span>
                {job.incident && <><span className="jc-sep">·</span><span className="jc-deadline urgent">⚠ {job.incident}</span></>}
            </div>
        </button>
    );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
    return <div className="jc-section-lbl" style={{ color }}>{children}</div>;
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
    return (
        <div className="jobs-empty">
            <div className="jobs-empty-ic">📭</div>
            <div className="jobs-empty-title">{title}</div>
            <div className="jobs-empty-sub">{sub}</div>
        </div>
    );
}