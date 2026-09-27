// apps/pm-portal/src/utils/api.js
// Central API base — reads from VITE_API_URL env var in production,
// falls back to local backend in development.

export const API_BASE = "https://lookara-backend-uqhc.onrender.com/api/v1";

/**
 * Authenticated fetch wrapper — automatically attaches the JWT token.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('lookara_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  
  // If unauthorized, or if a stale token causes a 500 due to wiped DB keys, force re-login
  if (res.status === 401 || (res.status === 500 && token)) {
    // We only force logout on 500 as a fallback for this specific missing foreign key scenario
    // to ensure the user gets a fresh token after DB resets.
    const errBody = await res.clone().json().catch(() => ({}));
    if (res.status === 401 || JSON.stringify(errBody).includes('foreign key constraint')) {
      localStorage.removeItem('lookara_token');
      const publicLogin = import.meta.env.VITE_PUBLIC_PORTAL_URL
        ? `${import.meta.env.VITE_PUBLIC_PORTAL_URL}/login`
        : (window.location.hostname === 'localhost' ? 'http://localhost:5173/login' : 'https://public-portal-cyan.vercel.app/login');
      window.location.href = publicLogin;
      return res;
    }
  }
  
  return res;
}
