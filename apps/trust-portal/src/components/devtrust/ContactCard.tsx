// src/components/devtrust/ContactCard.tsx
import type { ReactNode } from 'react';
import { useCopy } from '../../hooks/useCopy';

export default function ContactCard({
  title, email, sla,
}: { title: string; email: string; sla: ReactNode }) {
  const { copied, copy } = useCopy();
  return (
    <div className="dt-contact">
      <div className="dt-contact__title">{title}</div>
      <div className="dt-contact__row">
        <a href={`mailto:${email}`} className="dt-contact__email">{email}</a>
        <button
          type="button"
          className={`dt-contact__copy${copied ? ' is-copied' : ''}`}
          onClick={() => copy(email)}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="dt-contact__sla">{sla}</div>
    </div>
  );
}