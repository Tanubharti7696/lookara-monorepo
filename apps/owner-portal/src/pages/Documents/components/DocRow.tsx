// apps/owner-portal/src/pages/Documents/components/DocRow.tsx
import type { DocumentItem } from '../../../context/OwnerContext';

interface DocRowProps {
  doc: DocumentItem;
  onDownload: (name: string) => void;
  onOpenStatement: (key: string) => void;
  compact?: boolean;
}

export default function DocRow({ doc, onDownload, onOpenStatement, compact = false }: DocRowProps) {
  const canOpenStatement = Boolean(doc.statementKey);

  const handleView = () => {
    if (doc.statementKey) {
      onOpenStatement(doc.statementKey);
      return;
    }
    // fallback — most docs don't have an interactive view
    onDownload(doc.name);
  };

  return (
    <div className="doc-row" style={compact ? { opacity: 0.65 } : undefined}>
      <div className="doc-name">
        <span className="doc-type-icon">{doc.typeIcon}</span>
        {doc.name}
        {doc.isNew && <span className="new-badge">New</span>}
      </div>
      <div className="doc-prop">{doc.propertyName}</div>
      <div className="doc-date">{doc.date}</div>
      <div className="doc-size">{doc.size}</div>
      <div className="doc-actions">
        {!compact && (
          <button type="button" className="doc-btn" onClick={handleView}>
            {canOpenStatement ? 'View' : 'Open'}
          </button>
        )}
        <button type="button" className="doc-btn primary" onClick={() => onDownload(doc.name)}>
          ↓ PDF
        </button>
      </div>
    </div>
  );
}
