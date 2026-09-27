// apps/owner-portal/src/components/ModalShell/ModalShell.tsx
import type { ReactNode } from 'react';
import './ModalShell.css';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}

export default function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  width = 400,
  children,
  footer,
}: ModalShellProps) {
  return (
    <>
      <div
        className={`overlay${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`modal-shell${open ? ' is-open' : ''}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-shell__title">{title}</div>
        {subtitle && <div className="modal-shell__subtitle">{subtitle}</div>}
        <div className="modal-shell__body">{children}</div>
        {footer && <div className="modal-shell__footer">{footer}</div>}
      </div>
    </>
  );
}
