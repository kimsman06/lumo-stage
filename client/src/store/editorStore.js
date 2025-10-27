import { create } from "zustand";
import { nanoid } from "nanoid";

const buildSpotLight = (overrides = {}) => ({
  id: nanoid(),
  type: "spot",
  color: "#FFFFFF",
  intensity: 10,
  position: [0, 3, 0],
  angle: Math.PI / 4,
  penumbra: 0.5,
  distance: 20,
  decay: 2,
  castShadow: true,
  targetPosition: [0, 1, 0],
  ...overrides,
});

const createDefaultLights = () => [
  buildSpotLight({
    intensity: 15,
    position: [5, 7, 5],
    angle: Math.PI / 6,
  }),
  buildSpotLight({
    intensity: 5,
    position: [-5, 4, 5],
    angle: Math.PI / 6,
  }),
  buildSpotLight({
    intensity: 8,
    position: [0, 5, -8],
    angle: Math.PI / 4,
  }),
];

// Define the initial pose for a new mannequin
const createInitialPose = () => ({
  head_02: { x: 0, y: 0, z: 0 },
  waist_00: { x: 0, y: 0, z: 0 }, // Add waist control
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

const useStore = create((set, get) => {
  const initialLights = createDefaultLights();

  return {
  // Mannequin Management
  mannequins: [
    {
      id: firstMannequinId,
      position: [0, -1.5, 0],
      pose: createInitialPose(),
    },
  ],
  selectedMannequinId: firstMannequinId,

  // Global Scene Settings
  cameraState: {
    position: [0, 2, 8],
    target: [0, 2, 0],
    focalLength: 50,
  },
  aspectRatio: "16:9",

  // UI State
  viewMode: "free", // 'free' or 'camera'
  transformMode: "translate", // 'translate' or 'rotate'
  isTransformInteracting: false,
  highlightedBone: null, // For direct joint selection

  // Light Management
  lights: initialLights,
  selectedLight: null,

  // Diffuser Management
  diffusers: [],
  selectedDiffuser: null,

  // --- ACTIONS ---

  // Mannequin Actions
  setHighlightedBone: (boneName) => set({ highlightedBone: boneName }),
  addMannequin: () =>
    set((state) => ({
      mannequins: [
        ...state.mannequins,
        {
          id: nanoid(),
          position: [Math.random() * 4 - 2, -1.5, Math.random() * 4 - 2],
          pose: createInitialPose(),
        },
      ],
    })),
  selectMannequin: (id) => set({ selectedMannequinId: id }),
  deleteMannequin: (id) =>
    set((state) => ({
      mannequins: state.mannequins.filter((m) => m.id !== id),
      selectedMannequinId:
        state.selectedMannequinId === id
          ? state.mannequins[0]?.id || null
          : state.selectedMannequinId,
    })),
  applyPosePreset: (id, presetPose) =>
    set((state) => ({
      mannequins: state.mannequins.map(
        (m) => (m.id === id ? { ...m, pose: { ...presetPose } } : m) // Create a shallow copy to ensure re-render
      ),
    })),
  initializePose: (id, pose) =>
    set((state) => ({
      mannequins: state.mannequins.map((m) =>
        m.id === id ? { ...m, pose } : m
      ),
    })),
  // [Architecture 시나리오 1: UI 슬라이더로 뼈 회전 - 상태 업데이트]
  // MannequinControl의 BoneSlider에서 호출되어 mannequins.pose 상태를 업데이트
  // 이 상태 변경은 Mannequin 컴포넌트의 리렌더링을 트리거하여 3D 모델 업데이트
  // 참고: docs/LumoStage-Architecture.md 시나리오 1
  setBoneRotation: (id, boneName, axis, value) =>
    set((state) => ({
      mannequins: state.mannequins.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            pose: {
              ...m.pose,
              [boneName]: { ...m.pose[boneName], [axis]: value },
            },
          };
        }
        return m;
      }),
    })),
  setMannequinPosition: (id, position) =>
    set((state) => ({
      mannequins: state.mannequins.map((m) =>
        m.id === id ? { ...m, position } : m
      ),
    })),

  // Other Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsTransformInteracting: (value) =>
    set((state) =>
      state.isTransformInteracting === value
        ? state
        : { isTransformInteracting: value }
    ),
  updateCameraState: (property, value) =>
    set((state) => ({
      cameraState: { ...state.cameraState, [property]: value },
    })),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  // [Architecture 시나리오 2: 조명 선택]
  // useSceneSelection의 focusLight에서 호출되어 선택된 조명 ID 저장
  // 이 상태 변경은 Scene의 TransformControls가 해당 조명에 연결되도록 트리거
  // 참고: docs/LumoStage-Architecture.md 시나리오 2
  setSelectedLight: (id) => set({ selectedLight: id }),
  addLight: (type = "point") =>
    set((state) => {
      let newLight;
      const commonProps = {
        id: nanoid(),
        position: [0, 3, 0],
        color: "#ffffff",
        intensity: 10,
        castShadow: true,
      };
      switch (type) {
        case "point":
          newLight = { ...commonProps, type: "point", distance: 0, decay: 2 };
          break;
        case "spot":
          newLight = {
            ...commonProps,
            type: "spot",
            angle: Math.PI / 4,
            penumbra: 0.5,
            distance: 0,
            decay: 2,
            targetPosition: [0, 0, 0],
          };
          break;
        case "directional":
          newLight = {
            ...commonProps,
            type: "directional",
            intensity: 5,
            targetPosition: [0, 0, 0],
          };
          break;
        default:
          newLight = { ...commonProps, type: "point", distance: 0, decay: 2 };
      }
      const nextLights = [...state.lights, newLight];
      return { lights: nextLights };
    }),
  deleteLight: (id) =>
    set((state) => {
      const remainingLights = state.lights.filter((light) => light.id !== id);
      const selectedMatches =
        state.selectedLight === id ||
        state.selectedLight === `${id}-target`;
      return {
        lights: remainingLights,
        selectedLight: selectedMatches ? null : state.selectedLight,
      };
    }),
  // [Architecture 시나리오 2: 기즈모로 조명 이동 - 상태 업데이트]
  // Scene의 TransformControls onObjectChange에서 호출되어 lights 배열 업데이트
  // getState()로 최신 상태를 확인한 후 이 액션을 호출하여 조명의 position/targetPosition 업데이트
  // 참고: docs/LumoStage-Architecture.md 시나리오 2
  updateLight: (id, property, value) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? { ...light, [property]: value } : light
      ),
    })),

  // Diffuser Actions
  setSelectedDiffuser: (id) => set({ selectedDiffuser: id }),
  addDiffuser: () =>
    set((state) => {
      const newDiffuser = {
        id: nanoid(),
        position: [0, 2, 2],
        rotation: [0, 0, 0],
        scale: [2, 2, 1],
        diffuseColor: "#ffffff",
        opacity: 0.5,
        transmission: 0.9,
        thickness: 0.5,
        roughness: 0.8,
        useShader: true,
        enableSecondaryLight: true,
        secondaryLightIntensity: 5,
        linkedLightIds: [], // 연결된 조명 ID 배열
        blockOriginalLight: false, // 원본 조명을 차단할지 여부
      };
      return { diffusers: [...state.diffusers, newDiffuser] };
    }),
  deleteDiffuser: (id) =>
    set((state) => ({
      diffusers: state.diffusers.filter((diffuser) => diffuser.id !== id),
      selectedDiffuser: state.selectedDiffuser === id ? null : state.selectedDiffuser,
    })),
  updateDiffuser: (id, property, value) =>
    set((state) => ({
      diffusers: state.diffusers.map((diffuser) =>
        diffuser.id === id ? { ...diffuser, [property]: value } : diffuser
      ),
    })),
  setDiffuserPosition: (id, position) =>
    set((state) => ({
      diffusers: state.diffusers.map((diffuser) =>
        diffuser.id === id ? { ...diffuser, position } : diffuser
      ),
    })),
  setDiffuserRotation: (id, rotation) =>
    set((state) => ({
      diffusers: state.diffusers.map((diffuser) =>
        diffuser.id === id ? { ...diffuser, rotation } : diffuser
      ),
    })),
  setDiffuserScale: (id, scale) =>
    set((state) => ({
      diffusers: state.diffusers.map((diffuser) =>
        diffuser.id === id ? { ...diffuser, scale } : diffuser
      ),
    })),
  // 디퓨저에 조명 연결
  linkDiffuserToLight: (diffuserId, lightId) =>
    set((state) => ({
      diffusers: state.diffusers.map((diffuser) => {
        if (diffuser.id === diffuserId) {
          // 이미 연결되어 있지 않은 경우에만 추가
          if (!diffuser.linkedLightIds.includes(lightId)) {
            return {
              ...diffuser,
              linkedLightIds: [...diffuser.linkedLightIds, lightId],
            };
          }
        }
        return diffuser;
      }),
    })),
  // 디퓨저에서 조명 연결 해제
  unlinkDiffuserFromLight: (diffuserId, lightId) =>
    set((state) => ({
      diffusers: state.diffusers.map((diffuser) => {
        if (diffuser.id === diffuserId) {
          return {
            ...diffuser,
            linkedLightIds: diffuser.linkedLightIds.filter((id) => id !== lightId),
          };
        }
        return diffuser;
      }),
    })),

  // Scene Data 로드 (API에서 받은 데이터로 에디터 상태 초기화)
  loadSceneData: (sceneData) => {
    if (!sceneData) return;

    set((state) => {
      const updates = {};

      if (sceneData.mannequins && Array.isArray(sceneData.mannequins)) {
        updates.mannequins = sceneData.mannequins;
        updates.selectedMannequinId =
          sceneData.mannequins[0]?.id || null;
      }

      const importedLights = Array.isArray(sceneData.lights)
        ? sceneData.lights
        : state.lights;

      updates.lights = importedLights;

      const importedDiffusers = Array.isArray(sceneData.diffusers)
        ? sceneData.diffusers
        : [];

      updates.diffusers = importedDiffusers;
      updates.selectedDiffuser = importedDiffusers[0]?.id || null;

      if (sceneData.cameraState) {
        updates.cameraState = sceneData.cameraState;
      }
      if (sceneData.aspectRatio) {
        updates.aspectRatio = sceneData.aspectRatio;
      }

      return updates;
    });
  },

  // Scene Data 추출 (저장용)
  getSceneData: () => {
    const state = get();
    return {
      mannequins: state.mannequins,
      lights: state.lights,
      diffusers: state.diffusers,
      cameraState: state.cameraState,
      aspectRatio: state.aspectRatio,
    };
  },
  };
});

export default useStore;
