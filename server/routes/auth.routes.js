const express = require("express");
const passport = require("passport");

const authController = require("../controllers/auth.controller");
const requireAuth = require("../middleware/auth.middleware");
const { issueCsrfToken } = require("../middleware/csrf.middleware");
const validate = require("../validators/validate");
const { registerSchema, loginSchema } = require("../validators/auth.schemas");

const router = express.Router();

router.get("/csrf-token", issueCsrfToken);
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);
router.patch("/profile", requireAuth, authController.updateProfile);
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
    session: false
  })
);
router.get("/naver/callback", authController.oauthCallback("naver"));

module.exports = router;
