const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || "http://localhost:4000";

export const API_BASE_URL = import.meta.env.VITE_API_URL || `${SERVER_ORIGIN}/api`;
export const GOOGLE_OAUTH_URL =
  import.meta.env.VITE_OAUTH_GOOGLE_URL || `${API_BASE_URL}/auth/google`;
export const NAVER_OAUTH_URL =
  import.meta.env.VITE_OAUTH_NAVER_URL || `${API_BASE_URL}/auth/naver`;
