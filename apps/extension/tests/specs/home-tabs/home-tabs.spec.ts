import { expect } from '@playwright/test';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Home tabs', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test.describe('tab navigation', () => {
    test('should display all three tabs', async ({ page }) => {
      const assetsTab = page.getByTestId(HomePageSelectors.AssetsTabBtn);
      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      const activityTab = page.getByTestId(HomePageSelectors.ActivityTabBtn);

      await expect(assetsTab).toBeVisible();
      await expect(collectiblesTab).toBeVisible();
      await expect(activityTab).toBeVisible();
    });

    test('should navigate to collectibles tab', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });

    test('should navigate to activity tab', async ({ homePage, page }) => {
      await homePage.clickActivityTab();

      const activityTab = page.getByTestId(HomePageSelectors.ActivityTabBtn);
      await expect(activityTab).toHaveAttribute('data-state', 'active');
    });

    test('should navigate back to assets tab', async ({ homePage, page }) => {
      await homePage.clickActivityTab();
      await homePage.clickAssetsTab();

      const assetsTab = page.getByTestId(HomePageSelectors.AssetsTabBtn);
      await expect(assetsTab).toHaveAttribute('data-state', 'active');
    });
  });

  test.describe('receive modal across tabs', () => {
    test('should open receive modal from assets tab', async ({ homePage, page }) => {
      await homePage.goToReceiveDialog();

      await expect(page.getByText('CHOOSE ASSET TO RECEIVE')).toBeVisible();
    });

    test('should open receive modal from collectibles tab', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();
      await homePage.goToReceiveDialog();

      await expect(page.getByText('CHOOSE ASSET TO RECEIVE')).toBeVisible();
    });

    test('should open receive modal from activity tab', async ({ homePage, page }) => {
      await homePage.clickActivityTab();
      await homePage.goToReceiveDialog();

      await expect(page.getByText('CHOOSE ASSET TO RECEIVE')).toBeVisible();
    });

    test('should preserve collectibles tab after closing receive modal', async ({
      homePage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();
      await homePage.goToReceiveDialog();

      const closeButton = page
        .locator('[aria-label="Close"]')
        .or(page.getByRole('button', { name: 'Close' }));
      await closeButton.first().click();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });

    test('should preserve activity tab after closing receive modal', async ({ homePage, page }) => {
      await homePage.clickActivityTab();
      await homePage.goToReceiveDialog();

      const closeButton = page
        .locator('[aria-label="Close"]')
        .or(page.getByRole('button', { name: 'Close' }));
      await closeButton.first().click();

      const activityTab = page.getByTestId(HomePageSelectors.ActivityTabBtn);
      await expect(activityTab).toHaveAttribute('data-state', 'active');
    });
  });
});
