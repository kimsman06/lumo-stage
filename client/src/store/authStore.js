import { create } from "zustand";
import api, { resetCsrfToken } from "../lib/api";

const useAuthStore = create((set) => ({
  // 인증 상태
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // --- ACTIONS ---

  // 앱 시작 시 인증 상태 확인
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // 쿠키에 저장된 토큰으로 사용자 정보 확인
      const response = await api.get("/auth/me");
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // 인증 실패 시 (토큰 없음 또는 만료)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // 초기 체크에서는 에러를 표시하지 않음
      });
    }
  },

  // 회원가입
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", userData);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      resetCsrfToken();
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "회원가입에 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 로그인
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", credentials);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      resetCsrfToken();
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 로그아웃
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/logout");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      resetCsrfToken();
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "로그아웃에 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
