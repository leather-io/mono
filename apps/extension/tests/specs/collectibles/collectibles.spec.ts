import { expect } from '@playwright/test';
import {
  mockImageInscription,
  mockMainnetInscriptionsWithData,
  mockTextInscription,
} from '@tests/mocks/mock-collectibles';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Collectibles tab', () => {
  test.describe('Populated state', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockMainnetInscriptionsWithData(globalPage.page, [
        mockImageInscription,
        mockTextInscription,
      ]);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('should show collectible count in header', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await expect(page.getByText('Amount')).toBeVisible();
    });

    test('should show manage collectibles settings button', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const manageBtn = page.getByTestId('manage-collectibles-btn');
      await expect(manageBtn).toBeVisible();
    });

    test('should render inscription cards in grid', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const inscriptionCards = page.getByTestId('collectible-card-inscription');
      await expect(inscriptionCards.first()).toBeVisible();
    });
  });

  test.describe('Inscription hover menu', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockMainnetInscriptionsWithData(globalPage.page, [mockImageInscription]);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('should show "..." menu on inscription card hover', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const card = page.getByTestId('collectible-card-inscription').first();
      await expect(card).toBeVisible();
      await card.hover();

      const menuTrigger = page.getByTestId('inscription-card-menu-trigger');
      await expect(menuTrigger).toBeVisible();
    });

    test('should show Send option in dropdown', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const card = page.getByTestId('collectible-card-inscription').first();
      await card.hover();
      await page.getByTestId('inscription-card-menu-trigger').click();

      const sendItem = page.getByTestId('inscription-menu-send');
      await expect(sendItem).toBeVisible();
    });

    test('should show Open original option in dropdown', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const card = page.getByTestId('collectible-card-inscription').first();
      await card.hover();
      await page.getByTestId('inscription-card-menu-trigger').click();

      const openItem = page.getByTestId('inscription-menu-open-original');
      await expect(openItem).toBeVisible();
    });

    test('should show Unprotect option in dropdown', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const card = page.getByTestId('collectible-card-inscription').first();
      await card.hover();
      await page.getByTestId('inscription-card-menu-trigger').click();

      const unprotectItem = page.getByTestId('inscription-menu-unprotect');
      await expect(unprotectItem).toBeVisible();
    });

    test('should navigate to send flow when Send is clicked', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const card = page.getByTestId('collectible-card-inscription').first();
      await card.hover();
      await page.getByTestId('inscription-card-menu-trigger').click();
      await page.getByTestId('inscription-menu-send').click();

      await expect(page.getByTestId(HomePageSelectors.CollectiblesTabBtn)).toHaveAttribute(
        'data-state',
        'active'
      );
    });
  });

  test.describe('Settings menu', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockMainnetInscriptionsWithData(globalPage.page, [mockImageInscription]);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('should show Refresh option', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const manageBtn = page.getByTestId('manage-collectibles-btn');
      await expect(manageBtn).toBeVisible();
      await manageBtn.click();

      const refreshItem = page.getByTestId('refresh-collectibles');
      await expect(refreshItem).toBeVisible();
    });

    test('should show Recover all inscriptions option', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await page.getByTestId('manage-collectibles-btn').click();

      const recoverItem = page.getByTestId('recover-all-inscriptions');
      await expect(recoverItem).toBeVisible();
    });

    test('should show Unprotect all inscriptions option', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await page.getByTestId('manage-collectibles-btn').click();

      const unprotectItem = page.getByTestId('unprotect-all-inscriptions');
      await expect(unprotectItem).toBeVisible();
    });
  });
});
