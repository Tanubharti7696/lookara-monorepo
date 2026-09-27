// src/views/reports/SmartSearch.jsx
import { useState, useEffect, useRef } from 'react';
import { SEARCH_INDEX, TYPE_LABELS } from '../../data/reports.jsx';

export default function SmartSearch({ onOpenDrawer, onFilterChange }) {
  const [query, setQuery]       = useState('');
  const [open, setOpen]         = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const [visible, setVisible]   = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setVisible([]);
      setOpen(false);
      onFilterChange('');
      return;
    }
    const ql = q.toLowerCase();
    const scored = SEARCH_INDEX
      .map(item => {
        const haystack = [item.title, item.sub, item.type, item.tag].join(' ').toLowerCase();
        const score = haystack.startsWith(ql) ? 2 : haystack.includes(ql) ? 1 : 0;
        return { ...item, score };
      })
      .filter(i => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    setVisible(scored);
    setOpen(scored.length > 0 || q.length >= 2);
    setFocusIdx(-1);
    onFilterChange(ql);
  }, [query, onFilterChange]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx(i => Math.min(i + 1, visible.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (focusIdx >= 0 && visible[focusIdx]) {
        selectSuggestion(visible[focusIdx]);
      } else {
        setOpen(false);
        const exact = visible.filter(i => i.drawerId);
        if (exact.length === 1) setTimeout(() => onOpenDrawer(exact[0].drawerId), 120);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      onFilterChange('');
    }
  };

  const selectSuggestion = (item) => {
    setQuery(item.title);
    setOpen(false);
    onFilterChange(item.title.toLowerCase());
    if (item.drawerId) setTimeout(() => onOpenDrawer(item.drawerId), 120);
  };

  const groups = visible.reduce((acc, item, idx) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push({ ...item, _idx: idx });
    return acc;
  }, {});

  return (
    <div className="reports-search-wrap" ref={wrapRef}>
      <input
        className="reports-search"
        type="text"
        placeholder="🔍  Search property, vendor, compliance…"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => { if (query.length >= 2) setOpen(true); }}
      />
      {open && (
        <div className="reports-suggestions">
          {visible.length === 0 ? (
            <div className="reports-suggestions__empty">No matches for "{query}"</div>
          ) : (
            Object.entries(groups).map(([type, items]) => (
              <div key={type}>
                <div className="reports-suggestions__label">{TYPE_LABELS[type] || type}</div>
                {items.map((item) => (
                  <div
                    key={item._idx}
                    className={`reports-suggestion ${focusIdx === item._idx ? 'focused' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(item); }}
                    onMouseEnter={() => setFocusIdx(item._idx)}
                  >
                    <span className="reports-suggestion__icon">{item.icon}</span>
                    <div className="reports-suggestion__main">
                      <div className="reports-suggestion__title">
                        {highlightMatch(item.title, query)}
                      </div>
                      <div className="reports-suggestion__sub">{item.sub}</div>
                    </div>
                    <span className={`reports-suggestion__tag reports-suggestion__tag--${item.tagCls}`}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function highlightMatch(text, q) {
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <strong key={i} style={{ color: 'var(--gold)' }}>{part}</strong>
      : part
  );
}