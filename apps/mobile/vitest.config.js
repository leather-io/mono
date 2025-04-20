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
});
