// apps/owner-portal/src/pages/Documents/components/DocCategoryGroup.tsx
import { DOC_CATEGORY_META, type DocumentCategory, type DocumentItem } from '../../../context/OwnerContext';
import DocRow from './DocRow';

interface DocCategoryGroupProps {
  category: DocumentCategory;
  documents: DocumentItem[];
  onDownload: (name: string) => void;
  onOpenStatement: (key: string) => void;
}

export default function DocCategoryGroup({
  category,
  documents,
  onDownload,
  onOpenStatement,
}: DocCategoryGroupProps) {
  const meta = DOC_CATEGORY_META[category];

  return (
    <div className="cat-group">
      <div className="cat-header">
        <div className="cat-header-left">
          <span className="cat-icon">{meta.icon}</span>
          <span className="cat-title">
            {meta.title}
            <span className="cat-count">· {documents.length} documents</span>
          </span>
        </div>
        <div className="cat-subtitle">{meta.subtitle}</div>
      </div>

      {documents.map((doc) => (
        <DocRow
          key={doc.id}
          doc={doc}
          onDownload={onDownload}
          onOpenStatement={onOpenStatement}
        />
      ))}
    </div>
  );
}
