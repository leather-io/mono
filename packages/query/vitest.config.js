import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: 'src/**/*.spec.{ts,tsx}',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json-summary', 'json', 'html'],
      reportsDirectory: './coverage',
    },
    globals: true,
    environment: 'node',
    setupFiles: './unit-test.setup.js',
    deps: { interopDefault: true },
    silent: false,
  },
});
