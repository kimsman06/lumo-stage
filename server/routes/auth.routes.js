const express = require("express");
const passport = require("passport");

const authController = require("../controllers/auth.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account"
  })
);
router.get("/google/callback", authController.oauthCallback("google"));
router.get(
  "/naver",
  passport.authenticate("naver", {
    scope: ["profile", "email"],
    session: false
  })
);
router.get("/naver/callback", authController.oauthCallback("naver"));

module.exports = router;
