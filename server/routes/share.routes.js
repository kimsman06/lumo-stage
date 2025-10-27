const express = require("express");

const shareController = require("../controllers/share.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:token", shareController.resolveShareToken);
router.post("/projects/:id", requireAuth, shareController.createShareToken);
router.delete("/projects/:id", requireAuth, shareController.revokeShareTokens);

module.exports = router;
