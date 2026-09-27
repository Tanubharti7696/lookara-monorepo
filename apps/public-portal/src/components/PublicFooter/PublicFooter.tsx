// apps/public-portal/src/components/PublicFooter/PublicFooter.tsx
import { Link } from 'react-router-dom';
import './PublicFooter.css';

type FooterGroup = { heading: string; links: { label: string; to: string; external?: boolean }[] };

const GROUPS: FooterGroup[] = [
  {
    heading: 'Platform',
    links: [
      { label: 'Product',   to: '/product' },
      { label: 'Solutions', to: '/solutions' },
      { label: 'Tools',     to: '/tools' },
      { label: 'Pricing',   to: '/pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Security',        to: '/security' },
      { label: 'Resources',       to: '/resources' },
      { label: 'Trust & Dev Portal', to: 'https://trust-portal-ebon.vercel.app', external: true },
      { label: 'System Status',   to: '/status' },
    ],
  },
  {
    heading: 'Access',
    links: [
      { label: 'Login',          to: '/login' },
      { label: 'Request Access', to: '/request-access' },
      { label: 'Contact',        to: '/contact' },
    ],
  },
];

export default function PublicFooter() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="/" className="nav-logo" onClick={scrollToTop}>
            <div className="logo-mark" />
            <span>Lookara</span>
          </a>
          <p className="footer-tagline">
            The operating system for short-term rental professionals.
          </p>
        </div>

        {GROUPS.map(group => (
          <div key={group.heading} className="footer-links-group">
            <h5>{group.heading}</h5>
            {group.links.map(link =>
              link.external ? (
                <a key={link.to} href={link.to} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link key={link.to} to={link.to}>{link.label}</Link>
              )
            )}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2026 Lookara. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}