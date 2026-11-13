import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import type { CommandRunner } from '../ci/exec.js';
import { captureScreenshots, isScreenshot, maxScreenshotBytes } from './screenshots.js';
import { type TestRepo, createTestRepo, discardLog, logSink } from './test/test-repo.js';

const png = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.from('image')]);

interface FakeBrowser {
  readonly run: CommandRunner;
  readonly capturedSources: string[];
}

function fakeBrowser(
  repo: TestRepo,
  { failBuildNumber }: { failBuildNumber?: number } = {}
): FakeBrowser {
  const capturedSources: string[] = [];
  let builds = 0;
  return {
    capturedSources,
    run(command, args, options) {
      if (command === 'pnpm' && args[0] === 'turbo') {
        builds += 1;
        return { status: builds === failBuildNumber ? 1 : 0, stdout: '', stderr: '' };
      }
      if (command === 'xvfb-run') {
        const dir = options.env?.REVIEW_SCREENSHOT_DIR ?? '';
        capturedSources.push(
          readFileSync(path.join(repo.root, 'apps/extension/fee-row.tsx'), 'utf8')
        );
        writeFileSync(path.join(dir, 'fee-row.png'), png);
      }
      return { status: 0, stdout: '', stderr: '' };
    },
  };
}

describe('captureScreenshots', () => {
  let repo: TestRepo;
  afterEach(() => repo.cleanup());

  function withSpec() {
    repo.write('tmp/fix-issue/screenshot-specs/fee-row.spec.ts', 'test("fee row", () => {});\n');
  }

  function shot(side: string) {
    return path.join(repo.paths.screenshotsDir, side, 'fee-row.png');
  }

  test('does nothing without screenshot specs', () => {
    repo = createTestRepo();
    repo.makeFix();
    const browser = fakeBrowser(repo);
    const sink = logSink();
    captureScreenshots({ paths: repo.paths, run: browser.run, log: line => sink.log(line) });
    expect(sink.lines).toEqual(['fix-issue-screenshots: no screenshot specs; nothing to capture']);
    expect(browser.capturedSources).toEqual([]);
  });

  test('captures the fix, then dev, and brings the fix back intact', () => {
    repo = createTestRepo();
    repo.makeFix();
    withSpec();
    const before = repo.git(['status', '--porcelain=v1', '--untracked-files=all']);
    const browser = fakeBrowser(repo);
    captureScreenshots({ paths: repo.paths, run: browser.run, log: discardLog });
    expect(browser.capturedSources).toEqual([
      'export const feeRow = 2;\n',
      'export const feeRow = 1;\n',
    ]);
    expect(existsSync(shot('after'))).toBe(true);
    expect(existsSync(shot('before'))).toBe(true);
    expect(repo.git(['status', '--porcelain=v1', '--untracked-files=all'])).toBe(before);
    expect(repo.git(['stash', 'list'])).toBe('');
  });

  test('keeps the fix when the dev build fails', () => {
    repo = createTestRepo();
    repo.makeFix();
    withSpec();
    const before = repo.git(['status', '--porcelain=v1', '--untracked-files=all']);
    const sink = logSink();
    captureScreenshots({
      paths: repo.paths,
      run: fakeBrowser(repo, { failBuildNumber: 2 }).run,
      log: line => sink.log(line),
    });
    expect(sink.lines).toContain(
      'fix-issue-screenshots: dev did not build; before screenshots show as missing'
    );
    expect(existsSync(shot('after'))).toBe(true);
    expect(existsSync(shot('before'))).toBe(false);
    expect(repo.git(['status', '--porcelain=v1', '--untracked-files=all'])).toBe(before);
  });

  test('skips everything when the fix does not build', () => {
    repo = createTestRepo();
    repo.makeFix();
    withSpec();
    const browser = fakeBrowser(repo, { failBuildNumber: 1 });
    captureScreenshots({ paths: repo.paths, run: browser.run, log: discardLog });
    expect(browser.capturedSources).toEqual([]);
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
