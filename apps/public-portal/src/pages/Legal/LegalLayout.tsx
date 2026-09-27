// apps/public-portal/src/pages/Legal/LegalLayout.tsx
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './LegalLayout.css';

const ARROW_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export type TocItem = { id: string; num: string; label: string };

type Props = {
  tag: string;
  title: string;
  meta: string[];
  intro: ReactNode;
  tocNote?: ReactNode;
  toc: TocItem[];
  footerEntity: ReactNode;
  children: ReactNode;
};

export default function LegalLayout({
  tag,
  title,
  meta,
  intro,
  tocNote,
  toc,
  footerEntity,
  children,
}: Props) {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <div className="legal-nav-logo">
          <div className="legal-logo-mark" />
          <span>Lookara</span>
        </div>
        <Link to="/" className="legal-nav-back">
          {ARROW_LEFT}
          Back to site
        </Link>
      </nav>

      <div className="legal-wrap">
        <aside className="legal-toc">
          <div className="legal-toc-label">Contents</div>
          {tocNote && <p className="legal-toc-note">{tocNote}</p>}
          <div className="legal-toc-list">
            {toc.map((item) => (
              <div key={item.id} className="legal-toc-item">
                <a href={`#${item.id}`}>
                  <span className="legal-toc-num">{item.num}</span>
                  {item.label}
                </a>
              </div>
            ))}
          </div>
        </aside>

        <main className="legal-content">
          <header className="legal-header">
            <span className="legal-tag">{tag}</span>
            <h1 className="legal-title">{title}</h1>
            <div className="legal-meta">
              {meta.map((m) => <span key={m}>{m}</span>)}
            </div>
            <p className="legal-intro">{intro}</p>
          </header>

          {children}
        </main>
      </div>

      <footer className="legal-footer">
        <div className="legal-footer-copy">
          © 2026 Lookara Systems LLC. All rights reserved.
        </div>
        <div className="legal-footer-entity">{footerEntity}</div>
      </footer>
    </div>
  );
}