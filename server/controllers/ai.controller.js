const User = require("../models/User");
const {
  createPrevisualization,
  deletePrevisualization,
  getApiKeyStatus,
  getPrevisualizationById,
  getUsageSummary,
  iteratePrevisualization,
  listPrevisualizations,
  saveApiKeyForUser,
  deleteApiKeyForOwner
} = require("../services/ai.service");
const { enqueuePrevisualizationJob } = require("../queues/ai.queue");

const buildOwnerId = (user) => user.id || user._id.toString();

const resolveProgress = (status) => {
  switch (status) {
    case "completed":
      return 100;
    case "processing":
      return 75;
    case "failed":
      return 0;
    default:
      return 25;
  }
};

const mapPrevisualizationForClient = (previsualization) => {
  if (!previsualization) {
    return null;
  }

  const thumbnail =
    previsualization.generatedImageUrl || previsualization.sceneRenderUrl;

  return {
    id: previsualization.id,
    projectId: previsualization.projectId,
    parentId: previsualization.parentId,
    status: previsualization.status,
    prompt: previsualization.prompt,
    negativePrompt: previsualization.negativePrompt,
    resultImage: previsualization.generatedImageUrl,
    sourceImage: previsualization.sceneRenderUrl,
    thumbnailUrl: thumbnail,
    error: previsualization.errorMessage,
    generationParams: previsualization.generationParams || null,
    metadata: previsualization.metadata || {},
    createdAt: previsualization.createdAt,
    updatedAt: previsualization.updatedAt
  };
};

const parseJsonField = (value, label) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    const error = new Error(`${label} 형식이 올바르지 않습니다.`);
    error.status = 400;
    throw error;
  }
};

const storeApiKey = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const user = await User.findById(ownerId).select("+aiApiKey aiUsageStats");

    if (!user) {
      const error = new Error("사용자를 찾을 수 없습니다.");
      error.status = 404;
      throw error;
    }

    await saveApiKeyForUser(user, req.body.apiKey);

    res.status(200).json({
      message: "Nano Banana API 키가 저장되었습니다."
    });
  } catch (error) {
    next(error);
  }
};

const removeApiKey = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    await deleteApiKeyForOwner(ownerId);

    res.status(200).json({
      message: "API 키가 삭제되었습니다."
    });
  } catch (error) {
    next(error);
  }
};

const fetchApiKeyStatus = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const status = await getApiKeyStatus(ownerId);

    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

const fetchUsageStats = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const stats = await getUsageSummary(ownerId);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const createPrevisualizeJob = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const generationParams = parseJsonField(req.body.generationParams, "generationParams");
    const sceneSnapshot = parseJsonField(req.body.sceneSnapshot, "sceneSnapshot");

    const { previsualization, estimatedTime } = await createPrevisualization({
      ownerId,
      projectId: req.body.projectId || undefined,
      prompt: req.body.prompt,
      negativePrompt: req.body.negativePrompt,
      generationParams,
      sceneFile: req.file,
      sceneSnapshot
    });

    await enqueuePrevisualizationJob({
      previsualizationId: previsualization.id,
      ownerId
    });

    const preview = mapPrevisualizationForClient(previsualization);

    res.status(202).json({
      message: "프리비주얼 이미지 생성 작업이 시작되었습니다.",
      id: preview.id,
      status: preview.status,
      estimatedTime,
      preview
    });
  } catch (error) {
    next(error);
  }
};

const getPrevisualization = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const previsualization = await getPrevisualizationById(ownerId, req.params.id);
    const preview = mapPrevisualizationForClient(previsualization);

    res.status(200).json({
      ...preview,
      progress: resolveProgress(preview.status)
    });
  } catch (error) {
    next(error);
  }
};

const listPrevisualization = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const result = await listPrevisualizations({
      ownerId,
      projectId: req.query.projectId,
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    });

    res.status(200).json({
      items: result.previsualizations.map(mapPrevisualizationForClient),
      pagination: result.pagination,
      total: result.pagination.total
    });
  } catch (error) {
    next(error);
  }
};

const iteratePrevisualize = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const { previsualization, estimatedTime } = await iteratePrevisualization({
      ownerId,
      id: req.params.id,
      prompt: req.body.prompt,
      negativePrompt: req.body.negativePrompt,
      generationParams: req.body.generationParams
    });

    await enqueuePrevisualizationJob({
      previsualizationId: previsualization.id,
      ownerId
    });

    const preview = mapPrevisualizationForClient(previsualization);

    res.status(202).json({
      message: "프롬프트가 업데이트되어 새로운 이미지를 생성합니다.",
      id: preview.id,
      status: preview.status,
      estimatedTime,
      preview
    });
  } catch (error) {
    next(error);
  }
};

const removePrevisualization = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    await deletePrevisualization({ ownerId, id: req.params.id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrevisualizeJob,
  fetchUsageStats,
  fetchApiKeyStatus,
  getPrevisualization,
  iteratePrevisualize,
  listPrevisualization,
  removeApiKey,
  removePrevisualization,
  storeApiKey
};
