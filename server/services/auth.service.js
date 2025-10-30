const bcrypt = require("bcryptjs");

const User = require("../models/User");

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject({ versionKey: false });

  user.id = user._id.toString();
  delete user._id;
  delete user.password;

  return user;
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

  if (profile.raw?.name) {
    return profile.raw.name.trim();
  }

  if (profile.raw?.nickname) {
    return profile.raw.nickname.trim();
  }

  if (emailFallback) {
    return emailFallback.split("@")[0];
  }

  return `user-${Date.now()}`;
};

const extractProfileImage = (provider, profile) => {
  const raw = profile.raw || {};

  if (provider === "naver") {
    return raw.profile_image || null;
  }

  if (provider === "google") {
    return raw.picture || profile.photos?.[0]?.value || null;
  }

  return null;
};

const registerUser = async ({ username, email, password }) => {
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

  return sanitizeUser(user);
};

const loginUser = async ({ email, password }) => {
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

  return sanitizeUser(user);
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

  const profileImage = extractProfileImage(provider, profile);

  if (emailFromProfile) {
    const existingByEmail = await User.findOne({ email: emailFromProfile });

    if (existingByEmail) {
      if (!existingByEmail[providerField]) {
        existingByEmail[providerField] = providerId;

        // 프로필 정보 업데이트
        if (profileImage && !existingByEmail.profileImage) {
          existingByEmail.profileImage = profileImage;
        }
        if (!existingByEmail.oauthProvider || existingByEmail.oauthProvider === "local") {
          existingByEmail.oauthProvider = provider;
        }

        await existingByEmail.save();
      }

      return existingByEmail;
    }
  }

  const existingByProvider = await User.findOne({ [providerField]: providerId });
  if (existingByProvider) {
    // 기존 사용자의 프로필 이미지 업데이트 (없는 경우에만)
    let updated = false;

    if (profileImage && !existingByProvider.profileImage) {
      existingByProvider.profileImage = profileImage;
      updated = true;
    }

    if (updated) {
      await existingByProvider.save();
    }

    return existingByProvider;
  }

  const finalEmail = (emailFromProfile || `${provider}-${providerId}@oauth.lumostage`).toLowerCase();
  const username = resolveUsername(profile, finalEmail);

  const user = await User.create({
    username,
    email: finalEmail,
    [providerField]: providerId,
    profileImage,
    oauthProvider: provider
  });

  return user;
};

const loginWithProvider = async (provider, profile) => {
  const user = await findOrCreateOAuthUser(provider, profile);

  return sanitizeUser(user);
};

const updateUserProfile = async (userId, { username, bio, profileImage }) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  // username 업데이트 (제공된 경우)
  if (username !== undefined && username !== null) {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0) {
      const error = new Error("사용자 이름은 비어있을 수 없습니다.");
      error.status = 400;
      throw error;
    }
    user.username = trimmedUsername;
  }

  // bio 업데이트 (제공된 경우)
  if (bio !== undefined) {
    if (bio === null || bio === "") {
      user.bio = null;
    } else {
      const trimmedBio = bio.trim();
      if (trimmedBio.length > 500) {
        const error = new Error("자기소개는 500자를 초과할 수 없습니다.");
        error.status = 400;
        throw error;
      }
      user.bio = trimmedBio;
    }
  }

  // profileImage 업데이트 (제공된 경우)
  if (profileImage !== undefined) {
    if (profileImage === null || profileImage === "") {
      user.profileImage = null;
    } else {
      user.profileImage = profileImage.trim();
    }
  }

  await user.save();

  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  loginWithProvider,
  sanitizeUser,
  updateUserProfile
};
