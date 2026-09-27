// src/views/vendors/DirectoryPane.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { VD, PROPERTIES, TRADE_CHIPS, TRADE_LABELS } from '../../data/vendors';

export default function DirectoryPane({
  selectedProperty, onSelectProperty, onClearProperty,
  attachments, onOpenVendor, onAttach, onToast,
}) {
  const [propSearch, setPropSearch] = useState(selectedProperty || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tradeFilter, setTradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(null);
  const [vendorSearch, setVendorSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    setPropSearch(selectedProperty || '');
  }, [selectedProperty]);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const selectedProp = PROPERTIES.find(p => p.name === selectedProperty);

  const matches = useMemo(() => {
    const q = propSearch.toLowerCase().trim();
    if (!q) return PROPERTIES;
    return PROPERTIES.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q)
    );
  }, [propSearch]);

  // Determine visible vendors
  const visible = useMemo(() => {
    const regionFilter = selectedProp?.region;
    const vq = vendorSearch.toLowerCase().trim();
    return Object.entries(VD).filter(([vid, v]) => {
      // Region scope
      if (regionFilter) {
        const vRegion = (v.region || '').toLowerCase();
        const matchesRegion =
          vRegion.includes(regionFilter) ||
          vRegion.includes(regionFilter === 'brooklyn' ? 'nyc' : regionFilter);
        if (!matchesRegion) return false;
      }
      // Trade
      if (tradeFilter !== 'all') {
        const tradeKey = (v.trade || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const wantedKey = tradeFilter;
        if (!tradeKey.startsWith(wantedKey.split('-')[0]) && tradeKey !== wantedKey) return false;
      }
      // Status
      if (statusFilter === 'emergency' && v.emg && !v.emg.includes('⚡')) return false;
      if (statusFilter === 'available' && !v.avail.includes('Available')) return false;
      // Vendor search
      if (vq) {
        const hay = [v.name, v.trade, v.region].join(' ').toLowerCase();
        if (!hay.includes(vq)) return false;
      }
      return true;
    });
  }, [selectedProp, tradeFilter, statusFilter, vendorSearch]);

  // Split into attached vs not for the selected property
  const attachedToSelected = (vid) =>
    selectedProp && (attachments[vid] || []).some(r => r.property === selectedProp.name);

  const attachedRows = visible.filter(([vid]) => attachedToSelected(vid));
  const unattachedRows = visible.filter(([vid]) => !attachedToSelected(vid));

  const handleSelectProp = (idx) => {
    const p = PROPERTIES[idx];
    onSelectProperty(p.name);
    setPropSearch(p.name);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onClearProperty();
    setPropSearch('');
    setShowDropdown(false);
  };

  return (
    <div className="dir-pane">
      <div className="dir-top" ref={dropdownRef}>
        {/* Property search */}
        <div className="dir-prop-search-wrap">
          <div className="dir-prop-search">
            <span style={{ color: 'var(--slate)', fontSize: 13 }}>📍</span>
            <input
              placeholder="Search property name or address…"
              value={propSearch}
              onChange={e => { setPropSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
            />
            {propSearch && (
              <button className="dir-prop-clear" onClick={handleClear}>×</button>
            )}
          </div>
          {showDropdown && propSearch.trim() && matches.length > 0 && (
            <div className="dir-prop-dropdown">
              {matches.map(p => {
                const idx = PROPERTIES.indexOf(p);
                return (
                  <div
                    key={p.name}
                    className="dir-prop-option"
                    onClick={() => handleSelectProp(idx)}
                  >
                    <div>
                      <div className="dir-prop-option__address">{p.address}</div>
                      <div className="dir-prop-option__sub">
                        {p.cityState} · {p.name}
                        {p.issues ? ' · ⚠ Coverage gap' : ''}
                      </div>
                    </div>
                    <div className="dir-prop-option__count">{p.vendors} vendors</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected property status bar */}
        {selectedProp && (
          <div className="dir-selected-bar">
            <div>
              <div className="dir-selected-name">
                {selectedProp.address}, {selectedProp.cityState}
              </div>
              <div className="dir-selected-sub">
                {selectedProp.name} · Distance ranking active · {selectedProp.vendorCount} vendors in range
              </div>
            </div>
            <div className="dir-selected-hint">Ranked by distance · SLA · emergency readiness</div>
          </div>
        )}

        {/* Trade chips */}
        <div className="dir-chips">
          {TRADE_CHIPS.map(c => (
            <button
              key={c.key}
              type="button"
              className={`dir-chip ${tradeFilter === c.key ? 'active' : ''}`}
              onClick={() => setTradeFilter(c.key)}
            >
              {c.icon}{c.icon ? ' ' : ''}{c.label}
            </button>
          ))}
        </div>

        {/* Status chips */}
        <div className="dir-chips dir-chips--status">
          <button
            type="button"
            className={`dir-chip ${statusFilter === 'emergency' ? 'active' : ''}`}
            onClick={() => setStatusFilter(s => s === 'emergency' ? null : 'emergency')}
          >
            🚨 Emergency
          </button>
          <button
            type="button"
            className={`dir-chip ${statusFilter === 'available' ? 'active' : ''}`}
            onClick={() => setStatusFilter(s => s === 'available' ? null : 'available')}
          >
            ● Available
          </button>
        </div>

        {/* Vendor search */}
        <div className="dir-vendor-search">
          <span style={{ color: 'var(--slate)', fontSize: 12 }}>🔍</span>
          <input
            placeholder="Search vendor, trade, city, response…"
            value={vendorSearch}
            onChange={e => setVendorSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="dir-scroll">
        {selectedProp?.gap && (
          <div className="dir-cov-alert">
            <span>⚠</span>
            <span>{selectedProp.gap} coverage missing for {selectedProp.address}</span>
            <button
              className="dir-cov-alert__btn"
              onClick={() => setTradeFilter(selectedProp.gapTrade)}
            >
              Show {selectedProp.gap} Vendors
            </button>
          </div>
        )}

        <div className="dir-table">
          <div className="dir-thead">
            <span>Vendor</span>
            <span>Dist</span>
            <span>Avail</span>
            <span>Rel%</span>
            <span>Resp</span>
            <span>Action</span>
          </div>

          {selectedProp && attachedRows.length > 0 && (
            <>
              <div className="dir-section-label">{selectedProp.region[0].toUpperCase() + selectedProp.region.slice(1)} — Attached</div>
              {attachedRows.map(([vid, v]) => (
                <VendorRow
                  key={vid}
                  vid={vid}
                  vendor={v}
                  attached
                  onOpen={() => onOpenVendor(vid)}
                  onAttach={() => onAttach(vid, v.name, v.trade)}
                />
              ))}
            </>
          )}

          {unattachedRows.length > 0 && (
            <>
              <div className="dir-section-label">
                {selectedProp ? 'Not Attached to This Property' : 'All Vendors'}
              </div>
              {unattachedRows.map(([vid, v]) => (
                <VendorRow
                  key={vid}
                  vid={vid}
                  vendor={v}
                  onOpen={() => onOpenVendor(vid)}
                  onAttach={() => onAttach(vid, v.name, v.trade)}
                />
              ))}
            </>
          )}

          {visible.length === 0 && (
            <div className="dir-empty">No vendors match your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function VendorRow({ vid, vendor, attached, onOpen, onAttach }) {
  const v = vendor;
  const rowClass =
    v.sub?.includes('BLOCKED') ? 'dir-row dir-row--blocked'
    : v.sub?.includes('SUSPENDED') ? 'dir-row dir-row--suspended'
    : v.trust !== null && v.trust < 80 ? 'dir-row dir-row--risk'
    : 'dir-row';

  const availClass = v.avail.includes('Available') ? 'dir-avail--yes'
    : v.avail.includes('Busy') ? 'dir-avail--busy'
    : 'dir-avail--off';

  return (
    <div className={rowClass} onClick={onOpen}>
      <div>
        <div className="dir-row__name" style={{
          color: rowClass.includes('blocked') || rowClass.includes('suspended') ? 'var(--slate)' : 'var(--text)',
        }}>
          {v.name}
        </div>
        <div className="dir-row__sub">{attached ? '✓ Attached · ' : '✓ Verified · '}{v.trade}</div>
      </div>
      <div className="dir-row__dist">{v.resp && v.resp !== '—' ? '—' : '—'}</div>
      <div className={`dir-row__avail ${availClass}`}>
        {v.avail.replace('● ', '')}
      </div>
      <div className="dir-row__rel" style={{
        color: v.trust === null ? 'var(--slate)'
          : v.trust >= 90 ? 'var(--success)'
          : v.trust >= 75 ? 'var(--amber)'
          : 'var(--crimson)',
      }}>
        {v.trust === null ? '—' : v.trust}
      </div>
      <div className="dir-row__resp">{v.resp}</div>
      <div className="dir-row__action" onClick={(e) => e.stopPropagation()}>
        {v.sub?.includes('BLOCKED') ? (
          <button className="dir-unavail-btn" disabled>Unavailable</button>
        ) : v.sub?.includes('SUSPENDED') ? (
          <button className="dir-unavail-btn" disabled>Suspended</button>
        ) : attached ? (
          <>
            <span className="dir-attached-badge" onClick={onOpen}>Attached ✓</span>
            <button className="dir-attach-btn" onClick={onAttach}>Attach</button>
          </>
        ) : (
          <button className="dir-attach-btn" onClick={onAttach}>Attach</button>
        )}
      </div>
    </div>
  );
}