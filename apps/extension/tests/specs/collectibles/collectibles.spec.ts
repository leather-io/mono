import { expect } from '@playwright/test';
import {
  mockEmptyCollectibles,
  mockHtmlInscription,
  mockImageInscription,
  mockMainnetInscriptionsWithData,
  mockTextInscription,
} from '@tests/mocks/mock-collectibles';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Collectibles tab', () => {
  test.describe('Empty state', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockEmptyCollectibles(globalPage.page);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('should show "Get your first NFT" section', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const emptyState = page.getByTestId('collectibles-empty');
      await expect(emptyState).toBeVisible();
      await expect(page.getByText('Get your first NFT')).toBeVisible();
    });

    test('should show Register .btc domain item', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await expect(page.getByText('Register .btc domain')).toBeVisible();
      await expect(page.getByTestId('collectibles-empty-register-btc-domain')).toBeVisible();
    });

    test('should show Receive Stacks NFT item', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await expect(page.getByText('Receive Stacks NFT')).toBeVisible();
      await expect(page.getByTestId('collectibles-empty-receive-stacks-nft')).toBeVisible();
    });

    test('should show Discover Stacks NFTs item', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await expect(page.getByText('Discover Stacks NFTs')).toBeVisible();
      await expect(page.getByTestId('collectibles-empty-discover-stacks-nfts')).toBeVisible();
    });

    test('should show Learn section', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const learn = page.getByTestId('collectibles-learn');
      await expect(learn).toBeVisible();
      await expect(page.getByText('Getting Started with Leather')).toBeVisible();
      await expect(page.getByText('What are Bitcoin Ordinals?')).toBeVisible();
      await expect(page.getByText('Bitcoin NFTs: How Do They Work?')).toBeVisible();
    });
  });

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

    test('should show Learn section below grid', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const learn = page.getByTestId('collectibles-learn');
      await expect(learn).toBeVisible();
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

    test('should show Manage inscriptions option', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await page.getByTestId('manage-collectibles-btn').click();

      const manageItem = page.getByTestId(SettingsSelectors.ManageInscriptions);
      await expect(manageItem).toBeVisible();
    });
  });

  test.describe('Inscription protection', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockMainnetInscriptionsWithData(globalPage.page, [
        mockImageInscription,
        mockTextInscription,
        mockHtmlInscription,
      ]);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('stores all inscription IDs in state after discarding all', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await page.getByTestId('manage-collectibles-btn').click();
      await page.getByTestId(SettingsSelectors.ManageInscriptions).click();

      const sheet = page.getByTestId(SettingsSelectors.ManageInscriptionsSheet);
      await expect(sheet).toBeVisible();
      await page.getByTestId(SettingsSelectors.AllowSpendingBtn).click();
      await sheet.waitFor({ state: 'hidden' });

      const discardedInscriptions = await page.evaluate(async () => {
        const data = await chrome.storage.local.get(['persist:root']);
        return data['persist:root']?.settings?.discardedInscriptions ?? [];
      });

      expect(discardedInscriptions).toHaveLength(3);
      expect(discardedInscriptions).toEqual(
        expect.arrayContaining([
          mockImageInscription.satpoint,
          mockTextInscription.satpoint,
          mockHtmlInscription.satpoint,
        ])
      );
    });
  });

  test.describe('Unprotected label', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockMainnetInscriptionsWithData(globalPage.page, [
        mockImageInscription,
        mockTextInscription,
      ]);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('should not show unprotected label on protected inscriptions', async ({
      homePage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();

      await expect(page.getByTestId('collectible-card-inscription').first()).toBeVisible();
      await expect(page.getByTestId('inscription-unprotected-label')).toHaveCount(0);
    });

    test('should show unprotected label after discarding a single inscription', async ({
      homePage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();

      const card = page.getByTestId('collectible-card-inscription').first();
      await card.hover();
      await page.getByTestId('inscription-card-menu-trigger').click();
      await page.getByTestId('inscription-menu-unprotect').click();

      const label = page.getByTestId('inscription-unprotected-label');
      await expect(label).toBeVisible();
      await expect(label).toHaveCount(1);
    });

    test('should show unprotected label on all cards after unprotect all', async ({
      homePage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();

      await page.getByTestId('manage-collectibles-btn').click();
      await page.getByTestId(SettingsSelectors.ManageInscriptions).click();

      const sheet = page.getByTestId(SettingsSelectors.ManageInscriptionsSheet);
      await expect(sheet).toBeVisible();
      await page.getByTestId(SettingsSelectors.AllowSpendingBtn).click();
      await sheet.waitFor({ state: 'hidden' });

      const labels = page.getByTestId('inscription-unprotected-label');
      await expect(labels).toHaveCount(2);
    });

    test('should remove unprotected label after recovering an inscription', async ({
      homePage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();

      const card = page.getByTestId('collectible-card-inscription').first();
      await card.hover();
      await page.getByTestId('inscription-card-menu-trigger').click();
      await page.getByTestId('inscription-menu-unprotect').click();

      await expect(page.getByTestId('inscription-unprotected-label')).toBeVisible();

      await card.hover();
      await page.getByTestId('inscription-card-menu-trigger').click();
      await page.getByTestId('inscription-menu-protect').click();

      await expect(page.getByTestId('inscription-unprotected-label')).toHaveCount(0);
    });
  });
});
