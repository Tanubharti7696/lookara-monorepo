// src/views/properties/PropertyFilters.jsx
import { PROPERTY_TYPES, PROPERTY_STATUS, CITIES } from '../../data/properties';

export default function PropertyFilters({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const isDirty = Object.values(filters).some(v => v !== 'all');

  return (
    <div className="props-filters">
      <select className="props-filter" value={filters.type} onChange={e => set('type', e.target.value)}>
        <option value="all">All types</option>
        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select className="props-filter" value={filters.status} onChange={e => set('status', e.target.value)}>
        <option value="all">All statuses</option>
        {PROPERTY_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="props-filter" value={filters.compliance} onChange={e => set('compliance', e.target.value)}>
        <option value="all">Any compliance</option>
        <option value="compliant">Compliant</option>
        <option value="attention">Attention</option>
        <option value="overdue">Overdue</option>
      </select>
      <select className="props-filter" value={filters.city} onChange={e => set('city', e.target.value)}>
        <option value="all">All cities</option>
        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      {isDirty && (
        <button className="props-filter-clear" onClick={() => onChange({ type: 'all', status: 'all', compliance: 'all', city: 'all' })}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}