import { expect, test } from '@playwright/test';

const permanentRedirectStatus = 301;

const preservedPaths = [
  { from: '/stacking/pool/fast-pool', to: '/staking/pool/fast-pool' },
  { from: '/stacking/pool/fast-pool/active', to: '/staking/pool/fast-pool/active' },
  { from: '/stacking/liquid/lisa?cycle=100', to: '/staking/liquid/lisa?cycle=100' },
];

test.describe('Stacking to Staking Redirects', () => {
  test('redirects /stacking to /staking with 301 status', async ({ page }) => {
    const response = await page.goto('/stacking');

    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/staking');
    expect(page.url()).not.toContain('/stacking');
  });

  for (const { from, to } of preservedPaths) {
    test(`redirects ${from} to ${to} preserving path`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      const location = response.headers()['location'] ?? '';

      expect(response.status()).toBe(permanentRedirectStatus);
      expect(location).toContain(to);
      expect(location).not.toContain('/stacking');
    });
  }
});
