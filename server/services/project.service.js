const Project = require("../models/Project");
const ShareToken = require("../models/ShareToken");
const { normalizeSceneData, applySceneDefaults } = require("./scene.service");

const toPlainProject = (projectDoc, skipNormalize = false) => {
  const project = projectDoc.toObject({ versionKey: false });

  project.id = project._id.toString();
  project.owner = project.owner.toString();

  if (!skipNormalize) {
    const { data: normalizedScene } = normalizeSceneData(project.sceneData);
    project.sceneData = normalizedScene;
  }

  delete project._id;

  return project;
};

const buildShareStatus = async (projectId) => {
  const token = await ShareToken.findOne({ project: projectId, isRevoked: false }).sort({
    createdAt: -1,
  });

  if (!token) {
    return {
      isShared: false,
      shareActive: false,
      sharePermission: "view",
    };
  }

  const now = new Date();
  const isExpired = token.expiresAt ? token.expiresAt <= now : false;

  return {
    isShared: true,
    shareActive: token.isActive && !isExpired,
    sharePermission: token.permission,
  };
};

const formatProject = async (projectDoc, skipDefaults = false) => {
  // 저장 시 이미 정규화된 경우 다시 정규화하지 않음
  if (!skipDefaults) {
    applySceneDefaults(projectDoc);

    if (projectDoc.isModified("sceneData")) {
      await projectDoc.save();
    }
  }

  // skipDefaults가 true면 toPlainProject에서도 정규화를 건너뜀
  const project = toPlainProject(projectDoc, skipDefaults);
  const shareStatus = await buildShareStatus(projectDoc._id);

  return {
    ...project,
    ...shareStatus,
  };
};

const createProject = async (data, ownerId) => {
  if (!data.name || !data.sceneData) {
    const error = new Error("필수 필드가 누락되었습니다.");
    error.status = 400;
    throw error;
  }

  const { data: normalizedScene } = normalizeSceneData(data.sceneData);

  const project = await Project.create({
    ...data,
    sceneData: normalizedScene,
    owner: ownerId
  });

  // create 시 이미 정규화했으므로, formatProject에서 다시 정규화하지 않음
  return formatProject(project, true);
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

  // 저장 시 이미 정규화되었으므로, 조회 시에는 정규화를 건너뜀
  return Promise.all(projects.map((project) => formatProject(project, true)));
};

const getProjectById = async (projectId, ownerId) => {
  const project = await findProjectForOwner(projectId, ownerId);

  // 저장 시 이미 정규화되었으므로, 조회 시에는 정규화를 건너뜀
  return formatProject(project, true);
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

  if (payload.sceneData) {
    const { data: normalizedScene } = normalizeSceneData(payload.sceneData);
    payload.sceneData = normalizedScene;
  }

  const project = await Project.findOneAndUpdate(
    { _id: projectId, owner: ownerId },
    { $set: payload },
    {
      new: true,
      runValidators: true,
      overwrite: false,
      setDefaultsOnInsert: false
    }
  );

  if (!project) {
    const error = new Error("프로젝트를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  // updateProject에서는 이미 정규화했으므로 formatProject에서 다시 정규화하지 않음
  return formatProject(project, true);
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
