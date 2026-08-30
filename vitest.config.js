import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.js"],
    include: ["src/**/*.test.js"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/lib/**/*.js"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
