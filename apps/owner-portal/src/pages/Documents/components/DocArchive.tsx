// apps/owner-portal/src/pages/Documents/components/DocArchive.tsx
import type { DocumentItem } from '../../../context/OwnerContext';
import DocRow from './DocRow';

interface DocArchiveProps {
  documents: DocumentItem[];
  open: boolean;
  onToggle: () => void;
  totalCount: number;
  onDownload: (name: string) => void;
}

export default function DocArchive({
  documents,
  open,
  onToggle,
  totalCount,
  onDownload,
}: DocArchiveProps) {
  return (
    <div className="archive-section">
      <div className="archive-heading">
        <div className="archive-heading-label">Archive</div>
        <div className="archive-heading-sub">Older records — kept for reference</div>
      </div>

      <button type="button" className="archive-toggle" onClick={onToggle}>
        <span className="archive-label">
          {open ? 'Hide' : 'Show'} older documents ({totalCount})
        </span>
        <svg
          className={`archive-icon${open ? ' open' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="archive-body">
          {documents.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              compact
              onDownload={onDownload}
              onOpenStatement={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
