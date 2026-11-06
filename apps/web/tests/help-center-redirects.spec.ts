import { expect, test } from '@playwright/test';

const permanentRedirectStatus = 301;

// Legacy help center and support URLs resolve to their final URL in a single hop.
const singleHopRedirects = [
  { from: '/help-center/guide/install-leather', to: '/support/install-leather' },
  { from: '/help-center/install-leather', to: '/support/install-leather' },
  {
    from: '/help-center/guide/what-is-stacks?query=value',
    to: '/posts/what-is-stacks?query=value',
  },
  { from: '/help-center/search?q=fees', to: '/support/search?q=fees' },
  { from: '/help-center/', to: '/support' },
  { from: '/guides/send-stacks-from-app', to: '/support/send-stx' },
  { from: '/support/guide/install-leather', to: '/support/install-leather' },
  { from: '/support/guide/what-is-stacks', to: '/posts/what-is-stacks' },
  { from: '/support/what-is-stacks', to: '/posts/what-is-stacks' },
  { from: '/posts/install-leather', to: '/support/install-leather' },
  {
    from: '/posts/send-ordinals',
    to: '/posts/deprecation-of-ordinals-inscriptions-support-in-leather',
  },
  { from: '/posts/apps-xlink', to: '/posts/brotocol' },
];

test.describe('Help Center to Support Redirects', () => {
  test('redirects /help-center to /support with 301 status', async ({ page }) => {
    const response = await page.goto('/help-center');

    expect(response?.status()).toBe(200);
    expect(page.url()).toContain('/support');
    expect(page.url()).not.toContain('/help-center');
  });

  for (const { from, to } of singleHopRedirects) {
    test(`redirects ${from} to ${to} in one hop`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(permanentRedirectStatus);
      const destination = new URL(response.headers()['location'], response.url());
      expect(destination.href).toBe(new URL(to, response.url()).href);

      const target = await request.get(destination.href, { maxRedirects: 0 });
      expect(target.status()).toBe(200);
    });
  }

  for (const path of [
    '/posts/no-such-post',
    '/support/no-such-guide',
    '/support/guide/no-such-guide',
    '/help-center/a/b',
  ]) {
    test(`returns 404 for ${path}`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(404);
    });
  }
});
