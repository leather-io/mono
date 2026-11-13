import { expect, test } from '@playwright/test';

import { LEATHER_DOCS } from '../app/constants/leather-docs';

const permanentRedirectStatus = 301;

const docsGuides = LEATHER_DOCS.guides;

// The help center and developers pages moved to Leather Docs (GitBook). Their old URLs, and the
// legacy help center URLs, 301 straight to their Leather Docs page.
const singleHopRedirects = [
  { from: '/developers', to: LEATHER_DOCS.developers },
  { from: '/support', to: docsGuides },
  { from: '/support/search?q=fees', to: `${docsGuides}?q=fees` },
  { from: '/support/install-leather', to: `${docsGuides}/get-started/install-leather` },
  { from: '/support/guide/install-leather', to: `${docsGuides}/get-started/install-leather` },
  { from: '/help-center', to: docsGuides },
  { from: '/help-center/', to: docsGuides },
  { from: '/help-center/guide/install-leather', to: `${docsGuides}/get-started/install-leather` },
  { from: '/help-center/install-leather', to: `${docsGuides}/get-started/install-leather` },
  { from: '/guides/send-stacks-from-app', to: `${docsGuides}/transactions/send-stx` },
  { from: '/posts/install-leather', to: `${docsGuides}/get-started/install-leather` },
  { from: '/posts/send-ordinals', to: `${docsGuides}/discontinued/ordinals-inscriptions` },
  { from: '/posts/api-sign-psbt', to: `${LEATHER_DOCS.developers}/bitcoin-methods/signpsbt` },
  // Posts and news are retired for the Leather Docs blog
  { from: '/posts', to: LEATHER_DOCS.blog },
  { from: '/news', to: LEATHER_DOCS.blog },
  { from: '/blog', to: LEATHER_DOCS.blog },
  { from: '/posts/earn-rewards-sbtc', to: `${LEATHER_DOCS.blog}/earn-rewards-sbtc` },
  { from: '/posts/how-roo-has-built-a-community-on-bitcoin', to: LEATHER_DOCS.blog },
  { from: '/posts/tokens-btc', to: LEATHER_DOCS.blog },
  { from: '/posts/no-such-post', to: LEATHER_DOCS.blog },
];

// Content that stays on leather.io, also in one hop
const onSiteRedirects = [
  { from: '/posts/apps-xlink', to: '/apps' },
  { from: '/posts/brotocol', to: '/apps' },
  { from: '/posts/privacy-policy', to: '/privacy-policy' },
  { from: '/posts/terms-of-service', to: '/terms' },
  { from: '/terms-of-service', to: '/terms' },
];

test.describe('Help center and developers redirects', () => {
  for (const { from, to } of singleHopRedirects) {
    test(`redirects ${from} to ${to} in one hop`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(permanentRedirectStatus);
      expect(response.headers()['location']).toBe(to);
    });
  }

  for (const { from, to } of onSiteRedirects) {
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
