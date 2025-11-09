const DEFAULT_SCHEMA_VERSION = 2;
const DEFAULT_ASPECT_RATIO = "16:9";
const DEFAULT_ORBIT_CONTROL_STATE = {
  cameraPosition: [0, 2, 8],
  target: [0, 2, 0],
  zoom: 1
};

// 기본 마네킹 포즈 생성
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
  r_foot_016: { x: 1.5707964073676413, y: 0.03603908863813603, z: 0.0000027566931007736348 }
};

const createInitialPose = () =>
  Object.entries(BASE_T_POSE).reduce((pose, [boneName, rotation]) => {
    pose[boneName] = { ...rotation };
    return pose;
  }, {});

// 기본 마네킹 생성
const createDefaultMannequin = () => ({
  id: `mannequin-${Date.now()}`,
  position: [0, -1.5, 0],
  pose: createInitialPose()
});

// 기본 3점 조명 생성 (Key Light, Fill Light, Back Light)
const createDefaultLights = () => [
  {
    id: `light-${Date.now()}-key`,
    type: "spot",
    color: "#FFFFFF",
    intensity: 15,
    position: [5, 7, 5],
    angle: Math.PI / 6,
    penumbra: 0.5,
    distance: 20,
    decay: 2,
    castShadow: true,
    targetPosition: [0, 1, 0]
  },
  {
    id: `light-${Date.now()}-fill`,
    type: "spot",
    color: "#FFFFFF",
    intensity: 5,
    position: [-5, 4, 5],
    angle: Math.PI / 6,
    penumbra: 0.5,
    distance: 20,
    decay: 2,
    castShadow: true,
    targetPosition: [0, 1, 0]
  },
  {
    id: `light-${Date.now()}-back`,
    type: "spot",
    color: "#FFFFFF",
    intensity: 8,
    position: [0, 5, -8],
    angle: Math.PI / 4,
    penumbra: 0.5,
    distance: 20,
    decay: 2,
    castShadow: true,
    targetPosition: [0, 1, 0]
  }
];

const ensureVector3 = (value, fallback, dirtyRef) => {
  if (
    !Array.isArray(value) ||
    value.length !== 3 ||
    value.some((component) => typeof component !== "number" || Number.isNaN(component))
  ) {
    dirtyRef.dirty = true;
    return fallback;
  }

  return value;
};

const normalizeLight = (light, dirtyRef) => {
  if (!light || typeof light !== "object") {
    dirtyRef.dirty = true;
    return {
      id: `light-${Date.now()}`,
      type: "spot",
      color: "#ffffff",
      intensity: 1
    };
  }

  const normalized = { ...light };

  if (!normalized.id) {
    normalized.id = `light-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    dirtyRef.dirty = true;
  }

  if (!normalized.type) {
    normalized.type = "spot";
    dirtyRef.dirty = true;
  }

  if (normalized.type === "rect") {
    if (normalized.width === undefined) {
      normalized.width = 3;
      dirtyRef.dirty = true;
    }

    if (normalized.height === undefined) {
      normalized.height = 2;
      dirtyRef.dirty = true;
    }
  }

  return normalized;
};

const normalizeOrbitControlState = (orbitControlState, dirtyRef) => {
  const createFallback = () => ({
    cameraPosition: [...DEFAULT_ORBIT_CONTROL_STATE.cameraPosition],
    target: [...DEFAULT_ORBIT_CONTROL_STATE.target],
    zoom: DEFAULT_ORBIT_CONTROL_STATE.zoom
  });

  if (!orbitControlState || typeof orbitControlState !== "object") {
    dirtyRef.dirty = true;
    return createFallback();
  }

  const normalized = { ...orbitControlState };
  const fallback = createFallback();

  normalized.cameraPosition = ensureVector3(normalized.cameraPosition, fallback.cameraPosition, dirtyRef);
  normalized.target = ensureVector3(normalized.target, fallback.target, dirtyRef);

  if (typeof normalized.zoom !== "number" || Number.isNaN(normalized.zoom) || normalized.zoom <= 0) {
    normalized.zoom = fallback.zoom;
    dirtyRef.dirty = true;
  }

  return normalized;
};

const normalizeDiffuser = (diffuser, dirtyRef) => {
  const defaultDiffuser = {
    id: `diffuser-${Date.now()}`,
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
    linkedLightIds: [],
    blockOriginalLight: false
  };

  if (!diffuser || typeof diffuser !== "object") {
    dirtyRef.dirty = true;
    return defaultDiffuser;
  }

  const normalized = { ...diffuser };

  if (!normalized.id) {
    normalized.id = `diffuser-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    dirtyRef.dirty = true;
  }

  normalized.position = ensureVector3(normalized.position, defaultDiffuser.position, dirtyRef);
  normalized.rotation = ensureVector3(normalized.rotation, defaultDiffuser.rotation, dirtyRef);
  normalized.scale = ensureVector3(normalized.scale, defaultDiffuser.scale, dirtyRef);

  if (typeof normalized.diffuseColor !== "string" || normalized.diffuseColor.trim().length === 0) {
    normalized.diffuseColor = defaultDiffuser.diffuseColor;
    dirtyRef.dirty = true;
  }

  const numericProps = ["opacity", "transmission", "thickness", "roughness", "secondaryLightIntensity"];
  numericProps.forEach((prop) => {
    if (typeof normalized[prop] !== "number" || Number.isNaN(normalized[prop])) {
      normalized[prop] = defaultDiffuser[prop];
      dirtyRef.dirty = true;
    }
  });

  const booleanProps = ["useShader", "enableSecondaryLight", "blockOriginalLight"];
  booleanProps.forEach((prop) => {
    if (typeof normalized[prop] !== "boolean") {
      normalized[prop] = defaultDiffuser[prop];
      dirtyRef.dirty = true;
    }
  });

  if (!Array.isArray(normalized.linkedLightIds)) {
    normalized.linkedLightIds = [];
    dirtyRef.dirty = true;
  } else {
    const sanitized = normalized.linkedLightIds
      .filter((id) => typeof id === "string" && id.trim().length > 0);
    const deduped = [...new Set(sanitized)];

    if (deduped.length !== normalized.linkedLightIds.length) {
      dirtyRef.dirty = true;
    }

    normalized.linkedLightIds = deduped;
  }

  return normalized;
};

const normalizeSceneData = (sceneData = {}) => {
  const dirtyRef = { dirty: false };

  if (typeof sceneData !== "object" || sceneData === null) {
    dirtyRef.dirty = true;
    sceneData = {};
  }

  const normalized = { ...sceneData };

  if (normalized.schemaVersion !== DEFAULT_SCHEMA_VERSION) {
    normalized.schemaVersion = DEFAULT_SCHEMA_VERSION;
    dirtyRef.dirty = true;
  }

  if (!normalized.aspectRatio) {
    normalized.aspectRatio = DEFAULT_ASPECT_RATIO;
    dirtyRef.dirty = true;
  }

  normalized.orbitControlState = normalizeOrbitControlState(normalized.orbitControlState, dirtyRef);

  if (!Array.isArray(normalized.diffusers)) {
    normalized.diffusers = [];
    dirtyRef.dirty = true;
  } else {
    normalized.diffusers = normalized.diffusers.map((diffuser) => normalizeDiffuser(diffuser, dirtyRef));
  }

  if (!Array.isArray(normalized.lights)) {
    normalized.lights = [];
    dirtyRef.dirty = true;
  } else {
    normalized.lights = normalized.lights.map((light) => normalizeLight(light, dirtyRef));
  }

  // mannequins 배열 정규화 (빈 배열 허용)
  if (!Array.isArray(normalized.mannequins)) {
    normalized.mannequins = [];
    dirtyRef.dirty = true;
  }

  return {
    data: normalized,
    dirty: dirtyRef.dirty
  };
};

// 최초 프로젝트 생성 시 사용할 기본 sceneData 생성
const createDefaultSceneData = () => ({
  schemaVersion: DEFAULT_SCHEMA_VERSION,
  aspectRatio: DEFAULT_ASPECT_RATIO,
  orbitControlState: { ...DEFAULT_ORBIT_CONTROL_STATE },
  mannequins: [createDefaultMannequin()],
  lights: createDefaultLights(),
  diffusers: []
});

const applySceneDefaults = (projectDoc) => {
  const { data, dirty } = normalizeSceneData(projectDoc.sceneData);

  if (dirty) {
    projectDoc.sceneData = data;
    projectDoc.markModified("sceneData");
  }
};

module.exports = {
  normalizeSceneData,
  applySceneDefaults,
  createDefaultSceneData,
  DEFAULT_SCHEMA_VERSION,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_ORBIT_CONTROL_STATE
};
