/* eslint config for React + TS + Vite */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module", project: false },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { project: ["./tsconfig.json"] },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
  },
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "unused-imports",
    "simple-import-sort",
    "import",
    "prettier",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended", // включает eslint-config-prettier + eslint-plugin-prettier
  ],
  rules: {
    /* стиль импортов */
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "import/first": "warn",
    "import/newline-after-import": "warn",
    "import/no-duplicates": "warn",

    /* чистота кода */
    "unused-imports/no-unused-imports": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

    /* react */
    "react/react-in-jsx-scope": "off",

    /* prettier как источник правды по форматированию */
    "prettier/prettier": "warn",
  },
  ignorePatterns: ["dist", "build", "coverage", "node_modules"],
};
