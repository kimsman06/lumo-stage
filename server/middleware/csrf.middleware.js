const { createToken, verifyToken, getTtlMs } = require("../utils/csrfToken");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

const buildCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: getTtlMs(),
    path: "/"
  };
};

const issueCsrfToken = (_req, res) => {
  const token = createToken();

  res.cookie(CSRF_COOKIE_NAME, token, buildCookieOptions());
  res.status(200).json({
    csrfToken: token,
    expiresIn: getTtlMs()
  });
};

const extractTokenFromRequest = (req) => {
  if (req.headers[CSRF_HEADER_NAME]) {
    return String(req.headers[CSRF_HEADER_NAME]);
  }

  if (req.body && typeof req.body === "object" && req.body.csrfToken) {
    return String(req.body.csrfToken);
  }

  return null;
};

const requireCsrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const hasSession =
    Boolean(req.cookies?.token) ||
    Boolean(req.cookies?.refreshToken) ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer "));

  try {
    if (!hasSession) {
      next();
      return;
    }

    const headerToken = extractTokenFromRequest(req);
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    if (!headerToken || !cookieToken) {
      const error = new Error("CSRF 토큰이 필요합니다.");
      error.status = 403;
      throw error;
    }

    if (headerToken !== cookieToken) {
      const error = new Error("CSRF 토큰이 일치하지 않습니다.");
      error.status = 403;
      throw error;
    }

    verifyToken(headerToken);
    next();
  } catch (error) {
    if (!error.status) {
      error.status = error.code === "expired" ? 419 : 403;
    }

    next(error);
  }
};

module.exports = {
  issueCsrfToken,
  requireCsrfProtection,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
};
