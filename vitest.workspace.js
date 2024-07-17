import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './apps/*',
  './packages/*',
  {
    test: {
      include: 'src/**/*.spec.{ts,tsx}',
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json-summary', 'json', 'html'],
        reportsDirectory: './coverage',
      },
      globals: true,
      environment: 'node',
      deps: { interopDefault: true },
      silent: false,
    },
  },
]);
