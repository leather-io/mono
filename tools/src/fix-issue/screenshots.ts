import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { type CommandRunner, runAndEcho, runCommand } from '../ci/exec.js';
import { changedPaths, treeSnapshot } from './git.js';
import type { FixIssuePaths } from './paths.js';
import { readStatus, writeStatus } from './status.js';

type ScreenshotSide = 'before' | 'after' | 'preview';

interface ScreenshotOptions {
  readonly paths: FixIssuePaths;
  readonly run?: CommandRunner;
  log?(line: string): void;
}

interface ScreenshotApp {
  readonly name: string;
  readonly dir: string;
  readonly builds: readonly (readonly string[])[];
  readonly xvfb: boolean;
  readonly webServer: string;
  extraConfig(appDir: string): string;
}

interface Capture {
  readonly passed: boolean;
  readonly duplicates: readonly string[];
}

const screenshotApps: readonly ScreenshotApp[] = [
  {
    name: 'extension',
    dir: 'apps/extension',
    builds: [
      ['turbo', 'run', 'build', '--filter=@leather.io/extension^...'],
      ['--filter', '@leather.io/extension', 'build:test'],
    ],
    xvfb: true,
    webServer: '',
    extraConfig(appDir) {
      return `  globalSetup: '${appDir}/tests/global-playwright-setup.js',`;
    },
  },
  {
    name: 'web',
    dir: 'apps/web',
    builds: [['turbo', 'run', 'build', '--filter=@leather.io/web']],
    xvfb: false,
    webServer: "command: 'pnpm exec vite preview', reuseExistingServer: false, ",
    extraConfig() {
      return "  use: { ...baseConfig.use, channel: 'chromium' },";
    },
  },
];

const appFolders = screenshotApps.map(app => `screenshot-specs/${app.name}/`).join(' and ');
const mobileDir = 'apps/mobile/';
const mobileNote =
  'Not verified: screenshots of the apps/mobile changes; capturing mobile screens needs a simulator.';

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

function specsDir(paths: FixIssuePaths, app: ScreenshotApp): string {
  return path.join(paths.screenshotSpecsDir, app.name);
}

function appsWithSpecs(paths: FixIssuePaths): ScreenshotApp[] {
  return screenshotApps.filter(app => {
    const dir = specsDir(paths, app);
    return existsSync(dir) && readdirSync(dir).some(file => file.endsWith('.spec.ts'));
  });
}

function configFile(paths: FixIssuePaths, app: ScreenshotApp): string {
  return path.join(paths.workDir, `playwright.screenshots.${app.name}.config.ts`);
}

function writeConfig(paths: FixIssuePaths, app: ScreenshotApp): void {
  const appDir = path.join(paths.root, app.dir);
  writeFileSync(
    configFile(paths, app),
    [
      "import { defineConfig } from '@playwright/test';",
      '',
      `import baseConfig from '${appDir}/playwright.config';`,
      '',
      'export default defineConfig({',
      '  ...baseConfig,',
      `  testDir: '${specsDir(paths, app)}',`,
      `  tsconfig: '${appDir}/tsconfig.json',`,
      `  outputDir: '${path.join(paths.workDir, 'screenshot-results', app.name)}',`,
      '  retries: 0,',
      "  reporter: [['list']],",
      app.extraConfig(appDir),
      `  webServer: { ...baseConfig.webServer, ${app.webServer}cwd: '${appDir}' },`,
      '});',
      '',
    ].join('\n')
  );
}

function buildApp(paths: FixIssuePaths, app: ScreenshotApp, run: CommandRunner): boolean {
  return app.builds.every(args => run('pnpm', args, { cwd: paths.root }).status === 0);
}

function sideDir(paths: FixIssuePaths, side: ScreenshotSide): string {
  return path.join(paths.screenshotsDir, side);
}

function resetSide(paths: FixIssuePaths, side: ScreenshotSide): void {
  const dir = sideDir(paths, side);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function pngs(dir: string): string[] {
  return existsSync(dir) ? readdirSync(dir).filter(file => file.endsWith('.png')) : [];
}

function takeScreenshots(
  paths: FixIssuePaths,
  app: ScreenshotApp,
  side: ScreenshotSide,
  run: CommandRunner,
  log: (line: string) => void
): Capture {
  const dir = sideDir(paths, side);
  const appShots = path.join(dir, app.name);
  mkdirSync(appShots, { recursive: true });
  writeConfig(paths, app);
  const playwright = ['exec', 'playwright', 'test', '--config', configFile(paths, app)];
  const options = {
    cwd: path.join(paths.root, app.dir),
    env: { ...process.env, REVIEW_SCREENSHOT_DIR: appShots },
  };
  const result = app.xvfb
    ? run('xvfb-run', ['pnpm', ...playwright], options)
    : run('pnpm', playwright, options);
  if (result.status !== 0) {
    log(
      `fix-issue-screenshots: some ${app.name} ${side} screenshot specs failed; their states show as missing`
    );
  }
  const duplicates = pngs(appShots).filter(file => existsSync(path.join(dir, file)));
  for (const file of pngs(appShots)) {
    if (!duplicates.includes(file)) renameSync(path.join(appShots, file), path.join(dir, file));
  }
  rmSync(appShots, { recursive: true, force: true });
  return { passed: result.status === 0, duplicates: duplicates.map(file => file.slice(0, -4)) };
}

function duplicateNote(app: ScreenshotApp, id: string): string {
  return `Not verified: the ${app.name} screenshot ${id}; another app already saved a state with that id.`;
}

export function previewScreenshots({
  paths,
  run = runAndEcho,
  log = console.log,
}: ScreenshotOptions): void {
  const apps = appsWithSpecs(paths);
  if (apps.length === 0) throw new Error(`no specs in ${appFolders} under ${paths.workDir}`);
  resetSide(paths, 'preview');
  for (const app of apps) {
    for (const id of takeScreenshots(paths, app, 'preview', run, log).duplicates) {
      log(`fix-issue-screenshots: ${duplicateNote(app, id)}`);
    }
  }
  log(`fix-issue-screenshots: ${pngs(sideDir(paths, 'preview')).length} preview screenshots`);
}

function stashCount(root: string): number {
  const list = runCommand('git', ['stash', 'list'], { cwd: root }).stdout;
  return list.split('\n').filter(line => line !== '').length;
}

function git(root: string, args: readonly string[]): void {
  const result = runCommand('git', [...stashIdentity, ...args], { cwd: root });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
}

function captureApps(
  paths: FixIssuePaths,
  apps: readonly ScreenshotApp[],
  run: CommandRunner,
  log: (line: string) => void
): string[] {
  const notes: string[] = [];
  const snapshot = treeSnapshot(paths.root);
  resetSide(paths, 'after');
  resetSide(paths, 'before');
  const built = apps.filter(app => {
    if (buildApp(paths, app, run)) return true;
    notes.push(`Not verified: ${app.name} screenshots; the fix did not build for the capture.`);
    return false;
  });
  if (built.length === 0) return notes;
  for (const app of built) {
    const capture = takeScreenshots(paths, app, 'after', run, log);
    if (!capture.passed) {
      notes.push(`Not verified: some ${app.name} screenshots; their specs failed on the fix.`);
    }
    notes.push(...capture.duplicates.map(id => duplicateNote(app, id)));
  }

  const stashes = stashCount(paths.root);
  git(paths.root, ['stash', 'push', '--include-untracked', '--quiet', '-m', stashMessage]);
  const stashed = stashCount(paths.root) > stashes;
  try {
    for (const app of built) {
      if (buildApp(paths, app, run)) takeScreenshots(paths, app, 'before', run, log);
      else {
        notes.push(
          `Not verified: ${app.name} before screenshots; dev did not build for the capture.`
        );
      }
    }
  } finally {
    if (stashed) {
      git(paths.root, ['checkout', '--quiet', '--', '.']);
      git(paths.root, ['clean', '-fdq']);
      git(paths.root, ['stash', 'pop', '--index', '--quiet']);
    }
  }
  if (treeSnapshot(paths.root) !== snapshot) {
    throw new Error('the fix did not come back intact after the before capture');
  }
  return notes;
}

function recordNotes(
  paths: FixIssuePaths,
  notes: readonly string[],
  log: (line: string) => void
): void {
  if (notes.length === 0) return;
  for (const note of notes) log(`fix-issue-screenshots: ${note}`);
  const status = readStatus(paths.statusFile);
  if (!status.ok) {
    log('fix-issue-screenshots: the status is not valid; the notes above are not recorded');
    return;
  }
  writeStatus(paths.statusFile, {
    ...status.status,
    tested: [...status.status.tested, ...notes],
  });
}

export function captureScreenshots({
  paths,
  run = runAndEcho,
  log = console.log,
}: ScreenshotOptions): void {
  const apps = appsWithSpecs(paths);
  const notes: string[] = [];
  if (apps.length === 0) {
    log('fix-issue-screenshots: no screenshot specs; nothing to capture');
  } else {
    notes.push(...captureApps(paths, apps, run, log));
    log(
      `fix-issue-screenshots: captured ${pngs(sideDir(paths, 'after')).length} after and ${pngs(sideDir(paths, 'before')).length} before screenshots`
    );
  }
  if (changedPaths(paths.root).some(change => change.path.startsWith(mobileDir))) {
    notes.push(mobileNote);
  }
  recordNotes(paths, notes, log);
}
