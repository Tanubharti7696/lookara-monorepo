import { useEffect, useState, type ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('lookara_token', tokenFromUrl);
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    const token = localStorage.getItem('lookara_token');

    if (!token) {
      setIsAuthenticated(false);
      const metaEnv = (import.meta as any).env;
      const publicPortalLogin = metaEnv?.VITE_PUBLIC_PORTAL_URL
        ? `${metaEnv.VITE_PUBLIC_PORTAL_URL}/login`
        : (window.location.hostname === 'localhost' ? 'http://localhost:5173/login' : 'https://public-portal-cyan.vercel.app/login');

      window.location.href = publicPortalLogin;
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderLeftColor: '#38BDF8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '14px', color: '#94A3B8' }}>Verifying session & loading portal...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
