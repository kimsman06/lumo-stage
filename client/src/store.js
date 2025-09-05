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

  // UI State
  transformMode: 'translate', // 'translate' or 'rotate'

  // Light Management
  lights: [
    // Default lights with types, including rotation, distance, decay
    { id: nanoid(), type: 'point', position: [5, 5, 0], color: '#ff0000', intensity: 10, rotation: [0, 0, 0], distance: 0, decay: 2 },
    { id: nanoid(), type: 'spot', position: [-5, 5, -5], color: '#0000ff', intensity: 10, angle: Math.PI / 4, penumbra: 0.5, rotation: [0, 0, 0], distance: 0, decay: 2, targetPosition: [0, 0, 0] },
  ],
  selectedLight: null,

  // Actions
  setTransformMode: (mode) => set({ transformMode: mode }),
  setSelectedLight: (id) => set({ selectedLight: id }),
  addLight: (type = 'point') =>
    set((state) => {
      let newLight;
      const commonProps = { id: nanoid(), position: [0, 3, 0], color: '#ffffff', intensity: 10, rotation: [0, 0, 0] };
      switch (type) {
        case 'point':
          newLight = { ...commonProps, type: 'point', distance: 0, decay: 2 };
          break;
        case 'spot':
          newLight = { ...commonProps, type: 'spot', angle: Math.PI / 4, penumbra: 0.5, distance: 0, decay: 2, targetPosition: [0, 0, 0] };
          break;
        case 'directional':
          newLight = { ...commonProps, type: 'directional', intensity: 5, targetPosition: [0, 0, 0] };
          break;
        default:
          newLight = { ...commonProps, type: 'point', distance: 0, decay: 2 };
      }
      return { lights: [...state.lights, newLight] };
    }),
  deleteLight: (id) =>
    set((state) => ({
      lights: state.lights.filter((light) => light.id !== id),
      selectedLight: state.selectedLight === id ? null : state.selectedLight,
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
  updateMainSphereMaterial: (property, value) =>
    set((state) => ({
      [property]: value,
    })),
}));

export default useStore;