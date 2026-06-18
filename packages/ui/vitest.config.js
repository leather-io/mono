import { fileURLToPath } from 'node:url';
import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '@leather.io/test-config';

const leatherStylesDir = fileURLToPath(new URL('./leather-styles', import.meta.url));

export default defineProject({
  ...defaultVitestUnitTestingConfig,
  resolve: {
    alias: {
      'leather-styles': leatherStylesDir,
    },
  },
  test: {
    ...defaultVitestUnitTestingConfig.test,
    environment: 'happy-dom',
  },
});
