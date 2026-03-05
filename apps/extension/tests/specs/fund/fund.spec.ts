import { expect } from '@playwright/test';
import { mockEmptyLeatherApiUtxosRequest } from '@tests/mocks/mock-leather-api';
import { mockTestAccountStacksTxsRequestsWithPendingTx } from '@tests/mocks/mock-stacks-txs';
import { mockMainnetTestAccountEmptyUtxosRequests } from '@tests/mocks/mock-utxos';

import { test } from '../../fixtures/fixtures';
import { mockEmptyStacksBalancesRequest } from '../../mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '../../mocks/mock-stacks-balances-v2';
import { CoreAssetSelectors } from '../../selectors/mocked-tokens.selectors';

test.describe('Fund', () => {
  test.describe('wallet with activity', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockEmptyStacksBalancesRequest(page);
      await mockEmptyStacksBalancesV2Request(page);
      await mockTestAccountStacksTxsRequestsWithPendingTx(page);
      await mockEmptyLeatherApiUtxosRequest(page);
      await onboardingPage.signInWithTestAccount(extensionId);
    });
    test('that STX asset shows $0.00 if STX has activity', async ({ homePage }) => {
      const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);

      await expect(btcAsset).toContainText('$0.00');
      await expect(stxAsset).toContainText('$0.00');
    });
  });
  test.describe('empty wallet', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockEmptyStacksBalancesRequest(page);
      await mockEmptyStacksBalancesV2Request(page);
      await mockMainnetTestAccountEmptyUtxosRequests(page);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('that STX asset shows a buy button that forwards to fund page', async ({
      homePage,
      page,
    }) => {
      const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
      const buyButton = stxAsset.getByTestId(CoreAssetSelectors.StxAssetBuyButton);
      await buyButton.click();

      await expect(page).toHaveURL(/fund\/stacks/);
    });
    test('that BTC asset shows a buy button that forwards to fund page', async ({
      homePage,
      page,
    }) => {
      const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      const buyButton = btcAsset.getByTestId(CoreAssetSelectors.BtcAssetBuyButton);
      await buyButton.click();

      await expect(page).toHaveURL(/fund\/bitcoin/);
    });
  });
});
