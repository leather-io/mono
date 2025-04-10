import { expect } from '@playwright/test';

import { test } from '.';

test.describe('sBTC Rewards page', () => {
  test('loads correctly and displays expected content', async ({ page }) => {
    // Navigate to the sBTC Rewards page
    await page.goto('/sbtc-rewards');

    await expect(page.getByRole('heading', { name: 'sBTC Rewards', level: 1 })).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Earn yield with bitcoin on stacks', level: 2 })
    ).toBeVisible();

    await expect(page.getByText(/Acquire BTC in the form of sBTC on Stacks/)).toBeVisible();

    await expect(page.getByRole('heading', { name: '1. Acquire sBTC', level: 3 })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Choose to bridge or swap', level: 3 })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: '2. Choose rewards protocol', level: 3 })
    ).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Basic sBTC rewards', level: 3 })).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Total Value Locked (TVL)', level: 4 }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Historical APR', level: 4 }).first()
    ).toBeVisible();
  });
});
