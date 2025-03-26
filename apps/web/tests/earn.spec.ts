import { expect } from '@playwright/test';

import { test } from '.';

test.describe('Stacking page', () => {
  test('has title', async ({ page }) => {
    await page.goto('/stacking');
    await expect(page.getByRole('heading', { name: 'Invest in Stacks' })).toBeVisible();
  });
});
