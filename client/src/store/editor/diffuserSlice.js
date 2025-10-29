// @docs/development/scene-architecture-c1.md 기반 복구

export const createDiffuserSlice = (set, get) => ({
  diffusers: [],
  selectedDiffuser: null,

  addDiffuser: () => {
    const newDiffuser = {
      id: `diffuser_${Date.now()}`,
      position: [0, 1, 0],
      width: 1,
      height: 1,
    };
    set({ diffusers: [...get().diffusers, newDiffuser] });
  },
  deleteDiffuser: (id) => {
    set({ diffusers: get().diffusers.filter(d => d.id !== id) });
  },
  setDiffuserPosition: (id, position) => {
    set({
      diffusers: get().diffusers.map(d => 
        d.id === id ? { ...d, position } : d
      )
    });
  },
});
