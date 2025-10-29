const express = require("express");

const projectController = require("../controllers/project.controller");
const shareController = require("../controllers/share.controller");
const requireAuth = require("../middleware/auth.middleware");
const validate = require("../validators/validate");
const {
  createProjectSchema,
  updateProjectSchema
} = require("../validators/project.schemas");
const {
  createShareSchema,
  updateShareSchema,
  projectShareParamsSchema
} = require("../validators/share.schemas");

const router = express.Router();

router.use(requireAuth);
router.post("/", validate(createProjectSchema), projectController.create);
router.get("/", projectController.list);
router.get("/:id", projectController.getOne);
router.patch("/:id", validate(updateProjectSchema), projectController.update);
router.delete("/:id", projectController.remove);
router.get("/:id/share", validate(projectShareParamsSchema), shareController.getShareConfig);
router.post("/:id/share", validate(createShareSchema), shareController.createShareLink);
router.patch("/:id/share", validate(updateShareSchema), shareController.updateShareConfig);
router.post(
  "/:id/share/regenerate",
  validate(projectShareParamsSchema),
  shareController.regenerateShareLink
);
router.delete("/:id/share", validate(projectShareParamsSchema), shareController.revokeShareLinks);

module.exports = router;
