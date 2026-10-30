import { describe, expect, it } from 'vitest';

import {
  type PostsIndexItem,
  filterPosts,
  normalizeSearchText,
  selectListedPosts,
} from './posts-index.utils';

const posts: PostsIndexItem[] = [
  { slug: 'sbtc-rewards', title: 'sBTC Rewards', category: 'Explainers' },
  { slug: 'withdraw-sbtc', title: 'Withdraw or move your sBTC', category: 'Guides' },
  { slug: 'stacking', title: 'Stacking', category: 'Explainers' },
  {
    slug: 'unpacking-leather-s-new-brand-identity',
    title: 'Unpacking Leather’s New Brand Identity',
    category: 'News',
  },
  { slug: 'deprecation-notice', title: 'Ordinals support ending', category: null },
];

describe(filterPosts.name, () => {
  it('returns every post for an empty or blank query', () => {
    expect(filterPosts(posts, '')).toEqual(posts);
    expect(filterPosts(posts, '   ')).toEqual(posts);
  });

  it('matches titles case-insensitively', () => {
    expect(filterPosts(posts, 'SBTC').map(p => p.slug)).toEqual(['sbtc-rewards', 'withdraw-sbtc']);
  });

  it('requires every word to match, in any order', () => {
    expect(filterPosts(posts, 'sbtc move').map(p => p.slug)).toEqual(['withdraw-sbtc']);
    expect(filterPosts(posts, 'move sbtc').map(p => p.slug)).toEqual(['withdraw-sbtc']);
    expect(filterPosts(posts, 'sbtc nothing')).toEqual([]);
  });

  it('matches the category as well as the title', () => {
    expect(filterPosts(posts, 'news').map(p => p.slug)).toEqual([
      'unpacking-leather-s-new-brand-identity',
    ]);
  });

  it('treats curly and straight apostrophes alike', () => {
    expect(filterPosts(posts, "leather's").map(p => p.slug)).toEqual([
      'unpacking-leather-s-new-brand-identity',
    ]);
  });

  it('copes with posts without a category', () => {
    expect(filterPosts(posts, 'ordinals').map(p => p.slug)).toEqual(['deprecation-notice']);
  });
});

describe(normalizeSearchText.name, () => {
  it('lowercases, strips accents and collapses whitespace', () => {
    expect(normalizeSearchText('  Café   Leather ')).toBe('cafe leather');
  });
});

describe(selectListedPosts.name, () => {
  it('drops retired slugs and untitled posts, keeping order', () => {
    const listed = selectListedPosts(
      [...posts, { slug: 'untitled', title: '', category: 'Guides' }],
      slug => slug === 'stacking'
    );
    expect(listed.map(p => p.slug)).toEqual([
      'sbtc-rewards',
      'withdraw-sbtc',
      'unpacking-leather-s-new-brand-identity',
      'deprecation-notice',
    ]);
  });
});
