const crypto = require("crypto");
const mongoose = require("mongoose");

const Project = require("../models/Project");
const ShareToken = require("../models/ShareToken");
const { normalizeSceneData } = require("./scene.service");

const MAX_ACTIVE_TOKENS_PER_PROJECT = 5;
const SHARE_PERMISSIONS = ["view", "edit"];

const toObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  return new mongoose.Types.ObjectId(value);
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateShareToken = () => crypto.randomBytes(48).toString("base64url");

const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const findOwnedProject = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    throw createError("프로젝트를 찾을 수 없습니다.", 404);
  }

  return project;
};

const findActiveShareToken = async (projectId) =>
  ShareToken.findOne({ project: projectId, isRevoked: false }).sort({ createdAt: -1 });

const sanitizeProjectForShare = (projectDoc) => {
  const project = projectDoc.toObject({ versionKey: false });
  const { data: normalizedScene } = normalizeSceneData(project.sceneData);
  project.sceneData = normalizedScene;

  return {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    sceneData: project.sceneData,
    thumbnail: project.thumbnail,
    updatedAt: project.updatedAt,
    createdAt: project.createdAt
  };
};

const trimActiveTokens = async (projectId) => {
  const tokens = await ShareToken.find({ project: projectId, isRevoked: false })
    .sort({ createdAt: -1 })
    .skip(MAX_ACTIVE_TOKENS_PER_PROJECT);

  if (tokens.length === 0) {
    return;
  }

  const now = new Date();

  await ShareToken.updateMany(
    { _id: { $in: tokens.map((token) => token._id) } },
    {
      $set: {
        isRevoked: true,
        revokedAt: now,
        revokedReason: "max_tokens_exceeded",
        isActive: false,
        deactivatedAt: now
      }
    }
  );
};

const parsePermission = (value, fallback = "view") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (!SHARE_PERMISSIONS.includes(normalized)) {
    throw createError("권한 값이 올바르지 않습니다.", 400);
  }

  return normalized;
};

const parseExpiresAt = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw createError("만료 시간이 올바르지 않습니다.", 400);
    }
    return value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw createError("만료 시간이 올바르지 않습니다.", 400);
    }
    return date;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return null;
    }

    const date = new Date(trimmed);

    if (Number.isNaN(date.getTime())) {
      throw createError("만료 시간이 올바르지 않습니다.", 400);
    }

    return date;
  }

  throw createError("만료 시간이 올바르지 않습니다.", 400);
};

const ensureFutureExpiresAt = (date) => {
  if (date && date <= new Date()) {
    throw createError("만료 시간은 현재 이후여야 합니다.", 400);
  }
};

const buildShareConfigResponse = (shareToken, { includeToken = false } = {}) => {
  const payload = {
    id: shareToken._id.toString(),
    permission: shareToken.permission,
    isActive: shareToken.isActive,
    expiresAt: shareToken.expiresAt ? shareToken.expiresAt.toISOString() : null,
    createdAt: shareToken.createdAt.toISOString(),
    updatedAt: shareToken.updatedAt.toISOString()
  };

  if (includeToken) {
    payload.token = shareToken.token;
  }

  return payload;
};

const createShareToken = async (projectId, ownerId, config = {}, metadata = {}) => {
  const project = await findOwnedProject(projectId, ownerId);
  const existing = await findActiveShareToken(project._id);

  if (existing) {
    throw createError("이미 공유 링크가 존재합니다.", 409);
  }

  const permission = parsePermission(config.permission ?? "view", "view");
  const isActive = config.isActive === undefined ? true : Boolean(config.isActive);
  const expiresAtInput = parseExpiresAt(config.expiresAt);
  ensureFutureExpiresAt(expiresAtInput === undefined ? null : expiresAtInput);
  const expiresAt = expiresAtInput === undefined ? null : expiresAtInput;

  const plainToken = generateShareToken();

  const shareToken = await ShareToken.create({
    project: project._id,
    token: plainToken,
    tokenHash: hashToken(plainToken),
    permission,
    isActive,
    expiresAt,
    deactivatedAt: isActive ? null : new Date(),
    createdBy: toObjectId(ownerId),
    createdByIp: metadata.ip,
    userAgent: metadata.userAgent
  });

  await trimActiveTokens(project._id);

  return buildShareConfigResponse(shareToken, { includeToken: true });
};

const getShareConfig = async (projectId, ownerId) => {
  const project = await findOwnedProject(projectId, ownerId);
  const shareToken = await findActiveShareToken(project._id);

  if (!shareToken) {
    throw createError("공유 링크가 아직 생성되지 않았습니다.", 404);
  }

  return buildShareConfigResponse(shareToken, { includeToken: true });
};

const updateShareConfig = async (projectId, ownerId, updates = {}) => {
  const project = await findOwnedProject(projectId, ownerId);
  const shareToken = await findActiveShareToken(project._id);

  if (!shareToken) {
    throw createError("공유 링크가 아직 생성되지 않았습니다.", 404);
  }

  let hasChanges = false;

  if (updates.permission !== undefined) {
    const permission = parsePermission(updates.permission, shareToken.permission);
    if (permission !== shareToken.permission) {
      shareToken.permission = permission;
      hasChanges = true;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, "expiresAt")) {
    const expiresAt = parseExpiresAt(updates.expiresAt);
    ensureFutureExpiresAt(expiresAt);
    if ((expiresAt ?? null) !== (shareToken.expiresAt ?? null)) {
      shareToken.expiresAt = expiresAt ?? null;
      hasChanges = true;
    }
  }

  if (updates.isActive !== undefined) {
    const isActive = Boolean(updates.isActive);
    if (isActive !== shareToken.isActive) {
      shareToken.isActive = isActive;
      shareToken.deactivatedAt = isActive ? null : new Date();
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await shareToken.save();
  }

  return buildShareConfigResponse(shareToken, { includeToken: true });
};

const regenerateShareToken = async (projectId, ownerId, metadata = {}) => {
  const project = await findOwnedProject(projectId, ownerId);
  const currentToken = await findActiveShareToken(project._id);

  if (!currentToken) {
    throw createError("공유 링크가 아직 생성되지 않았습니다.", 404);
  }

  const plainToken = generateShareToken();

  const shareToken = await ShareToken.create({
    project: project._id,
    token: plainToken,
    tokenHash: hashToken(plainToken),
    permission: currentToken.permission,
    isActive: currentToken.isActive,
    expiresAt: currentToken.expiresAt,
    deactivatedAt: currentToken.isActive ? null : new Date(),
    createdBy: toObjectId(ownerId),
    createdByIp: metadata.ip,
    userAgent: metadata.userAgent
  });

  await ShareToken.deleteMany({
    project: project._id,
    _id: { $ne: shareToken._id }
  });

  return buildShareConfigResponse(shareToken, { includeToken: true });
};

const revokeShareTokens = async (projectId, ownerId, metadata = {}) => {
  const project = await findOwnedProject(projectId, ownerId);

  const now = new Date();

  await ShareToken.updateMany(
    { project: project._id, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: now,
        revokedReason: "revoked",
        revokedMetadata: {
          ip: metadata.ip,
          userAgent: metadata.userAgent
        },
        isActive: false,
        deactivatedAt: now
      }
    }
  );
};

const resolveShareToken = async (token, metadata = {}) => {
  if (!token || typeof token !== "string") {
    throw createError("공유 토큰이 필요합니다.", 400);
  }

  const shareToken =
    (await ShareToken.findOne({ token: token.trim() })) ||
    (await ShareToken.findOne({ tokenHash: hashToken(token.trim()) }));

  if (!shareToken) {
    throw createError("공유 토큰을 찾을 수 없습니다.", 404);
  }

  if (shareToken.isRevoked) {
    throw createError("이 공유 링크는 더 이상 유효하지 않습니다.", 410);
  }

  if (!shareToken.isActive) {
    throw createError("이 공유 링크는 비활성화되었습니다.", 403);
  }

  if (shareToken.expiresAt && shareToken.expiresAt <= new Date()) {
    shareToken.isRevoked = true;
    shareToken.revokedAt = new Date();
    shareToken.revokedReason = "expired";
    await shareToken.save();
    throw createError("공유 링크가 만료되었습니다.", 410);
  }

  shareToken.lastAccessedAt = new Date();
  shareToken.lastAccessedIp = metadata.ip;
  shareToken.lastAccessedUserAgent = metadata.userAgent;
  shareToken.accessCount = (shareToken.accessCount || 0) + 1;
  await shareToken.save();

  const project = await Project.findById(shareToken.project);

  if (!project) {
    shareToken.isRevoked = true;
    shareToken.revokedAt = new Date();
    shareToken.revokedReason = "project_deleted";
    await shareToken.save();
    throw createError("프로젝트가 더 이상 존재하지 않습니다.", 410);
  }

  return {
    project: sanitizeProjectForShare(project),
    permission: shareToken.permission,
    expiresAt: shareToken.expiresAt ? shareToken.expiresAt.toISOString() : null,
    isActive: shareToken.isActive
  };
};

module.exports = {
  createShareToken,
  getShareConfig,
  updateShareConfig,
  regenerateShareToken,
  revokeShareTokens,
  resolveShareToken
};
