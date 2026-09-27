// src/components/devtrust/Primitives.tsx
import type { ReactNode } from 'react';

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dt-info">
      <div className="dt-info__title">{title}</div>
      <div className="dt-info__text">{children}</div>
    </div>
  );
}

export function WarningBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dt-warning">
      <div className="dt-warning__title">{title}</div>
      <div className="dt-warning__text">{children}</div>
    </div>
  );
}

export function MetricCard({
  label, value, note, success,
}: { label: string; value: string; note: string; success?: boolean }) {
  return (
    <div className="dt-metric">
      <div className="dt-metric__label">{label}</div>
      <div className={`dt-metric__value${success ? ' is-success' : ''}`}>{value}</div>
      <div className="dt-metric__note">{note}</div>
    </div>
  );
}

export function TableBadge({ kind, children }: { kind: 'yes'|'no'|'never'|'planned'|'internal'; children: ReactNode }) {
  return <span className={`dt-badge dt-badge--${kind}`}>{children}</span>;
}

export function StatusPill({ kind, children }: { kind: 'operational'|'degraded'; children: ReactNode }) {
  return (
    <span className={`dt-pill dt-pill--${kind}`}>
      <span className="dt-pill__dot" />
      {children}
    </span>
  );
}