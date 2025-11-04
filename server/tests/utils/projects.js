const request = require("supertest");

const { app } = require("../../server");
const { getCsrfToken } = require("./auth");

const DEFAULT_PROJECT = {
  name: "샘플 프로젝트",
  description: "샘플 설명",
  sceneData: { nodes: [] },
  thumbnail: ""
};

const createProjectPayload = (overrides = {}) => ({
  ...DEFAULT_PROJECT,
  ...overrides
});

const createProject = async (agent, overrides = {}) => {
  const csrfToken = await getCsrfToken(agent);
  const payload = createProjectPayload(overrides);

  const response = await agent
    .post("/api/projects")
    .set("x-csrf-token", csrfToken)
    .send(payload);

  expect(response.statusCode).toBe(201);

  return { response, project: response.body.project, payload };
};

const updateProject = async (agent, projectId, updates) => {
  const csrfToken = await getCsrfToken(agent);

  return agent
    .patch(`/api/projects/${projectId}`)
    .set("x-csrf-token", csrfToken)
    .send(updates);
};

const deleteProject = async (agent, projectId) => {
  const csrfToken = await getCsrfToken(agent);

  return agent
    .delete(`/api/projects/${projectId}`)
    .set("x-csrf-token", csrfToken);
};

const fetchProjects = async (agent) => agent.get("/api/projects");

const fetchProjectDetail = async (agent, projectId) =>
  agent.get(`/api/projects/${projectId}`);

const createShare = async (agent, projectId, body = {}) => {
  const csrfToken = await getCsrfToken(agent);

  return agent
    .post(`/api/projects/${projectId}/share`)
    .set("x-csrf-token", csrfToken)
    .send(body);
};

const updateShare = async (agent, projectId, body = {}) => {
  const csrfToken = await getCsrfToken(agent);

  return agent
    .patch(`/api/projects/${projectId}/share`)
    .set("x-csrf-token", csrfToken)
    .send(body);
};

const regenerateShare = async (agent, projectId) => {
  const csrfToken = await getCsrfToken(agent);

  return agent
    .post(`/api/projects/${projectId}/share/regenerate`)
    .set("x-csrf-token", csrfToken)
    .send();
};

const fetchPublicShare = async (token) => request(app).get(`/api/share/${token}`);

module.exports = {
  createProject,
  createProjectPayload,
  createShare,
  deleteProject,
  fetchProjectDetail,
  fetchProjects,
  fetchPublicShare,
  regenerateShare,
  updateProject,
  updateShare
};
