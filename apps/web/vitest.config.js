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
      ['app/features/bitcoin-staking/**/*.spec.tsx', 'jsdom'],
      ['app/pages/multisig/account/components/propose-transaction-modal.spec.tsx', 'jsdom'],
      ['app/pages/playground/areas/approval-flows/pattern/approval-confirm.spec.tsx', 'jsdom'],
      ['app/pages/playground/areas/approval-flows/pattern/approval-ledger-sheet.spec.tsx', 'jsdom'],
      [
        'app/pages/playground/areas/approval-flows/pattern/approval-ledger-animation.spec.tsx',
        'jsdom',
      ],
    ],
  },
});
