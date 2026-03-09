import { expect } from '@playwright/test';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Trending tokens', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that clicking a trending token navigates to token details', async ({ page }) => {
    const trendingSection = page.getByText('Trending tokens');
    await trendingSection.waitFor();

    const trendingToken = page.getByTestId(new RegExp(HomePageSelectors.TrendingToken)).first();
    await expect(trendingToken).toBeVisible();
    await trendingToken.click();

    await page.waitForURL(/\/token\//);
  });
});
