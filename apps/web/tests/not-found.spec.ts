import { expect, test } from '@playwright/test';

test.describe('Not-found pages', () => {
  test('shows a changelog recovery link for a missing entry', async ({ page }) => {
    const response = await page.goto('/changelog/not-a-changelog-entry');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Changelog entry not found' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to changelog' }).click();
    await expect(page).toHaveURL(/\/changelog$/);
  });

  test('opens an existing changelog entry', async ({ request }) => {
    const response = await request.get('/changelog/usdcx-default-asset');

    expect(response.status()).toBe(200);
  });

  test('offers the homepage for an unknown site URL', async ({ page }) => {
    const response = await page.goto('/not-a-leather-page');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: 'Go to homepage' })).toHaveAttribute('href', '/');
  });
});
