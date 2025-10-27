import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const SAFE_METHODS = new Set(["get", "head", "options"]);
const AUTH_EXEMPT_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/csrf-token"
]);

let csrfToken = null;
let csrfPromise = null;
let refreshPromise = null;

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

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      await ensureCsrfToken();
      const response = await plainClient.post("/auth/refresh");
      csrfToken = null;
      await ensureCsrfToken();
      return response;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
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

  if (import.meta.env.DEV) {
    console.log(`[API Request] ${method.toUpperCase()} ${url}`, config.data);
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }

    return response;
  },
  async (error) => {
    const { response, config } = error;

    if (!response) {
      console.error("[API Error] 서버 응답 없음:", error.message);
      return Promise.reject(error);
    }

    const status = response.status;
    const originalRequest = config;
    const url = originalRequest?.url || "";
    const method = originalRequest?.method?.toLowerCase() || "get";

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

    if (
      status === 401 &&
      !originalRequest._retry &&
      !AUTH_EXEMPT_PATHS.has(url)
    ) {
      originalRequest._retry = true;

      try {
        await refreshSession();
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && !AUTH_EXEMPT_PATHS.has(url)) {
      console.warn("[API] Unauthorized - 로그인이 필요합니다.");
    } else if (status === 403) {
      console.warn("[API] Forbidden - 접근 권한이 없습니다.");
    } else if (status === 404) {
      console.warn("[API] Not Found - 요청한 리소스를 찾을 수 없습니다.");
    } else {
      console.error(
        `[API Error] ${status}: ${response.data?.message || error.message}`
      );
    }

    return Promise.reject(error);
  }
);

export const resetCsrfToken = () => {
  csrfToken = null;
};

export const forceRefreshSession = async () => {
  await refreshSession();
};

export default api;
