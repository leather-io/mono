import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Earn rewards with BTC' })).toBeVisible();
  });
});
