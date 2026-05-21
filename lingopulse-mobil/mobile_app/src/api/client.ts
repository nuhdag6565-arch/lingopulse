/**
 * Axios istemcisi — access token otomatik eklenir, 401'de refresh token ile yenilenir.
 * `apiClient.get/post/patch/del` yardımcıları doğrudan T döner (data unwrap).
 */
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { tokenStorage } from '../utils/storage';

const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:8000/api/v1';

const _axios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── İstek interceptor: her isteğe access token ekle ──────────────────
_axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Yanıt interceptor: 401'de token yenile ───────────────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const flushQueue = (error: unknown, token: string | null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  queue = [];
};

_axios.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: unknown) => {
    const err = error as { config?: RetryableConfig; response?: { status: number } };
    const req = err.config;

    if (err.response?.status === 401 && req && !req._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) =>
          queue.push({ resolve, reject }),
        ).then((token) => {
          req.headers.Authorization = `Bearer ${token}`;
          return _axios(req);
        });
      }

      req._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('no_refresh_token');

        const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
        );

        await tokenStorage.saveTokens(data.access_token, data.refresh_token);
        _axios.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        flushQueue(null, data.access_token);
        req.headers.Authorization = `Bearer ${data.access_token}`;
        return _axios(req);
      } catch (e) {
        flushQueue(e, null);
        await tokenStorage.clearTokens();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Tip-güvenli yardımcılar: data doğrudan döner ─────────────────────
export const apiClient = {
  get: <T>(url: string): Promise<T> =>
    _axios.get<T>(url).then((r: AxiosResponse<T>) => r.data),
  post: <T>(url: string, body?: unknown): Promise<T> =>
    _axios.post<T>(url, body).then((r: AxiosResponse<T>) => r.data),
  patch: <T>(url: string, body?: unknown): Promise<T> =>
    _axios.patch<T>(url, body).then((r: AxiosResponse<T>) => r.data),
  del: (url: string): Promise<void> =>
    _axios.delete(url).then(() => undefined),
};
