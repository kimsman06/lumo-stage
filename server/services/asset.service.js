const mongoose = require("mongoose");

const Asset = require("../models/Asset");
const Project = require("../models/Project");
const {
  uploadBuffer,
  deleteObject,
  generateAssetKey,
  getPublicUrl
} = require("./storage.service");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatAsset = (assetDoc) => {
  const asset = assetDoc.toObject({ versionKey: false });

  asset.id = asset._id.toString();
  asset.owner = asset.owner.toString();
  asset.projectId = asset.projectId ? asset.projectId.toString() : null;

  delete asset._id;

  return asset;
};

const resolveProjectForOwner = async (projectId, ownerId, { optional = false } = {}) => {
  if (!projectId) {
    if (optional) {
      return null;
    }

    const error = new Error("projectId는 필수입니다.");
    error.status = 400;
    throw error;
  }

  if (!isValidObjectId(projectId)) {
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

const createAssetFromBuffer = async ({
  ownerId,
  projectId,
  type,
  fileName,
  mimeType,
  fileSize,
  buffer,
  metadata
}) => {
  const project = await resolveProjectForOwner(projectId, ownerId, { optional: true });
  const normalizedMetadata = metadata || {};

  const fileKey = generateAssetKey({
    type,
    ownerId,
    projectId: project ? project.id || project._id.toString() : null,
    originalName: fileName
  });

  const { url } = await uploadBuffer({
    key: fileKey,
    body: buffer,
    contentType: mimeType
  });

  const asset = await Asset.create({
    owner: ownerId,
    projectId: project ? project._id : null,
    type,
    fileName,
    fileKey,
    fileUrl: url,
    fileSize,
    mimeType,
    metadata: normalizedMetadata
  });

  return formatAsset(asset);
};

const createAssetFromKey = async ({
  ownerId,
  projectId,
  type,
  fileName,
  mimeType,
  fileSize,
  fileKey,
  metadata
}) => {
  if (!fileKey) {
    const error = new Error("fileKey가 필요합니다.");
    error.status = 400;
    throw error;
  }

  const project = await resolveProjectForOwner(projectId, ownerId, {
    optional: true
  });
  const normalizedMetadata = metadata || {};

  const asset = await Asset.create({
    owner: ownerId,
    projectId: project ? project._id : null,
    type,
    fileName,
    fileKey,
    fileUrl: getPublicUrl(fileKey),
    fileSize,
    mimeType,
    metadata: normalizedMetadata
  });

  return formatAsset(asset);
};

const getAssetsForProject = async (projectId, ownerId) => {
  const project = await resolveProjectForOwner(projectId, ownerId);

  const assets = await Asset.find({
    owner: ownerId,
    projectId: project._id
  }).sort({ uploadedAt: -1 });

  return assets.map(formatAsset);
};

const removeAsset = async (assetId, ownerId) => {
  if (!isValidObjectId(assetId)) {
    const error = new Error("잘못된 에셋 ID입니다.");
    error.status = 400;
    throw error;
  }

  const asset = await Asset.findOne({ _id: assetId, owner: ownerId });

  if (!asset) {
    const error = new Error("에셋을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  await deleteObject(asset.fileKey);
  await asset.deleteOne();
};

const removeAssetsByProject = async (projectId, ownerId) => {
  if (!projectId) {
    return;
  }

  const assets = await Asset.find({
    owner: ownerId,
    projectId
  });

  if (!assets.length) {
    return;
  }

  await Promise.all(
    assets.map(async (asset) => {
      await deleteObject(asset.fileKey);
      await asset.deleteOne();
    })
  );
};

module.exports = {
  createAssetFromBuffer,
  createAssetFromKey,
  getAssetsForProject,
  removeAsset,
  removeAssetsByProject
};
