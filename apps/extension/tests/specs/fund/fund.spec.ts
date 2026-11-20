import { type Locator, expect } from '@playwright/test';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import {
  mockEmptyLeatherApiUtxosRequest,
  mockedOnramperWidgetSignature,
} from '@tests/mocks/mock-leather-api';
import { mockTestAccountStacksTxsRequestsWithPendingTx } from '@tests/mocks/mock-stacks-txs';
import { mockMainnetTestAccountEmptyUtxosRequests } from '@tests/mocks/mock-utxos';

import { test } from '../../fixtures/fixtures';
import { mockEmptyStacksBalancesRequest } from '../../mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '../../mocks/mock-stacks-balances-v2';
import { HomePageSelectors } from '../../selectors/home.selectors';
import { CoreAssetSelectors } from '../../selectors/mocked-tokens.selectors';

const onramperWidgetTitle = 'Onramper Widget';

async function expectSignedWidgetUrl(widget: Locator) {
  await expect(widget).toHaveAttribute('src', /^\?/);
  await expect(widget).toHaveAttribute('src', /[?&]sigV2=v2%3Amocked-signature(&|$)/);
  await expect(widget).toHaveAttribute(
    'src',
    new RegExp(`[?&]sigV2Timestamp=${mockedOnramperWidgetSignature.sigV2Timestamp}(&|$)`)
  );
  await expect(widget).toHaveAttribute(
    'src',
    new RegExp(`[?&]sigV2Nonce=${mockedOnramperWidgetSignature.sigV2Nonce}(&|$)`)
  );
  await expect(widget).toHaveAttribute('src', /[?&]sigV2Fields=apiKey%2Cmode%2Cwallets(&|$)/);
  await expect(widget).toHaveAttribute('src', /[?&]endUserIpHash=[0-9a-f]{64}(&|$)/);
  await expect(widget).toHaveAttribute('src', /[?&]platform=browser-extension(&|$)/);
  await expect(widget).not.toHaveAttribute('src', /[?&]signature=/);
}

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
      const widget = page.getByTitle(onramperWidgetTitle);
      await expectSignedWidgetUrl(widget);
      await expect(widget).toHaveAttribute('src', /[?&]mode=buy(&|$)/);
    });

    test('that BTC asset shows a buy button that forwards to fund page', async ({
      homePage,
      page,
    }) => {
      const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      const buyButton = btcAsset.getByTestId(CoreAssetSelectors.BtcAssetBuyButton);
      await buyButton.click();

      await expect(page).toHaveURL(/fund\/bitcoin/);
      const widget = page.getByTitle(onramperWidgetTitle);
      await expectSignedWidgetUrl(widget);
      await expect(widget).toHaveAttribute('src', /[?&]mode=buy(&|$)/);
    });

    test('that the fund page shows an error and retries when signing fails', async ({
      homePage,
      page,
    }) => {
      let signingRequests = 0;
      await page.route('**/v1/onramp/widget-signature', route => {
        signingRequests += 1;
        if (signingRequests === 1) return route.fulfill({ status: 500, json: {} });
        return route.fulfill({ json: mockedOnramperWidgetSignature });
      });
      const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      await btcAsset.getByTestId(CoreAssetSelectors.BtcAssetBuyButton).click();

      await expect(page.getByText("Couldn't load checkout")).toBeVisible();
      await expect(
        page.getByText('Something went wrong while preparing the checkout. Try again in a moment.')
      ).toBeVisible();
      await expect(page.getByTitle(onramperWidgetTitle)).toHaveCount(0);

      await page.getByRole('button', { name: 'Try again' }).click();

      await expectSignedWidgetUrl(page.getByTitle(onramperWidgetTitle));
      expect(signingRequests).toBe(2);
    });
  });

  test.describe('sell', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await overrideLaunchDarklyFlags(globalPage.page, { releaseOnramperSell: true });
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('that the sell page embeds a signed sell widget', async ({ page }) => {
      await page.getByTestId(HomePageSelectors.SellBtn).click();

      await expect(page).toHaveURL(/\/sell/);
      const widget = page.getByTitle(onramperWidgetTitle);
      await expectSignedWidgetUrl(widget);
      await expect(widget).toHaveAttribute('src', /[?&]mode=sell(&|$)/);
    });
  });
});
