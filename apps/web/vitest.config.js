import path from 'node:path';
import { defineProject } from 'vitest/config';

import { defaultVitestUnitTestingConfig } from '@leather.io/test-config';

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
    include: ['app/**/*.spec.{ts,tsx}', 'app/**/*.test.{ts,tsx}', 'workers/**/*.spec.ts'],
    environmentMatchGlobs: [
      ['app/pages/playground/shared/recipes/**/*.spec.tsx', 'jsdom'],
      ['app/features/bitcoin-staking/**/*.spec.tsx', 'jsdom'],
      ['app/pages/multisig/account/components/propose-transaction-modal.spec.tsx', 'jsdom'],
      ['app/pages/multisig/vault/components/share-invitations-modal.spec.tsx', 'jsdom'],
    ],
  },
});
