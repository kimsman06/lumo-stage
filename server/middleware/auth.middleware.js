const User = require("../models/User");

const requireAuth = async (req, _res, next) => {
  try {
    // 배포 환경 디버깅
    console.log("[Auth] Request:", {
      method: req.method,
      url: req.url,
      hasSession: !!req.session,
      sessionId: req.session?.id,
      userId: req.session?.userId,
      hasCookie: !!req.cookies,
      cookies: Object.keys(req.cookies || {}),
      origin: req.get("origin")
    });

    if (req.user) {
      next();
      return;
    }

    const userId = req.session?.userId;

    if (!userId) {
      console.warn("[Auth] No userId in session");
      const error = new Error("인증이 필요합니다.");
      error.status = 401;
      throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
      console.warn("[Auth] User not found:", userId);
      if (req.session) {
        req.session.destroy(() => {});
      }

      const error = new Error("인증이 필요합니다.");
      error.status = 401;
      throw error;
    }

    console.log("[Auth] User authenticated:", user._id);
    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "인증이 필요합니다.";
    }

    next(error);
  }
};

module.exports = requireAuth;
