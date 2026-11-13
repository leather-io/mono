import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test, vi } from 'vitest';

import {
  getChangelogDescription,
  getChangelogEntries,
  getChangelogEntry,
  parseChangelogFiles,
} from './changelog.data';

const publicDir = path.resolve(__dirname, '../../../public');

function file(frontmatter: string, body = 'Body text.') {
  return `---\n${frontmatter}\n---\n\n${body}\n`;
}

describe('parseChangelogFiles', () => {
  test('parses frontmatter and body, newest first', () => {
    const entries = parseChangelogFiles({
      '/content/changelog/older.md': file(
        "title: 'Older''s title'\nslug: older\npublishedAt: 2025-01-01T00:00:00.000Z\ntags: ['web']"
      ),
      '/content/changelog/newer.md': file(
        'title: "Newer: with a colon"\nslug: newer\npublishedAt: 2025-02-01T00:00:00.000Z\ntags: ["extension", "RPC API"]\ncover: /marketing/changelog/newer.webp',
        '## Heading\n\nText.'
      ),
    });

    expect(entries).toEqual([
      {
        title: 'Newer: with a colon',
        slug: 'newer',
        publishedAt: '2025-02-01T00:00:00.000Z',
        tags: ['extension', 'RPC API'],
        cover: '/marketing/changelog/newer.webp',
        body: '## Heading\n\nText.',
      },
      {
        title: "Older's title",
        slug: 'older',
        publishedAt: '2025-01-01T00:00:00.000Z',
        tags: ['web'],
        body: 'Body text.',
      },
    ]);
  });

  test('skips malformed files instead of throwing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const entries = parseChangelogFiles({
      '/content/changelog/no-frontmatter.md': 'Just text',
      '/content/changelog/bad-date.md': file(
        'title: "Bad date"\nslug: bad-date\npublishedAt: yesterday\ntags: []'
      ),
      '/content/changelog/wrong-name.md': file(
        'title: "Wrong"\nslug: other-slug\npublishedAt: 2025-01-01T00:00:00.000Z\ntags: []'
      ),
      '/content/changelog/ok.md': file(
        'title: "Ok"\nslug: ok\npublishedAt: 2025-01-01T00:00:00.000Z\ntags: []'
      ),
    });

    expect(entries.map(entry => entry.slug)).toEqual(['ok']);
    expect(consoleError).toHaveBeenCalledTimes(3);
    consoleError.mockRestore();
  });
});

describe('repo changelog content', () => {
  const entries = getChangelogEntries(new Date('2100-01-01'));

  test('every file in app/content/changelog parses', () => {
    // The 9 published entries exported from Sanity
    expect(entries).toHaveLength(9);
  });

  test('slugs are unique and the Sanity-era URLs still resolve', () => {
    const slugs = entries.map(entry => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of [
      'usdcx-default-asset',
      'usdcx-now-available-on-stacks',
      'onramper-integration',
      'leather-web-portfolio',
      'homepage-redesign',
      'wallet-balance-improvements',
      'deprecation-desktop-wallet',
      'mobile-app-launch',
      'stacks-sip-30-support',
    ]) {
      expect(slugs).toContain(slug);
    }
  });

  test('covers and body images exist in public/', () => {
    for (const entry of entries) {
      const images = [
        ...(entry.cover ? [entry.cover] : []),
        ...[...entry.body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]),
      ];
      for (const image of images) {
        expect(existsSync(path.join(publicDir, image)), `${entry.slug}: ${image}`).toBe(true);
      }
    }
  });

  test('hides entries dated in the future', () => {
    const now = new Date('2025-10-20T00:00:00.000Z');
    const published = getChangelogEntries(now);
    expect(published.every(entry => Date.parse(entry.publishedAt) <= now.getTime())).toBe(true);
    expect(published[0].slug).toBe('wallet-balance-improvements');
    expect(getChangelogEntry('usdcx-default-asset', now)).toBeNull();
    expect(getChangelogEntry('wallet-balance-improvements', now)?.title).toBe(
      'Improved wallet balance accuracy, coverage and load times'
    );
  });
});

describe('getChangelogDescription', () => {
  test('uses the first sentence of the body as plain text', () => {
    const entry = getChangelogEntry('stacks-sip-30-support');
    expect(entry && getChangelogDescription(entry)).toBe(
      'Available in v6.70.0, this release brings full support for SIP-30, a standard API that makes it easier for apps to interact with the Stacks ecosystem through a consistent interface.'
    );
  });
});
