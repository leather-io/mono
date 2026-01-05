import { expect, test } from '@playwright/test';

test.describe('Homepage smoke test', () => {
  test('stacking page loads successfully', async ({ page }) => {
    await page.goto('/stacking');

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    const body = page.locator('body');
    await expect(body).toBeVisible();

    await expect(page.locator('html')).not.toBeEmpty();
  });
});
