// apps/public-portal/src/components/PublicNav/PublicNav.tsx
import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import './PublicNav.css';

type SimpleLink = { kind: 'link'; to: string; label: string };
type DropdownLink = { kind: 'dropdown'; label: string; items: { to: string; label: string }[] };
type NavItem = SimpleLink | DropdownLink;

const NAV: NavItem[] = [
  { kind: 'link', to: '/',        label: 'Home' },
  { kind: 'link', to: '/product', label: 'Product' },
  {
    kind: 'dropdown',
    label: 'Solutions',
    items: [
      { to: '/solutions/pm',     label: 'Property Managers' },
      { to: '/solutions/vendor', label: 'Vendors' },
      { to: '/solutions/owner',  label: 'Property Owners' },
    ],
  },
  { kind: 'link', to: '/tools',     label: 'Tools' },
  { kind: 'link', to: '/security',  label: 'Security' },
  { kind: 'link', to: '/pricing',   label: 'Pricing' },
  { kind: 'link', to: '/resources', label: 'Resources' },
];

export default function PublicNav() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen && !dropOpen) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
        setDropOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [mobileOpen, dropOpen]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Back to top');
  };

  const solutionsActive = location.pathname.startsWith('/solutions');

  return (
    <>
      <nav ref={navRef} className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="nav-logo" onClick={scrollToTop}>
          <div className="logo-mark" />
          <span>Lookara</span>
        </Link>

        <ul className="nav-links">
          {NAV.map(item => {
            if (item.kind === 'link') {
              return (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'}>
                    {item.label}
                  </NavLink>
                </li>
              );
            }
            return (
              <li
                key={item.label}
                className="nav-item"
                onMouseEnter={() => setDropOpen(true)}
                onMouseLeave={() => setDropOpen(false)}
              >
                <button
                  type="button"
                  className={`nav-item__trigger ${solutionsActive ? 'active' : ''}`}
                  onClick={() => setDropOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={dropOpen}
                >
                  {item.label}
                </button>
                <div className={`nav-dropdown ${dropOpen ? 'open' : ''}`}>
                  {item.items.map(sub => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) => (isActive ? 'current' : '')}
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="nav-actions">
          <Link to="/login" className="nav-login" data-tip="Go to login">Login</Link>
          <Link to="/request-access" className="nav-request" data-tip="Request early access">
            Request Access
          </Link>
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`nav-mobile ${mobileOpen ? 'open' : ''}`}>
        {NAV.map(item => {
          if (item.kind === 'link') {
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {item.label}
              </NavLink>
            );
          }
          return (
            <div key={item.label} className="nav-mobile__group">
              <div className="nav-mobile__group-label">{item.label}</div>
              {item.items.map(sub => (
                <NavLink key={sub.to} to={sub.to} className="nav-mobile__sub">
                  {sub.label}
                </NavLink>
              ))}
            </div>
          );
        })}
        <Link to="/login">Login</Link>
        <Link to="/request-access" className="mobile-cta">Request Access</Link>
      </div>
    </>
  );
}