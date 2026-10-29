import { describe, expect, test, vi } from 'vitest';

import { getSitemapPaths, renderSitemap, sitemapPagePaths } from './sitemap.utils';

vi.mock('~/constants/cms-client', () => ({ cmsClient: { fetch: vi.fn() } }));

describe('getSitemapPaths', () => {
  test('lists pages, served posts and guides at their canonical URL, and changelog entries', async () => {
    const paths = await getSitemapPaths({
      postSlugs: ['what-is-stacks', 'receive-btc', 'send-ordinals'],
      guideSlugs: ['receive-btc', 'send-stx', 'receive-ordinals'],
      changelogSlugs: ['web-portfolio'],
    });

    expect(paths).toEqual([
      ...sitemapPagePaths,
      '/support/receive-btc',
      '/support/send-stx',
      '/posts/what-is-stacks',
      '/changelog/web-portfolio',
    ]);
  });

  test('never lists a post URL that redirects to a guide or deprecation notice', async () => {
    const paths = await getSitemapPaths({
      postSlugs: ['receive-btc', 'send-ordinals'],
      guideSlugs: ['receive-btc'],
      changelogSlugs: [],
    });

    expect(paths).not.toContain('/posts/receive-btc');
    expect(paths).not.toContain('/posts/send-ordinals');
  });
});

describe('renderSitemap', () => {
  test('renders absolute, escaped leather.io URLs', () => {
    const xml = renderSitemap(['/', '/posts/a&b']);
    expect(xml).toContain('<loc>https://leather.io/</loc>');
    expect(xml).toContain('<loc>https://leather.io/posts/a&amp;b</loc>');
  });
});
