import { expect } from '@playwright/test';
import { mockMainnetTestAccountEmptyUtxosRequests } from '@tests/mocks/mock-utxos';

import { test } from '../../fixtures/fixtures';
import { mockEmptyStacksBalancesRequest } from '../../mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '../../mocks/mock-stacks-balances-v2';
import { CoreAssetSelectors } from '../../selectors/mocked-tokens.selectors';
import { TokenDetailsSelectors } from '../../selectors/token-details.selectors';

test.describe('Tokens tab', () => {
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

  test.describe('Learn section', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('should show Learn section with all items', async ({ page }) => {
      const learn = page.getByTestId('tokens-learn');
      await expect(learn).toBeVisible();
      await expect(page.getByText('Getting Started with Leather')).toBeVisible();
      await expect(page.getByText('What is sBTC?')).toBeVisible();
      await expect(page.getByText('Learn more about stacking')).toBeVisible();
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

    test('that available balance shows zero state (buy button)', async ({ page }) => {
      const btcBuyButton = page.getByTestId(CoreAssetSelectors.BtcAssetBuyButton);
      const stxBuyButton = page.getByTestId(CoreAssetSelectors.StxAssetBuyButton);
      await expect(btcBuyButton).toBeVisible();
      await expect(stxBuyButton).toBeVisible();
    });

    test('that asset list is displayed', async ({ homePage }) => {
      await expect(homePage.assetList).toBeVisible();
    });

    test('that core assets BTC, STX, USDCx are always visible', async ({ homePage }) => {
      const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
      const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);

      await expect(btcAsset).toBeVisible();
      await expect(stxAsset).toBeVisible();
      await expect(usdcxAsset).toBeVisible();
    });

    test('that zero balance btc/stx assets display a buy button', async ({ homePage }) => {
      await expect(
        homePage.assetList.getByTestId(CoreAssetSelectors.BtcAssetBuyButton)
      ).toBeVisible();
      await expect(
        homePage.assetList.getByTestId(CoreAssetSelectors.StxAssetBuyButton)
      ).toBeVisible();
    });

    test('that clicking BTC deposit item navigates to token details', async ({
      homePage,
      page,
    }) => {
      const btcDepositItem = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
      await btcDepositItem.getByRole('button', { name: /bitcoin/i }).click();

      const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
      await expect(tokenDetailsContainer).toBeVisible();

      const title = page.getByTestId(TokenDetailsSelectors.TokenDetailsTitle);
      await expect(title).toHaveText('Bitcoin');
    });

    test('that clicking STX deposit item navigates to token details', async ({
      homePage,
      page,
    }) => {
      const stxDepositItem = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
      await stxDepositItem.getByRole('button', { name: /stacks/i }).click();

      const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
      await expect(tokenDetailsContainer).toBeVisible();

      const title = page.getByTestId(TokenDetailsSelectors.TokenDetailsTitle);
      await expect(title).toHaveText('Stacks');
    });
  });
});
