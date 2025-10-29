// @docs/development/scene-architecture-c1.md 기반 복구

export const createSceneSlice = (set, get) => ({
  cameraState: { position: [0, 2, 10], target: [0, 0, 0], focalLength: 50 },
  aspectRatio: "16:9",
  viewMode: "free", // "free" | "camera"
  transformMode: "translate", // "translate" | "rotate" | "scale"
  isTransformInteracting: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setIsTransformInteracting: (value) => set({ isTransformInteracting: value }),
  updateCameraState: (property, value) => {
    set(state => ({
      cameraState: { ...state.cameraState, [property]: value }
    }));
  },
});
