// @docs/development/scene-architecture-c1.md 기반 복구

export const createLightsSlice = (set, get) => ({
  lights: [],
  selectedLight: null,

  setSelectedLight: (id) => set({ selectedLight: id }),

  addLight: (type) => {
    const newLight = {
      id: `light_${Date.now()}`,
      type,
      position: [0, 2, 0],
      intensity: 1,
      color: '#ffffff',
      // ... 타입별 기본 속성 추가 필요
    };
    set({ lights: [...get().lights, newLight] });
  },

  deleteLight: (id) => {
    set({ lights: get().lights.filter(light => light.id !== id) });
  },

  updateLight: (id, property, value) => {
    set({
      lights: get().lights.map(light =>
        light.id === id ? { ...light, [property]: value } : light
      )
    });
  },
});
