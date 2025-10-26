const request = require("supertest");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const { app, connectDatabase } = require("../server");
const User = require("../models/User");

describe("Auth API", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  describe("POST /api/auth/register", () => {
    it("새로운 사용자를 생성하고 토큰 쿠키를 설정한다", async () => {
      const payload = {
        username: "테스터",
        email: "tester@example.com",
        password: "password123"
      };

      const response = await request(app).post("/api/auth/register").send(payload);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        message: "회원가입이 완료되었습니다.",
        user: {
          username: payload.username,
          email: payload.email
        }
      });
      expect(response.body.user).toHaveProperty("id");
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("token=")])
      );

      const savedUser = await User.findOne({ email: payload.email }).lean();
      expect(savedUser).toBeTruthy();
      expect(savedUser.password).not.toBe(payload.password);
    });

    it("이미 존재하는 이메일로는 회원가입할 수 없다", async () => {
      const email = "duplicate@example.com";
      await User.create({
        username: "Existing",
        email,
        password: "hashed"
      });

      const response = await request(app).post("/api/auth/register").send({
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

      const response = await request(app).get("/api/auth/google/callback");

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "소셜 로그인에 성공했습니다.",
        user: {
          email: "googletester@example.com"
        },
        provider: "google"
      });
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("token=")])
      );

      const savedUser = await User.findOne({ googleId: "google-123" }).lean();
      expect(savedUser).toBeTruthy();
      expect(savedUser.email).toBe("googletester@example.com");
    });

    it("Passport에서 오류가 발생하면 401 응답을 반환한다", async () => {
      jest.spyOn(passport, "authenticate").mockImplementation((_strategy, _options, callback) => {
        return (_req, _res, _next) => {
          callback(new Error("OAuth Error"));
        };
      });

      const response = await request(app).get("/api/auth/google/callback");

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

    it("올바른 자격 증명으로 로그인하면 토큰 쿠키를 반환한다", async () => {
      const response = await request(app).post("/api/auth/login").send({
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
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([expect.stringContaining("token=")])
      );
    });

    it("잘못된 비밀번호로 로그인하면 401을 반환한다", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email,
        password: "wrong-password"
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "이메일 또는 비밀번호가 올바르지 않습니다."
      });
    });

    it("존재하지 않는 이메일로 로그인하면 401을 반환한다", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "missing@example.com",
        password
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "이메일 또는 비밀번호가 올바르지 않습니다."
      });
    });
  });
});
