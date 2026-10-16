import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_STX_ADDRESS,
} from '@tests/mocks/constants';
import { mockLeatherBitcoinTransactions } from '@tests/mocks/mock-leather-btc-txs';
import {
  getTestSoftwareAccountDefaultWalletState,
  testFingerprint,
} from '@tests/page-object-models/onboarding.page';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { z } from 'zod';

import { test } from '../../fixtures/fixtures';

const comparableWalletStateSchema = z.looseObject({
  softwareKeys: z.looseObject({
    salt: z.string().optional(),
    entities: z.record(z.string(), z.looseObject({ encryptedSecretKey: z.string().optional() })),
  }),
  wallets: z.looseObject({
    entities: z.record(z.string(), z.looseObject({ createdOn: z.unknown().optional() })),
  }),
  chains: z.looseObject({
    stx: z.record(z.string(), z.looseObject({ highestAccountIndex: z.number().optional() })),
  }),
});

type ComparableWalletState = z.infer<typeof comparableWalletStateSchema>;

test.describe('Onboarding an existing user', () => {
  // Functionality is important for backwards compatibility with older wallet versions
  test.describe('Encryption key values', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      // clear local storage of web page with evaluate
      await globalPage.setupAndUseApiCalls(extensionId);
      await globalPage.page.evaluate(async () => {
        await chrome.storage.local.clear();
      });
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('that the encryption key is generated correctly against a known working value', async ({
      globalPage,
      homePage,
    }) => {
      await homePage.lock();
      await homePage.unlock();
      await homePage.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor();

      const encryptionKey = await globalPage.page.evaluate(async () => {
        const { encryptionKey } = await chrome.storage.session.get<{ encryptionKey?: string }>(
          'encryptionKey'
        );
        return encryptionKey;
      });

      test
        .expect(encryptionKey)
        .toEqual(
          'd904f412b8d116540017c302f3f7033813c95902af5a067c7befcc34fa5e5290709f157f80548603a1e4f8edc2c0d5d7'
        );
    });
  });

  test('going through the onboarding flow to sign in', async ({
    extensionId,
    globalPage,
    onboardingPage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInExistingUser();

    const persistedStore = await onboardingPage.page.evaluate(() =>
      window.debug.getPersistedStore()
    );
    const walletState = comparableWalletStateSchema.parse(persistedStore);

    const testWalletState: ComparableWalletState = getTestSoftwareAccountDefaultWalletState();

    // Deleting values that are known to differ at random
    delete walletState.softwareKeys.entities[testFingerprint].encryptedSecretKey;
    delete walletState.softwareKeys.salt;
    delete walletState.wallets.entities[testFingerprint].createdOn;
    delete testWalletState.softwareKeys.entities[testFingerprint].encryptedSecretKey;
    delete testWalletState.softwareKeys.salt;
    delete testWalletState.wallets.entities[testFingerprint].createdOn;
    // Don't test highest account index
    delete walletState.chains.stx[testFingerprint].highestAccountIndex;
    delete testWalletState.chains.stx[testFingerprint].highestAccountIndex;

    test.expect(walletState).toEqual(testWalletState);
  });

  test('mnemonic key validation: should show error for invalid mnemonic key words', async ({
    extensionId,
    globalPage,
    onboardingPage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // enter some invalid key
    const invalidKey = 'some incorrect data';
    await onboardingPage.signInMnemonicKey(invalidKey);
    const signInButton = onboardingPage.page.getByTestId(OnboardingSelectors.SignInBtn);
    const error = onboardingPage.page.getByText('Words 1 and 2 are incorrect or misspelled');
    await test.expect(error).toBeVisible();
    await test.expect(signInButton).toBeDisabled();
  });

  test('mnemonic key validation: should not show error  for valid mnemonic key words', async ({
    extensionId,
    globalPage,
    onboardingPage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // enter some key partial
    const validPartialKey = 'shoulder any pencil';
    await onboardingPage.signInMnemonicKey(validPartialKey);
    const signInSeedError = onboardingPage.page.getByTestId(OnboardingSelectors.SignInSeedError);
    await test.expect(signInSeedError).toBeHidden();
  });

  test('Activity tab', async ({ extensionId, globalPage, onboardingPage, homePage, page }) => {
    test.slow();
    await globalPage.setupAndUseApiCalls(extensionId);
    // Override balance mocks to return zero for new wallets, preventing
    // excessive account discovery that floods the Hiro rate limiter
    await page.route('**hiro.so/extended/v2/addresses/**/balances/stx', route =>
      route.fulfill({
        json: {
          balance: '0',
          total_miner_rewards_received: '0',
          lock_tx_id: '',
          locked: '0',
          lock_height: 0,
          burnchain_lock_height: 0,
          burnchain_unlock_height: 0,
        },
      })
    );
    await page.route('**hiro.so/extended/v2/addresses/**/balances/ft', route =>
      route.fulfill({ json: { limit: 100, offset: 0, total: 0, results: [] } })
    );
    await mockLeatherBitcoinTransactions(page, []);
    await globalPage.page.evaluate(async () => {
      await chrome.storage.local.clear();
    });
    await onboardingPage.signUpNewUser();
    await homePage.clickActivityTab();
    const noActivityText = page.getByText('No activity yet');
    await test.expect(noActivityText).toBeVisible({ timeout: 30_000 });
  });

  test.describe('Address generation', () => {
    test.describe.configure({ retries: 0 });

    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      test.slow();
      // clear local storage of web page with evaluate
      await globalPage.setupAndUseApiCalls(extensionId);
      await globalPage.page.evaluate(async () => {
        await chrome.storage.local.clear();
      });
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test.describe('Bitcoin', () => {
      test('that the wallet generates the correct Native Segwit address', async ({ homePage }) => {
        const nativeSegwitAddress = await homePage.getReceiveNativeSegwitAddress();
        test.expect(nativeSegwitAddress).toEqual(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS);
      });
    });

    test.describe('Stacks', () => {
      test('that restoring a wallet generates the correct stacks address', async ({ homePage }) => {
        const stacksAddress = await homePage.getReceiveStxAddress();
        test.expect(stacksAddress).toEqual(TEST_ACCOUNT_1_STX_ADDRESS);
      });
    });
  });
});
