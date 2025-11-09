const path = require("node:path");
const mime = require("mime-types");
const {
  createAssetFromBuffer,
  getAssetsForProject,
  removeAsset
} = require("../services/asset.service");

const HDRI_EXTENSIONS = new Set([".hdr", ".exr"]);
const HDRI_MIME_TYPES = new Set([
  "image/vnd.radiance",
  "image/x-hdr",
  "image/exr",
  "image/png",
  "image/jpeg",
  "application/octet-stream"
]);
const GLTF_EXTENSIONS = new Set([".glb"]);
const GLTF_MIME_TYPES = new Set([
  "model/gltf-binary",
  "application/octet-stream"
]);

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

const uploadHdri = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);

    validateFile(req.file, {
      extensions: HDRI_EXTENSIONS,
      mimeTypes: HDRI_MIME_TYPES,
      maxSize: 50 * 1024 * 1024
    });

    // EXR/HDR 파일에 대한 올바른 MIME 타입 설정
    const ext = path.extname(req.file.originalname).toLowerCase();
    let mimeType;
    if (ext === '.exr') {
      mimeType = 'image/x-exr';
    } else if (ext === '.hdr') {
      mimeType = 'image/vnd.radiance';
    } else {
      mimeType = req.file.mimetype || mime.lookup(req.file.originalname) || "application/octet-stream";
    }

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

const uploadGltf = async (req, res, next) => {
  try {
    const ownerId = buildOwnerId(req.user);

    validateFile(req.file, {
      extensions: GLTF_EXTENSIONS,
      mimeTypes: GLTF_MIME_TYPES,
      maxSize: 100 * 1024 * 1024
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
  uploadHdri,
  uploadGltf,
  listByProject,
  remove
};
