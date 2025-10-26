const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const NaverStrategy = require("passport-naver-v2").Strategy;

const mapProfile = (provider, profile) => ({
  provider,
  id: profile.id,
  displayName: profile.displayName,
  emails: profile.emails,
  raw: profile._json || profile._profile || {}
});

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
            process.env.NAVER_CALLBACK_URL || "http://localhost:4000/api/auth/naver/callback"
        },
        (_accessToken, _refreshToken, profile, done) => {
          done(null, mapProfile("naver", profile));
        }
      )
    );
  }
};

module.exports = configurePassport;
