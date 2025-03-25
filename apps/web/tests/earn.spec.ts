import { expect } from '@playwright/test';

import { test } from '.';

test.describe('Earn page', () => {
  test('has title', async ({ page }) => {
    await page.goto('/earn');
    await expect(page.getByRole('heading', { name: 'Invest in Stacks' })).toBeVisible();
  });
});
