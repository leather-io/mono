import { assumedZeroFingerprint } from '@shared/utils';

import { test } from '../../fixtures/fixtures';

const demoEncryptedKey =
  'b7f516798e7160eca15c50b62e588698937f8ecf3930efc42baa690ddc0c7a51b74e3e4b129859274ed272652bc47651c6b6effbddf4d72a3eb9d2ea657b64a833c9bdccb562e45d94f0cc1366154072f12d35290566a99a6f952cd234ca9259';

const demoSalt = 'c4cccf33166051f7704cd877a2f03f93';

test.describe('Store migrations', () => {
  test.beforeEach(async ({ extensionId, globalPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await globalPage.page.waitForTimeout(1000);
  });

  test('Migration 0 --> 3', async ({ extensionId, globalPage }) => {
    const previousSerializedState =
      '{"analytics":"{\\"hasStxDeposits\\":{\\"1\\":true,\\"2147483648\\":true}}","chains":"{\\"stx\\":{\\"default\\":{\\"highestAccountIndex\\":16,\\"currentAccountIndex\\":0}}}","keys":"{\\"ids\\":[\\"default\\"],\\"entities\\":{\\"default\\":{\\"type\\":\\"software\\",\\"id\\":\\"default\\",\\"salt\\":\\"c4cccf33166051f7704cd877a2f03f93\\",\\"encryptedSecretKey\\":\\"b7f516798e7160eca15c50b62e588698937f8ecf3930efc42baa690ddc0c7a51b74e3e4b129859274ed272652bc47651c6b6effbddf4d72a3eb9d2ea657b64a833c9bdccb562e45d94f0cc1366154072f12d35290566a99a6f952cd234ca9259\\"}}}","networks":"{\\"ids\\":[],\\"entities\\":{},\\"currentNetworkId\\":\\"mainnet\\"}","onboarding":"{\\"hideSteps\\":true,\\"stepsStatus\\":{\\"Back up secret key\\":1,\\"Add some funds\\":0,\\"Explore apps\\":0,\\"Buy an NFT\\":0}}","settings":"{\\"userSelectedTheme\\":\\"system\\",\\"dismissedMessages\\":[]}","_persist":"{\\"version\\":1,\\"rehydrated\\":true}"}';

    const { page } = globalPage;

    await globalPage.page.waitForTimeout(1000);

    // Force wallet into old state format using Redux Persist serialization
    await page.evaluate(
      async state => chrome.storage.local.set({ ['persist:root']: state }),
      previousSerializedState
    );

    await page.waitForTimeout(1000);

    // Refresh to simulate user returning to app for first time since migration
    await globalPage.gotoNakedRoot(extensionId);

    await page.waitForTimeout(1000);

    // State now in new format
    const result = await page.evaluate(async () =>
      chrome.storage.local.get(['persist:root']).then(state => state['persist:root'])
    );

    // Assert that old values are present in unserialized format
    test
      .expect(result.softwareKeys.entities[assumedZeroFingerprint]?.encryptedSecretKey)
      .toEqual(demoEncryptedKey);

    test.expect(result.softwareKeys.salt).toEqual(demoSalt);

    // ledger is deleted by migration when ledger accounts exist, or never created if they don't
    test.expect(result.ledger).toBeUndefined();
  });

  test('Migration 2 --> 4', async ({ extensionId, globalPage }) => {
    const version2State = {
      _persist: { rehydrated: true, version: 2 },
      appPermissions: { entities: {}, ids: [] },
      chains: {
        stx: {
          default: {
            currentAccountIndex: 0,
            currentAccountStacksDescriptor:
              "[ef7bfd66/44'/5757'/0'/0/0]026c0e199cc820a1e9768ea27bfcce1e953a649140e20baec7731c617cfea15d93",
            highestAccountIndex: 3,
          },
        },
      },
      ledger: { bitcoin: { entities: {}, ids: [] }, stacks: { entities: {}, ids: [] } },
      manageTokens: { entities: {}, ids: [] },
      networks: { currentNetworkId: 'mainnet', entities: {}, ids: [] },
      ordinals: { entities: {}, ids: [] },
      settings: {
        discardedInscriptions: [],
        dismissedMessages: [],
        dismissedPromoIndexes: [],
        hasAllowedAnalytics: null,
        hasApprovedNewBrand: true,
        isNotificationsEnabled: true,
        userSelectedTheme: 'system',
      },
      softwareKeys: {
        entities: {
          default: {
            encryptedSecretKey: demoEncryptedKey,
            id: 'default',
            salt: demoSalt,
            type: 'software',
          },
        },
        ids: ['default'],
      },
    };

    const { page } = globalPage;

    await page.waitForTimeout(1000);

    await page.evaluate(
      async state => chrome.storage.local.set({ ['persist:root']: state }),
      version2State
    );

    await page.waitForTimeout(1000);

    await globalPage.gotoNakedRoot(extensionId);

    await page.waitForTimeout(1000);

    const result = await page.evaluate(async () =>
      chrome.storage.local.get(['persist:root']).then(state => state['persist:root'])
    );

    test.expect(result._persist.version).toEqual(4);
    test.expect(result.softwareKeys.salt).toEqual(demoSalt);
    test.expect(result.softwareKeys.entities.default).toBeUndefined();
    test.expect(result.softwareKeys.entities.ef7bfd66).toBeDefined();
    test.expect(result.softwareKeys.entities.ef7bfd66.encryptedSecretKey).toEqual(demoEncryptedKey);
    test.expect(result.softwareKeys.ids).toEqual(['ef7bfd66']);

    test.expect(result.active.account).toEqual({
      fingerprint: 'ef7bfd66',
      accountIndex: 0,
    });

    test.expect(result.wallets.entities.ef7bfd66).toEqual({
      fingerprint: 'ef7bfd66',
      name: 'Wallet 1',
      type: 'software',
      createdOn: null,
    });
    test.expect(result.wallets.ids).toEqual(['ef7bfd66']);

    test.expect(result.chains.stx.ef7bfd66).toBeDefined();
    test.expect(result.chains.stx.default).toBeUndefined();

    test.expect(result.onboarding).toBeUndefined();
    test.expect(result.ordinals).toBeUndefined();

    test.expect(result.ledger).toBeUndefined();
    test.expect(result.keychains).toBeDefined();

    // Migration 3 --> 4 materializes an account entity per derived account
    // index (highestAccountIndex 3 → accounts 0..3)
    test
      .expect(result.accounts.ids)
      .toEqual(['ef7bfd66/0', 'ef7bfd66/1', 'ef7bfd66/2', 'ef7bfd66/3']);
  });
});
