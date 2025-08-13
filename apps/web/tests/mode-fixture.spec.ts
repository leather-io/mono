import { expect } from '@playwright/test';

import { test } from './index';

test.describe('Mode fixture', () => {
  test('that wallet is uninstalled', async ({ page, mode }) => {
    await mode({ mode: 'uninstalled' });

    expect(await page.evaluate(() => (window as any).LeatherProvider)).toBeUndefined();
    await expect(page.getByRole('button', { name: 'Install' })).toBeVisible();
  });

  test('that mock mode is enabled, wallet installed', async ({ page, mode }) => {
    await mode({ mode: 'mock-installed' });

    const resp = await page.evaluate(() =>
      fetch('https://api.leather.io/v1/ping')
        .then(resp => resp.json())
        .catch(e => e)
    );
    test.expect(resp).toEqual({ success: 'mock-mode' });

    await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mock mode on' })).toBeVisible();
  });
});
