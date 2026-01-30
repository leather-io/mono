import { expect } from '@playwright/test';

import { test } from '../../fixtures/fixtures';
import { mockEmptyBrc20TokensRequest } from '../../mocks/mock-brc20';
import { mockEmptyLeatherApiUtxosRequest } from '../../mocks/mock-leather-api';
import { mockEmptyRunesOutputsRequest } from '../../mocks/mock-runes';
import { mockEmptyStampchainRequest } from '../../mocks/mock-src20';
import { mockEmptyStacksBalancesRequest } from '../../mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '../../mocks/mock-stacks-balances-v2';
import { CoreAssetSelectors, MockedTokensSelectors } from '../../selectors/mocked-tokens.selectors';

test.describe('Manage tokens', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that supported sip10 token is shown', async ({ homePage }) => {
    await homePage.goToManageTokensPage();
    const sip10Token = homePage.manageTokensAssetsList.getByTestId(
      MockedTokensSelectors.Sip10TokenTestId
    );
    await expect(sip10Token).toBeAttached();
  });

  test('that core assets BTC, STX, USDCx cannot be toggled', async ({ homePage }) => {
    await homePage.goToManageTokensPage();

    const btcToggle = homePage.manageTokensAssetsList.getByTestId(CoreAssetSelectors.BtcAsset);
    const stxToggle = homePage.manageTokensAssetsList.getByTestId(CoreAssetSelectors.StxAsset);
    const usdcxToggle = homePage.manageTokensAssetsList.getByTestId(CoreAssetSelectors.UsdcxAsset);

    await expect(btcToggle).not.toBeAttached();
    await expect(stxToggle).not.toBeAttached();
    await expect(usdcxToggle).not.toBeAttached();
  });

  test('that token can be removed from asset list and added back', async ({ homePage }) => {
    await homePage.goToManageTokensPage();

    const sip10TokenInManageTokensList = homePage.manageTokensAssetsList.getByTestId(
      MockedTokensSelectors.Sip10TokenTestId
    );
    const brc20InManageTokensList = homePage.manageTokensAssetsList.getByTestId(
      MockedTokensSelectors.Brc20TokenTestId
    );
    const src20InManageTokensList = homePage.manageTokensAssetsList.getByTestId(
      MockedTokensSelectors.Src20TokenTestId
    );

    await sip10TokenInManageTokensList.click();
    await brc20InManageTokensList.click();
    await src20InManageTokensList.click();

    await homePage.goBackFromManageTokens();

    const sip10InAssetList = homePage.assetList.getByTestId(MockedTokensSelectors.Sip10TokenTestId);
    const brc20InAssetList = homePage.assetList.getByTestId(MockedTokensSelectors.Brc20TokenTestId);
    const src20InAssetList = homePage.assetList.getByTestId(MockedTokensSelectors.Src20TokenTestId);
    const runeInAssetList = homePage.assetList.getByTestId(MockedTokensSelectors.RuneTokenTestId);

    await expect(sip10InAssetList).not.toBeAttached();
    await expect(brc20InAssetList).not.toBeAttached();
    await expect(src20InAssetList).not.toBeAttached();
    await expect(runeInAssetList).not.toBeAttached();

    await homePage.goToManageTokensPage();

    const sip10Toggle = homePage.manageTokensAssetsList.getByTestId(
      MockedTokensSelectors.Sip10TokenTestId
    );
    const brc20Toggle = homePage.manageTokensAssetsList.getByTestId(
      MockedTokensSelectors.Brc20TokenTestId
    );
    const src20Toggle = homePage.manageTokensAssetsList.getByTestId(
      MockedTokensSelectors.Src20TokenTestId
    );

    await sip10Toggle.click();
    await brc20Toggle.click();
    await src20Toggle.click();

    await homePage.goBackFromManageTokens();

    await expect(sip10InAssetList).toBeAttached();
    await expect(brc20InAssetList).toBeAttached();
    await expect(src20InAssetList).toBeAttached();
  });
});

test.describe('Manage tokens empty wallet', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockEmptyStacksBalancesRequest(page);
    await mockEmptyStacksBalancesV2Request(page);
    await mockEmptyBrc20TokensRequest(page);
    await mockEmptyStampchainRequest(page);
    await mockEmptyRunesOutputsRequest(page);
    await mockEmptyLeatherApiUtxosRequest(page);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that empty state shows no tokens found', async ({ homePage, page }) => {
    await homePage.goToManageTokensPage();

    const noTokensText = page.getByText('No tokens found');
    await expect(noTokensText).toBeVisible();
  });
});
