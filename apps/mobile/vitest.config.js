import path from 'node:path';
import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '@leather.io/test-config';

export default defineProject({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  ...defaultVitestUnitTestingConfig,
  test: {
    ...defaultVitestUnitTestingConfig.test,
    // Include both src/ and scripts/ directories for tests
    include: ['src/**/*.spec.{ts,tsx}', 'scripts/**/*.spec.{js,ts}'],
    // While we don't need DOM in the mobile app, @testing-library/react requires this to be able to simply render isolated hooks in tests.
    // https://github.com/callstack/react-native-testing-library/ would've been a better candidate, but it's not vite-compatible.
    environment: 'happy-dom',
  },
});
