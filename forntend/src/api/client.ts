const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const LOCAL_ACCESS = 'avazify-access';
const LOCAL_REFRESH = 'avazify-refresh';
const SESSION_ACCESS = 'avazify-session-access';
const SESSION_REFRESH = 'avazify-session-refresh';

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function tokenStorage() {
  if (localStorage.getItem(LOCAL_REFRESH)) return localStorage;
  return sessionStorage;
}

export function hasAuthSession() {
  return Boolean(localStorage.getItem(LOCAL_REFRESH) || sessionStorage.getItem(SESSION_REFRESH));
}

export function setAuthTokens(access: string, refresh: string, remember: boolean) {
  clearAuthTokens();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(remember ? LOCAL_ACCESS : SESSION_ACCESS, access);
  storage.setItem(remember ? LOCAL_REFRESH : SESSION_REFRESH, refresh);
}

export function clearAuthTokens() {
  localStorage.removeItem(LOCAL_ACCESS);
  localStorage.removeItem(LOCAL_REFRESH);
  sessionStorage.removeItem(SESSION_ACCESS);
  sessionStorage.removeItem(SESSION_REFRESH);
}

export function getRefreshToken() {
  return localStorage.getItem(LOCAL_REFRESH) || sessionStorage.getItem(SESSION_REFRESH);
}

function getAccessToken() {
  return localStorage.getItem(LOCAL_ACCESS) || sessionStorage.getItem(SESSION_ACCESS);
}

function saveRotatedTokens(access: string, refresh?: string) {
  const storage = tokenStorage();
  const persistent = storage === localStorage;
  storage.setItem(persistent ? LOCAL_ACCESS : SESSION_ACCESS, access);
  if (refresh) storage.setItem(persistent ? LOCAL_REFRESH : SESSION_REFRESH, refresh);
}

function messageFromPayload(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.detail === 'string') return record.detail;
    const first = Object.values(record)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    if (typeof first === 'string') return first;
  }
  return fallback;
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined;
  const type = response.headers.get('content-type') || '';
  if (type.includes('application/json')) return response.json();
  return response.text();
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const response = await fetch(`${API_BASE}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    clearAuthTokens();
    return false;
  }
  const payload = await response.json() as { access: string; refresh?: string };
  saveRotatedTokens(payload.access, payload.refresh);
  return true;
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, auth = true, retry = true, headers: suppliedHeaders, ...rest } = options;
  const headers = new Headers(suppliedHeaders);
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData || body instanceof Blob) {
    requestBody = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  if (auth) {
    const access = getAccessToken();
    if (access) headers.set('Authorization', `Bearer ${access}`);
  }

  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...rest,
    headers,
    body: requestBody,
  });

  if (response.status === 401 && auth && retry && await refreshAccessToken()) {
    return apiRequest<T>(path, { ...options, retry: false });
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(messageFromPayload(payload, 'در ارتباط با سرور خطایی رخ داد.'), response.status, payload);
  }
  return payload as T;
}

export async function downloadWithAuth(path: string, filename: string) {
  let access = getAccessToken();
  let response = await fetch(`${API_BASE}${path}`, {
    headers: access ? { Authorization: `Bearer ${access}` } : {},
  });
  if (response.status === 401 && await refreshAccessToken()) {
    access = getAccessToken();
    response = await fetch(`${API_BASE}${path}`, {
      headers: access ? { Authorization: `Bearer ${access}` } : {},
    });
  }
  if (!response.ok) {
    const payload = await parseResponse(response);
    throw new ApiError(messageFromPayload(payload, 'دانلود انجام نشد.'), response.status, payload);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
