import { type Locator, type Page, expect } from '@playwright/test';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { test } from '../../fixtures/fixtures';
import { CoreAssetSelectors } from '../../selectors/mocked-tokens.selectors';
import { TokenDetailsSelectors } from '../../selectors/token-details.selectors';

const scrolledOffset = 500;

function getScrollY(page: Page) {
  return page.evaluate(() => window.scrollY);
}

async function clickWithoutScrolling(locator: Locator) {
  await locator.evaluate(element => {
    if (element instanceof HTMLElement) element.click();
  });
}

test.describe('Scroll position', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, homePage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset).waitFor();
    await page.addStyleTag({
      content: 'html, body { overflow-anchor: none; } body { min-height: 4000px; }',
    });
    await page.evaluate(offset => window.scrollTo(0, offset), scrolledOffset);
    expect(await getScrollY(page)).toBe(scrolledOffset);
  });

  test('that token details opens scrolled to the top', async ({ homePage, page }) => {
    await clickWithoutScrolling(homePage.assetList.getByTestId(CoreAssetSelectors.BtcAsset));

    await expect(page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer)).toBeVisible();
    await expect.poll(() => getScrollY(page)).toBe(0);
  });

  test('that switching home tabs keeps the scroll position', async ({ page }) => {
    const activityTab = page.getByTestId(HomePageSelectors.ActivityTabBtn);
    await clickWithoutScrolling(activityTab);

    await expect(activityTab).toHaveAttribute('data-state', 'active');
    expect(await getScrollY(page)).toBe(scrolledOffset);
  });
});
