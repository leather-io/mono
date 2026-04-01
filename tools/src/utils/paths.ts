import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AppPaths } from '../changelog/types.js';

function getMonorepoRoot(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(__dirname, '..', '..', '..');
}

function getAppDirectory(app: string): string {
  return path.join(getMonorepoRoot(), 'apps', app);
}

export function getAppPaths(app: string): AppPaths {
  const appDir = getAppDirectory(app);

  return {
    changelogPath: path.join(appDir, 'CHANGELOG.md'),
    publishedVersionPath: path.join(appDir, '.published-version'),
    packageJsonPath: path.join(appDir, 'package.json'),
  };
}
