const express = require("express");
const multer = require("multer");

const assetController = require("../controllers/asset.controller");
const requireAuth = require("../middleware/auth.middleware");
const validate = require("../validators/validate");
const {
  projectAssetParamsSchema,
  assetIdParamsSchema
} = require("../validators/asset.schemas");

const router = express.Router();

const createUploader = (maxSizeMb) =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeMb * 1024 * 1024
    }
  });

const wrapUpload = (middleware) => (req, res, next) =>
  middleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        message: "파일 크기가 허용 범위를 초과했습니다."
      });
      return;
    }

    next(error);
  });

const hdriUpload = createUploader(50);
const gltfUpload = createUploader(100);

router.use(requireAuth);

router.post(
  "/upload-hdri",
  wrapUpload(hdriUpload.single("file")),
  assetController.uploadHdri
);

router.post(
  "/upload-gltf",
  wrapUpload(gltfUpload.single("file")),
  assetController.uploadGltf
);

router.get(
  "/project/:projectId",
  validate(projectAssetParamsSchema),
  assetController.listByProject
);

router.delete(
  "/:assetId",
  validate(assetIdParamsSchema),
  assetController.remove
);

module.exports = router;
