// Prevent mongodb.js from throwing when a route loads the real module
// before per-test mocks are applied (e.g. relative imports).
process.env.MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/test";
