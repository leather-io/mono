import { describe, expect, test, vi } from 'vitest';
import { LEATHER_DOCS } from '~/constants/leather-docs';

import {
  type ContentFetchers,
  loadPostBySlug,
  redirectContentSlug,
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

interface FakeDoc {
  _id: string;
}

function createFetchers(content: { posts?: string[]; guides?: string[] } = {}) {
  const posts = new Set([postOnlySlug, guideAndPostSlug, ...(content.posts ?? [])]);
  const guides = new Set([guideOnlySlug, guideAndPostSlug, ...(content.guides ?? [])]);
  return {
    fetchPost: vi.fn((slug: string) =>
      Promise.resolve(posts.has(slug) ? { _id: `post-${slug}` } : null)
    ),
    fetchGuide: vi.fn((slug: string) =>
      Promise.resolve(guides.has(slug) ? { _id: `guide-${slug}` } : null)
    ),
  } satisfies ContentFetchers<FakeDoc, FakeDoc>;
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
  test('serves a Sanity post at its /posts URL', async () => {
    const resolution = await resolveContentSlug(postOnlySlug, createFetchers());
    expect(resolution).toMatchObject({ kind: 'post', canonicalPath: `/posts/${postOnlySlug}` });
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
    expect(fetchers.fetchGuide).not.toHaveBeenCalled();
    expect(fetchers.fetchPost).not.toHaveBeenCalled();
  });

  test('uses the legacy map only when Sanity has no content for the slug', async () => {
    expect(await resolveContentSlug('apps-xlink', createFetchers())).toEqual({
      kind: 'redirect',
      location: '/posts/brotocol',
    });
    expect(
      await resolveContentSlug('apps-xlink', createFetchers({ posts: ['apps-xlink'] }))
    ).toMatchObject({ kind: 'post' });
  });

  test('marks retired legacy slugs as gone and unknown slugs as not found', async () => {
    expect(await resolveContentSlug('befi-labs', createFetchers())).toEqual({ kind: 'gone' });
    expect(await resolveContentSlug('no-such-post', createFetchers())).toEqual({
      kind: 'not-found',
    });
  });

  test('encodes slugs when building canonical paths', async () => {
    const slug = 'what-is-a-bns-name?';
    const resolution = await resolveContentSlug(slug, createFetchers({ posts: [slug] }));
    expect(resolution).toMatchObject({ canonicalPath: '/posts/what-is-a-bns-name%3F' });
  });

  test('maps renamed guide slugs to their Leather Docs page', async () => {
    const slug = 'what-are-bns-names-(.btc-names)-in-stacks?';
    const resolution = await resolveContentSlug(slug, createFetchers({ guides: [slug] }));
    expect(resolution).toEqual({ kind: 'redirect', location: `${docsGuides}/learn/bns` });
  });
});

describe('/posts/:slug', () => {
  test('serves a post', async () => {
    const result = await loadPostBySlug(
      postOnlySlug,
      request(`/posts/${postOnlySlug}`),
      createFetchers()
    );
    expect(result.post).toEqual({ _id: `post-${postOnlySlug}` });
  });

  test('301s to the guide on Leather Docs when one exists', async () => {
    const thrown = await captureThrown(
      loadPostBySlug(guideAndPostSlug, request(`/posts/${guideAndPostSlug}`), createFetchers())
    );
    expect(thrown).toEqual({ status: 301, location: docsReceiveBtc });
  });

  test('301s a deprecated slug once, straight to its discontinued notice', async () => {
    const thrown = await captureThrown(
      loadPostBySlug(deprecatedSlug, request(`/posts/${deprecatedSlug}`), createFetchers())
    );
    expect(thrown).toEqual({ status: 301, location: ordinalsDeprecationPath });
  });

  test('301s a legacy Framer slug once and keeps the query string', async () => {
    const thrown = await captureThrown(
      loadPostBySlug('tokens-stx', request('/posts/tokens-stx?utm_source=x'), createFetchers())
    );
    expect(thrown).toEqual({
      status: 301,
      location: `${docsGuides}/stacking-and-sbtc-reference/stacks-token-stx?utm_source=x`,
    });
  });

  test('returns 404 for unknown slugs and 410 for retired ones', async () => {
    expect(
      await captureThrown(
        loadPostBySlug('no-such-post', request('/posts/no-such-post'), createFetchers())
      )
    ).toEqual({ status: 404, location: null });
    expect(
      await captureThrown(
        loadPostBySlug('befi-labs', request('/posts/befi-labs'), createFetchers())
      )
    ).toEqual({ status: 410, location: null });
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
    expect(fetchers.fetchGuide).not.toHaveBeenCalled();
  });

  test('301s a post that is not on Leather Docs to /posts', async () => {
    const thrown = await captureThrown(
      redirectContentSlug(
        'stacking',
        request('/support/stacking'),
        createFetchers({ posts: ['stacking'] })
      )
    );
    expect(thrown).toEqual({ status: 301, location: '/posts/stacking' });
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
    ['/guides/stacking', '/posts/stacking', ['stacking']],
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
    ['/privacy-policy', '/posts/privacy-policy', ['privacy-policy'], []],
    ['/terms', '/posts/terms-of-service', ['terms-of-service'], []],
    ['/security', `${docsGuides}/wallet-and-security/security`, ['security'], ['security']],
  ])('%s resolves through Sanity to %s', async (path, location, posts, guides) => {
    const thrown = await captureThrown(
      legacyPathRedirectLoader(request(path), createFetchers({ posts, guides }))
    );
    expect(thrown).toEqual({ status: 301, location });
  });

  test.each([
    ['/wallet/mobile', '/'],
    ['/contact/', docsGuides],
    ['/guides?ref=nav', `${docsGuides}?ref=nav`],
    ['/support', docsGuides],
    ['/support/search?q=fees', `${docsGuides}?q=fees`],
    ['/help-center', docsGuides],
    ['/developers', LEATHER_DOCS.developers],
    ['/old-page/developer-docs', LEATHER_DOCS.developers],
  ])('%s redirects to %s', async (path, location) => {
    const response = await legacyPathRedirectLoader(request(path), createFetchers());
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe(location);
  });
});

describe('no redirect chains', () => {
  const entries = getLegacyContentEntries();

  test('every legacy slug resolves to a final URL in one hop', async () => {
    const slugs = new Set(entries.map(([slug]) => slug));
    for (const [slug, target] of entries) {
      if (target.action !== 'redirect') continue;
      const resolution = await resolveContentSlug(slug, createFetchers());
      expect(resolution.kind, slug).toBe('redirect');
      if (resolution.kind !== 'redirect') continue;
      const { location } = resolution;
      if (location === docsGuides && target.to === '/support') continue;
      if (location.startsWith(`${docsGuides}/`) || location === '/') continue;
      // Help center targets resolve to a page on Leather Docs, never the Guides home
      expect(target.to.startsWith('/support'), slug).toBe(false);
      const [, section, targetSlug] = location.split('/');
      expect(section, slug).toBe('posts');
      expect(getDeprecationTarget(targetSlug), slug).toBeNull();
      expect(slugs.has(targetSlug), slug).toBe(false);
    }
  });

  test('deprecated slugs go to a discontinued notice on Leather Docs', () => {
    expect(getDeprecationTarget(deprecatedSlug)).toBe(ordinalsDeprecationPath);
    expect(getDeprecationTarget('leather-runes-wallet')).toBe(`${docsGuides}/discontinued/runes`);
  });
});
