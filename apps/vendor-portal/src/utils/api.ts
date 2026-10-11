// apps/vendor-portal/src/utils/api.ts
export const API_BASE = "https://lookara-backend-uqhc.onrender.com";

/**
 * Authenticated fetch wrapper for Vendor Portal
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('lookara_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}
