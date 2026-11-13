import { z } from 'zod';

// The changelog lives in the repo: one Markdown file per entry in app/content/changelog/<slug>.md,
// with a small frontmatter block (title, slug, publishedAt, tags, cover). Covers and body images
// ship from public/marketing/changelog/. Files are bundled at build time, so reading them can't
// fail at request time; a malformed file is logged and left out rather than breaking the page.

export interface ChangelogEntry {
  slug: string;
  title: string;
  /** ISO timestamp. Entries dated in the future stay hidden until then. */
  publishedAt: string;
  /** Tag names, e.g. "extension", "web", shown as chips on the changelog strip. */
  tags: string[];
  /** Public path of the 16:9 hero image */
  cover?: string;
  /** Markdown body (GFM) */
  body: string;
}

const changelogFiles = import.meta.glob<string>('../../content/changelog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  publishedAt: z.iso.datetime(),
  tags: z.array(z.string().min(1)).default([]),
  cover: z.string().startsWith('/').optional(),
});

// The frontmatter is a flat subset of YAML: `key: value` lines where a value is a plain or quoted
// string, or a one-line list of them (`tags: ['extension', 'web']`). Prettier formats these files,
// so both quote styles have to work.
const scalarPattern = /'((?:[^']|'')*)'|"((?:[^"\\]|\\.)*)"|([^,'"[\]]+)/g;

function parseScalar(match: RegExpMatchArray) {
  const [, singleQuoted, doubleQuoted, plain] = match;
  if (singleQuoted !== undefined) return singleQuoted.replace(/''/g, "'");
  if (doubleQuoted !== undefined) return z.string().parse(JSON.parse(`"${doubleQuoted}"`));
  return plain.trim();
}

function parseFrontmatterValue(value: string): unknown {
  if (value.startsWith('[') && value.endsWith(']')) {
    return [...value.slice(1, -1).matchAll(scalarPattern)]
      .map(parseScalar)
      .filter(item => item !== '');
  }
  const [match] = value.matchAll(scalarPattern);
  if (!match || match[0].length !== value.length) return value;
  return parseScalar(match);
}

function parseChangelogFile(raw: string): ChangelogEntry {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) throw new Error('Missing frontmatter');
  const [, frontmatter, body] = match;

  const fields: Record<string, unknown> = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(':');
    if (separator === -1) throw new Error(`Invalid frontmatter line: ${line}`);
    fields[line.slice(0, separator).trim()] = parseFrontmatterValue(
      line.slice(separator + 1).trim()
    );
  }

  return { ...frontmatterSchema.parse(fields), body: body.trim() };
}

/**
 * Parses every file, newest first. Files that don't parse, or whose slug doesn't match the file
 * name, are skipped.
 */
export function parseChangelogFiles(files: Record<string, string>): ChangelogEntry[] {
  const entries = Object.entries(files).flatMap(([path, raw]) => {
    try {
      const entry = parseChangelogFile(raw);
      const fileSlug = path.split('/').pop()?.replace(/\.md$/, '');
      if (entry.slug !== fileSlug) throw new Error(`Slug "${entry.slug}" doesn't match file name`);
      return [entry];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Skipping changelog entry ${path}`, error);
      return [];
    }
  });
  return entries.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

const allChangelogEntries = parseChangelogFiles(changelogFiles);

/** Published entries, newest first. */
export function getChangelogEntries(now = new Date()): ChangelogEntry[] {
  return allChangelogEntries.filter(entry => Date.parse(entry.publishedAt) <= now.getTime());
}

export function getChangelogEntry(slug: string, now = new Date()): ChangelogEntry | null {
  return getChangelogEntries(now).find(entry => entry.slug === slug) ?? null;
}

/** Plain text of the Markdown body: no code blocks, images or markup. */
function getChangelogPlainText(body: string) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/\\([\\*_[\]<`#])/g, '$1')
    .replace(/\\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** First sentence of the body, used as the meta description. */
export function getChangelogDescription(entry: ChangelogEntry) {
  const text = getChangelogPlainText(entry.body);
  // A sentence ends at punctuation followed by a space, so "app.leather.io" or "v6.70.0" stay whole
  return text.split(/[.!?](?=\s|$)/)[0].trim() + '.';
}
