// apps/vendor-portal/src/pages/Jobs/JobsDrawers.tsx
import { useState } from 'react';
import {
    type IncomingJob, type ActiveJob, type CompletedJob, type HistoryJob, type MsgThread,
    getJobTypeBadge, badgeClass, getE4ReasonCodes, getReminderState, reminderCooldownRemaining,
    REMINDER_MAX, PM_TRUST, PM_CONTACT, formatGPS,
} from './types';
import './JobsDrawers.css';

type Toast = (msg: string, tone?: 'info' | 'success' | 'warn' | 'danger') => void;

type AnyJob = IncomingJob | ActiveJob | CompletedJob | HistoryJob;

function isIncoming(j: AnyJob): j is IncomingJob {
    return j.id.startsWith('i-');
}
function isActive(j: AnyJob): j is ActiveJob {
    return j.id.startsWith('a-');
}
function isCompleted(j: AnyJob): j is CompletedJob {
    return j.id.startsWith('c-');
}

/* ═══════════════ SHELL ═══════════════ */
function Shell({ onClose, header, children, footer }: {
    onClose: () => void;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
}) {
    return (
        <>
            <div className="jd-overlay open" onClick={onClose} />
            <aside className="jd-drawer open">
                <div className="jd-hdr">{header}</div>
                <div className="jd-body">{children}</div>
                {footer && <div className="jd-foot">{footer}</div>}
            </aside>
        </>
    );
}

function Header({ title, meta, onClose }: { title: string; meta: React.ReactNode; onClose: () => void }) {
    return (
        <div className="jd-hdr-row">
            <div className="jd-hdr-left">
                <div className="jd-title">{title}</div>
                <div className="jd-meta">{meta}</div>
            </div>
            <button className="jd-close" onClick={onClose}>✕</button>
        </div>
    );
}

/* ═══════════════ SHARED BLOCKS ═══════════════ */
function WhyYouBlock({ job }: { job: AnyJob }) {
    const reasons = getE4ReasonCodes(job as { dist?: string; pm?: string; type?: string; workflowClass?: string });
    if (!reasons.length) return null;
    return (
        <div className="ds-block">
            <div className="ds-block-title">Why You Received This</div>
            <div className="ds-block-body">
                {reasons.map((r, i) => (
                    <div key={i} className="why-row">
                        <span className={`why-icon ${r.positive ? 'pos' : 'neg'}`}>{r.positive ? '✔' : '−'}</span>
                        <span>{r.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PMTrustBlock({ pmName }: { pmName: string }) {
    const pm = PM_TRUST[pmName];
    if (!pm) return null;
    const scoreColor = pm.score >= 90 ? 'var(--emerald)' : pm.score >= 75 ? 'var(--blue)' : pm.score >= 60 ? 'var(--amber)' : 'var(--crimson)';
    const scoreLabel = pm.score >= 90 ? 'Excellent' : pm.score >= 75 ? 'Solid' : pm.score >= 60 ? 'Watch' : 'Risk';
    const payColor = pm.paymentSpeedDays <= 2 ? 'var(--emerald)' : pm.paymentSpeedDays <= 3.5 ? 'var(--amber)' : 'var(--crimson)';
    return (
        <div className="ds-block">
            <div className="ds-block-title">PM Payment Score</div>
            <div className="ds-block-body">
                <div className="pm-score-row">
                    <span className="pm-score-num" style={{ color: scoreColor }}>{pm.score}</span>
                    <span className="pm-score-tag" style={{ color: scoreColor, background: `${scoreColor.replace('var(', '').replace(')', '-dim)')}` }}>{scoreLabel}</span>
                </div>
                <div className="kv-line"><span>Avg payment time</span><span style={{ color: payColor }}>{pm.paymentSpeedDays} days</span></div>
                <div className="kv-line"><span>Approval speed</span><span>{pm.approvalSpeedLabel}</span></div>
                <div className="kv-line"><span>Disputes on prior jobs</span><span style={{ color: pm.disputeCount > 0 ? 'var(--amber)' : 'var(--emerald)' }}>{pm.disputeCount > 0 ? `${pm.disputeCount} raised` : 'None'}</span></div>
            </div>
        </div>
    );
}

function AccessBlock({ job }: { job: AnyJob }) {
    const anyJ = job as { gateCode?: string; lockBox?: string; parking?: string; address?: string };
    return (
        <div className="ds-block">
            <div className="ds-block-title">Access</div>
            <div className="access-block">
                {anyJ.address && <div className="acc-row"><span className="acc-lbl">Address</span><span className="acc-val">{anyJ.address}</span></div>}
                {anyJ.gateCode && <div className="acc-row"><span className="acc-lbl">Gate Code</span><span className="acc-val code">{anyJ.gateCode}</span></div>}
                {anyJ.lockBox && <div className="acc-row"><span className="acc-lbl">Lock Box</span><span className="acc-val code">{anyJ.lockBox}</span></div>}
                {anyJ.parking && <div className="acc-row"><span className="acc-lbl">Parking</span><span className="acc-val">{anyJ.parking}</span></div>}
            </div>
        </div>
    );
}

function TimelineBlock({ timeline }: { timeline: { event: string; time: string; state: 'ok' | 'pending' | 'warn'; gps?: unknown }[] }) {
    if (!timeline?.length) return null;
    return (
        <div className="ds-block">
            <div className="ds-block-title">Activity Log</div>
            <div className="ds-block-body">
                {timeline.map((t, i) => (
                    <div key={i} className="tl-item">
                        <div className="tl-col">
                            <div className={`tl-dot ${t.state}`} />
                            {i < timeline.length - 1 && <div className="tl-line" />}
                        </div>
                        <div>
                            <div className="tl-event">{t.event}</div>
                            {t.time && <div className="tl-time">{t.time}</div>}
                            {Boolean(t.gps) && <div className="tl-time is-gps">📍 {String(formatGPS(t.gps as never))}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════ MAIN DRAWER ROUTER ═══════════════ */
export function JobDrawer({
    job, onClose, showToast, msgThreads, setMsgThreads,
    onAccept, onDecline, onPause, onCall,
}: {
    job: AnyJob;
    onClose: () => void;
    showToast: Toast;
    msgThreads: Record<string, MsgThread[]>;
    setMsgThreads: React.Dispatch<React.SetStateAction<Record<string, MsgThread[]>>>;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    onPause: (id: string) => void;
    onCall: (id: string) => void;
}) {
    if (isIncoming(job)) return <IncomingDrawer job={job} onClose={onClose} showToast={showToast} onAccept={onAccept} onDecline={onDecline} />;
    if (isActive(job)) return <ActiveDrawer job={job} onClose={onClose} showToast={showToast} onPause={onPause} onCall={onCall} msgThreads={msgThreads} setMsgThreads={setMsgThreads} />;
    if (isCompleted(job)) return <CompletedDrawer job={job} onClose={onClose} showToast={showToast} />;
    return <HistoryDrawer job={job as HistoryJob} onClose={onClose} />;
}

/* ═══════════════ INCOMING ═══════════════ */
function IncomingDrawer({ job, onClose, showToast, onAccept, onDecline }: {
    job: IncomingJob; onClose: () => void; showToast: Toast;
    onAccept: (id: string) => void; onDecline: (id: string) => void;
}) {
    const isEmg = job.type === 'emg';
    const isEstimate = job.isEstimate;
    const isAssessment = job.isAssessment;
    const badgeLabel = getJobTypeBadge(job);

    return (
        <Shell onClose={onClose}
            header={<Header title={job.title} meta={
                <>
                    <span className={`jt-badge ${badgeClass(badgeLabel)}`}>{badgeLabel}</span>
                    <span className="jd-prop">{job.property} · {job.city}</span>
                    {job.payout != null && <span className="jd-payout">${job.payout}</span>}
                </>
            } onClose={onClose} />}
            footer={
                isEmg ? (
                    <>
                        <button className="btn-prim crimson" onClick={() => { onAccept(job.id); onClose(); }}>⚡ Accept Job</button>
                        <button className="btn-sec" onClick={onClose}>Decline</button>
                    </>
                ) : isAssessment ? (
                    <>
                        <button className="btn-prim purple" onClick={() => { showToast('Assessment accepted · Inspect and submit findings', 'success'); onAccept(job.id); onClose(); }}>✓ Accept &amp; Commit to SLA</button>
                        <button className="btn-sec" onClick={() => onDecline(job.id)}>Decline</button>
                    </>
                ) : isEstimate ? (
                    <>
                        <button className="btn-prim gold" onClick={() => showToast('Quote submission drawer — coming soon', 'info')}>📋 Submit Quote</button>
                        <button className="btn-sec" onClick={onClose}>Cancel</button>
                    </>
                ) : (
                    <>
                        <button className="btn-prim" onClick={() => { onAccept(job.id); onClose(); }}>✓ Accept Job</button>
                        <button className="btn-sec" onClick={() => onDecline(job.id)}>Decline</button>
                    </>
                )
            }
        >
            <div className="jd-sec">
                <div className="jd-sec-title">Job Details</div>
                <div className="access-block">
                    <div className="acc-row"><span className="acc-lbl">Address</span><span className="acc-val">{job.address ?? `${job.property}, ${job.city}`}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Property</span><span className="acc-val">{job.property}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Distance</span><span className="acc-val">{job.dist}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Trade</span><span className="acc-val">{job.trade}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Workflow</span><span className="acc-val">{job.workflowClass}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Scheduled</span><span className="acc-val">{job.time}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Duration</span><span className="acc-val">{job.dur}</span></div>
                    <div className="acc-row"><span className="acc-lbl">PM</span><span className="acc-val">{job.pm}</span></div>
                </div>
            </div>

            <div className="jd-sec">
                <div className="jd-sec-title">Issue &amp; Scope</div>
                <p className="jd-text">{job.issue}</p>
                <p className="jd-text-muted">{job.scope}</p>
            </div>

            <AccessBlock job={job} />

            {isEmg && (
                <div className="ds-block">
                    <div className="ds-block-title">Emergency Pay</div>
                    <div className="pay-grid">
                        <div className="pay-blk"><div className="pay-lbl">Base Pay</div><div className="pay-val gold">${job.payBase}</div></div>
                        <div className="pay-blk"><div className="pay-lbl">Urgency Bonus</div><div className="pay-val grn">+${job.payBonus}</div></div>
                        <div className="pay-blk"><div className="pay-lbl">Total</div><div className="pay-val gold">${job.payout}</div></div>
                    </div>
                </div>
            )}

            {isAssessment && (
                <div className="ds-block">
                    <div className="ds-block-title">Assessment Fee</div>
                    <div className="ds-block-body">
                        <div className="kv-line"><span>{job.assessmentFeeNote ?? 'Paid upon completion'}</span><span className="gold">${job.assessmentFee ?? '—'}</span></div>
                    </div>
                </div>
            )}

            <WhyYouBlock job={job} />
            <PMTrustBlock pmName={job.pm} />
        </Shell>
    );
}

/* ═══════════════ ACTIVE ═══════════════ */
function ActiveDrawer({ job, onClose, showToast, onPause, onCall, msgThreads, setMsgThreads }: {
    job: ActiveJob; onClose: () => void; showToast: Toast;
    onPause: (id: string) => void; onCall: (id: string) => void;
    msgThreads: Record<string, MsgThread[]>;
    setMsgThreads: React.Dispatch<React.SetStateAction<Record<string, MsgThread[]>>>;
}) {
    const [msg, setMsg] = useState('');
    const isRework = job.status === 'rework-required';
    const isResume = job.status === 'resume-requested';
    const isAssessmentJob = job.isAssessment;

    const thread = msgThreads[job.id] ?? [];

    const sendMsg = () => {
        if (!msg.trim()) return;
        setMsgThreads((prev) => ({
            ...prev,
            [job.id]: [...(prev[job.id] ?? []), { from: 'vendor', text: msg.trim(), time: 'Just now' }],
        }));
        setMsg('');
        showToast('Message sent · Logged to task', 'success');
    };

    return (
        <Shell onClose={onClose}
            header={<Header title={job.title} meta={
                <>
                    <span className={`jt-badge ${badgeClass(getJobTypeBadge(job))}`}>{getJobTypeBadge(job)}</span>
                    <span className={`chip chip-${job.status}`}>{job.status.replace('-', ' ').toUpperCase()}</span>
                    <span className="jd-prop">{job.property} · {job.city}</span>
                    <span className="jd-payout">${job.payout}</span>
                </>
            } onClose={onClose} />}
            footer={
                <>
                    <button className="btn-prim" onClick={() => showToast('Job marked in progress', 'success')}>Open Job →</button>
                    <button className="btn-sec" onClick={() => onPause(job.id)}>🔒 Pause</button>
                </>
            }
        >
            {isRework && (
                <div className="ds-block">
                    <div className="ds-block-title">What Needs Fixing · Cycle {job.reworkCount}/2</div>
                    <div className="ds-block-body">
                        <div className="kv-line"><span>Issue Type</span><span style={{ color: 'var(--amber)' }}>{job.reworkReason}</span></div>
                        <div className="kv-line"><span>Affected Area</span><span>{job.reworkAffectedArea}</span></div>
                        {job.reworkReference && <div className="kv-line"><span>Reference</span><span>{job.reworkReference}</span></div>}
                        <div className="jd-text">{job.reworkNotes}</div>
                        <div className="kv-line"><span>Deadline</span><span style={{ color: 'var(--amber)' }}>{job.reworkDeadline}</span></div>
                    </div>
                </div>
            )}

            {isResume && (
                <div className="ds-block">
                    <div className="ds-block-title">Paused — Waiting on PM</div>
                    <div className="ds-block-body">
                        <div className="jd-text">{job.pauseReason}</div>
                    </div>
                </div>
            )}

            {isAssessmentJob && (
                <div className="ds-block">
                    <div className="ds-block-title">Assessment</div>
                    <div className="ds-block-body">
                        <div className="kv-line"><span>Status</span><span>{job.assessmentStatus}</span></div>
                        {job.quoteAmount != null && <div className="kv-line"><span>Quote</span><span className="gold">${job.quoteAmount}</span></div>}
                        {job.quoteScope && <div className="jd-text">{job.quoteScope}</div>}
                        {job.findings && <div className="jd-text-muted">{job.findings}</div>}
                    </div>
                </div>
            )}

            {!isRework && !isResume && !isAssessmentJob && job.issue && (
                <div className="jd-sec">
                    <div className="jd-sec-title">Scope (read-only)</div>
                    <div className="jd-text">{job.issue}</div>
                    {job.scope && <div className="jd-text-muted">{job.scope}</div>}
                </div>
            )}

            <AccessBlock job={job} />

            {job.checklist.length > 0 && (
                <div className="ds-block">
                    <div className="ds-block-title">Checklist · {job.checklist.filter((c) => c.done).length}/{job.checklist.length}</div>
                    <div className="ds-block-body">
                        {job.checklist.map((c, i) => (
                            <div key={i} className="ck-item">
                                <div className={`ck-box ${c.done ? 'chk' : ''}`} />
                                <span className={`ck-lbl ${c.done ? 'done' : ''}`}>{c.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <TimelineBlock timeline={job.timeline} />

            <div className="ds-block">
                <div className="ds-block-title">PM Contact</div>
                <div className="ds-block-body">
                    <div className="jd-text">{job.pm}</div>
                    <div className="msg-thread">
                        {thread.length === 0 && <div className="msg-empty">No messages yet.</div>}
                        {thread.map((m, i) => (
                            <div key={i} className={`msg-bubble ${m.from}`}>
                                <div className="msg-from">{m.from === 'vendor' ? 'You' : 'PM'}</div>
                                <div className="msg-text">{m.text}</div>
                                <div className="msg-time">{m.time}</div>
                            </div>
                        ))}
                    </div>
                    <div className="msg-input-row">
                        <input
                            className="msg-input"
                            placeholder="Type message…"
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') sendMsg(); }}
                        />
                        <button className="msg-send" onClick={sendMsg}>➞</button>
                        <button className="msg-call" onClick={() => onCall(job.id)}>📞</button>
                    </div>
                </div>
            </div>
        </Shell>
    );
}

/* ═══════════════ COMPLETED ═══════════════ */
function CompletedDrawer({ job, onClose, showToast }: {
    job: CompletedJob; onClose: () => void; showToast: Toast;
}) {
    const rState = getReminderState(job);
    const rCount = job.reminderCount;
    const isAwaiting = job.payStatus === 'awaiting-payment';
    const isRecorded = job.payStatus === 'payment-sent';
    const isDisputed = job.payStatus === 'payment-disputed';

    return (
        <Shell onClose={onClose}
            header={<Header title={job.title} meta={
                <>
                    <span className="chip chip-verified">✓ PM Verified</span>
                    <span className={`chip ${isAwaiting ? 'chip-quote-rejected' : isRecorded ? 'chip-quote-pending' : isDisputed ? 'chip-blocked' : ''}`}>
                        {isAwaiting ? 'Awaiting Payment' : isRecorded ? 'Payment Recorded' : isDisputed ? 'Disputed' : 'Pending'}
                    </span>
                    <span className="jd-prop">{job.property} · {job.date}</span>
                    <span className="jd-payout">{job.payout}</span>
                </>
            } onClose={onClose} />}
            footer={
                isAwaiting ? (
                    <>
                        <button className="btn-prim" disabled={rState !== 'can_send'} onClick={() => showToast('Reminder sent', 'success')}>
                            {rState === 'can_send' ? `Remind PM${rCount > 0 ? ` (${rCount}/${REMINDER_MAX})` : ''}` : rState === 'cooldown' ? `Remind PM · ${reminderCooldownRemaining(job)}` : '⚠ Escalated'}
                        </button>
                        <button className="btn-sec" onClick={onClose}>Close</button>
                    </>
                ) : isRecorded ? (
                    <>
                        <button className="btn-prim emerald" onClick={() => { showToast('Payment confirmed', 'success'); onClose(); }}>✓ Confirm Full Payment</button>
                        <button className="btn-sec" onClick={() => showToast('Opening issue report…', 'info')}>⚠ Report Issue</button>
                    </>
                ) : (
                    <>
                        <button className="btn-prim emerald" onClick={() => { showToast('Marked as received', 'success'); onClose(); }}>Mark as Received</button>
                        <button className="btn-sec" onClick={onClose}>Close</button>
                    </>
                )
            }
        >
            <div className="jd-sec">
                <div className="jd-sec-title">Job Summary</div>
                <div className="access-block">
                    <div className="acc-row"><span className="acc-lbl">Property</span><span className="acc-val">{job.property}</span></div>
                    <div className="acc-row"><span className="acc-lbl">PM</span><span className="acc-val">{job.pm}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Completed</span><span className="acc-val">{job.date} · {job.completedAt}</span></div>
                    <div className="acc-row"><span className="acc-lbl">PM Verified</span><span className="acc-val emerald">{job.date} · {job.verifiedAt}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Amount</span><span className="acc-val gold">{job.payout}</span></div>
                </div>
            </div>

            <div className="jd-sec">
                <div className="jd-sec-title">Payment</div>
                <div className="jd-text-muted">
                    Payments are handled outside Lookara. This system records only.
                    {rCount > 0 && <><br />Reminder sent {rCount}/{REMINDER_MAX}</>}
                </div>
            </div>
        </Shell>
    );
}

/* ═══════════════ HISTORY ═══════════════ */
function HistoryDrawer({ job, onClose }: { job: HistoryJob; onClose: () => void }) {
    return (
        <Shell onClose={onClose}
            header={<Header title={job.title} meta={
                <>
                    <span className={`chip chip-${job.status}`}>{job.status}</span>
                    <span className="jd-prop">{job.property} · {job.date}</span>
                    <span className="jd-payout">{job.payout}</span>
                </>
            } onClose={onClose} />}
            footer={<button className="btn-sec full" onClick={onClose}>Close</button>}
        >
            <div className="jd-sec">
                <div className="jd-sec-title">Summary</div>
                <div className="access-block">
                    <div className="acc-row"><span className="acc-lbl">Property</span><span className="acc-val">{job.property}</span></div>
                    <div className="acc-row"><span className="acc-lbl">PM</span><span className="acc-val">{job.pm}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Date</span><span className="acc-val">{job.date}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Status</span><span className="acc-val">{job.status}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Payout</span><span className="acc-val gold">{job.payout}</span></div>
                    <div className="acc-row"><span className="acc-lbl">Pay Status</span><span className="acc-val">{job.payStatus}</span></div>
                </div>
            </div>

            {job.incident && (
                <div className="ds-block is-crimson">
                    <div className="ds-block-title">Incident Note</div>
                    <div className="ds-block-body">⚠ {job.incident}</div>
                </div>
            )}
        </Shell>
    );
}

/* ═══════════════ MODALS ═══════════════ */
export function DeclineModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
    const [reason, setReason] = useState('');
    const reasons = ['📍 Too far away', '📅 Schedule conflict', '🔧 Not my specialty', '💼 Fully booked', '💲 Low payout', '📋 Other'];
    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-title">Decline This Job?</div>
                <div className="modal-sub">Select a reason — helps us route better offers to you.</div>
                <div className="reason-grid">
                    {reasons.map((r) => (
                        <button key={r} className={`reason-btn ${reason === r ? 'sel' : ''}`} onClick={() => setReason(r)}>{r}</button>
                    ))}
                </div>
                <div className="modal-actions">
                    <button className="modal-confirm" onClick={onConfirm}>Confirm Decline</button>
                    <button className="modal-cancel" onClick={onClose}>Keep Offer</button>
                </div>
            </div>
        </div>
    );
}

export function PauseModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (reason: string, notes: string) => void }) {
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const reasons = ['📦 Missing materials', '🔧 Tool malfunction', '🚪 Access issue', '🌩️ Weather', '🩹 Injury / safety', '📋 Other'];
    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-title">Pause This Job?</div>
                <div className="modal-sub">The PM must authorize before you can resume.</div>
                <div className="reason-grid">
                    {reasons.map((r) => (
                        <button key={r} className={`reason-btn ${reason === r ? 'sel' : ''}`} onClick={() => setReason(r)}>{r}</button>
                    ))}
                </div>
                <textarea className="modal-input" placeholder="Add detail for the PM (optional)…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <div className="modal-actions">
                    <button className="modal-confirm" onClick={() => reason && onConfirm(reason, notes)}>Request to Pause</button>
                    <button className="modal-cancel" onClick={onClose}>Keep Working</button>
                </div>
            </div>
        </div>
    );
}

export function CallModal({ jobId: _jobId, job, onClose }: { jobId: string; job: AnyJob | null; onClose: () => void }) {
    if (!job) return null;
    const contact = PM_CONTACT[(job as { pm?: string }).pm ?? ''];
    const phone = contact?.phone ?? '';
    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="call-modal" onClick={(e) => e.stopPropagation()}>
                <div className="call-modal-lbl">Call PM</div>
                <div className="call-modal-pm">{(job as { pm?: string }).pm}</div>
                <div className="call-modal-phone">{phone}</div>
                <div className="call-modal-note">Active job coordination only. All interactions logged.</div>
                <div className="call-modal-actions">
                    <a className="call-modal-btn" href={`tel:${phone.replace(/\D/g, '')}`}>📞 Call</a>
                    <button className="call-modal-cancel" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}