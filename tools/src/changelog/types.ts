export type AppName = 'mobile' | 'extension';

export interface ChangelogEntry {
  type: 'feature' | 'fix' | 'internal';
  scope?: string;
  description: string;
  commitUrl: string;
}

export interface VersionSection {
  version: string;
  date: string;
  features: ChangelogEntry[];
  fixes: ChangelogEntry[];
  internal: ChangelogEntry[];
}

export interface ParsedChangelog {
  unpublishedSection: string | null;
  releasedSections: string[];
  versionSections: VersionSection[];
  rawContent: string;
}

export interface AppPaths {
  changelogPath: string;
  publishedVersionPath: string;
  packageJsonPath: string;
}
