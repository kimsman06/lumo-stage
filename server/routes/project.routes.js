const express = require("express");

const projectController = require("../controllers/project.controller");
const requireAuth = require("../middleware/auth.middleware");
const validate = require("../validators/validate");
const {
  createProjectSchema,
  updateProjectSchema
} = require("../validators/project.schemas");

const router = express.Router();

router.use(requireAuth);
router.post("/", validate(createProjectSchema), projectController.create);
router.get("/", projectController.list);
router.get("/:id", projectController.getOne);
router.patch("/:id", validate(updateProjectSchema), projectController.update);
router.delete("/:id", projectController.remove);

module.exports = router;
