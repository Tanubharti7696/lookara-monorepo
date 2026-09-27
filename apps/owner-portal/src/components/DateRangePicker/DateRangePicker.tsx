// apps/owner-portal/src/components/DateRangePicker/DateRangePicker.tsx
import { useEffect, useRef, useState } from 'react';
import { useOwner } from '../../context/OwnerContext';
import './DateRangePicker.css';

export default function DateRangePicker() {
  const { dateRange, dateRanges, setDateRange } = useOwner();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div className="date-range" ref={rootRef}>
      <button
        type="button"
        className="date-range__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="1" y="3" width="14" height="11" rx="1.5" />
          <path d="M1 7h14M5 1v4M11 1v4" />
        </svg>
        {dateRange.label}
      </button>

      {open && (
        <div className="date-range__menu" role="listbox">
          {dateRanges.map((range) => (
            <button
              key={range.label}
              type="button"
              role="option"
              aria-selected={range.label === dateRange.label}
              className={`date-range__item${
                range.label === dateRange.label ? ' is-selected' : ''
              }`}
              onClick={() => {
                setDateRange(range);
                setOpen(false);
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
