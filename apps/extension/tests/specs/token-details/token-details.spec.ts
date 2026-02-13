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

      test('that receive modal opens from BTC token details', async ({ homePage, page }) => {
        const btcAsset = homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset);
        await btcAsset.click();

        const receiveButton = page.getByTestId(TokenDetailsSelectors.TokenDetailsReceiveButton);
        await receiveButton.click();

        await expect(page.getByText('RECEIVE BTC')).toBeVisible();
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

      test('that receive modal opens from STX token details', async ({ homePage, page }) => {
        const stxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.StxAsset);
        await stxAsset.click();

        const receiveButton = page.getByTestId(TokenDetailsSelectors.TokenDetailsReceiveButton);
        await receiveButton.click();

        await expect(page.getByText('RECEIVE STX')).toBeVisible();
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

      test('that receive modal opens from sBTC token details', async ({ homePage, page }) => {
        const sbtcAsset = homePage.assetList.getByTestId(MockedTokensSelectors.SbtcTokenTestId);
        await sbtcAsset.click();

        const receiveButton = page.getByTestId(TokenDetailsSelectors.TokenDetailsReceiveButton);
        await receiveButton.click();

        await expect(page.getByText('RECEIVE STX')).toBeVisible();
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

  test.describe('USDCx token details', () => {
    test.describe('populated wallet', () => {
      test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
        await globalPage.setupAndUseApiCalls(extensionId);
        await onboardingPage.signInWithTestAccount(extensionId);
      });

      test('that clicking USDCx opens token details', async ({ homePage, page }) => {
        const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);
        await usdcxAsset.click();

        const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
        await expect(tokenDetailsContainer).toBeVisible();
      });

      test('that token overview shows USDCx balance', async ({ homePage, page }) => {
        const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);
        await usdcxAsset.click();

        const overview = page.getByTestId(TokenDetailsSelectors.TokenOverview);
        await expect(overview).toBeVisible();

        const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
        await expect(amount).toBeVisible();
        const amountText = await amount.innerText();
        expect(amountText.toLowerCase()).toContain('usdcx');
      });

      test('that token details section shows USDCx info', async ({ homePage, page }) => {
        const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);
        await usdcxAsset.click();

        const name = page.getByTestId(TokenDetailsSelectors.TokenDetailsName);
        await expect(name).toBeVisible();
        await expect(name).toHaveText(/USDCx/);

        const layer = page.getByTestId(TokenDetailsSelectors.TokenDetailsLayer);
        await expect(layer).toHaveText(/Layer 2 \(Stacks\)/);

        const price = page.getByTestId(TokenDetailsSelectors.TokenDetailsPrice);
        await expect(price).toBeVisible();
      });

      test('that receive modal opens from USDCx token details', async ({ homePage, page }) => {
        const usdcxAsset = homePage.assetList.getByTestId(CoreAssetSelectors.UsdcxAsset);
        await usdcxAsset.click();

        const receiveButton = page.getByTestId(TokenDetailsSelectors.TokenDetailsReceiveButton);
        await receiveButton.click();

        await expect(page.getByText('RECEIVE STX')).toBeVisible();
      });
    });
  });

  test.describe('direct URL navigation', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('that navigating directly to BTC token URL loads token details', async ({
      homePage,
      page,
    }) => {
      await homePage.page.waitForSelector('[data-testid="BTC"]');
      await page.evaluate(() => {
        window.location.hash = '#/token/btc';
      });

      const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
      await expect(tokenDetailsContainer).toBeVisible();

      const title = page.getByTestId(TokenDetailsSelectors.TokenDetailsTitle);
      await expect(title).toHaveText('Bitcoin');
    });

    test('that navigating directly to STX token URL loads token details', async ({
      homePage,
      page,
    }) => {
      await homePage.page.waitForSelector('[data-testid="STX"]');
      await page.evaluate(() => {
        window.location.hash = '#/token/stx';
      });

      const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
      await expect(tokenDetailsContainer).toBeVisible();

      const title = page.getByTestId(TokenDetailsSelectors.TokenDetailsTitle);
      await expect(title).toHaveText('Stacks');
    });

    test('that navigating directly to sBTC token URL loads token details', async ({
      homePage,
      page,
    }) => {
      await homePage.page.waitForSelector('[data-testid="BTC"]');
      await page.evaluate(() => {
        window.location.hash =
          '#/token/sip10%7CSM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token%3A%3Asbtc-token';
      });

      const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
      await expect(tokenDetailsContainer).toBeVisible();
    });

    test('that navigating directly to aeUSDC token URL loads token details', async ({
      homePage,
      page,
    }) => {
      await homePage.page.waitForSelector('[data-testid="BTC"]');
      await page.evaluate(() => {
        window.location.hash =
          '#/token/sip10%7CSP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc%3A%3AaeUSDC';
      });

      const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
      await expect(tokenDetailsContainer).toBeVisible();
    });

    test('that navigating directly to USDCx token URL loads token details', async ({
      homePage,
      page,
    }) => {
      await homePage.page.waitForSelector('[data-testid="BTC"]');
      await page.evaluate(() => {
        window.location.hash =
          '#/token/sip10%7CSP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx%3A%3Ausdcx-token';
      });

      const tokenDetailsContainer = page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer);
      await expect(tokenDetailsContainer).toBeVisible();
    });
  });
});
