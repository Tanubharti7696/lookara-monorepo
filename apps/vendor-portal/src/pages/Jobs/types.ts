// apps/vendor-portal/src/pages/Jobs/types.ts

/* ── TYPES ── */
export type Priority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type IncomingType = 'emg' | 'new' | 'expiring' | 'estimate' | 'assessment';
export type ActiveStatus =
    | 'accepted' | 'enroute' | 'onsite' | 'in-progress' | 'submitted' | 'blocked' | 'clarify'
    | 'rework-required' | 'resume-requested' | 'assessment-accepted' | 'quote-pending'
    | 'quote-rejected' | 'approved';
export type CompletedStatus = 'awaiting-payment' | 'payment-sent' | 'payment-disputed';
export type HistoryStatus = 'completed' | 'cancelled' | 'rework-required' | 'missed';
export type JobTab = 'incoming' | 'active' | 'completed' | 'history';

export interface ChecklistItem { done: boolean; text: string }
export interface TimelineItem {
    event: string;
    time: string;
    state: 'ok' | 'pending' | 'warn';
    gps?: { lat: number; lng: number; accuracy: number };
}
export interface MaterialRow { item: string; qty: string; cost: string; note: string }
export interface PhotoEvidence {
    fileId: string; url: string; uploadedBy: string; timestamp: string;
    type: 'before' | 'after' | 'rework'; caption: string | null;
}

export interface IncomingJob {
    id: string;
    taskId: string;
    workflowClass: string;
    trade: string;
    type: IncomingType;
    priority: Priority;
    priorityLevel?: string;
    title: string;
    property: string;
    address?: string;
    city: string;
    dist: string;
    pm: string;
    jobType: string;
    time: string;
    dur: string;
    payout: number | null;
    deadline: string | null;
    deadlineClass: string;
    access: boolean;
    issue: string;
    scope: string;
    gateCode?: string;
    lockBox?: string;
    parking?: string;
    checklist?: string[];
    payBase?: number;
    payBonus?: number;
    competitors?: number;
    isEstimate?: boolean;
    estimateStatus?: 'submitted' | null;
    isAssessment?: boolean;
    assessmentStatus?: 'submitted' | 'approved' | 'rejected' | null;
    slaRespond?: string;
    slaComplete?: string;
    slaStatus?: 'on_track' | 'at_risk' | 'urgent';
    assessmentFee?: number;
    assessmentFeeNote?: string;
    detectedVia?: string;
    riskFlags?: string[];
    quoteRequirements?: string[];
    // runtime
    _dismissed?: boolean;
}

export interface ActiveJob {
    id: string;
    taskId: string;
    pmTaskId?: string;
    workflowClass: string;
    trade: string;
    status: ActiveStatus;
    priority: Priority;
    title: string;
    issue?: string;
    scope?: string;
    instructions?: string;
    property: string;
    city: string;
    dist: string;
    pm: string;
    jobType: string;
    type?: string;
    time: string;
    scheduledTime?: string;
    startsInMin?: number;
    dur: string;
    payout: number | null;
    step: number;
    totalSteps: number;
    onTime: string | null;
    onTimeClass: 'ok' | 'risk' | 'late';
    address?: string;
    gateCode?: string;
    lockBox?: string;
    parking?: string;
    checklist: ChecklistItem[];
    timeline: TimelineItem[];
    // assessment
    isAssessment?: boolean;
    assessmentStatus?: 'submitted' | 'approved' | 'rejected' | null;
    quoteAmount?: number | null;
    quoteScope?: string | null;
    quoteTime?: string | null;
    quoteSubmittedAt?: string | null;
    quoteRejectedReason?: string | null;
    revisionCount?: number;
    findings?: string | null;
    quoteApprovedAt?: string;
    quoteEstType?: 'fixed' | 'range' | 'assessment_only';
    quoteLaborAmt?: number;
    quoteMaterialsAmt?: number;
    // rework
    reworkCount?: number;
    reworkReason?: string;
    reworkAffectedArea?: string;
    reworkReference?: string;
    reworkNotes?: string;
    reworkRequestedAt?: string;
    reworkDeadline?: string;
    reworkSlaHoursLeft?: number;
    reworkSlaMinLeft?: number;
    reworkSlaStatus?: 'on_track' | 'urgent' | 'at_risk';
    reworkStarted?: boolean;
    previousSubmittedAt?: string;
    _reworkPhotosCount?: number;
    _reworkNotes?: string;
    _reworkCk1?: boolean;
    _reworkCk2?: boolean;
    _reworkCk3?: boolean;
    // resume-requested
    pauseIssueType?: string;
    pauseReason?: string;
    pauseRequestedAt?: string;
    // completion
    beforePhotos?: PhotoEvidence[];
    afterPhotos?: PhotoEvidence[];
    materialsUsed?: MaterialRow[];
    _notes?: string;
    completionEvidence?: unknown;
}

export interface CompletedJob {
    id: string;
    taskId: string;
    workflowClass: string;
    trade: string;
    date: string;
    title: string;
    property: string;
    city: string;
    pm: string;
    address?: string;
    payout: string;
    payStatus: CompletedStatus;
    payMethod: string | null;
    payRef: string | null;
    payDate: string | null;
    payRecordedAt: string | null;
    payNote?: string | null;
    reminderCount: number;
    lastReminderAt: string | null;
    reminderSentAt: string | null;
    completedAt: string;
    verifiedAt: string;
    waitingDays: number;
    overdue: boolean;
    disputeAt: string | null;
    disputeReason: string | null;
    disputeType?: string;
}

export interface HistoryJob {
    id: string;
    taskId: string;
    workflowClass: string;
    trade: string;
    date: string;
    title: string;
    property: string;
    pm: string;
    status: HistoryStatus;
    payout: string;
    payStatus: string;
    payMethod: string | null;
    payRef: string | null;
    payDate: string | null;
    incident: string | null;
    confirmedAt?: string;
}

export interface MissedOffer {
    id: string;
    title: string;
    property: string;
    city: string;
    pm: string;
    payout: number;
    jobType: string;
    expiredAt: string;
}

export interface MsgThread { from: 'pm' | 'vendor'; text: string; time: string }

/* ── CONSTANTS ── */
export const WORKFLOW_CLASSES = [
    'Emergency', 'Standard Repair', 'Recurring / Scheduled', 'Inspection',
    'Compliance-Driven', 'Assessment / Quote Required', 'Guest Request',
    'Delivery / Installation', 'Administrative', 'Financial / Dispute',
];

export const TRADES = [
    'Plumbing', 'Electrical', 'HVAC', 'Pool & Water Systems', 'Cleaning',
    'Landscaping', 'Handyman / General Repair', 'Carpentry', 'Painting',
    'Flooring', 'Roofing', 'Locksmith & Access', 'Appliance Repair',
    'Pest Control', 'Technology & Smart Home', 'Fire & Life Safety',
    'Security Systems', 'Pressure Washing', 'Waste Removal',
];

export const REMINDER_MAX = 3;
export const REMINDER_COOLDOWN = 24 * 60 * 60 * 1000;

export const PM_TRUST: Record<string, {
    score: number;
    trend: 'up' | 'down' | 'stable';
    paymentSpeedDays: number;
    approvalSpeedLabel: string;
    disputeRate: string;
    disputeCount: number;
    jobsWithVendor: number;
}> = {
    'Coastal STR Management': { score: 91, trend: 'up', paymentSpeedDays: 1.8, approvalSpeedLabel: 'Fast', disputeRate: 'Low', disputeCount: 0, jobsWithVendor: 6 },
    'SunState Rentals': { score: 78, trend: 'stable', paymentSpeedDays: 3.1, approvalSpeedLabel: 'Moderate', disputeRate: 'Low', disputeCount: 1, jobsWithVendor: 4 },
    'Premier Stays': { score: 84, trend: 'stable', paymentSpeedDays: 2.4, approvalSpeedLabel: 'Fast', disputeRate: 'None', disputeCount: 0, jobsWithVendor: 2 },
};

export const PM_CONTACT: Record<string, { phone: string }> = {
    'Coastal STR Management': { phone: '(407) 555-0182' },
    'SunState Rentals': { phone: '(407) 555-0391' },
    'Premier Stays': { phone: '(407) 555-0274' },
};

export const VENDOR_PROFILE = {
    trustScore: 92,
    responseAvgMin: 6,
    reworkRate: 4,
    completionRate: 98,
    emergencyEnabled: true,
};

/* ── INITIAL MSG THREADS ── */
export const INITIAL_MSG_THREADS: Record<string, MsgThread[]> = {
    'a-001': [
        { from: 'pm', text: 'Filter is in the pump shed — combination 4821', time: '08:15 AM' },
        { from: 'vendor', text: 'On site. Starting inspection now.', time: '08:34 AM' },
    ],
};

/* ── HELPERS ── */
export function getJobTypeBadge(j: { workflowClass?: string; type?: string; isEstimate?: boolean; isAssessment?: boolean; jobType?: string }): string {
    const wc = j.workflowClass;
    if (wc === 'Emergency') return 'Emergency';
    if (wc === 'Assessment / Quote Required') return (j.isEstimate || j.type === 'estimate') ? 'Quote Required' : 'Assessment';
    if (wc === 'Recurring / Scheduled') return 'Recurring';
    if (wc === 'Inspection') return 'Inspection';
    if (wc === 'Standard Repair') return 'Repair';
    if (j.type === 'emg') return 'Emergency';
    if (j.isAssessment) return 'Assessment';
    if (j.isEstimate) return 'Quote Required';
    if (j.type === 'recurring' || j.jobType === 'Maintenance') return 'Recurring';
    if (j.jobType === 'Inspection') return 'Inspection';
    return 'Repair';
}

export function badgeClass(label: string): string {
    switch (label) {
        case 'Emergency': return 'jt-emergency';
        case 'Assessment': return 'jt-assessment';
        case 'Quote Required': return 'jt-quote';
        case 'Recurring': return 'jt-recurring';
        case 'Inspection': return 'jt-inspection';
        default: return 'jt-repair';
    }
}

export function getE4ReasonCodes(j: { dist?: string; pm?: string; type?: string; workflowClass?: string; isAssessment?: boolean; jobType?: string }): { label: string; positive: boolean }[] {
    const reasons: { label: string; positive: boolean }[] = [];
    const dist = parseFloat((j.dist || '999').replace(/[^0-9.]/g, '')) || 99;

    if (dist <= 5) reasons.push({ label: `Within your immediate service area (${j.dist})`, positive: true });
    else if (dist <= 10) reasons.push({ label: `Within your service radius (${j.dist})`, positive: true });
    else reasons.push({ label: `Further than usual (${j.dist})`, positive: false });

    if (VENDOR_PROFILE.trustScore >= 90) reasons.push({ label: `Your Performance Score: ${VENDOR_PROFILE.trustScore} (Excellent)`, positive: true });
    else if (VENDOR_PROFILE.trustScore >= 75) reasons.push({ label: `Your Performance Score: ${VENDOR_PROFILE.trustScore} (Solid)`, positive: true });

    const pmTrust = j.pm ? PM_TRUST[j.pm] : undefined;
    if (pmTrust) {
        if (pmTrust.jobsWithVendor >= 5) reasons.push({ label: `Preferred vendor for this PM · ${pmTrust.jobsWithVendor} prior jobs`, positive: true });
        else if (pmTrust.jobsWithVendor >= 2) reasons.push({ label: `Prior relationship · ${pmTrust.jobsWithVendor} jobs together`, positive: true });
    }

    if (VENDOR_PROFILE.reworkRate <= 5) reasons.push({ label: `Low rework rate (${VENDOR_PROFILE.reworkRate}%)`, positive: true });
    if (VENDOR_PROFILE.responseAvgMin <= 8) reasons.push({ label: `Fast response history (avg ${VENDOR_PROFILE.responseAvgMin} min)`, positive: true });
    reasons.push({ label: 'Currently available', positive: true });

    if (j.type === 'emg' && VENDOR_PROFILE.emergencyEnabled) reasons.push({ label: 'Emergency dispatch enabled', positive: true });
    if (j.workflowClass === 'Assessment / Quote Required' || j.isAssessment || j.jobType === 'Assessment') {
        reasons.push({ label: `High completion rate (${VENDOR_PROFILE.completionRate}%)`, positive: true });
    }

    const pos = reasons.filter((r) => r.positive).slice(0, 3);
    const neg = reasons.filter((r) => !r.positive).slice(0, 1);
    return [...pos, ...neg];
}

export function getReminderState(j: CompletedJob): 'can_send' | 'cooldown' | 'escalated' {
    if (j.reminderCount >= REMINDER_MAX) return 'escalated';
    if (j.lastReminderAt) {
        const elapsed = Date.now() - new Date(j.lastReminderAt).getTime();
        if (elapsed < REMINDER_COOLDOWN) return 'cooldown';
    }
    return 'can_send';
}

export function reminderCooldownRemaining(j: CompletedJob): string {
    if (!j.lastReminderAt) return '';
    const ms = REMINDER_COOLDOWN - (Date.now() - new Date(j.lastReminderAt).getTime());
    const hrs = Math.ceil(ms / 3600000);
    return hrs > 1 ? `${hrs}h remaining` : 'less than 1h remaining';
}

export function formatGPS(gps: { lat: number; lng: number; accuracy: number } | null | undefined): string | null {
    if (!gps) return null;
    return `${gps.lat.toFixed(4)}°, ${gps.lng.toFixed(4)}° · ±${gps.accuracy}m`;
}