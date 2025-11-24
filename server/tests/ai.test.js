const request = require("supertest");

const { app, connectDatabase } = require("../server");
const Previsualization = require("../models/Previsualization");
const { createAuthenticatedAgent, getCsrfToken } = require("./utils/auth");
const { createProject } = require("./utils/projects");

describe("AI API", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  it("API 키를 저장/삭제하고 상태와 사용량을 조회할 수 있다", async () => {
    const { agent } = await createAuthenticatedAgent({
      email: "ai-key@example.com"
    });

    const csrfToken = await getCsrfToken(agent);

    const saveResponse = await agent
      .post("/api/ai/api-key")
      .set("x-csrf-token", csrfToken)
      .send({ apiKey: "sk-nanbanana-abc123" });

    expect(saveResponse.statusCode).toBe(200);

    const statusResponse = await agent.get("/api/ai/api-key/status");
    expect(statusResponse.statusCode).toBe(200);
    expect(statusResponse.body).toMatchObject({
      hasApiKey: true,
      usageStats: expect.objectContaining({
        totalGenerations: 0,
        monthlyGenerations: 0
      })
    });

    const usageResponse = await agent.get("/api/ai/usage");
    expect(usageResponse.statusCode).toBe(200);
    expect(usageResponse.body).toMatchObject({
      total: 0,
      thisMonth: 0,
      limit: expect.any(Number)
    });

    const deleteResponse = await agent
      .delete("/api/ai/api-key")
      .set("x-csrf-token", await getCsrfToken(agent));

    expect(deleteResponse.statusCode).toBe(200);

    const statusAfterDelete = await agent.get("/api/ai/api-key/status");
    expect(statusAfterDelete.statusCode).toBe(200);
    expect(statusAfterDelete.body.hasApiKey).toBe(false);
  });

  it("프리비주얼 생성/조회/삭제 전체 플로우를 처리한다", async () => {
    const { agent } = await createAuthenticatedAgent({
      email: "ai-flow@example.com"
    });

    const csrfToken = await getCsrfToken(agent);

    await agent
      .post("/api/ai/api-key")
      .set("x-csrf-token", csrfToken)
      .send({ apiKey: "sk-nanbanana-xyz789" });

    const { project } = await createProject(agent, { name: "AI 프로젝트" });

    const createResponse = await agent
      .post("/api/ai/previsualize")
      .set("x-csrf-token", await getCsrfToken(agent))
      .field("projectId", project.id)
      .field("prompt", "cinematic portrait with studio light")
      .field("negativePrompt", "low quality")
      .attach("sceneRender", Buffer.from("fake-png-data"), {
        filename: "scene.png",
        contentType: "image/png"
      });

    expect(createResponse.statusCode).toBe(202);
    const createdId = createResponse.body.id;
    expect(createdId).toBeDefined();
    expect(createResponse.body.preview).toMatchObject({
      id: createdId,
      status: "pending",
      prompt: "cinematic portrait with studio light"
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const detailResponse = await agent.get(`/api/ai/previsualize/${createdId}`);
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toMatchObject({
      id: createdId,
      projectId: project.id,
      status: "completed",
      resultImage: expect.any(String),
      progress: 100
    });

    const listResponse = await agent.get("/api/ai/previsualizations");
    expect(listResponse.statusCode).toBe(200);
    expect(Array.isArray(listResponse.body.items)).toBe(true);
    expect(listResponse.body.items.length).toBeGreaterThan(0);

    const iterateResponse = await agent
      .post(`/api/ai/previsualize/${createdId}/iterate`)
      .set("x-csrf-token", await getCsrfToken(agent))
      .send({
        prompt: "same scene with warmer tone",
        generationParams: { strength: 0.8 }
      });

    expect(iterateResponse.statusCode).toBe(202);
    expect(iterateResponse.body.preview.parentId).toBe(createdId);

    const iterateId = iterateResponse.body.id;
    await new Promise((resolve) => setTimeout(resolve, 10));

    const deleteResponse = await agent
      .delete(`/api/ai/previsualize/${iterateId}`)
      .set("x-csrf-token", await getCsrfToken(agent));

    expect(deleteResponse.statusCode).toBe(204);

    const remaining = await Previsualization.countDocuments();
    expect(remaining).toBeGreaterThan(0);
  });

  it("인증이 없으면 AI API에 접근할 수 없다", async () => {
    const response = await request(app).post("/api/ai/api-key");
    expect(response.statusCode).toBe(401);
  });
});
