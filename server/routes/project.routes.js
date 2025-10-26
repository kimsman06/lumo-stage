const express = require("express");

const projectController = require("../controllers/project.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);
router.post("/", projectController.create);
router.get("/", projectController.list);
router.get("/:id", projectController.getOne);
router.patch("/:id", projectController.update);
router.delete("/:id", projectController.remove);

module.exports = router;
