// eslint.config.js
/* eslint-disable import/no-commonjs */
const js = require("@eslint/js");
const ts = require("typescript-eslint");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const importPlugin = require("eslint-plugin-import");

module.exports = [
  // что игнорим (замена .eslintignore)
  { ignores: ["dist/**", "node_modules/**"] },

  js.configs.recommended,
  ...ts.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    rules: {
      // временно мягче, чтобы lint не мешал
      "react-hooks/exhaustive-deps": "warn",
      "import/order": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
