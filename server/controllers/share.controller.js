const shareService = require("../services/share.service");

const getOwnerId = (req) => req.user.id || req.user._id.toString();

const createShareLink = async (req, res, next) => {
  const { id: projectId } = req.params;

  try {
    const ownerId = getOwnerId(req);
    const share = await shareService.createShareToken(projectId, ownerId, req.body, {
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.status(201).json({ share });
  } catch (error) {
    next(error);
  }
};

const getShareConfig = async (req, res, next) => {
  const { id: projectId } = req.params;

  try {
    const ownerId = getOwnerId(req);
    const share = await shareService.getShareConfig(projectId, ownerId);

    res.status(200).json({ share });
  } catch (error) {
    next(error);
  }
};

const updateShareConfig = async (req, res, next) => {
  const { id: projectId } = req.params;

  try {
    const ownerId = getOwnerId(req);
    const share = await shareService.updateShareConfig(projectId, ownerId, req.body);

    res.status(200).json({ share });
  } catch (error) {
    next(error);
  }
};

const regenerateShareLink = async (req, res, next) => {
  const { id: projectId } = req.params;

  try {
    const ownerId = getOwnerId(req);
    const share = await shareService.regenerateShareToken(projectId, ownerId, {
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.status(200).json({ share });
  } catch (error) {
    next(error);
  }
};

const revokeShareLinks = async (req, res, next) => {
  const { id: projectId } = req.params;

  try {
    const ownerId = getOwnerId(req);
    await shareService.revokeShareTokens(projectId, ownerId, {
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const resolveShareToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const result = await shareService.resolveShareToken(token, {
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShareLink,
  getShareConfig,
  updateShareConfig,
  regenerateShareLink,
  revokeShareLinks,
  resolveShareToken
};
