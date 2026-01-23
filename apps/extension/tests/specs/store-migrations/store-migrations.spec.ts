import { testFingerprint } from '@tests/page-object-models/onboarding.page';

import { test } from '../../fixtures/fixtures';

test.describe('Store migrations', () => {
  test.beforeEach(async ({ extensionId, globalPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await globalPage.page.waitForTimeout(1000);
  });

  test.describe('Migration 0 --> 3', () => {
    const previousSerializedState =
      '{"analytics":"{\\"hasStxDeposits\\":{\\"1\\":true,\\"2147483648\\":true}}","chains":"{\\"stx\\":{\\"default\\":{\\"highestAccountIndex\\":16,\\"currentAccountIndex\\":0}}}","keys":"{\\"ids\\":[\\"default\\"],\\"entities\\":{\\"default\\":{\\"type\\":\\"software\\",\\"id\\":\\"default\\",\\"salt\\":\\"c4cccf33166051f7704cd877a2f03f93\\",\\"encryptedSecretKey\\":\\"b7f516798e7160eca15c50b62e588698937f8ecf3930efc42baa690ddc0c7a51b74e3e4b129859274ed272652bc47651c6b6effbddf4d72a3eb9d2ea657b64a833c9bdccb562e45d94f0cc1366154072f12d35290566a99a6f952cd234ca9259\\"}}}","networks":"{\\"ids\\":[],\\"entities\\":{},\\"currentNetworkId\\":\\"mainnet\\"}","onboarding":"{\\"hideSteps\\":true,\\"stepsStatus\\":{\\"Back up secret key\\":1,\\"Add some funds\\":0,\\"Explore apps\\":0,\\"Buy an NFT\\":0}}","settings":"{\\"userSelectedTheme\\":\\"system\\",\\"dismissedMessages\\":[]}","_persist":"{\\"version\\":1,\\"rehydrated\\":true}"}';

    test('that the app detects old store format', async ({ extensionId, globalPage }) => {
      const { page } = globalPage;

      await globalPage.page.waitForTimeout(2000);

      // Force wallet into old state format using Redux Persist serialization
      await page.evaluate(
        async state => chrome.storage.local.set({ ['persist:root']: state }),
        previousSerializedState
      );

      await page.waitForTimeout(3000);

      // Refresh to simulate user returning to app for first time since migration
      await globalPage.gotoNakedRoot(extensionId);

      await page.waitForTimeout(3000);

      // State now in new format
      const result = await page.evaluate(async () =>
        chrome.storage.local.get(['persist:root']).then(state => state['persist:root'])
      );

      // Assert that old values are present in unserialized format
      test
        .expect(result.softwareKeys.entities[testFingerprint]?.encryptedSecretKey)
        .toEqual(
          'b7f516798e7160eca15c50b62e588698937f8ecf3930efc42baa690ddc0c7a51b74e3e4b129859274ed272652bc47651c6b6effbddf4d72a3eb9d2ea657b64a833c9bdccb562e45d94f0cc1366154072f12d35290566a99a6f952cd234ca9259'
        );

      test.expect(result.softwareKeys.salt).toEqual('c4cccf33166051f7704cd877a2f03f93');

      test.expect(result.ledger.stacks).toBeDefined();
    });
  });
});
