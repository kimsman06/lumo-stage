const crypto = require("crypto");

const TOKEN_VERSION = "v1";
const TOKEN_PARTS = 4;
const SEPARATOR = ".";

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const parseDurationToMs = (value, fallback = DEFAULT_TTL_MS) => {
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

const getSecret = () => {
  const secret = process.env.CSRF_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("CSRF_SECRET 또는 JWT_SECRET 환경 변수가 필요합니다.");
  }

  return secret;
};

const getTtlMs = () => parseDurationToMs(process.env.CSRF_TOKEN_TTL, DEFAULT_TTL_MS);

const createSignature = (payload) =>
  crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");

const createToken = () => {
  const issuedAt = Date.now();
  const nonce = crypto.randomBytes(32).toString("base64url");
  const payload = [TOKEN_VERSION, issuedAt, nonce].join(SEPARATOR);
  const signature = createSignature(payload);

  return [payload, signature].join(SEPARATOR);
};

const verifyToken = (token) => {
  if (typeof token !== "string") {
    const error = new Error("유효하지 않은 CSRF 토큰 형식입니다.");
    error.code = "invalid_token";
    throw error;
  }

  const parts = token.split(SEPARATOR);

  if (parts.length !== TOKEN_PARTS) {
    const error = new Error("유효하지 않은 CSRF 토큰입니다.");
    error.code = "invalid_token";
    throw error;
  }

  const [version, issuedAtRaw, nonce, signature] = parts;

  if (version !== TOKEN_VERSION) {
    const error = new Error("지원되지 않는 CSRF 토큰 버전입니다.");
    error.code = "invalid_token_version";
    throw error;
  }

  const expectedSignature = createSignature([version, issuedAtRaw, nonce].join(SEPARATOR));

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    const error = new Error("CSRF 토큰 서명이 올바르지 않습니다.");
    error.code = "invalid_signature";
    throw error;
  }

  const issuedAt = Number(issuedAtRaw);

  if (Number.isNaN(issuedAt)) {
    const error = new Error("CSRF 토큰 발급 시간이 손상되었습니다.");
    error.code = "invalid_timestamp";
    throw error;
  }

  if (issuedAt > Date.now() + 60 * 1000) {
    const error = new Error("CSRF 토큰 발급 시간이 올바르지 않습니다.");
    error.code = "invalid_timestamp";
    throw error;
  }

  const ttlMs = getTtlMs();

  if (issuedAt + ttlMs < Date.now()) {
    const error = new Error("CSRF 토큰이 만료되었습니다.");
    error.code = "expired";
    throw error;
  }

  return {
    issuedAt,
    expiresAt: issuedAt + ttlMs,
    nonce
  };
};

module.exports = {
  createToken,
  verifyToken,
  getTtlMs
};
