import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { designRules } from './eslint-rules/design-system/config.js';
import { designSystemPlugin } from './eslint-rules/design-system/index.js';

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/leather-styles/**',
      '**/dist/**',
      '**/*.d.ts',
      '**/*.spec.{ts,tsx}',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'design-system': designSystemPlugin },
    rules: designRules,
  },
  {
    files: ['apps/extension/src/**/*.{ts,tsx}'],
    plugins: { 'design-system': designSystemPlugin },
    rules: { 'design-system/no-local-duplicate': 'error' },
  },
]);
