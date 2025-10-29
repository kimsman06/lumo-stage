// @docs/development/scene-architecture-c1.md 기반 복구

export const createPersistenceSlice = (set, get) => ({
  // 현재 상태를 직렬화하는 로직
  serializeState: () => {
    const { lights, mannequins, diffusers, cameraState, aspectRatio } = get();
    return {
      lights,
      mannequins,
      diffusers,
      cameraState,
      aspectRatio,
    };
  },

  // 저장된 상태를 스토어에 로드하는 로직
  loadState: (sceneData) => {
    if (!sceneData) return;
    set({
      lights: sceneData.lights || [],
      mannequins: sceneData.mannequins || [],
      diffusers: sceneData.diffusers || [],
      cameraState: sceneData.cameraState || get().cameraState,
      aspectRatio: sceneData.aspectRatio || get().aspectRatio,
    });
  },
});
