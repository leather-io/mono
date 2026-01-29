import { expect } from '@playwright/test';

import { test } from '../../fixtures/fixtures';
import { mockEmptyLeatherApiUtxosRequest } from '../../mocks/mock-leather-api';
import { mockEmptyStacksBalancesRequest } from '../../mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '../../mocks/mock-stacks-balances-v2';
import { CoreAssetSelectors } from '../../selectors/mocked-tokens.selectors';

test.describe('Assets tab', () => {
  test.describe('populated wallet', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('that available balance is displayed', async ({ homePage }) => {
      await expect(homePage.availableBalance).toBeVisible();
      const balanceText = await homePage.availableBalance.innerText();
      expect(balanceText).toMatch(/^\$[\d,]+\.\d{2}$/);
    });

    test('that asset list is displayed', async ({ homePage }) => {
      await expect(homePage.assetList).toBeVisible();
    });

    test('that manage tokens button opens sheet', async ({ homePage, page }) => {
      await homePage.manageTokensBtn.click();
      await expect(homePage.manageTokensAssetsList).toBeVisible();
      const sheetHeader = page.getByText('Manage tokens');
      await expect(sheetHeader).toBeVisible();
    });

    test('that core assets BTC, STX, USDCx are always visible', async ({ homePage }) => {
      const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
      const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);

      await expect(btcAsset).toBeVisible();
      await expect(stxAsset).toBeVisible();
      await expect(usdcxAsset).toBeVisible();
    });
  });

  test.describe('empty wallet', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockEmptyStacksBalancesRequest(page);
      await mockEmptyStacksBalancesV2Request(page);
      await mockEmptyLeatherApiUtxosRequest(page);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('that available balance shows zero state', async ({ homePage }) => {
      await expect(homePage.availableBalance).toBeVisible();
      const balanceText = await homePage.availableBalance.innerText();
      expect(balanceText).toBe('$0.00');
    });

    test('that asset list is displayed', async ({ homePage }) => {
      await expect(homePage.assetList).toBeVisible();
    });

    test('that manage tokens button is visible', async ({ homePage }) => {
      await expect(homePage.manageTokensBtn).toBeVisible();
    });

    test('that core assets BTC, STX, USDCx are always visible', async ({ homePage }) => {
      const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
      const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);

      await expect(btcAsset).toBeVisible();
      await expect(stxAsset).toBeVisible();
      await expect(usdcxAsset).toBeVisible();
    });
  });
});
