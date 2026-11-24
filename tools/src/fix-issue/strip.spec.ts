import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { readStatus } from './status.js';
import { stripForbiddenPaths, strippedQuestion } from './strip.js';
import { type TestRepo, blockedStatus, createTestRepo, doneStatus } from './test/test-repo.js';

describe('stripForbiddenPaths', () => {
  let repo: TestRepo;
  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  function status() {
    const result = readStatus(repo.paths.statusFile);
    if (!result.ok) throw new Error(result.problems.join('\n'));
    return result.status;
  }

  test('leaves an allowed change and its status alone', () => {
    repo.makeFix();
    repo.writeStatus(doneStatus);
    expect(stripForbiddenPaths(repo.paths)).toEqual([]);
    expect(status()).toEqual(doneStatus);
  });

  test('restores changed and deleted tracked files, removes new ones, and keeps the rest', () => {
    repo.write('.github/workflows/checks.yml', 'on: push\n');
    repo.git(['add', '-A']);
    repo.git(['commit', '-q', '-m', 'workflow']);
    repo.makeFix();
    repo.write('README.md', 'changed\n');
    repo.write('.github/workflows/evil.yml', 'on: push\n');
    repo.remove('.github/workflows/checks.yml');
    repo.writeStatus(doneStatus);

    const stripped = stripForbiddenPaths(repo.paths);

    expect([...stripped].sort()).toEqual([
      '.github/workflows/checks.yml',
      '.github/workflows/evil.yml',
      'README.md',
    ]);
    expect(readFileSync(path.join(repo.root, 'README.md'), 'utf8')).toBe('readme\n');
    expect(existsSync(path.join(repo.root, '.github/workflows/checks.yml'))).toBe(true);
    expect(existsSync(path.join(repo.root, '.github/workflows/evil.yml'))).toBe(false);
    expect(readFileSync(path.join(repo.root, 'apps/extension/fee-row.tsx'), 'utf8')).toBe(
      'export const feeRow = 2;\n'
    );
    expect(status()).toMatchObject({ state: 'blocked', questions: [strippedQuestion(stripped)] });
  });

  test('keeps the questions of a fixer that was already blocked', () => {
    repo.write('.github/workflows/evil.yml', 'on: push\n');
    repo.writeStatus(blockedStatus);
    stripForbiddenPaths(repo.paths);
    expect(status().questions).toEqual([
      ...blockedStatus.questions,
      strippedQuestion(['.github/workflows/evil.yml']),
    ]);
  });

  test('refuses to strip under an invalid status', () => {
    repo.write('.github/workflows/evil.yml', 'on: push\n');
    repo.writeStatus({ ...doneStatus, how: [] });
    expect(() => stripForbiddenPaths(repo.paths)).toThrow(/how: has no entries/);
    expect(existsSync(path.join(repo.root, '.github/workflows/evil.yml'))).toBe(true);
  });
});

describe('strippedQuestion', () => {
  test('names each path and flags the run', () => {
    expect(strippedQuestion(['.github/workflows/a.yml', 'README.md'])).toBe(
      'The fixer changed `.github/workflows/a.yml`, `README.md`, which fix-issue may never change. They were removed from this pull request. If the issue did not ask for them, treat this run as suspect; otherwise make those changes by hand.'
    );
  });

  test('lists at most ten paths', () => {
    const files = Array.from({ length: 12 }, (_, index) => `.github/file-${index}.yml`);
    expect(strippedQuestion(files)).toMatch(/`\.github\/file-9\.yml` and 2 more, which/);
  });
});
