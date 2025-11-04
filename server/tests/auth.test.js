const bcrypt = require("bcryptjs");
const passport = require("passport");
const request = require("supertest");

const { app, connectDatabase } = require("../server");
const User = require("../models/User");
const { SESSION_COOKIE_NAME } = require("../config/session");
const {
  createAgent,
  createAuthenticatedAgent,
  expectSessionCookie,
  getCsrfToken,
  loginUser,
  registerUser
} = require("./utils/auth");

describe("Auth API", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  describe("GET /api/auth/csrf-token", () => {
    it("CSRF 토큰과 쿠키를 발급한다", async () => {
      const agent = await createAgent();
      const response = await agent.get("/api/auth/csrf-token");

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("csrfToken");
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("csrf_token=")])
      );
    });
  });

  describe("POST /api/auth/register", () => {
    it("새로운 사용자를 생성하고 세션 쿠키를 설정한다", async () => {
      const agent = await createAgent();
      const { response, payload } = await registerUser(
        { email: "tester@example.com" },
        { agent }
      );

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        message: "회원가입이 완료되었습니다.",
        user: {
          username: payload.username,
          email: payload.email
        }
      });
      expect(response.body.user).toHaveProperty("id");
      expectSessionCookie(response);

      const savedUser = await User.findOne({ email: payload.email }).lean();
      expect(savedUser).toBeTruthy();
      expect(savedUser.password).not.toBe(payload.password);
    });

    it("이미 존재하는 이메일로는 회원가입할 수 없다", async () => {
      const agent = await createAgent();
      const email = "duplicate@example.com";

      await User.create({
        username: "Existing",
        email,
        password: "hashed"
      });

      const csrfToken = await getCsrfToken(agent);
      const response = await agent
        .post("/api/auth/register")
        .set("x-csrf-token", csrfToken)
        .send({
          username: "Someone",
          email,
          password: "password123"
        });

      expect(response.statusCode).toBe(409);
      expect(response.body).toMatchObject({
        message: "이미 사용 중인 이메일입니다."
      });
    });
  });

  describe("GET /api/auth/google/callback", () => {
    const originalResponseMode = process.env.OAUTH_RESPONSE_MODE;

    beforeEach(() => {
      process.env.OAUTH_RESPONSE_MODE = "json";
    });

    afterEach(() => {
      jest.restoreAllMocks();

      if (originalResponseMode === undefined) {
        delete process.env.OAUTH_RESPONSE_MODE;
      } else {
        process.env.OAUTH_RESPONSE_MODE = originalResponseMode;
      }
    });

    it("Google 프로필로 로그인하면 사용자 생성 후 쿠키를 설정한다", async () => {
      const agent = await createAgent();
      const mockProfile = {
        id: "google-123",
        displayName: "Google Tester",
        emails: [{ value: "googletester@example.com" }]
      };

      jest.spyOn(passport, "authenticate").mockImplementation((strategy, options, callback) => {
        expect(strategy).toBe("google");
        expect(options).toMatchObject({ session: false });

        return (req, res, next) => {
          callback(null, mockProfile);
        };
      });

      const response = await agent.get("/api/auth/google/callback");

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "소셜 로그인에 성공했습니다.",
        user: {
          email: "googletester@example.com"
        },
        provider: "google"
      });

      const savedUser = await User.findOne({ googleId: "google-123" }).lean();
      expect(savedUser).toBeTruthy();
      expect(savedUser.email).toBe("googletester@example.com");
    });

    it("Passport에서 오류가 발생하면 401 응답을 반환한다", async () => {
      const agent = await createAgent();

      jest.spyOn(passport, "authenticate").mockImplementation((_strategy, _options, callback) => {
        return (_req, _res, _next) => {
          callback(new Error("OAuth Error"));
        };
      });

      const response = await agent.get("/api/auth/google/callback");

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "소셜 로그인에 실패했습니다."
      });
    });
  });

  describe("POST /api/auth/login", () => {
    const email = "login@example.com";
    const password = "securePass!1";

    beforeEach(async () => {
      const hash = await bcrypt.hash(password, 10);
      await User.create({
        username: "로그인유저",
        email,
        password: hash
      });
    });

    it("올바른 자격 증명으로 로그인하면 세션 쿠키를 반환한다", async () => {
      const agent = await createAgent();

      const response = await loginUser(agent, {
        email,
        password
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "로그인에 성공했습니다.",
        user: {
          email
        }
      });
      expectSessionCookie(response);
    });

    it("잘못된 비밀번호로 로그인하면 401을 반환한다", async () => {
      const agent = await createAgent();

      const response = await loginUser(agent, {
        email,
        password: "wrong-password"
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "이메일 또는 비밀번호가 올바르지 않습니다."
      });
    });

    it("존재하지 않는 이메일로 로그인하면 401을 반환한다", async () => {
      const agent = await createAgent();

      const response = await loginUser(agent, {
        email: "missing@example.com",
        password
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "이메일 또는 비밀번호가 올바르지 않습니다."
      });
    });
  });

  describe("GET /api/auth/me", () => {
    it("세션이 있으면 사용자 정보를 반환한다", async () => {
      const { agent, user } = await createAuthenticatedAgent({
        email: "me-user@example.com"
      });

      const response = await agent.get("/api/auth/me");

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        user: {
          email: user.email
        }
      });
    });

    it("세션이 없으면 401을 반환한다", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "인증이 필요합니다."
      });
    });
  });

  describe("POST /api/auth/logout", () => {
    it("Refresh 토큰을 폐기하고 쿠키를 지운다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "logout-user@example.com"
      });

      const csrfToken = await getCsrfToken(agent);
      const response = await agent.post("/api/auth/logout").set("x-csrf-token", csrfToken).send();

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "로그아웃이 완료되었습니다."
      });
      const clearedCookies = response.headers["set-cookie"] || [];
      expect(
        clearedCookies.some(
          (cookie) =>
            cookie.startsWith(`${SESSION_COOKIE_NAME}=`) &&
            (cookie.includes("Max-Age=0") || /Expires=Thu, 01 Jan 1970/.test(cookie))
        )
      ).toBe(true);
    });
  });

  describe("PATCH /api/auth/profile", () => {
    it("프로필을 업데이트할 수 있다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "profile-update@example.com"
      });

      const csrfToken = await getCsrfToken(agent);
      const updateData = {
        username: "업데이트된이름",
        bio: "안녕하세요! 저는 개발자입니다.",
        profileImage: "https://example.com/profile.jpg"
      };

      const response = await agent
        .patch("/api/auth/profile")
        .set("x-csrf-token", csrfToken)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "프로필이 업데이트되었습니다.",
        user: {
          username: updateData.username,
          bio: updateData.bio,
          profileImage: updateData.profileImage
        }
      });

      const savedUser = await User.findOne({ email: "profile-update@example.com" }).lean();
      expect(savedUser.username).toBe(updateData.username);
      expect(savedUser.bio).toBe(updateData.bio);
      expect(savedUser.profileImage).toBe(updateData.profileImage);
    });

    it("일부 필드만 업데이트할 수 있다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "partial-update@example.com",
        username: "원래이름"
      });

      const csrfToken = await getCsrfToken(agent);
      const updateData = {
        bio: "새로운 자기소개"
      };

      const response = await agent
        .patch("/api/auth/profile")
        .set("x-csrf-token", csrfToken)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.user.username).toBe("원래이름");
      expect(response.body.user.bio).toBe(updateData.bio);
    });

    it("bio를 null로 설정하여 삭제할 수 있다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "bio-delete@example.com"
      });

      const csrfToken = await getCsrfToken(agent);
      await agent
        .patch("/api/auth/profile")
        .set("x-csrf-token", csrfToken)
        .send({ bio: "임시 자기소개" });

      const deleteResponse = await agent
        .patch("/api/auth/profile")
        .set("x-csrf-token", csrfToken)
        .send({ bio: null });

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.user.bio).toBeNull();
    });

    it("bio가 500자를 초과하면 400을 반환한다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "bio-long@example.com"
      });

      const csrfToken = await getCsrfToken(agent);
      const longBio = "a".repeat(501);

      const response = await agent
        .patch("/api/auth/profile")
        .set("x-csrf-token", csrfToken)
        .send({ bio: longBio });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "자기소개는 500자를 초과할 수 없습니다."
      });
    });

    it("인증되지 않은 사용자는 프로필을 업데이트할 수 없다", async () => {
      const agent = await createAgent();
      const csrfToken = await getCsrfToken(agent);

      const response = await agent
        .patch("/api/auth/profile")
        .set("x-csrf-token", csrfToken)
        .send({ username: "해커" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "인증이 필요합니다."
      });
    });
  });
});
