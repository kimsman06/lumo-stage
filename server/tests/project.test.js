const request = require("supertest");

const { app, connectDatabase } = require("../server");
const Project = require("../models/Project");

const registerAndGetCookie = async (overrides = {}) => {
  const payload = {
    username: "프로젝트유저",
    email: overrides.email || "project-user@example.com",
    password: "password123"
  };

  const response = await request(app).post("/api/auth/register").send(payload);

  return {
    cookie: response.headers["set-cookie"],
    user: response.body.user
  };
};

const createProject = async (cookie, overrides = {}) => {
  const payload = {
    name: overrides.name || "샘플 프로젝트",
    description: overrides.description || "샘플 설명",
    sceneData: overrides.sceneData || { nodes: [] },
    thumbnail: overrides.thumbnail || ""
  };

  const response = await request(app).post("/api/projects").set("Cookie", cookie).send(payload);

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

    it("인증된 사용자는 프로젝트를 생성할 수 있다", async () => {
      const { cookie } = await registerAndGetCookie();

      const response = await request(app)
        .post("/api/projects")
        .set("Cookie", cookie)
        .send({
          name: "나의 첫 프로젝트",
          description: "씬 데이터 저장 테스트",
          sceneData: { nodes: [], lights: [] },
          thumbnail: "http://example.com/thumb.png"
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        message: "프로젝트가 생성되었습니다.",
        project: {
          name: "나의 첫 프로젝트",
          description: "씬 데이터 저장 테스트"
        }
      });
      expect(response.body.project).toHaveProperty("id");

      const savedProject = await Project.findById(response.body.project.id).lean();
      expect(savedProject).toBeTruthy();
      expect(savedProject.sceneData).toMatchObject({ nodes: [], lights: [] });
    });
  });

  describe("GET /api/projects", () => {
    it("사용자의 프로젝트 목록을 반환한다", async () => {
      const { cookie, user } = await registerAndGetCookie({ email: "list-owner@example.com" });

      await request(app)
        .post("/api/projects")
        .set("Cookie", cookie)
        .send({
          name: "프로젝트 A",
          description: "A 설명",
          sceneData: { nodes: [{ id: 1 }] }
        });

      await request(app)
        .post("/api/projects")
        .set("Cookie", cookie)
        .send({
          name: "프로젝트 B",
          description: "B 설명",
          sceneData: { nodes: [{ id: 2 }] }
        });

      const response = await request(app).get("/api/projects").set("Cookie", cookie);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        projects: expect.any(Array)
      });
      expect(response.body.projects).toHaveLength(2);
      expect(response.body.projects.every((project) => project.owner === user.id)).toBe(true);
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
      const { cookie, user } = await registerAndGetCookie({ email: "detail-owner@example.com" });
      const project = await createProject(cookie, { name: "디테일 프로젝트" });

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set("Cookie", cookie);

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        project: {
          id: project.id,
          owner: user.id,
          name: "디테일 프로젝트"
        }
      });
    });

    it("다른 사용자의 프로젝트는 조회할 수 없다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "detail-owner2@example.com" });
      const project = await createProject(cookie, { name: "비공개 프로젝트" });

      const { cookie: otherCookie } = await registerAndGetCookie({
        email: "detail-other@example.com"
      });

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set("Cookie", otherCookie);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        message: "프로젝트를 찾을 수 없습니다."
      });
    });

    it("유효하지 않은 ID는 400을 반환한다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "detail-invalid@example.com" });

      const response = await request(app).get("/api/projects/not-a-valid-id").set("Cookie", cookie);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "잘못된 프로젝트 ID입니다."
      });
    });
  });

  describe("PATCH /api/projects/:id", () => {
    it("프로젝트 정보를 수정할 수 있다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "update-owner@example.com" });
      const project = await createProject(cookie, { name: "수정 전" });

      const response = await request(app)
        .patch(`/api/projects/${project.id}`)
        .set("Cookie", cookie)
        .send({
          name: "수정 후",
          description: "설명 변경",
          sceneData: { nodes: [{ id: 3 }] }
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
        message: "프로젝트가 업데이트되었습니다.",
        project: {
          name: "수정 후",
          description: "설명 변경",
          sceneData: { nodes: [{ id: 3 }] }
        }
      });

      const savedProject = await Project.findById(project.id).lean();
      expect(savedProject.name).toBe("수정 후");
      expect(savedProject.sceneData).toMatchObject({ nodes: [{ id: 3 }] });
    });

    it("다른 사용자의 프로젝트는 수정할 수 없다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "update-owner2@example.com" });
      const project = await createProject(cookie, { name: "다른 사람 프로젝트" });

      const { cookie: otherCookie } = await registerAndGetCookie({
        email: "update-other@example.com"
      });

      const response = await request(app)
        .patch(`/api/projects/${project.id}`)
        .set("Cookie", otherCookie)
        .send({ name: "해킹 시도" });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        message: "프로젝트를 찾을 수 없습니다."
      });
    });

    it("수정할 필드가 없으면 400을 반환한다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "update-empty@example.com" });
      const project = await createProject(cookie);

      const response = await request(app)
        .patch(`/api/projects/${project.id}`)
        .set("Cookie", cookie)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "수정할 필드를 제공해주세요."
      });
    });

    it("잘못된 ID는 400을 반환한다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "update-invalid@example.com" });

      const response = await request(app)
        .patch("/api/projects/invalid-id")
        .set("Cookie", cookie)
        .send({ name: "무효" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "잘못된 프로젝트 ID입니다."
      });
    });
  });

  describe("DELETE /api/projects/:id", () => {
    it("프로젝트를 삭제할 수 있다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "delete-owner@example.com" });
      const project = await createProject(cookie);

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set("Cookie", cookie);

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});

      const exists = await Project.findById(project.id);
      expect(exists).toBeNull();
    });

    it("다른 사용자가 삭제를 시도하면 404를 반환한다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "delete-owner2@example.com" });
      const project = await createProject(cookie);

      const { cookie: otherCookie } = await registerAndGetCookie({
        email: "delete-other@example.com"
      });

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set("Cookie", otherCookie);

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        message: "프로젝트를 찾을 수 없습니다."
      });
    });

    it("잘못된 ID는 400을 반환한다", async () => {
      const { cookie } = await registerAndGetCookie({ email: "delete-invalid@example.com" });

      const response = await request(app)
        .delete("/api/projects/bad-id")
        .set("Cookie", cookie);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        message: "잘못된 프로젝트 ID입니다."
      });
    });
  });
});
