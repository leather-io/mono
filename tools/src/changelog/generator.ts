import { isVersionGreaterThan } from '../utils/version.js';
import type { ChangelogEntry, VersionSection } from './types.js';

function formatEntry(entry: ChangelogEntry): string {
  const scopePrefix = entry.scope ? `**${entry.scope}:** ` : '';
  const commitHash = entry.commitUrl.split('/').pop()?.slice(0, 7) ?? '';
  return `* ${scopePrefix}${entry.description} ([${commitHash}](${entry.commitUrl}))`;
}

export function generateUnpublishedSection(entries: {
  features: ChangelogEntry[];
  fixes: ChangelogEntry[];
}): string {
  const lines: string[] = ['## Unpublished', ''];

  if (entries.features.length > 0) {
    lines.push('### Features', '');
    for (const entry of entries.features) {
      lines.push(formatEntry(entry));
    }
    lines.push('');
  }

  if (entries.fixes.length > 0) {
    lines.push('### Bug Fixes', '');
    for (const entry of entries.fixes) {
      lines.push(formatEntry(entry));
    }
    lines.push('');
  }

  if (entries.features.length === 0 && entries.fixes.length === 0) {
    lines.push('No unreleased changes.', '');
  }

  return lines.join('\n');
}

export function aggregateEntriesSinceVersion(
  versionSections: VersionSection[],
  publishedVersion: string
): { features: ChangelogEntry[]; fixes: ChangelogEntry[] } {
  const features: ChangelogEntry[] = [];
  const fixes: ChangelogEntry[] = [];

  for (const section of versionSections) {
    if (isVersionGreaterThan(section.version, publishedVersion)) {
      features.push(...section.features);
      fixes.push(...section.fixes);
    }
  }

  return { features, fixes };
}
