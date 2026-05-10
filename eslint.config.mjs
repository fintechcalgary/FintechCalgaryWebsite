import { createRequire } from "module";

const require = createRequire(import.meta.url);
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

const ignoresBlock = {
  ignores: [".next/**", "out/**", "node_modules/**", "build/**"],
};

/** Unused bindings (locals, imports, params). `_` prefix opts out. */
const unusedVarsBlock = {
  files: ["**/*.{js,jsx,mjs}"],
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
};

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [...nextCoreWebVitals, unusedVarsBlock, ignoresBlock];

export default eslintConfig;
