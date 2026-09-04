import { expect } from '@playwright/test';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import { mockStacksBroadcastTransaction } from '@tests/mocks/mock-stacks-txs';

import { test } from '../../fixtures/fixtures';

test.describe('Swap revamp', () => {
  test.beforeEach(async ({ extensionId, globalPage, homePage, onboardingPage, swapRevampPage }) => {
    test.setTimeout(120_000);

    await globalPage.setupAndUseApiCalls(extensionId);
    await mockStacksBroadcastTransaction(globalPage.page);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.swapButton.click();
    await swapRevampPage.waitForFormReady();
  });

  test('that it defaults to swapping STX', async ({ swapRevampPage }) => {
    await expect(swapRevampPage.selectedAssetSymbols.first()).toHaveText('STX');
  });

  test('that it swaps STX for aeUSDC end to end', async ({ swapRevampPage }) => {
    await swapRevampPage.selectTargetAsset('aeUSDC');
    await swapRevampPage.enterBaseAmount('1');
    await swapRevampPage.continueBtn.click();
    await swapRevampPage.reviewSummary.waitFor();

    await swapRevampPage.confirmBtn.click({ delay: 600 });

    await expect(swapRevampPage.submissionStatus).toHaveText('Swap initiated', {
      timeout: 15_000,
    });
    await swapRevampPage.page.waitForURL('**/activity');
  });

  test('that it preselects assets from the route params', async ({ swapRevampPage }) => {
    await swapRevampPage.page.goBack();
    await swapRevampPage.page.evaluate(() => {
      window.location.hash = '/swap/stacks/STX/aeUSDC';
    });
    await swapRevampPage.waitForFormReady();

    await expect(swapRevampPage.selectedAssetSymbols.first()).toHaveText('STX');
    await expect(swapRevampPage.selectedAssetSymbols.nth(1)).toHaveText('aeUSDC');
  });

  test('that BTC pairs are hidden while the sbtc bridging flag is off', async ({
    swapRevampPage,
  }) => {
    await swapRevampPage.baseAssetTrigger.click();
    await swapRevampPage.assetList.waitFor();
    await swapRevampPage.searchAssets('BTC');

    await expect(swapRevampPage.assetItemBySymbol('sBTC').first()).toBeVisible();
    await expect(swapRevampPage.assetItemBySymbol('BTC')).toHaveCount(0);
  });
});

test.describe('Swap revamp with sBTC bridging', () => {
  test.beforeEach(async ({ extensionId, globalPage, homePage, onboardingPage, swapRevampPage }) => {
    test.setTimeout(120_000);

    await globalPage.setupAndUseApiCalls(extensionId);
    await overrideLaunchDarklyFlags(globalPage.page, {
      swapSbtcBridging: true,
    });
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.swapButton.click();
    await swapRevampPage.waitForFormReady();
  });

  test('that BTC can be swapped to sBTC only', async ({ swapRevampPage }) => {
    await swapRevampPage.selectBaseAsset('BTC');

    await swapRevampPage.targetAssetTrigger.click();
    await swapRevampPage.assetList.waitFor();

    await expect(swapRevampPage.assetItemBySymbol('sBTC').first()).toBeVisible();
    await expect(swapRevampPage.assetItems).toHaveCount(1);
  });
});
