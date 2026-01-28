import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

import { getAppPaths } from '../utils/paths.js';
import { parseChangelog } from './parser.js';
import type { AppName } from './types.js';

const REPO_URL = 'https://github.com/leather-io/mono';

function validateApp(app: string): app is AppName {
  return app === 'mobile' || app === 'extension';
}

function readCurrentVersion(packageJsonPath: string): string {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version: string };
  return packageJson.version;
}

function readPublishedVersion(publishedVersionPath: string): string | null {
  if (!fs.existsSync(publishedVersionPath)) {
    return null;
  }
  return fs.readFileSync(publishedVersionPath, 'utf-8').trim();
}

function getReleaseTag(app: AppName, version: string): string {
  return `@leather.io/${app}-v${version}`;
}

function getDiffUrl(app: AppName, fromVersion: string, toVersion: string): string {
  const fromTag = getReleaseTag(app, fromVersion);
  const toTag = getReleaseTag(app, toVersion);
  return `${REPO_URL}/compare/${fromTag}...${toTag}`;
}

function updateGitHubRelease(tag: string, notes: string): boolean {
  try {
    execFileSync('gh', ['release', 'edit', tag, '--notes-file', '-'], {
      input: notes,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to update release ${tag}: ${message}`);
    return false;
  }
}

function formatReleaseNotes(
  unpublishedSection: string,
  version: string,
  diffUrl: string | null
): string {
  const lines: string[] = [];
  const today = new Date().toISOString().split('T')[0];

  if (diffUrl) {
    lines.push(`**[v${version}](${diffUrl}) Changelog ${today}**`, '');
  } else {
    lines.push(`**v${version} Changelog ${today}**`, '');
  }

  lines.push("## What's Changed", '', unpublishedSection);

  return lines.join('\n');
}

export function cutRelease(options: { app: string }): void {
  if (!validateApp(options.app)) {
    console.error(`Invalid app: ${options.app}. Must be 'mobile' or 'extension'.`);
    process.exit(1);
  }

  const app = options.app;
  const paths = getAppPaths(app);

  const currentVersion = readCurrentVersion(paths.packageJsonPath);
  const previousVersion = readPublishedVersion(paths.publishedVersionPath);
  const releaseTag = getReleaseTag(app, currentVersion);

  console.log(`Cutting release for ${app} v${currentVersion}`);
  console.log(`Previous published version: ${previousVersion ?? 'none'}`);
  console.log(`Release tag: ${releaseTag}`);

  const changelogContent = fs.readFileSync(paths.changelogPath, 'utf-8');
  const parsed = parseChangelog(changelogContent);

  if (!parsed.unpublishedSection || parsed.unpublishedSection === 'No unreleased changes.') {
    console.log('No unpublished changes to release.');
    fs.writeFileSync(paths.publishedVersionPath, currentVersion);
    console.log(`Updated .published-version to ${currentVersion}`);
    return;
  }

  const diffUrl = previousVersion ? getDiffUrl(app, previousVersion, currentVersion) : null;
  const releaseNotes = formatReleaseNotes(parsed.unpublishedSection, currentVersion, diffUrl);
  console.log(`Updating GitHub release notes for ${releaseTag}...`);
  if (diffUrl) {
    console.log(`Diff: ${diffUrl}`);
  }

  const success = updateGitHubRelease(releaseTag, releaseNotes);
  if (!success) {
    console.error('Failed to update GitHub release. The release tag may not exist yet.');
    process.exit(1);
  }

  console.log(`Updated release notes for ${releaseTag}`);

  const emptyUnpublished = '## Unpublished\n\nNo unreleased changes.\n';
  const unpublishedRegex = /## Unpublished\n[\s\S]*?(?=\n---|\n## \[|\n## Released|$)/;
  const newContent = changelogContent.replace(unpublishedRegex, emptyUnpublished);

  fs.writeFileSync(paths.changelogPath, newContent);
  console.log(`Cleared Unpublished section in ${paths.changelogPath}`);

  fs.writeFileSync(paths.publishedVersionPath, currentVersion);
  console.log(`Updated .published-version to ${currentVersion}`);
}
