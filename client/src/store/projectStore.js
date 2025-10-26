import { create } from "zustand";
import api from "../lib/api";

const useProjectStore = create((set, get) => ({
  // 프로젝트 상태
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // --- ACTIONS ---

  // 프로젝트 목록 조회
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/projects");
      set({
        projects: response.data.projects || [],
        isLoading: false,
      });
      return { success: true, projects: response.data.projects };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "프로젝트 목록을 불러오는데 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 프로젝트 생성
  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/projects", projectData);
      const newProject = response.data.project;
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));
      return { success: true, project: newProject };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "프로젝트 생성에 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 특정 프로젝트 조회
  getProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${id}`);
      set({
        currentProject: response.data.project,
        isLoading: false,
      });
      return { success: true, project: response.data.project };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "프로젝트를 불러오는데 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
        currentProject: null,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 프로젝트 업데이트 (저장)
  updateProject: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/projects/${id}`, updateData);
      const updatedProject = response.data.project;
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id || p._id === id ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === id || state.currentProject?._id === id
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
      return { success: true, project: updatedProject };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "프로젝트 저장에 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 프로젝트 삭제
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id && p._id !== id),
        currentProject:
          state.currentProject?.id === id || state.currentProject?._id === id
            ? null
            : state.currentProject,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "프로젝트 삭제에 실패했습니다.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // 현재 프로젝트 초기화
  clearCurrentProject: () => set({ currentProject: null }),

  // 에러 초기화
  clearError: () => set({ error: null }),
}));

export default useProjectStore;
