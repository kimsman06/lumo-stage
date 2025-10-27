const express = require("express");
const authRoutes = require("./auth.routes");
const projectRoutes = require("./project.routes");
const shareRoutes = require("./share.routes");
const { requireCsrfProtection } = require("../middleware/csrf.middleware");

const router = express.Router();

router.use(requireCsrfProtection);
router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/share", shareRoutes);

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;
