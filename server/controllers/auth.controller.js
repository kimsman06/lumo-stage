const passport = require("passport");

const { registerUser, loginUser, loginWithProvider, sanitizeUser } = require("../services/auth.service");

const parseExpiresToMs = (value) => {
  if (!value) {
    return 24 * 60 * 60 * 1000;
  }

  if (/^\d+$/.test(value)) {
    return Number(value) * 1000;
  }

  const matches = /^(\d+)([smhd])$/.exec(value);

  if (!matches) {
    return 24 * 60 * 60 * 1000;
  }

  const [, amount, unit] = matches;
  const quantity = Number(amount);

  switch (unit) {
    case "s":
      return quantity * 1000;
    case "m":
      return quantity * 60 * 1000;
    case "h":
      return quantity * 60 * 60 * 1000;
    case "d":
      return quantity * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
};

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: parseExpiresToMs(process.env.JWT_EXPIRES_IN)
  });
};

const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  });
};

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
    const { user, token } = await registerUser(req.body);

    setAuthCookie(res, token);

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
    const { user, token } = await loginUser(req.body);

    setAuthCookie(res, token);

    res.status(200).json({
      message: "로그인에 성공했습니다.",
      user
    });
  } catch (error) {
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
      const { user, token } = await loginWithProvider(provider, profile);

      setAuthCookie(res, token);

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

const logout = (req, res, next) => {
  try {
    clearAuthCookie(res);
    res.status(200).json({ message: "로그아웃이 완료되었습니다." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  oauthCallback,
  me,
  logout
};
