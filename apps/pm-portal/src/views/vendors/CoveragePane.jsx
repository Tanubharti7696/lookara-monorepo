// src/views/vendors/CoveragePane.jsx
import { useState } from 'react';
import CoverageCard from './CoverageCard';
import { PROPERTIES, REGION_GROUPS } from '../../data/vendors';

export default function CoveragePane({ VD, attachments, onOpenVendor, onAttach, onReplace, onRemove, onFlash, onToast }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = PROPERTIES.filter(p => {
    const q = search.toLowerCase().trim();
    if (q && !p.name.toLowerCase().includes(q) && !p.region.toLowerCase().includes(q) && !(p.address || '').toLowerCase().includes(q)) {
      return false;
    }
    if (filter === 'issues' && !p.issues) return false;
    return true;
  });

  const regions = new Set(filtered.map(p => p.region));
  const countText = `${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'} across ${regions.size} region${regions.size === 1 ? '' : 's'}`;

  return (
    <div className="cov-pane">
      <div className="cov-toolbar">
        <div className="cov-search">
          <span style={{ color: 'var(--slate)', fontSize: 12 }}>🔍</span>
          <input
            placeholder="Search property name or address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="cov-count">{countText}</span>
        <div className="cov-filter-btns">
          <button
            className={`cov-filter-btn cov-filter-btn--issues ${filter === 'issues' ? 'active' : ''}`}
            onClick={() => setFilter(f => f === 'issues' ? 'all' : 'issues')}
          >
            ⚠ Issues
          </button>
          <button
            className={`cov-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      <div className="cov-scroll">
        {REGION_GROUPS.map(region => {
          const items = filtered.filter(p => p.region === region.key);
          if (items.length === 0) return null;
          return (
            <div key={region.key} className="cov-group">
              <div className="cov-group__header">{region.label}</div>
              {items.map(p => (
                <CoverageCard
                  key={p.name}
                  property={p}
                  attachments={attachments}
                  onOpenVendor={onOpenVendor}
                  onAttach={onAttach}
                  onReplace={onReplace}
                  onRemove={onRemove}
                  onFlash={onFlash}
                  VD={VD}
                />
              ))}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="cov-empty">No properties match your filters.</div>
        )}
      </div>
    </div>
  );
}