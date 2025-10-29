// @docs/development/scene-architecture-c1.md 기반 복구

export const createMannequinSlice = (set, get) => ({
  mannequins: [],
  selectedMannequinId: null,
  highlightedBone: null,

  addMannequin: () => {
    const newMannequin = {
      id: `mannequin_${Date.now()}`,
      position: [0, -1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    set({ mannequins: [...get().mannequins, newMannequin] });
  },
  selectMannequin: (id) => set({ selectedMannequinId: id }),
  deleteMannequin: (id) => {
    set({ mannequins: get().mannequins.filter(m => m.id !== id) });
  },
  setMannequinPosition: (id, position) => {
    set({
      mannequins: get().mannequins.map(m => 
        m.id === id ? { ...m, position } : m
      )
    });
  },
  setHighlightedBone: (boneName) => set({ highlightedBone: boneName }),
});
