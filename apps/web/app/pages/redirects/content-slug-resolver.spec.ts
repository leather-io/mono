import { describe, expect, test, vi } from 'vitest';

import {
  type ContentFetchers,
  loadGuideBySlug,
  loadPostBySlug,
  redirectContentSlug,
  resolveContentSlug,
} from './content-slug-resolver';
import { getLegacyContentEntries } from './legacy-content-redirects';
import { legacyPathRedirectLoader } from './legacy-path-redirect-loader';
import { guidesWildcardLoader, helpCenterWildcardLoader } from './legacy-prefix-redirects';
import { getDeprecationTarget, helpCenterRedirectLoader } from './shared-redirect-logic';

vi.mock('~/constants/cms-client', () => ({ cmsClient: { fetch: vi.fn() } }));

const postOnlySlug = 'what-is-stacks';
const guideOnlySlug = 'leather-password-strength-guide';
const guideAndPostSlug = 'receive-btc';
const deprecatedSlug = 'send-ordinals';
const ordinalsDeprecationPath = '/posts/deprecation-of-ordinals-inscriptions-support-in-leather';

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

  test('prefers the help center guide when a post shares its slug', async () => {
    const resolution = await resolveContentSlug(guideAndPostSlug, createFetchers());
    expect(resolution).toMatchObject({
      kind: 'guide',
      canonicalPath: `/support/${guideAndPostSlug}`,
    });
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
    const slug = 'what-are-bns-names-(.btc-names)-in-stacks?';
    const resolution = await resolveContentSlug(slug, createFetchers({ guides: [slug] }));
    expect(resolution).toMatchObject({
      canonicalPath: '/support/what-are-bns-names-(.btc-names)-in-stacks%3F',
    });
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

  test('301s to the guide when one exists', async () => {
    const thrown = await captureThrown(
      loadPostBySlug(guideAndPostSlug, request(`/posts/${guideAndPostSlug}`), createFetchers())
    );
    expect(thrown).toEqual({ status: 301, location: `/support/${guideAndPostSlug}` });
  });

  test('301s a deprecated slug once, straight to the deprecation post', async () => {
    const thrown = await captureThrown(
      loadPostBySlug(deprecatedSlug, request(`/posts/${deprecatedSlug}`), createFetchers())
    );
    expect(thrown).toEqual({ status: 301, location: ordinalsDeprecationPath });
  });

  test('301s a legacy Framer slug once and keeps the query string', async () => {
    const thrown = await captureThrown(
      loadPostBySlug('tokens-stx', request('/posts/tokens-stx?utm_source=x'), createFetchers())
    );
    expect(thrown).toEqual({ status: 301, location: '/posts/stacks-token-stx?utm_source=x' });
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

describe('/support/:slug', () => {
  test('serves a guide', async () => {
    const result = await loadGuideBySlug(
      guideOnlySlug,
      request(`/support/${guideOnlySlug}`),
      createFetchers()
    );
    expect(result.guide).toEqual({ _id: `guide-${guideOnlySlug}` });
  });

  test('301s a post-only slug to /posts (permanent, not 302)', async () => {
    const thrown = await captureThrown(
      loadGuideBySlug(postOnlySlug, request(`/support/${postOnlySlug}`), createFetchers())
    );
    expect(thrown).toEqual({ status: 301, location: `/posts/${postOnlySlug}` });
  });

  test('returns 404 instead of bouncing unknown slugs to /posts', async () => {
    const thrown = await captureThrown(
      loadGuideBySlug('no-such-guide', request('/support/no-such-guide'), createFetchers())
    );
    expect(thrown).toEqual({ status: 404, location: null });
  });
});

describe('/support/guide/:slug', () => {
  test.each([
    [guideOnlySlug, `/support/${guideOnlySlug}`],
    [postOnlySlug, `/posts/${postOnlySlug}`],
    [deprecatedSlug, ordinalsDeprecationPath],
    ['how-can-i-secure-my-secret-key', '/support/secure-secret-key'],
  ])('301s %s straight to %s', async (slug, location) => {
    const thrown = await captureThrown(
      redirectContentSlug(slug, request(`/support/guide/${slug}`), createFetchers())
    );
    expect(thrown).toEqual({ status: 301, location });
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
    ['/help-center/guide/' + guideOnlySlug, `/support/${guideOnlySlug}`],
    ['/help-center/' + postOnlySlug, `/posts/${postOnlySlug}`],
    ['/help-center/guide/' + deprecatedSlug, ordinalsDeprecationPath],
  ])('help center %s resolves to %s in one hop', async (path, location) => {
    const thrown = await captureThrown(helpCenterWildcardLoader(request(path), createFetchers()));
    expect(thrown).toEqual({ status: 301, location });
  });

  test('help center keeps static support paths and query strings', async () => {
    const response = await helpCenterWildcardLoader(
      request('/help-center/search?q=fees'),
      createFetchers()
    );
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('/support/search?q=fees');
  });

  test.each([
    ['/help-center', '/support'],
    ['/help-center/', '/support'],
    ['/help-center/?q=fees', '/support?q=fees'],
  ])('help center %s redirects to %s without a trailing slash', async (path, location) => {
    const indexResponse = helpCenterRedirectLoader(request(path));
    expect(indexResponse.status).toBe(301);
    expect(indexResponse.headers.get('Location')).toBe(`https://leather.io${location}`);

    const wildcardResponse = await helpCenterWildcardLoader(request(path), createFetchers());
    expect(wildcardResponse.status).toBe(301);
    expect(wildcardResponse.headers.get('Location')).toBe(location);
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
    ['/guides/start-with-leather', '/support', []],
    // Linked from the extension's stx_transferStx approval screen
    ['/guides/send-stacks-from-app', '/support/send-stx', []],
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
    ['/security', '/support/security', ['security'], ['security']],
  ])('%s resolves through Sanity to %s', async (path, location, posts, guides) => {
    const thrown = await captureThrown(
      legacyPathRedirectLoader(request(path), createFetchers({ posts, guides }))
    );
    expect(thrown).toEqual({ status: 301, location });
  });

  test.each([
    ['/download', '/'],
    ['/wallet/mobile', '/'],
    ['/contact/', '/support'],
    ['/guides?ref=nav', '/support?ref=nav'],
  ])('%s redirects to %s', async (path, location) => {
    const response = await legacyPathRedirectLoader(request(path), createFetchers());
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe(location);
  });
});

describe('no redirect chains', () => {
  const entries = getLegacyContentEntries();

  test('every legacy target is a final URL', () => {
    const pageTargets = new Set(['/support', '/']);
    for (const [, target] of entries) {
      if (target.action !== 'redirect' || pageTargets.has(target.to)) continue;
      const [, section, targetSlug] = target.to.split('/');
      expect(['posts', 'support'], target.to).toContain(section);
      expect(getDeprecationTarget(targetSlug), target.to).toBeNull();
      expect(
        entries.some(([slug]) => slug === targetSlug),
        target.to
      ).toBe(false);
    }
  });

  test('deprecation targets are not themselves deprecated or remapped', () => {
    const targetSlug = getDeprecationTarget(deprecatedSlug)?.split('/').pop() ?? '';
    expect(targetSlug).not.toBe('');
    expect(getDeprecationTarget(targetSlug)).toBeNull();
    expect(entries.some(([slug]) => slug === targetSlug)).toBe(false);
  });
});
