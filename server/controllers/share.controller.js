const shareService = require("../services/share.service");

const createShareToken = async (req, res, next) => {
  const { id: projectId } = req.params;

  try {
    const ownerId = req.user.id || req.user._id.toString();
    const result = await shareService.createShareToken(projectId, ownerId, {
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const revokeShareTokens = async (req, res, next) => {
  const { id: projectId } = req.params;

  try {
    const ownerId = req.user.id || req.user._id.toString();
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
  createShareToken,
  revokeShareTokens,
  resolveShareToken
};
