// apps/vendor-portal/src/pages/Dashboard/Drawers.tsx
import { useState, useEffect, type ReactNode } from 'react';
import './Drawers.css';

type Toast = (msg: string, tone?: 'info' | 'success' | 'danger' | 'warn' | 'emg') => void;

/* ═══════════════════════════════════════════════════════════════
   SHARED SHELL
═══════════════════════════════════════════════════════════════ */
function DrawerShell({
  open, onClose, header, children, footer,
}: { open: boolean; onClose: () => void; header: ReactNode; children: ReactNode; footer: ReactNode }) {
  return (
    <div className={`af-overlay ${open ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="af-modal">
        <div className="af-hdr">
          <div>{header}</div>
          <button className="af-close" onClick={onClose}>✕</button>
        </div>
        <div className="af-body">{children}</div>
        <div className="af-foot">{footer}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ASSESSMENT DRAWER
═══════════════════════════════════════════════════════════════ */
const CHECK_ITEMS = [
  { key: 'visual',   label: 'Visual Condition' },
  { key: 'function', label: 'Functional Test' },
  { key: 'safety',   label: 'Safety Hazard Check' },
  { key: 'wear',     label: 'Parts / Components Worn' },
  { key: 'code',     label: 'Code Compliance' },
];

type AСLifecycle = 'pending' | 'accepted' | 'in_progress' | 'submitted';
type Severity = 'minor' | 'moderate' | 'major' | 'critical' | null;

export function AssessmentDrawer({
  open, data, onClose, onContactPM, showToast,
}: {
  open: boolean;
  data: { title: string; property: string; dist: string; fee: number };
  onClose: () => void;
  onContactPM: () => void;
  showToast: Toast;
}) {
  const [lifecycle, setLifecycle] = useState<AСLifecycle>('pending');
  const [severity, setSeverity] = useState<Severity>(null);
  const [checks, setChecks] = useState<Record<string, 'ok' | 'issue'>>({});
  const [checkComments, setCheckComments] = useState<Record<string, string>>({});
  const [hasPhotos, setHasPhotos] = useState(false);
  const [nextStep, setNextStep] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<{ text: string; time: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    setLifecycle('pending');
    setSeverity(null);
    setChecks({});
    setCheckComments({});
    setHasPhotos(false);
    setNextStep(null);
    setTimeline([{ text: 'Assessment offered', time: 'Today · 10:02 AM' }]);
  }, [open]);

  const accept  = () => { setLifecycle('accepted');    setTimeline((t) => [...t, { text: 'Accepted by you', time: 'Just now' }]); showToast('Assessment accepted'); };
  const start   = () => { setLifecycle('in_progress'); setTimeline((t) => [...t, { text: 'Assessment started', time: 'Just now' }]); };
  const submit  = () => {
    if (!severity)   { showToast('Select overall condition before submitting', 'danger'); return; }
    if (!hasPhotos)  { showToast('Minimum 1 photo required before submitting', 'danger'); return; }
    if (!nextStep)   { showToast('Select a recommended next step', 'danger'); return; }
    setLifecycle('submitted');
    setTimeline((t) => [...t, { text: 'Report submitted for PM review', time: 'Just now' }]);
  };

  const statusMap: Record<AСLifecycle, { text: string; color: string }> = {
    pending:     { text: 'Not yet accepted',      color: 'var(--amber)' },
    accepted:    { text: 'Accepted · Not started', color: 'var(--blue)' },
    in_progress: { text: 'In progress',            color: 'var(--gold)' },
    submitted:   { text: '✓ Submitted',            color: 'var(--emerald)' },
  };

  const footer = lifecycle === 'pending' ? (
    <>
      <button className="af-btn-primary" onClick={accept}>Accept Assessment</button>
      <button className="af-btn-cancel" onClick={onClose}>Close</button>
    </>
  ) : lifecycle === 'accepted' ? (
    <>
      <button className="af-btn-primary" onClick={start}>Start Assessment</button>
      <button className="af-btn-cancel" onClick={onClose}>Close — finish later</button>
    </>
  ) : lifecycle === 'in_progress' ? (
    <>
      <button className="af-btn-primary" onClick={submit}>Submit Assessment Report →</button>
      <button className="af-btn-cancel" onClick={onClose}>Close — finish later</button>
    </>
  ) : (
    <>
      <button className="af-btn-primary" onClick={() => { onClose(); window.location.href = '/jobs'; }}>Go to Jobs &amp; Tasks →</button>
      <button className="af-btn-cancel" onClick={onClose}>Return to Dashboard</button>
    </>
  );

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      header={
        <>
          <div className="af-hdr-title">{data.title || 'Assessment'}</div>
          <div className="af-hdr-sub">{data.property}{data.dist ? ` · ${data.dist}` : ''}</div>
        </>
      }
      footer={footer}
    >
      {/* details block */}
      <div>
        <div className="af-section-lbl">Assessment Details</div>
        <div className="af-info-block">
          <div className="af-info-row"><span className="af-info-lbl">Property</span><span className="af-info-val">{data.property}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Distance</span><span className="af-info-val">{data.dist}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Assessment Fee</span><span className="af-info-val" style={{ color: 'var(--gold)' }}>${data.fee}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Due Time</span><span className="af-info-val">2h left · 4h window</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Assessment Status</span><span className="af-info-val" style={{ color: statusMap[lifecycle].color }}>{statusMap[lifecycle].text}</span></div>
        </div>
      </div>

      {/* PM notes */}
      <div>
        <div className="af-section-lbl">PM Notes</div>
        <div className="af-pm-note">
          <div className="af-pm-note-lbl">Coastal STR</div>
          <span>Owner reported unusual noise from pump housing during last cleaning. Please check for wear and confirm if replacement needed before next guest check-in.</span>
        </div>
      </div>

      <button className="af-contact-btn" onClick={onContactPM}>💬 Contact PM</button>

      {lifecycle === 'in_progress' && (
        <div className="af-work-section">
          {/* Severity */}
          <div>
            <div className="af-section-lbl">Overall Condition</div>
            <div className="af-severity-row">
              {(['minor', 'moderate', 'major', 'critical'] as const).map((s) => (
                <button
                  key={s}
                  className={`af-severity-chip ${severity === s ? `sel-${s}` : ''}`}
                  onClick={() => setSeverity(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="af-section-lbl">Inspection Checklist</div>
            <div className="af-checklist">
              {CHECK_ITEMS.map((item) => (
                <div key={item.key}>
                  <div className="af-check-row">
                    <span className="af-check-label">{item.label}</span>
                    <div className="af-check-toggle">
                      <button
                        className={`af-check-btn ok ${checks[item.key] === 'ok' ? 'sel' : ''}`}
                        onClick={() => setChecks((c) => ({ ...c, [item.key]: 'ok' }))}
                      >OK</button>
                      <button
                        className={`af-check-btn issue ${checks[item.key] === 'issue' ? 'sel' : ''}`}
                        onClick={() => setChecks((c) => ({ ...c, [item.key]: 'issue' }))}
                      >Issue</button>
                    </div>
                  </div>
                  {checks[item.key] === 'issue' && (
                    <textarea
                      className="af-check-comment"
                      placeholder="Optional comment — what you observed…"
                      value={checkComments[item.key] ?? ''}
                      onChange={(e) => setCheckComments((c) => ({ ...c, [item.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <div className="af-section-lbl">Findings Summary</div>
            <textarea className="af-textarea" placeholder="Describe what you observed…" />
          </div>

          {/* Photos */}
          <div>
            <div className="af-section-lbl">Photos</div>
            <button
              className={`af-upload-zone ${hasPhotos ? 'has-photos' : ''}`}
              onClick={() => setHasPhotos(true)}
            >
              {hasPhotos ? (
                <>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--emerald)' }}>3 photos attached</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Click to add more</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📷</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Attach photos</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Minimum 1 photo required</div>
                </>
              )}
            </button>
          </div>

          {/* Next step */}
          <div>
            <div className="af-section-lbl">Recommended Next Step</div>
            <div className="af-next-step">
              {[
                { val: 'none',     label: 'No action needed',                 sub: 'System functioning normally' },
                { val: 'repair',   label: 'Repair now',                       sub: 'Can complete during this visit' },
                { val: 'quote',    label: 'Needs parts — quote required',     sub: 'Submit estimate before repair' },
                { val: 'escalate', label: 'Escalate to specialist',           sub: 'Outside your scope or certification' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className={`af-radio-row ${nextStep === opt.val ? 'sel' : ''}`}
                  onClick={() => setNextStep(opt.val)}
                >
                  <span className="af-radio-dot" />
                  <span>
                    <span className="af-radio-label">{opt.label}</span>
                    <span className="af-radio-sub">{opt.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {lifecycle === 'submitted' && (
        <div className="af-success">
          <div className="af-success__icon">✓</div>
          <div className="af-success__title">Assessment Submitted</div>
          <div className="af-success__text">Your assessment has been sent to the Property Manager. The PM will review your findings and determine the next step.</div>
        </div>
      )}

      {lifecycle !== 'submitted' && (
        <div>
          <div className="af-section-lbl">Timeline</div>
          <div className="af-timeline">
            {timeline.map((t, i) => (
              <div key={i} className="af-tl-row">
                <div className="af-tl-dot" />
                <div>
                  <div className="af-tl-text">{t.text}</div>
                  <div className="af-tl-time">{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DrawerShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUOTE DRAWER
═══════════════════════════════════════════════════════════════ */
type QRLifecycle = 'pending' | 'accepted' | 'in_progress' | 'submitted';
interface LineItem { desc: string; amt: number }

export function QuoteDrawer({
  open, data, onClose, onContactPM, showToast,
}: {
  open: boolean;
  data: { title: string; property: string; dist: string; due: string; comp: string };
  onClose: () => void;
  onContactPM: () => void;
  showToast: Toast;
}) {
  const [lifecycle, setLifecycle] = useState<QRLifecycle>('pending');
  const [lines, setLines] = useState<LineItem[]>([{ desc: '', amt: 0 }]);
  const [duration, setDuration] = useState<string | null>(null);
  const [validity, setValidity] = useState<number | null>(null);
  const [photos, setPhotos] = useState(0);
  const [timeline, setTimeline] = useState<{ text: string; time: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    setLifecycle('pending');
    setLines([{ desc: '', amt: 0 }]);
    setDuration(null);
    setValidity(null);
    setPhotos(0);
    setTimeline([{ text: 'Quote requested by PM', time: 'Today · 9:15 AM' }]);
  }, [open]);

  const total = lines.reduce((sum, l) => sum + (l.amt || 0), 0);

  const accept = () => { setLifecycle('accepted');    setTimeline((t) => [...t, { text: 'Accepted by you', time: 'Just now' }]); showToast('Quote request accepted'); };
  const start  = () => { setLifecycle('in_progress'); setTimeline((t) => [...t, { text: 'Started drafting quote', time: 'Just now' }]); };
  const submit = () => {
    const validLines = lines.filter((l) => l.desc && l.amt > 0);
    if (!validLines.length) { showToast('Add at least one line item with description and amount', 'danger'); return; }
    if (!duration)          { showToast('Select an estimated time to complete', 'danger'); return; }
    if (!validity)          { showToast('Select how long this quote stays valid', 'danger'); return; }
    setLifecycle('submitted');
    setTimeline((t) => [...t, { text: `Quote submitted — $${total.toLocaleString()}`, time: 'Just now' }]);
  };

  const statusMap: Record<QRLifecycle, { text: string; color: string }> = {
    pending:     { text: 'Not yet accepted',      color: 'var(--amber)' },
    accepted:    { text: 'Accepted · Not started', color: 'var(--blue)' },
    in_progress: { text: 'Drafting quote',         color: 'var(--gold)' },
    submitted:   { text: '✓ Submitted',            color: 'var(--emerald)' },
  };

  const footer = lifecycle === 'pending' ? (
    <>
      <button className="af-btn-primary" onClick={accept}>Accept Quote Request</button>
      <button className="af-btn-cancel" onClick={onClose}>Close</button>
    </>
  ) : lifecycle === 'accepted' ? (
    <>
      <button className="af-btn-primary" onClick={start}>Start Quote</button>
      <button className="af-btn-cancel" onClick={onClose}>Close — finish later</button>
    </>
  ) : lifecycle === 'in_progress' ? (
    <>
      <button className="af-btn-primary" onClick={submit}>Submit Quote</button>
      <button className="af-btn-cancel" onClick={onClose}>Close — finish later</button>
    </>
  ) : (
    <>
      <button className="af-btn-primary" onClick={() => { onClose(); window.location.href = '/jobs'; }}>Go to Active Jobs →</button>
      <button className="af-btn-cancel" onClick={onClose}>Return to Dashboard</button>
    </>
  );

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      header={
        <>
          <div className="af-hdr-title">{data.title || 'Quote Request'}</div>
          <div className="af-hdr-sub">{data.property}{data.dist ? ` · ${data.dist}` : ''}</div>
        </>
      }
      footer={footer}
    >
      <div>
        <div className="af-section-lbl">Quote Details</div>
        <div className="af-info-block">
          <div className="af-info-row"><span className="af-info-lbl">Property</span><span className="af-info-val">{data.property}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Distance</span><span className="af-info-val">{data.dist}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Compensation</span><span className="af-info-val" style={{ color: 'var(--gold)' }}>{data.comp}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Due Time</span><span className="af-info-val">{data.due}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Status</span><span className="af-info-val" style={{ color: statusMap[lifecycle].color }}>{statusMap[lifecycle].text}</span></div>
        </div>
      </div>

      <div>
        <div className="af-section-lbl">PM Notes</div>
        <div className="af-pm-note">
          <div className="af-pm-note-lbl">Coastal STR</div>
          <span>Pool surface showing significant wear and cracking near the steps. Owner wants a full resurfacing quote before the next booking season. Please include material and labor breakdown.</span>
        </div>
      </div>

      <button className="af-contact-btn" onClick={onContactPM}>💬 Contact PM</button>

      {lifecycle === 'in_progress' && (
        <div className="af-work-section">
          <div>
            <div className="af-section-lbl">Reference Photos</div>
            <div className="af-photo-grid">
              {Array.from({ length: 3 + photos }).map((_, i) => (
                <div key={i} className={`af-photo-thumb ${i >= 3 ? 'added' : ''}`}>
                  {i >= 3 ? '✓' : '📷'}
                </div>
              ))}
            </div>
            <button className="qr-add-line" onClick={() => setPhotos((p) => p + 1)} style={{ marginTop: 6 }}>
              + Add Your Photos
            </button>
          </div>

          <div>
            <div className="af-section-lbl">Quote Line Items</div>
            <div className="qr-lines">
              {lines.map((line, i) => (
                <div key={i} className="qr-line-block">
                  <div className="qr-line-block__head">
                    <span className="qr-line-block__lbl">Line Item {i + 1}</span>
                    {lines.length > 1 && (
                      <span className="qr-line-remove" onClick={() => setLines((l) => l.filter((_, idx) => idx !== i))}>✕</span>
                    )}
                  </div>
                  <div>
                    <div className="qr-line-field-lbl">Description</div>
                    <input
                      className="qr-line-input"
                      placeholder="e.g. Pool resurfacing labor"
                      value={line.desc}
                      onChange={(e) => setLines((l) => l.map((it, idx) => idx === i ? { ...it, desc: e.target.value } : it))}
                    />
                  </div>
                  <div>
                    <div className="qr-line-field-lbl">Amount</div>
                    <input
                      className="qr-line-amt"
                      type="number"
                      placeholder="0"
                      value={line.amt || ''}
                      onChange={(e) => setLines((l) => l.map((it, idx) => idx === i ? { ...it, amt: parseFloat(e.target.value) || 0 } : it))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="qr-add-line" onClick={() => setLines((l) => [...l, { desc: '', amt: 0 }])} style={{ marginTop: 6 }}>
              + Add Line Item
            </button>
          </div>

          <div className="qr-total-row">
            <span className="qr-total-lbl">Total Quote</span>
            <span className="qr-total-val">${total.toLocaleString()}</span>
          </div>

          <div>
            <div className="af-section-lbl">Estimated Time to Complete</div>
            <div className="af-next-step">
              {[
                { val: '1day',    label: '1 day' },
                { val: '2-3days', label: '2–3 days' },
                { val: '1week',   label: '1 week' },
                { val: 'custom',  label: 'Custom' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className={`af-radio-row ${duration === opt.val ? 'sel' : ''}`}
                  onClick={() => setDuration(opt.val)}
                >
                  <span className="af-radio-dot" />
                  <span className="af-radio-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="af-section-lbl">Notes to PM</div>
            <textarea className="af-textarea" placeholder="Timeline, materials, warranty details…" />
          </div>

          <div>
            <div className="af-section-lbl">Quote Valid For</div>
            <div className="af-severity-row">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  className={`af-severity-chip ${validity === d ? 'sel-minor' : ''}`}
                  onClick={() => setValidity(d)}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {lifecycle === 'submitted' && (
        <div className="af-success">
          <div className="af-success__icon">✓</div>
          <div className="af-success__title">Quote Submitted</div>
          <div className="af-success__text">Your quote has been sent to the Property Manager. You'll be notified when it is approved, rejected, or returned for revision.</div>
        </div>
      )}

      {lifecycle !== 'submitted' && (
        <div>
          <div className="af-section-lbl">Timeline</div>
          <div className="af-timeline">
            {timeline.map((t, i) => (
              <div key={i} className="af-tl-row">
                <div className="af-tl-dot" />
                <div>
                  <div className="af-tl-text">{t.text}</div>
                  <div className="af-tl-time">{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DrawerShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMERGENCY DRAWER
═══════════════════════════════════════════════════════════════ */
interface EmergencyOffer {
  jobId: string; title: string; property: string; dist: string;
  payout: number; competitors: number; pm: string; issue: string;
  total: number; secondsLeft: number;
}
const CIRCUMFERENCE = 2 * Math.PI * 20;

export function EmergencyDrawer({
  open, offer, onClose, onAccept, onDecline, onContactPM,
}: {
  open: boolean;
  offer: EmergencyOffer | null;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onContactPM: () => void;
  showToast: Toast;
}) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => { if (open) setAccepted(false); }, [open]);

  if (!offer) return null;

  const pct = offer.secondsLeft / offer.total;
  const offset = CIRCUMFERENCE * (1 - pct);
  const color = pct <= 0.15 ? 'var(--amber)' : 'var(--crimson)';
  const mins = Math.floor(offer.secondsLeft / 60).toString().padStart(2, '0');
  const secs = (offer.secondsLeft % 60).toString().padStart(2, '0');

  const handleAccept = () => {
    setAccepted(true);
    onAccept();
    setTimeout(() => { onClose(); window.location.href = `/jobs?open=${offer.jobId}`; }, 1600);
  };

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      header={
        <>
          <div className="eg-badge">🚨 Emergency</div>
          <div className="af-hdr-title">{offer.title}</div>
          <div className="af-hdr-sub">{offer.property} · {offer.dist}</div>
        </>
      }
      footer={accepted ? null : (
        <>
          <button className="eg-accept-btn" onClick={handleAccept}>⚡ Accept Now</button>
          <button className="eg-decline-btn" onClick={() => { onDecline(); onClose(); }}>Decline</button>
        </>
      )}
    >
      {!accepted && (
        <>
          <div className="eg-urgent-band">
            <div className="eg-ring-mini">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(220,38,38,0.12)" strokeWidth="4" />
                <circle
                  cx="26" cy="26" r="20" fill="none"
                  stroke={color} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE.toFixed(2)}
                  strokeDashoffset={offset.toFixed(2)}
                  style={{ transition: 'stroke-dashoffset .9s linear, stroke .5s' }}
                />
              </svg>
              <div className="eg-ring-time">
                <div className="eg-ring-val">{mins}:{secs}</div>
                <div className="eg-ring-sub">left</div>
              </div>
            </div>
            <div className="eg-urgent-text">
              <div className="eg-urgent-title">Response window closing</div>
              <div className="eg-urgent-sub">Accept now before this opportunity expires</div>
            </div>
          </div>

          <div>
            <div className="af-section-lbl">Emergency Details</div>
            <div className="af-info-block">
              <div className="af-info-row"><span className="af-info-lbl">Property</span><span className="af-info-val">{offer.property}</span></div>
              <div className="af-info-row"><span className="af-info-lbl">Distance</span><span className="af-info-val">{offer.dist}</span></div>
              <div className="af-info-row"><span className="af-info-lbl">Payout</span><span className="af-info-val" style={{ color: 'var(--gold)' }}>${offer.payout}</span></div>
              <div className="af-info-row"><span className="af-info-lbl">Expected Arrival</span><span className="af-info-val" style={{ color: 'var(--amber)' }}>Within 45 minutes</span></div>
              <div className="af-info-row"><span className="af-info-lbl">Status</span><span className="af-info-val" style={{ color: 'var(--crimson)' }}>Awaiting response</span></div>
            </div>
          </div>

          <div>
            <div className="af-section-lbl">Issue Summary</div>
            <div className="af-pm-note emergency">
              <div className="af-pm-note-lbl" style={{ color: 'var(--crimson)' }}>{offer.pm}</div>
              <span>{offer.issue}</span>
            </div>
          </div>

          <button className="af-contact-btn" onClick={onContactPM}>💬 Contact PM</button>
        </>
      )}

      {accepted && (
        <div className="af-success">
          <div className="af-success__icon">✓</div>
          <div className="af-success__title">Accepted</div>
          <div className="af-success__text" style={{ marginBottom: 14 }}>You have been assigned this emergency.</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-m)' }}>Opening Jobs &amp; Tasks…</div>
        </div>
      )}
    </DrawerShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLAG DRAWER
═══════════════════════════════════════════════════════════════ */
interface FlagItem { jobId: string; reason: string; date: string; impact: string }

export function FlagDrawer({
  open, data, onClose, onContactPM, showToast,
}: {
  open: boolean;
  data: FlagItem | null;
  onClose: () => void;
  onContactPM: () => void;
  showToast: Toast;
}) {
  const [disputed, setDisputed] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [timeline, setTimeline] = useState<{ text: string; time: string }[]>([]);

  useEffect(() => {
    if (!open || !data) return;
    setDisputed(false);
    setDisputeText('');
    setTimeline([{ text: `Flag raised · ${data.reason}`, time: data.date }]);
  }, [open, data]);

  if (!data) return null;

  const submitDispute = () => {
    if (!disputeText.trim()) { showToast('Explain what happened before submitting a dispute', 'danger'); return; }
    setDisputed(true);
    setTimeline((t) => [...t, { text: 'Dispute submitted by you', time: 'Just now' }]);
    showToast('Dispute submitted for Admin review', 'success');
  };

  const footer = disputed ? (
    <button className="af-btn-primary" onClick={onClose}>Done</button>
  ) : (
    <>
      <button className="af-btn-primary" onClick={submitDispute}>Submit Dispute →</button>
      <button className="af-btn-cancel" onClick={onClose}>Close</button>
    </>
  );

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      header={
        <>
          <div className="af-hdr-title">Performance Flag</div>
          <div className="af-hdr-sub">Job #{data.jobId} · {data.reason}</div>
        </>
      }
      footer={footer}
    >
      <div className="pf-impact-band">
        <div className="pf-impact-icon">🚩</div>
        <div>
          <div className="pf-impact-val">{data.impact}</div>
          <div className="pf-impact-sub">Applied to your Performance Score</div>
        </div>
      </div>

      <div>
        <div className="af-section-lbl">Flag Details</div>
        <div className="af-info-block">
          <div className="af-info-row"><span className="af-info-lbl">Job Reference</span><span className="af-info-val">#{data.jobId}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Reason</span><span className="af-info-val">{data.reason}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Date Raised</span><span className="af-info-val">{data.date}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Status</span><span className="af-info-val" style={{ color: disputed ? 'var(--blue)' : 'var(--crimson)' }}>{disputed ? 'Dispute Under Review' : 'Active'}</span></div>
        </div>
      </div>

      <div>
        <div className="af-section-lbl">What Happened</div>
        <div className="af-pm-note emergency">
          <div className="af-pm-note-lbl" style={{ color: 'var(--crimson)' }}>Coastal STR</div>
          <span>Vendor did not arrive for scheduled 2:00 PM appointment at Palm Grove Retreat. PM attempted contact twice with no response. Job was reassigned to another vendor.</span>
        </div>
      </div>

      <button className="af-contact-btn" onClick={onContactPM}>💬 Contact PM</button>

      {!disputed && (
        <div>
          <div className="af-section-lbl">Dispute This Flag</div>
          <textarea
            className="af-textarea"
            placeholder="Explain what happened from your side — traffic, wrong address, PM cancellation, etc."
            value={disputeText}
            onChange={(e) => setDisputeText(e.target.value)}
          />
        </div>
      )}

      {disputed && (
        <div className="pf-dispute-note">
          <div className="pf-dispute-lbl">Dispute Submitted</div>
          <span>Your explanation has been sent to Admin for review. This flag remains active until a decision is made.</span>
        </div>
      )}

      <div>
        <div className="af-section-lbl">Timeline</div>
        <div className="af-timeline">
          {timeline.map((t, i) => (
            <div key={i} className="af-tl-row">
              <div className="af-tl-dot" style={{ background: 'var(--crimson)' }} />
              <div>
                <div className="af-tl-text">{t.text}</div>
                <div className="af-tl-time">{t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DrawerShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMM DRAWER
═══════════════════════════════════════════════════════════════ */
type CommView = 'options' | 'message' | 'reassign';

export function CommDrawer({
  open, pmName, onClose, showToast,
}: {
  open: boolean;
  pmName: string;
  onClose: () => void;
  showToast: Toast;
}) {
  const [view, setView] = useState<CommView>('options');
  const [msg, setMsg] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => { if (open) { setView('options'); setMsg(''); setReason(''); } }, [open]);

  return (
    <div className={`cm-overlay ${open ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cm-modal">
        <div className="cm-hdr">
          <div>
            <div className="cm-hdr-title">Contact PM</div>
            <div className="cm-hdr-sub">{pmName}</div>
          </div>
          <button className="af-close" onClick={onClose}>✕</button>
        </div>
        <div className="cm-body">
          {view === 'options' && (
            <>
              <button className="cm-option" onClick={() => { onClose(); showToast(`Calling ${pmName}… logged to audit trail`); }}>
                <span className="cm-option-icon">📞</span>
                <span><span className="cm-option-label">Call</span><span className="cm-option-sub">Connect directly with {pmName}</span></span>
              </button>
              <button className="cm-option" onClick={() => setView('message')}>
                <span className="cm-option-icon">💬</span>
                <span><span className="cm-option-label">Message</span><span className="cm-option-sub">Send a written note</span></span>
              </button>
              <button className="cm-option" onClick={() => setView('reassign')}>
                <span className="cm-option-icon">🔄</span>
                <span><span className="cm-option-label">Request Reassignment</span><span className="cm-option-sub">Ask PM to route this to another vendor</span></span>
              </button>
              <div className="cm-audit-note">All communication is logged to the audit trail</div>
            </>
          )}

          {view === 'message' && (
            <>
              <button className="cm-back" onClick={() => setView('options')}>‹ Back</button>
              <textarea className="cm-textarea" placeholder={`Type your message to ${pmName}…`} value={msg} onChange={(e) => setMsg(e.target.value)} />
              <button className="cm-send-btn" onClick={() => {
                if (!msg.trim()) { showToast('Type a message before sending', 'danger'); return; }
                onClose();
                showToast(`Message sent to ${pmName} · logged to audit trail`, 'success');
              }}>Send Message</button>
              <div className="cm-audit-note">All communication is logged to the audit trail</div>
            </>
          )}

          {view === 'reassign' && (
            <>
              <button className="cm-back" onClick={() => setView('options')}>‹ Back</button>
              <textarea className="cm-textarea" placeholder="Reason for requesting reassignment — scheduling conflict, outside scope, etc." value={reason} onChange={(e) => setReason(e.target.value)} />
              <button className="cm-send-btn" onClick={() => {
                if (!reason.trim()) { showToast('Explain the reason before submitting', 'danger'); return; }
                onClose();
                showToast(`Reassignment requested · ${pmName} notified · logged to audit trail`, 'success');
              }}>Submit Request</button>
              <div className="cm-audit-note">All communication is logged to the audit trail</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROUTE JOB DRAWER
═══════════════════════════════════════════════════════════════ */
interface RouteJob {
  id: string; title: string; property: string; dist: string;
  payout: number; time: string; status: 'inprog' | 'next' | 'sched';
  pm: string; step?: number; totalSteps?: number;
}

export function RouteJobDrawer({
  open, job, onClose, onNavigate, onContactPM, showToast,
}: {
  open: boolean;
  job: RouteJob | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onContactPM: (pm: string) => void;
  showToast: Toast;
}) {
  if (!job) return null;

  const statusMap = {
    inprog: { text: 'In Progress', color: 'var(--gold)' },
    next:   { text: 'Next Up',     color: 'var(--blue)' },
    sched:  { text: 'Scheduled',   color: 'var(--text-muted)' },
  } as const;
  const s = statusMap[job.status];

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      header={
        <>
          <div className="af-hdr-title">{job.title}</div>
          <div className="af-hdr-sub">{job.property} · {job.dist}</div>
        </>
      }
      footer={
        <>
          <button className="af-btn-primary" onClick={() => { onClose(); showToast('Opening Jobs & Tasks…'); }}>Go to Jobs &amp; Tasks →</button>
          <button className="af-btn-cancel" onClick={onClose}>Close</button>
        </>
      }
    >
      {job.status === 'inprog' && job.step && job.totalSteps && (
        <div className="rj-progress-band">
          <span className="rj-progress-lbl">⚙ In Progress</span>
          <span className="rj-progress-val">Step {job.step} of {job.totalSteps}</span>
        </div>
      )}

      <div>
        <div className="af-section-lbl">Job Details</div>
        <div className="af-info-block">
          <div className="af-info-row"><span className="af-info-lbl">Property</span><span className="af-info-val">{job.property}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Distance</span><span className="af-info-val">{job.dist}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Payout</span><span className="af-info-val" style={{ color: 'var(--gold)' }}>${job.payout}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Time</span><span className="af-info-val">{job.time}</span></div>
          <div className="af-info-row"><span className="af-info-lbl">Status</span><span className="af-info-val" style={{ color: s.color }}>{s.text}</span></div>
        </div>
      </div>

      <button className="af-contact-btn" onClick={() => onContactPM(job.pm)}>💬 Contact PM</button>
      <button className="af-contact-btn gold" onClick={() => onNavigate(job.id)}>▶ Navigate</button>
    </DrawerShell>
  );
}