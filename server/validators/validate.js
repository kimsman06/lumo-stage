const { ZodError } = require("zod");

const formatIssues = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (result.body !== undefined) {
      req.body = result.body;
    }

    if (result.params !== undefined) {
      req.params = result.params;
    }

    if (result.query !== undefined) {
      req.query = result.query;
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const message =
        error.issues[0]?.message || "요청 데이터가 올바르지 않습니다.";
      res.status(400).json({
        message,
        issues: formatIssues(error.issues)
      });
      return;
    }

    next(error);
  }
};

module.exports = validate;
