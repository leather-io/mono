import { TEST_ACCOUNT_1_STX_ADDRESS, TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { mockMainnetTestAccountStacksConfirmedTxsRequests } from '@tests/mocks/mock-stacks-txs';
import type { HomePage } from '@tests/page-object-models/home.page';
import { makeLedgerTestAccountWalletState } from '@tests/page-object-models/onboarding.page';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { CoreAssetSelectors } from '@tests/selectors/mocked-tokens.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

const specs = {
  withBitcoinAndStacksKey: makeLedgerTestAccountWalletState(['bitcoin', 'stacks']),
  withStacksKeysOnly: makeLedgerTestAccountWalletState(['stacks']),
  withBitcoinKeysOnly: makeLedgerTestAccountWalletState(['bitcoin']),
};

async function interceptBitcoinRequests(homePage: HomePage) {
  const requestPromise = homePage.page.waitForRequest(/bestinslot|mempool\.space/, {
    timeout: 1000,
  });
  return requestPromise;
}

test.describe('App with Ledger', () => {
  for (const [testName, state] of Object.entries(specs)) {
    test.describe(testName, () => {
      test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
        await globalPage.setupAndUseApiCalls(extensionId);
        await onboardingPage.signInWithLedgerAccount(extensionId, state);
        await mockMainnetTestAccountStacksConfirmedTxsRequests(globalPage.page);
      });

      test('that homepage renders correctly', async ({ homePage }) => {
        await test.expect(homePage.page.locator('text="Send"').first()).toBeVisible();
        await test.expect(homePage.page.locator('text="Receive"').first()).toBeVisible();
        await test.expect(homePage.page.locator('text="Swap"').first()).toBeVisible();
      });

      test('receive modal opens', async ({ homePage }) => {
        await homePage.goToReceiveDialog();
        await test.expect(homePage.page.getByRole('dialog')).toBeVisible();
      });

      if (testName === 'withBitcoinAndStacksKey') {
        test('that all core assets are visible', async ({ homePage }) => {
          const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
          const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
          const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);

          await test.expect(btcAsset).toBeVisible();
          await test.expect(stxAsset).toBeVisible();
          await test.expect(usdcxAsset).toBeVisible();
        });
      }

      if (testName === 'withStacksKeysOnly') {
        test('that STX and USDCx are visible but Bitcoin shows connect', async ({ homePage }) => {
          const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
          const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);
          const connectBitcoin = homePage.assetList.getByTestId(
            CoreAssetSelectors.ConnectLedgerBitcoin
          );

          await test.expect(stxAsset).toBeVisible();
          await test.expect(usdcxAsset).toBeVisible();
          await test.expect(connectBitcoin).toBeVisible();
        });

        test('stacks address is shown by default', async ({ homePage }) => {
          const stacksAddress = await homePage.getReceiveStxAddress();
          test.expect(stacksAddress).toEqual(TEST_ACCOUNT_1_STX_ADDRESS);
        });

        test('there are no bitcoin requests', async ({ homePage }) => {
          const requestPromise = interceptBitcoinRequests(homePage);

          await homePage.page.getByTestId(SettingsSelectors.CurrentAccountDisplayName).click();

          await test
            .expect(async () => await test.expect(requestPromise).rejects.toThrowError())
            .toPass()
            .catch();
        });

        test('that you can switch accounts', async ({ homePage }) => {
          await homePage.switchAccount(1);
          const stacksAddress = await homePage.getReceiveStxAddress();
          test.expect(stacksAddress).toEqual(TEST_ACCOUNT_2_STX_ADDRESS);
        });

        test('that activity page loads without errors', async ({ homePage }) => {
          const errors: Error[] = [];
          const consoleErrors: string[] = [];

          homePage.page.on('pageerror', error => {
            errors.push(error);
          });

          homePage.page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(msg.text());
            }
          });

          await homePage.clickActivityTab();

          test.expect(homePage.page.url()).toContain('/activity');

          const activityList = homePage.page.getByTestId(ActivitySelectors.ActivityList);
          const noActivityText = homePage.page.getByText('No activity yet');

          await test.expect(activityList.or(noActivityText).first()).toBeVisible();

          test.expect(errors).toHaveLength(0);
          test.expect(consoleErrors).toHaveLength(0);
        });
      }

      if (testName === 'withBitcoinKeysOnly') {
        test('that BTC is visible, Stacks shows connect, and USDCx is hidden', async ({
          homePage,
        }) => {
          const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
          const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
          const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);
          const connectStacks = homePage.assetList.getByTestId(
            CoreAssetSelectors.ConnectLedgerStacks
          );

          await test.expect(btcAsset).toBeVisible();
          await test.expect(connectStacks).toBeVisible();
          await test.expect(stxAsset).not.toBeAttached();
          await test.expect(usdcxAsset).not.toBeAttached();
        });
      }

      test('that you can navigate to activity page', async ({ homePage }) => {
        await homePage.clickActivityTab();
        const noActivityText = homePage.page.getByText('No activity yet');
        // Account has activity to make sure we don't see label
        await test.expect(noActivityText).not.toBeVisible();
        test.expect(homePage.page.url()).toContain('/activity');
      });
    });
  }
});
