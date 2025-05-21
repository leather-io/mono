import { expect } from '@playwright/test';

import { test } from '.';

test.describe('PostLabelHoverCard', () => {
  test('renders the label', async ({ page }) => {
    await page.goto('/hover-card-label'); // Adjust route as needed for your app
    await expect(page.getByText('Historical yield')).toBeVisible();
  });

  test('shows hover content on mouse over', async ({ page }) => {
    await page.goto('/hover-card-label'); // Adjust route as needed for your app
    await page.hover('text=Historical yield');
    await expect(page.getByText(/learn more/i)).toBeVisible();
  });

  test('handles missing postKey gracefully', async ({ page }) => {
    await page.goto('/hover-card-label-missing'); // Adjust route as needed for your app
    await expect(page.getByText('Unknown')).toBeVisible();
  });
});
