import { create } from "zustand";
import { nanoid } from "nanoid";

const BACKGROUND_TYPES = ["color", "hdri", "none"];

const DEFAULT_BACKGROUND_SETTINGS = {
  type: "color",
  color: "#050505",
  hdriIntensity: 1,
  showGround: true,
  groundColor: "#1f1f1f",
  groundReflectivity: 0.15,
};

const clampNumber = (value, min, max, fallback) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, min), max);
};

const sanitizeBackgroundSettings = (settings) => {
  const defaults = { ...DEFAULT_BACKGROUND_SETTINGS };
  if (!settings || typeof settings !== "object") {
    return defaults;
  }

  return {
    type: BACKGROUND_TYPES.includes(settings.type)
      ? settings.type
      : defaults.type,
    color:
      typeof settings.color === "string" && settings.color.trim()
        ? settings.color
        : defaults.color,
    hdriIntensity: clampNumber(
      settings.hdriIntensity,
      0,
      5,
      defaults.hdriIntensity
    ),
    showGround:
      typeof settings.showGround === "boolean"
        ? settings.showGround
        : defaults.showGround,
    groundColor:
      typeof settings.groundColor === "string" && settings.groundColor.trim()
        ? settings.groundColor
        : defaults.groundColor,
    groundReflectivity: clampNumber(
      settings.groundReflectivity,
      0,
      1,
      defaults.groundReflectivity
    ),
  };
};

const areBackgroundSettingsEqual = (a, b) =>
  a.type === b.type &&
  a.color === b.color &&
  a.hdriIntensity === b.hdriIntensity &&
  a.showGround === b.showGround &&
  a.groundColor === b.groundColor &&
  a.groundReflectivity === b.groundReflectivity;

const buildSpotLight = (overrides = {}) => ({
  id: nanoid(),
  type: "spot",
  name: overrides.name || "Spot Light",
  visible: true,
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
    name: "Key Light",
    intensity: 15,
    position: [5, 7, 5],
    angle: Math.PI / 6,
  }),
  buildSpotLight({
    name: "Fill Light",
    intensity: 5,
    position: [-5, 4, 5],
    angle: Math.PI / 6,
  }),
  buildSpotLight({
    name: "Back Light",
    intensity: 8,
    position: [0, 5, -8],
    angle: Math.PI / 4,
  }),
];

const BASE_T_POSE = {
  head_02: { x: -7.105427357601002e-15, y: 0, z: 0 },
  waist_00: { x: 1.5707964611537577, y: 0, z: 0 },
  l_shoulder_03: { x: -1.570796326794911, y: 1.4901160838576344e-7, z: -1.5707962075856106 },
  l_forearm_04: { x: 9.243807400785628e-24, y: -7.549789415861603e-8, z: 6.9788798979239965e-31 },
  l_hand_05: { x: 0.000003165124780956999, y: 0.000004595635800824713, z: -1.6389032874262773e-19 },
  r_shoulder_06: { x: -1.570796326794911, y: -2.9802325940409e-8, z: 1.5707961479809764 },
  r_forearm_07: { x: 1.38936108761013e-14, y: 1.2399988236211386e-7, z: -5.4205457900033885e-9 },
  r_hand_08: { x: -6.806159635526661e-15, y: 3.552712775024695e-15, z: 1.6673972424996467e-8 },
  l_thigh_09: { x: 1.6858520423784492e-7, y: -0.0000011393100073921723, z: -3.0146763326692736 },
  l_shin_010: { x: 1.4836620985782455e-7, y: 9.646342110937536e-7, z: -0.06611108712966271 },
  l_foot_012: { x: 1.5707964677445039, y: -0.03624223184471753, z: 0.0000027015737968598264 },
  r_thigh_013: { x: -7.172502874719498e-8, y: -7.53117076352163e-7, z: 3.0160110295701106 },
  r_shin_014: { x: -1.284250943720031e-7, y: 0.0000014582442977236153, z: 0.06174627284346381 },
  r_foot_016: { x: 1.5707964073676413, y: 0.03603908863813603, z: 0.0000027566931007736348 },
};

// Define the initial pose for a new mannequin using the GLTF T-pose values
const createInitialPose = () =>
  Object.entries(BASE_T_POSE).reduce((pose, [boneName, rotation]) => {
    pose[boneName] = { ...rotation };
    return pose;
  }, {});

const isValidVector3 = (value) =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every(
    (component) => typeof component === "number" && Number.isFinite(component)
  );

const ensureVector3 = (value, fallback = [0, 0, 0]) =>
  isValidVector3(value) ? value : fallback;

const remapLightForType = (light, nextType) => {
  const baseLight = {
    id: light.id,
    name: light.name,
    type: nextType,
    visible: light.visible !== undefined ? light.visible : true,
    position: ensureVector3(light.position, [0, 3, 0]),
    color: light.color || "#ffffff",
    intensity:
      typeof light.intensity === "number" ? light.intensity : 10,
    castShadow:
      light.castShadow !== undefined ? light.castShadow : true,
  };

  switch (nextType) {
    case "spot":
      return {
        ...baseLight,
        angle: typeof light.angle === "number" ? light.angle : Math.PI / 4,
        penumbra:
          typeof light.penumbra === "number" ? light.penumbra : 0.5,
        distance:
          typeof light.distance === "number" ? light.distance : 0,
        decay: typeof light.decay === "number" ? light.decay : 2,
        targetPosition: ensureVector3(light.targetPosition),
      };
    case "directional":
      return {
        ...baseLight,
        targetPosition: ensureVector3(light.targetPosition),
      };
    case "point":
    default:
      return {
        ...baseLight,
        distance:
          typeof light.distance === "number" ? light.distance : 0,
        decay: typeof light.decay === "number" ? light.decay : 2,
      };
  }
};

const sanitizePose = (pose) => {
  const template = createInitialPose();

  if (!pose || typeof pose !== "object") {
    return template;
  }

  const sanitized = {};

  Object.entries(template).forEach(([boneName, defaults]) => {
    const current = pose[boneName];
    sanitized[boneName] = {
      x: typeof current?.x === "number" ? current.x : defaults.x,
      y: typeof current?.y === "number" ? current.y : defaults.y,
      z: typeof current?.z === "number" ? current.z : defaults.z,
    };
  });

  // 예상하지 못한 추가 본 정보가 이미 저장되어 있으면 그대로 유지
  Object.keys(pose).forEach((boneName) => {
    if (!sanitized[boneName] && typeof pose[boneName] === "object") {
      sanitized[boneName] = { ...pose[boneName] };
    }
  });

  return sanitized;
};

const sanitizeMannequin = (mannequin = {}, fallbackIndex = 0) => {
  const defaultPosition = [0, -1.5, 0];
  const defaultScale = [1, 1, 1];

  return {
    ...mannequin,
    id: mannequin.id || `mannequin-${fallbackIndex}-${Date.now()}`,
    name: mannequin.name || `Mannequin ${fallbackIndex + 1}`,
    visible: mannequin.visible !== undefined ? mannequin.visible : true,
    position: isValidVector3(mannequin.position) ? mannequin.position : defaultPosition,
    scale: isValidVector3(mannequin.scale) ? mannequin.scale : defaultScale,
    pose: sanitizePose(mannequin.pose),
  };
};

const sanitizeLight = (light, fallbackIndex = 0) => {
  if (!light || !light.type) return null;

  const baseName = light.type === 'spot' ? 'Spot Light' :
                   light.type === 'point' ? 'Point Light' :
                   light.type === 'directional' ? 'Directional Light' : 'Light';

  return {
    ...light,
    name: light.name || `${baseName} ${fallbackIndex + 1}`,
    visible: light.visible !== undefined ? light.visible : true,
  };
};

const sanitizeDiffuser = (diffuser, fallbackIndex = 0) => {
  if (!diffuser) return null;

  return {
    ...diffuser,
    name: diffuser.name || `Diffuser ${fallbackIndex + 1}`,
    visible: diffuser.visible !== undefined ? diffuser.visible : true,
  };
};

const firstMannequinId = nanoid();

const useStore = create((set, get) => {
  const initialLights = createDefaultLights();

  return {
  // Mannequin Management
  mannequins: [
    {
      id: firstMannequinId,
      name: "Mannequin",
      visible: true,
      position: [0, -1.5, 0],
      scale: [1, 1, 1],
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
  // OrbitControls 상태 저장 (프로젝트 로드 시 카메라 위치 복원용)
  orbitControlState: {
    cameraPosition: [0, 2, 8],
    target: [0, 2, 0],
    zoom: 1,
  },
  aspectRatio: "16:9",
  backgroundSettings: sanitizeBackgroundSettings(),

  // UI State
  viewMode: "free", // 'free' or 'camera'
  transformMode: "translate", // 'translate' | 'rotate' | 'scale'
  isTransformInteracting: false,
  highlightedBone: null, // For direct joint selection

  // Light Management
  lights: initialLights,
  selectedLight: null,
  selectedCamera: false,
  selectedHdri: false,
  selectedModelLibrary: false,
  selectedEnvironment: false,

  // Diffuser Management
  diffusers: [],
  selectedDiffuser: null,
  selectedGltfModelId: null,

  // --- ACTIONS ---

  // Mannequin Actions
  setHighlightedBone: (boneName) => set({ highlightedBone: boneName }),
  addMannequin: () =>
    set((state) => ({
      mannequins: [
        ...state.mannequins,
        {
          id: nanoid(),
          name: `Mannequin ${state.mannequins.length + 1}`,
          visible: true,
          position: [Math.random() * 4 - 2, -1.5, Math.random() * 4 - 2],
          scale: [1, 1, 1],
          pose: createInitialPose(),
        },
      ],
    })),
  selectMannequin: (id) =>
    set({
      selectedMannequinId: id,
      selectedCamera: false,
      selectedHdri: false,
      selectedModelLibrary: false,
      selectedEnvironment: false,
      selectedLight: null,
      selectedDiffuser: null,
      selectedGltfModelId: null,
    }),
  deleteMannequin: (id) =>
    set((state) => {
      const remaining = state.mannequins.filter((m) => m.id !== id);
      const nextSelected =
        state.selectedMannequinId === id ? remaining[0]?.id || null : state.selectedMannequinId;

      return {
        mannequins: remaining,
        selectedMannequinId: nextSelected && remaining.some((m) => m.id === nextSelected)
          ? nextSelected
          : remaining[0]?.id || null,
      };
    }),
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
  setMannequinScale: (id, scale) =>
    set((state) => ({
      mannequins: state.mannequins.map((m) =>
        m.id === id ? { ...m, scale } : m
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
  // OrbitControls 상태 업데이트 (카메라 위치 저장)
  updateOrbitControlState: (orbitState) =>
    set({ orbitControlState: orbitState }),
  // OrbitControls 위치를 Camera View로 설정 (Cinema 4D 스타일)
  setOrbitToCameraView: () =>
    set((state) => ({
      orbitControlState: {
        cameraPosition: state.cameraState.position,
        target: state.cameraState.target,
        zoom: 1,
      },
    })),
  // Camera View 위치를 OrbitControls 위치로 설정
  setCameraViewToOrbit: () =>
    set((state) => ({
      cameraState: {
        ...state.cameraState,
        position: state.orbitControlState.cameraPosition,
        target: state.orbitControlState.target,
      },
    })),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  updateBackgroundSettings: (partial) => {
    const current = get().backgroundSettings;
    const nextSettings = sanitizeBackgroundSettings({
      ...current,
      ...(partial || {}),
    });
    if (areBackgroundSettingsEqual(current, nextSettings)) {
      return;
    }
    set({ backgroundSettings: nextSettings });
  },
  // [Architecture 시나리오 2: 조명 선택]
  // useSceneSelection의 focusLight에서 호출되어 선택된 조명 ID 저장
  // 이 상태 변경은 Scene의 TransformControls가 해당 조명에 연결되도록 트리거
  // 참고: docs/LumoStage-Architecture.md 시나리오 2
  setSelectedLight: (id) =>
    set({
      selectedLight: id,
      selectedCamera: false,
      selectedHdri: false,
      selectedModelLibrary: false,
      selectedEnvironment: false,
      selectedMannequinId: null,
      selectedDiffuser: null,
      selectedGltfModelId: null,
    }),
  selectCamera: () =>
    set({
      selectedCamera: true,
      selectedHdri: false,
      selectedModelLibrary: false,
      selectedEnvironment: false,
      selectedLight: null,
      selectedMannequinId: null,
      selectedDiffuser: null,
      selectedGltfModelId: null,
    }),
  selectHdri: () =>
    set({
      selectedHdri: true,
      selectedCamera: false,
      selectedModelLibrary: false,
      selectedEnvironment: false,
      selectedLight: null,
      selectedMannequinId: null,
      selectedDiffuser: null,
      selectedGltfModelId: null,
    }),
  selectModelLibrary: () =>
    set({
      selectedModelLibrary: true,
      selectedCamera: false,
      selectedHdri: false,
      selectedEnvironment: false,
      selectedLight: null,
      selectedMannequinId: null,
      selectedDiffuser: null,
      selectedGltfModelId: null,
    }),
  selectEnvironment: () =>
    set({
      selectedEnvironment: true,
      selectedCamera: false,
      selectedHdri: false,
      selectedModelLibrary: false,
      selectedLight: null,
      selectedMannequinId: null,
      selectedDiffuser: null,
      selectedGltfModelId: null,
    }),
  addLight: (type = "point") =>
    set((state) => {
      let newLight;
      const lightCount = state.lights.length + 1;
      const commonProps = {
        id: nanoid(),
        visible: true,
        position: [0, 3, 0],
        color: "#ffffff",
        intensity: 10,
        castShadow: true,
      };
      switch (type) {
        case "point":
          newLight = { ...commonProps, type: "point", name: `Point Light ${lightCount}`, distance: 0, decay: 2 };
          break;
        case "spot":
          newLight = {
            ...commonProps,
            type: "spot",
            name: `Spot Light ${lightCount}`,
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
            name: `Directional Light ${lightCount}`,
            intensity: 5,
            targetPosition: [0, 0, 0],
          };
          break;
        default:
          newLight = { ...commonProps, type: "point", name: `Point Light ${lightCount}`, distance: 0, decay: 2 };
      }
      const nextLights = [...state.lights, newLight];
      return {
        lights: nextLights,
        selectedLight: newLight.id,
        selectedCamera: false,
        selectedHdri: false,
        selectedModelLibrary: false,
        selectedMannequinId: null,
        selectedDiffuser: null,
        selectedGltfModelId: null,
      };
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
  changeLightType: (id, nextType) =>
    set((state) => ({
      lights: state.lights.map((light) =>
        light.id === id ? remapLightForType(light, nextType) : light
      ),
    })),

  // Diffuser Actions
  setSelectedDiffuser: (id) =>
    set({
      selectedDiffuser: id,
      selectedCamera: false,
      selectedHdri: false,
      selectedModelLibrary: false,
      selectedEnvironment: false,
      selectedLight: null,
      selectedMannequinId: null,
      selectedGltfModelId: null,
    }),
  setSelectedGltfModel: (assetId) =>
    set({
      selectedGltfModelId: assetId,
      selectedCamera: false,
      selectedHdri: false,
      selectedModelLibrary: false,
      selectedEnvironment: false,
      selectedLight: null,
      selectedMannequinId: null,
      selectedDiffuser: null,
    }),
  addDiffuser: () =>
    set((state) => {
      const newDiffuser = {
        id: nanoid(),
        name: `Diffuser ${state.diffusers.length + 1}`,
        visible: true,
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

  // Outliner Actions
  renameObject: (id, objectType, newName) =>
    set((state) => {
      switch (objectType) {
        case 'light':
          return {
            lights: state.lights.map((light) =>
              light.id === id ? { ...light, name: newName } : light
            ),
          };
        case 'mannequin':
          return {
            mannequins: state.mannequins.map((mannequin) =>
              mannequin.id === id ? { ...mannequin, name: newName } : mannequin
            ),
          };
        case 'diffuser':
          return {
            diffusers: state.diffusers.map((diffuser) =>
              diffuser.id === id ? { ...diffuser, name: newName } : diffuser
            ),
          };
        default:
          return state;
      }
    }),
  setObjectVisibility: (id, objectType, visible) =>
    set((state) => {
      switch (objectType) {
        case 'light':
          return {
            lights: state.lights.map((light) =>
              light.id === id ? { ...light, visible } : light
            ),
          };
        case 'mannequin':
          return {
            mannequins: state.mannequins.map((mannequin) =>
              mannequin.id === id ? { ...mannequin, visible } : mannequin
            ),
          };
        case 'diffuser':
          return {
            diffusers: state.diffusers.map((diffuser) =>
              diffuser.id === id ? { ...diffuser, visible } : diffuser
            ),
          };
        default:
          return state;
      }
    }),

  // Scene Data 로드 (API에서 받은 데이터로 에디터 상태 초기화)
  loadSceneData: (sceneData) => {
    if (!sceneData) return;

    set((state) => {
      const updates = {};

      if (sceneData.mannequins && Array.isArray(sceneData.mannequins)) {
        const sanitizedMannequins = sceneData.mannequins.map((mannequin, index) =>
          sanitizeMannequin(mannequin, index)
        );
        updates.mannequins = sanitizedMannequins;
        updates.selectedMannequinId = sanitizedMannequins[0]?.id || null;
      }

      if (Array.isArray(sceneData.lights)) {
        const sanitizedLights = sceneData.lights
          .map((light, index) => sanitizeLight(light, index))
          .filter(Boolean);
        updates.lights = sanitizedLights;
      } else {
        updates.lights = state.lights;
      }

      if (Array.isArray(sceneData.diffusers)) {
        const sanitizedDiffusers = sceneData.diffusers
          .map((diffuser, index) => sanitizeDiffuser(diffuser, index))
          .filter(Boolean);
        updates.diffusers = sanitizedDiffusers;
        updates.selectedDiffuser = sanitizedDiffusers[0]?.id || null;
      } else {
        updates.diffusers = [];
        updates.selectedDiffuser = null;
      }

      if (sceneData.cameraState) {
        updates.cameraState = sceneData.cameraState;
      }
      if (sceneData.orbitControlState) {
        updates.orbitControlState = sceneData.orbitControlState;
      }
      if (sceneData.aspectRatio) {
        updates.aspectRatio = sceneData.aspectRatio;
      }
      updates.backgroundSettings = sanitizeBackgroundSettings(
        sceneData.backgroundSettings
      );
      updates.selectedEnvironment = false;
      updates.selectedGltfModelId = null;

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
      orbitControlState: state.orbitControlState,
      aspectRatio: state.aspectRatio,
      backgroundSettings: state.backgroundSettings,
    };
  },
  };
});

export default useStore;
