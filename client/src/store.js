import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useStore = create((set) => ({
  lights: [
    { id: nanoid(), position: [5, 5, 0], color: '#ff0000', intensity: 10 },
    { id: nanoid(), position: [-5, 5, -5], color: '#0000ff', intensity: 10 },
  ],
  camera: {
    position: [0, 2, 8],
    fov: 75,
  },
  selectedLight: null,
  setSelectedLight: (id) => set({ selectedLight: id }),
  addLight: () =>
    set((state) => ({
      lights: [
        ...state.lights,
        { id: nanoid(), position: [0, 3, 0], color: '#ffffff', intensity: 10 },
      ],
    })),
  updateLight: (id, property, value) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? { ...light, [property]: value } : light
      ),
    })),
  updateLightPosition: (id, axis, value) =>
    set((state) => ({
      lights: state.lights.map((light) => {
        if (light.id === id) {
          const newPosition = [...light.position];
          newPosition[axis] = parseFloat(value);
          return { ...light, position: newPosition };
        }
        return light;
      }),
    })),
  updateLightPositionArray: (id, position) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? { ...light, position: position } : light
      ),
    })),
}));

export default useStore;
