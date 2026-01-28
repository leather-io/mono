import type { ChangelogEntry, ParsedChangelog, VersionSection } from './types.js';

function parseChangelogEntry(line: string): ChangelogEntry | null {
  const match = line.match(/^\* (?:\*\*([^*]+)\*\*: )?(.+?) \(\[([a-f0-9]+)\]\(([^)]+)\)\)$/);
  if (!match) return null;

  const [, scope, description, , commitUrl] = match;
  return {
    type: 'fix',
    scope: scope ?? undefined,
    description,
    commitUrl,
  };
}

function parseVersionSection(content: string): VersionSection | null {
  const headerMatch = content.match(/^## \[(\d+\.\d+\.\d+)\].*\((\d{4}-\d{2}-\d{2})\)/);
  if (!headerMatch) return null;

  const [, version, date] = headerMatch;
  const features: ChangelogEntry[] = [];
  const fixes: ChangelogEntry[] = [];
  const internal: ChangelogEntry[] = [];

  let currentCategory: 'features' | 'fixes' | 'internal' | 'dependencies' | null = null;

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('### Features')) {
      currentCategory = 'features';
      continue;
    }
    if (line.startsWith('### Bug Fixes')) {
      currentCategory = 'fixes';
      continue;
    }
    if (line.startsWith('### Internal')) {
      currentCategory = 'internal';
      continue;
    }
    if (line.startsWith('### Dependencies')) {
      currentCategory = 'dependencies';
      continue;
    }

    if (currentCategory === 'dependencies') continue;

    if (line.startsWith('* ') && currentCategory) {
      const entry = parseChangelogEntry(line);
      if (entry) {
        entry.type =
          currentCategory === 'features'
            ? 'feature'
            : currentCategory === 'fixes'
              ? 'fix'
              : 'internal';
        if (currentCategory === 'features') features.push(entry);
        else if (currentCategory === 'fixes') fixes.push(entry);
        else if (currentCategory === 'internal') internal.push(entry);
      }
    }
  }

  return { version, date, features, fixes, internal };
}

export function parseChangelog(content: string): ParsedChangelog {
  const versionSections: VersionSection[] = [];
  const releasedSections: string[] = [];
  let unpublishedSection: string | null = null;

  const unpublishedMatch = content.match(
    /## Unpublished\n([\s\S]*?)(?=\n---|\n## \[|\n## Released|$)/
  );
  if (unpublishedMatch) {
    unpublishedSection = unpublishedMatch[1].trim();
  }

  const releasedMatches = content.matchAll(/## Released in [\s\S]*?(?=\n---|\n## \[|$)/g);
  for (const match of releasedMatches) {
    releasedSections.push(match[0]);
  }

  const versionMatches = content.matchAll(
    /## \[\d+\.\d+\.\d+\][\s\S]*?(?=\n## \[|\n## Released|$)/g
  );
  for (const match of versionMatches) {
    const section = parseVersionSection(match[0]);
    if (section) {
      versionSections.push(section);
    }
  }

  return {
    unpublishedSection,
    releasedSections,
    versionSections,
    rawContent: content,
  };
}
