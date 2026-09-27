// apps/owner-portal/src/components/PropertySelector/PropertySelector.tsx
import { useEffect, useRef, useState } from 'react';
import { ALL_PROPERTIES, useOwner } from '../../context/OwnerContext';
import './PropertySelector.css';

export default function PropertySelector() {
  const {
    properties,
    selectedProperty,
    selectedPropertyId,
    setSelectedPropertyId,
  } = useOwner();

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

  const label = selectedProperty
    ? selectedProperty.name
    : `All Properties (${properties.length})`;

  const select = (id: string) => {
    setSelectedPropertyId(id);
    setOpen(false);
  };

  return (
    <div className="property-selector" ref={rootRef}>
      <button
        type="button"
        className="property-selector__trigger"
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
          <path d="M2 6l6-4 6 4v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z" />
        </svg>
        <span className="property-selector__label">{label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="property-selector__menu" role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={selectedPropertyId === ALL_PROPERTIES}
            className={`property-selector__item${
              selectedPropertyId === ALL_PROPERTIES ? ' is-selected' : ''
            }`}
            onClick={() => select(ALL_PROPERTIES)}
          >
            All Properties ({properties.length})
          </button>

          {properties.map((property) => (
            <button
              key={property.id}
              type="button"
              role="option"
              aria-selected={selectedPropertyId === property.id}
              className={`property-selector__item${
                selectedPropertyId === property.id ? ' is-selected' : ''
              }`}
              onClick={() => select(property.id)}
            >
              <span className="property-selector__name">{property.name}</span>
              <span className="property-selector__meta">{property.location}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
