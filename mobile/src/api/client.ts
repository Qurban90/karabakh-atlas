import axios, { AxiosError, AxiosHeaders } from 'axios';

/**
 * API client with:
 *  - token interceptor (Authorization: Bearer …)
 *  - centralized error extraction (Azerbaijani server messages)
 *  - offline cache: successful GETs are stored in localStorage and replayed
 *    when the network is unreachable (“Offline Map Caching” feature)
 */

const CACHE_PREFIX = 'qdx:cache:';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
});

/* ---------- auth token ---------- */

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${authToken}`);
    config.headers = headers;
  }
  return config;
});

/* ---------- offline cache ---------- */

function cacheKey(config: { url?: string; params?: Record<string, unknown> }) {
  const params = config.params
    ? '?' +
      Object.entries(config.params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${String(v)}`)
        .join('&')
    : '';
  return `${CACHE_PREFIX}${config.url ?? ''}${params}`;
}

function cacheSet(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
  } catch {
    /* storage full — cache is best-effort */
  }
}

function cacheGet(key: string): { t: number; data: unknown } | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function cacheStats() {
  let count = 0;
  let newest = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      count++;
      const entry = cacheGet(key);
      if (entry && entry.t > newest) newest = entry.t;
    }
  }
  return { count, lastSync: newest ? new Date(newest) : null };
}

export function clearCache() {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

let offlineNotifier: (() => void) | null = null;
let lastOfflineToast = 0;
export function registerOfflineNotifier(fn: () => void) {
  offlineNotifier = fn;
}

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      cacheSet(cacheKey(response.config), response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    const config = error.config;
    // Offline replay for GETs when the network is unreachable. Behind a dev/nginx
    // proxy a dead upstream surfaces as 5xx gateway errors rather than a missing
    // response, so those count as "offline" too.
    const gatewayDown = !!error.response && [500, 502, 503, 504].includes(error.response.status);
    if ((!error.response || gatewayDown) && config && config.method === 'get') {
      const cached = cacheGet(cacheKey(config));
      if (cached) {
        if (offlineNotifier && Date.now() - lastOfflineToast > 8000) {
          lastOfflineToast = Date.now();
          offlineNotifier();
        }
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK (offline cache)',
          headers: {},
          config,
          fromCache: true
        });
      }
    }
    return Promise.reject(error);
  }
);

/* ---------- error helper ---------- */

interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: { field: string; message: string }[] };
}

export function apiErrorMessage(err: unknown, fallback = 'Xəta baş verdi — yenidən cəhd edin'): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) return body.error.message;
    if (!err.response) return 'Şəbəkə əlçatan deyil — internet bağlantısını yoxlayın';
  }
  return fallback;
}

export function apiErrorDetails(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body?.error?.details) {
      return Object.fromEntries(body.error.details.map((d) => [d.field, d.message]));
    }
  }
  return {};
}
