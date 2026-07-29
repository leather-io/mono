import { expect, test } from '@playwright/test';

test.describe('Stacking to Staking Redirects', () => {
  test('redirects /stacking to /staking with 301 status', async ({ page }) => {
    const response = await page.goto('/stacking');

    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/staking');
    expect(page.url()).not.toContain('/stacking');
  });

  test('redirects /stacking/* paths to /staking/* preserving path', async ({ request }) => {
    const testPaths = [
      { from: '/stacking/pool/fast-pool', to: '/staking/pool/fast-pool' },
      { from: '/stacking/pool/fast-pool/active', to: '/staking/pool/fast-pool/active' },
      { from: '/stacking/liquid/lisa?cycle=100', to: '/staking/liquid/lisa?cycle=100' },
    ];

    for (const { from, to } of testPaths) {
      const response = await request.get(from, { maxRedirects: 0 });
      const location = response.headers()['location'] ?? '';

      expect(response.status()).toBe(301);
      expect(location).toContain(to);
      expect(location).not.toContain('/stacking');
    }
  });
});
