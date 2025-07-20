import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  eslintConfigPrettier,
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    ignores: ['dist/', 'src-tauri/target/'],
  },
  {
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
