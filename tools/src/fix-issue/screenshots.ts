import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { type CommandRunner, runAndEcho, runCommand } from '../ci/exec.js';
import { treeSnapshot } from './git.js';
import type { FixIssuePaths } from './paths.js';

type ScreenshotSide = 'before' | 'after' | 'preview';

interface ScreenshotOptions {
  readonly paths: FixIssuePaths;
  readonly run?: CommandRunner;
  log?(line: string): void;
}

const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex');
export const maxScreenshotBytes = 1024 * 1024;
const stashMessage = 'fix-issue-screenshots';
const stashIdentity = [
  '-c',
  'user.name=fix-issue',
  '-c',
  'user.email=fix-issue@users.noreply.github.com',
];

export function isScreenshot(file: string): boolean {
  if (!existsSync(file)) return false;
  const stat = lstatSync(file);
  if (!stat.isFile() || stat.size > maxScreenshotBytes) return false;
  return readFileSync(file).subarray(0, pngSignature.length).equals(pngSignature);
}

function hasSpecs(paths: FixIssuePaths): boolean {
  return (
    existsSync(paths.screenshotSpecsDir) &&
    readdirSync(paths.screenshotSpecsDir).some(file => file.endsWith('.spec.ts'))
  );
}

function extensionDir(paths: FixIssuePaths): string {
  return path.join(paths.root, 'apps/extension');
}

function configFile(paths: FixIssuePaths): string {
  return path.join(paths.workDir, 'playwright.screenshots.config.ts');
}

function writeConfig(paths: FixIssuePaths): void {
  const extension = extensionDir(paths);
  writeFileSync(
    configFile(paths),
    [
      "import { defineConfig } from '@playwright/test';",
      '',
      `import baseConfig from '${extension}/playwright.config';`,
      '',
      'export default defineConfig({',
      '  ...baseConfig,',
      `  testDir: '${paths.screenshotSpecsDir}',`,
      `  globalSetup: '${extension}/tests/global-playwright-setup.js',`,
      `  tsconfig: '${extension}/tsconfig.json',`,
      `  outputDir: '${path.join(paths.workDir, 'screenshot-results')}',`,
      '  retries: 0,',
      "  reporter: [['list']],",
      `  webServer: { ...baseConfig.webServer, cwd: '${extension}' },`,
      '});',
      '',
    ].join('\n')
  );
}

function buildExtension(paths: FixIssuePaths, run: CommandRunner): boolean {
  const packages = run('pnpm', ['turbo', 'run', 'build', '--filter=@leather.io/extension^...'], {
    cwd: paths.root,
  });
  if (packages.status !== 0) return false;
  return (
    run('pnpm', ['--filter', '@leather.io/extension', 'build:test'], { cwd: paths.root }).status ===
    0
  );
}

function takeScreenshots(
  paths: FixIssuePaths,
  side: ScreenshotSide,
  run: CommandRunner,
  log: (line: string) => void
) {
  const dir = path.join(paths.screenshotsDir, side);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeConfig(paths);
  const result = run(
    'xvfb-run',
    ['pnpm', 'exec', 'playwright', 'test', '--config', configFile(paths)],
    {
      cwd: extensionDir(paths),
      env: { ...process.env, REVIEW_SCREENSHOT_DIR: dir },
    }
  );
  if (result.status !== 0) {
    log(
      `fix-issue-screenshots: some ${side} screenshot specs failed; their states show as missing`
    );
  }
}

function countPngs(dir: string): number {
  return existsSync(dir) ? readdirSync(dir).filter(file => file.endsWith('.png')).length : 0;
}

export function previewScreenshots({
  paths,
  run = runAndEcho,
  log = console.log,
}: ScreenshotOptions): void {
  if (!hasSpecs(paths)) throw new Error(`no specs in ${paths.screenshotSpecsDir}`);
  takeScreenshots(paths, 'preview', run, log);
  log(
    `fix-issue-screenshots: ${countPngs(path.join(paths.screenshotsDir, 'preview'))} preview screenshots`
  );
}

function stashCount(root: string): number {
  const list = runCommand('git', ['stash', 'list'], { cwd: root }).stdout;
  return list.split('\n').filter(line => line !== '').length;
}

function git(root: string, args: readonly string[]): void {
  const result = runCommand('git', [...stashIdentity, ...args], { cwd: root });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
}

export function captureScreenshots({
  paths,
  run = runAndEcho,
  log = console.log,
}: ScreenshotOptions): void {
  if (!hasSpecs(paths)) {
    log('fix-issue-screenshots: no screenshot specs; nothing to capture');
    return;
  }
  const before = treeSnapshot(paths.root);
  if (!buildExtension(paths, run)) {
    log('fix-issue-screenshots: the fixed tree did not build; skipping screenshots');
    return;
  }
  takeScreenshots(paths, 'after', run, log);

  const stashes = stashCount(paths.root);
  git(paths.root, ['stash', 'push', '--include-untracked', '--quiet', '-m', stashMessage]);
  const stashed = stashCount(paths.root) > stashes;
  try {
    if (buildExtension(paths, run)) takeScreenshots(paths, 'before', run, log);
    else log('fix-issue-screenshots: dev did not build; before screenshots show as missing');
  } finally {
    if (stashed) {
      git(paths.root, ['checkout', '--quiet', '--', '.']);
      git(paths.root, ['clean', '-fdq']);
      git(paths.root, ['stash', 'pop', '--index', '--quiet']);
    }
  }
  if (treeSnapshot(paths.root) !== before) {
    throw new Error('the fix did not come back intact after the before capture');
  }
  log(
    `fix-issue-screenshots: captured ${countPngs(path.join(paths.screenshotsDir, 'after'))} after and ${countPngs(path.join(paths.screenshotsDir, 'before'))} before screenshots`
  );
}
