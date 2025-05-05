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
});
