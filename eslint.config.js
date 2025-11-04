// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // Игноры (замена .eslintignore)
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**"],
  },

  // Базовые правила JS
  js.configs.recommended,

  // TypeScript / TSX
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      // объявляем глобали браузера и ноды
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react,
      "react-hooks": hooks,
    },
    rules: {
      // TS-правила
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",

      // React/JSX
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",
      "react/jsx-key": "warn",

      // Hooks
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // Общие
      "no-unused-vars": "off", // вместо него используем TS-версию
      "no-undef": "off", // ВАЖНО: отключаем для TS (иначе ругается на HTMLDivElement и т.п.)

      // Совместимость с Prettier
      ...prettier.rules,
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // JS/JSX (если есть) — проверяются как раньше
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: { react, "react-hooks": hooks },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      ...prettier.rules,
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
