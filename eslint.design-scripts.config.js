import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['scripts/design/**/*.ts'],
    ignores: ['scripts/design/__fixtures__/**'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './scripts/design/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
]);
