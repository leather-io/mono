import { expect } from '@playwright/test';
import {
  mockImageInscription,
  mockMainnetInscriptionsWithData,
} from '@tests/mocks/mock-collectibles';

import { test } from '../../fixtures/fixtures';

test.describe('Collectible details', () => {
  test.describe('Inscription details', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockMainnetInscriptionsWithData(globalPage.page, [mockImageInscription]);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('should navigate to inscription details when clicking card', async ({
      homePage,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();
      await expect(collectibleDetailsPage.container).toBeVisible();
    });

    test('should show back button on details page', async ({
      homePage,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();
      await expect(collectibleDetailsPage.backButton).toBeVisible();
    });

    test('should navigate back when clicking back button', async ({
      homePage,
      page,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();
      await collectibleDetailsPage.clickBack();

      const card = page.getByTestId('collectible-card-inscription');
      await expect(card.first()).toBeVisible();
    });

    test('should show Send in options menu', async ({ homePage, page, collectibleDetailsPage }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();
      await collectibleDetailsPage.openOptionsMenu();
      await expect(page.getByTestId('collectible-send-menu-item')).toBeVisible();
    });

    test('should show options menu button', async ({ homePage, collectibleDetailsPage }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();
      await expect(collectibleDetailsPage.optionsButton).toBeVisible();
    });

    test('should show View original in options menu', async ({
      homePage,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();
      await collectibleDetailsPage.openOptionsMenu();
      await expect(collectibleDetailsPage.viewOriginalMenuItem).toBeVisible();
    });

    test('should show Unprotect in options menu for protected inscription', async ({
      homePage,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();
      await collectibleDetailsPage.openOptionsMenu();
      await expect(collectibleDetailsPage.unprotectMenuItem).toBeVisible();
    });

    test('should show Details section with Layer and Protocol rows', async ({
      homePage,
      page,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();

      await expect(page.getByText('Details', { exact: true })).toBeVisible();
      await expect(page.getByText('Layer', { exact: true })).toBeVisible();
      await expect(page.getByText('Layer 1 (Bitcoin)')).toBeVisible();
      await expect(page.getByText('Protocol')).toBeVisible();
      await expect(page.getByText('Ordinals')).toBeVisible();
    });

    test('should show Sats in UTXO row when inscription has output value', async ({
      homePage,
      page,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();

      await expect(page.getByText('Sats in UTXO')).toBeVisible();
    });

    test('should toggle protection status from details page', async ({
      homePage,
      collectibleDetailsPage,
    }) => {
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.waitForDetailsPage();

      await collectibleDetailsPage.clickUnprotect();

      await collectibleDetailsPage.openOptionsMenu();
      await expect(collectibleDetailsPage.protectMenuItem).toBeVisible();

      await collectibleDetailsPage.clickProtect();

      await collectibleDetailsPage.openOptionsMenu();
      await expect(collectibleDetailsPage.unprotectMenuItem).toBeVisible();
    });
  });
});
