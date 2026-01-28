import fs from 'node:fs';

import { getAppPaths } from '../utils/paths.js';
import { aggregateEntriesSinceVersion, generateUnpublishedSection } from './generator.js';
import { parseChangelog } from './parser.js';
import type { AppName } from './types.js';

function validateApp(app: string): app is AppName {
  return app === 'mobile' || app === 'extension';
}

function readPublishedVersion(publishedVersionPath: string): string | null {
  if (!fs.existsSync(publishedVersionPath)) {
    return null;
  }
  return fs.readFileSync(publishedVersionPath, 'utf-8').trim();
}

function readCurrentVersion(packageJsonPath: string): string {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version: string };
  return packageJson.version;
}

export function syncUnpublished(options: { app: string }): void {
  if (!validateApp(options.app)) {
    console.error(`Invalid app: ${options.app}. Must be 'mobile' or 'extension'.`);
    process.exit(1);
  }

  const app = options.app;
  const paths = getAppPaths(app);

  const publishedVersion = readPublishedVersion(paths.publishedVersionPath);
  if (!publishedVersion) {
    console.error(
      `No .published-version file found for ${app}. Please create one with the current production version.`
    );
    process.exit(1);
  }

  const currentVersion = readCurrentVersion(paths.packageJsonPath);
  console.log(`App: ${app}`);
  console.log(`Published version: ${publishedVersion}`);
  console.log(`Current version: ${currentVersion}`);

  const changelogContent = fs.readFileSync(paths.changelogPath, 'utf-8');
  const parsed = parseChangelog(changelogContent);

  const aggregated = aggregateEntriesSinceVersion(parsed.versionSections, publishedVersion);
  console.log(
    `Found ${aggregated.features.length} features and ${aggregated.fixes.length} fixes since ${publishedVersion}`
  );

  const newUnpublishedSection = generateUnpublishedSection(aggregated);

  let newContent = changelogContent;

  if (parsed.unpublishedSection !== null) {
    const unpublishedRegex = /## Unpublished\n[\s\S]*?(?=\n---|\n## \[|\n## Released|$)/;
    newContent = newContent.replace(unpublishedRegex, newUnpublishedSection.trim() + '\n');
  } else {
    const headerMatch = newContent.match(/^# Changelog\n+(?:# Changelog\n+)?/);
    if (headerMatch) {
      const insertPosition = headerMatch[0].length;
      newContent =
        newContent.slice(0, insertPosition) +
        newUnpublishedSection +
        '\n---\n\n' +
        newContent.slice(insertPosition);
    } else {
      newContent = '# Changelog\n\n' + newUnpublishedSection + '\n---\n\n' + newContent;
    }
  }

  fs.writeFileSync(paths.changelogPath, newContent);
  console.log(`Updated ${paths.changelogPath}`);
}
