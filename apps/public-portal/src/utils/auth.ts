// src/utils/auth.ts
// Central auth utility for the unified Lookara platform

const TOKEN_KEY = 'lookara_token';
const USER_KEY = 'lookara_user';

export type UserRole = 'pm_admin' | 'ops_manager' | 'coordinator' | 'viewer' | 'owner' | 'vendor' | 'super_admin' | 'developer';

export interface LookaraUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
}

export const API_BASE = import.meta.env.VITE_API_URL || 'https://deploy-eight-blush-92.vercel.app';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): LookaraUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user: LookaraUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Returns the correct dashboard path for a given role */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'pm_admin':
    case 'ops_manager':
    case 'coordinator':
    case 'viewer':
      return '/pm/dashboard';
    case 'owner':
      return '/owner/dashboard';
    case 'vendor':
      return '/vendor/dashboard';
    case 'super_admin':
      return '/admin/dashboard';
    case 'developer':
      return '/trust/dashboard';
    default:
      return '/pm/dashboard';
  }
}

/** Decode JWT payload without verification (for reading role on the client) */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Mock login for demo credentials while real backend auth is being wired */
export async function loginWithCredentials(email: string, password: string): Promise<{ user: LookaraUser; token: string }> {
  // Try real backend first
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      return { user: data.user, token: data.accessToken || data.token };
    }
  } catch {
    // Backend not reachable — fall through to demo mode
  }

  // Demo fallback (matches client's seeded credentials)
  const demoUsers: Record<string, LookaraUser> = {
    'pm@lookara.com':    { id: 'demo-pm',    email: 'pm@lookara.com',    name: 'PM Admin',         role: 'pm_admin',    organizationId: 'org-1', organizationName: 'Blue Wave Hospitality' },
    'ops@lookara.com':   { id: 'demo-ops',   email: 'ops@lookara.com',   name: 'Ops Manager',      role: 'ops_manager', organizationId: 'org-2', organizationName: 'Coastal STR' },
    'owner@lookara.com': { id: 'demo-owner', email: 'owner@lookara.com', name: 'Marcus Sterling',   role: 'owner' },
    'vendor@lookara.com':{ id: 'demo-vendor',email: 'vendor@lookara.com',name: 'Apex Maintenance',  role: 'vendor' },
    'admin@lookara.com': { id: 'demo-admin', email: 'admin@lookara.com', name: 'Lookara Super Admin',role: 'super_admin' },
  };

  const user = demoUsers[email.toLowerCase()];
  if (user && password === 'password123') {
    return { user, token: `demo-token-${user.role}-${Date.now()}` };
  }

  throw new Error('Invalid email or password');
}
