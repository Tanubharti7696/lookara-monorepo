// apps/owner-portal/src/pages/Approvals/components/ApprovalFilter.tsx
export type FilterKey = 'all' | 'urgent' | 'week';

interface ApprovalFilterProps {
  value: FilterKey;
  onChange: (key: FilterKey) => void;
}

const TABS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'week', label: 'This Week' },
];

export default function ApprovalFilter({ value, onChange }: ApprovalFilterProps) {
  return (
    <div className="filter-row" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={value === tab.key}
          className={`filter-tab${value === tab.key ? ' active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
