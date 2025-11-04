const DEFAULT_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day
const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/lumostage";
const DEFAULT_SESSION_COOKIE_NAME = "lumostage.sid";
const DEFAULT_SESSION_COLLECTION_NAME = "sessions";

const parseDurationToMs = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const matches = /^(\d+)([smhd])$/.exec(value);

  if (!matches) {
    return fallback;
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
      return fallback;
  }
};

const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET 환경 변수가 설정되지 않았습니다.");
  }

  return secret;
};

const getMongoUri = () => process.env.MONGO_URI || DEFAULT_MONGO_URI;

const isProduction = () => process.env.NODE_ENV === "production";

const getBaseCookieOptions = () => {
  const isProd = isProduction();

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    // domain을 설정하지 않음 (자동으로 현재 도메인 사용)
  };
};

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE_NAME;
const SESSION_COLLECTION_NAME =
  process.env.SESSION_COLLECTION_NAME || DEFAULT_SESSION_COLLECTION_NAME;
const SESSION_MAX_AGE_MS = parseDurationToMs(
  process.env.SESSION_COOKIE_MAX_AGE,
  DEFAULT_SESSION_MAX_AGE_MS
);

const getSessionCookieOptions = () => {
  const options = {
    ...getBaseCookieOptions(),
    maxAge: SESSION_MAX_AGE_MS
  };

  return options;
};

const getSessionCookieClearOptions = () => getBaseCookieOptions();

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_COLLECTION_NAME,
  SESSION_MAX_AGE_MS,
  parseDurationToMs,
  getSessionSecret,
  getMongoUri,
  getSessionCookieOptions,
  getSessionCookieClearOptions
};
