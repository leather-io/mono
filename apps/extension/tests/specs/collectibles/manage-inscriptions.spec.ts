import { expect } from '@playwright/test';
import { TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS } from '@tests/mocks/constants';
import { mockTestnetTestAccountInscriptionsRequests } from '@tests/mocks/mock-inscriptions-bis';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { mockInscriptionResponse3 } from '@leather.io/query';

import { test } from '../../fixtures/fixtures';

const mockInscriptionResp = {
  ...mockInscriptionResponse3,
  owner_wallet_addr: TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
};

test.describe('Manage inscriptions', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test.describe('manage inscriptions sheet', () => {
    test.beforeEach(async ({ globalPage }) => {
      await mockTestnetTestAccountInscriptionsRequests(globalPage.page, [mockInscriptionResp]);
    });

    test('should open manage inscriptions sheet', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();
      await page.getByTestId('manage-collectibles-btn').click();
      await page.getByTestId(SettingsSelectors.ManageInscriptions).click();

      const sheet = page.getByTestId(SettingsSelectors.ManageInscriptionsSheet);
      await expect(sheet).toBeVisible();
    });

    test('should display reset protection button', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();
      await page.getByTestId('manage-collectibles-btn').click();
      await page.getByTestId(SettingsSelectors.ManageInscriptions).click();

      const button = page.getByTestId(SettingsSelectors.ResetProtectionBtn);
      await expect(button).toBeVisible();
    });

    test('should display allow spending button', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();
      await page.getByTestId('manage-collectibles-btn').click();
      await page.getByTestId(SettingsSelectors.ManageInscriptions).click();

      const button = page.getByTestId(SettingsSelectors.AllowSpendingBtn);
      await expect(button).toBeVisible();
    });

    test('should close sheet when clicking close button', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();
      await page.getByTestId('manage-collectibles-btn').click();
      await page.getByTestId(SettingsSelectors.ManageInscriptions).click();

      const sheet = page.getByTestId(SettingsSelectors.ManageInscriptionsSheet);
      await expect(sheet).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(sheet).not.toBeVisible();
    });
  });

  test.describe('protection state persistence', () => {
    test.beforeEach(async ({ globalPage }) => {
      await mockTestnetTestAccountInscriptionsRequests(globalPage.page, [mockInscriptionResp]);
    });

    test.skip('should persist protection state after closing sheet', async ({
      page,
      networkPage,
      homePage,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.openOptionsMenu();

      const unprotectItem = page.getByTestId('unprotect-menu-item');
      await expect(unprotectItem).toBeVisible();
      await unprotectItem.click();

      await collectibleDetailsPage.openOptionsMenu();

      const protectItem = page.getByTestId('protect-menu-item');
      await expect(protectItem).toBeVisible();
    });
  });
});
