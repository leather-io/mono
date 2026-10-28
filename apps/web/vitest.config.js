import path from 'node:path';
import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '@leather.io/test-config';

export default defineProject({
  ...defaultVitestUnitTestingConfig,
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
      '@tests': path.resolve(__dirname, 'tests'),
      'leather-styles': path.resolve(__dirname, 'leather-styles'),
      axios: path.resolve(__dirname, 'node_modules/axios/dist/esm/axios.js'),
    },
  },
  test: {
    ...defaultVitestUnitTestingConfig.test,
    include: ['app/**/*.spec.{ts,tsx}', 'app/**/*.test.{ts,tsx}', 'workers/**/*.spec.ts'],
    environmentMatchGlobs: [
      ['app/features/bitcoin-staking/**/*.spec.tsx', 'jsdom'],
      ['app/pages/multisig/account/components/propose-transaction-modal.spec.tsx', 'jsdom'],
    ],
  },
});
