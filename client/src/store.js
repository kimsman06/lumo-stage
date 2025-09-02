import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useStore = create((set) => ({
  // Global Scene Settings
  camera: {
    position: [0, 2, 8],
    fov: 75,
  },
  mainSphereRoughness: 0.2, // For specular control
  mainSphereMetalness: 0.7, // For specular control

  // Light Management
  lights: [
    // Default lights with types (removed rectArea if present)
    { id: nanoid(), type: 'point', position: [5, 5, 0], color: '#ff0000', intensity: 10 },
    { id: nanoid(), type: 'spot', position: [-5, 5, -5], color: '#0000ff', intensity: 10, angle: Math.PI / 4, penumbra: 0.5 },
  ],
  selectedLight: null,

  // Actions
  setSelectedLight: (id) => set({ selectedLight: id }),
  addLight: (type = 'point') =>
    set((state) => {
      let newLight;
      switch (type) {
        case 'point':
          newLight = { id: nanoid(), type: 'point', position: [0, 3, 0], color: '#ffffff', intensity: 10 };
          break;
        case 'spot':
          newLight = { id: nanoid(), type: 'spot', position: [0, 3, 0], color: '#ffffff', intensity: 10, angle: Math.PI / 4, penumbra: 0.5 };
          break;
        case 'directional':
          newLight = { id: nanoid(), type: 'directional', position: [0, 5, 0], color: '#ffffff', intensity: 5, targetPosition: [0, 0, 0] };
          break;
        default:
          newLight = { id: nanoid(), type: 'point', position: [0, 3, 0], color: '#ffffff', intensity: 10 };
      }
      return { lights: [...state.lights, newLight] };
    }),
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
  updateMainSphereMaterial: (property, value) =>
    set((state) => ({
      [property]: value,
    })),
}));

export default useStore;
