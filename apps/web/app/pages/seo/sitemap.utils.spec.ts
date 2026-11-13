import { describe, expect, test } from 'vitest';

import { getSitemapPaths, renderSitemap, sitemapPagePaths } from './sitemap.utils';

describe('getSitemapPaths', () => {
  test('lists the public pages and changelog entries', () => {
    expect(getSitemapPaths(['web-portfolio'])).toEqual([
      ...sitemapPagePaths,
      '/changelog/web-portfolio',
    ]);
  });
});

test('lists the legal pages', () => {
  expect(sitemapPagePaths).toEqual(expect.arrayContaining(['/privacy-policy', '/terms']));
});

test('leaves out pages that moved to Leather Docs', () => {
  for (const path of ['/support', '/developers', '/posts', '/news']) {
    expect(sitemapPagePaths).not.toContain(path);
  }
});

describe('renderSitemap', () => {
  test('renders absolute, escaped leather.io URLs', () => {
    const xml = renderSitemap(['/', '/changelog/a&b']);
    expect(xml).toContain('<loc>https://leather.io/</loc>');
    expect(xml).toContain('<loc>https://leather.io/changelog/a&amp;b</loc>');
  });
});
