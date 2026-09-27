// src/components/devtrust/FlowPanel.tsx
import { useState } from 'react';
import type { ReactNode } from 'react';

export default function FlowPanel({
  number, title, defaultOpen, children,
}: {
  number?: string | number;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`dt-flow${open ? ' is-open' : ''}`}>
      <button type="button" className="dt-flow__head" onClick={() => setOpen(!open)}>
        <div className="dt-flow__title">
          {number !== undefined && <span className="dt-flow__num">{number}</span>}
          {title}
        </div>
        <span className="dt-flow__toggle">▼</span>
      </button>
      {open && <div className="dt-flow__body">{children}</div>}
    </div>
  );
}