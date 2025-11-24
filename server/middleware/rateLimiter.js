const createRateLimiter = ({ windowMs, limit, keyGenerator }) => {
  const hits = new Map();

  const limiter = (req, res, next) => {
    if (process.env.NODE_ENV === "test") {
      next();
      return;
    }

    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, expiresAt: now + windowMs };

    if (now > entry.expiresAt) {
      entry.count = 0;
      entry.expiresAt = now + windowMs;
    }

    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > limit) {
      res.status(429).json({
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
      });
      return;
    }

    next();
  };

  limiter.reset = () => hits.clear();

  return limiter;
};

module.exports = {
  createRateLimiter
};
