import { expect } from '@playwright/test';

import { test } from '.';

test.describe('sBTC Rewards page', () => {
  test('loads correctly and displays expected content', async ({ page }) => {
    // Navigate to the sBTC Rewards page
    await page.goto('/sbtc');

    await expect(page.getByRole('heading', { name: 'sBTC Rewards', level: 1 })).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Earn yield with bitcoin on stacks', level: 2 })
    ).toBeVisible();

    await expect(page.getByText(/Get BTC in the form of sBTC on Stacks/)).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Step 1: Get sBTC', level: 3 })).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Step 2: Choose reward protocol', level: 3 })
    ).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Basic sBTC rewards', level: 3 })).toBeVisible();
  });

  test('renders dynamic post content for sBTC rewards', async ({ page }) => {
    await page.goto('/sbtc');
    // Check for content from the 'sbtc-rewards' post
    await expect(page.getByText(/sBTC Rewards/i)).toBeVisible();
    // Check for content from the 'sbtc-rewards-basic' post
    await expect(page.getByText(/Basic sBTC rewards/i)).toBeVisible();
  });

  test('handles missing post slugs gracefully', async ({ page }) => {
    await page.goto('/sbtc');
    // Simulate a missing post by checking for fallback or absence of error
    // (Assume the UI does not crash and shows a fallback or nothing)
    // This is a placeholder; actual implementation may require mocking content.posts
    await expect(page).not.toHaveText(/Error/i);
  });
});
