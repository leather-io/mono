import { describe, expect, test, vi } from 'vitest';
import { LEATHER_DOCS } from '~/constants/leather-docs';
import {
  LEATHER_DOCS_BLOG_PAGES,
  LEATHER_DOCS_GUIDE_PAGES,
  LEATHER_DOCS_RENAMED_PAGES,
} from '~/constants/leather-docs-pages';

import {
  type ContentFetchers,
  redirectContentSlug,
  redirectPostSlug,
  resolveContentSlug,
} from './content-slug-resolver';
import { getLegacyContentEntries } from './legacy-content-redirects';
import { legacyPathRedirectLoader } from './legacy-path-redirect-loader';
import { guidesWildcardLoader, helpCenterWildcardLoader } from './legacy-prefix-redirects';
import { getDeprecationTarget } from './shared-redirect-logic';

vi.mock('~/constants/cms-client', () => ({ cmsClient: { fetch: vi.fn() } }));

const postOnlySlug = 'gearing-up-for-2024-with-leather';
const guideOnlySlug = 'leather-password-strength-guide';
const guideAndPostSlug = 'receive-btc';
const deprecatedSlug = 'send-ordinals';
const ordinalsDeprecationPath = `${LEATHER_DOCS.guides}/discontinued/ordinals-inscriptions`;

const docsGuides = LEATHER_DOCS.guides;
// Guide pages on Leather Docs, for slugs used below
const docsReceiveBtc = `${docsGuides}/transactions/receive-btc`;
const docsInstallLeather = `${docsGuides}/get-started/install-leather`;
const docsSendStx = `${docsGuides}/transactions/send-stx`;
const docsSecureSecretKey = `${docsGuides}/wallet-and-security/secure-secret-key`;
const docsWhatIsStacks = `${docsGuides}/learn/what-is-stacks`;
const docsBlog = LEATHER_DOCS.blog;

function createFetchers(content: { posts?: string[]; guides?: string[] } = {}) {
  const posts = new Set([postOnlySlug, guideAndPostSlug, ...(content.posts ?? [])]);
  const guides = new Set([guideOnlySlug, guideAndPostSlug, ...(content.guides ?? [])]);
  return {
    hasPost: vi.fn((slug: string) => Promise.resolve(posts.has(slug))),
    hasGuide: vi.fn((slug: string) => Promise.resolve(guides.has(slug))),
  } satisfies ContentFetchers;
}

function request(path: string) {
  return new Request(`https://leather.io${path}`);
}

// Loaders throw either a redirect `Response` or a `data()` error payload.
async function captureThrown(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (thrown) {
    if (thrown instanceof Response) {
      return { status: thrown.status, location: thrown.headers.get('Location') };
    }
    // `data()` payloads carry their status on `init`
    const init: unknown =
      typeof thrown === 'object' && thrown && 'init' in thrown ? thrown.init : null;
    const status = typeof init === 'object' && init && 'status' in init ? init.status : undefined;
    return { status, location: null };
  }
  throw new Error('Expected loader to throw');
}

describe('resolveContentSlug', () => {
  test('sends a post with a page on the Leather Docs blog to that page', async () => {
    const resolution = await resolveContentSlug(postOnlySlug, createFetchers());
    expect(resolution).toEqual({ kind: 'redirect', location: `${docsBlog}/${postOnlySlug}` });
  });

  test('sends any other Sanity post to the Leather Docs blog', async () => {
    const slug = 'how-roo-has-built-a-community-on-bitcoin';
    const resolution = await resolveContentSlug(slug, createFetchers({ posts: [slug] }));
    expect(resolution).toEqual({ kind: 'redirect', location: docsBlog });
  });

  test('sends app posts to /apps and legal posts to their page', async () => {
    expect(await resolveContentSlug('arkadiko', createFetchers())).toEqual({
      kind: 'redirect',
      location: '/apps',
    });
    expect(await resolveContentSlug('privacy-policy', createFetchers())).toEqual({
      kind: 'redirect',
      location: '/privacy-policy',
    });
    expect(await resolveContentSlug('terms-of-service', createFetchers())).toEqual({
      kind: 'redirect',
      location: '/terms',
    });
  });

  test('prefers the guide on Leather Docs when a post shares its slug', async () => {
    const resolution = await resolveContentSlug(guideAndPostSlug, createFetchers());
    expect(resolution).toEqual({ kind: 'redirect', location: docsReceiveBtc });
  });

  test('sends a guide that Leather Docs has no page for to the Guides home', async () => {
    const resolution = await resolveContentSlug(guideOnlySlug, createFetchers());
    expect(resolution).toEqual({ kind: 'redirect', location: docsGuides });
  });

  test('redirects deprecated slugs without querying Sanity', async () => {
    const fetchers = createFetchers({ guides: [deprecatedSlug] });
    const resolution = await resolveContentSlug(deprecatedSlug, fetchers);
    expect(resolution).toEqual({ kind: 'redirect', location: ordinalsDeprecationPath });
    expect(fetchers.hasGuide).not.toHaveBeenCalled();
    expect(fetchers.hasPost).not.toHaveBeenCalled();
  });

  test('resolves legacy slugs without querying Sanity', async () => {
    const fetchers = createFetchers();
    expect(await resolveContentSlug('apps-xlink', fetchers)).toEqual({
      kind: 'redirect',
      location: '/apps',
    });
    expect(fetchers.hasPost).not.toHaveBeenCalled();
  });

  test('sends formerly retired legacy slugs to the docs blog or /apps', async () => {
    expect(await resolveContentSlug('befi-labs', createFetchers())).toEqual({
      kind: 'redirect',
      location: docsBlog,
    });
    expect(await resolveContentSlug('apps-befi-labs', createFetchers())).toEqual({
      kind: 'redirect',
      location: '/apps',
    });
  });

  test('marks unknown slugs as not found', async () => {
    expect(await resolveContentSlug('no-such-post', createFetchers())).toEqual({
      kind: 'not-found',
    });
  });

  test('maps renamed guide slugs to their Leather Docs page', async () => {
    const slug = 'what-are-bns-names-(.btc-names)-in-stacks?';
    const resolution = await resolveContentSlug(slug, createFetchers({ guides: [slug] }));
    expect(resolution).toEqual({ kind: 'redirect', location: `${docsGuides}/learn/bns` });
  });
});

describe('/posts/:slug', () => {
  function captureRedirect(slug: string, path = `/posts/${slug}`) {
    try {
      redirectPostSlug(slug, request(path));
    } catch (thrown) {
      if (thrown instanceof Response) {
        return { status: thrown.status, location: thrown.headers.get('Location') };
      }
    }
    throw new Error('Expected a redirect');
  }

  test.each([
    [guideAndPostSlug, docsReceiveBtc],
    [deprecatedSlug, ordinalsDeprecationPath],
    ['api-sign-psbt', `${LEATHER_DOCS.developers}/bitcoin-methods/signpsbt`],
    [postOnlySlug, `${docsBlog}/${postOnlySlug}`],
    ['zest', '/apps'],
    ['apps-xlink', '/apps'],
    ['apps-not-in-any-table', '/apps'],
    ['privacy-policy', '/privacy-policy'],
    ['terms-of-service', '/terms'],
    // A spotlight and an explainer without a docs page, a formerly retired slug, an unknown slug
    ['how-roo-has-built-a-community-on-bitcoin', docsBlog],
    ['leather', docsBlog],
    ['tokens-btc', docsBlog],
    ['no-such-post', docsBlog],
  ])('301s %s once to %s', (slug, location) => {
    expect(captureRedirect(slug)).toEqual({ status: 301, location });
  });

  test('keeps the query string', () => {
    expect(captureRedirect('tokens-stx', '/posts/tokens-stx?utm_source=x')).toEqual({
      status: 301,
      location: `${docsGuides}/stacking-and-sbtc-reference/stacks-token-stx?utm_source=x`,
    });
  });
});

describe('/support/:slug and /support/guide/:slug', () => {
  test.each([
    [guideAndPostSlug, docsReceiveBtc],
    ['install-leather', docsInstallLeather],
    // Explainers moved to Leather Docs with the guides
    ['what-is-stacks', docsWhatIsStacks],
    [guideOnlySlug, docsGuides],
    [deprecatedSlug, ordinalsDeprecationPath],
    ['how-can-i-secure-my-secret-key', docsSecureSecretKey],
  ])('301s %s straight to %s', async (slug, location) => {
    for (const path of [`/support/${slug}`, `/support/guide/${slug}`]) {
      const thrown = await captureThrown(
        redirectContentSlug(slug, request(path), createFetchers())
      );
      expect(thrown, path).toEqual({ status: 301, location });
    }
  });

  test('goes to Leather Docs without querying Sanity and keeps the query string', async () => {
    const fetchers = createFetchers();
    const thrown = await captureThrown(
      redirectContentSlug('send-stx', request('/support/send-stx?utm_source=x'), fetchers)
    );
    expect(thrown).toEqual({ status: 301, location: `${docsSendStx}?utm_source=x` });
    expect(fetchers.hasGuide).not.toHaveBeenCalled();
  });

  test('301s a post that is not on Leather Docs to the docs blog', async () => {
    const thrown = await captureThrown(
      redirectContentSlug(
        'stacking',
        request('/support/stacking'),
        createFetchers({ posts: ['stacking'] })
      )
    );
    expect(thrown).toEqual({ status: 301, location: docsBlog });
  });

  test('returns 404 for unknown slugs', async () => {
    const thrown = await captureThrown(
      redirectContentSlug('nope', request('/support/guide/nope'), createFetchers())
    );
    expect(thrown).toEqual({ status: 404, location: null });
  });
});

describe('legacy prefixes', () => {
  test.each([
    ['/help-center/guide/install-leather', docsInstallLeather],
    ['/help-center/' + guideOnlySlug, docsGuides],
    ['/help-center/guide/' + deprecatedSlug, ordinalsDeprecationPath],
  ])('help center %s resolves to %s in one hop', async (path, location) => {
    const thrown = await captureThrown(helpCenterWildcardLoader(request(path), createFetchers()));
    expect(thrown).toEqual({ status: 301, location });
  });

  test.each([
    ['/help-center/', docsGuides],
    ['/help-center/search?q=fees', `${docsGuides}?q=fees`],
  ])('help center %s redirects to %s', async (path, location) => {
    const response = await helpCenterWildcardLoader(request(path), createFetchers());
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe(location);
  });

  test.each(['/help-center/guide/nope', '/help-center/a/b', `/help-center/${postOnlySlug}/extra`])(
    'help center %s returns 404 without redirecting',
    async path => {
      const fetchers = createFetchers();
      const thrown = await captureThrown(helpCenterWildcardLoader(request(path), fetchers));
      expect(thrown).toEqual({ status: 404, location: null });
    }
  );

  test.each([
    ['/guides/stacking', docsBlog, ['stacking']],
    ['/guides/bitflow', '/apps', []],
    ['/guides/start-with-leather', docsGuides, []],
    // Linked from the extension's stx_transferStx approval screen
    ['/guides/send-stacks-from-app', docsSendStx, []],
  ])('guides %s resolves to %s in one hop', async (path, location, posts) => {
    const thrown = await captureThrown(
      guidesWildcardLoader(request(path), createFetchers({ posts }))
    );
    expect(thrown).toEqual({ status: 301, location });
  });
});

describe('legacy Framer short paths', () => {
  test.each([
    ['/security', `${docsGuides}/wallet-and-security/security`, ['security'], ['security']],
    ['/wallet-apps', `${docsGuides}/learn/custodial-vs-non-custodial-wallet`, [], []],
  ])('%s resolves through Sanity to %s', async (path, location, posts, guides) => {
    const thrown = await captureThrown(
      legacyPathRedirectLoader(request(path), createFetchers({ posts, guides }))
    );
    expect(thrown).toEqual({ status: 301, location });
  });

  test.each([
    ['/download', '/'],
    ['/terms-of-service', '/terms'],
    ['/old-page/terms', '/terms'],
    ['/old-page/privacy-policy', '/privacy-policy'],
    ['/wallet/mobile', '/'],
    ['/contact/', docsGuides],
    ['/guides?ref=nav', `${docsGuides}?ref=nav`],
    ['/support', docsGuides],
    ['/support/search?q=fees', `${docsGuides}?q=fees`],
    ['/help-center', docsGuides],
    ['/developers', LEATHER_DOCS.developers],
    ['/old-page/developer-docs', LEATHER_DOCS.developers],
    ['/posts', docsBlog],
    ['/posts/', docsBlog],
    ['/news', docsBlog],
    ['/blog?ref=x', `${docsBlog}?ref=x`],
    ['/old-page/blog', docsBlog],
    ['/old-page/learn', docsBlog],
  ])('%s redirects to %s', async (path, location) => {
    const response = await legacyPathRedirectLoader(request(path), createFetchers());
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe(location);
  });
});

describe('no redirect chains', () => {
  const entries = getLegacyContentEntries();
  const appRoutes = ['/', '/apps', '/privacy-policy', '/terms'];

  test('every legacy slug points at a final URL', () => {
    for (const [slug, location] of entries) {
      if (appRoutes.includes(location)) continue;
      expect(location.startsWith(`${docsGuides}/`) || location === docsGuides, slug).toBe(true);
      // Never a path the app itself redirects
      expect(location, slug).not.toMatch(/^\/(posts|news|support|guides|help-center)\b/);
    }
  });

  test('every Leather Docs target is a known docs page', () => {
    const knownDocsUrls = new Set([
      docsGuides,
      docsBlog,
      ...LEATHER_DOCS_GUIDE_PAGES.map(path => `${docsGuides}/${path}`),
      ...LEATHER_DOCS_BLOG_PAGES.map(slug => `${docsBlog}/${slug}`),
      ...[...LEATHER_DOCS_RENAMED_PAGES.values()].map(path => `${docsGuides}/${path}`),
    ]);
    for (const [slug, location] of entries) {
      if (appRoutes.includes(location)) continue;
      expect(knownDocsUrls.has(location), `${slug} -> ${location}`).toBe(true);
    }
  });

  test('legacy entries for app listings keep docs targets and otherwise go to /apps', () => {
    for (const [slug, location] of entries) {
      if (!slug.startsWith('apps-')) continue;
      expect(location === '/apps' || location.startsWith(`${docsGuides}/`), slug).toBe(true);
    }
  });

  test('deprecated slugs go to a discontinued notice on Leather Docs', () => {
    expect(getDeprecationTarget(deprecatedSlug)).toBe(ordinalsDeprecationPath);
    expect(getDeprecationTarget('leather-runes-wallet')).toBe(`${docsGuides}/discontinued/runes`);
  });
});
