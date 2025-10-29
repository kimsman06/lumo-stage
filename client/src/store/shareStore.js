import { create } from "zustand";
import api from "../lib/api";

const createDefaultShareConfig = () => ({
  token: null,
  permission: "view",
  expiresAt: null,
  isActive: true,
  createdAt: null,
  updatedAt: null,
  id: null,
});

const mapShareConfig = (responsePayload = {}) => {
  const share = responsePayload?.share ?? responsePayload;

  return {
    token: share.token ?? null,
    permission: share.permission ?? "view",
    expiresAt: share.expiresAt ?? null,
    isActive: share.isActive ?? true,
    createdAt: share.createdAt ?? null,
    updatedAt: share.updatedAt ?? null,
    id: share.id ?? null,
  };
};

const extractErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.message ||
    error.message ||
    fallbackMessage ||
    "요청 처리 중 오류가 발생했습니다"
  );
};

const useShareStore = create((set, get) => ({
  // 상태
  shareConfig: createDefaultShareConfig(),
  sharedProject: null,
  isLoading: false,
  error: null,

  // 액션: 공유 링크 생성
  generateShareLink: async (projectId, config = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${projectId}/share`, {
        permission: config.permission ?? "view",
        expiresAt: config.expiresAt ?? null,
        isActive: config.isActive ?? true,
      });
      const share = response.data?.share ?? response.data;

      set({
        shareConfig: mapShareConfig(share),
        isLoading: false,
      });

      return share;
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "공유 링크 생성에 실패했습니다"
      );
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // 액션: 공유 설정 조회
  getShareConfig: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}/share`);
      const share = response.data?.share ?? response.data;

      set({
        shareConfig: mapShareConfig(share),
        isLoading: false,
      });

      return share;
    } catch (error) {
      if (error.response?.status === 404) {
        set({
          shareConfig: createDefaultShareConfig(),
          isLoading: false,
        });
        return null;
      }

      const message = extractErrorMessage(
        error,
        "공유 설정 조회에 실패했습니다"
      );
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // 액션: 공유 설정 업데이트
  updateShareConfig: async (projectId, config) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/projects/${projectId}/share`, config);
      const share = response.data?.share ?? response.data;

      set({
        shareConfig: mapShareConfig(share),
        isLoading: false,
      });

      return share;
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "공유 설정 업데이트에 실패했습니다"
      );
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // 액션: 공유 비활성화
  deactivateShare: async (projectId) => {
    return get().updateShareConfig(projectId, { isActive: false });
  },

  // 액션: 공유 활성화
  activateShare: async (projectId) => {
    return get().updateShareConfig(projectId, { isActive: true });
  },

  // 액션: 토큰 재생성
  regenerateToken: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(
        `/projects/${projectId}/share/regenerate`
      );
      const share = response.data?.share ?? response.data;

      set({
        shareConfig: mapShareConfig(share),
        isLoading: false,
      });

      return share;
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "토큰 재생성에 실패했습니다"
      );
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // 액션: 공유된 프로젝트 조회 (토큰으로)
  getSharedProject: async (token) => {
    set({ isLoading: true, error: null, sharedProject: null });
    try {
      const response = await api.get(`/share/${token}`);
      const data = response.data;

      set({
        sharedProject: data,
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "공유된 프로젝트를 불러올 수 없습니다"
      );
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // 상태 초기화
  resetShareState: () => {
    set({
      shareConfig: createDefaultShareConfig(),
      sharedProject: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default useShareStore;
