const User = require("../models/User");

const requireAuth = async (req, _res, next) => {
  try {
    if (req.user) {
      next();
      return;
    }

    const userId = req.session?.userId;

    if (!userId) {
      const error = new Error("인증이 필요합니다.");
      error.status = 401;
      throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
      if (req.session) {
        req.session.destroy(() => {});
      }

      const error = new Error("인증이 필요합니다.");
      error.status = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "인증이 필요합니다.";
    }

    next(error);
  }
};

module.exports = requireAuth;
