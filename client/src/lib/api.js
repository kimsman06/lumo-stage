import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const SAFE_METHODS = new Set(["get", "head", "options"]);
const AUTH_EXEMPT_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/csrf-token"
]);

let csrfToken = null;
let csrfPromise = null;

const plainClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

const fetchCsrfToken = async () => {
  console.log('[CSRF] Fetching CSRF token...');
  try {
    const response = await plainClient.get("/auth/csrf-token");
    csrfToken = response.data?.csrfToken || null;
    console.log('[CSRF] Token fetched successfully:', csrfToken ? 'YES' : 'NO');
    return csrfToken;
  } catch (error) {
    console.error('[CSRF] Failed to fetch token:', error.response?.status, error.response?.data);
    throw error;
  }
};

const ensureCsrfToken = () => {
  if (csrfToken) {
    return Promise.resolve(csrfToken);
  }

  if (!csrfPromise) {
    csrfPromise = fetchCsrfToken().finally(() => {
      csrfPromise = null;
    });
  }

  return csrfPromise;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  if (!SAFE_METHODS.has(method) && !AUTH_EXEMPT_PATHS.has(url)) {
    console.log('[CSRF] Non-safe method detected:', method.toUpperCase(), url);
    const token = await ensureCsrfToken();

    if (token) {
      config.headers["x-csrf-token"] = token;
      console.log('[CSRF] Token attached to request');
    } else {
      console.warn('[CSRF] No token available for request');
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;

    if (!response) {
      return Promise.reject(error);
    }

    const status = response.status;
    const originalRequest = config;
    const url = originalRequest?.url || "";

    if (status === 419 && !originalRequest._csrfRetried) {
      console.warn('[CSRF] Token expired (419), retrying with new token...');
      originalRequest._csrfRetried = true;

      try {
        csrfToken = null;
        await ensureCsrfToken();
        console.log('[CSRF] Retrying request with new token');
        return api(originalRequest);
      } catch (csrfError) {
        console.error('[CSRF] Retry failed:', csrfError);
        return Promise.reject(csrfError);
      }
    }

    if (status === 401 && !AUTH_EXEMPT_PATHS.has(url)) {
      resetCsrfToken();
    }

    return Promise.reject(error);
  }
);

export const resetCsrfToken = () => {
  csrfToken = null;
};

export default api;
