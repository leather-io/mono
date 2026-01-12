import { expect, test } from '@playwright/test';

test.describe('Help Center to Support Redirects', () => {
  test('redirects /help-center to /support with 301 status', async ({ page }) => {
    const response = await page.goto('/help-center');

    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/support');
    expect(page.url()).not.toContain('/help-center');
  });

  test('redirects /help-center/* paths to /support/* preserving full path', async ({ page }) => {
    const testPaths = [
      { from: '/help-center/getting-started', to: '/support/getting-started' },
      { from: '/help-center/guide/test-guide', to: '/support/guide/test-guide' },
      {
        from: '/help-center/guide/another?query=value#section',
        to: '/support/guide/another?query=value',
      },
    ];

    for (const { from, to } of testPaths) {
      await page.goto(from, { waitUntil: 'domcontentloaded' });

      expect(page.url()).toContain(to);
      expect(page.url()).not.toContain('/help-center');
    }
  });
});
