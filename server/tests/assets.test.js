const request = require("supertest");

const { app, connectDatabase } = require("../server");
const Asset = require("../models/Asset");
const { __memoryStore } = require("../services/storage.service");
const { createAuthenticatedAgent, getCsrfToken } = require("./utils/auth");
const { createProject, deleteProject } = require("./utils/projects");

describe("Asset API", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  describe("HDRI 서명 업로드 플로우", () => {
    it("서명 URL 발급 후 complete 호출로 에셋을 생성한다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "hdri-direct@example.com"
      });
      const { project } = await createProject(agent, { name: "Direct HDRI" });
      const csrfToken = await getCsrfToken(agent);

      const initResponse = await agent
        .post("/api/assets/upload-hdri/init")
        .set("x-csrf-token", csrfToken)
        .send({
          projectId: project.id,
          fileName: "direct.exr",
          fileSize: 2048,
          mimeType: "image/x-exr"
        });

      expect(initResponse.statusCode).toBe(200);
      expect(initResponse.body).toEqual(
        expect.objectContaining({
          uploadUrl: expect.any(String),
          fileKey: expect.stringMatching(/^hdri\//)
        })
      );

      const completeResponse = await agent
        .post("/api/assets/upload-hdri/complete")
        .set("x-csrf-token", csrfToken)
        .send({
          projectId: project.id,
          fileName: "direct.exr",
          fileSize: 2048,
          mimeType: "image/x-exr",
          fileKey: initResponse.body.fileKey
        });

      expect(completeResponse.statusCode).toBe(201);
      expect(completeResponse.body.asset).toMatchObject({
        type: "hdri",
        fileName: "direct.exr",
        projectId: project.id
      });
    });

    it("fileKey 없이 complete 호출 시 400을 반환한다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "hdri-missing-key@example.com"
      });
      const csrfToken = await getCsrfToken(agent);

      const response = await agent
        .post("/api/assets/upload-hdri/complete")
        .set("x-csrf-token", csrfToken)
        .send({
          projectId: "507f1f77bcf86cd799439011",
          fileName: "invalid.exr",
          fileSize: 100,
          mimeType: "image/x-exr"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/fileKey가 필요/);
    });
  });

  describe("POST /api/assets/upload-hdri", () => {
    it("인증되지 않은 사용자는 업로드할 수 없다", async () => {
      const response = await request(app).post("/api/assets/upload-hdri");

      expect(response.statusCode).toBe(401);
    });

    it("프로젝트에 HDRI 파일을 업로드할 수 있다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "hdri-uploader@example.com"
      });
      const { project } = await createProject(agent, { name: "HDRI 프로젝트" });
      const csrfToken = await getCsrfToken(agent);
      const fileBuffer = Buffer.from("fake hdri data");

      const response = await agent
        .post("/api/assets/upload-hdri")
        .set("x-csrf-token", csrfToken)
        .field("projectId", project.id)
        .attach("file", fileBuffer, {
          filename: "studio.hdr",
          contentType: "image/vnd.radiance"
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.asset).toMatchObject({
        type: "hdri",
        projectId: project.id,
        fileName: "studio.hdr",
        mimeType: "image/vnd.radiance",
        fileSize: fileBuffer.length
      });
      expect(typeof response.body.asset.fileUrl).toBe("string");

      const assetCount = await Asset.countDocuments();
      expect(assetCount).toBe(1);
    });
  });

  describe("POST /api/assets/upload-gltf", () => {
    it("GLTF 파일을 업로드하고 에셋 ID를 반환한다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "gltf-uploader@example.com"
      });
      const { project } = await createProject(agent, { name: "GLTF 프로젝트" });
      const csrfToken = await getCsrfToken(agent);
      const fileBuffer = Buffer.from(
        JSON.stringify({
          assetVersion: "2.0",
          scene: 0
        })
      );

      const response = await agent
        .post("/api/assets/upload-gltf")
        .set("x-csrf-token", csrfToken)
        .field("projectId", project.id)
        .attach("file", fileBuffer, {
          filename: "rig.glb",
          contentType: "model/gltf-binary"
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.asset).toMatchObject({
        type: "gltf",
        projectId: project.id
      });
    });

    it("지원하지 않는 확장자는 거부한다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "gltf-invalid@example.com"
      });
      const csrfToken = await getCsrfToken(agent);

      const response = await agent
        .post("/api/assets/upload-gltf")
        .set("x-csrf-token", csrfToken)
        .attach("file", Buffer.from("not gltf"), {
          filename: "note.txt",
          contentType: "text/plain"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/지원하지 않는 파일 확장자/);
    });
  });

  describe("GET /api/assets/project/:projectId", () => {
    it("프로젝트 에셋 목록을 반환한다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "asset-list@example.com"
      });
      const { project } = await createProject(agent, { name: "Asset 프로젝트" });
      const csrfToken = await getCsrfToken(agent);

      await agent
        .post("/api/assets/upload-hdri")
        .set("x-csrf-token", csrfToken)
        .field("projectId", project.id)
        .attach("file", Buffer.from("hdr data"), {
          filename: "sunset.hdr",
          contentType: "image/vnd.radiance"
        });

      const response = await agent.get(`/api/assets/project/${project.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.assets).toHaveLength(1);
      expect(response.body.assets[0]).toMatchObject({
        projectId: project.id,
        fileName: "sunset.hdr"
      });
    });
  });

  describe("DELETE /api/assets/:assetId", () => {
    it("에셋을 삭제하면 R2 모의 저장소에서도 제거된다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "asset-delete@example.com"
      });
      const { project } = await createProject(agent, { name: "삭제 프로젝트" });
      const csrfToken = await getCsrfToken(agent);

      const uploadResponse = await agent
        .post("/api/assets/upload-hdri")
        .set("x-csrf-token", csrfToken)
        .field("projectId", project.id)
        .attach("file", Buffer.from("hdr"), {
          filename: "delete.hdr",
          contentType: "image/vnd.radiance"
        });

      const assetId = uploadResponse.body.asset.id;
      const fileKey = uploadResponse.body.asset.fileKey;
      expect(__memoryStore.has(fileKey)).toBe(true);

      const deleteResponse = await agent
        .delete(`/api/assets/${assetId}`)
        .set("x-csrf-token", csrfToken);

      expect(deleteResponse.statusCode).toBe(204);
      expect(__memoryStore.has(fileKey)).toBe(false);

      const assetCount = await Asset.countDocuments();
      expect(assetCount).toBe(0);
    });
  });

  describe("프로젝트 삭제 시 에셋도 삭제된다", () => {
    it("프로젝트 삭제 후 에셋이 존재하지 않는다", async () => {
      const { agent } = await createAuthenticatedAgent({
        email: "cascade@example.com"
      });
      const { project } = await createProject(agent, { name: "Cascade" });
      const csrfToken = await getCsrfToken(agent);

      await agent
        .post("/api/assets/upload-hdri")
        .set("x-csrf-token", csrfToken)
        .field("projectId", project.id)
        .attach("file", Buffer.from("hdr"), {
          filename: "cascade.hdr",
          contentType: "image/vnd.radiance"
        });

      await deleteProject(agent, project.id);

      const assetCount = await Asset.countDocuments();
      expect(assetCount).toBe(0);
    });
  });
});
