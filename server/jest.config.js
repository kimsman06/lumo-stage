/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "services/**/*.js",
    "models/**/*.js",
    "!**/__mocks__/**"
  ],
  coverageDirectory: "coverage",
  clearMocks: true,
  moduleFileExtensions: ["js", "json"]
};
