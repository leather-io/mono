import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import type { CommandRunner } from '../ci/exec.js';
import { captureScreenshots, isScreenshot, maxScreenshotBytes } from './screenshots.js';
import { readStatus } from './status.js';
import {
  type TestRepo,
  createTestRepo,
  discardLog,
  doneStatus,
  logSink,
} from './test/test-repo.js';

const png = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.from('image')]);

interface FakeBrowser {
  readonly run: CommandRunner;
  readonly capturedSources: string[];
  readonly captures: string[];
}

interface FakeBrowserOptions {
  readonly failBuildNumber?: number;
  readonly failCaptureNumber?: number;
  readonly sharedId?: boolean;
}

function fakeBrowser(
  repo: TestRepo,
  { failBuildNumber, failCaptureNumber, sharedId }: FakeBrowserOptions = {}
): FakeBrowser {
  const capturedSources: string[] = [];
  const captures: string[] = [];
  let builds = 0;
  return {
    capturedSources,
    captures,
    run(command, args, options) {
      if (command === 'pnpm' && args[0] === 'turbo') {
        builds += 1;
        return { status: builds === failBuildNumber ? 1 : 0, stdout: '', stderr: '' };
      }
      if (args.includes('playwright')) {
        const dir = options.env?.REVIEW_SCREENSHOT_DIR ?? '';
        const app = path.basename(options.cwd);
        captures.push(`${command} ${app} ${path.basename(path.dirname(dir))}`);
        if (captures.length === failCaptureNumber) return { status: 1, stdout: '', stderr: '' };
        capturedSources.push(
          readFileSync(path.join(repo.root, 'apps/extension/fee-row.tsx'), 'utf8')
        );
        writeFileSync(
          path.join(dir, sharedId ? 'fee-row.png' : `${app}-fee-row.png`),
          Buffer.concat([png, Buffer.from(app)])
        );
      }
      return { status: 0, stdout: '', stderr: '' };
    },
  };
}

describe('captureScreenshots', () => {
  let repo: TestRepo;
  afterEach(() => repo.cleanup());

  function withSpec(app = 'extension') {
    repo.write(
      `tmp/fix-issue/screenshot-specs/${app}/fee-row.spec.ts`,
      'test("fee row", () => {});\n'
    );
  }

  function shot(side: string, app = 'extension') {
    return path.join(repo.paths.screenshotsDir, side, `${app}-fee-row.png`);
  }

  function tested() {
    const status = readStatus(repo.paths.statusFile);
    return status.ok ? status.status.tested : null;
  }

  test('does nothing without screenshot specs', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    const browser = fakeBrowser(repo);
    const sink = logSink();
    captureScreenshots({ paths: repo.paths, run: browser.run, log: line => sink.log(line) });
    expect(sink.lines).toEqual(['fix-issue-screenshots: no screenshot specs; nothing to capture']);
    expect(browser.capturedSources).toEqual([]);
    expect(tested()).toEqual(doneStatus.tested);
  });

  test('captures the fix, then dev, and brings the fix back intact', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    withSpec();
    const before = repo.git(['status', '--porcelain=v1', '--untracked-files=all']);
    const browser = fakeBrowser(repo);
    captureScreenshots({ paths: repo.paths, run: browser.run, log: discardLog });
    expect(browser.capturedSources).toEqual([
      'export const feeRow = 2;\n',
      'export const feeRow = 1;\n',
    ]);
    expect(browser.captures).toEqual(['xvfb-run extension after', 'xvfb-run extension before']);
    expect(existsSync(shot('after'))).toBe(true);
    expect(existsSync(shot('before'))).toBe(true);
    expect(repo.git(['status', '--porcelain=v1', '--untracked-files=all'])).toBe(before);
    expect(repo.git(['stash', 'list'])).toBe('');
    expect(tested()).toEqual(doneStatus.tested);
  });

  test('captures the extension and web into the same folders', () => {
    repo = createTestRepo();
    repo.makeFix();
    withSpec();
    withSpec('web');
    const before = repo.git(['status', '--porcelain=v1', '--untracked-files=all']);
    const browser = fakeBrowser(repo);
    captureScreenshots({ paths: repo.paths, run: browser.run, log: discardLog });
    expect(browser.captures).toEqual([
      'xvfb-run extension after',
      'pnpm web after',
      'xvfb-run extension before',
      'pnpm web before',
    ]);
    for (const side of ['after', 'before']) {
      expect(existsSync(shot(side))).toBe(true);
      expect(existsSync(shot(side, 'web'))).toBe(true);
    }
    expect(repo.git(['status', '--porcelain=v1', '--untracked-files=all'])).toBe(before);
    expect(repo.git(['stash', 'list'])).toBe('');
    expect(
      readFileSync(path.join(repo.paths.workDir, 'playwright.screenshots.web.config.ts'), 'utf8')
    ).toContain(`testDir: '${repo.paths.screenshotSpecsDir}/web'`);
  });

  test('keeps the fix and says so when the dev build fails', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    withSpec('web');
    const before = repo.git(['status', '--porcelain=v1', '--untracked-files=all']);
    captureScreenshots({
      paths: repo.paths,
      run: fakeBrowser(repo, { failBuildNumber: 2 }).run,
      log: discardLog,
    });
    expect(existsSync(shot('after', 'web'))).toBe(true);
    expect(existsSync(shot('before', 'web'))).toBe(false);
    expect(repo.git(['status', '--porcelain=v1', '--untracked-files=all'])).toBe(before);
    expect(tested()).toEqual([
      ...doneStatus.tested,
      'Not verified: web before screenshots; dev did not build for the capture.',
    ]);
  });

  test('skips an app whose fix does not build and says so', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    withSpec();
    withSpec('web');
    const browser = fakeBrowser(repo, { failBuildNumber: 2 });
    captureScreenshots({ paths: repo.paths, run: browser.run, log: discardLog });
    expect(browser.captures).toEqual(['xvfb-run extension after', 'xvfb-run extension before']);
    expect(tested()).toEqual([
      ...doneStatus.tested,
      'Not verified: web screenshots; the fix did not build for the capture.',
    ]);
  });

  test('says so when the specs fail on the fix', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    withSpec('web');
    captureScreenshots({
      paths: repo.paths,
      run: fakeBrowser(repo, { failCaptureNumber: 1 }).run,
      log: discardLog,
    });
    expect(tested()).toEqual([
      ...doneStatus.tested,
      'Not verified: some web screenshots; their specs failed on the fix.',
    ]);
  });

  test('says that mobile changes get no screenshots', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.write('apps/mobile/fee-row.tsx', 'export const feeRow = 2;\n');
    repo.writeStatus(doneStatus);
    const browser = fakeBrowser(repo);
    captureScreenshots({ paths: repo.paths, run: browser.run, log: discardLog });
    expect(browser.captures).toEqual([]);
    expect(tested()).toEqual([
      ...doneStatus.tested,
      'Not verified: screenshots of the apps/mobile changes; capturing mobile screens needs a simulator.',
    ]);
  });

  test('keeps the first image and says so when two apps save the same id', () => {
    repo = createTestRepo();
    repo.makeFix();
    repo.writeStatus(doneStatus);
    withSpec();
    withSpec('web');
    const browser = fakeBrowser(repo, { sharedId: true });
    captureScreenshots({ paths: repo.paths, run: browser.run, log: discardLog });
    const saved = path.join(repo.paths.screenshotsDir, 'after', 'fee-row.png');
    expect(readFileSync(saved, 'utf8')).toContain('extension');
    expect(tested()).toEqual([
      ...doneStatus.tested,
      'Not verified: the web screenshot fee-row; another app already saved a state with that id.',
    ]);
  });
});

describe('isScreenshot', () => {
  let repo: TestRepo;
  afterEach(() => repo.cleanup());

  test.each([
    ['a PNG', png, true],
    ['an SVG pretending to be a PNG', Buffer.from('<svg onload=alert(1)>'), false],
    ['a PNG over the size limit', Buffer.concat([png, Buffer.alloc(maxScreenshotBytes)]), false],
  ])('%s', (_name, content, expected) => {
    repo = createTestRepo();
    repo.write('tmp/shot.png', content);
    expect(isScreenshot(path.join(repo.root, 'tmp/shot.png'))).toBe(expected);
  });

  test('a missing file', () => {
    repo = createTestRepo();
    expect(isScreenshot(path.join(repo.root, 'tmp/missing.png'))).toBe(false);
  });
});
