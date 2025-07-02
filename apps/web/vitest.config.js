import path from 'node:path';
import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '../../config/vitest-configs';

export default defineProject({
  ...defaultVitestUnitTestingConfig,
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
      'leather-styles': path.resolve(__dirname, 'leather-styles'),
      axios: path.resolve(__dirname, 'node_modules/axios/dist/esm/axios.js'),
    },
  },
  test: {
    ...defaultVitestUnitTestingConfig.test,
    include: ['app/**/*.spec.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
  },
});
