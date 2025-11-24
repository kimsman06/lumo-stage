const express = require("express");
const multer = require("multer");

const aiController = require("../controllers/ai.controller");
const requireAuth = require("../middleware/auth.middleware");
const { createRateLimiter } = require("../middleware/rateLimiter");
const validate = require("../validators/validate");
const {
  apiKeyBodySchema,
  idParamsSchema,
  iterateBodySchema,
  listQuerySchema
} = require("../validators/ai.schemas");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const wrapUpload = (middleware) => (req, res, next) =>
  middleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        message: "이미지 크기가 허용 범위를 초과했습니다."
      });
      return;
    }

    next(error);
  });

const aiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.AI_MAX_HOURLY_GENERATIONS || 10),
  keyGenerator: (req) => {
    if (req.user) {
      return req.user.id || req.user._id.toString();
    }

    return req.ip;
  }
});

router.use(requireAuth);

router.post("/api-key", validate(apiKeyBodySchema), aiController.storeApiKey);
router.get("/api-key/status", aiController.fetchApiKeyStatus);
router.delete("/api-key", aiController.removeApiKey);
router.get("/usage", aiController.fetchUsageStats);

router.post(
  "/previsualize",
  wrapUpload(upload.single("sceneRender")),
  aiLimiter,
  aiController.createPrevisualizeJob
);

router.get(
  "/previsualize/:id",
  validate(idParamsSchema),
  aiController.getPrevisualization
);

router.get(
  "/previsualizations",
  validate(listQuerySchema),
  aiController.listPrevisualization
);

router.post(
  "/previsualize/:id/iterate",
  validate(iterateBodySchema),
  aiLimiter,
  aiController.iteratePrevisualize
);

router.delete(
  "/previsualize/:id",
  validate(idParamsSchema),
  aiController.removePrevisualization
);

module.exports = router;
