const jwt = require("jsonwebtoken");

const User = require("../models/User");

const getTokenFromRequest = (req) => {
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return null;
};

const requireAuth = async (req, _res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      const error = new Error("인증이 필요합니다.");
      error.status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) {
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
