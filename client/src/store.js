import { create } from 'zustand';
import { nanoid } from 'nanoid';

// Define the initial pose for a new mannequin
const createInitialPose = () => ({
  head_02: { x: 0, y: 0, z: 0 },
  l_shoulder_03: { x: 0, y: 0, z: 0 },
  l_forearm_04: { x: 0, y: 0, z: 0 },
  l_hand_05: { x: 0, y: 0, z: 0 },
  r_shoulder_06: { x: 0, y: 0, z: 0 },
  r_forearm_07: { x: 0, y: 0, z: 0 },
  r_hand_08: { x: 0, y: 0, z: 0 },
  waist_00: { x: 0, y: 0, z: 0 },
  l_thigh_09: { x: 0, y: 0, z: 0 },
  l_shin_010: { x: 0, y: 0, z: 0 },
  l_foot_012: { x: 0, y: 0, z: 0 },
  r_thigh_013: { x: 0, y: 0, z: 0 },
  r_shin_014: { x: 0, y: 0, z: 0 },
  r_foot_016: { x: 0, y: 0, z: 0 },
});

const firstMannequinId = nanoid();

const useStore = create((set, get) => ({
  // Mannequin Management
  mannequins: [
    {
      id: firstMannequinId,
      position: [0, -1.5, 0],
      pose: createInitialPose(),
    }
  ],
  selectedMannequinId: firstMannequinId,

  // Global Scene Settings
  cameraState: {
    position: [0, 2, 8],
    target: [0, 0, 0],
    focalLength: 50,
  },

  // UI State
  viewMode: 'free', // 'free' or 'camera'
  transformMode: 'translate', // 'translate' or 'rotate'
  isDragging: false, // To manage controls conflict

  // Light Management
  lights: [
    { id: nanoid(), type: 'point', position: [5, 5, 0], color: '#ff0000', intensity: 10, rotation: [0, 0, 0], distance: 0, decay: 2 },
    { id: nanoid(), type: 'spot', position: [-5, 5, -5], color: '#0000ff', intensity: 10, angle: Math.PI / 4, penumbra: 0.5, rotation: [0, 0, 0], distance: 0, decay: 2, targetPosition: [0, 0, 0] },
  ],
  selectedLight: null,

  // --- ACTIONS ---

  // Mannequin Actions
  addMannequin: () => set((state) => ({
    mannequins: [...state.mannequins, {
      id: nanoid(),
      position: [Math.random() * 4 - 2, -1.5, Math.random() * 4 - 2],
      pose: createInitialPose(),
    }]
  })),
  selectMannequin: (id) => set({ selectedMannequinId: id }),
  deleteMannequin: (id) => set((state) => ({
    mannequins: state.mannequins.filter(m => m.id !== id),
    selectedMannequinId: state.selectedMannequinId === id ? (state.mannequins[0]?.id || null) : state.selectedMannequinId,
  })),
  initializePose: (id, pose) => set((state) => ({
    mannequins: state.mannequins.map(m => 
      m.id === id ? { ...m, pose } : m
    ),
  })),
  setBoneRotation: (id, boneName, axis, value) => set((state) => ({
    mannequins: state.mannequins.map(m => {
      if (m.id === id) {
        return {
          ...m,
          pose: {
            ...m.pose,
            [boneName]: { ...m.pose[boneName], [axis]: value },
          }
        };
      }
      return m;
    }),
  })),

  // Other Actions
  setIsDragging: (isDragging) => set({ isDragging }),
  setViewMode: (mode) => set({ viewMode: mode }),
  updateCameraState: (property, value) =>
    set((state) => ({
      cameraState: { ...state.cameraState, [property]: value },
    })),
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
}));

export default useStore;