const request = require("supertest");

const { app, connectDatabase } = require("../server");
const Project = require("../models/Project");
const ShareToken = require("../models/ShareToken");

const getCsrfToken = async (agent) => {
  const response = await agent.get("/api/auth/csrf-token");
  expect(response.statusCode).toBe(200);
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

const registerUser = async (overrides = {}) => {
  const agent = request.agent(app);
  const csrfToken = await getCsrfToken(agent);
  const payload = {
    username: "프로젝트유저",
    email: overrides.email || "project-user@example.com",
    password: "password123"
  };

  const response = await agent.post("/api/auth/register").set("x-csrf-token", csrfToken).send(payload);
  expect(response.statusCode).toBe(201);
  expectSessionCookies(response);

  return {
    agent,
    user: response.body.user
  };
};

const createProject = async (agent, overrides = {}) => {
  const csrfToken = await getCsrfToken(agent);
  const payload = {
    name: overrides.name || "샘플 프로젝트",
    description: overrides.description || "샘플 설명",
    sceneData: overrides.sceneData || { nodes: [] },
    thumbnail: overrides.thumbnail || ""
  };

  const response = await agent
    .post("/api/projects")
    .set("x-csrf-token", csrfToken)
    .send(payload);

  expect(response.statusCode).toBe(201);
  return response.body.project;
};

describe("Project API", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  describe("POST /api/projects", () => {
    it("인증되지 않은 요청은 401을 반환한다", async () => {
      const response = await request(app).post("/api/projects").send({
        name: "My Project",
        description: "테스트 프로젝트",
        sceneData: { nodes: [] }
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "인증이 필요합니다."
      });
    });

    it("인증된 사용자는 프로젝트를 생성할 수 있고 Scene 데이터가 정규화된다", async () => {
      const { agent } = await registerUser({ email: "project-create@example.com" });

      const csrfToken = await getCsrfToken(agent);
      const response = await agent
        .post("/api/projects")
        .set("x-csrf-token", csrfToken)
        .send({
          name: "나의 첫 프로젝트",
          description: "씬 데이터 저장 테스트",
          sceneData: {
            nodes: [],
            lights: [{ id: "l1", type: "rect" }],
            diffusers: [
              {
                id: "d1",
                position: [0, 2, 2],
                rotation: [0, 0, 0],
                scale: [2, 2, 1],
                diffuseColor: "#ffffff",
                opacity: 0.6,
                transmission: 0.9,
                thickness: 0.4,
                roughness: 0.7,
                useShader: true,
                enableSecondaryLight: false,
                secondaryLightIntensity: 0,
                linkedLightIds: ["l1"],
                blockOriginalLight: false
              }
            ]
          },
          thumbnail: "http://example.com/thumb.png"
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.project).toMatchObject({
        name: "나의 첫 프로젝트",
        description: "씬 데이터 저장 테스트",
        isShared: false,
        shareActive: false,
        sharePermission: "view",
        sceneData: expect.objectContaining({
          schemaVersion: 2,
          aspectRatio: "16:9",
          diffusers: [
            expect.objectContaining({
              id: "d1",
              linkedLightIds: ["l1"]
            })
          ]
        })
      });

      const savedProject = await Project.findById(response.body.project.id).lean();
      expect(savedProject.sceneData.schemaVersion).toBe(2);
      expect(savedProject.sceneData.aspectRatio).toBe("16:9");
      expect(savedProject.sceneData.diffusers).toHaveLength(1);
      expect(savedProject.sceneData.diffusers[0]).toMatchObject({
        id: "d1",
        linkedLightIds: ["l1"]
      });
    });
  });

  describe("GET /api/projects", () => {
    it("사용자의 프로젝트 목록을 반환한다", async () => {
      const { agent, user } = await registerUser({ email: "list-owner@example.com" });

      await createProject(agent, {
        name: "프로젝트 A",
        description: "A 설명",
        sceneData: { nodes: [{ id: 1 }] }
      });

      await createProject(agent, {
        name: "프로젝트 B",
        description: "B 설명",
        sceneData: { nodes: [{ id: 2 }] }
      });

      const response = await agent.get("/api/projects");

      expect(response.statusCode).toBe(200);
      expect(response.body.projects).toHaveLength(2);
      expect(response.body.projects.every((project) => project.owner === user.id)).toBe(true);
      response.body.projects.forEach((project) => {
        expect(project).toMatchObject({
          isShared: false,
          shareActive: false,
          sharePermission: "view"
        });
      });
    });

    it("인증되지 않은 요청은 401을 반환한다", async () => {
      const response = await request(app).get("/api/projects");

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({
        message: "인증이 필요합니다."
      });
    });
  });

  describe("GET /api/projects/:id", () => {
    it("자신의 프로젝트는 조회할 수 있다", async () => {
      const { agent, user } = await registerUser({ email: "detail-owner@example.com" });
      const project = await createProject(agent, { name: "디테일 프로젝트" });

      const response = await agent.get(`/api/projects/${project.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        project: {
          id: project.id,
          owner: user.id,
          name: "디테일 프로젝트",
          isShared: false,
          shareActive: false,
          sharePermission: "view"
        }
      });
    });

    it("다른 사용자의 프로젝트는 조회할 수 없다", async () => {
      const { agent } = await registerUser({ email: "detail-owner2@example.com" });
      const project = await createProject(agent, { name: "비공개 프로젝트" });

      const { agent: otherAgent } = await registerUser({
        email: "detail-other@example.com"
      });

      const response = await otherAgent.get(`/api/projects/${project.id}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        message: "프로젝트를 찾을 수 없습니다."
      });
    });

    it("유효하지 않은 ID는 400을 반환한다", async () => {
      const { agent } = await registerUser({ email: "detail-invalid@example.com" });

      const response = await agent.get("/api/projects/not-a-valid-id");

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "잘못된 프로젝트 ID입니다."
      });
    });
  });

  describe("PATCH /api/projects/:id", () => {
    it("프로젝트 정보를 수정할 수 있다", async () => {
      const { agent } = await registerUser({ email: "update-owner@example.com" });
      const project = await createProject(agent, { name: "수정 전" });

      const csrfToken = await getCsrfToken(agent);
      const response = await agent
        .patch(`/api/projects/${project.id}`)
        .set("x-csrf-token", csrfToken)
        .send({
          name: "수정 후",
          description: "설명 변경",
          sceneData: {
            nodes: [{ id: 3 }],
            diffusers: [
              {
                id: "updated-dif",
                position: [1, 2, 3],
                rotation: [0, 1, 0],
                scale: [1, 1, 1],
                diffuseColor: "#eeeeee",
                opacity: 0.7,
                transmission: 0.8,
                thickness: 0.6,
                roughness: 0.5,
                useShader: false,
                enableSecondaryLight: true,
                secondaryLightIntensity: 3,
                linkedLightIds: ["light-1"],
                blockOriginalLight: true
              }
            ]
          }
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "프로젝트가 업데이트되었습니다.",
        project: expect.objectContaining({
          name: "수정 후",
          description: "설명 변경",
          sceneData: expect.objectContaining({
            nodes: [{ id: 3 }],
            diffusers: [
              expect.objectContaining({
                id: "updated-dif",
                enableSecondaryLight: true,
                blockOriginalLight: true
              })
            ],
            schemaVersion: 2
          })
        })
      });

      const savedProject = await Project.findById(project.id).lean();
      expect(savedProject.name).toBe("수정 후");
      expect(savedProject.sceneData.schemaVersion).toBe(2);
      expect(savedProject.sceneData.diffusers).toHaveLength(1);
      expect(savedProject.sceneData.diffusers[0]).toMatchObject({
        id: "updated-dif",
        enableSecondaryLight: true,
        blockOriginalLight: true
      });
    });

    it("다른 사용자의 프로젝트는 수정할 수 없다", async () => {
      const { agent } = await registerUser({ email: "update-owner2@example.com" });
      const project = await createProject(agent, { name: "다른 사람 프로젝트" });

      const { agent: otherAgent } = await registerUser({
        email: "update-other@example.com"
      });

      const csrfToken = await getCsrfToken(otherAgent);
      const response = await otherAgent
        .patch(`/api/projects/${project.id}`)
        .set("x-csrf-token", csrfToken)
        .send({ name: "해킹 시도" });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        message: "프로젝트를 찾을 수 없습니다."
      });
    });

    it("수정할 필드가 없으면 400을 반환한다", async () => {
      const { agent } = await registerUser({ email: "update-empty@example.com" });
      const project = await createProject(agent);

      const csrfToken = await getCsrfToken(agent);
      const response = await agent
        .patch(`/api/projects/${project.id}`)
        .set("x-csrf-token", csrfToken)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "수정할 필드를 제공해주세요."
      });
    });

    it("잘못된 ID는 400을 반환한다", async () => {
      const { agent } = await registerUser({ email: "update-invalid@example.com" });

      const csrfToken = await getCsrfToken(agent);
      const response = await agent
        .patch("/api/projects/invalid-id")
        .set("x-csrf-token", csrfToken)
        .send({ name: "무효" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "잘못된 프로젝트 ID입니다."
      });
    });
  });

  describe("DELETE /api/projects/:id", () => {
    it("프로젝트를 삭제할 수 있다", async () => {
      const { agent } = await registerUser({ email: "delete-owner@example.com" });
      const project = await createProject(agent);

      const csrfToken = await getCsrfToken(agent);
      const response = await agent
        .delete(`/api/projects/${project.id}`)
        .set("x-csrf-token", csrfToken);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});

      const exists = await Project.findById(project.id);
      expect(exists).toBeNull();
    });

    it("다른 사용자가 삭제를 시도하면 404를 반환한다", async () => {
      const { agent } = await registerUser({ email: "delete-owner2@example.com" });
      const project = await createProject(agent);

      const { agent: otherAgent } = await registerUser({
        email: "delete-other@example.com"
      });

      const csrfToken = await getCsrfToken(otherAgent);
      const response = await otherAgent
        .delete(`/api/projects/${project.id}`)
        .set("x-csrf-token", csrfToken);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        message: "프로젝트를 찾을 수 없습니다."
      });
    });

    it("잘못된 ID는 400을 반환한다", async () => {
      const { agent } = await registerUser({ email: "delete-invalid@example.com" });

      const csrfToken = await getCsrfToken(agent);
      const response = await agent
        .delete("/api/projects/bad-id")
        .set("x-csrf-token", csrfToken);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "잘못된 프로젝트 ID입니다."
      });
    });
  });

  describe("프로젝트 공유 API", () => {
    it("공유 링크를 생성하고 조회 및 공개 접근이 가능하다", async () => {
      const { agent } = await registerUser({ email: "share-owner@example.com" });
      const project = await createProject(agent);

      const csrfToken = await getCsrfToken(agent);
      const createResponse = await agent
        .post(`/api/projects/${project.id}/share`)
        .set("x-csrf-token", csrfToken)
        .send({ permission: "view" });

      expect(createResponse.statusCode).toBe(201);
      expect(createResponse.body).toHaveProperty("share");

      const { share } = createResponse.body;
      expect(share).toMatchObject({
        permission: "view",
        isActive: true,
        expiresAt: null
      });
      expect(typeof share.token).toBe("string");

      const getResponse = await agent.get(`/api/projects/${project.id}/share`);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.share).toMatchObject({
        token: share.token,
        permission: "view",
        isActive: true
      });

      const publicResponse = await request(app).get(`/api/share/${share.token}`);
      expect(publicResponse.statusCode).toBe(200);
      expect(publicResponse.body).toMatchObject({
        permission: "view",
        isActive: true,
        expiresAt: null,
        project: expect.objectContaining({
          id: project.id,
          name: project.name
        })
      });

      const listResponse = await agent.get("/api/projects");
      const sharedProject = listResponse.body.projects.find((item) => item.id === project.id);
      expect(sharedProject).toMatchObject({
        isShared: true,
        shareActive: true,
        sharePermission: "view"
      });
    });

    it("공유 설정 업데이트로 권한과 활성 상태를 제어할 수 있다", async () => {
      const { agent } = await registerUser({ email: "share-update@example.com" });
      const project = await createProject(agent);

      const csrfToken = await getCsrfToken(agent);
      const createResponse = await agent
        .post(`/api/projects/${project.id}/share`)
        .set("x-csrf-token", csrfToken)
        .send();

      const { share } = createResponse.body;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const updateCsrfToken = await getCsrfToken(agent);
      const updateResponse = await agent
        .patch(`/api/projects/${project.id}/share`)
        .set("x-csrf-token", updateCsrfToken)
        .send({
          permission: "edit",
          expiresAt,
          isActive: false
        });

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body.share).toMatchObject({
        token: share.token,
        permission: "edit",
        isActive: false,
        expiresAt
      });

      const inactiveResponse = await request(app).get(`/api/share/${share.token}`);
      expect(inactiveResponse.statusCode).toBe(403);
      expect(inactiveResponse.body).toMatchObject({
        message: "이 공유 링크는 비활성화되었습니다."
      });

      const afterDeactivateList = await agent.get("/api/projects");
      const deactivatedProject = afterDeactivateList.body.projects.find((item) => item.id === project.id);
      expect(deactivatedProject).toMatchObject({
        isShared: true,
        shareActive: false,
        sharePermission: "edit"
      });

      const reactivateCsrfToken = await getCsrfToken(agent);
      const reactivateResponse = await agent
        .patch(`/api/projects/${project.id}/share`)
        .set("x-csrf-token", reactivateCsrfToken)
        .send({ isActive: true });

      expect(reactivateResponse.statusCode).toBe(200);
      expect(reactivateResponse.body.share).toMatchObject({
        permission: "edit",
        isActive: true,
        expiresAt
      });

      const publicResponse = await request(app).get(`/api/share/${share.token}`);
      expect(publicResponse.statusCode).toBe(200);
      expect(publicResponse.body.permission).toBe("edit");

      const afterReactivateList = await agent.get("/api/projects");
      const updatedProject = afterReactivateList.body.projects.find((item) => item.id === project.id);
      expect(updatedProject).toMatchObject({
        isShared: true,
        shareActive: true,
        sharePermission: "edit"
      });
    });

    it("링크를 재생성하면 이전 토큰이 만료된다", async () => {
      const { agent } = await registerUser({ email: "share-regenerate@example.com" });
      const project = await createProject(agent);

      const csrfToken = await getCsrfToken(agent);
      const createResponse = await agent
        .post(`/api/projects/${project.id}/share`)
        .set("x-csrf-token", csrfToken)
        .send();

      const originalToken = createResponse.body.share.token;

      const regenerateCsrfToken = await getCsrfToken(agent);
      const regenerateResponse = await agent
        .post(`/api/projects/${project.id}/share/regenerate`)
        .set("x-csrf-token", regenerateCsrfToken)
        .send();

      expect(regenerateResponse.statusCode).toBe(200);
      expect(regenerateResponse.body.share.token).not.toBe(originalToken);

      const oldTokenResponse = await request(app).get(`/api/share/${originalToken}`);
      expect(oldTokenResponse.statusCode).toBe(404);
      expect(oldTokenResponse.body).toMatchObject({
        message: "공유 토큰을 찾을 수 없습니다."
      });

      const remainingTokens = await ShareToken.find({ project: project.id });
      expect(remainingTokens).toHaveLength(1);
      expect(remainingTokens[0].token).toBe(regenerateResponse.body.share.token);

      const newTokenResponse = await request(app).get(
        `/api/share/${regenerateResponse.body.share.token}`
      );
      expect(newTokenResponse.statusCode).toBe(200);
      expect(newTokenResponse.body.permission).toBe("view");
    });
  });
});
