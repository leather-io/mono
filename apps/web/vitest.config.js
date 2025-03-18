import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '../../config/vitest-configs';

export default defineProject({
  ...defaultVitestUnitTestingConfig,
  test: {
    ...defaultVitestUnitTestingConfig.test,
    include: 'app/**/*.spec.{ts,tsx}',
  },
});
