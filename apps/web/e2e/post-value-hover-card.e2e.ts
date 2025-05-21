import { expect, test } from '@playwright/test';

test.describe('PostValueHoverCard', () => {
  test('renders the value', async ({ page }) => {
    await page.goto('/hover-card-value'); // Adjust route as needed for your app
    await expect(page.getByText('5–8%')).toBeVisible();
  });

  test('shows hover content on mouse over', async ({ page }) => {
    await page.goto('/hover-card-value'); // Adjust route as needed for your app
    await page.hover('text=5–8%');
    await expect(page.getByText(/learn more/i)).toBeVisible();
  });

  test('handles missing postKey gracefully', async ({ page }) => {
    await page.goto('/hover-card-value-missing'); // Adjust route as needed for your app
    await expect(page.getByText('N/A')).toBeVisible();
  });
});
