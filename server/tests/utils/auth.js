const crypto = require("node:crypto");
const request = require("supertest");

const { app, connectDatabase } = require("../../server");
const { SESSION_COOKIE_NAME } = require("../../config/session");

const DEFAULT_USER = {
  username: "테스트유저",
  password: "password123"
};

const ensureDatabase = async () => {
  await connectDatabase();
};

const createAgent = async () => {
  await ensureDatabase();
  return request.agent(app);
};

const getCsrfToken = async (agent) => {
  const response = await agent.get("/api/auth/csrf-token");

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("csrfToken");

  return response.body.csrfToken;
};

const expectSessionCookie = (response) => {
  const cookies = response.headers["set-cookie"] || [];
  const hasSessionCookie = cookies.some((cookie) =>
    cookie.startsWith(`${SESSION_COOKIE_NAME}=`)
  );

  expect(hasSessionCookie).toBe(true);
};

const buildUserPayload = (overrides = {}) => ({
  username: overrides.username || DEFAULT_USER.username,
  email:
    overrides.email ||
    `user-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}@example.com`,
  password: overrides.password || DEFAULT_USER.password
});

const registerUser = async (overrides = {}, options = {}) => {
  const agent = options.agent || (await createAgent());
  const csrfToken = await getCsrfToken(agent);
  const payload = buildUserPayload(overrides);

  const response = await agent
    .post("/api/auth/register")
    .set("x-csrf-token", csrfToken)
    .send(payload);

  expect(response.statusCode).toBe(201);
  expect(response.body).toMatchObject({
    message: expect.any(String),
    user: expect.objectContaining({
      email: payload.email
    })
  });
  expectSessionCookie(response);

  return {
    agent,
    csrfToken,
    payload,
    response,
    user: response.body.user
  };
};

const loginUser = async (agent, credentials) => {
  const csrfToken = await getCsrfToken(agent);

  return agent
    .post("/api/auth/login")
    .set("x-csrf-token", csrfToken)
    .send(credentials);
};

const createAuthenticatedAgent = async (overrides = {}) => registerUser(overrides);

module.exports = {
  createAgent,
  createAuthenticatedAgent,
  ensureDatabase,
  expectSessionCookie,
  getCsrfToken,
  loginUser,
  registerUser
};
