// eslint.config.cjs — flat-config для ESLint v9

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

module.exports = [
  // чем не нужно заниматься ESLint
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.vercel/**'],
  },

  // Базовые правила JS
  js.configs.recommended,

  // Базовые правила для TypeScript (без типо-анализа — быстрее в CI)
  ...tseslint.configs.recommended,

  // Общие настройки для TS/JS/React файлов
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Немного порядка в импортax
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];
