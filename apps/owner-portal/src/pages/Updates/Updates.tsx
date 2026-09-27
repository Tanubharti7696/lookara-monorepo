import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './Updates.css';

/* ── Types ────────────────────────────────────────────────── */

export type UpdateCategory = 'approval' | 'incident' | 'financial' | 'general';
export type UpdateFilter = 'all' | UpdateCategory;

interface FeedItem {
  id: string;
  category: UpdateCategory;
  title: string;
  desc: string;
  time: string;
  group: 'Today' | 'This Week' | 'Earlier';
  propertyName: string;
  icon: string;
  iconTone: 'approval' | 'incident' | 'payout' | 'statement' | 'resolved' | 'general';
  badgeLabel: string;
  badgeTone: UpdateCategory | 'resolved';
  actionLabel?: string;
  route?: string;
  unread?: 'danger' | 'amber' | 'green' | 'plain';
}

/* ── Data ─────────────────────────────────────────────────── */

const FEED: FeedItem[] = [
  {
    id: 'u1',
    category: 'incident',
    title: 'Water leak reported — Seaside Villa',
    desc: 'Bathroom ceiling leak detected by PM. Vendor dispatched. No guest disruption expected.',
    time: '2h ago',
    group: 'Today',
    propertyName: 'Seaside Villa',
    icon: '🔧',
    iconTone: 'incident',
    badgeLabel: 'Incident',
    badgeTone: 'incident',
    actionLabel: 'View incident →',
    route: '/incidents',
    unread: 'danger',
  },
  {
    id: 'u2',
    category: 'approval',
    title: 'Approval required — Leak Repair $680',
    desc: 'PM is requesting approval for emergency leak repair. Vendor on standby — act within 12h.',
    time: '2h ago',
    group: 'Today',
    propertyName: 'Seaside Villa',
    icon: '⚡',
    iconTone: 'approval',
    badgeLabel: 'Approval',
    badgeTone: 'approval',
    actionLabel: 'Review now →',
    route: '/approvals',
    unread: 'amber',
  },
  {
    id: 'u3',
    category: 'approval',
    title: 'Approval required — HVAC Service $340',
    desc: 'Preventive HVAC service before summer. PM recommends approving before peak season.',
    time: '3h ago',
    group: 'Today',
    propertyName: 'Lake Nona Villa',
    icon: '⚡',
    iconTone: 'approval',
    badgeLabel: 'Approval',
    badgeTone: 'approval',
    actionLabel: 'Review →',
    route: '/approvals',
    unread: 'amber',
  },
  {
    id: 'u4',
    category: 'financial',
    title: 'March 2026 statement ready',
    desc: 'Your March statement is finalized. Net payout: $2,870 across all properties.',
    time: 'Apr 1',
    group: 'Today',
    propertyName: 'All Properties',
    icon: '📄',
    iconTone: 'statement',
    badgeLabel: 'Statement',
    badgeTone: 'financial',
    actionLabel: 'View statement →',
    route: '/documents',
    unread: 'green',
  },
  {
    id: 'u5',
    category: 'financial',
    title: 'PM confirmed payout — $2,870',
    desc: 'Your PM confirmed the March payout was sent. Lookara recorded receipt. Expected arrival Apr 3.',
    time: 'Apr 1',
    group: 'This Week',
    propertyName: 'All Properties',
    icon: '💰',
    iconTone: 'payout',
    badgeLabel: 'Payout',
    badgeTone: 'financial',
    route: '/financials',
  },
  {
    id: 'u6',
    category: 'incident',
    title: 'Incident resolved — HVAC Malfunction',
    desc: 'HVAC unit at Lake Nona Villa repaired and tested. Resolved in 6 hours. No guest disruption.',
    time: 'Apr 3',
    group: 'This Week',
    propertyName: 'Lake Nona Villa',
    icon: '✓',
    iconTone: 'resolved',
    badgeLabel: 'Resolved',
    badgeTone: 'resolved',
    route: '/incidents',
  },
  {
    id: 'u7',
    category: 'approval',
    title: 'Approval completed — Exterior Repaint',
    desc: 'You approved the exterior repaint at Palm Grove Retreat. Work scheduled for Mar 30.',
    time: 'Mar 28',
    group: 'This Week',
    propertyName: 'Palm Grove Retreat',
    icon: '✓',
    iconTone: 'resolved',
    badgeLabel: 'Approved',
    badgeTone: 'resolved',
    route: '/approvals',
  },
  {
    id: 'u8',
    category: 'general',
    title: 'Weekly summary — week of Mar 24',
    desc: 'Occupancy 78% · $1,840 booked · 0 incidents · 1 approval pending.',
    time: 'Mar 24',
    group: 'Earlier',
    propertyName: 'All Properties',
    icon: '📊',
    iconTone: 'general',
    badgeLabel: 'Summary',
    badgeTone: 'general',
  },
  {
    id: 'u9',
    category: 'financial',
    title: 'February 2026 statement ready',
    desc: 'Net payout: $2,540. All properties included. Available in Documents.',
    time: 'Mar 1',
    group: 'Earlier',
    propertyName: 'All Properties',
    icon: '📄',
    iconTone: 'statement',
    badgeLabel: 'Statement',
    badgeTone: 'financial',
    route: '/documents',
  },
  {
    id: 'u10',
    category: 'financial',
    title: 'PM confirmed payout — $2,540',
    desc: 'Your PM confirmed the February payout was sent. Lookara recorded receipt.',
    time: 'Mar 1',
    group: 'Earlier',
    propertyName: 'All Properties',
    icon: '💰',
    iconTone: 'payout',
    badgeLabel: 'Payout',
    badgeTone: 'financial',
    route: '/financials',
  },
];

const GROUP_ORDER: FeedItem['group'][] = ['Today', 'This Week', 'Earlier'];

const FILTERS: { key: UpdateFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approval', label: 'Approvals' },
  { key: 'incident', label: 'Incidents' },
  { key: 'financial', label: 'Financial' },
  { key: 'general', label: 'General' },
];

const TONE_CLASS: Record<FeedItem['badgeTone'], string> = {
  approval: 'tag-approval',
  incident: 'tag-incident',
  financial: 'tag-financial',
  general: 'tag-general',
  resolved: 'tag-resolved',
};

/* ── Page ─────────────────────────────────────────────────── */

export default function Updates() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<UpdateFilter>('all');
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const unreadCount = useMemo(
    () => FEED.filter((item) => item.unread && !readIds.has(item.id)).length,
    [readIds],
  );

  const visibleByGroup = useMemo(() => {
    const filtered = filter === 'all' ? FEED : FEED.filter((item) => item.category === filter);
    return GROUP_ORDER
      .map((group) => ({ group, items: filtered.filter((item) => item.group === group) }))
      .filter((g) => g.items.length > 0);
  }, [filter]);

  const handleItemClick = (item: FeedItem) => {
    setReadIds((prev) => new Set(prev).add(item.id));
    if (item.route) navigate(item.route);
    else showToast(item.title, 'info');
  };

  const markAllRead = () => {
    setReadIds(new Set(FEED.map((item) => item.id)));
    showToast('All updates marked as read', 'success');
  };

  return (
    <div className="updates-page">
      {/* Topbar pill + mark read */}
      <div className="updates-toolbar">
        {unreadCount > 0 && (
          <div className="unread-pill">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="4" />
            </svg>
            {unreadCount} unread
          </div>
        )}
        <button type="button" className="mark-read-btn" onClick={markAllRead}>
          Mark all as read
        </button>
      </div>

      <div className="updates-layout">
        {/* ── Feed ─────────────────────────────────────────── */}
        <div className="feed-column">
          <div className="filter-row">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`filter-tab${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visibleByGroup.map(({ group, items }, groupIndex) => (
            <div key={group}>
              <div
                className="update-group-label"
                style={groupIndex > 0 ? { marginTop: 16 } : undefined}
              >
                {group}
              </div>
              {items.map((item) => (
                <UpdateFeedCard
                  key={item.id}
                  item={item}
                  unread={Boolean(item.unread) && !readIds.has(item.id)}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          ))}

          {visibleByGroup.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No updates in this category</div>
              <div className="empty-sub">Try a different filter</div>
            </div>
          )}
        </div>

        {/* ── Signals panel ────────────────────────────────── */}
        <aside className="signals-panel">
          <ActiveSignals />
          <DeliverySummary onManage={() => navigate('/settings')} />
          <UpcomingPanel />
        </aside>
      </div>
    </div>
  );
}

/* ── Feed card ────────────────────────────────────────────── */

function UpdateFeedCard({
  item,
  unread,
  onClick,
}: {
  item: FeedItem;
  unread: boolean;
  onClick: () => void;
}) {
  const unreadClass = unread && item.unread ? ` unread-${item.unread}` : '';

  return (
    <button
      type="button"
      className={`update-item${unreadClass}`}
      onClick={onClick}
    >
      <span className="update-icon-stack">
        <span className={`update-icon-wrap ui-${item.iconTone}`}>{item.icon}</span>
        {unread && <span className="unread-dot" />}
      </span>

      <span className="update-body">
        <span className="update-header">
          <span className="update-title">{item.title}</span>
          <span className="update-time">{item.time}</span>
        </span>
        <span className="update-desc">{item.desc}</span>
        <span className="update-meta">
          <span className={`update-tag ${TONE_CLASS[item.badgeTone]}`}>{item.badgeLabel}</span>
          <span className="update-prop">{item.propertyName}</span>
          {item.actionLabel && (
            <span className="update-action-link">{item.actionLabel}</span>
          )}
        </span>
      </span>
    </button>
  );
}

/* ── Signals ──────────────────────────────────────────────── */

function ActiveSignals() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const signals = [
    {
      label: 'Approvals pending',
      tone: 'warning' as const,
      count: '2',
      onClick: () => navigate('/approvals'),
    },
    {
      label: 'Active incidents',
      tone: 'danger' as const,
      count: '1',
      onClick: () => navigate('/incidents'),
    },
    {
      label: 'Payout in progress',
      tone: 'gold' as const,
      count: '$980',
      onClick: () => showToast('Payout in progress — Apr 15', 'info'),
    },
    {
      label: 'Documents',
      tone: 'success' as const,
      count: 'Up to date',
      onClick: () => showToast('No issues with documents', 'info'),
    },
  ];

  return (
    <div className="signal-card">
      <div className="signal-hdr">
        <span className="signal-title">Active Signals</span>
      </div>
      {signals.map((s) => (
        <button key={s.label} type="button" className="signal-row" onClick={s.onClick}>
          <span className="signal-left">
            <span
              className="signal-dot"
              style={{
                background:
                  s.tone === 'danger' ? 'var(--danger)' :
                  s.tone === 'warning' ? 'var(--warning)' :
                  s.tone === 'gold' ? 'var(--gold)' :
                  'var(--success)',
              }}
            />
            <span className="signal-label">{s.label}</span>
          </span>
          <span className={`signal-count sc-${s.tone === 'gold' ? 'amber' : s.tone}`}>
            {s.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function DeliverySummary({ onManage }: { onManage: () => void }) {
  return (
    <div className="signal-card">
      <div className="signal-hdr">
        <span className="signal-title">Delivery Channels</span>
        <button type="button" className="signal-manage" onClick={onManage}>
          Manage →
        </button>
      </div>
      <div className="delivery-summary">
        <div className="delivery-summary-row">
          <span className="delivery-summary-label">Push</span>
          <span className="delivery-chip dc-on">
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 9l4 4 8-8" />
            </svg>
            On
          </span>
        </div>
        <div className="delivery-summary-row">
          <span className="delivery-summary-label">Email</span>
          <span className="delivery-chip dc-on">
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 9l4 4 8-8" />
            </svg>
            On
          </span>
        </div>
        <div className="delivery-summary-row">
          <span className="delivery-summary-label">SMS</span>
          <span className="delivery-chip dc-off">Off</span>
        </div>
        <div className="delivery-summary-footnote">
          Controlled in Settings → Alerts &amp; Updates
        </div>
      </div>
    </div>
  );
}

function UpcomingPanel() {
  return (
    <div className="signal-card">
      <div className="signal-hdr">
        <span className="signal-title">Upcoming</span>
      </div>
      <div className="upcoming-panel">
        <div className="upcoming-row">
          <span className="upcoming-label">Next payout</span>
          <span className="upcoming-value upcoming-value--gold">Apr 15 · $980</span>
        </div>
        <div className="upcoming-row">
          <span className="upcoming-label">Weekly summary</span>
          <span className="upcoming-value">Monday</span>
        </div>
        <div className="upcoming-row upcoming-row--last">
          <span className="upcoming-label">April statement</span>
          <span className="upcoming-value">May 1</span>
        </div>
      </div>
    </div>
  );
}
