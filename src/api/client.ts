export const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('lakaya_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('lakaya_auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('lakaya_auth_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = {};
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    const text = await response.text().catch(() => '');
    if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
      if (!response.ok) {
        throw new Error(`Endpoint not found: ${endpoint}`);
      }
      // If server returned 200 with HTML (Vite fallback for missing API route)
      throw new Error(`API endpoint not found: ${endpoint}`);
    }
    data = text;
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}
