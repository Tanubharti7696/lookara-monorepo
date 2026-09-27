// apps/vendor-portal/src/pages/Jobs/Jobs.tsx
import { useMemo, useState } from 'react';
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

/* ── DATA (seed) — matches the original prototype ── */
const INCOMING_SEED: IncomingJob[] = [
    {
        id: 'i-001', taskId: 'TSK-9001', workflowClass: 'Emergency', trade: 'Pool & Water Systems',
        type: 'emg', priority: 'CRITICAL', title: 'Water Leak — Emergency Response',
        property: 'Seaside Villa', address: '2210 Seaside Ct, Kissimmee FL 34741',
        city: 'Kissimmee, FL', dist: '2.1 mi SW', pm: 'Coastal STR Management',
        jobType: 'Plumbing Emergency', time: 'ASAP', dur: 'Est. 45–90 min', payout: 225,
        deadline: '01:42', deadlineClass: 'urgent', access: true, competitors: 4,
        issue: 'Active water leak reported in pool equipment bay. Guest on site. Immediate response required.',
        scope: 'Assess leak source · Shut off supply if needed · Document with photos · Notify PM on arrival',
        gateCode: '6612#', lockBox: 'Front entrance · 3390', parking: 'Street, front gate',
        payBase: 185, payBonus: 40,
    },
    {
        id: 'i-002', taskId: 'TSK-9002', workflowClass: 'Inspection', trade: 'Pool & Water Systems',
        type: 'new', priority: 'HIGH', priorityLevel: 'HIGH',
        title: 'Pump Inspection & Pressure Test', property: 'Palm Ridge',
        address: '7745 Palm Ridge Rd, Kissimmee FL 34746', city: 'Kissimmee, FL', dist: '8.1 mi NE',
        pm: 'Coastal STR Management', jobType: 'Inspection', time: 'Today 10:00 AM', dur: 'Est. 60 min',
        payout: 120, deadline: 'Respond within 12 min', deadlineClass: 'warn', access: true,
        issue: 'Routine pump inspection required before guest arrival at 2 PM. Pressure test and chemical check included.',
        scope: 'Inspect pump condition · Pressure test · Chemical check · Report findings',
        gateCode: '4821#', lockBox: 'Side gate · 7731', parking: 'Driveway',
    },
    {
        id: 'i-003', taskId: 'TSK-9003', workflowClass: 'Recurring / Scheduled', trade: 'Pool & Water Systems',
        type: 'expiring', priority: 'NORMAL', priorityLevel: 'NORMAL',
        title: 'Weekly Chemical Balance & Brush', property: 'Sunset Palms',
        address: '910 Sunset Palms Ave, Orlando FL 32827', city: 'Orlando, FL', dist: '11.4 mi SE',
        pm: 'SunState Rentals', jobType: 'Maintenance', time: 'Tomorrow 8:00 AM', dur: 'Est. 45 min',
        payout: 85, deadline: 'Expires in 4 hrs', deadlineClass: 'warn', access: true,
        issue: 'Standard weekly pool maintenance. No special conditions reported.',
        scope: 'Test and balance chemicals · Brush walls and floor · Skim surface · Clean basket',
        gateCode: '2209#', lockBox: 'Pool shed · 4410', parking: 'Street',
    },
    {
        id: 'i-004', taskId: 'TSK-9004', workflowClass: 'Assessment / Quote Required', trade: 'Pool & Water Systems',
        type: 'estimate', priority: 'NORMAL', priorityLevel: 'NORMAL', isEstimate: true,
        title: 'Pump System Overhaul', property: 'Lakewood Villa',
        address: '640 Lakewood Dr, Lake Nona FL 32827', city: 'Lake Nona, FL', dist: '5.9 mi SE',
        pm: 'Coastal STR Management', jobType: 'Repair', time: 'Flexible — quote required',
        dur: 'Est. 3–4 hrs', payout: null, deadline: null, deadlineClass: '', access: true,
        issue: 'Pump system showing reduced pressure. Full inspection needed before scope of work can be determined. Vendor must submit quote prior to starting work.',
        scope: 'Inspect pump and motor · Identify fault · Submit quote for PM approval · Begin work after approval',
        gateCode: '8812#', lockBox: 'Pump shed · 4410', parking: 'Driveway',
        estimateStatus: null,
    },
    {
        id: 'i-005', taskId: 'TSK-9005', workflowClass: 'Assessment / Quote Required', trade: 'Pool & Water Systems',
        type: 'assessment', priority: 'NORMAL', priorityLevel: 'NORMAL', isAssessment: true,
        title: 'Unknown Pool Leak', property: 'Seaside Villa',
        address: '2245 Seaside Ct, Orlando FL 32819', city: 'Orlando, FL', dist: '3.2 mi NW',
        pm: 'Coastal STR Management', jobType: 'Assessment', time: 'Flexible',
        dur: 'Est. 45–90 min', payout: null, deadline: null, deadlineClass: '', access: true,
        issue: 'Guest reported water loss in pool area. Source unknown. Full assessment required before any repair work can begin.',
        scope: 'Inspect pool structure and equipment · Document findings with photos · Identify root cause · Submit quote',
        gateCode: '7743#', lockBox: 'Front gate · 2291', parking: 'Street',
        assessmentStatus: null, slaRespond: '10 min', slaComplete: '4 hours', slaStatus: 'on_track',
        assessmentFee: 75, assessmentFeeNote: 'Paid upon completion, regardless of repair outcome',
        detectedVia: 'Incident Report',
        riskFlags: ['Unknown scope', 'Potential equipment failure'],
        quoteRequirements: ['Labor cost', 'Materials estimate', 'Time estimate'],
    },
];

const ACTIVE_SEED: ActiveJob[] = [
    {
        id: 'a-001', taskId: 'TSK-9101', workflowClass: 'Standard Repair', trade: 'Pool & Water Systems',
        status: 'in-progress', priority: 'HIGH', title: 'Pool Filter Replacement + Chemical Balance',
        issue: 'Pool filter showing signs of wear and reduced flow. PM requested replacement and chemical rebalance during today\'s service window.',
        scope: 'Inspect current filter condition · Remove and replace cartridge filter · Test chemical levels (pH + Chlorine) · Balance and treat if needed · Run system test — pump + circulation · Upload completion photos',
        instructions: 'Gate code and lock box below. Pool area is accessible from the side gate — no need to enter the unit. Log pH/chlorine readings before and after treatment in completion notes.',
        property: 'Sunset Villa', city: 'Orlando, FL', dist: '6.3 mi NE',
        pm: 'SunState Rentals', jobType: 'Repair',
        time: '08:30 AM', dur: '2h window', payout: 85, step: 3, totalSteps: 5,
        onTime: 'Running on time', onTimeClass: 'ok',
        address: '1421 Sunset Blvd, Orlando FL 32801',
        gateCode: '4821#', lockBox: 'Side gate · 7731', parking: 'Street, pool gate entrance',
        checklist: [
            { done: true, text: 'Inspect current filter condition' },
            { done: true, text: 'Remove and replace cartridge filter' },
            { done: false, text: 'Test chemical levels — pH + Chlorine' },
            { done: false, text: 'Balance and treat if needed' },
            { done: false, text: 'Run system test — pump + circulation' },
            { done: false, text: 'Upload completion photos' },
        ],
        timeline: [
            { event: 'Job accepted', time: '08:12 AM', state: 'ok' },
            { event: 'En route', time: '08:20 AM', state: 'ok' },
            { event: 'On site', time: '08:34 AM', state: 'ok' },
            { event: 'Checklist started', time: '08:41 AM', state: 'ok' },
            { event: 'Completion pending', time: '—', state: 'pending' },
        ],
        beforePhotos: [], afterPhotos: [], materialsUsed: [],
    },
    {
        id: 'a-002', taskId: 'TSK-9102', pmTaskId: 'TSK-0214',
        workflowClass: 'Recurring / Scheduled', trade: 'Pool & Water Systems',
        status: 'accepted', priority: 'NORMAL', title: 'Filter Cleaning & Algae Treatment',
        issue: 'Weekly filter cleaning and algae treatment per the property\'s recurring pool service contract.',
        scope: 'Inspect filter for algae buildup · Clean and backwash filter · Apply algae treatment dose · Test and balance water chemistry',
        property: 'Park Cove Retreat', city: 'Windermere, FL', dist: '14.2 mi SW',
        pm: 'Premier Stays', jobType: 'Maintenance',
        time: '01:00 PM', scheduledTime: 'Scheduled 01:00 PM', startsInMin: 32, dur: '1h window',
        payout: 110, step: 0, totalSteps: 4, onTime: null, onTimeClass: 'ok',
        address: '88 Lakeview Dr, Windermere FL 34786',
        gateCode: '9934#', lockBox: 'Rear gate · 1122', parking: 'Driveway permitted',
        checklist: [
            { done: false, text: 'Inspect filter for algae buildup' },
            { done: false, text: 'Clean and backwash filter' },
            { done: false, text: 'Apply algae treatment dose' },
            { done: false, text: 'Test and balance water chemistry' },
        ],
        timeline: [
            { event: 'Job accepted', time: 'Yesterday 4:12 PM', state: 'ok' },
            { event: 'Scheduled 1:00 PM today', time: '', state: 'pending' },
        ],
        beforePhotos: [], afterPhotos: [], materialsUsed: [],
    },
    {
        id: 'a-rw1', taskId: 'TSK-9103', workflowClass: 'Standard Repair', trade: 'Pool & Water Systems',
        status: 'rework-required', priority: 'HIGH', jobType: 'Repair',
        title: 'Pool Filter Replacement + Chemical Balance',
        property: 'Sunset Villa', city: 'Orlando, FL', dist: '6.3 mi NE',
        pm: 'SunState Rentals', payout: 85, time: 'Mar 21', dur: 'Est. 45 min',
        address: '1421 Sunset Blvd, Orlando FL 32801',
        gateCode: '4821#', lockBox: 'Side gate · 7731', parking: 'Street, pool gate entrance',
        step: 0, totalSteps: 6, onTime: null, onTimeClass: 'ok',
        reworkCount: 1, reworkReason: 'Missed Area', reworkAffectedArea: 'Upper filter housing',
        reworkReference: 'Photo #2 highlighted by PM',
        reworkNotes: 'Upper filter housing was not cleaned. Residue visible in photo #2. Please re-clean, run a wipe test, and resubmit photos showing the corrected area.',
        reworkRequestedAt: 'Mar 21 · 2:30 PM', reworkDeadline: '24 hours',
        reworkSlaHoursLeft: 22, reworkSlaMinLeft: 14, reworkSlaStatus: 'on_track',
        reworkStarted: false, previousSubmittedAt: 'Mar 21 · 11:45 AM', _reworkPhotosCount: 0,
        checklist: [
            { done: true, text: 'Inspect current filter condition' },
            { done: true, text: 'Remove and replace cartridge filter' },
            { done: true, text: 'Test chemical levels — pH + Chlorine' },
            { done: true, text: 'Balance and treat if needed' },
            { done: true, text: 'Run system test — pump + circulation' },
            { done: true, text: 'Upload completion photos' },
        ],
        timeline: [
            { event: 'Job accepted', time: 'Mar 21 · 7:30 AM', state: 'ok' },
            { event: 'En route', time: 'Mar 21 · 8:20 AM', state: 'ok' },
            { event: 'On site', time: 'Mar 21 · 8:34 AM', state: 'ok' },
            { event: 'Work completed', time: 'Mar 21 · 11:40 AM', state: 'ok' },
            { event: 'Completion submitted', time: 'Mar 21 · 11:45 AM', state: 'ok' },
            { event: 'PM requested rework — Missed Area · Upper filter housing', time: 'Mar 21 · 2:30 PM', state: 'warn' },
        ],
        beforePhotos: [], afterPhotos: [], materialsUsed: [],
    },
    {
        id: 'a-rr1', taskId: 'TSK-9105', workflowClass: 'Standard Repair', trade: 'HVAC',
        status: 'resume-requested', priority: 'NORMAL', jobType: 'Repair',
        title: 'AC Compressor Repair', property: 'Lakeview Manor',
        city: 'Orlando, FL', dist: '9.8 mi SE', pm: 'Premier Stays',
        payout: 145, time: 'Mar 22', dur: 'Est. 2 hrs',
        address: '44 Lakeview Dr, Orlando FL 34786',
        gateCode: '6612#', lockBox: 'Side door · 2290', parking: 'Driveway',
        step: 1, totalSteps: 4, onTime: null, onTimeClass: 'ok',
        pauseIssueType: '📦 Missing materials',
        pauseReason: 'Replacement compressor capacitor not on the truck. Nearest supply house closes at 6 PM — requesting authorization to source it and resume tomorrow morning instead.',
        pauseRequestedAt: 'Mar 22 · 11:22 AM',
        checklist: [
            { done: true, text: 'Diagnose compressor issue' },
            { done: false, text: 'Replace compressor capacitor' },
            { done: false, text: 'Test system — cooling cycle' },
            { done: false, text: 'Upload completion photos' },
        ],
        timeline: [
            { event: 'Job accepted', time: 'Mar 22 · 9:40 AM', state: 'ok' },
            { event: 'On site — began diagnostics', time: 'Mar 22 · 9:52 AM', state: 'ok' },
            { event: 'Issue found — missing part', time: 'Mar 22 · 11:20 AM', state: 'warn' },
            { event: 'Requested authorization to resume', time: 'Mar 22 · 11:22 AM', state: 'warn' },
        ],
        beforePhotos: [], afterPhotos: [], materialsUsed: [],
    },
    {
        id: 'a-asmnt-1', taskId: 'TSK-9104', workflowClass: 'Assessment / Quote Required', trade: 'Pool & Water Systems',
        status: 'quote-pending', priority: 'NORMAL', jobType: 'Assessment', isAssessment: true,
        title: 'Unknown Pool Leak', property: 'Bayfront Lodge',
        city: 'Orlando, FL', dist: '4.1 mi NE', pm: 'Coastal STR Management',
        time: 'Submitted Mar 21 · 9:45 AM', dur: 'Est. 2–3 hrs', payout: null,
        address: '320 Bay Dr, Orlando FL 32801',
        gateCode: '5521#', lockBox: 'Pool shed · 3310', parking: 'Driveway',
        step: 0, totalSteps: 0, onTime: null, onTimeClass: 'ok',
        assessmentStatus: 'submitted', quoteAmount: 420,
        quoteScope: 'Replace inlet valve + patch liner seam + full pressure test',
        quoteTime: '2–3 hours', quoteSubmittedAt: 'Mar 21 · 9:45 AM',
        quoteRejectedReason: null, revisionCount: 0,
        findings: 'Water loss approximately 2 inches per day. Hairline crack found near main inlet valve. Liner seam separation also detected at NE corner.',
        checklist: [], timeline: [], beforePhotos: [], afterPhotos: [], materialsUsed: [],
    },
    {
        id: 'a-asmnt-2', taskId: 'TSK-9105b', workflowClass: 'Assessment / Quote Required', trade: 'Pool & Water Systems',
        status: 'approved', priority: 'NORMAL', jobType: 'Assessment', isAssessment: true,
        title: 'Pump Motor Failure', property: 'Sunset Palms',
        city: 'Orlando, FL', dist: '7.3 mi SE', pm: 'SunState Rentals',
        time: 'Approved Mar 20 · 3:12 PM', dur: 'Est. 3 hrs', payout: 680,
        address: '91 Palm Ave, Orlando FL 32819',
        gateCode: '4401#', lockBox: 'Equipment bay · 7744', parking: 'Street',
        step: 0, totalSteps: 4, onTime: null, onTimeClass: 'ok',
        assessmentStatus: 'approved', quoteAmount: 680,
        quoteScope: 'Replace pump motor + seal kit + rewire control board',
        quoteTime: '3 hours', quoteSubmittedAt: 'Mar 20 · 11:00 AM',
        quoteApprovedAt: 'Mar 20 · 3:12 PM', quoteRejectedReason: null, revisionCount: 0,
        findings: 'Pump motor seized — bearing failure. Control board shows burn marks. Full replacement required.',
        checklist: [
            { done: false, text: 'Remove failed pump motor' },
            { done: false, text: 'Install replacement motor + seal kit' },
            { done: false, text: 'Rewire control board' },
            { done: false, text: 'Run system test — confirm full operation' },
        ],
        timeline: [
            { event: 'Assessment accepted', time: 'Mar 19 · 2:00 PM', state: 'ok' },
            { event: 'Findings + quote submitted', time: 'Mar 20 · 11:00 AM', state: 'ok' },
            { event: 'PM approved quote', time: 'Mar 20 · 3:12 PM', state: 'ok' },
            { event: 'Work pending start', time: '', state: 'pending' },
        ],
        beforePhotos: [], afterPhotos: [], materialsUsed: [],
    },
    {
        id: 'a-asmnt-3', taskId: 'TSK-9106', workflowClass: 'Assessment / Quote Required', trade: 'Pool & Water Systems',
        status: 'quote-rejected', priority: 'NORMAL', jobType: 'Assessment', isAssessment: true,
        title: 'Deck Crack Investigation', property: 'Marina Cove',
        city: 'Orlando, FL', dist: '6.8 mi NW', pm: 'Premier Stays',
        time: 'Rejected Mar 21 · 10:30 AM', dur: 'Est. 2 hrs', payout: null,
        address: '14 Marina Blvd, Orlando FL 32806',
        gateCode: '3301#', lockBox: 'Side gate · 9910', parking: 'Driveway',
        step: 0, totalSteps: 0, onTime: null, onTimeClass: 'ok',
        assessmentStatus: 'rejected', quoteAmount: 580,
        quoteScope: 'Resurface deck + fill hairline cracks + apply sealant',
        quoteTime: '2 hours', quoteSubmittedAt: 'Mar 21 · 8:00 AM',
        quoteRejectedReason: 'Too high — please revise. Budget cap is $400.',
        revisionCount: 0,
        findings: 'Three hairline cracks along NE deck edge. Surface delamination visible near drain.',
        checklist: [], timeline: [
            { event: 'Assessment accepted', time: 'Mar 20 · 9:00 AM', state: 'ok' },
            { event: 'Findings + quote submitted ($580)', time: 'Mar 21 · 8:00 AM', state: 'ok' },
            { event: 'PM rejected quote', time: 'Mar 21 · 10:30 AM', state: 'warn' },
        ],
        beforePhotos: [], afterPhotos: [], materialsUsed: [],
    },
];

const COMPLETED_SEED: CompletedJob[] = [
    {
        id: 'c-001', taskId: 'TSK-9301', workflowClass: 'Emergency', trade: 'Pool & Water Systems',
        date: 'Mar 11', title: 'Water Leak Emergency Response',
        property: 'Seaside Villa', city: 'Kissimmee, FL', pm: 'Coastal STR',
        payout: '$225', payStatus: 'awaiting-payment',
        payMethod: null, payRef: null, payDate: null, payRecordedAt: null,
        reminderCount: 1, lastReminderAt: '2026-03-19T10:00:00', reminderSentAt: 'Mar 19 · 10:00 AM',
        completedAt: '08:47 AM', verifiedAt: '10:30 AM',
        waitingDays: 10, overdue: true,
        disputeAt: null, disputeReason: null,
    },
    {
        id: 'c-002', taskId: 'TSK-9302', workflowClass: 'Standard Repair', trade: 'Pool & Water Systems',
        date: 'Mar 10', title: 'Pool Filter Replacement',
        property: 'Sunset Villa', city: 'Orlando, FL', pm: 'SunState Rentals',
        payout: '$85', payStatus: 'payment-sent',
        payMethod: 'Zelle', payRef: 'ZL-982344', payDate: 'Mar 12', payRecordedAt: 'Mar 12 · 2:14 PM',
        reminderCount: 1, lastReminderAt: '2026-03-11T14:00:00', reminderSentAt: null,
        completedAt: '11:02 AM', verifiedAt: '1:30 PM',
        waitingDays: 11, overdue: false,
        disputeAt: null, disputeReason: null,
    },
    {
        id: 'c-003', taskId: 'TSK-9303', workflowClass: 'Recurring / Scheduled', trade: 'Pool & Water Systems',
        date: 'Mar 9', title: 'Weekly Pool Cleaning',
        property: 'Marina Cove', city: 'Orlando, FL', pm: 'SunState Rentals',
        payout: '$75', payStatus: 'payment-disputed',
        payMethod: 'Zelle', payRef: 'ZL-774211', payDate: 'Mar 11', payRecordedAt: 'Mar 11 · 8:00 AM',
        reminderCount: 2, lastReminderAt: '2026-03-10T10:00:00', reminderSentAt: null,
        completedAt: '1:15 PM', verifiedAt: '3:00 PM',
        waitingDays: 12, overdue: true,
        disputeAt: 'Mar 12 · 9:12 AM', disputeReason: 'Payment not received in my account',
    },
];

const HISTORY_SEED: HistoryJob[] = [
    { id: 'h-001', taskId: 'TSK-9201', workflowClass: 'Recurring / Scheduled', trade: 'Pool & Water Systems', date: 'Mar 10', title: 'Chemical Balance & Skim', property: 'Sunset Villa', pm: 'SunState', status: 'completed', payout: '$85', payStatus: 'paid', payMethod: 'Zelle', payRef: 'ZL-88234', payDate: 'Mar 11', incident: null },
    { id: 'h-002', taskId: 'TSK-9202', workflowClass: 'Emergency', trade: 'Pool & Water Systems', date: 'Mar 9', title: 'Emergency Pump Repair', property: 'Seaside Villa', pm: 'Coastal STR', status: 'completed', payout: '$240', payStatus: 'paid', payMethod: 'ACH', payRef: 'ACH-44102', payDate: 'Mar 10', incident: null },
    { id: 'h-003', taskId: 'TSK-9203', workflowClass: 'Inspection', trade: 'Pool & Water Systems', date: 'Mar 8', title: 'Pool Inspection', property: 'Palm Ridge', pm: 'Coastal STR', status: 'rework-required', payout: '—', payStatus: '—', payMethod: null, payRef: null, payDate: null, incident: 'Rework: incomplete chemical test' },
    { id: 'h-004', taskId: 'TSK-9204', workflowClass: 'Recurring / Scheduled', trade: 'Pool & Water Systems', date: 'Mar 7', title: 'Weekly Maintenance', property: 'Sunset Palms', pm: 'SunState', status: 'completed', payout: '$85', payStatus: 'paid', payMethod: 'Check', payRef: 'CHK-1042', payDate: 'Mar 8', incident: null },
    { id: 'h-005', taskId: 'TSK-9205', workflowClass: 'Standard Repair', trade: 'Pool & Water Systems', date: 'Mar 6', title: 'Filter Replacement', property: 'Bay Breeze Apt', pm: 'Premier Stays', status: 'completed', payout: '$110', payStatus: 'paid', payMethod: 'Zelle', payRef: 'ZL-77901', payDate: 'Mar 7', incident: null },
    { id: 'h-006', taskId: 'TSK-9206', workflowClass: 'Emergency', trade: 'Pool & Water Systems', date: 'Mar 5', title: 'Emergency Chemical', property: 'Oak Manor', pm: 'Coastal STR', status: 'cancelled', payout: '—', payStatus: '—', payMethod: null, payRef: null, payDate: null, incident: null },
    { id: 'h-007', taskId: 'TSK-9207', workflowClass: 'Recurring / Scheduled', trade: 'Pool & Water Systems', date: 'Mar 4', title: 'Algae Treatment', property: 'Lakewood Villa', pm: 'SunState', status: 'completed', payout: '$95', payStatus: 'paid', payMethod: 'Bank', payRef: 'TRF-20941', payDate: 'Mar 5', incident: null },
];

/* ═══════════════════════════════════════════════════════════ */
export default function Jobs() {
    const { showToast } = useVendor();
    const [tab, setTab] = useState<JobTab>('incoming');
    const [incoming, setIncoming] = useState(INCOMING_SEED);
    const [active, setActive] = useState(ACTIVE_SEED);
    const [completed, setCompleted] = useState(COMPLETED_SEED);
    const [history, setHistory] = useState(HISTORY_SEED);
    const [missed, setMissed] = useState<MissedOffer[]>([]);
    const [msgThreads, setMsgThreads] = useState<Record<string, MsgThread[]>>(INITIAL_MSG_THREADS);
    const [search, setSearch] = useState('');
    const [sortLabel, setSortLabel] = useState('Soonest First');
    const [sortOpen, setSortOpen] = useState(false);
    const [complianceDismissed, setComplianceDismissed] = useState(false);
    const [drawerJobId, setDrawerJobId] = useState<string | null>(null);
    const [declineTarget, setDeclineTarget] = useState<string | null>(null);
    const [pauseTarget, setPauseTarget] = useState<string | null>(null);
    const [callTarget, setCallTarget] = useState<string | null>(null);

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
    const acceptJob = (id: string) => {
        const j = incoming.find((x) => x.id === id);
        if (!j) return;
        setIncoming((list) => list.filter((x) => x.id !== id));
        setActive((list) => [{
            id: `a-${Date.now()}`,
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
            checklist: j.type === 'emg' ? [
                { done: false, text: 'Assess leak source and severity' },
                { done: false, text: 'Shut off supply if active leak confirmed' },
                { done: false, text: 'Document with photos before any repair' },
                { done: false, text: 'Notify PM with status update on arrival' },
                { done: false, text: 'Submit completion report' },
            ] : [],
            timeline: [{ event: 'Job accepted', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), state: 'ok' }],
            beforePhotos: [], afterPhotos: [], materialsUsed: [],
        }, ...list]);
        showToast(j.type === 'emg' ? 'Emergency accepted — en route' : `${j.title} accepted`, 'success');
        setTab('active');
    };

    const confirmDecline = () => {
        if (!declineTarget) return;
        setIncoming((list) => list.filter((x) => x.id !== declineTarget));
        setDeclineTarget(null);
        showToast('Job declined · logged to dispatch', 'info');
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
                    {tab === 'incoming' && <IncomingList jobs={filterJobs(incoming)} onOpen={setDrawerJobId} onAccept={acceptJob} onDecline={setDeclineTarget} />}
                    {tab === 'active' && <ActiveList jobs={filterJobs(active)} onOpen={setDrawerJobId} />}
                    {tab === 'completed' && <CompletedList jobs={filterJobs(completed)} onOpen={setDrawerJobId} onRemind={(id) => {
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
                    }} />}
                    {tab === 'history' && <HistoryList jobs={filterJobs(history)} onOpen={setDrawerJobId} />}
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