import path from 'node:path';
import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '../../config/vitest-configs';

export default defineProject({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  ...defaultVitestUnitTestingConfig,
  test: {
    ...defaultVitestUnitTestingConfig.test,
    // While we don't need DOM in the mobile app, @testing-library/react requires this to be able to simply render isolated hooks in tests.
    // https://github.com/callstack/react-native-testing-library/ would've been a better candidate, but it's not vite-compatible.
    environment: 'happy-dom',
  },
});
