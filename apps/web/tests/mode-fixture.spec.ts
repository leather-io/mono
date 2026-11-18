import { expect } from '@playwright/test';

import { test } from './fixtures';

test.describe('Mode fixture', () => {
  test('that wallet is uninstalled', async ({ page, mode }) => {
    await mode({ mode: 'uninstalled' });

    expect(await page.evaluate(() => window.LeatherProvider)).toBeUndefined();
    await expect(page.getByRole('button', { name: 'Install' })).toBeVisible();
  });

  test('that mock mode is enabled, wallet installed', async ({ page, mode }) => {
    await mode({ mode: 'mock-installed' });

    const resp = await page.evaluate(async () => {
      try {
        const response = await fetch('https://api.leather.io/v1/ping');
        const body: unknown = await response.json();
        return body;
      } catch (e: unknown) {
        return e;
      }
    });
    test.expect(resp).toEqual({ success: 'mock-mode' });

    await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mock mode on' })).toBeVisible();
  });
});
