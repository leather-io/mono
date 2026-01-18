import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['**/swap/**/*.spec.ts', 'happy-dom']],
  },
});
