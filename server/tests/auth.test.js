const request = require("supertest");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const { app, connectDatabase } = require("../server");
const User = require("../models/User");

const getCsrfToken = async (agent) => {
  const response = await agent.get("/api/auth/csrf-token");
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("csrfToken");
  return response.body.csrfToken;
};

const expectSessionCookies = (response) => {
  const cookies = response.headers["set-cookie"] || [];

  expect(cookies).toEqual(
    expect.arrayContaining([
      expect.stringContaining("token="),
      expect.stringContaining("refreshToken=")
    ])
  );
};

const registerThroughAgent = async (agent, overrides = {}) => {
  const csrfToken = await getCsrfToken(agent);
  const payload = {
    username: overrides.username || "테스트유저",
    email: overrides.email || "auth-user@example.com",
    password: overrides.password || "password123"
  };

  const response = await agent.post("/api/auth/register").set("x-csrf-token", csrfToken).send(payload);

  return { response, csrfToken, payload };
};

const loginThroughAgent = async (agent, credentials) => {
  const csrfToken = await getCsrfToken(agent);

  return agent.post("/api/auth/login").set("x-csrf-token", csrfToken).send(credentials);
};

describe("Auth API", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  describe("GET /api/auth/csrf-token", () => {
    it("CSRF 토큰과 쿠키를 발급한다", async () => {
      const agent = request.agent(app);
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
      const agent = request.agent(app);
      const { response, payload } = await registerThroughAgent(agent, {
        email: "tester@example.com"
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        message: "회원가입이 완료되었습니다.",
        user: {
          username: payload.username,
          email: payload.email
        }
      });
      expect(response.body.user).toHaveProperty("id");
      expectSessionCookies(response);

      const savedUser = await User.findOne({ email: payload.email }).lean();
      expect(savedUser).toBeTruthy();
      expect(savedUser.password).not.toBe(payload.password);
    });

    it("이미 존재하는 이메일로는 회원가입할 수 없다", async () => {
      const agent = request.agent(app);
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
      const agent = request.agent(app);
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
      expectSessionCookies(response);

      const savedUser = await User.findOne({ googleId: "google-123" }).lean();
      expect(savedUser).toBeTruthy();
      expect(savedUser.email).toBe("googletester@example.com");
    });

    it("Passport에서 오류가 발생하면 401 응답을 반환한다", async () => {
      const agent = request.agent(app);

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
      const agent = request.agent(app);

      const response = await loginThroughAgent(agent, {
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
      expectSessionCookies(response);
    });

    it("잘못된 비밀번호로 로그인하면 401을 반환한다", async () => {
      const agent = request.agent(app);

      const response = await loginThroughAgent(agent, {
        email,
        password: "wrong-password"
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "이메일 또는 비밀번호가 올바르지 않습니다."
      });
    });

    it("존재하지 않는 이메일로 로그인하면 401을 반환한다", async () => {
      const agent = request.agent(app);

      const response = await loginThroughAgent(agent, {
        email: "missing@example.com",
        password
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "이메일 또는 비밀번호가 올바르지 않습니다."
      });
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("유효한 Refresh 토큰으로 세션을 갱신한다", async () => {
      const agent = request.agent(app);
      const { response: registerResponse } = await registerThroughAgent(agent, {
        email: "refresh-user@example.com"
      });
      expect(registerResponse.statusCode).toBe(201);

      const csrfToken = await getCsrfToken(agent);
      const refreshResponse = await agent.post("/api/auth/refresh").set("x-csrf-token", csrfToken).send();

      expect(refreshResponse.statusCode).toBe(200);
      expect(refreshResponse.body).toMatchObject({
        message: "토큰이 갱신되었습니다.",
        user: {
          email: "refresh-user@example.com"
        }
      });
      expectSessionCookies(refreshResponse);
    });

    it("Refresh 토큰이 없으면 401을 반환한다", async () => {
      const agent = request.agent(app);
      const csrfToken = await getCsrfToken(agent);

      const response = await agent.post("/api/auth/refresh").set("x-csrf-token", csrfToken).send();

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "Refresh 토큰이 필요합니다."
      });
    });
  });

  describe("POST /api/auth/logout", () => {
    it("Refresh 토큰을 폐기하고 쿠키를 지운다", async () => {
      const agent = request.agent(app);
      const { response: registerResponse } = await registerThroughAgent(agent, {
        email: "logout-user@example.com"
      });
      expect(registerResponse.statusCode).toBe(201);

      const csrfToken = await getCsrfToken(agent);
      const response = await agent.post("/api/auth/logout").set("x-csrf-token", csrfToken).send();

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "로그아웃이 완료되었습니다."
      });
      const clearedCookies = response.headers["set-cookie"] || [];
      expect(clearedCookies.some((cookie) => cookie.includes("token=;"))).toBe(true);
      expect(clearedCookies.some((cookie) => cookie.includes("refreshToken=;"))).toBe(true);
    });
  });
});
