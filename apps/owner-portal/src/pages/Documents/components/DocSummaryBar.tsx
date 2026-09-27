// apps/owner-portal/src/pages/Documents/components/DocSummaryBar.tsx
interface DocSummaryBarProps {
  totalDocuments: number;
  archivedDocuments: number;
}

export default function DocSummaryBar({ totalDocuments, archivedDocuments }: DocSummaryBarProps) {
  return (
    <div className="summary-bar">
      <div className="sum-stat">
        <div className="sum-stat-lbl">Total Documents</div>
        <div className="sum-stat-val">{totalDocuments}</div>
        <div className="sum-stat-sub">Across all categories</div>
      </div>

      <div className="sum-stat">
        <div className="sum-stat-lbl">Last Updated</div>
        <div className="sum-stat-val sum-stat-val--sm">Apr 1, 2026</div>
        <div className="sum-stat-sub">March statement added</div>
      </div>

      <div className="sum-stat secure">
        <div className="sum-stat-lbl">Storage</div>
        <div className="sum-stat-val green">Secure</div>
        <div className="sum-stat-sub">Encrypted</div>
      </div>

      <div className="sum-stat">
        <div className="sum-stat-lbl">Archive</div>
        <div className="sum-stat-val sum-stat-val--xs">{archivedDocuments} older</div>
        <div className="sum-stat-sub">Kept for reference</div>
      </div>
    </div>
  );
}
