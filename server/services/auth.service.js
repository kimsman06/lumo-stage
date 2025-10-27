const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const sessionService = require("./session.service");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
  }

  return secret;
};

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "1d";

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject({ versionKey: false });

  user.id = user._id.toString();
  delete user._id;
  delete user.password;

  return user;
};

const signToken = (userDoc) => {
  const payload = {
    sub: userDoc.id || userDoc._id.toString()
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn()
  });
};

const issueTokensForUser = async (userDoc, metadata = {}) => {
  const accessToken = signToken(userDoc);
  const { token: refreshToken } = await sessionService.createSessionToken(
    userDoc._id,
    metadata
  );

  return {
    user: sanitizeUser(userDoc),
    accessToken,
    refreshToken
  };
};

const normalizeEmail = (value) => (value ? value.trim().toLowerCase() : null);

const providerFieldMap = {
  google: "googleId",
  naver: "naverId"
};

const resolveProviderField = (provider) => {
  const field = providerFieldMap[provider];

  if (!field) {
    const error = new Error(`지원되지 않는 OAuth 제공자입니다: ${provider}`);
    error.status = 400;
    throw error;
  }

  return field;
};

const resolveUsername = (profile, emailFallback) => {
  if (profile.displayName) {
    return profile.displayName.trim();
  }

  if (profile.raw?.nickname) {
    return profile.raw.nickname.trim();
  }

  if (emailFallback) {
    return emailFallback.split("@")[0];
  }

  return `user-${Date.now()}`;
};

const registerUser = async ({ username, email, password }, metadata = {}) => {
  if (!username || !email || !password) {
    const error = new Error("필수 값이 누락되었습니다.");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("이미 사용 중인 이메일입니다.");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    password: hashedPassword
  });

  return issueTokensForUser(user, metadata);
};

const loginUser = async ({ email, password }, metadata = {}) => {
  if (!email || !password) {
    const error = new Error("이메일과 비밀번호를 모두 입력해주세요.");
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user || !user.password) {
    const error = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    error.status = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    error.status = 401;
    throw error;
  }

  return issueTokensForUser(user, metadata);
};

const findOrCreateOAuthUser = async (provider, profile) => {
  const providerField = resolveProviderField(provider);
  const providerId = profile.id;

  if (!providerId) {
    const error = new Error("소셜 프로필에 ID 정보가 없습니다.");
    error.status = 400;
    throw error;
  }

  const emailFromProfile = normalizeEmail(
    profile.emails?.[0]?.value || profile.email || profile.raw?.email
  );

  if (emailFromProfile) {
    const existingByEmail = await User.findOne({ email: emailFromProfile });

    if (existingByEmail) {
      if (!existingByEmail[providerField]) {
        existingByEmail[providerField] = providerId;
        await existingByEmail.save();
      }

      return existingByEmail;
    }
  }

  const existingByProvider = await User.findOne({ [providerField]: providerId });
  if (existingByProvider) {
    return existingByProvider;
  }

  const finalEmail = (emailFromProfile || `${provider}-${providerId}@oauth.lumostage`).toLowerCase();
  const username = resolveUsername(profile, finalEmail);

  const user = await User.create({
    username,
    email: finalEmail,
    [providerField]: providerId
  });

  return user;
};

const loginWithProvider = async (provider, profile, metadata = {}) => {
  const user = await findOrCreateOAuthUser(provider, profile);

  return issueTokensForUser(user, metadata);
};

const refreshAuthSession = async (refreshToken, metadata = {}) => {
  const { user, refreshToken: rotatedRefreshToken } = await sessionService.consumeRefreshToken(
    refreshToken,
    metadata
  );

  const accessToken = signToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: rotatedRefreshToken
  };
};

const revokeRefreshToken = (refreshToken, metadata = {}) =>
  sessionService.revokeRefreshToken(refreshToken, metadata);

const revokeSessionsForUser = (userId, reason, metadata = {}) =>
  sessionService.revokeUserSessions(userId, reason, metadata);

module.exports = {
  registerUser,
  loginUser,
  loginWithProvider,
  sanitizeUser,
  refreshAuthSession,
  revokeRefreshToken,
  revokeSessionsForUser,
  getRefreshTokenTtlMs: sessionService.getRefreshTokenTtlMs
};
