const Project = require("../models/Project");

const formatProject = (projectDoc) => {
  const project = projectDoc.toObject({ versionKey: false });

  project.id = project._id.toString();
  project.owner = project.owner.toString();
  delete project._id;

  return project;
};

const createProject = async (data, ownerId) => {
  if (!data.name || !data.sceneData) {
    const error = new Error("필수 필드가 누락되었습니다.");
    error.status = 400;
    throw error;
  }

  const project = await Project.create({
    ...data,
    owner: ownerId
  });

  return formatProject(project);
};

const findProjectForOwner = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });

  if (!project) {
    const error = new Error("프로젝트를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  return project;
};

const getProjectsByOwner = async (ownerId) => {
  const projects = await Project.find({ owner: ownerId }).sort({ createdAt: -1 });

  return projects.map(formatProject);
};

const getProjectById = async (projectId, ownerId) => {
  const project = await findProjectForOwner(projectId, ownerId);

  return formatProject(project);
};

const updateProject = async (projectId, ownerId, updates) => {
  const allowedFields = ["name", "description", "sceneData", "thumbnail"];
  const payload = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      payload[field] = updates[field];
    }
  });

  if (Object.keys(payload).length === 0) {
    const error = new Error("수정할 필드를 제공해주세요.");
    error.status = 400;
    throw error;
  }

  const project = await findProjectForOwner(projectId, ownerId);

  Object.assign(project, payload);
  await project.save();

  return formatProject(project);
};

const deleteProject = async (projectId, ownerId) => {
  const project = await findProjectForOwner(projectId, ownerId);

  await project.deleteOne();
};

module.exports = {
  createProject,
  getProjectsByOwner,
  getProjectById,
  updateProject,
  deleteProject
};
