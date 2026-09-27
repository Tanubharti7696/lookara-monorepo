// apps/owner-portal/src/pages/Settings/components/PayoutSettings.tsx
export default function PayoutSettings() {
  return (
    <>
      <div className="section-hdr">
        <div className="section-title">Payout Overview</div>
        <div className="section-sub">Tracked and reported by Lookara · managed by your PM</div>
      </div>

      <div className="panel">
        <div className="pm-disclaimer">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="8" cy="8" r="7" />
            <path d="M8 5v4M8 11v.5" />
          </svg>
          Payouts are handled by your property manager. Lookara tracks and reports them.
        </div>

        <div className="field-row">
          <div>
            <div className="field-label">Next Payout</div>
            <div className="field-sub">Estimated arrival Apr 17–18</div>
          </div>
          <div className="field-value field-value--gold">Apr 15, 2026 · $980</div>
        </div>

        <div className="field-row">
          <div>
            <div className="field-label">Typical Timing</div>
            <div className="field-sub">After processing</div>
          </div>
          <div className="field-value">2–3 business days</div>
        </div>

        <div className="field-row">
          <div>
            <div className="field-label">Schedule</div>
            <div className="field-sub">Set by your property manager</div>
          </div>
          <div className="field-value">Bi-weekly</div>
        </div>
      </div>
    </>
  );
}
