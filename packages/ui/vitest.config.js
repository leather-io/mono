import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '@leather.io/test-config';

export default defineProject({
  ...defaultVitestUnitTestingConfig,
  test: {
    ...defaultVitestUnitTestingConfig.test,
    environment: 'happy-dom',
  },
});
