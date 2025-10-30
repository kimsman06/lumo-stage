const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const NaverStrategy = require("passport-naver-v2").Strategy;

const mapProfile = (provider, profile) => {
  const rawOriginal = profile._json || profile._profile || {};
  const raw =
    provider === "naver" && rawOriginal?.response ? rawOriginal.response : rawOriginal;

  // 네이버의 경우 raw.email을 우선적으로 사용
  let emailFromProfile = null;
  if (provider === "naver") {
    emailFromProfile = raw?.email || profile.email || profile.emails?.[0]?.value || null;
  } else {
    emailFromProfile = profile.emails?.[0]?.value || profile.email || raw?.email || null;
  }

  let displayName = profile.displayName;

  if (!displayName) {
    if (provider === "naver") {
      displayName =
        raw?.name ||
        raw?.nickname ||
        (emailFromProfile ? emailFromProfile.split("@")[0] : profile.username);
    } else {
      displayName = raw?.name || raw?.nickname || profile.username;
    }
  }

  const emails =
    profile.emails && profile.emails.length > 0
      ? profile.emails
      : emailFromProfile
      ? [{ value: emailFromProfile }]
      : [];

  return {
    provider,
    id: profile.id,
    displayName,
    emails,
    email: emailFromProfile,
    raw
  };
};

const configurePassport = (passportInstance) => {
  if (!passportInstance) {
    return;
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passportInstance.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback"
        },
        (_accessToken, _refreshToken, profile, done) => {
          done(null, mapProfile("google", profile));
        }
      )
    );
  }

  if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
    passportInstance.use(
      new NaverStrategy(
        {
          clientID: process.env.NAVER_CLIENT_ID,
          clientSecret: process.env.NAVER_CLIENT_SECRET,
          callbackURL:
            process.env.NAVER_CALLBACK_URL || "http://localhost:4000/api/auth/naver/callback",
          profileURL: "https://openapi.naver.com/v1/nid/me"
        },
        (_accessToken, _refreshToken, profile, done) => {
          done(null, mapProfile("naver", profile));
        }
      )
    );
  }
};

module.exports = configurePassport;
