const crypto = require("crypto");
const mongoose = require("mongoose");

const Project = require("../models/Project");
const ShareToken = require("../models/ShareToken");
const { normalizeSceneData } = require("./scene.service");

const SHARE_TOKEN_TTL_DEFAULT = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ACTIVE_TOKENS_PER_PROJECT = 5;

const parseDurationToMs = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const matches = /^(\d+)([smhd])$/.exec(value);

  if (!matches) {
    return fallback;
  }

  const [, amount, unit] = matches;
  const quantity = Number(amount);

  switch (unit) {
    case "s":
      return quantity * 1000;
    case "m":
      return quantity * 60 * 1000;
    case "h":
      return quantity * 60 * 60 * 1000;
    case "d":
      return quantity * 24 * 60 * 60 * 1000;
    default:
      return fallback;
  }
};

const getShareTokenTtlMs = () =>
  parseDurationToMs(process.env.SHARE_TOKEN_TTL, SHARE_TOKEN_TTL_DEFAULT);

const toObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  return new mongoose.Types.ObjectId(value);
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateShareToken = () => crypto.randomBytes(48).toString("base64url");

const findOwnedProject = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    const error = new Error("프로젝트를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  return project;
};

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

  await ShareToken.updateMany(
    { _id: { $in: tokens.map((token) => token._id) } },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "max_tokens_exceeded"
      }
    }
  );
};

const createShareToken = async (projectId, ownerId, metadata = {}) => {
  const project = await findOwnedProject(projectId, ownerId);

  await ShareToken.updateMany(
    { project: project._id, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "replaced"
      }
    }
  );

  const plainToken = generateShareToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + getShareTokenTtlMs());

  const shareToken = await ShareToken.create({
    project: project._id,
    tokenHash,
    expiresAt,
    createdBy: toObjectId(ownerId),
    createdByIp: metadata.ip,
    userAgent: metadata.userAgent
  });

  await trimActiveTokens(project._id);

  return {
    shareToken: plainToken,
    expiresAt
  };
};

const revokeShareTokens = async (projectId, ownerId, metadata = {}) => {
  const project = await findOwnedProject(projectId, ownerId);

  await ShareToken.updateMany(
    { project: project._id, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "revoked",
        revokedMetadata: {
          ip: metadata.ip,
          userAgent: metadata.userAgent
        }
      }
    }
  );
};

const resolveShareToken = async (token, metadata = {}) => {
  const tokenHash = hashToken(token);
  const shareToken = await ShareToken.findOne({ tokenHash });

  if (!shareToken) {
    const error = new Error("공유 토큰을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  if (shareToken.isRevoked) {
    const error = new Error("공유 토큰이 사용 중지되었습니다.");
    error.status = 410;
    throw error;
  }

  if (shareToken.expiresAt < new Date()) {
    shareToken.isRevoked = true;
    shareToken.revokedAt = new Date();
    shareToken.revokedReason = "expired";
    await shareToken.save();

    const error = new Error("공유 토큰이 만료되었습니다.");
    error.status = 410;
    throw error;
  }

  shareToken.lastAccessedAt = new Date();
  shareToken.lastAccessedIp = metadata.ip;
  shareToken.lastAccessedUserAgent = metadata.userAgent;
  shareToken.accessCount = (shareToken.accessCount || 0) + 1;
  await shareToken.save();

  const project = await Project.findById(shareToken.project);

  if (!project) {
    const error = new Error("프로젝트가 더 이상 존재하지 않습니다.");
    error.status = 410;
    throw error;
  }

  return {
    project: sanitizeProjectForShare(project),
    expiresAt: shareToken.expiresAt
  };
};

module.exports = {
  createShareToken,
  revokeShareTokens,
  resolveShareToken,
  getShareTokenTtlMs
};
