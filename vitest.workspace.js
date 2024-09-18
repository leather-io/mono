import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './apps/*',
  './packages/*',
  {
    test: {
      include: 'src/**/*.spec.{ts,tsx}',
      coverage: {
        reporter: ['text', 'json-summary', 'json', 'html', 'lcov'],
        reportsDirectory: './coverage',
        reportOnFailure: true,
      },
      globals: true,
      environment: 'node',
      deps: { interopDefault: true },
      silent: false,
    },
  },
]);
