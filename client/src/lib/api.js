import axios from "axios";

// 프로덕션에서는 same-origin이므로 상대 경로 사용
// 개발 환경에서는 절대 경로 사용
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");
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
  const response = await plainClient.get("/auth/csrf-token");
  csrfToken = response.data?.csrfToken || null;
  return csrfToken;
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
    const token = await ensureCsrfToken();

    if (token) {
      config.headers["x-csrf-token"] = token;
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
      originalRequest._csrfRetried = true;

      try {
        csrfToken = null;
        await ensureCsrfToken();
        return api(originalRequest);
      } catch (csrfError) {
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
