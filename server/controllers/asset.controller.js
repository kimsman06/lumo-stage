const path = require("node:path");
const mime = require("mime-types");
const {
  createAssetFromBuffer,
  createAssetFromKey,
  getAssetsForProject,
  removeAsset
} = require("../services/asset.service");
const {
  generateAssetKey,
  createUploadUrl
} = require("../services/storage.service");

const HDRI_EXTENSIONS = new Set([".hdr", ".exr"]);
const HDRI_MIME_TYPES = new Set([
  "image/vnd.radiance",
  "image/x-hdr",
  "image/exr",
  "image/png",
  "image/jpeg",
  "application/octet-stream"
]);
const HDRI_MAX_SIZE = 50 * 1024 * 1024;
const GLTF_EXTENSIONS = new Set([".glb"]);
const GLTF_MIME_TYPES = new Set([
  "model/gltf-binary",
  "application/octet-stream"
]);
const GLTF_MAX_SIZE = 100 * 1024 * 1024;

const buildOwnerId = (user) => user.id || user._id.toString();

const validateFile = (file, { extensions, mimeTypes, maxSize }) => {
  if (!file) {
    const error = new Error("업로드할 파일이 필요합니다.");
    error.status = 400;
    throw error;
  }

  if (file.size > maxSize) {
    const error = new Error("파일 크기가 허용 범위를 초과했습니다.");
    error.status = 400;
    throw error;
  }

  const ext = path.extname(file.originalname).toLowerCase();

  if (!extensions.has(ext)) {
    const error = new Error(`지원하지 않는 파일 확장자입니다: ${ext}`);
    error.status = 400;
    throw error;
  }

  if (file.mimetype && !mimeTypes.has(file.mimetype)) {
    const error = new Error("지원하지 않는 MIME 타입입니다.");
    error.status = 400;
    throw error;
  }
};

const createVirtualFile = ({ fileName, fileSize, mimeType }) => ({
  originalname: fileName,
  size: fileSize,
  mimetype: mimeType
});

const resolveHdriMimeType = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".exr") {
    return "image/x-exr";
  }

  if (ext === ".hdr") {
    return "image/vnd.radiance";
  }

  return (
    file.mimetype ||
    mime.lookup(file.originalname) ||
    "application/octet-stream"
  );
};

const uploadHdri = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);

    validateFile(req.file, {
      extensions: HDRI_EXTENSIONS,
      mimeTypes: HDRI_MIME_TYPES,
      maxSize: HDRI_MAX_SIZE
    });

    const mimeType = resolveHdriMimeType(req.file);

    const asset = await createAssetFromBuffer({
      ownerId,
      projectId: req.body.projectId,
      type: "hdri",
      fileName: req.file.originalname,
      mimeType,
      fileSize: req.file.size,
      buffer: req.file.buffer,
      metadata: {}
    });

    res.status(201).json({
      message: "HDRI가 업로드되었습니다.",
      asset
    });
  } catch (error) {
    next(error);
  }
};

const initiateHdriUpload = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const { projectId, fileName, fileSize, mimeType } = req.body || {};

    const virtualFile = createVirtualFile({
      fileName,
      fileSize,
      mimeType
    });

    validateFile(virtualFile, {
      extensions: HDRI_EXTENSIONS,
      mimeTypes: HDRI_MIME_TYPES,
      maxSize: HDRI_MAX_SIZE
    });

    const resolvedMimeType = resolveHdriMimeType(virtualFile);

    const fileKey = generateAssetKey({
      type: "hdri",
      ownerId,
      projectId,
      originalName: fileName
    });

    const { url: uploadUrl, headers } = await createUploadUrl({
      key: fileKey,
      contentType: resolvedMimeType
    });

    res.status(200).json({
      uploadUrl,
      fileKey,
      headers,
      mimeType: resolvedMimeType,
      maxSize: HDRI_MAX_SIZE
    });
  } catch (error) {
    next(error);
  }
};

const completeHdriUpload = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const { projectId, fileName, fileSize, mimeType, fileKey } = req.body || {};

    if (!fileKey) {
      const error = new Error("fileKey가 필요합니다.");
      error.status = 400;
      throw error;
    }

    const virtualFile = createVirtualFile({
      fileName,
      fileSize,
      mimeType
    });

    validateFile(virtualFile, {
      extensions: HDRI_EXTENSIONS,
      mimeTypes: HDRI_MIME_TYPES,
      maxSize: HDRI_MAX_SIZE
    });

    const resolvedMimeType = resolveHdriMimeType(virtualFile);

    const asset = await createAssetFromKey({
      ownerId,
      projectId,
      type: "hdri",
      fileName,
      mimeType: resolvedMimeType,
      fileSize,
      fileKey,
      metadata: {}
    });

    res.status(201).json({
      message: "HDRI가 업로드되었습니다.",
      asset
    });
  } catch (error) {
    next(error);
  }
};

const uploadGltf = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);

    validateFile(req.file, {
      extensions: GLTF_EXTENSIONS,
      mimeTypes: GLTF_MIME_TYPES,
      maxSize: GLTF_MAX_SIZE
    });

    const mimeType = req.file.mimetype || mime.lookup(req.file.originalname) || "application/octet-stream";

    const asset = await createAssetFromBuffer({
      ownerId,
      projectId: req.body.projectId,
      type: "gltf",
      fileName: req.file.originalname,
      mimeType,
      fileSize: req.file.size,
      buffer: req.file.buffer,
      metadata: {
        compression: req.body.compression || null
      }
    });

    res.status(201).json({
      message: "GLTF 파일이 업로드되었습니다.",
      asset
    });
  } catch (error) {
    next(error);
  }
};

const listByProject = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    const assets = await getAssetsForProject(req.params.projectId, ownerId);

    res.status(200).json({ assets });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);
    await removeAsset(req.params.assetId, ownerId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeHdriUpload,
  initiateHdriUpload,
  uploadHdri,
  uploadGltf,
  listByProject,
  remove
};
