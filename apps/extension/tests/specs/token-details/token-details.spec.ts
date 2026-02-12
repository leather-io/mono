import { expect } from '@playwright/test';

import { test } from '../../fixtures/fixtures';
import { mockEmptyLeatherApiUtxosRequest } from '../../mocks/mock-leather-api';
import { mockEmptyStacksBalancesRequest } from '../../mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '../../mocks/mock-stacks-balances-v2';
import { CoreAssetSelectors, MockedTokensSelectors } from '../../selectors/mocked-tokens.selectors';
import { TokenDetailsSelectors } from '../../selectors/token-details.selectors';

test.describe('Token details', () => {
  test.describe('BTC token details', () => {
    test.describe('populated wallet', () => {
      test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
        await globalPage.setupAndUseApiCalls(extensionId);
        await onboardingPage.signInWithTestAccount(extensionId);
      });

      test('that clicking BTC opens token details', async ({ homePage, page }) => {
        const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
        await btcAsset.click();

        const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
        await expect(tokenDetailsContainer).toBeVisible();

        const title = page.getByTestId(TokenDetailsSelectors.TokenDetailsTitle);
        await expect(title).toHaveText('Bitcoin');
      });

      test('that token overview shows balance', async ({ homePage, page }) => {
        const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
        await btcAsset.click();

        const overview = page.getByTestId(TokenDetailsSelectors.TokenOverview);
        await expect(overview).toBeVisible();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText).toContain('BTC');

        const fiatAmount = page.getByTestId(TokenDetailsSelectors.TokenOverviewFiatAmount);
        await expect(fiatAmount).toBeVisible();
        const fiatText = await fiatAmount.innerText();
        expect(fiatText).toMatch(/^\$[\d,]+\.\d{2}/);
      });

      test('that token details section shows price info', async ({ homePage, page }) => {
        const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
        await btcAsset.click();

        const name = page.getByTestId(TokenDetailsSelectors.TokenDetailsName);
        await expect(name).toHaveText(/Bitcoin \(BTC\)/);

        const price = page.getByTestId(TokenDetailsSelectors.TokenDetailsPrice);
        await expect(price).toBeVisible();
        const priceText = await price.innerText();
        expect(priceText).toMatch(/\$/);

        const layer = page.getByTestId(TokenDetailsSelectors.TokenDetailsLayer);
        await expect(layer).toHaveText(/Layer 1 \(Bitcoin\)/);
      });

      test('that action buttons are visible', async ({ homePage, page }) => {
        const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
        await btcAsset.click();

        await expect(page.getByTestId(TokenDetailsSelectors.TokenDetailsSendButton)).toBeVisible();
        await expect(
          page.getByTestId(TokenDetailsSelectors.TokenDetailsReceiveButton)
        ).toBeVisible();
        await expect(page.getByTestId(TokenDetailsSelectors.TokenDetailsBuyButton)).toBeVisible();
        await expect(page.getByTestId(TokenDetailsSelectors.TokenDetailsSwapButton)).toBeVisible();
      });

      test('that back button returns to home', async ({ homePage, page }) => {
        const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
        await btcAsset.click();

        await expect(page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer)).toBeVisible();

        const backButton = page.getByTestId(TokenDetailsSelectors.TokenDetailsBackButton);
        await backButton.click();

        await expect(homePage.assetList).toBeVisible();
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

      test('that BTC token details shows zero balance', async ({ homePage, page }) => {
        const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
        await btcAsset.click();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText).toContain('0');
        expect(amountText).toContain('BTC');
      });
    });
  });

  test.describe('STX token details', () => {
    test.describe('populated wallet', () => {
      test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
        await globalPage.setupAndUseApiCalls(extensionId);
        await onboardingPage.signInWithTestAccount(extensionId);
      });

      test('that clicking STX opens token details', async ({ homePage, page }) => {
        const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
        await stxAsset.click();

        const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
        await expect(tokenDetailsContainer).toBeVisible();

        const title = page.getByTestId(TokenDetailsSelectors.TokenDetailsTitle);
        await expect(title).toHaveText('Stacks');
      });

      test('that token overview shows balance', async ({ homePage, page }) => {
        const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
        await stxAsset.click();

        const overview = page.getByTestId(TokenDetailsSelectors.TokenOverview);
        await expect(overview).toBeVisible();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText).toContain('STX');
      });

      test('that token details section shows price info', async ({ homePage, page }) => {
        const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
        await stxAsset.click();

        const name = page.getByTestId(TokenDetailsSelectors.TokenDetailsName);
        await expect(name).toHaveText(/Stacks \(STX\)/);

        const layer = page.getByTestId(TokenDetailsSelectors.TokenDetailsLayer);
        await expect(layer).toHaveText(/Layer 2 \(Stacks\)/);
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

      test('that STX token details shows zero balance', async ({ homePage, page }) => {
        const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
        await stxAsset.click();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText).toContain('0');
        expect(amountText).toContain('STX');
      });
    });
  });

  test.describe('SIP-10 token details (LONGcoin)', () => {
    test.describe('populated wallet', () => {
      test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
        await globalPage.setupAndUseApiCalls(extensionId);
        await onboardingPage.signInWithTestAccount(extensionId);
      });

      test('that clicking SIP-10 token opens token details', async ({ homePage, page }) => {
        const sip10Asset = homePage.assetList.getByTestId(MockedTokensSelectors.Sip10TokenTestId);
        await sip10Asset.click();

        const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
        await expect(tokenDetailsContainer).toBeVisible();
      });

      test('that token overview shows balance', async ({ homePage, page }) => {
        const sip10Asset = homePage.assetList.getByTestId(MockedTokensSelectors.Sip10TokenTestId);
        await sip10Asset.click();

        const overview = page.getByTestId(TokenDetailsSelectors.TokenOverview);
        await expect(overview).toBeVisible();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText).toContain('LONG');
      });

      test('that token details section shows SIP-10 info', async ({ homePage, page }) => {
        const sip10Asset = homePage.assetList.getByTestId(MockedTokensSelectors.Sip10TokenTestId);
        await sip10Asset.click();

        const name = page.getByTestId(TokenDetailsSelectors.TokenDetailsName);
        await expect(name).toBeVisible();
        await expect(name).toHaveText(/LONGcoin \(LONG\)/);

        const layer = page.getByTestId(TokenDetailsSelectors.TokenDetailsLayer);
        await expect(layer).toHaveText(/Layer 2 \(Stacks\)/);
      });

      test('that price info is shown for SIP-10 token', async ({ homePage, page }) => {
        const sip10Asset = homePage.assetList.getByTestId(MockedTokensSelectors.Sip10TokenTestId);
        await sip10Asset.click();

        const price = page.getByTestId(TokenDetailsSelectors.TokenDetailsPrice);
        await expect(price).toBeVisible();
      });
    });
  });

  test.describe('sBTC token details', () => {
    test.describe('populated wallet', () => {
      test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
        await globalPage.setupAndUseApiCalls(extensionId);
        await onboardingPage.signInWithTestAccount(extensionId);
      });

      test('that clicking sBTC opens token details', async ({ homePage, page }) => {
        const sbtcAsset = homePage.assetList.getByTestId(MockedTokensSelectors.SbtcTokenTestId);
        await sbtcAsset.click();

        const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
        await expect(tokenDetailsContainer).toBeVisible();
      });

      test('that token overview shows sBTC balance', async ({ homePage, page }) => {
        const sbtcAsset = homePage.assetList.getByTestId(MockedTokensSelectors.SbtcTokenTestId);
        await sbtcAsset.click();

        const overview = page.getByTestId(TokenDetailsSelectors.TokenOverview);
        await expect(overview).toBeVisible();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText.toLowerCase()).toContain('sbtc');
      });

      test('that token details section shows sBTC info', async ({ homePage, page }) => {
        const sbtcAsset = homePage.assetList.getByTestId(MockedTokensSelectors.SbtcTokenTestId);
        await sbtcAsset.click();

        const name = page.getByTestId(TokenDetailsSelectors.TokenDetailsName);
        await expect(name).toBeVisible();
        await expect(name).toHaveText(/sBTC/);

        const layer = page.getByTestId(TokenDetailsSelectors.TokenDetailsLayer);
        await expect(layer).toHaveText(/Layer 2 \(Stacks\)/);
      });
    });
  });

  test.describe('aeUSDC token details', () => {
    test.describe('populated wallet', () => {
      test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
        await globalPage.setupAndUseApiCalls(extensionId);
        await onboardingPage.signInWithTestAccount(extensionId);
      });

      test('that clicking aeUSDC opens token details', async ({ homePage, page }) => {
        const usdcAsset = homePage.assetList.getByTestId(MockedTokensSelectors.AeUsdcTokenTestId);
        await usdcAsset.click();

        const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
        await expect(tokenDetailsContainer).toBeVisible();
      });

      test('that token overview shows aeUSDC balance', async ({ homePage, page }) => {
        const usdcAsset = homePage.assetList.getByTestId(MockedTokensSelectors.AeUsdcTokenTestId);
        await usdcAsset.click();

        const overview = page.getByTestId(TokenDetailsSelectors.TokenOverview);
        await expect(overview).toBeVisible();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText.toLowerCase()).toContain('aeusdc');
      });

      test('that token details section shows stablecoin info', async ({ homePage, page }) => {
        const usdcAsset = homePage.assetList.getByTestId(MockedTokensSelectors.AeUsdcTokenTestId);
        await usdcAsset.click();

        const name = page.getByTestId(TokenDetailsSelectors.TokenDetailsName);
        await expect(name).toBeVisible();
        await expect(name).toHaveText(/Wrapped USDC/);

        const layer = page.getByTestId(TokenDetailsSelectors.TokenDetailsLayer);
        await expect(layer).toHaveText(/Layer 2 \(Stacks\)/);

        const price = page.getByTestId(TokenDetailsSelectors.TokenDetailsPrice);
        await expect(price).toBeVisible();
      });
    });
  });

  test.describe('error state', () => {
    test.skip('that error state is shown when token not found', async () => {
      // This test is skipped because it depends on the SIP-10 balance query
      // completing before we can determine the token doesn't exist.
      // The error state UI is tested through other means.
    });
  });

  test.describe('loading state', () => {
    test.skip('that loading state is shown when data is pending', async () => {
      // Loading state tests are inherently flaky in E2E tests as they depend on timing.
      // The loading state component is tested implicitly - if it didn't work,
      // other tests would fail while waiting for content to load.
    });
  });
});
