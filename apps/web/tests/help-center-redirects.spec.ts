import { expect, test } from '@playwright/test';

const permanentRedirectStatus = 301;

const preservedPaths = [
  { from: '/help-center/getting-started', to: '/support/getting-started' },
  { from: '/help-center/guide/test-guide', to: '/support/guide/test-guide' },
  {
    from: '/help-center/guide/another?query=value',
    to: '/support/guide/another?query=value',
  },
];

test.describe('Help Center to Support Redirects', () => {
  test('redirects /help-center to /support with 301 status', async ({ page }) => {
    const response = await page.goto('/help-center');

    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/support');
    expect(page.url()).not.toContain('/help-center');
  });

  for (const { from, to } of preservedPaths) {
    test(`redirects ${from} to ${to} preserving path`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      const location = response.headers()['location'] ?? '';

      expect(response.status()).toBe(permanentRedirectStatus);
      expect(location).toContain(to);
      expect(location).not.toContain('/help-center');
    });
  }

  test('redirects /support/guide/:slug to /support/:slug', async ({ request }) => {
    const response = await request.get('/support/guide/test-guide', { maxRedirects: 0 });
    const location = response.headers()['location'] ?? '';

    expect(response.status()).toBe(permanentRedirectStatus);
    expect(location).toContain('/support/test-guide');
    expect(location).not.toContain('/support/guide/');
  });
});
