const DEFAULT_SCHEMA_VERSION = 2;
const DEFAULT_ASPECT_RATIO = "16:9";

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

  return {
    data: normalized,
    dirty: dirtyRef.dirty
  };
};

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
  DEFAULT_SCHEMA_VERSION,
  DEFAULT_ASPECT_RATIO
};
