// src/pages/Vendors/components/VendorTable.tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { type Vendor, cap, relLabel } from './data';

type Props = {
  vendors: Vendor[];
  onOpen: (id: string, focusSection?: string) => void;
};

type Hint = { query: string; label: string; tag: string; tagClass: 'red'|'yellow'|'blue'|'neutral' };

export default function VendorTable({ vendors, onOpen }: Props) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [trade, setTrade] = useState('all');
  const [compliance, setCompliance] = useState('all');
  const [region, setRegion] = useState('all');
  const [hintsOpen, setHintsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = () => setHintsOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return vendors.filter((v) => {
      const matchFlagged = query === 'flagged' ? v.flags > 0 : true;
      const matchQ = query === '' || query === 'flagged'
        ? matchFlagged
        : (v.name.toLowerCase().includes(query)
          || v.trade.toLowerCase().includes(query)
          || v.location.toLowerCase().includes(query)
          || v.status === query);
      const matchStatus = status === 'all' || v.status === status;
      const matchTrade = trade === 'all' || v.trade.toLowerCase().includes(trade.replace('-', ' '));
      const matchComp = compliance === 'all'
        || (compliance === 'compliant' && v.compDots.every((d) => d === 'ok'))
        || (compliance === 'needs-attention' && v.compDots.some((d) => d !== 'ok'));
      const matchRegion = region === 'all' || v.location.toLowerCase().includes(region);
      return matchQ && matchStatus && matchTrade && matchComp && matchRegion;
    });
  }, [vendors, q, status, trade, compliance, region]);

  /* Smart hints derived from live data */
  const hints: Hint[] = useMemo(() => {
    const out: Hint[] = [];
    const suspended = vendors.filter((v) => v.status === 'suspended');
    const blocked = vendors.filter((v) => v.status === 'blocked');
    const limited = vendors.filter((v) => v.status === 'limited');
    const flagged = vendors.filter((v) => v.flags > 0);

    if (suspended.length > 0) {
      out.push({
        query: 'suspended', tagClass: 'red', tag: 'Suspended',
        label: suspended.length === 1 ? `${suspended[0].name} — suspended` : `${suspended.length} suspended vendors`,
      });
    }
    if (blocked.length > 0) {
      out.push({
        query: 'blocked', tagClass: 'red', tag: 'Blocked',
        label: blocked.length === 1 ? `${blocked[0].name} — license or doc issue` : `${blocked.length} blocked vendors`,
      });
    }
    if (limited.length > 0) {
      out.push({
        query: 'limited', tagClass: 'yellow', tag: 'Limited',
        label: limited.length === 1 ? `${limited[0].name} — ${limited[0].statusReason ?? 'limited'}` : `${limited.length} limited vendors`,
      });
    }
    if (flagged.length > 0) {
      out.push({
        query: 'flagged', tagClass: 'yellow', tag: 'Flags',
        label: `${flagged.length} vendor${flagged.length > 1 ? 's' : ''} with active flags`,
      });
    }
    const tradeCount: Record<string, number> = {};
    vendors.forEach((v) => v.trade.split('·').forEach((t) => {
      const key = t.trim().toLowerCase();
      tradeCount[key] = (tradeCount[key] || 0) + 1;
    }));
    Object.entries(tradeCount).sort((a, b) => b[1] - a[1]).slice(0, 2).forEach(([tr, count]) => {
      out.push({ query: tr, tagClass: 'neutral', tag: 'Trade', label: `${count} ${tr} vendor${count > 1 ? 's' : ''}` });
    });
    return out;
  }, [vendors]);

  const clearAll = () => {
    setQ(''); setStatus('all'); setTrade('all'); setCompliance('all'); setRegion('all');
  };

  const applyHint = (hint: Hint) => {
    setQ(hint.query);
    setHintsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <>
      <div className="vd-controls">
        <div className="vd-search-wrap" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            className="vd-search"
            placeholder="Search vendor, trade, organization, property, compliance document…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setHintsOpen(false); }}
            onFocus={() => { if (!q) setHintsOpen(true); }}
            autoComplete="off"
          />
          {hintsOpen && hints.length > 0 && (
            <div className="vd-hints">
              <div className="vd-hints__label">Suggested searches</div>
              {hints.map((h, i) => (
                <div key={i} className="vd-hint" onMouseDown={(e) => { e.preventDefault(); applyHint(h); }}>
                  <span className={`vd-hint__tag is-${h.tagClass}`}>{h.tag}</span>
                  <span>{h.label}</span>
                  <span className="vd-hint__query">{h.query}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <select className="vd-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="limited">Limited</option>
          <option value="blocked">Blocked</option>
          <option value="suspended">Suspended</option>
        </select>

        <select className="vd-select" value={trade} onChange={(e) => setTrade(e.target.value)}>
          <option value="all">All Trades</option>
          {['plumbing','electrical','hvac','pool','cleaning','landscaping','handyman','carpentry','painting','flooring','roofing','locksmith','appliance','pest','technology','fire','security','pressure','waste'].map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <select className="vd-select" value={compliance} onChange={(e) => setCompliance(e.target.value)}>
          <option value="all">All Compliance</option>
          <option value="compliant">Fully Compliant</option>
          <option value="needs-attention">Needs Attention</option>
        </select>

        <select className="vd-select" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="all">All Regions</option>
          <option value="orlando">Orlando</option>
          <option value="kissimmee">Kissimmee</option>
          <option value="tampa">Tampa</option>
          <option value="jacksonville">Jacksonville</option>
          <option value="miami">Miami</option>
        </select>

        <button className="vd-clear" onClick={clearAll}>Clear all</button>
      </div>

      <div className="vd-table-wrap">
        <table className="vd-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Status &amp; Reason</th>
              <th>Signal · Jobs (30d)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="vd-empty">No vendors match filters</td></tr>
            ) : filtered.map((v) => {
              const tradeParts = v.trade.split('·').map((t) => t.trim());
              const isMulti = tradeParts.length > 1;

              // Reason line
              let reason = v.statusReason ?? '';
              if (v.status === 'active' && v.flags > 0) {
                reason = `${v.flags} flag${v.flags > 1 ? 's' : ''} (14d)`;
              } else if (v.status === 'active' && v.flags === 0 && v.compDots.every((d) => d === 'ok')) {
                reason = 'Fully compliant';
              }
              const reasonTone = (v.status === 'blocked' || v.status === 'suspended') ? 'red'
                : v.status === 'limited' ? 'yellow'
                : (v.status === 'active' && v.flags > 0) ? 'yellow'
                : 'green';

              const signalTone = v.reliability === 'high' ? 'green' : v.reliability === 'attention' ? 'yellow' : 'red';

              // Quick action
              let quick: { label: string; to: string } | null = null;
              if (v.status === 'limited' || v.status === 'blocked') quick = { label: 'Fix →', to: 'compBody' };
              else if (v.status === 'suspended') quick = { label: 'Review →', to: 'activityBody' };
              else if (v.status === 'active' && v.flags > 0) quick = { label: 'Review →', to: 'activityBody' };

              return (
                <tr key={v.id} onClick={() => onOpen(v.id)}>
                  <td>
                    <div className="vd-name">{v.name}</div>
                    {isMulti ? (
                      <>
                        <div className="vd-trade">
                          <span className="vd-trade__lbl">Trades:</span> {tradeParts.join(' · ')}
                        </div>
                        <div className="vd-trade">{v.location}</div>
                      </>
                    ) : (
                      <div className="vd-trade">{v.trade} · {v.location}</div>
                    )}
                  </td>
                  <td>
                    <span className={`vd-status-badge is-${v.status}`}>
                      <span className="vd-status-badge__dot" />
                      {cap(v.status)}
                    </span>
                    {reason
                      ? <div className={`vd-reason is-${reasonTone}`}>{reason}</div>
                      : <div className="vd-reason--spacer" />}
                  </td>
                  <td>
                    <div className={`vd-signal is-${signalTone}`}>{relLabel(v.reliability)}</div>
                    <div className="vd-signal__sub">
                      {v.perf.jobs} jobs · {v.kpi.orgs} org{v.kpi.orgs > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td>
                    <div className="vd-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="vd-btn-view" onClick={() => onOpen(v.id)}>View Profile</button>
                      {quick && (
                        <button className="vd-btn-quick" onClick={() => onOpen(v.id, quick!.to)}>
                          {quick.label}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}