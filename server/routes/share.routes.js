const express = require("express");

const shareController = require("../controllers/share.controller");

const router = express.Router();

router.get("/:token", shareController.resolveShareToken);

module.exports = router;
