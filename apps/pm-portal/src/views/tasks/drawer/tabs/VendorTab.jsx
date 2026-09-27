// src/views/tasks/drawer/tabs/VendorTab.jsx

const VENDOR_SCORES = {
  'Manhattan Plumbing': {
    trust: 91, tier: 'Elite', color: '#22C55E',
    slaReliability: 96, acceptanceRate: 92, reworkRate: 3, avgResponseMin: 8,
    paymentDisputes: 0, distanceMi: 1.4, favoriteRank: 1,
  },
  'NYC Plumbing Pro': {
    trust: 78, tier: 'Solid', color: '#D4AF37',
    slaReliability: 94, acceptanceRate: 89, reworkRate: 7, avgResponseMin: 14,
    paymentDisputes: 1, distanceMi: 3.1, favoriteRank: 2,
  },
  'Brooklyn Plumbing': {
    trust: 64, tier: 'Warning', color: '#F59E0B',
    slaReliability: 88, acceptanceRate: 85, reworkRate: 12, avgResponseMin: 22,
    paymentDisputes: 2, distanceMi: 4.8, favoriteRank: 3,
  },
  'NYC Water Pros': {
    trust: 85, tier: 'Solid', color: '#22C55E',
    slaReliability: 91, acceptanceRate: 88, reworkRate: 5, avgResponseMin: 11,
    paymentDisputes: 0, distanceMi: 2.2,
  },
  'NYC Cleaners': {
    trust: 92, tier: 'Elite', color: '#22C55E',
    slaReliability: 96, acceptanceRate: 94, reworkRate: 2, avgResponseMin: 6,
    paymentDisputes: 0, distanceMi: 0.8, favoriteRank: 1,
  },
  'AirPro HVAC Services': {
    trust: 88, tier: 'Solid', color: '#22C55E',
    slaReliability: 94, acceptanceRate: 91, reworkRate: 5, avgResponseMin: 12,
    paymentDisputes: 0, distanceMi: 1.9,
  },
  'Metro Electric': {
    trust: 87, tier: 'Solid', color: '#D4AF37',
    slaReliability: 92, acceptanceRate: 89, reworkRate: 6, avgResponseMin: 15,
    paymentDisputes: 0, distanceMi: 2.6,
  },
  'Metro Contractors': {
    trust: 82, tier: 'Solid', color: '#D4AF37',
    slaReliability: 90, acceptanceRate: 87, reworkRate: 8, avgResponseMin: 18,
    paymentDisputes: 0, distanceMi: 3.3,
  },
};

export default function VendorTab({ task }) {
  if (!task.vendor) {
    return (
      <div className="lk-block">
        <div className="lk-block__title">Vendor Assignment</div>
        <div style={{ padding: 20, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>⚠ No vendor assigned</div>
          <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>
            Eligible: {task.dispatch?.eligible || 0} vendors in pool
          </div>
        </div>
      </div>
    );
  }

  const v = VENDOR_SCORES[task.vendor];

  return (
    <div>
      <div className="lk-block">
        <div className="lk-block__title">Assigned Vendor</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {task.vendor}
        </div>
        {task.acceptedAt && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>
            Accepted: {task.acceptedAt}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="lk-btn lk-btn--secondary" style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}>📞 Call</button>
          <button className="lk-btn lk-btn--secondary" style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}>💬 Message</button>
        </div>
      </div>

      {v ? (
        <div className="lk-block">
          <div className="lk-block__title">Performance Snapshot</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: v.color, lineHeight: 1 }}>{v.slaReliability}%</div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>Reliability</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{v.acceptanceRate}%</div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>Acceptance</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{v.avgResponseMin}m</div>
              <div style={{ fontSize: 11, color: 'var(--slate)' }}>Avg Response</div>
            </div>
          </div>

          <ScoreBar label="SLA Reliability"   value={v.slaReliability} color={v.color} />
          <ScoreBar label="Acceptance Rate"   value={v.acceptanceRate} color={v.color} />
          <ScoreBar label="Rework (lower OK)" value={v.reworkRate}     color={v.reworkRate <= 5 ? '#22C55E' : '#F59E0B'} />

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <div className="lk-row"><span className="lk-row__label">Open Disputes</span><span className={`lk-row__value ${v.paymentDisputes > 0 ? 'lk-row__value--amber' : 'lk-row__value--green'}`}>{v.paymentDisputes}</span></div>
            <div className="lk-row"><span className="lk-row__label">Distance</span><span className="lk-row__value">{v.distanceMi} mi</span></div>
            {v.favoriteRank && (
              <div className="lk-row"><span className="lk-row__label">Favorite Rank</span><span className="lk-row__value lk-row__value--gold">#{v.favoriteRank}</span></div>
            )}
          </div>
        </div>
      ) : (
        <div className="lk-block">
          <div className="lk-block__title">Performance Snapshot</div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>No performance history on file for this vendor.</div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="lk-scorebar">
      <div className="lk-scorebar__label">
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="lk-scorebar__bar">
        <div className="lk-scorebar__fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
    </div>
  );
}