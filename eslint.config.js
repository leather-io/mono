// @ts-check
import eslint from '@eslint/js';
import defaultConfig from '@leather-wallet/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  extends: [...defaultConfig],
  files: ['**/*.{ts,tsx}'],
  ignores: ['**/!.*', './packages/ui/dist-all/', '**/*.d.ts'],
  languageOptions: {
    parserOptions: {
      // ~9 seconds faster than declaring tsconfig with `project` option
      EXPERIMENTAL_useProjectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
