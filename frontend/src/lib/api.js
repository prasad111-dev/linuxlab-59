const API_URL = import.meta.env.VITE_API_URL || '/api';
export const WS_URL =
  import.meta.env.VITE_WS_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`;

const TOKEN_KEY = 'linuxlab_token';
let token = localStorage.getItem(TOKEN_KEY) || '';

export function setToken(t) {
  token = t || '';
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getToken() {
  return token;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api(path, { method = 'GET', body, auth = true, ...opts } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...opts,
    });
  } catch {
    throw new ApiError('Network error — is the backend running?', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data);
  }
  return data;
}

export function terminalSocketUrl(attemptId, ticket) {
  return `${WS_URL}/api/ws/terminal?attemptId=${encodeURIComponent(attemptId)}&ticket=${encodeURIComponent(ticket)}`;
}

export function googleAuthUrl() {
  return `${API_URL}/auth/google?frontend=${encodeURIComponent(window.location.origin)}`;
}
