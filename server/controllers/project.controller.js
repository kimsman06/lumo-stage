const mongoose = require("mongoose");

const {
  createProject,
  getProjectsByOwner,
  getProjectById,
  updateProject,
  deleteProject
} = require("../services/project.service");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const create = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id.toString();
    const project = await createProject(req.body, ownerId);

    res.status(201).json({
      message: "프로젝트가 생성되었습니다.",
      project
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const ownerId = req.user.id || req.user._id.toString();
    const projects = await getProjectsByOwner(ownerId);

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "잘못된 프로젝트 ID입니다." });
    return;
  }

  try {
    const ownerId = req.user.id || req.user._id.toString();
    const project = await getProjectById(id, ownerId);

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "잘못된 프로젝트 ID입니다." });
    return;
  }

  try {
    const ownerId = req.user.id || req.user._id.toString();
    const project = await updateProject(id, ownerId, req.body);

    res.status(200).json({
      message: "프로젝트가 업데이트되었습니다.",
      project
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "잘못된 프로젝트 ID입니다." });
    return;
  }

  try {
    const ownerId = req.user.id || req.user._id.toString();
    await deleteProject(id, ownerId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove
};
