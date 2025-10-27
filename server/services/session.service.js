const crypto = require("crypto");

const SessionToken = require("../models/SessionToken");
const User = require("../models/User");

const REFRESH_TOKEN_TTL_DEFAULT = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_ACTIVE_SESSIONS = Number(process.env.MAX_ACTIVE_SESSIONS || 10);

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

const getRefreshTokenTtlMs = () =>
  parseDurationToMs(process.env.REFRESH_TOKEN_TTL, REFRESH_TOKEN_TTL_DEFAULT);

const generateRefreshToken = () => crypto.randomBytes(48).toString("base64url");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const trimActiveSessions = async (userId) => {
  const sessions = await SessionToken.find({ user: userId, isRevoked: false })
    .sort({ createdAt: -1 })
    .skip(MAX_ACTIVE_SESSIONS - 1);

  if (sessions.length === 0) {
    return;
  }

  await SessionToken.updateMany(
    { _id: { $in: sessions.map((session) => session._id) } },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "max_sessions_exceeded"
      }
    }
  );
};

const createSessionToken = async (userId, metadata = {}) => {
  const token = generateRefreshToken();
  const tokenHash = hashToken(token);

  const session = await SessionToken.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + getRefreshTokenTtlMs()),
    createdByIp: metadata.ip,
    userAgent: metadata.userAgent
  });

  await trimActiveSessions(userId);

  return { token, session };
};

const revokeSession = async (session, reason, metadata = {}) => {
  if (session.isRevoked) {
    return;
  }

  session.isRevoked = true;
  session.revokedAt = new Date();
  session.revokedReason = reason;
  if (metadata.replacedBy) {
    session.replacedBy = metadata.replacedBy;
  }
  if (Object.keys(metadata).length > 0) {
    session.revokedMetadata = metadata;
  }

  await session.save();
};

const revokeUserSessions = async (userId, reason, metadata = {}) => {
  await SessionToken.updateMany(
    { user: userId, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
        revokedMetadata: metadata
      }
    }
  );
};

const validateSession = (session) => {
  if (!session) {
    const error = new Error("Refresh 토큰이 유효하지 않습니다.");
    error.status = 401;
    throw error;
  }

  if (session.isRevoked) {
    const error = new Error("Refresh 토큰이 이미 사용되었습니다.");
    error.status = 401;
    error.code = "revoked";
    throw error;
  }

  if (session.expiresAt < new Date()) {
    const error = new Error("Refresh 토큰이 만료되었습니다.");
    error.status = 401;
    error.code = "expired";
    throw error;
  }
};

const consumeRefreshToken = async (token, metadata = {}) => {
  const tokenHash = hashToken(token);
  const session = await SessionToken.findOne({ tokenHash });

  if (session && session.isRevoked) {
    await revokeUserSessions(session.user, "refresh_token_reuse_detected", metadata);
    const error = new Error("Refresh 토큰이 이미 사용되었습니다.");
    error.status = 401;
    error.code = "revoked";
    throw error;
  }

  validateSession(session);

  await session.populate("user");

  const user = session.user;

  if (!user) {
    await revokeSession(session, "orphaned_session", metadata);
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 401;
    throw error;
  }

  const { token: newToken, session: newSession } = await createSessionToken(user._id, metadata);
  await revokeSession(session, "rotated", { ...metadata, replacedBy: newSession._id });

  return {
    user,
    refreshToken: newToken
  };
};

const revokeRefreshToken = async (token, metadata = {}) => {
  const tokenHash = hashToken(token);
  const session = await SessionToken.findOne({ tokenHash });

  if (!session) {
    return;
  }

  await revokeSession(session, "logout", metadata);
};

const getUserForRefreshToken = async (token) => {
  const tokenHash = hashToken(token);
  const session = await SessionToken.findOne({ tokenHash });

  if (!session) {
    return null;
  }

  await session.populate("user");

  return session.user;
};

const getUserById = async (userId) => User.findById(userId);

module.exports = {
  createSessionToken,
  consumeRefreshToken,
  revokeRefreshToken,
  revokeUserSessions,
  getRefreshTokenTtlMs,
  getUserForRefreshToken,
  getUserById
};
