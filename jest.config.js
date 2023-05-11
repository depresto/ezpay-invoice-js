module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  preset: "ts-jest",
  testEnvironment: "node",
  coverageReporters: ["text", "cobertura"],
};
