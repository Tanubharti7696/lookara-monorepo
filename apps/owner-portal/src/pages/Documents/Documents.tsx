// apps/owner-portal/src/pages/Documents/Documents.tsx
import { useMemo, useState } from 'react';
import { useOwner, type DocumentCategory } from '../../context/OwnerContext';
import { useToast } from '../../context/ToastContext';
import StatementModal from '../../components/StatementModal/StatementModal';
import DocSummaryBar from './components/DocSummaryBar';
import DocCategoryGroup from './components/DocCategoryGroup';
import DocArchive from './components/DocArchive';
import './Documents.css';

export type DocFilter = 'all' | DocumentCategory;

export default function Documents() {
  const { documents } = useOwner();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<DocFilter>('all');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [statementKey, setStatementKey] = useState<string | null>(null);

  const { activeDocs, archivedDocs } = useMemo(() => {
    const active = documents.filter((d) => !d.archived);
    const archived = documents.filter((d) => d.archived);

    return { activeDocs: active, archivedDocs: archived };
  }, [documents]);

  const matches = (doc: { name: string; propertyName: string; category: DocumentCategory }) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q || doc.name.toLowerCase().includes(q) || doc.propertyName.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || doc.category === filter;
    return matchesQuery && matchesFilter;
  };

  const visibleActive = activeDocs.filter(matches);
  const visibleArchived = archivedDocs.filter(matches);

  const categories: DocumentCategory[] = ['statements', 'legal', 'insurance', 'other'];
  const visibleCategories = categories.filter((cat) =>
    (filter === 'all' || filter === cat) && visibleActive.some((d) => d.category === cat),
  );

  const nothingVisible = visibleActive.length === 0 && (!archiveOpen || visibleArchived.length === 0);

  const handleDownload = (name: string) => {
    showToast(`Downloading ${name}…`, 'success');
  };

  const handleOpenStatement = (key: string) => {
    setStatementKey(key);
  };

  return (
    <div className="page-body">
      <DocSummaryBar
        totalDocuments={activeDocs.length}
        archivedDocuments={archivedDocs.length}
      />

      <div className="trust-banner">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M2 9l4 4 8-8" />
        </svg>
        <div>
          <div>All documents up to date</div>
          <div className="trust-banner__sub">Securely stored · visible only to you and your PM</div>
        </div>
      </div>

      <div className="search-filter-row">
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search documents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-tab${filter === 'statements' ? ' active' : ''}`}
            onClick={() => setFilter('statements')}
          >
            Statements
          </button>
          <button
            type="button"
            className={`filter-tab${filter === 'legal' ? ' active' : ''}`}
            onClick={() => setFilter('legal')}
          >
            Legal
          </button>
          <button
            type="button"
            className={`filter-tab${filter === 'insurance' ? ' active' : ''}`}
            onClick={() => setFilter('insurance')}
          >
            Insurance
          </button>
          <button
            type="button"
            className={`filter-tab${filter === 'other' ? ' active' : ''}`}
            onClick={() => setFilter('other')}
          >
            Records
          </button>
        </div>
      </div>

      {!nothingVisible && (
        <div className="doc-section">
          <div className="doc-hdr">
            <div className="doc-hdr-cell">Document</div>
            <div className="doc-hdr-cell">Property</div>
            <div className="doc-hdr-cell">Date</div>
            <div className="doc-hdr-cell">Size</div>
            <div className="doc-hdr-cell" />
          </div>

          {visibleCategories.map((cat) => (
            <DocCategoryGroup
              key={cat}
              category={cat}
              documents={visibleActive.filter((d) => d.category === cat)}
              onDownload={handleDownload}
              onOpenStatement={handleOpenStatement}
            />
          ))}
        </div>
      )}

      <DocArchive
        documents={visibleArchived}
        open={archiveOpen}
        onToggle={() => setArchiveOpen((v) => !v)}
        totalCount={archivedDocs.length}
        onDownload={handleDownload}
      />

      {nothingVisible && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No documents found</div>
          <div className="empty-sub">Try a different search term or filter</div>
        </div>
      )}

      <StatementModal
        statementKey={statementKey}
        onClose={() => setStatementKey(null)}
      />
    </div>
  );
}
