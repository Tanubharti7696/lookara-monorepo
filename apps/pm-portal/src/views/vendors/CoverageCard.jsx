// src/views/vendors/CoverageCard.jsx
import { useState } from 'react';
import { TRADE_ICONS, TRADE_LABELS } from '../../data/vendors';

export default function CoverageCard({ property, attachments, onOpenVendor, onAttach, onReplace, onRemove, onFlash, VD }) {
  const [open, setOpen] = useState(false);

  const attachedVids = Object.keys(attachments).filter(vid =>
    (attachments[vid] || []).some(r => r.property === property.name)
  );

  const byTrade = {};
  attachedVids.forEach(vid => {
    const v = VD[vid];
    if (!v) return;
    const t = (v.trade || 'other').toLowerCase();
    if (!byTrade[t]) byTrade[t] = [];
    byTrade[t].push(vid);
  });

  return (
    <div className="cov-card">
      <div className="cov-card__header" onClick={() => setOpen(v => !v)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cov-card__address">{property.address}</div>
          <div className="cov-card__citystate">
            {property.cityState}
            <span className="cov-card__nickname"> · {property.name}</span>
          </div>
          <div className="cov-card__badges">
            {property.gap && (
              <span className="cov-badge cov-badge--critical">▲ {property.gap} · Critical</span>
            )}
            {(property.extraGaps || []).map(g => (
              <span key={g.trade} className={`cov-badge cov-badge--${g.severity === 'critical' ? 'critical' : 'task'}`}>
                ▲ {g.trade} · {g.severity === 'critical' ? 'Critical' : 'Task'}
              </span>
            ))}
            {!property.gap && !(property.extraGaps || []).length && (
              <span className="cov-badge cov-badge--ok">✓ No Active Tasks</span>
            )}
          </div>
        </div>
        <div className="cov-card__right">
          <button
            className="cov-add-btn"
            onClick={(e) => { e.stopPropagation(); onAttach(property.name); }}
          >
            + Add
          </button>
          <span className="cov-card__count">{attachedVids.length} {attachedVids.length === 1 ? 'vendor' : 'vendors'}</span>
          <span className={`cov-card__chev ${open ? 'open' : ''}`}>▾</span>
        </div>
      </div>

      {open && (
        <div className="cov-card__body">
          {attachedVids.length === 0 ? (
            <div className="cov-card__empty">No vendor assigned yet</div>
          ) : Object.keys(byTrade).map(trade => (
            <div key={trade} className="cov-trade-block">
              <div className="cov-trade-header">
                <span className="cov-trade-title">
                  {TRADE_ICONS[trade] || '🔧'} {TRADE_LABELS[trade] || trade}
                </span>
              </div>
              {byTrade[trade].map(vid => {
                const v = VD[vid];
                const rec = (attachments[vid] || []).find(r => r.property === property.name);
                const status = rec?.status;
                return (
                  <CovVendorRow
                    key={vid}
                    vendor={v}
                    status={status}
                    onOpen={() => onOpenVendor(vid)}
                    onReplace={() => onReplace(property.name)}
                    onRemove={() => onRemove(vid, property.name)}
                    onFlash={onFlash}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CovVendorRow({ vendor, status, onOpen, onReplace, onRemove, onFlash }) {
  const availText = (vendor.avail || '').replace('● ', '');
  let meta = `${vendor.sla} SLA · ${vendor.resp} · ${availText}`;
  let badge = null;
  let actions = null;

  if (status === 'dispatched') {
    badge = <span className="cov-vsb cov-vsb--dispatched">✓ Dispatched · In Progress</span>;
    actions = (
      <>
        <select className="cov-rank-select" onChange={(e) => onFlash(e.target.value)}>
          <option>Rank 1</option><option>Rank 2</option><option>Rank 3</option><option>Rank 4</option>
        </select>
        <AutopilotToggle defaultOn />
        <button className="cov-remove-btn" onClick={onRemove}>Remove</button>
      </>
    );
  } else if (status === 'attention') {
    badge = <span className="cov-vsb cov-vsb--attention">⚠ Needs Attention · Task Active</span>;
    actions = (
      <>
        <select className="cov-rank-select" onChange={(e) => onFlash(e.target.value)}>
          <option>Rank 1</option><option>Rank 2</option><option>Rank 3</option><option>Rank 4</option>
        </select>
        <AutopilotToggle />
        <button className="cov-replace-btn" onClick={onReplace}>Replace</button>
        <button className="cov-remove-btn" onClick={onRemove}>Remove</button>
      </>
    );
  } else if (status === 'suspended') {
    badge = <span className="cov-vsb cov-vsb--suspended">⛔ Suspended · Replace Vendor</span>;
    meta = 'Under admin review';
    actions = (
      <>
        <button className="cov-replace-btn" onClick={onReplace}>Replace</button>
        <button className="cov-remove-btn" onClick={onRemove}>Remove</button>
      </>
    );
  } else {
    actions = (
      <>
        <select className="cov-rank-select" onChange={(e) => onFlash(e.target.value)}>
          <option>Rank 1</option><option>Rank 2</option><option>Rank 3</option><option>Rank 4</option>
        </select>
        <AutopilotToggle defaultOn />
        <button className="cov-remove-btn" onClick={onRemove}>Remove</button>
      </>
    );
  }

  return (
    <div className="cov-vend-row">
      <div className="cov-vend-info" onClick={onOpen}>
        <div className="cov-vend-name-line">
          <span className="cov-vend-name">{vendor.name}</span>
          {badge}
        </div>
        <div className="cov-vend-meta">{meta}</div>
      </div>
      <div className="cov-vend-controls">{actions}</div>
    </div>
  );
}

function AutopilotToggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="cov-autopilot-wrap">
      <span className="cov-autopilot-lbl">Autopilot</span>
      <label className="cov-autopilot-toggle">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <div className="cov-apt-track" />
        <div className="cov-apt-thumb" />
      </label>
    </div>
  );
}