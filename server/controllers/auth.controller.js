const passport = require("passport");

const { registerUser, loginUser, loginWithProvider, sanitizeUser, updateUserProfile } = require("../services/auth.service");
const {
  SESSION_COOKIE_NAME,
  getSessionCookieClearOptions
} = require("../config/session");

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const establishSession = async (req, user) => {
  await regenerateSession(req);
  req.session.userId = user.id;
  await saveSession(req);
};

const destroySession = (req) =>
  new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }

    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const getClientOrigins = () => {
  if (!process.env.CLIENT_ORIGIN) {
    return [];
  }

  return process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
};

const shouldRespondJson = (req) => {
  if (process.env.OAUTH_RESPONSE_MODE === "json") {
    return true;
  }

  if (req.query.mode === "json") {
    return true;
  }

  const accepts = req.headers.accept || "";

  if (accepts.includes("application/json")) {
    return true;
  }

  return Boolean(req.xhr);
};

const getPrimaryClientOrigin = () => {
  const origins = getClientOrigins();

  if (origins.length > 0) {
    return origins[0];
  }

  return "http://localhost:5173";
};

const getOAuthSuccessRedirect = () =>
  process.env.OAUTH_SUCCESS_REDIRECT || `${getPrimaryClientOrigin()}/projects`;

const getOAuthFailureRedirect = () =>
  process.env.OAUTH_FAILURE_REDIRECT || `${getPrimaryClientOrigin()}/login?error=oauth`;

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    await establishSession(req, user);

    res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await loginUser(req.body);
    await establishSession(req, user);

    console.log("[Login] Session established:", {
      sessionId: req.session.id,
      userId: req.session.userId,
      user: user.id
    });

    res.status(200).json({
      message: "로그인에 성공했습니다.",
      user
    });
  } catch (error) {
    console.error("[Login] Error:", error.message);
    next(error);
  }
};

const oauthCallback = (provider) => (req, res, next) => {
  passport.authenticate(provider, { session: false }, async (err, profile) => {
    if (err || !profile) {
      const status = err?.status || 401;

      if (shouldRespondJson(req)) {
        res.status(status).json({
          message: "소셜 로그인에 실패했습니다."
        });
        return;
      }

      res.redirect(getOAuthFailureRedirect());
      return;
    }

    try {
      const user = await loginWithProvider(provider, profile);
      await establishSession(req, user);

      if (shouldRespondJson(req)) {
        res.status(200).json({
          message: "소셜 로그인에 성공했습니다.",
          user,
          provider
        });
        return;
      }

      res.redirect(getOAuthSuccessRedirect());
    } catch (serviceError) {
      const status = serviceError.status || 500;

      if (shouldRespondJson(req)) {
        res.status(status).json({
          message: "소셜 로그인에 실패했습니다."
        });
        return;
      }

      res.redirect(getOAuthFailureRedirect());
    }
  })(req, res, next);
};

const me = (req, res, next) => {
  try {
    const user = sanitizeUser(req.user);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await destroySession(req);
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieClearOptions());
    res.status(200).json({ message: "로그아웃이 완료되었습니다." });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { username, bio, profileImage } = req.body;

    const user = await updateUserProfile(userId, { username, bio, profileImage });

    res.status(200).json({
      message: "프로필이 업데이트되었습니다.",
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  oauthCallback,
  me,
  logout,
  updateProfile
};
