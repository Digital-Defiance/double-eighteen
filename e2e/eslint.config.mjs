import playwright from 'eslint-plugin-playwright';

export default [
  playwright.configs['flat/recommended'],
  {
    files: ['**/*.mjs', '**/*.js'],
    rules: {},
  },
];
