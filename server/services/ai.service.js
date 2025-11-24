const mongoose = require("mongoose");

const Previsualization = require("../models/Previsualization");
const Project = require("../models/Project");
const User = require("../models/User");
const { decryptApiKey, encryptApiKey } = require("../utils/encryption");
const {
  deleteObject,
  downloadBuffer,
  generateAssetKey,
  uploadBuffer
} = require("./storage.service");
const { generateGeminiImage } = require("./geminiImage.service");
const { DEFAULT_GEMINI_IMAGE_MODEL } = require("../config/gemini");

const MAX_SCENE_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_ESTIMATED_TIME = Number(process.env.AI_ESTIMATED_TIME_SEC || 30);
const AI_PROVIDER = "google-gemini";

const ACCEPTED_SCENE_MIME_TYPES = new Set(["image/png", "image/jpeg"]);
const PREVISUALIZATION_STATUSES = new Set(["pending", "processing", "completed", "failed"]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getHourlyLimit = () => Number(process.env.AI_MAX_HOURLY_GENERATIONS || 10);
const getMonthlyLimit = () => Number(process.env.AI_MAX_MONTHLY_GENERATIONS || 100);

const mapPrompt = (value, { required = true, max = 1000 } = {}) => {
  if (!value || !value.trim()) {
    if (!required) {
      return null;
    }

    const error = new Error("프롬프트는 필수입니다.");
    error.status = 400;
    throw error;
  }

  const sanitized = value.replace(/<[^>]*>/g, "").trim();

  if (!sanitized) {
    const error = new Error("프롬프트는 공백일 수 없습니다.");
    error.status = 400;
    throw error;
  }

  if (sanitized.length > max) {
    const error = new Error("프롬프트 길이가 허용 범위를 초과했습니다.");
    error.status = 400;
    throw error;
  }

  return sanitized;
};

const sanitizeSceneSnapshot = (snapshot) => {
  if (!snapshot || typeof snapshot !== "object") {
    return undefined;
  }

  const result = {};

  if (typeof snapshot.lightsCount === "number") {
    result.lightsCount = snapshot.lightsCount;
  }

  if (snapshot.cameraAngle && typeof snapshot.cameraAngle === "object") {
    const position = Array.isArray(snapshot.cameraAngle.position)
      ? snapshot.cameraAngle.position.map(Number).slice(0, 3)
      : undefined;
    const target = Array.isArray(snapshot.cameraAngle.target)
      ? snapshot.cameraAngle.target.map(Number).slice(0, 3)
      : undefined;

    result.cameraAngle = {};
    if (position) {
      result.cameraAngle.position = position;
    }

    if (target) {
      result.cameraAngle.target = target;
    }

    if (!position && !target) {
      delete result.cameraAngle;
    }
  }

  if (snapshot.mannequinPose && typeof snapshot.mannequinPose === "string") {
    result.mannequinPose = snapshot.mannequinPose.slice(0, 64);
  }

  if (!Object.keys(result).length) {
    return undefined;
  }

  return result;
};

const resolveProjectForOwner = async (ownerId, projectId) => {
  if (!projectId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error("잘못된 프로젝트 ID입니다.");
    error.status = 400;
    throw error;
  }

  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    const error = new Error("프로젝트를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  return project;
};

const formatPrevisualization = (doc) => {
  const data = doc.toObject({ versionKey: false });

  data.id = data._id.toString();
  data.owner = data.owner.toString();
  data.projectId = data.project ? data.project.toString() : null;
  data.parentId = data.parent ? data.parent.toString() : null;

  delete data._id;
  delete data.project;
  delete data.parent;

  return data;
};

const buildGenerationParams = (params = {}) => {
  const safeParams = typeof params === "object" && params ? params : {};

  return {
    model: typeof safeParams.model === "string" && safeParams.model.trim()
      ? safeParams.model.trim().slice(0, 64)
      : DEFAULT_GEMINI_IMAGE_MODEL,
    steps: clamp(Number(safeParams.steps) || 20, 1, 50),
    guidanceScale: clamp(Number(safeParams.guidanceScale) || 7.5, 1, 15),
    strength: clamp(Number(safeParams.strength) || 0.75, 0.1, 1),
    seed:
      safeParams.seed === undefined || safeParams.seed === null
        ? undefined
        : Number(safeParams.seed),
    aspectRatio:
      typeof safeParams.aspectRatio === "string" && safeParams.aspectRatio.trim()
        ? safeParams.aspectRatio.trim()
        : undefined,
    imageSize:
      typeof safeParams.imageSize === "string" && safeParams.imageSize.trim()
        ? safeParams.imageSize.trim().toUpperCase()
        : undefined
  };
};

const validateSceneFile = (file) => {
  if (!file) {
    const error = new Error("씬 렌더링 이미지가 필요합니다.");
    error.status = 400;
    throw error;
  }

  if (file.size > MAX_SCENE_FILE_SIZE) {
    const error = new Error("이미지 크기가 10MB를 초과했습니다.");
    error.status = 413;
    throw error;
  }

  if (file.mimetype && !ACCEPTED_SCENE_MIME_TYPES.has(file.mimetype)) {
    const error = new Error("지원하지 않는 이미지 형식입니다.");
    error.status = 400;
    throw error;
  }
};

const ensureUserHasApiKey = async (ownerId) => {
  const user = await User.findById(ownerId).select("+aiApiKey");

  if (!user || !user.aiApiKey) {
    const error = new Error("AI API 키가 설정되어 있지 않습니다.");
    error.status = 403;
    throw error;
  }

  return user;
};

const ensureGenerationLimits = async (ownerId) => {
  const hourlyLimit = getHourlyLimit();
  const monthlyLimit = getMonthlyLimit();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [hourlyCount, monthlyCount] = await Promise.all([
    Previsualization.countDocuments({ owner: ownerId, createdAt: { $gte: oneHourAgo } }),
    Previsualization.countDocuments({ owner: ownerId, createdAt: { $gte: monthStart } })
  ]);

  if (hourlyCount >= hourlyLimit) {
    const error = new Error("시간당 생성 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
    error.status = 429;
    throw error;
  }

  if (monthlyCount >= monthlyLimit) {
    const error = new Error("월간 생성 한도를 초과했습니다.");
    error.status = 507;
    throw error;
  }
};

const uploadSceneRender = async ({ ownerId, projectId, file }) => {
  validateSceneFile(file);

  const key = generateAssetKey({
    type: "ai-scene",
    ownerId,
    projectId,
    originalName: file.originalname || "scene.png"
  });

  return uploadBuffer({
    key,
    body: file.buffer,
    contentType: file.mimetype || "image/png"
  });
};

const duplicateSceneRender = async ({ ownerId, projectId, buffer, mimeType }) => {
  const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
  const key = generateAssetKey({
    type: "ai-scene",
    ownerId,
    projectId,
    originalName: `scene${extension}`
  });

  return uploadBuffer({ key, body: buffer, contentType: mimeType });
};

const saveApiKeyForUser = async (user, apiKey) => {
  if (!apiKey || apiKey.length < 16) {
    const error = new Error("API 키 형식이 올바르지 않습니다.");
    error.status = 400;
    throw error;
  }

  user.aiApiKey = encryptApiKey(apiKey.trim());
  await user.save();
};

const deleteApiKeyForOwner = async (ownerId) => {
  const user = await User.findById(ownerId).select("+aiApiKey aiUsageStats");

  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  const hadKey = Boolean(user.aiApiKey);
  user.aiApiKey = null;
  await user.save();

  return { hadKey };
};

const getApiKeyStatus = async (ownerId) => {
  const user = await User.findById(ownerId).select("aiApiKey aiUsageStats");

  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  const stats = user.aiUsageStats || {};

  return {
    hasApiKey: Boolean(user.aiApiKey),
    usageStats: {
      totalGenerations: stats.totalGenerations || 0,
      monthlyGenerations: stats.monthlyGenerations || 0,
      lastGeneratedAt: stats.lastGeneratedAt || null
    }
  };
};

const getUsageSummary = async (ownerId) => {
  const user = await User.findById(ownerId).select("aiUsageStats");

  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  const stats = user.aiUsageStats || {};
  const limit = getMonthlyLimit();

  return {
    total: stats.totalGenerations || 0,
    thisMonth: stats.monthlyGenerations || 0,
    lastGeneratedAt: stats.lastGeneratedAt || null,
    limit: Number.isFinite(limit) && limit > 0 ? limit : null
  };
};

const createPrevisualization = async ({
  ownerId,
  projectId,
  prompt,
  negativePrompt,
  generationParams,
  sceneFile,
  sceneSnapshot
}) => {
  await ensureUserHasApiKey(ownerId);
  await ensureGenerationLimits(ownerId);
  const project = await resolveProjectForOwner(ownerId, projectId);
  const uploadResult = await uploadSceneRender({
    ownerId,
    projectId: project ? project.id || project._id.toString() : null,
    file: sceneFile
  });

  const previsualization = await Previsualization.create({
    owner: ownerId,
    project: project ? project._id : undefined,
    prompt: mapPrompt(prompt),
    negativePrompt: mapPrompt(negativePrompt, { required: false, max: 500 }),
    sceneRenderUrl: uploadResult.url,
    sceneRenderKey: uploadResult.key,
    sceneRenderMimeType: sceneFile.mimetype || "image/png",
    sceneSnapshot: sanitizeSceneSnapshot(sceneSnapshot),
    generationParams: buildGenerationParams(generationParams)
  });

  return {
    previsualization: formatPrevisualization(previsualization),
    estimatedTime: DEFAULT_ESTIMATED_TIME
  };
};

const getPrevisualizationById = async (ownerId, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("잘못된 프리비주얼 ID입니다.");
    error.status = 400;
    throw error;
  }

  const previsualization = await Previsualization.findOne({ _id: id, owner: ownerId });

  if (!previsualization) {
    const error = new Error("프리비주얼을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  return formatPrevisualization(previsualization);
};

const listPrevisualizations = async ({ ownerId, projectId, status, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const filter = { owner: ownerId };

  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const error = new Error("잘못된 프로젝트 ID입니다.");
      error.status = 400;
      throw error;
    }

    filter.project = projectId;
  }

  if (status) {
    if (!PREVISUALIZATION_STATUSES.has(status)) {
      const error = new Error("지원하지 않는 상태 값입니다.");
      error.status = 400;
      throw error;
    }

    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Previsualization.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    Previsualization.countDocuments(filter)
  ]);

  return {
    previsualizations: items.map(formatPrevisualization),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  };
};

const loadPrevisualizationWithSecrets = async (ownerId, id) => {
  return Previsualization.findOne({ _id: id, owner: ownerId }).select(
    "+sceneRenderKey +generatedImageKey"
  );
};

const iteratePrevisualization = async ({
  ownerId,
  id,
  prompt,
  negativePrompt,
  generationParams
}) => {
  const source = await loadPrevisualizationWithSecrets(ownerId, id);

  if (!source) {
    const error = new Error("프리비주얼을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  const sceneBuffer = await downloadBuffer(source.sceneRenderKey);

  if (!sceneBuffer) {
    const error = new Error("씬 렌더링 이미지를 불러올 수 없습니다.");
    error.status = 500;
    throw error;
  }

  await ensureGenerationLimits(ownerId);

  const uploadResult = await duplicateSceneRender({
    ownerId,
    projectId: source.project ? source.project.toString() : null,
    buffer: sceneBuffer,
    mimeType: source.sceneRenderMimeType || "image/png"
  });

  const iterated = await Previsualization.create({
    owner: ownerId,
    project: source.project,
    parent: source._id,
    prompt: mapPrompt(prompt),
    negativePrompt: mapPrompt(negativePrompt, { required: false, max: 500 }),
    sceneRenderUrl: uploadResult.url,
    sceneRenderKey: uploadResult.key,
    sceneRenderMimeType: source.sceneRenderMimeType,
    sceneSnapshot: source.sceneSnapshot,
    generationParams: buildGenerationParams(generationParams)
  });

  return {
    previsualization: formatPrevisualization(iterated),
    estimatedTime: DEFAULT_ESTIMATED_TIME
  };
};

const deletePrevisualization = async ({ ownerId, id }) => {
  const previsualization = await loadPrevisualizationWithSecrets(ownerId, id);

  if (!previsualization) {
    const error = new Error("프리비주얼을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  await Promise.all([
    deleteObject(previsualization.sceneRenderKey),
    deleteObject(previsualization.generatedImageKey)
  ]);

  await previsualization.deleteOne();
};

const requestAiImage = async ({ apiKey, prompt, negativePrompt, params, sceneBuffer, mimeType }) => {
  if (process.env.AI_MOCK_MODE === "true" || process.env.NODE_ENV === "test") {
    return Buffer.from(`mock-ai-image-${Date.now()}`);
  }

  const { buffer } = await generateGeminiImage({
    apiKey,
    prompt,
    negativePrompt,
    imageBuffer: sceneBuffer,
    mimeType,
    model: params.model,
    aspectRatio: params.aspectRatio,
    imageSize: params.imageSize,
    sceneSnapshot: params.sceneSnapshot
  });

  return buffer;
};

const updateUsageStats = async (user) => {
  const stats = user.aiUsageStats || {};
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
  const nextMonthly = stats.monthlyWindow === monthKey ? stats.monthlyGenerations || 0 : 0;

  user.aiUsageStats = {
    totalGenerations: (stats.totalGenerations || 0) + 1,
    monthlyGenerations: nextMonthly + 1,
    lastGeneratedAt: now,
    monthlyWindow: monthKey
  };

  await user.save();
};

const processPrevisualizationJob = async ({ previsualizationId, ownerId }) => {
  const previsualization = await Previsualization.findOne({
    _id: previsualizationId,
    owner: ownerId
  }).select("+sceneRenderKey +generatedImageKey");

  if (!previsualization) {
    return;
  }

  if (previsualization.status === "completed") {
    return;
  }

  previsualization.status = "processing";
  await previsualization.save();

  const [user, sceneBuffer] = await Promise.all([
    User.findById(ownerId).select("+aiApiKey aiUsageStats"),
    downloadBuffer(previsualization.sceneRenderKey)
  ]);

  if (!user || !user.aiApiKey) {
    previsualization.status = "failed";
    previsualization.errorMessage = "API 키가 설정되어 있지 않습니다.";
    await previsualization.save();
    return;
  }

  if (!sceneBuffer) {
    previsualization.status = "failed";
    previsualization.errorMessage = "씬 렌더링 이미지를 불러올 수 없습니다.";
    await previsualization.save();
    return;
  }

  const startedAt = Date.now();

  let params;

  try {
    const apiKey = decryptApiKey(user.aiApiKey);
    params = buildGenerationParams(previsualization.generationParams);
    const generatedBuffer = await requestAiImage({
      apiKey,
      prompt: previsualization.prompt,
      negativePrompt: previsualization.negativePrompt,
      params,
      sceneBuffer,
      mimeType: previsualization.sceneRenderMimeType || "image/png"
    });

    const uploadResult = await uploadBuffer({
      key: generateAssetKey({
        type: "ai-generated",
        ownerId,
        projectId: previsualization.project ? previsualization.project.toString() : null,
        originalName: "previsualization.png"
      }),
      body: generatedBuffer,
      contentType: "image/png"
    });

    previsualization.generatedImageUrl = uploadResult.url;
    previsualization.generatedImageKey = uploadResult.key;
    previsualization.generatedImageMimeType = "image/png";
    previsualization.status = "completed";
    previsualization.errorMessage = null;
    previsualization.metadata = {
      processingTime: Date.now() - startedAt,
      apiProvider: AI_PROVIDER,
      apiVersion: params.model || DEFAULT_GEMINI_IMAGE_MODEL
    };

    await previsualization.save();
    await updateUsageStats(user);
  } catch (error) {
    console.error("[AI] 프리비주얼 생성 실패", error);
    previsualization.status = "failed";
    previsualization.errorMessage = error.message || "이미지 생성에 실패했습니다.";
    previsualization.metadata = {
      ...(previsualization.metadata || {}),
      apiProvider: AI_PROVIDER,
      apiVersion: params?.model || DEFAULT_GEMINI_IMAGE_MODEL
    };
    await previsualization.save();
  }
};

module.exports = {
  createPrevisualization,
  deletePrevisualization,
  deleteApiKeyForOwner,
  getApiKeyStatus,
  getPrevisualizationById,
  getUsageSummary,
  iteratePrevisualization,
  listPrevisualizations,
  processPrevisualizationJob,
  saveApiKeyForUser
};
