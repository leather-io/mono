import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  conflictingPaths,
  ensureCommit,
  filesWithConflictMarkers,
  isAncestor,
  mergeBase,
  mergeDev,
  planMerge,
} from './merge.js';
import {
  type TestRepo,
  binaryContent,
  conflictingFile,
  createPullRequestBranch,
  createTestRepo,
} from './test/test-repo.js';

describe('merge helpers', () => {
  let repo: TestRepo;
  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  function checkOut(sha: string) {
    repo.git(['checkout', '-q', '--detach', sha]);
  }

  test('list the files that conflict with dev, and none when the merge is clean', () => {
    const { head, dev } = createPullRequestBranch(repo, { conflict: true });
    expect(conflictingPaths(repo.root, head, dev)).toEqual([conflictingFile]);
    expect(conflictingPaths(repo.root, head, repo.head)).toEqual([]);
  });

  test('know whether dev is already part of the branch, and where the two split', () => {
    const { head, dev } = createPullRequestBranch(repo, { conflict: false });
    expect(isAncestor(repo.root, repo.head, head)).toBe(true);
    expect(isAncestor(repo.root, dev, head)).toBe(false);
    expect(mergeBase(repo.root, head, dev)).toBe(repo.head);
  });

  describe('planMerge', () => {
    test('merges nothing while dev has only moved outside the tooling', () => {
      const { head, dev } = createPullRequestBranch(repo, { conflict: false });
      expect(planMerge(repo.root, head, dev, false)).toEqual({
        merge: false,
        conflicts: [],
        onlyMerge: false,
      });
    });

    test('merges when asked to, and when dev conflicts', () => {
      const clean = createPullRequestBranch(repo, { conflict: false });
      expect(planMerge(repo.root, clean.head, clean.dev, true)).toEqual({
        merge: true,
        conflicts: [],
        onlyMerge: true,
      });
      repo.write(conflictingFile, 'export const feeRow = 3;\n');
      repo.git(['commit', '-q', '-a', '-m', 'dev changes the row']);
      const dev = repo.git(['rev-parse', 'HEAD']);
      expect(planMerge(repo.root, clean.head, dev, false)).toEqual({
        merge: true,
        conflicts: [conflictingFile],
        onlyMerge: true,
      });
    });

    test.each(['tools/src/fix-issue/revise.ts', '.github/prompts/fix-issue.md'])(
      'merges, without making the merge the whole revise, when dev changed %s',
      file => {
        const { head } = createPullRequestBranch(repo, { conflict: false });
        repo.write(file, 'newer\n');
        repo.git(['add', '-A']);
        repo.git(['commit', '-q', '-m', 'dev changes the tooling']);
        const dev = repo.git(['rev-parse', 'HEAD']);
        expect(planMerge(repo.root, head, dev, false)).toEqual({
          merge: true,
          conflicts: [],
          onlyMerge: false,
        });
      }
    );

    test('merges nothing once dev is part of the branch, even when asked', () => {
      const { head } = createPullRequestBranch(repo, { conflict: false });
      expect(planMerge(repo.root, head, repo.head, true)).toEqual({
        merge: false,
        conflicts: [],
        onlyMerge: false,
      });
    });
  });

  test('merging dev with a conflict commits the markers on a baseline with two parents', () => {
    const { head, dev } = createPullRequestBranch(repo, { conflict: true });
    checkOut(head);
    const merged = mergeDev(repo.root, dev);
    expect(merged.conflicts).toEqual([conflictingFile]);
    expect(repo.git(['rev-parse', 'HEAD^1', 'HEAD^2']).split('\n')).toEqual([head, dev]);
    expect(repo.git(['status', '--porcelain'])).toBe('');
    expect(readFileSync(path.join(repo.root, conflictingFile), 'utf8')).toBe(
      [
        '<<<<<<< HEAD',
        'export const feeRow = 2;',
        `||||||| ${repo.head.slice(0, 12)}`,
        'export const feeRow = 1;',
        '=======',
        'export const feeRow = 3;',
        `>>>>>>> ${dev}`,
        '',
      ].join('\n')
    );
    expect(merged.tree).toBe(repo.git(['rev-parse', 'HEAD^{tree}']));
  });

  test('the same merge in another worktree gives the same tree', () => {
    const { head, dev } = createPullRequestBranch(repo, { conflict: true });
    checkOut(head);
    const first = mergeDev(repo.root, dev);
    repo.git(['worktree', 'add', '--detach', '--quiet', repo.paths.applyDir, head]);
    const second = mergeDev(repo.paths.applyDir, dev);
    expect(second).toEqual(first);
  });

  test('merging dev without a conflict brings its changes in', () => {
    const { head, dev } = createPullRequestBranch(repo, { conflict: false });
    checkOut(head);
    expect(mergeDev(repo.root, dev).conflicts).toEqual([]);
    expect(readFileSync(path.join(repo.root, 'README.md'), 'utf8')).toBe('newer readme\n');
    expect(readFileSync(path.join(repo.root, conflictingFile), 'utf8')).toBe(
      'export const feeRow = 2;\n'
    );
    expect(repo.git(['rev-parse', 'HEAD^2'])).toBe(dev);
  });

  test('refuses to merge a dev that is already part of the branch', () => {
    const { head } = createPullRequestBranch(repo, { conflict: false });
    checkOut(head);
    expect(() => mergeDev(repo.root, repo.head)).toThrow('is already part of the branch');
  });

  test('find the files that still hold conflict markers', () => {
    repo.write('apps/a.ts', '<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> dev\n');
    repo.write('apps/b.ts', 'const title = "=======";\n');
    repo.write('apps/c.bin', binaryContent);
    expect(
      filesWithConflictMarkers(repo.root, ['apps/a.ts', 'apps/b.ts', 'apps/c.bin', 'apps/gone.ts'])
    ).toEqual(['apps/a.ts']);
  });

  test('need a commit to be in the repository, fetching it when it is not', () => {
    expect(() => ensureCommit(repo.root, repo.head)).not.toThrow();
    expect(() => ensureCommit(repo.root, 'f'.repeat(40))).toThrow(/git fetch --quiet origin f+/);
  });
});
